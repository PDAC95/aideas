# Phase 2: Database Schema - Research

**Researched:** 2026-03-05
**Domain:** Supabase PostgreSQL — migrations, RLS, Realtime, schema design
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**RLS Policies:**
- Isolate data by organization — users only see rows belonging to their org
- Role-based permissions (admin/operator/viewer) enforced in application layer (FastAPI), not in RLS
- `automation_templates` readable by all authenticated users (global catalog, not org-scoped)
- Hybrid write policy: interaction tables (`automation_requests`, `chat_messages`) allow user INSERT; system tables (`automations`, `automation_executions`, `subscriptions`) only writable via service_role key
- AIDEAS admin team accesses all data via service_role key (bypasses RLS) — no super_admin role needed in DB

**Seed Data:**
- Realistic data reflecting AIDEAS business: automation templates for lead generation, customer support, internal processes
- Volume: 2 organizations, 4 users (2 per org with different roles), ~8 automation templates
- Include variety of states: active automations, paused, failed; pending and completed requests; sample chat messages
- Seed covers enough scenarios to test org isolation and UI states during development

**Deletion and Lifecycle:**
- Soft delete with `deleted_at` timestamp across tables — no physical deletion
- Automation status enum: `draft`, `pending_review`, `active`, `paused`, `failed`, `archived` (6 states, reflects managed-service review flow)
- Automation request urgency: `low`, `normal`, `urgent` (3 levels)

**Audit Fields:**
- All tables include `created_at` and `updated_at` timestamps (auto-managed)

**Realtime and Chat:**
- Chat is client-to-AIDEAS only (dedicated support channel per organization, not inter-member messaging)
- Chat messages: text-only for v1 (no file attachments — can expand later)
- Supabase Realtime enabled only on `chat_messages` table; notifications and other changes via polling/page load
- Notifications table includes `type` field: `info`, `warning`, `success`, `action_required`

### Claude's Discretion
- Exact column types and naming conventions
- Index strategy for performance
- Migration file naming and ordering
- Foreign key constraint details beyond what's specified
- Notification `type` enum implementation (check constraint vs Postgres enum)

### Deferred Ideas (OUT OF SCOPE)
- File attachments in chat — future enhancement when Supabase Storage is configured
- Realtime for notifications and execution status — consider for v2 dashboard phase
- Inter-member chat within an organization — not needed for v1 support model
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DB-01 | Supabase `organizations` table with RLS policies | RLS org-isolation pattern using EXISTS + (select auth.uid()) wrapping; soft delete with deleted_at |
| DB-02 | Supabase `profiles` table extending auth.users with RLS policies | Standard Supabase profiles pattern with on_auth_user_created trigger; SECURITY DEFINER function |
| DB-03 | Supabase `organization_members` table with role enum (admin/operator/viewer) and RLS | CHECK constraint vs Postgres ENUM; RLS using user_id = (select auth.uid()) for direct membership check |
| DB-04 | Supabase `automation_templates` table with category, name, description and RLS | Global read policy for authenticated users; service_role for writes |
| DB-05 | Supabase `automations` table linked to org with status tracking and RLS | 6-state status (use CHECK constraint); service_role-only writes; org-scoped SELECT |
| DB-06 | Supabase `automation_executions` table with metrics and RLS | Service_role-only writes; org-scoped SELECT via automation join |
| DB-07 | Supabase `automation_requests` table with urgency levels and RLS | User INSERT allowed; 3-urgency (low/normal/urgent) CHECK constraint; org-scoped SELECT |
| DB-08 | Supabase `subscriptions` table synced with Stripe and RLS | Service_role-only writes; org-scoped SELECT |
| DB-09 | Supabase `chat_messages` table with realtime enabled and RLS | ALTER PUBLICATION supabase_realtime ADD TABLE; user INSERT; org-scoped SELECT |
| DB-10 | Supabase `notifications` table with read/unread status and RLS | type field (info/warning/success/action_required) as CHECK constraint or Postgres ENUM |
| DB-11 | Supabase `invitations` table with token and expiry and RLS | Token as UUID or random hex; expires_at timestamp; org-scoped policies |
| DB-12 | All migrations in `supabase/migrations/` directory | Timestamp naming: YYYYMMDDHHmmss_description.sql; supabase db reset applies all in order |
| DB-13 | Seed script for development data (sample org, users, templates) | supabase/seed.sql auto-applied by supabase db reset; requires auth.users rows first |
</phase_requirements>

---

## Summary

The project already has a partial Supabase schema in `supabase/migrations/` (files 000-002) that was created before these requirements were formally defined. The existing migrations contain many of the right tables but have several mismatches with the CONTEXT.md decisions: the `users` table uses the wrong pattern (should be `profiles` with `on_auth_user_created` trigger), automation status values don't match the 6-state lifecycle, urgency levels use `medium` instead of `normal`, there is no `chat_messages` or `notifications` table, no `deleted_at` soft delete columns, and extra out-of-scope tables (`invoices`, `support_tickets`, `support_messages`, `contact_messages`).

The correct approach for Phase 2 is to **replace the existing migrations with a clean, correct set** — drop the three ad-hoc files and create a properly structured migration set under the standard `YYYYMMDDHHmmss_description.sql` naming. This phase should produce: one or two migration files that create all 11 required tables with correct RLS, plus an updated `seed.sql` with the volume and variety specified in CONTEXT.md. The existing `seed.sql` already has 15 good automation templates that can be reused.

Supabase's standard patterns are well-documented and stable. The trickiest areas are: (1) the `profiles` trigger pattern requires a SECURITY DEFINER function to write across schemas; (2) RLS policies must use `(select auth.uid())` wrapped form for caching — the naive `auth.uid()` form is called per-row and causes severe performance degradation; (3) enabling Realtime requires `ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages` in the migration itself; (4) soft delete + RLS requires care on UPDATE policies because Postgres internally needs SELECT to check the policy before applying the UPDATE.

**Primary recommendation:** Write a single replacement migration (`20260305000001_complete_schema.sql`) that drops existing tables and recreates all 11 tables with correct columns, optimized RLS, and Realtime publication — then update `seed.sql` with the richer seed data CONTEXT.md specifies.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase CLI | latest (1.x) | Run migrations, seed, reset local DB | Official tool; `supabase db reset` = migrate + seed in one command |
| PostgreSQL | 15 (configured in config.toml) | Database engine | Already locked in project config.toml |
| supabase_realtime publication | built-in | Realtime change events | ALTER PUBLICATION is the only supported way to enable table-level Realtime |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid-ossp extension | built-in | UUID generation (`uuid_generate_v4()`) | Already in existing migration; use for all PK defaults |
| Postgres SECURITY DEFINER | built-in | Cross-schema trigger functions | Required for profiles trigger that writes from auth schema to public |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CHECK constraint for status/urgency | Postgres ENUM | ENUMs are hard to modify (ALTER locks table, can't remove values); CHECK constraints allow alter without full table scan — preferred for values likely to change |
| `on_auth_user_created` trigger | Application-layer profile creation | Trigger is more reliable; app layer can miss signups from OAuth or magic link |
| `(select auth.uid())` wrapped form | Direct `auth.uid()` in policy | Direct form is called per-row; wrapped form is cached per statement — critical for tables with many rows |

**Installation:** No npm packages required for this phase. All work is SQL migrations run via Supabase CLI.

```bash
# Reset local DB with all migrations + seed
supabase db reset

# Create a new migration file with correct timestamp naming
supabase migration new complete_schema
```

---

## Architecture Patterns

### Recommended Project Structure
```
supabase/
├── config.toml           # Already exists — do not modify
├── seed.sql              # Updated with 2 orgs, 4 users, ~8 templates, sample data
└── migrations/
    ├── 000_drop_all.sql  # REMOVE — not a valid migration pattern
    ├── 001_initial_schema.sql   # REPLACE — mismatches requirements
    ├── 002_fix_rls_policies.sql # REMOVE — merged into new migration
    └── 20260305000001_complete_schema.sql  # NEW — single correct migration
```

The existing 000/001/002 files do not follow the Supabase timestamp naming convention (`YYYYMMDDHHmmss_description.sql`). They should be deleted and replaced with properly named files. The `000_drop_all.sql` is especially problematic — it is a manual script, not a true migration, and `supabase db reset` does a clean drop automatically without needing this file.

### Pattern 1: Optimized RLS with Org Isolation

**What:** Every table that is org-scoped uses an EXISTS subquery checking `organization_members`, with `auth.uid()` wrapped in a SELECT for caching.

**When to use:** All tables with an `organization_id` column.

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
CREATE POLICY "org_members_select" ON automations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = automations.organization_id
            AND organization_members.user_id = (SELECT auth.uid())
        )
    );
```

The `(SELECT auth.uid())` wrapper forces Postgres to evaluate it once per query (initPlan), not once per row. This is the single most impactful RLS optimization — Supabase docs show 11,000ms → 10ms improvements.

### Pattern 2: Profiles Table with Trigger

**What:** A `profiles` table in `public` schema that mirrors `auth.users`, auto-populated via a trigger when a user signs up.

**When to use:** Always in Supabase — the `auth.users` table is not accessible via the API.

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/auth/managing-user-data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER required: trigger runs as DB owner to write cross-schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Pattern 3: Service-Role-Only Write Tables

**What:** Tables that only the AIDEAS backend (using service_role key) can write to. Users get SELECT only; no INSERT/UPDATE from client side.

**When to use:** `automations`, `automation_executions`, `subscriptions`.

**Example:**
```sql
-- SELECT for org members only
CREATE POLICY "org_select_automations" ON automations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = automations.organization_id
            AND organization_members.user_id = (SELECT auth.uid())
        )
    );
-- No INSERT/UPDATE/DELETE policy → only service_role can write (RLS bypassed by service_role)
```

### Pattern 4: Realtime Publication

**What:** Adding `chat_messages` to the `supabase_realtime` PostgreSQL publication. Must be done in migration SQL.

**When to use:** Only for `chat_messages` in Phase 2.

**Example:**
```sql
-- Source: https://supabase.com/docs/guides/realtime/postgres-changes
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Optional: full replica identity to receive old record values on UPDATE
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
```

### Pattern 5: Soft Delete with RLS

**What:** `deleted_at TIMESTAMPTZ` column on every table; RLS filters it out automatically.

**When to use:** All tables (per CONTEXT.md locked decision).

**Example:**
```sql
-- In table definition
deleted_at TIMESTAMPTZ,

-- In RLS SELECT policy — add deleted_at check
USING (
    deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = table_name.organization_id
        AND organization_members.user_id = (SELECT auth.uid())
    )
);

-- UPDATE policy must also check deleted_at (Postgres needs SELECT to work for UPDATE internals)
-- Use WITH CHECK to prevent un-soft-deleting via user UPDATE
CREATE POLICY "user_insert_chat" ON chat_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = (SELECT auth.uid())
        )
    );
```

### Anti-Patterns to Avoid

- **Non-timestamp migration filenames (e.g., `001_name.sql`):** Supabase CLI expects `YYYYMMDDHHmmss_name.sql`. Non-standard names may not apply in the correct order.
- **`000_drop_all.sql` as a migration:** `supabase db reset` creates a clean Postgres container automatically. A drop-all migration runs on `db reset` and could cause issues in CI/staging pipelines.
- **Direct `auth.uid()` in USING clause (not wrapped):** Called per-row, causing massive performance regression on larger tables.
- **Missing `TO authenticated` role specification:** Without it, the policy runs for anon users too, wasting work and exposing risk.
- **Missing SELECT policy when UPDATE policy exists:** Postgres requires a SELECT policy for the same user to execute an UPDATE. Omitting it silently blocks updates.
- **Infinite recursion in organization_members RLS:** If the org_members SELECT policy subqueries org_members itself, it infinitely recurses. The correct pattern is `user_id = (SELECT auth.uid())` — a direct column check with no self-reference. The existing `002_fix_rls_policies.sql` already solved this, which confirms the danger.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timestamp tracking | Manual `updated_at` triggers per-table | Single `update_updated_at_column()` trigger function + CREATE TRIGGER per table | Already implemented in 001_initial_schema.sql — reuse this pattern |
| Profile creation on signup | Application-layer INSERT after signup | `on_auth_user_created` trigger | Trigger fires for every signup method (email, OAuth, magic link) — app-layer misses non-password flows |
| Realtime via polling | Custom WebSocket or polling loop | `ALTER PUBLICATION supabase_realtime ADD TABLE` + Supabase client subscription | Supabase handles WebSocket, authentication, reconnection, RLS filtering |
| UUID generation | Custom ID schemes | `uuid_generate_v4()` or `gen_random_uuid()` (Postgres 14+) | Built-in, indexed efficiently, globally unique |
| Org isolation middleware | Application-layer filtering | RLS policies with EXISTS check | RLS enforces at DB level — app-layer filtering can be bypassed; defense-in-depth |

**Key insight:** Supabase provides server-side primitives (triggers, publications, RLS) for every cross-cutting concern in this schema. Custom application-layer solutions for these problems introduce security gaps and maintenance burden.

---

## Common Pitfalls

### Pitfall 1: RLS Infinite Recursion on organization_members
**What goes wrong:** Policy on `organization_members` checks `organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())` — this subqueries itself, causing infinite recursion and a 500 error.
**Why it happens:** The policy evaluates each row, which triggers the same policy on the subquery, which evaluates each row, etc.
**How to avoid:** Use a direct column check: `user_id = (SELECT auth.uid())`. No subquery into the same table. This is the fix already in `002_fix_rls_policies.sql`.
**Warning signs:** `stack depth limit exceeded` error in Supabase logs.

### Pitfall 2: Non-Cached auth.uid() Per-Row Evaluation
**What goes wrong:** RLS using `auth.uid()` directly (not wrapped) evaluates the JWT decode function on every row scanned, causing timeouts on tables with >1K rows.
**Why it happens:** Postgres treats the bare function call as volatile — re-evaluates per row.
**How to avoid:** Always write `(SELECT auth.uid())` — the SELECT wrapper tells Postgres to evaluate it once and cache.
**Warning signs:** Dashboard query timeout; EXPLAIN ANALYZE showing function called N times (once per row).

### Pitfall 3: Profiles Trigger Fails Silently on OAuth Signup
**What goes wrong:** If the `handle_new_user` trigger function lacks `SECURITY DEFINER`, it may fail with permission errors on OAuth signups, blocking user creation.
**Why it happens:** The trigger runs in the context of the auth schema, but `public.profiles` requires explicit permission. SECURITY DEFINER runs as the function creator (postgres owner) who has all permissions.
**How to avoid:** Always use `SECURITY DEFINER SET search_path = ''` in the trigger function.
**Warning signs:** OAuth signup completes (Supabase Auth creates the auth.users row) but `profiles` row is missing.

### Pitfall 4: seed.sql Referencing Non-Existent auth.users Rows
**What goes wrong:** `seed.sql` tries to INSERT into `profiles` or `organization_members` with user UUIDs that don't exist in `auth.users`, causing FK violations.
**Why it happens:** `supabase db reset` runs migrations then seed.sql — but `auth.users` rows must be created in seed.sql too (or via the Supabase auth API in tests).
**How to avoid:** Use Supabase's internal `auth.users` insert pattern in seed.sql, or avoid FK to `auth.users` in seed data by using `auth.users` inserts first.
**Warning signs:** `supabase db reset` fails with FK constraint violation during seed.

### Pitfall 5: Soft Delete Breaks RLS UPDATE Policy
**What goes wrong:** Adding `deleted_at IS NULL` to SELECT RLS policy but not accounting for it in UPDATE policy causes UPDATE to silently fail on non-deleted rows (Postgres evaluates SELECT policy internally before applying UPDATE).
**Why it happens:** UPDATE needs the SELECT policy to pass first (to find the row), then the UPDATE policy WITH CHECK to apply. If SELECT policy has extra conditions, they filter out rows before UPDATE can act.
**How to avoid:** Keep SELECT and UPDATE policies consistent. If SELECT filters `deleted_at IS NULL`, UPDATE should also use the same filter pattern.
**Warning signs:** `UPDATE ... WHERE id = X` returns 0 rows affected even though the row exists.

### Pitfall 6: Old Non-Timestamp Migration Files Break Ordering
**What goes wrong:** Files like `000_drop_all.sql` and `001_initial_schema.sql` sort alphabetically before timestamp-named files, but `supabase db reset` may apply them in an unexpected order when mixed with timestamp-named files.
**Why it happens:** Supabase CLI sorts migration files lexicographically. Numeric prefixes sort differently from timestamps.
**How to avoid:** Delete all three existing migrations (000, 001, 002) and replace with a single properly-named timestamp file. All three existing files are developmental artifacts — the project hasn't launched yet, so there is no production state to preserve.

---

## Code Examples

Verified patterns from official sources:

### Complete RLS Pattern for an Org-Scoped Table
```sql
-- Source: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- SELECT: org members only, deleted_at filter, cached auth.uid()
CREATE POLICY "automations_select" ON automations
    FOR SELECT TO authenticated
    USING (
        deleted_at IS NULL
        AND EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = automations.organization_id
            AND organization_members.user_id = (SELECT auth.uid())
        )
    );
-- No INSERT/UPDATE/DELETE = service_role only
```

### Enabling Realtime on chat_messages
```sql
-- Source: https://supabase.com/docs/guides/realtime/postgres-changes
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

### Seed auth.users Insert Pattern
```sql
-- Source: Supabase community pattern for seeding local dev
-- Insert into auth.users directly (only works locally / with service_role)
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'alice@acme.com',
    crypt('Password123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Alice Smith"}'::jsonb,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;
-- The on_auth_user_created trigger will auto-insert into public.profiles
```

### CHECK Constraint for Status Column (Preferred Over ENUM)
```sql
-- Source: https://www.crunchydata.com/blog/enums-vs-check-constraints-in-postgres
-- CHECK constraint: easier to modify in migrations, no ALTER TYPE lock
status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'failed', 'archived')),

-- vs Postgres ENUM (requires ALTER TYPE, cannot remove values):
-- CREATE TYPE automation_status AS ENUM ('draft', 'pending_review', ...);
```

### updated_at Trigger Function (Reuse from Existing Migration)
```sql
-- Already defined in 001_initial_schema.sql — carry forward to new migration
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply per-table:
CREATE TRIGGER update_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Numeric migration prefixes (001_, 002_) | Timestamp prefixes (YYYYMMDDHHmmss_) | Supabase CLI v1 | Guaranteed lexicographic sort order across teams |
| `auth.uid()` bare in USING | `(SELECT auth.uid())` wrapped | ~2023 (Supabase docs update) | 100x-1000x RLS performance improvement |
| Postgres ENUM for status values | TEXT + CHECK constraint | Community shift ~2022-2024 | Easier migration, no ALTER TYPE lock |
| Application-layer org filtering | RLS with EXISTS + indexed columns | Always best practice | Defense-in-depth; cannot be bypassed by client |
| `supabase_realtime` configured in dashboard | `ALTER PUBLICATION` in migration SQL | Supabase CLI matured | Reproducible — `supabase db reset` always enables Realtime |

**Deprecated/outdated:**
- `000_drop_all.sql` as a migration: `supabase db reset` creates a clean container; this file conflicts with the migration system and should be deleted.
- Bare `auth.uid()` in RLS USING clause: functionally correct but a performance anti-pattern per official Supabase docs.
- `users` table name (used in existing 001_initial_schema.sql): Supabase convention and official docs use `profiles`. `users` conflicts conceptually with `auth.users`.

---

## Schema Design Reference

### Tables Required (11 total per CONTEXT.md)

| Table | Org-Scoped | Realtime | User Writes | Soft Delete |
|-------|-----------|---------|------------|-------------|
| organizations | self | No | No (service_role) | Yes |
| profiles | user-scoped | No | self only | Yes |
| organization_members | Yes | No | No (service_role) | No (use joined_at/is_active) |
| automation_templates | global read | No | No (service_role) | No |
| automations | Yes | No | No (service_role) | Yes |
| automation_executions | via automation | No | No (service_role) | No |
| automation_requests | Yes | No | Yes (user INSERT) | Yes |
| subscriptions | Yes | No | No (service_role) | No |
| chat_messages | Yes | YES | Yes (user INSERT) | No |
| notifications | Yes | No | No (service_role) | No |
| invitations | Yes | No | No (service_role) | No |

### Key Column Decisions (Claude's Discretion)

**automation_templates:**
- `category TEXT CHECK (category IN ('customer_service', 'documents', 'marketing', 'sales', 'operations'))`
- `pricing_tier TEXT CHECK (pricing_tier IN ('starter', 'pro', 'business'))`
- No `deleted_at` — global catalog; use `is_active BOOLEAN` to hide

**automations:**
- `status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'failed', 'archived'))`
- `template_id UUID REFERENCES automation_templates(id)` — nullable (custom automations may not use a template)

**automation_requests:**
- `urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'urgent'))`

**chat_messages:**
- `sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'aideas'))` — no FK to profiles for AIDEAS side (service_role messages)
- `sender_id UUID REFERENCES profiles(id)` — nullable (AIDEAS-side messages may not have a user id)

**notifications:**
- `type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'action_required'))`
- `is_read BOOLEAN NOT NULL DEFAULT false`
- `read_at TIMESTAMPTZ`

**invitations:**
- `token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex')` — 64-char hex token
- `expires_at TIMESTAMPTZ NOT NULL` — application sets, typically 7 days

**organization_members:**
- `role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'operator', 'viewer'))`
- No `deleted_at` — use `is_active BOOLEAN DEFAULT true` or just DELETE the row (members removing themselves is a valid hard delete; soft delete is for business records)

### Recommended Index Strategy

```sql
-- Critical for RLS performance: columns used in policy EXISTS checks
CREATE INDEX ON automations(organization_id);
CREATE INDEX ON automation_requests(organization_id);
CREATE INDEX ON chat_messages(organization_id);
CREATE INDEX ON notifications(organization_id);
CREATE INDEX ON organization_members(organization_id);
CREATE INDEX ON organization_members(user_id);      -- Direct lookup for RLS
CREATE INDEX ON invitations(token);                  -- Token lookup
CREATE INDEX ON invitations(organization_id);
CREATE INDEX ON automation_executions(automation_id);
CREATE INDEX ON subscriptions(organization_id);
```

---

## Open Questions

1. **Should `organization_members` be soft-deleted or hard-deleted?**
   - What we know: CONTEXT.md says soft delete across tables, but membership revocation via `deleted_at` means the user would still appear in the table
   - What's unclear: Whether the app layer needs to recover revoked memberships or just prevent access
   - Recommendation: Use `is_active BOOLEAN DEFAULT true` instead of `deleted_at` for members — simpler for RLS (`AND is_active = true`), no need to recover revoked memberships

2. **How should the seed script create auth.users?**
   - What we know: `supabase db reset` runs `seed.sql` in the same Postgres session; the local dev DB is accessible with postgres superuser rights; inserting into `auth.users` directly is possible locally
   - What's unclear: Whether the project uses `supabase start` with a local DB or connects to a remote Supabase project for dev
   - Recommendation: Use direct `auth.users` INSERT in `seed.sql` (works for local dev with `supabase db reset`); document that this won't work against remote projects (use service_role API calls instead)

3. **Should the new migration replace or extend the existing ones?**
   - What we know: The existing 001/002 files have schema mismatches; the project hasn't launched; no production data exists
   - What's unclear: Whether any existing Supabase remote project has been provisioned with the old schema
   - Recommendation: Delete all three existing migration files and create a single clean `20260305000001_complete_schema.sql`. If a remote project has the old schema, run `supabase db reset` against local only and use `supabase db push` for remote after review.

---

## Sources

### Primary (HIGH confidence)
- https://supabase.com/docs/guides/auth/managing-user-data — profiles table pattern, on_auth_user_created trigger, SECURITY DEFINER
- https://supabase.com/docs/guides/realtime/postgres-changes — ALTER PUBLICATION supabase_realtime, RLS interaction with Realtime
- https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv — (SELECT auth.uid()) wrapping, EXISTS vs IN, index strategy
- https://supabase.com/docs/guides/database/postgres/row-level-security — core RLS patterns, USING vs WITH CHECK, NULL handling
- https://supabase.com/docs/guides/deployment/database-migrations — supabase db reset, supabase db push, seed.sql workflow
- Existing codebase: `supabase/migrations/001_initial_schema.sql`, `002_fix_rls_policies.sql`, `seed.sql` — confirmed infinite-recursion fix pattern, existing schema structure

### Secondary (MEDIUM confidence)
- https://www.crunchydata.com/blog/enums-vs-check-constraints-in-postgres — CHECK constraints preferred over ENUM for mutable status values
- https://supabase.com/docs/guides/troubleshooting/soft-deletes-with-supabase-js — soft delete + RLS interaction and UPDATE policy pitfall

### Tertiary (LOW confidence)
- Community pattern for `auth.users` INSERT in seed.sql — standard local dev approach but not in official Supabase docs as a seed example

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Supabase CLI, PostgreSQL 15, supabase_realtime publication all verified from official docs
- Architecture: HIGH — RLS patterns, profiles trigger, Realtime publication verified from official Supabase documentation
- Pitfalls: HIGH — infinite recursion confirmed by existing 002_fix_rls_policies.sql; auth.uid() caching confirmed by official troubleshooting docs; all other pitfalls from official sources

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (Supabase docs are stable; RLS patterns change rarely)
