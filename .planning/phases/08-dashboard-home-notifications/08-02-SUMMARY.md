---
phase: 08-dashboard-home-notifications
plan: "02"
subsystem: frontend/dashboard
tags: [dashboard, components, server-components, i18n, supabase]
dependency_graph:
  requires:
    - 08-01 (types, queries, status-badge, i18n keys)
  provides:
    - KpiCards server component (3 clickable cards with icons and numbers)
    - AutomationList server component (rows with status badges, daily counts, CTA)
    - ActivityFeed server component (execution events with status dots and relative time)
    - Full dashboard home page with real data
  affects:
    - web/src/app/(dashboard)/dashboard/page.tsx (replaces stub)
    - 08-03 (notification bell will overlay this page)
tech_stack:
  added: []
  patterns:
    - Pre-computed enriched data in parent page to avoid RSC function-prop limitation
    - Intl.NumberFormat for locale-aware number formatting
    - Template string substitution (replace "99" with "{count}") for i18n count patterns
    - Time-of-day greeting using getHours() in server component
key_files:
  created:
    - web/src/components/dashboard/kpi-cards.tsx
    - web/src/components/dashboard/automation-list.tsx
    - web/src/components/dashboard/activity-feed.tsx
  modified:
    - web/src/app/(dashboard)/dashboard/page.tsx
decisions:
  - Pre-compute enriched executions in parent page instead of passing formatTimeAgo function — functions are not serializable across RSC boundaries; page computes timeAgo strings and passes enriched array to ActivityFeed
  - Automation names rendered directly (human-readable strings from seed) — seed stores names like "Acme Customer Support Chatbot" not i18n keys; confirmed from seed.sql inspection
  - Template substitution for i18n count strings — getTranslations returns formatted strings (e.g., "5m ago"), so extract template by formatting with sentinel "99" then replacing with "{count}" for runtime substitution
metrics:
  duration: ~3 minutes
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 8 Plan 02: Dashboard Home Page Summary

**One-liner:** Full dashboard home with personalized time-of-day greeting, 3 KPI cards (emerald/blue/purple), 2-column automation list + activity feed layout, and dual CTA buttons — all wired to real Supabase data from Phase 7 seed.

## What Was Built

1. **KpiCards** (`web/src/components/dashboard/kpi-cards.tsx`) — Three clickable cards linking to `/dashboard/automations`. Each card has a colored icon circle (emerald=Zap, blue=ListChecks, purple=Clock), a large bold number formatted with `Intl.NumberFormat` (hours saved to 1 decimal), a label, and a hover shadow transition. Full dark mode support.

2. **AutomationList** (`web/src/components/dashboard/automation-list.tsx`) — Card container with section header + "View all" link. Each automation row shows: name, connected apps (comma-separated), `StatusBadge` with translated label, and daily execution count. Rows divided by `divide-y`. Bottom CTA is a dashed-border "+" button linking to `/dashboard/catalog`.

3. **ActivityFeed** (`web/src/components/dashboard/activity-feed.tsx`) — Card container showing up to 15 recent executions. Each row has a colored status dot (emerald/red/blue/gray), automation name, inline "Error" badge for error status, and pre-computed relative timestamp. Empty state shown when no executions.

4. **Dashboard page** (`web/src/app/(dashboard)/dashboard/page.tsx`) — Replaces the stub. Fetches user from supabase auth, gets orgId via `getOrgId`, calls `fetchDashboardData` for all data. Computes time-of-day greeting with first name. Pre-computes `enrichedExecutions` array with `timeAgo` strings (resolves RSC function-prop limitation). Renders greeting row with header CTA, KpiCards full-width, then 2-column grid (stacks on mobile via `grid-cols-1 lg:grid-cols-2`).

## Verification

- `tsc --noEmit` passes with zero errors (exit: 0)
- All 4 files present on disk
- Commits ba30adf (Task 1) and b4f9fee (Task 2) confirmed in git log

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed RSC function-prop limitation for formatTimeAgo**
- **Found during:** Task 2 implementation
- **Issue:** Plan suggested passing `formatTimeAgo` as a callback prop to ActivityFeed. But passing functions between Server Components (parent page → child component) is not supported — functions aren't serializable in RSC.
- **Fix:** Computed `enrichedExecutions` in the parent page: each execution gets a pre-computed `timeAgo` string. ActivityFeed accepts the enriched array with `timeAgo: string` field — no function props needed.
- **Files modified:** `web/src/app/(dashboard)/dashboard/page.tsx`, `web/src/components/dashboard/activity-feed.tsx`
- **Commit:** b4f9fee

**2. [Rule 2 - Auto-fix] Confirmed automation name format before rendering**
- **Found during:** Task 1 (AutomationList)
- **Issue:** Plan said "check seed.sql for actual name format — if human-readable, render directly; if i18n key, translate." Verified in seed.sql that names are human-readable strings (e.g., "Acme Customer Support Chatbot").
- **Fix:** Rendered names directly — no i18n translation needed for automation names.
- **Files modified:** `web/src/components/dashboard/automation-list.tsx`

## Self-Check: PASSED

Files created:
- FOUND: web/src/components/dashboard/kpi-cards.tsx
- FOUND: web/src/components/dashboard/automation-list.tsx
- FOUND: web/src/components/dashboard/activity-feed.tsx
- FOUND: web/src/app/(dashboard)/dashboard/page.tsx (modified)

Commits:
- FOUND: ba30adf (Task 1 — KPI cards + automation list)
- FOUND: b4f9fee (Task 2 — activity feed + dashboard page)
