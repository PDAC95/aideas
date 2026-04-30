---
phase: 08-dashboard-home-notifications
plan: "05"
subsystem: dashboard-ui
tags: [mobile, notifications, cta, nav, i18n]
dependency_graph:
  requires: [08-04, 08-03]
  provides: [HOME-05, NOTF-02]
  affects: [web/src/components/dashboard/nav.tsx, web/src/app/(dashboard)/dashboard/page.tsx]
tech_stack:
  added: []
  patterns: [radix-popover-in-mobile-menu, flex-greeting-row-with-cta]
key_files:
  created: []
  modified:
    - web/src/components/dashboard/nav.tsx
    - web/src/app/(dashboard)/dashboard/page.tsx
    - web/messages/en.json
    - web/messages/es.json
decisions:
  - "Wrapped NotificationBell in px-4 py-3 div to match mobile menu item padding — keeps visual alignment without special-casing the component"
  - "newAutomation key value changed from '+ Nueva automatización' to 'Nueva automatización' (Plus icon is rendered separately in JSX)"
  - "Short label for mobile CTA is 'New'/'Nueva' rather than '+' alone — more accessible and descriptive"
requirements_completed: [HOME-05, NOTF-02, I18N-01]
metrics:
  duration: "10 minutes"
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_modified: 4
---

# Phase 08 Plan 05: Mobile Notification Popover and Greeting CTA Summary

**One-liner:** Replaced static mobile notification row with interactive NotificationBell Radix popover, and added purple "+ New automation" CTA Link to dashboard greeting row visible at all viewports.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | gap-fix-mobile-notifications | 61f957f | nav.tsx |
| 2 | gap-fix-mobile-cta | a0715cc | page.tsx, en.json, es.json |

## What Was Built

**Task 1 — Mobile Notification Popover (NOTF-02)**

Replaced the static `<div>` in nav.tsx (hamburger mobile dropdown) that displayed a Bell icon + notification count badge with the existing `NotificationBell` component. The component uses a Radix Popover and renders the full notifications list with type icons, unread blue dots, and a "Mark all as read" action.

Changes:
- Added `import { NotificationBell }` from notification-bell component
- Updated `DashboardNav` function signature to destructure `user` (needed for `userId` prop)
- Replaced static 9-line div with `<NotificationBell initialNotifications={...} unreadCount={...} userId={user.id} translations={...} />` wrapped in matching padding div
- Removed now-unused `Bell` import from lucide-react

**Task 2 — Mobile Greeting CTA (HOME-05)**

Added a purple "+ New automation" Link button to the dashboard home greeting row. Visible at all viewport sizes. On mobile it shows a compact "New" label alongside the Plus icon; on sm+ breakpoints it shows the full "New automation" text.

Changes:
- Imported `Link` from next/link and `Plus` from lucide-react in page.tsx
- Changed greeting row div to `flex items-start justify-between gap-4`
- Wrapped h1+p in a `<div>` to keep them grouped on the left
- Added purple-600 Link on the right with responsive label spans
- Added `newAutomation` and `newAutomationShort` keys to en.json and es.json

## Verification

TypeScript (`tsc --noEmit`) passes with EXIT:0 after both tasks.

## Deviations from Plan

**1. [Rule 1 - Bug] Bell import cleanup**
- Found during: Task 1
- Issue: After replacing the static div, `Bell` from lucide-react became unused
- Fix: Removed `Bell` from the lucide-react import list
- Files modified: nav.tsx
- Commit: 61f957f (included in task commit)

**2. [Rule 2 - Missing key] newAutomation key value updated**
- Found during: Task 2
- Issue: en.json had `"newAutomation": "+ New automation"` (with literal + prefix). Since the Plus icon is rendered as a JSX component, the + in the string is redundant
- Fix: Updated value to `"New automation"` in en.json; similarly `"Nueva automatización"` in es.json
- Files modified: en.json, es.json
- Commit: a0715cc (included in task commit)

## Self-Check: PASSED

All created/modified files confirmed on disk. Both task commits (61f957f, a0715cc) confirmed in git log.
