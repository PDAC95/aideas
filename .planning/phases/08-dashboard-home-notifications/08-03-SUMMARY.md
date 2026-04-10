---
phase: 08-dashboard-home-notifications
plan: 03
subsystem: ui
tags: [react, radix-ui, next-intl, supabase, notifications, popover]

# Dependency graph
requires:
  - phase: 08-01
    provides: DashboardNotification type, i18n notification keys (dashboard.notifications.*), fetchDashboardData infrastructure

provides:
  - NotificationBell client component with Radix UI Popover, unread badge, mark-all-read
  - DashboardHeader server component with sticky topbar for desktop
  - Notifications prop injected into DashboardNav for mobile header bell
  - Single notification fetch in layout.tsx passed to both desktop and mobile

affects:
  - 08-04 (dashboard home page — layout structure now has topbar, main has lg:pt-16)
  - Any future dashboard pages that use the layout

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Radix umbrella package: import { Popover } from 'radix-ui' (same as Slot, Label)"
    - "Optimistic UI: state updated before await, server catches up in background"
    - "Single server-side fetch in layout, passed as props to both desktop and mobile consumers"

key-files:
  created:
    - web/src/components/dashboard/notification-bell.tsx
    - web/src/components/dashboard/dashboard-header.tsx
  modified:
    - web/src/app/(dashboard)/layout.tsx
    - web/src/components/dashboard/nav.tsx

key-decisions:
  - "Notifications fetched once in layout.tsx — avoids duplicate DB queries for desktop header + mobile nav"
  - "DashboardHeader accepts notifications as prop (not self-fetching) — layout owns single source of truth"
  - "Radix Popover uses Portal for correct stacking context above sidebar z-50"
  - "Bell shown in mobile nav header (replaces empty spacer div) + desktop sticky topbar (hidden on mobile)"

patterns-established:
  - "Optimistic mark-all-read: setNotifications/setLocalUnread before await supabase update"
  - "Type-icon mapping: success=CheckCircle green, info=Info blue, warning=AlertTriangle amber, action_required=AlertCircle red"

requirements-completed: [NOTF-01, NOTF-02, NOTF-03]

# Metrics
duration: 25min
completed: 2026-04-10
---

# Phase 08 Plan 03: Notification Bell Summary

**Sticky topbar header with Radix UI Popover notification bell — unread badge, type icons, optimistic mark-all-read — wired to real Supabase data on desktop and mobile**

## Performance

- **Duration:** 25 min
- **Started:** 2026-04-10T15:10:00Z
- **Completed:** 2026-04-10T15:35:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- NotificationBell client component with Radix UI Popover (portal, focus trap, keyboard nav), unread badge, type-specific colored icons, and optimistic mark-all-read persisted to Supabase
- DashboardHeader server component — sticky `left-64` topbar for desktop with bell + user avatar initials
- Layout fetches notifications once server-side and passes to both desktop header and mobile nav bell
- Mobile header updated: replaces empty `w-10` spacer with `NotificationBell`, desktop-only header hides on mobile via `hidden lg:flex`

## Task Commits

1. **Task 1: Create NotificationBell client component** - `6abfd7c` (feat)
2. **Task 2: Create dashboard header and update layout** - `39bb8a6` (feat)

## Files Created/Modified

- `web/src/components/dashboard/notification-bell.tsx` - Bell trigger, Radix Popover, notification list, mark-all-read
- `web/src/components/dashboard/dashboard-header.tsx` - Server component sticky topbar for desktop
- `web/src/app/(dashboard)/layout.tsx` - Single notifications fetch, passes to header + nav, adds `lg:pt-16`
- `web/src/components/dashboard/nav.tsx` - Accepts `notifications` prop, renders bell in mobile header

## Decisions Made

- Notifications fetched once in layout.tsx — DashboardHeader takes props instead of self-fetching, avoiding duplicate queries
- Radix Popover uses Portal to ensure correct z-index stacking above sidebar (z-50)
- `formatRelativeTime` inline in component (not i18n) since abbreviated time (now/5m/2h/3d) is universal

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Layout structure finalized with topbar: `lg:pl-64 lg:pt-16` on main content
- Notification bell ready for real-time updates (Supabase Realtime channel can be added later)
- 08-04 (dashboard home page) can render inside the updated layout without changes

---
*Phase: 08-dashboard-home-notifications*
*Completed: 2026-04-10*
