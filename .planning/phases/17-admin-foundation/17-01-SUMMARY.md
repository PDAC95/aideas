---
phase: 17-admin-foundation
plan: 01
status: completed
completed: 2026-05-05
subsystem: database
tags: [rls, schema, admin, postgres, supabase, security]

requirements_completed:
  - FOUND-01
  - FOUND-02

one_liner: "platform_staff table + is_platform_staff/is_super_admin SECURITY DEFINER helpers + admin RLS extensions across 11 business tables (9 mutable full-CRUD, 2 immutable SELECT only) + idempotent super_admin seed for pdmckinster@gmail.com"

dependency_graph:
  requires:
    - "auth.users (Supabase managed table)"
    - "Existing org-scoped RLS policies on the 11 business tables (preserved unchanged)"
  provides:
    - "public.platform_staff table"
    - "public.is_platform_staff(uid uuid) -> boolean (SECURITY DEFINER)"
    - "public.is_super_admin(uid uuid) -> boolean (SECURITY DEFINER)"
    - "38 admin RLS policies (9 mutable tables x 4 verbs + 2 immutable tables x SELECT)"
    - "Initial super_admin row for pdmckinster@gmail.com (when present)"
  affects:
    - "Phase 17-02 (admin route gate / middleware) — consumes is_platform_staff() in auth checks"
    - "Phase 17-03 (admin shell UI) — relies on the gate"
    - "Phases 18-22 (Catalog, Requests, Automations, Clients, Admin Home) — all rely on admin RLS bypass to read/write cross-org data via the authenticated client"

tech_stack:
  added: []
  patterns:
    - "SECURITY DEFINER + SET search_path = '' for helper functions (schema-hijack safe)"
    - "Additive RLS: new admin policies coexist with org-scoped client policies (Postgres OR-combines per command)"
    - "Idempotent migration via CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION, DROP POLICY IF EXISTS, ON CONFLICT DO NOTHING"
    - "Conditional seed via DO $$ block with NOTICE fallback (migration succeeds even on fresh DB)"

key_files:
  created:
    - "supabase/migrations/20260506000001_admin_foundation.sql"
  modified: []

decisions:
  - "Helper functions use SECURITY DEFINER (not INVOKER) so callers without RLS access to platform_staff can still check membership; SET search_path = '' prevents schema-hijack attacks"
  - "Helper functions marked STABLE so the planner can hoist them out of per-row evaluation in RLS policies (performance)"
  - "Admin policies are ADDITIVE — existing org-scoped client policies are not touched; clients keep their access exactly as before"
  - "Immutable tables (automation_executions, chat_messages) get SELECT only; the no-INSERT/UPDATE/DELETE posture is preserved for everyone, including admins. Future AIDEAS-side chat sends would be a service_role write"
  - "Mutable tables get 4 separate policies (SELECT, INSERT, UPDATE, DELETE) rather than `FOR ALL` — clearer audit and easier to revoke a single verb later"
  - "Use `(SELECT auth.uid())` subselect inside USING/WITH CHECK to mirror existing migration patterns and let Postgres cache the value per query"
  - "Seed first super_admin in the migration itself (idempotent + safe-no-op when the user does not yet exist) rather than a separate seed file — guarantees the platform always has at least one admin path the moment the user signs up"
  - "Index on platform_staff.role for future filtering (super_admin vs operator listings)"

metrics:
  duration_min: 10
  task_count: 2
  files_changed: 1
  loc_added: 436

commits:
  - hash: "851589b"
    message: "feat(17-01): create platform_staff table, helper functions, and super_admin seed"
  - hash: "98e0e50"
    message: "feat(17-01): extend RLS on 11 business tables with admin policies"
---

# Phase 17 Plan 01: Admin Foundation - Database Layer Summary

## One-Liner

Single migration file `20260506000001_admin_foundation.sql` (436 LOC) that ships the `platform_staff` table, two `SECURITY DEFINER` helper functions, 38 admin RLS policies across 11 business tables (9 mutable + 2 immutable), and an idempotent `super_admin` seed for `pdmckinster@gmail.com` — providing the database foundation that every admin capability in Phases 18-22 builds on.

## What Was Built

### Section 1 - `platform_staff` Table (lines 21-45)
- PK `user_id UUID` referencing `auth.users(id) ON DELETE CASCADE`
- `role TEXT NOT NULL CHECK (role IN ('super_admin', 'operator'))`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- RLS enabled with `platform_staff_select_self` so authenticated staff can read their own row (writes are service_role only)
- Index `idx_platform_staff_role` for future role-based listings

### Section 2 - Helper Functions (lines 47-82)
- `public.is_platform_staff(uid UUID) -> BOOLEAN` — true if the user is in `platform_staff` (any role)
- `public.is_super_admin(uid UUID) -> BOOLEAN` — true only if the user is in `platform_staff` with `role = 'super_admin'`
- Both are `LANGUAGE sql / SECURITY DEFINER / SET search_path = '' / STABLE`
- Both granted `EXECUTE` to `authenticated`

### Section 3 - First Super Admin Seed (lines 84-102)
- `DO $$ ... $$` block selects `auth.users.id` for `pdmckinster@gmail.com`
- If found, inserts into `platform_staff` with `role='super_admin'` and `ON CONFLICT (user_id) DO NOTHING`
- If not found, emits a `NOTICE` and the migration completes successfully

### Section 4 - Admin RLS Extensions (lines 104-436)
- **9 mutable tables**, each with 4 admin policies (SELECT/INSERT/UPDATE/DELETE) — 36 policies total:
  `organizations`, `profiles`, `organization_members`, `automation_templates`, `automations`, `automation_requests`, `subscriptions`, `notifications`, `invitations`
- **2 immutable tables**, each with 1 admin SELECT-only policy:
  `automation_executions`, `chat_messages`
- All admin policies use `public.is_platform_staff((SELECT auth.uid()))` as the predicate
- All wrapped in `DROP POLICY IF EXISTS` before `CREATE POLICY` for idempotency

## Deviations from Plan

None of substance. The plan executed exactly as written:
- Task 1 verifier hit a brief formatting mismatch (column-aligned vs single-spaced inside the `CREATE TABLE`); resolved by single-spacing `user_id`, `role`, `created_at` to match the canonical SQL in the plan and the verifier's literal string. No semantic change. Not tracked as a deviation rule violation since it was self-imposed style.
- IDE surfaced syntax errors throughout — these are false positives from a SQL Server T-SQL linter on PostgreSQL/Supabase syntax (`CREATE TABLE IF NOT EXISTS`, `CREATE POLICY ... TO authenticated USING (...)`, `RAISE NOTICE`, `DO $$`, `ON CONFLICT`). Same pattern is used in all existing migrations (e.g., `20260305000001_core_identity.sql`, `20260417000001_fix_organizations_rls_policy.sql`). Out of scope per the deviation rules; will run cleanly under Postgres.

## Notes for Downstream Plans

### How 17-02 (Admin Gate / Middleware) Consumes This Output
- The `assertPlatformStaff()` server-action helper will call `supabase.rpc('is_platform_staff', { uid: user.id })` (or, equivalently, query `platform_staff` directly — the `platform_staff_select_self` policy permits the user to see their own row).
- The middleware's `/admin/*` gate can do the same RPC check on every request and redirect non-staff users to `/login` (or `/dashboard` if they're authenticated customers).
- A `platform_staff` user navigating to `/dashboard` should be redirected to `/admin` per the CONTEXT.md decision — this is enforced in middleware, not in the database.

### Schema Observations Worth Flagging for 18-22
1. **`chat_messages` already restricts `sender_type='client'` on INSERT** — admin chat sends in any future feature would need service_role (`chat_messages_insert_clients` policy is preserved; we deliberately did NOT add admin INSERT). If Phase 19 (Requests Inbox) needs internal AIDEAS-side comments, consider a separate `automation_request_notes` table or use the existing `automation_requests.notes` JSONB.
2. **`automation_executions` is append-only for everyone** — no admin can delete or update rows. If a future need to "redact" an execution arises, plan a soft-delete column rather than weakening this policy.
3. **`organizations.deleted_at` exists** — `organizations_select_members` filters `WHERE deleted_at IS NULL`. The new admin SELECT policy does NOT filter on `deleted_at`, so admins will see soft-deleted orgs (correct behavior for Phase 21 Clients Admin).
4. **`organization_members.is_active` exists and is filtered by client policies** — the admin policy does not filter on `is_active`, so admin users see deactivated members too (correct for cross-tenant moderation).
5. **`platform_staff` has no `deleted_at` or `is_active`** — staff removal is hard-delete via `ON DELETE CASCADE` from `auth.users`. If the team later wants reversible deactivation, that's a future migration adding `is_active BOOLEAN` and updating both helper functions.

## Self-Check: PASSED

- File `supabase/migrations/20260506000001_admin_foundation.sql` exists (436 LOC, verified)
- Commit `851589b` exists (Task 1)
- Commit `98e0e50` exists (Task 2)
- Frontmatter `must_haves.truths` (6 items) all verifiable in the file
- Frontmatter `must_haves.artifacts` (1 item, `supabase/migrations/20260506000001_admin_foundation.sql`) exists and contains `CREATE TABLE IF NOT EXISTS public.platform_staff`
- 38 admin policies present (9 mutable x 4 verbs + 2 immutable x SELECT), each with matching `DROP POLICY IF EXISTS`
- Both helper functions use `SECURITY DEFINER`, `SET search_path = ''`, `STABLE`, granted to `authenticated`
- Seed block uses `ON CONFLICT (user_id) DO NOTHING` and emits `RAISE NOTICE` when user is missing
