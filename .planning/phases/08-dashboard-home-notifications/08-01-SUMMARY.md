---
phase: 08-dashboard-home-notifications
plan: "01"
subsystem: frontend/dashboard
tags: [i18n, types, queries, components, supabase]
dependency_graph:
  requires: []
  provides:
    - dashboard i18n keys EN/ES (dashboard.home.*, dashboard.notifications.*)
    - DashboardAutomation, DashboardExecution, DashboardNotification, KpiData types
    - getOrgId and fetchDashboardData server query functions
    - StatusBadge component with CVA variants
  affects:
    - web/src/app/(dashboard)/page.tsx (08-02 will consume fetchDashboardData)
    - notification bell component (08-03 will consume notifications data)
tech_stack:
  added: []
  patterns:
    - CVA (class-variance-authority) for status badge variants
    - Parallel Supabase queries via Promise.all for dashboard data
    - Server-side data fetching via createClient from @/lib/supabase/server
key_files:
  created:
    - web/src/lib/dashboard/types.ts
    - web/src/lib/dashboard/queries.ts
    - web/src/components/dashboard/status-badge.tsx
  modified:
    - web/messages/en.json
    - web/messages/es.json
decisions:
  - Fallback query pattern for executions — used .in("automation_id", orgAutomationIds) instead of nested .eq() on relation column, as Supabase filtering on nested relation columns via .eq() is unreliable; automations fetched first, then executions scoped by IDs
  - hoursSavedThisMonth rounded to 1 decimal (Math.round x10/10) for clean display
  - daily_execution_count mutated onto automation objects after initial fetch to avoid extra round-trips
metrics:
  duration: ~8 minutes
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 8 Plan 01: i18n Foundation, Types, Queries, and Status Badge Summary

**One-liner:** Dashboard i18n keys (EN/ES), TypeScript types, parallel Supabase query helpers, and CVA-based StatusBadge component establishing all shared contracts for Plans 08-02 and 08-03.

## What Was Built

All foundational shared contracts for Phase 8:

1. **i18n keys** — Added `dashboard.home.*` (greeting variants, KPIs, automation list, activity feed, status labels, time-ago) and `dashboard.notifications.*` to both `en.json` and `es.json`. Preserves all existing `dashboard.*` keys.

2. **TypeScript types** (`web/src/lib/dashboard/types.ts`) — `DashboardAutomation`, `DashboardExecution`, `DashboardNotification`, `KpiData` interfaces matching the DB schema exactly.

3. **Query helpers** (`web/src/lib/dashboard/queries.ts`) — `getOrgId(userId)` looks up org membership; `fetchDashboardData(userId, orgId)` runs parallel queries for automations (with template join), notifications, KPIs (active count, weekly tasks, monthly hours saved), and daily execution counts per automation.

4. **StatusBadge component** (`web/src/components/dashboard/status-badge.tsx`) — CVA-based badge with 7 distinct color variants (active=emerald, paused=amber, failed=red, in_setup=sky, pending_review=violet, draft/archived=gray), full dark mode support, accepts `status`, `label`, and optional `className`.

## Verification

- `tsc --noEmit` passes with zero errors
- `export.*StatusBadge` present in status-badge.tsx
- `export.*fetchDashboardData` present in queries.ts
- `activeAutomations` key confirmed in both en.json and es.json

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restructured executions query to avoid unreliable nested relation filter**
- **Found during:** Task 1 implementation
- **Issue:** Plan noted that `.eq("automation.organization_id", orgId)` on a nested relation may not be supported by Supabase PostgREST; filtering on nested joined columns via `.eq()` is unreliable
- **Fix:** Fetch automations first (already needed), extract `orgAutomationIds`, then use `.in("automation_id", orgAutomationIds)` for the executions query. This is the fallback the plan itself prescribed.
- **Files modified:** `web/src/lib/dashboard/queries.ts`
- **Commit:** f32eb09

## Self-Check: PASSED
