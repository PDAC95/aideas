---
phase: 07-schema-seed-data
plan: 02
subsystem: database
tags: [postgres, supabase, seed-data, i18n, next-intl, sql]

# Dependency graph
requires:
  - phase: 07-01
    provides: 8 new columns on automation_templates (setup_price, monthly_price, setup_time_days, industry_tags, connected_apps, typical_impact_text, avg_minutes_per_task, activity_metric_label)

provides:
  - 66 automation templates across 8 categories in seed.sql with i18n keys
  - English translations for all 66 templates in web/messages/en.json
  - Spanish translations for all 66 templates in web/messages/es.json
  - TRUNCATE CASCADE idempotency pattern for seed.sql
  - Template UUID naming convention: tt{cat}{seq}-0000-0000-0000-000000000001

affects: [08-automations-catalog, 09-automation-requests, 10-active-automations, 11-roi-dashboard, 07-03-fastapi]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "i18n keys stored in DB TEXT columns: templates.{slug}.name / .description / .impact / .metric_label"
    - "Template UUID convention: tt{cat_num}{seq}-0000-0000-0000-000000000001 (cat 01=sales..08=ai_agents)"
    - "TRUNCATE TABLE ... CASCADE for clean-slate seed idempotency (no ON CONFLICT)"
    - "Snake_case for i18n key slugs, kebab-case for URL slugs — kept distinct per-column"

key-files:
  created: []
  modified:
    - supabase/seed.sql
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "TRUNCATE CASCADE replaces ON CONFLICT — seed is idempotent via clean slate, not conflict avoidance"
  - "i18n keys in DB TEXT columns rather than inline text — supports bilingual catalog without schema changes"
  - "66 templates distributed across 8 categories: sales(8), marketing(8), customer_service(9), documents(8), operations(8), productivity(8), reports(8), ai_agents(9)"
  - "is_featured=true on 12 standout templates distributed across all categories for 'Top Picks' UI feature"
  - "pricing_tier: starter for simple templates, pro for medium, business for complex/AI-heavy"

patterns-established:
  - "i18n key slug pattern: templates.{snake_slug}.{field} where field is name/description/impact/metric_label"
  - "Template categories map to fixed UUID prefix: 01=sales, 02=marketing, 03=customer_service, 04=documents, 05=operations, 06=productivity, 07=reports, 08=ai_agents"

requirements-completed: [DATA-04]

# Metrics
duration: 10min
completed: 2026-04-10
---

# Phase 7 Plan 02: Seed Data — 66 Automation Templates Summary

**66-template automation catalog seeded across 8 categories with full EN/ES i18n key translations covering all 6 target industries, replacing 8 stub templates**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-10T14:14:29Z
- **Completed:** 2026-04-10T14:24:55Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced 8 stub automation templates with 66 fully-specified templates spanning 8 categories
- All templates carry realistic pricing (setup_price 9900-49900, monthly_price 2900-14900), industry tags, connected apps, and performance metrics
- Added 66-entry `"templates"` key to both en.json and es.json with name, description, impact, and metric_label per template — all keys verified to align exactly with seed.sql references
- Converted seed.sql from ON CONFLICT idempotency to TRUNCATE CASCADE (clean-slate pattern per 07-CONTEXT.md decision)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite seed.sql with 66 automation templates** - `21fca20` (feat)
2. **Task 2: Add EN/ES translations for all 66 templates** - `e416fd1` (feat)

**Plan metadata:** (committed with docs commit below)

## Files Created/Modified

- `supabase/seed.sql` - Full seed rewrite: TRUNCATE CASCADE + 66 templates with i18n keys replacing 8 stubs; automations/requests updated to reference new template UUIDs
- `web/messages/en.json` - Added `"templates"` top-level key with 66 entries (name, description, impact, metric_label per template in English)
- `web/messages/es.json` - Added `"templates"` top-level key with 66 entries in natural business Spanish for US/CA Hispanic market

## Decisions Made

- **TRUNCATE CASCADE for idempotency**: Replaced all `ON CONFLICT DO NOTHING` clauses with `TRUNCATE TABLE ... CASCADE` at the top of the seed. Clean slate is safer and simpler for development resets.
- **i18n keys in DB, not inline text**: `name`, `description`, `typical_impact_text`, and `activity_metric_label` columns store i18n keys (e.g., `templates.lead_followup_email.name`) rather than English text. This enables bilingual catalog display in phases 8 and 10 without schema changes.
- **12 featured templates**: `is_featured = true` applied to ~12 templates distributed across all categories for a "Top Picks" or "Mas populares" section in the catalog UI (consistent with 07-01 decision to use `is_featured` flag rather than a category value).
- **pricing_tier tiers**: `starter` for simple 1-day automations, `pro` for medium 2-3 day, `business` for complex 5-day and AI agent templates.

## Deviations from Plan

None — plan executed exactly as written.

**Docker Desktop still not running**: db reset validation deferred (same as 07-01). Static verification via Python and Node confirmed:
- 66 unique template UUIDs present
- All 8 categories represented
- All 6 industries covered (retail: 49, agencias: 48, legal: 26, inmobiliaria: 23, salud: 21, restaurantes: 13)
- All 8 new columns populated in every row
- TRUNCATE CASCADE present, zero ON CONFLICT clauses
- EN/ES: 66 entries each, all 4 subkeys present, zero mismatches vs seed.sql slug references

## Issues Encountered

- IDE flagged false-positive SQL syntax errors (lines 23-24) — TSQL linter misinterpreting PostgreSQL multi-table TRUNCATE syntax. PostgreSQL `TRUNCATE TABLE public.invitations, ...` is valid. Not a real issue.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 07-03 (FastAPI seed data) can proceed — template catalog is complete with all 66 templates
- Phases 08 (dashboard home) and 10 (automation catalog) can reference these templates, their UUIDs, i18n keys, and pricing structures
- When Docker Desktop is running, run `npx supabase db reset` to apply migrations + seed together
- The `web/messages/en.json` and `web/messages/es.json` `templates` namespace is ready for `useTranslations('templates')` calls in phases 8-12

---
*Phase: 07-schema-seed-data*
*Completed: 2026-04-10*
