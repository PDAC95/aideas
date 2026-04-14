---
phase: 09-my-automations
plan: "02"
subsystem: ui
tags: [typescript, next.js, react, i18n, tailwind]

# Dependency graph
requires:
  - phase: 09-my-automations
    plan: "01"
    provides: AutomationsPageAutomation type, fetchAutomationsPage query, dashboard.automations i18n namespace
  - phase: 08-dashboard-home-notifications
    provides: StatusBadge component, dashboard layout patterns

provides:
  - AutomationsFilterTabs client component with URL-driven tab switching
  - AutomationCard display component with full data fields
  - AutomationCardSkeleton for Suspense fallback loading
  - /dashboard/automations Server Component page with filter logic and empty states

affects: [09-03-automation-detail, 09-04-automation-actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useSearchParams + useRouter for URL-driven filter tab state in Client Component"
    - "searchParams awaited as Promise in Next.js 16 Server Component page"
    - "Intl.NumberFormat(locale) for number and currency formatting passed from server"
    - "Hash-based deterministic color mapping for connected app badges"
    - "Suspense wrapper around AutomationsFilterTabs (required by useSearchParams)"

key-files:
  created:
    - web/src/components/dashboard/automations-filter-tabs.tsx
    - web/src/components/dashboard/automation-card.tsx
    - web/src/components/dashboard/automation-card-skeleton.tsx
    - web/src/app/(dashboard)/dashboard/automations/page.tsx
  modified: []

key-decisions:
  - "AutomationsFilterTabs uses router.push (not Link) to stay in same tab context while updating URL"
  - "AutomationCard passes locale from server for Intl.NumberFormat — avoids hydration mismatch"
  - "Filter empty state has no CTA button (lighter state); zero-automations empty state has purple catalog CTA"
  - "searchParams awaited per Next.js 16 pattern — matches existing codebase style in dashboard page"

# Metrics
duration: ~2min
completed: 2026-04-14
---

# Phase 09 Plan 02: Automations List Page Summary

**URL-driven automations list page with filterable card grid, status tabs, skeleton loading, and empty states using Next.js 16 Server Component + 3 new Client/Server components**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-14T12:51:06Z
- **Completed:** 2026-04-14T12:53:04Z
- **Tasks:** 2
- **Files created:** 4

## Accomplishments

- Created `AutomationsFilterTabs` — "use client" tab bar with `useSearchParams`/`useRouter`, purple active state, accessible `role="tablist"` / `role="tab"`, horizontal scroll on mobile
- Created `AutomationCard` — full-card `<Link>` with name, `StatusBadge`, category, connected app color circles (hash-based deterministic color), monthly metric with `Intl.NumberFormat`, price from integer cents, animate-in fade-in
- Created `AutomationCardSkeleton` — `animate-pulse` skeleton matching AutomationCard layout exactly
- Created `/dashboard/automations/page.tsx` — async Server Component with auth guard, orgId check, `searchParams` awaited per Next.js 16, parallel fetch of automations + translations + locale, computed tab counts, filtered card grid, and two distinct empty states

## Task Commits

Each task was committed atomically:

1. **Task 1: AutomationsFilterTabs, AutomationCard, AutomationCardSkeleton** - `28ac92f` (feat)
2. **Task 2: Automations list page** - `5f68b7c` (feat)

## Files Created/Modified

- `web/src/components/dashboard/automations-filter-tabs.tsx` — Client Component tab switcher with URL-driven state
- `web/src/components/dashboard/automation-card.tsx` — Full data automation card with link, badges, app circles, metric/price
- `web/src/components/dashboard/automation-card-skeleton.tsx` — Pulse skeleton loader matching card layout
- `web/src/app/(dashboard)/dashboard/automations/page.tsx` — Server Component page at /dashboard/automations

## Decisions Made

- `AutomationsFilterTabs` uses `router.push` (not `<Link>`) for tab navigation — stays on page context while updating URL
- `AutomationCard` receives `locale` from server to use `Intl.NumberFormat` — avoids hydration mismatches
- Filter empty state (e.g., "No paused automations") has no CTA; zero-automations empty state has purple "Explore catalog" button
- `searchParams` awaited as `Promise<{ status?: string }>` per Next.js 16 — matches dashboard/page.tsx pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/dashboard/automations` page is fully functional and renders card grid from DB data
- `AutomationCard` links to `/dashboard/automations/{id}` — ready for 09-03 (detail page)
- `AutomationCardSkeleton` exported and ready for use in Suspense fallbacks
- TypeScript compiles with zero errors

---
*Phase: 09-my-automations*
*Completed: 2026-04-14*
