---
phase: 11-reports-billing
plan: "01"
subsystem: ui
tags: [i18n, typescript, supabase, next-intl, lucide-react]

# Dependency graph
requires:
  - phase: 10-catalog
    provides: fetchCatalogTemplates, CatalogTemplate types, and WeeklyChartData (reused for reports chart)
  - phase: 07-schema
    provides: automations, automation_executions, organizations, subscriptions tables; hourly_cost as integer dollars in org settings
provides:
  - ReportsKpi, AutomationBreakdownRow, ReportsData types in types.ts
  - BillingAutomation, BillingData types in types.ts
  - fetchReportsData(orgId, period) query function in queries.ts
  - fetchBillingData(orgId) query function in queries.ts
  - dashboard.reports and dashboard.billing i18n namespaces in en.json and es.json
  - Reports nav entry with BarChart3 icon in nav.tsx
affects: [11-02-reports-page, 11-03-billing-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "fetchOrgHourlyCost shared helper extracts org settings.hourly_cost across reports and billing queries"
    - "getPeriodRange helper encapsulates this_month/last_month/last_3_months date math"
    - "groupBy8Weeks uses floor(daysAgo/7) bucket index pattern (extends groupByWeek from Phase 09)"
    - "Period-over-period change: null when prevPeriod=0 (avoids division by zero)"

key-files:
  created: []
  modified:
    - web/messages/en.json
    - web/messages/es.json
    - web/src/components/dashboard/nav.tsx
    - web/src/lib/dashboard/types.ts
    - web/src/lib/dashboard/queries.ts

key-decisions:
  - "groupBy8Weeks uses 8 buckets (S1-S8) always spanning last 56 days — independent of selected report period"
  - "fetchOrgHourlyCost extracted as shared helper — both fetchReportsData and fetchBillingData need hourly_cost"
  - "fetchReportsData returns null (not empty ReportsData) when org has no automations — triggers empty state in Plan 02"
  - "fetchBillingData returns null when no active/in_setup automations — triggers empty state in Plan 03"
  - "Breakdown map keyed by automationId (not name) to correctly deduplicate multi-execution automations"

patterns-established:
  - "Period range helper: getPeriodRange(period, now) returns { start, end, prevStart, prevEnd } ISO strings"
  - "Null returns from data fetchers signal empty state to page components (consistent with fetchTemplateBySlug pattern)"
  - "Shared org settings helper: fetchOrgHourlyCost(orgId) reusable across query functions"

requirements-completed: [REPT-01, REPT-02, REPT-04, REPT-05, BILL-01, BILL-02]

# Metrics
duration: 18min
completed: 2026-04-15
---

# Phase 11 Plan 01: Reports & Billing Data Layer Summary

**Supabase query functions (fetchReportsData, fetchBillingData), TypeScript types (ReportsData, BillingData), and EN/ES i18n namespaces for Reports and Billing pages with Reports nav entry**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-04-15T14:00:00Z
- **Completed:** 2026-04-15T14:18:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Added `ReportsKpi`, `AutomationBreakdownRow`, `ReportsData`, `BillingAutomation`, and `BillingData` types to types.ts
- Implemented `fetchReportsData(orgId, period)` with KPI calculation (tasks, hours, estimated value + change percentages), 8-week chart data, and per-automation breakdown
- Implemented `fetchBillingData(orgId)` with monthly charges, automation plan labels, next charge date from subscriptions
- Added all `dashboard.reports` and `dashboard.billing` i18n namespaces to both en.json and es.json
- Added Reports nav entry with `BarChart3` icon between Catalog and Chat in nav.tsx
- TypeScript compilation passes with zero errors

## Task Commits

1. **Task 1: Add i18n keys and update navigation** - `66fc47b` (feat)
2. **Task 2: Add TypeScript types and Supabase query functions** - `17ebc6f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `web/messages/en.json` - Added dashboard.nav.reports, dashboard.reports, dashboard.billing namespaces
- `web/messages/es.json` - Added Spanish translations for reports and billing namespaces
- `web/src/components/dashboard/nav.tsx` - Added BarChart3 import and Reports nav entry after Catalog
- `web/src/lib/dashboard/types.ts` - Added ReportsKpi, AutomationBreakdownRow, ReportsData, BillingAutomation, BillingData interfaces
- `web/src/lib/dashboard/queries.ts` - Added fetchReportsData, fetchBillingData, getPeriodRange, groupBy8Weeks, fetchOrgHourlyCost

## Decisions Made
- `groupBy8Weeks` always spans last 56 days (8 weeks) regardless of selected period — period selector controls KPI/breakdown only, chart shows rolling 8-week activity
- `fetchOrgHourlyCost` extracted as shared helper since both reports and billing functions need org settings.hourly_cost
- Both new query functions return `null` (not empty data structures) when no automations exist — consistent with `fetchTemplateBySlug` null-on-not-found pattern established in Phase 10
- Breakdown map keyed by `automationId` string (not name) for correct deduplication, but `automationId` field in the returned row stores the ID to allow Plan 02 to link to detail pages

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All types, query functions, i18n keys, and navigation are ready for Plan 02 (Reports page) and Plan 03 (Billing page)
- Plan 02 consumer: call `fetchReportsData(orgId, period)` with period from URL param; handle null return as empty state
- Plan 03 consumer: call `fetchBillingData(orgId)`; handle null return as empty state; use `hourlyCost` from result for hourly rate display

---
*Phase: 11-reports-billing*
*Completed: 2026-04-15*

## Self-Check: PASSED

- SUMMARY.md: FOUND
- types.ts: FOUND
- queries.ts: FOUND
- Commit 66fc47b (Task 1): FOUND
- Commit 17ebc6f (Task 2): FOUND
- ReportsData type: FOUND
- fetchReportsData function: FOUND
- tasksCompleted key in en.json: FOUND
- tasksCompleted key in es.json: FOUND
