---
phase: 07-schema-seed-data
plan: 01
subsystem: database
tags: [postgres, supabase, migrations, sql, check-constraints, stripe]

# Dependency graph
requires:
  - phase: 02-database-schema
    provides: automation_templates, automations, automation_requests tables created in 20260305000002_automation_business.sql
  - phase: 04-user-registration
    provides: DROP CONSTRAINT IF EXISTS / ADD CONSTRAINT pattern for expanding CHECKs (established in 20260401000001)
provides:
  - 8 new columns on automation_templates (pricing, catalog metadata, i18n keys)
  - Expanded automation_templates.category CHECK (5 old + 3 new values)
  - stripe_subscription_id column on automations
  - Expanded automations.status CHECK (6 old + in_setup)
  - stripe_checkout_session_id, checkout_expires_at columns on automation_requests
  - Expanded automation_requests.status CHECK (5 old + payment_pending, payment_failed)
affects: [08-automations-catalog, 09-automation-requests, 10-active-automations, 11-roi-dashboard, 12-settings, 07-02-seed-data, 07-03-fastapi]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "DROP CONSTRAINT IF EXISTS then ADD CONSTRAINT for safe CHECK expansion (PostgreSQL)"
    - "ADD COLUMN IF NOT EXISTS for idempotent column additions"
    - "Integer cents for price columns (Stripe standard: 9900 = $99.00)"
    - "TEXT[] arrays for multi-value attributes (industry_tags, connected_apps)"
    - "i18n keys in TEXT columns for translatable display strings"

key-files:
  created:
    - supabase/migrations/20260409000001_v1_1_schema_expansion.sql
  modified: []

key-decisions:
  - "Prices stored as integer cents (Stripe standard) not decimals — setup_price range 9900-49900, monthly_price range 2900-14900"
  - "'Mas populares' is NOT a category — handled via existing is_featured=true flag, not a new category value"
  - "in_setup added to automations.status to represent automation during onboarding setup phase"
  - "payment_pending and payment_failed added to automation_requests.status to track Stripe checkout lifecycle"
  - "Docker Desktop not running — db reset validation deferred; static SQL validation confirmed all 35 content checks pass"

patterns-established:
  - "CHECK constraint expansion pattern: DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT (same as Phase 4 migration)"
  - "Migration file naming: YYYYMMDDNNNNNN_descriptive_name.sql"

requirements-completed: [DATA-01, DATA-02, DATA-03]

# Metrics
duration: 1min
completed: 2026-04-10
---

# Phase 7 Plan 01: Schema Expansion Summary

**PostgreSQL ALTER migration adding 11 new columns and expanding 3 CHECK constraints across automation_templates, automations, and automation_requests for v1.1 pricing and payment tracking**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-10T14:09:53Z
- **Completed:** 2026-04-10T14:11:20Z
- **Tasks:** 2 (1 committed, 1 validation-only)
- **Files modified:** 1

## Accomplishments

- Created single migration file `20260409000001_v1_1_schema_expansion.sql` with all v1.1 schema changes
- Added 8 columns to automation_templates for pricing (setup_price, monthly_price), catalog metadata (setup_time_days, industry_tags, connected_apps, avg_minutes_per_task), and i18n display keys (typical_impact_text, activity_metric_label)
- Expanded 3 CHECK constraints using the established DROP/ADD pattern preserving all original values
- Static SQL validation confirmed all 35 content checks pass (all old values preserved, all new values present)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create v1.1 schema expansion migration** - `ecb5f55` (feat)
2. **Task 2: Validate migration applies cleanly** - (validation-only, no new commit — same file, static validation passed)

**Plan metadata:** (committed with docs commit below)

## Files Created/Modified

- `supabase/migrations/20260409000001_v1_1_schema_expansion.sql` - v1.1 schema expansion: 11 new columns + 3 expanded CHECK constraints across 3 tables

## Decisions Made

- Prices stored as integer cents (Stripe standard): setup_price range 9900-49900, monthly_price range 2900-14900
- "Mas populares" is NOT a category — handled via existing `is_featured = true` flag
- `in_setup` status added to automations for the setup/onboarding phase after payment
- `payment_pending` and `payment_failed` added to automation_requests to track Stripe checkout session lifecycle
- All constraint expansions preserve original values exactly (DROP IF EXISTS + ADD pattern)

## Deviations from Plan

### Infrastructure Issue (Not Auto-fixable)

**Docker Desktop not running — `supabase db reset` skipped**
- **Found during:** Task 2 (Validate migration applies cleanly)
- **Issue:** Docker Desktop is a prerequisite for local Supabase development. The `supabase db reset` command failed with "The system cannot find the file specified" for the Docker pipe.
- **Mitigation:** Ran static SQL validation via Python script checking all 35 required content elements. All checks passed:
  - All 8 new columns present on automation_templates
  - All 5 old category values preserved + 3 new (productivity, reports, ai_agents)
  - stripe_subscription_id present on automations
  - All 6 old status values preserved + in_setup
  - stripe_checkout_session_id and checkout_expires_at present on automation_requests
  - All 5 old request statuses preserved + payment_pending, payment_failed
  - All 3 DROP CONSTRAINT IF EXISTS statements present
- **Recommendation:** Run `npx supabase db reset` manually when Docker Desktop is started to confirm full migration stack applies cleanly.

---

**Total deviations:** 1 infrastructure issue (not auto-fixable per deviation rules — not a code bug)
**Impact on plan:** Migration file is complete and validated statically. Runtime validation deferred until Docker is running.

## Issues Encountered

- Docker Desktop not running — Task 2 runtime validation could not execute. Static validation substituted successfully.

## User Setup Required

None - no external service configuration required beyond existing Supabase setup.

## Next Phase Readiness

- Schema migration is ready to apply when Docker Desktop is running
- Phase 07-02 (seed data) can proceed — seed templates use old category values (customer_service, documents, etc.) which are preserved under the expanded CHECK
- Phases 08-12 can reference the new columns in their schema designs
- **Recommendation:** Run `npx supabase db reset` when Docker Desktop starts to confirm full migration stack before Phase 07-02

---
*Phase: 07-schema-seed-data*
*Completed: 2026-04-10*
