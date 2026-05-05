---
phase: 16-carry-over-cleanup
plan: 01
status: complete
completed: 2026-05-04
requirements_completed:
  - CARRY-01
  - CARRY-02
files_modified:
  - web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx
  - web/src/components/dashboard/weekly-bar-chart-loader.tsx
  - web/src/components/dashboard/weekly-bar-chart.tsx
  - web/src/components/dashboard/automation-success-rate.tsx
  - web/src/app/(dashboard)/dashboard/page.tsx
  - web/messages/en.json
  - web/messages/es.json
commits:
  - 332bbc7 fix(09): wrap WeeklyBarChart dynamic import in client loader for Next.js 16
  - 94002ab fix(16-01): remove next/dynamic ssr:false wrapper for WeeklyBarChart
  - 47757f9 fix(16-01): remove trend prop and trendLabel i18n from AutomationSuccessRate
one_liner: "Removed `next/dynamic({ ssr: false })` build-blocker for Next 16 + Turbopack and stripped the hardcoded `+5%` trend placeholder from `AutomationSuccessRate`."
---

# 16-01 Summary — Carry-over UI/Build Cleanup

## What was done

CARRY-01 and CARRY-02 from the v1.1 audit are closed.

**CARRY-01 (build error):** The `next/dynamic({ ssr: false })` wrapper around `WeeklyBarChart` rejected by Next.js 16 + Turbopack was replaced with a thin client-component loader (`weekly-bar-chart-loader.tsx`). `npm run build` is green again.

**CARRY-02 (hardcoded trend):** The `<AutomationSuccessRate trend="+5%" />` placeholder in `dashboard/page.tsx:212` was removed along with the `trend` prop, the `trendLabel` i18n key, and the TrendingUp/TrendingDown icons. The component now renders only the live computed `rate` value.

## Verification

- `grep "next/dynamic" web/src/app/\(dashboard\)/dashboard/automations/\[id\]/page.tsx` → no matches.
- `grep "trend=" web/src/app/\(dashboard\)/dashboard/page.tsx` → no `trend="+5%"` literal remains; only `rate={successRate}` is passed.
- Build passes with no `next/dynamic ssr:false` rejection.

## Notes

Closure verified retroactively on 2026-05-04 against the current codebase — the changes were committed earlier (see `commits` above) but the SUMMARY had not been written. This document backfills the audit trail.
