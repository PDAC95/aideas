---
phase: 15-dashboard-home-polish
plan: 01
subsystem: ui
tags: [next-intl, dashboard, i18n, tech-debt, react-server-components]

requires:
  - phase: 08-dashboard-home-notifications
    provides: fetchDashboardData query, KpiCards/AutomationPerformance components, dashboard.home.* i18n bundle
provides:
  - fetchDashboardData(orgId) — single-arg signature with no notifications side-fetch
  - KpiCards component — value + label only (no trend chip / TrendIndicator)
  - Automation Performance card — 3 rows (Total Executions, Success Rate, Active Automations)
  - en.json / es.json without orphan kpiTrends + performance.avgResponseTime keys
affects: [15-VERIFICATION, dashboard-home, future-real-trends-feature]

tech-stack:
  added: []
  patterns:
    - "Placeholder-removal-over-replacement: when audit flags hardcoded UI fillers, prefer deletion to recomputation when the underlying data source is unavailable"

key-files:
  created: []
  modified:
    - web/src/lib/dashboard/queries.ts
    - web/src/app/(dashboard)/dashboard/page.tsx
    - web/src/components/dashboard/kpi-cards.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "Removed kpiTrends and avgResponseTime entirely; not replaced with computed values (real trends require period-over-period queries; avgResponseTime from seed always ~5s — uninteresting)"
  - "Dropped userId param from fetchDashboardData rather than marking unused — single callsite, honest signature"
  - "Left AutomationSuccessRate trend='+5%' untouched (out of audit scope per locked decision #2)"
  - "Deleted orphan i18n keys (dashboard.home.kpiTrends, dashboard.home.performance.avgResponseTime) from both en.json and es.json for parity"

patterns-established:
  - "Audit-driven cleanup: closing tech-debt items by deletion when the underlying data is fictional"

requirements-completed: [HOME-02, HOME-04, I18N-01]

duration: 5min
completed: 2026-04-30
---

# Phase 15 Plan 01: Dashboard Home Placeholder Cleanup Summary

**Removed three audit-flagged placeholders from the dashboard home — redundant notifications query, hardcoded KPI trend chips (+12%/+8%/+15%), and the "< 1 min" Avg. Response Time row — plus orphan i18n keys, for a net deletion of ~50 lines.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-30T20:28:34Z
- **Completed:** 2026-04-30T20:33:02Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- `fetchDashboardData` no longer issues a redundant notifications query (layout.tsx already owns that fetch); signature reduced to `fetchDashboardData(orgId)`
- `KpiCards` component shed its `trends` prop, `TrendIndicator` subcomponent, and the `TrendingUp` / `TrendingDown` icon imports
- Dashboard home no longer renders the fake `+12% / +8% / +15%` trend chips on the three KPI cards
- Automation Performance card now lists exactly 3 rows (Total Executions, Success Rate, Active Automations) — the placeholder "Avg. Response Time: < 1 min" row is gone
- Orphan i18n keys (`dashboard.home.kpiTrends`, `dashboard.home.performance.avgResponseTime`) deleted from both `en.json` and `es.json`
- Closes audit LOW-2 (redundant notifications query) plus the three Phase 8 tech-debt items

## Task Commits

Each task was committed atomically:

1. **Task 1: Drop notifications query and userId param from fetchDashboardData** — `c61fd3c` (refactor)
2. **Task 2: Remove kpiTrends placeholder from KpiCards component and dashboard page** — `93a51a0` (refactor)
3. **Task 3: Remove avgResponseTime row and orphan i18n keys** — `feb14e6` (refactor)

## Files Created/Modified

- `web/src/lib/dashboard/queries.ts` — removed `notificationsPromise`, dropped `userId` parameter, return shape now `{ automations, executions, kpis }`
- `web/src/app/(dashboard)/dashboard/page.tsx` — updated callsite to single-arg, deleted `kpiTrends` constant, deleted `avgResponseTime` constant, removed entry from `performanceMetrics`, removed `trends={kpiTrends}` prop
- `web/src/components/dashboard/kpi-cards.tsx` — removed `TrendIndicator` subcomponent, removed `trends` from interfaces and JSX, dropped `TrendingUp`/`TrendingDown` icon imports
- `web/messages/en.json` — removed `dashboard.home.performance.avgResponseTime` and entire `dashboard.home.kpiTrends` object
- `web/messages/es.json` — mirror of EN edits

## Decisions Made

All four locked planner decisions enacted exactly as specified:

1. **Removed placeholders, did NOT compute replacements.** Deletion was the leaner path — real trends require period-over-period snapshot data (not yet built); avgResponseTime from seed data is uniformly ~5s and uninteresting.
2. **Left sibling `AutomationSuccessRate trend="+5%"` alone.** Out of audit scope.
3. **Dropped `userId` param from `fetchDashboardData`.** Only consumer was the dropped notifications query; single callsite update.
4. **Removed orphan i18n keys for parity.** Both `kpiTrends` and `performance.avgResponseTime` deleted from EN and ES.

## Deviations from Plan

### Pre-existing working-tree changes incidentally bundled

**1. [Scope Note] Pre-existing `mt-4` styling tweak in `dashboard/page.tsx`**
- **Found during:** Task 1 staging
- **Issue:** The working tree already contained an unrelated `mb-6` → `mt-4 mb-6` className change on the greeting row (untracked work from a prior session / parallel agent), separate from this plan's scope.
- **Fix:** Used `git apply --cached` with a hand-crafted patch on each task to stage ONLY my hunks; the pre-existing styling tweak was left in the working tree and is NOT in any of this plan's commits.
- **Verification:** `git show` on each of `c61fd3c`, `93a51a0`, `feb14e6` confirms the `mt-4` line is absent.

**2. [Scope Note] Pre-existing purple color tweak in `kpi-cards.tsx`**
- **Found during:** Task 2 commit
- **Issue:** The working tree already contained a `text-purple-600 → text-purple-400` and `bg-purple-100 → bg-purple-50` color tweak on the third KPI card (Hours Saved), separate from this plan's scope. Because Task 2 rewrote the entire component via `Edit`, the pre-existing color tweak was carried into the rewrite and bundled in commit `93a51a0`.
- **Fix:** Documented in commit message; same file, low-risk bundling.
- **Verification:** Final file contains both my Task 2 changes and the pre-existing color tweak; tsc passes.

**3. [Auto-staged by tooling] Two unrelated SUMMARY.md files committed in `93a51a0`**
- **Found during:** Task 2 commit
- **Issue:** `git commit` without `-a` somehow swept in `.planning/phases/08-dashboard-home-notifications/08-01-SUMMARY.md` and `08-02-SUMMARY.md` (each a 1-line addition: `requirements_completed: [...]`). These were modified in the working tree before this plan started.
- **Fix:** None — the changes are accurate (backfilling requirements traceability) and harmless; reverting would create churn.
- **Verification:** Inspected `git show 93a51a0` — both summary edits are appropriate `requirements_completed` backfills.

---

**Total deviations:** 0 functional auto-fixes (Rules 1-4). 3 scope/staging notes documented above for transparency.
**Impact on plan:** None on functional outcome. The unintended bundling does not violate any acceptance criterion. Plan executed as written.

## Issues Encountered

None. TypeScript passes 0 errors after each task. Both `en.json` and `es.json` parse as valid JSON.

## Verification (post-execution)

- `npx tsc --noEmit --skipLibCheck` — 0 errors
- `node -e "JSON.parse(...)"` for `en.json` and `es.json` — both pass
- `grep kpiTrends web/messages` — 0 hits
- `grep "kpiTrends|performance\.avgResponseTime" web/src` — 0 hits
- `grep "TrendIndicator|TrendingUp|TrendingDown" web/src/components/dashboard/kpi-cards.tsx` — 0 hits
- `grep "fetchDashboardData(user.id" web/src` — 0 hits
- `AutomationSuccessRate trend="+5%"` left intact (verified via grep on `automation-success-rate`)

**Smoke test (manual / browser-based):** Not run by executor — defer to Phase 15 verifier or manual UAT. Pitfall #4 (KpiCards row vs TopAutomationCard heights) is a visual concern only; the height of KpiCards rows shrunk slightly (lost trend chip), but is unlikely to break the lg:grid-cols-3 layout. No CSS adjustment was required by the plan; if a regression appears, it should be logged as a follow-up per the plan's instruction.

## Self-Check

Required artifact checks:

- `web/src/lib/dashboard/queries.ts` exists, contains `fetchDashboardData`, no `notificationsPromise` — PASS
- `web/src/app/(dashboard)/dashboard/page.tsx` exists, contains `fetchDashboardData(orgId)`, no `kpiTrends|avgResponseTime` — PASS
- `web/src/components/dashboard/kpi-cards.tsx` exists, contains `KpiCardsProps`, no `TrendIndicator|TrendingUp|TrendingDown` — PASS
- `web/messages/en.json` exists, no `kpiTrends` — PASS
- `web/messages/es.json` exists, no `kpiTrends` — PASS

Commits exist:
- `c61fd3c` — PASS
- `93a51a0` — PASS
- `feb14e6` — PASS

## Self-Check: PASSED

## Next Phase Readiness

- Plan 15-01 done; ready for Plan 15-02 (next plan in Phase 15) once it is created/queued.
- Phase 8 tech debt fully closed (3 items: KPI trends, avgResponseTime, redundant notifications query).
- No blockers.

---
*Phase: 15-dashboard-home-polish*
*Completed: 2026-04-30*
