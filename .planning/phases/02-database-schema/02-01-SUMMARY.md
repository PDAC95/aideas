---
phase: 02-database-schema
plan: 01
subsystem: database
tags: [supabase, postgres, rls, migrations, sql]

# Dependency graph
requires:
  - phase: 01-api-foundation
    provides: Supabase client configured, environment variables for DB connection
provides:
  - organizations table with soft delete and member-gated RLS
  - profiles table with auto-creation trigger on auth.users insert
  - organization_members table with role CHECK constraint and direct user_id RLS
  - update_updated_at_column utility trigger function
  - handle_new_user SECURITY DEFINER trigger function
affects: [03-api-endpoints, 04-frontend, 05-automation-engine, seed-data, all future migrations]

# Tech tracking
tech-stack:
  added: [uuid-ossp extension]
  patterns:
    - All auth.uid() wrapped as (SELECT auth.uid()) for RLS performance caching
    - EXISTS subquery for org membership checks (avoids infinite recursion)
    - SECURITY DEFINER SET search_path = '' on trigger functions
    - CHECK constraints for enum-like columns (not Postgres ENUM)
    - is_active boolean for soft membership (not deleted_at)
    - deleted_at TIMESTAMPTZ for soft delete on organizations and profiles

key-files:
  created:
    - supabase/migrations/20260305000001_core_identity.sql
  modified: []

key-decisions:
  - "organization_members RLS uses direct user_id = (SELECT auth.uid()) — no self-referencing subquery to prevent infinite recursion"
  - "role column uses CHECK constraint (not Postgres ENUM) for easier future value additions"
  - "organization_members uses is_active boolean (not deleted_at) per research recommendation"
  - "handle_new_user uses SECURITY DEFINER SET search_path = '' — security best practice for trigger functions"
  - "No INSERT/UPDATE/DELETE RLS policies on system tables — service_role key for writes only"

patterns-established:
  - "RLS performance: always (SELECT auth.uid()) not bare auth.uid()"
  - "Org-scoped tables: EXISTS subquery against organization_members for membership gate"
  - "Trigger functions: SECURITY DEFINER SET search_path = '' for elevated-privilege functions"
  - "Migration naming: timestamp-prefixed YYYYMMDDNNNNNN_descriptive_name.sql"

requirements-completed: [DB-01, DB-02, DB-03, DB-12]

# Metrics
duration: 1min
completed: 2026-03-05
---

# Phase 2 Plan 01: Core Identity Tables Summary

**Supabase core identity schema: organizations, profiles, and organization_members tables with optimized RLS, auto-profile trigger, and legacy migration cleanup**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-06T00:42:09Z
- **Completed:** 2026-03-06T00:43:10Z
- **Tasks:** 1
- **Files modified:** 4 (3 deleted, 1 created)

## Accomplishments
- Deleted three legacy migration files (000_drop_all, 001_initial_schema, 002_fix_rls_policies) that violated Supabase timestamp naming conventions
- Created single migration `20260305000001_core_identity.sql` with all three identity tables, utility functions, and trigger
- Established RLS patterns: wrapped `(SELECT auth.uid())`, EXISTS membership checks, no self-referencing subqueries on organization_members
- Auto-profile creation trigger `on_auth_user_created` with SECURITY DEFINER ensures every auth.users signup gets a profiles row

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete legacy migrations and create core identity migration** - `b0095f8` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `supabase/migrations/20260305000001_core_identity.sql` - Core identity schema: extensions, utility functions, organizations/profiles/organization_members tables with RLS and triggers
- `supabase/migrations/000_drop_all.sql` - DELETED (legacy, non-timestamp name)
- `supabase/migrations/001_initial_schema.sql` - DELETED (legacy, non-timestamp name)
- `supabase/migrations/002_fix_rls_policies.sql` - DELETED (legacy, non-timestamp name)

## Decisions Made
- organization_members RLS uses direct `user_id = (SELECT auth.uid())` instead of any subquery against itself — prevents the infinite recursion pitfall where the policy would need to query organization_members to evaluate who can access organization_members
- role column uses `CHECK (role IN ('admin', 'operator', 'viewer'))` constraint rather than a Postgres ENUM — easier to add new values in future migrations without ALTER TYPE
- organization_members tracks active membership via `is_active BOOLEAN` rather than `deleted_at` — cleaner semantics (membership suspension vs deletion) and simpler queries
- All service_role write operations have no matching RLS policies on system tables (organizations, organization_members) — authenticated users are read-only, writes go through FastAPI with service_role key

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Migration will be applied to Supabase via `supabase db push` or the Supabase dashboard.

## Next Phase Readiness
- Core identity tables ready for Phase 2 Plan 02 (business domain tables: automations, templates, subscriptions, etc.)
- All three identity tables exist with correct RLS — downstream tables can add `organization_id` foreign keys
- Profiles trigger ensures auth is fully integrated with the public schema

---
*Phase: 02-database-schema*
*Completed: 2026-03-05*
