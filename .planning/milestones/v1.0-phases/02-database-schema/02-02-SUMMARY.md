---
phase: 02-database-schema
plan: "02"
subsystem: database
tags: [postgres, supabase, rls, migrations, automations, stripe]

# Dependency graph
requires:
  - phase: 02-01
    provides: organizations, profiles, organization_members tables with RLS patterns

provides:
  - automation_templates table (global catalog, authenticated read)
  - automations table (org-scoped, 6-state lifecycle, soft delete)
  - automation_executions table (immutable records, org-scoped via join)
  - automation_requests table (user INSERT allowed, service_role updates)
  - subscriptions table (org-scoped read, service_role writes for Stripe sync)

affects:
  - 02-03 (seed data needs these tables)
  - 03-api (FastAPI endpoints will query these tables)
  - 04-dashboard (UI reads automations, requests, executions)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hybrid write model: user INSERT on interaction tables (automation_requests), service_role-only on system tables"
    - "Execution join path: automation_executions -> automations -> organization_members for org-scoped RLS"
    - "6-state automation lifecycle via CHECK constraint (draft/pending_review/active/paused/failed/archived)"
    - "Global catalog pattern: automation_templates readable by all authenticated users, not org-scoped"
    - "Immutable execution records: no updated_at or deleted_at on automation_executions"

key-files:
  created:
    - supabase/migrations/20260305000002_automation_business.sql
  modified: []

key-decisions:
  - "automation_templates uses is_active (not deleted_at) for hiding — global catalog simplicity"
  - "automation_executions joins through automations table for org-scoped RLS (avoids direct org_id column)"
  - "automation_requests urgency uses 3-level CHECK (low/normal/urgent), not 4-level — matches CONTEXT.md locked decision"
  - "subscriptions has no deleted_at — lifecycle managed entirely by Stripe"
  - "UNIQUE(organization_id) on subscriptions enforces one-subscription-per-org at DB level"

patterns-established:
  - "INSERT policy: WITH CHECK (not USING) verifies user_id = (SELECT auth.uid()) AND org membership"
  - "Org-scoped SELECT: EXISTS (SELECT 1 FROM organization_members WHERE org_id matches AND user_id = (SELECT auth.uid()) AND is_active = true)"
  - "Global read: TO authenticated USING (is_active = true) — no org check needed"

requirements-completed: [DB-04, DB-05, DB-06, DB-07, DB-08, DB-12]

# Metrics
duration: 1min
completed: 2026-03-06
---

# Phase 2 Plan 02: Automation Business Tables Summary

**Five core business tables with hybrid write RLS — automation_templates (global catalog), automations (6-state lifecycle), automation_executions (immutable join-through), automation_requests (user INSERT), subscriptions (Stripe-synced)**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-06T00:45:38Z
- **Completed:** 2026-03-06T00:46:51Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Five automation and business tables created with all columns matching CONTEXT.md specifications
- Hybrid write model: automation_requests allows user INSERT with org membership check; automations, executions, subscriptions are service_role-only for writes
- Org isolation via EXISTS + organization_members pattern with (SELECT auth.uid()) optimization throughout
- automation_executions uses join-through-automations pattern for org-scoped access without storing redundant organization_id
- All status/type columns use CHECK constraints (not Postgres ENUM) for easier future value additions

## Task Commits

Each task was committed atomically:

1. **Task 1: Create automation and business tables migration** - `e74ee74` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `supabase/migrations/20260305000002_automation_business.sql` - Five tables (automation_templates, automations, automation_executions, automation_requests, subscriptions) with RLS, indexes, and updated_at triggers

## Decisions Made

- automation_templates uses is_active (not deleted_at) to hide templates — simpler for a global catalog
- automation_executions does not store organization_id directly — org-scoped access via join through automations preserves immutability and avoids denormalization
- UNIQUE(organization_id) on subscriptions enforced at DB level — prevents billing anomalies at the schema layer
- All auth.uid() calls wrapped as (SELECT auth.uid()) per established RLS optimization pattern from 02-01

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 5 automation/business tables ready for seed data (02-03)
- RLS patterns consistent: org isolation via EXISTS + organization_members throughout
- hybrid write model established: FastAPI will use service_role key for system table writes, anon/authenticated key only for user-facing reads and automation_requests INSERT
- subscriptions table ready for Stripe webhook integration in Phase 3+

---
*Phase: 02-database-schema*
*Completed: 2026-03-06*
