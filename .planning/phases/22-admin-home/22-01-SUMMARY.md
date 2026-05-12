---
phase: 22-admin-home
plan: 01
subsystem: ui
tags: [admin, home, kpi, next-intl, supabase, lucide-react]

# Dependency graph
requires:
  - phase: 19-requests-inbox
    provides: TAB_TO_STATUSES.pending grouping reused by the pending-requests KPI
  - phase: 20-automations-admin
    provides: automations.status='in_setup' as the in-setup KPI source
  - phase: 21-clients-admin
    provides: organizations.deleted_at soft-delete filter pattern + /admin/clients list page
provides:
  - fetchAdminHomeKpis() — single source of truth for the 4 admin-home counters
  - AdminHomeKpiCards — server-friendly 2x2 grid render component
  - admin.home.* i18n namespace (title, subtitle, 4 kpi labels) in EN/ES
  - Live /admin home page replacing the Phase 17 placeholder
affects: [22-02-activity-feed, future-admin-home-iterations]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Parallel HEAD-only count queries via Promise.all for cheap multi-KPI fetchers"
    - "Server-friendly KPI grid pattern: page server-component fetches, passes plain props + i18n labels to a no-state render component"

key-files:
  created:
    - web/src/lib/admin/home-queries.ts
    - web/src/components/admin/home/admin-home-kpi-cards.tsx
    - .planning/phases/22-admin-home/22-01-SUMMARY.md
  modified:
    - web/src/lib/admin/types.ts
    - web/src/app/(admin)/admin/page.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "Reused TAB_TO_STATUSES.pending (pending + in_review + payment_pending + payment_failed) for the pendingRequests KPI so it matches the /admin/requests Pending tab counter exactly"
  - "Both client-related KPI cards (activeClients + signupsThisWeek) route to /admin/clients with no extra params; the list page defaults to created_at DESC, so the most recent signups appear at the top naturally"
  - "Rolling 7-day window for signupsThisWeek (computed in JS, passed as ISO timestamp) — simpler than calendar week and DB-agnostic"
  - "Neutral gray icon background on all 4 cards (no urgency colors) per CONTEXT.md"
  - "AdminHomeKpiCards is server-friendly (no use client) so the whole admin home page stays a server component"

patterns-established:
  - "Admin home KPI fetcher pattern: assertPlatformStaff gate -> Promise.all of HEAD-only count queries -> typed return"
  - "i18n labels passed as a labels prop object (not via getTranslations inside the render component) so the component stays server-friendly"

requirements-completed:
  - HOME-01
  - I18N-01

# Metrics
duration: 3 min
completed: 2026-05-12
---

# Phase 22 Plan 01: Admin Home KPI Grid Summary

**Live 2x2 KPI grid on /admin (pending requests, in-setup automations, active clients, signups-this-week) backed by 4 parallel HEAD-only count queries with EN/ES i18n parity.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-12T19:59:08Z
- **Completed:** 2026-05-12T20:02:29Z
- **Tasks:** 2
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments

- Replaced the Phase 17 placeholder at `/admin` with a real 2x2 KPI grid driven by live DB counts
- Added `fetchAdminHomeKpis` as the single source of truth for the 4 admin-home counters (gated by `assertPlatformStaff`)
- Established the parallel HEAD-only count pattern for cheap multi-KPI fetchers (no row payload transferred)
- Reused `TAB_TO_STATUSES.pending` so the home page's "Pending requests" counter matches the `/admin/requests` Pending tab counter exactly
- Removed the `admin.placeholders.home` block from both locale files (replaced by the real `admin.home` namespace)
- Achieved EN/ES parity for all new strings; Spanish translations are accent-free per admin namespace convention

## Task Commits

Each task was committed atomically:

1. **Task 1: Create admin home queries + types** — `846c089` (feat)
2. **Task 2: Build KPI cards component + wire admin home page + i18n keys** — `408c8b2` (feat)

## KPI Definitions (DB filters)

| KPI | Query |
| --- | --- |
| `pendingRequests` | `automation_requests` where `status IN ('pending','in_review','payment_pending','payment_failed')` AND `deleted_at IS NULL` |
| `inSetupAutomations` | `automations` where `status = 'in_setup'` AND `deleted_at IS NULL` |
| `activeClients` | `organizations` where `deleted_at IS NULL` |
| `signupsThisWeek` | `organizations` where `deleted_at IS NULL` AND `created_at >= now() - INTERVAL '7 days'` (computed JS-side) |

All 4 queries run in parallel via `Promise.all` with `count: 'exact', head: true` — only counts are transferred, never row payloads.

## Card Navigation Targets

| Card | Href |
| --- | --- |
| Pending requests | `/admin/requests?status=pending` |
| Automations in setup | `/admin/automations?status=in_setup` |
| Active clients | `/admin/clients` |
| Signups this week | `/admin/clients` |

Both client-related cards point to the same `/admin/clients` list. The clients list page defaults to `created_at DESC`, so the most-recent signups appear at the top naturally — no extra query param needed for the "this week" card.

## Files Created/Modified

- `web/src/lib/admin/home-queries.ts` (NEW) — `fetchAdminHomeKpis()` with 4 parallel HEAD-count queries and `assertPlatformStaff` gate
- `web/src/lib/admin/types.ts` (MODIFIED) — appended `AdminHomeKpis` interface (4 numeric fields)
- `web/src/components/admin/home/admin-home-kpi-cards.tsx` (NEW) — server-friendly 2x2 grid render component
- `web/src/app/(admin)/admin/page.tsx` (REWRITTEN) — server component that fetches kpis and passes translated labels to `AdminHomeKpiCards`
- `web/messages/en.json` (MODIFIED) — added `admin.home.*` block (title, subtitle, 4 kpi labels); removed `admin.placeholders.home`
- `web/messages/es.json` (MODIFIED) — added `admin.home.*` block (accent-free Spanish); removed `admin.placeholders.home`

## Decisions Made

- **Use `TAB_TO_STATUSES.pending` from `lib/admin/types`** — the `pendingRequests` KPI MUST match the /admin/requests "Pending" tab counter, so we reuse the same exported constant (single source of truth)
- **Both client cards route to `/admin/clients`** — no extra search params for the "signups this week" card; the default `created_at DESC` ordering surfaces recent signups at the top
- **Rolling 7-day window for signups** — `new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()` is computed JS-side and passed as `.gte("created_at", ...)`, simpler and DB-agnostic vs calendar-week math
- **Neutral icon styling** — all 4 cards use `bg-gray-100 dark:bg-gray-700` icon backgrounds (per CONTEXT.md "no urgency colors")
- **Lucide icons by Claude's discretion** — `Inbox` (requests), `Wrench` (in setup), `Users` (active clients), `UserPlus` (signups)
- **AdminHomeKpiCards stays server-friendly** — no `"use client"`, no state, no event handlers; receives a `labels` prop from the parent page rather than calling `getTranslations` itself

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification Results

- `npx tsc --noEmit` exits 0 (full project typecheck clean)
- `npx eslint` on touched files exits 0
- Both `messages/en.json` and `messages/es.json` parse as valid JSON
- `admin.placeholders.home` removed from both locale files (verified — placeholders block now contains only `catalog`)
- `admin.home.*` keys exist with EN/ES parity (title, subtitle, kpis.pendingRequests, kpis.inSetupAutomations, kpis.activeClients, kpis.signupsThisWeek)
- All `must_haves.artifacts` paths exist on disk

## Next Phase Readiness

- Plan 22-02 (activity feed + quick-link cards) can land on top of the existing `/admin/page.tsx`. The page is already structured as `space-y-6` with a single `AdminHomeKpiCards` child — Plan 22-02 just adds sibling sections.
- Plan 22-02's i18n parity check should confirm that `admin.placeholders.home` remains absent (it was removed here, not in 22-02).
- The `AdminHomeKpis` interface in `lib/admin/types.ts` is stable; 22-02 should NOT mutate it (its activity feed and quick-link data belong to separate types).

## Self-Check: PASSED

- `web/src/lib/admin/home-queries.ts` — exists on disk
- `web/src/components/admin/home/admin-home-kpi-cards.tsx` — exists on disk
- `web/src/lib/admin/types.ts` — `AdminHomeKpis` interface present
- `web/src/app/(admin)/admin/page.tsx` — imports `fetchAdminHomeKpis` and renders `AdminHomeKpiCards`
- `web/messages/en.json` and `web/messages/es.json` — both contain `admin.home.*` keys, neither contains `admin.placeholders.home`
- Commit `846c089` (Task 1) — present in `git log --all`
- Commit `408c8b2` (Task 2) — present in `git log --all`

---
*Phase: 22-admin-home*
*Completed: 2026-05-12*
