---
phase: 11-reports-billing
plan: "02"
subsystem: ui
tags: [next.js, recharts, i18n, typescript, lucide-react, dashboard]

# Dependency graph
requires:
  - phase: 11-01
    provides: fetchReportsData, ReportsData, ReportsKpi, AutomationBreakdownRow, WeeklyChartData types; dashboard.reports i18n namespace
affects: []

provides:
  - /dashboard/reports RSC page with period-based URL state
  - ReportsPeriodSelector segmented control component
  - ReportsKpiCards 3-card grid component
  - ReportsWeeklyChart Recharts bar chart component (ssr:false)
  - ReportsBreakdownTable sortable table component

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ReportsWeeklyChart uses next/dynamic with ssr:false (same as WeeklyBarChart pattern from Phase 09-03)"
    - "Period selector uses router.push to drive URL-based state (same as AutomationsFilterTabs from Phase 09-02)"
    - "Translation objects passed from RSC parent to client children (avoids useTranslations in client components)"
    - "SortHeader sub-component encapsulates clickable column header with sort indicator"

key-files:
  created:
    - web/src/app/(dashboard)/dashboard/reports/page.tsx
    - web/src/components/dashboard/reports-period-selector.tsx
    - web/src/components/dashboard/reports-kpi-cards.tsx
    - web/src/components/dashboard/reports-weekly-chart.tsx
    - web/src/components/dashboard/reports-breakdown-table.tsx
  modified: []

key-decisions:
  - "Translations passed as typed objects from RSC page to client components — avoids useTranslations in client components and keeps i18n in server context"
  - "ReportsWeeklyChart JSDoc documents ssr:false requirement (consistent with WeeklyBarChart documentation pattern)"
  - "SortHeader extracted as sub-component within breakdown table file — single consumer, no need to share"
  - "Empty state for breakdown table returns null (no rows = no table) — RSC page handles the no-automations empty state"

requirements_completed: [REPT-01, REPT-02, REPT-03, REPT-04]

# Metrics
duration: 3min
completed: 2026-04-15
---

# Phase 11 Plan 02: Reports Page Summary

**Reports page at /dashboard/reports with period selector, 3 KPI cards, 8-week Recharts bar chart, and sortable per-automation breakdown table — all driven by URL period state**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-15T18:09:01Z
- **Completed:** 2026-04-15T18:12:00Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments

- Created RSC page at `/dashboard/reports` that reads `searchParams.period`, validates it, fetches data via `fetchReportsData`, and passes translation objects to client children
- Built `ReportsPeriodSelector` with segmented control UI (3 buttons) that drives period selection via `router.push` for URL-based state
- Built `ReportsKpiCards` with 3 cards (tasks completed / hours saved / estimated value) each with icon, large number, and change indicator with TrendingUp/TrendingDown arrows
- Estimated value card shows `"--"` with settings link when `hourlyCost` is null, consistent with plan spec
- Built `ReportsWeeklyChart` as a Recharts BarChart with 8 purple bars, dynamically imported via `next/dynamic({ ssr: false })`
- Built `ReportsBreakdownTable` with in-memory sorting by name/count/hoursSaved, top-10 default with "View all (N)" toggle, and totals row
- TypeScript compilation: zero errors in reports files (only pre-existing billing error from Plan 03 components not yet built)

## Task Commits

1. **Task 1: Create Reports page and period selector** - `b14ab68` (feat)
2. **Task 2: Create KPI cards, weekly chart, and breakdown table** - `5eeae5f` (feat)

## Files Created

- `web/src/app/(dashboard)/dashboard/reports/page.tsx` — RSC page with period validation, data fetch, empty state
- `web/src/components/dashboard/reports-period-selector.tsx` — segmented control for period selection
- `web/src/components/dashboard/reports-kpi-cards.tsx` — 3 KPI cards with change indicators
- `web/src/components/dashboard/reports-weekly-chart.tsx` — Recharts 8-week bar chart (use client + ssr:false)
- `web/src/components/dashboard/reports-breakdown-table.tsx` — sortable breakdown table with view all toggle

## Decisions Made

- Translations passed as typed objects from RSC page to client components — consistent with pattern established in Phase 09 (avoids `useTranslations` in client context)
- `ReportsWeeklyChart` JSDoc documents ssr:false import requirement, matching the `WeeklyBarChart` pattern from Phase 09-03
- `SortHeader` sub-component extracted within breakdown table file — single-file pattern since it's only used there
- Breakdown table `rows.length === 0` returns null — the page-level empty state (no automations) is already handled by the null return from `fetchReportsData`

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `web/src/app/(dashboard)/dashboard/billing/page.tsx` referencing billing components not yet built (Plan 03). This is not a regression — it existed before this plan and will be resolved when Plan 03 executes.

## Next Phase Readiness

- Plan 03 (Billing page) can proceed immediately
- Call `fetchBillingData(orgId)`, handle null return as empty state
- Follow same pattern: RSC page → translation objects → client components

---
*Phase: 11-reports-billing*
*Completed: 2026-04-15*
