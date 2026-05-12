---
phase: 22-admin-home
plan: 02
subsystem: ui
tags: [admin, home, activity-feed, quick-links, next-intl, supabase, lucide-react]

# Dependency graph
requires:
  - phase: 22-admin-home
    plan: 01
    provides: fetchAdminHomeKpis + AdminHomeKpiCards + admin.home.* i18n namespace + /admin page scaffold
  - phase: 19-requests-inbox
    provides: automation_requests row shape + /admin/requests/[id] detail route
  - phase: 20-automations-admin
    provides: automations row shape + /admin/automations/[id] detail route
  - phase: 21-clients-admin
    provides: organizations row shape + /admin/clients/[id] detail route
provides:
  - fetchAdminHomeActivity() — merged activity feed across 3 source tables
  - AdminHomeActivityEntry + AdminHomeActivityEventType types
  - AdminHomeQuickLinks — 2 banner-style cards between KPI grid and feed
  - AdminHomeActivityFeed — flat chronological list with event-typed icons + relative timestamps
  - admin.home.quickLinks.* + admin.home.feed.* i18n keys (EN/ES parity)
affects: [future-admin-home-iterations, future-status-transition-feed-events]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3-source merged feed via Promise.all + JS sort + slice (vs SQL UNION ALL) — avoids needing a DB view, keeps the per-source query simple, supports easy addition/removal of event types"
    - "Server-friendly render component receives translations as a labels prop object + a bound t function for relative-time util — no `useTranslations` or `getTranslations` calls inside the component"
    - "t.raw for ICU-template-with-placeholders fields — keeps {orgName} / {requestTitle} / {automationName} as literal strings that the component substitutes (avoids next-intl ICU formatter interfering)"
    - "TimeT adapter: time={(k) => tCommon(k)} coerces the next-intl t function to the plain `(key: string) => string` shape that lib/utils/time.ts expects"

key-files:
  created:
    - web/src/components/admin/home/admin-home-quick-links.tsx
    - web/src/components/admin/home/admin-home-activity-feed.tsx
    - .planning/phases/22-admin-home/22-02-SUMMARY.md
  modified:
    - web/src/lib/admin/home-queries.ts
    - web/src/lib/admin/types.ts
    - web/src/app/(admin)/admin/page.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "automation_activated event is approximated as `status='active' ORDER BY updated_at DESC` — Phase 22 explicitly defers an audit log, so updated_at is the closest proxy to 'transitioned to active'; false positives (re-saves) are acceptable per CONTEXT.md"
  - "Pull 20 per source (60 rows total), merge in JS, sort by occurredAt DESC, slice to top 20 — preserves global top-20 even when one source dominates (e.g. 20 fresh signups don't push out older requests/automations)"
  - "Used 3 parallel SELECTs + JS merge instead of a SQL UNION ALL view — keeps each per-source query trivial and lets us add/remove event types without a migration"
  - "Quick-link badge values are reused from the same kpis object that AdminHomeKpiCards consumes — no second query for the badges (single source of truth)"
  - "Badge hidden when count is 0 to avoid '0' looking like a perpetual loading indicator (CONTEXT.md: '0' is a valid state, not an empty state)"
  - "Used t.raw for feed event templates so next-intl doesn't try to ICU-format the {orgName} / {requestTitle} / {automationName} placeholders before our manual substitution"
  - "Quick-link cards use color accents (orange/blue) on icon + badge per CONTEXT.md — KPIs stay neutral, but quick-links justify color via the urgency badge"
  - "Activity feed icons by event type: Inbox (orange, requests, matches sidebar), Zap (emerald, automation activated — energy/power metaphor), UserPlus (blue, new signup)"

patterns-established:
  - "Multi-source activity feed pattern: per-source LIMIT 20 -> JS merge -> sort -> slice; reuse across future admin/dashboard feeds"
  - "Server-friendly render component with translator passthrough: page calls getTranslations, passes a labels-object prop + a bound t function so the child needs no i18n imports"
  - "t.raw + manual string-replace substitution pattern for templates with semantic placeholders (avoids ICU interfering with non-numeric/non-plural substitutions)"

requirements-completed:
  - HOME-02
  - HOME-03
  - I18N-01

# Metrics
duration: 4 min
completed: 2026-05-12
---

# Phase 22 Plan 02: Admin Home Activity Feed + Quick Links Summary

**Added the remaining two sections of the admin home page: 2 banner-style quick-link cards (Requests inbox + Automations in setup) with pending-count badges, and a 15-20-row activity feed of the 3 highest-signal event types (request_created / automation_activated / new_signup), backed by 3 parallel SELECTs merged JS-side, with full EN/ES i18n parity.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-12T20:07:32Z
- **Completed:** 2026-05-12T20:11:27Z
- **Tasks:** 3
- **Files modified:** 7 (2 created, 5 modified)

## Accomplishments

- Extended `fetchAdminHomeKpis` with a sibling `fetchAdminHomeActivity` query (gated by the same `assertPlatformStaff` check) — 3 parallel SELECTs against `automation_requests`, `automations` (status='active'), and `organizations`, merged and sorted JS-side
- Added `AdminHomeActivityEventType` union + `AdminHomeActivityEntry` interface to the admin types module — the server pre-computes the `href` and per-type labels so the render component is pure
- Built `AdminHomeQuickLinks` — 2 banner-style cards positioned between the KPI grid and the feed, with conditional colored badges (orange for requests, blue for automations) that hide when the count is 0
- Built `AdminHomeActivityFeed` — flat chronological list with event-typed icons (orange Inbox / emerald Zap / blue UserPlus), template-substituted event text, and relative timestamps via the existing `formatRelativeTime` util from `lib/utils/time.ts`
- Wired `/admin/page.tsx` to fetch both queries in parallel via `Promise.all` and render the 3 sections in the correct top-down order (KPI grid -> QuickLinks -> ActivityFeed)
- Added the new i18n keys (`admin.home.quickLinks.*` + `admin.home.feed.*`) to both `en.json` and `es.json` with verified parity (accent-free Spanish per admin namespace convention)

## Task Commits

Each task was committed atomically:

1. **Task 1: Activity feed query + types** — `5f7d6a3` (feat)
2. **Task 2: QuickLinks + ActivityFeed components** — `496384d` (feat)
3. **Task 3: Page wiring + EN/ES i18n keys** — `8451ac1` (feat)

## Feed Source-of-Truth Mapping

| Event type | Source table | Filter | Order by | href |
| --- | --- | --- | --- | --- |
| `request_created` | `automation_requests` | `deleted_at IS NULL` | `created_at DESC` LIMIT 20 | `/admin/requests/[id]` |
| `automation_activated` | `automations` | `status='active' AND deleted_at IS NULL` | `updated_at DESC` LIMIT 20 | `/admin/automations/[id]` |
| `new_signup` | `organizations` | `deleted_at IS NULL` | `created_at DESC` LIMIT 20 | `/admin/clients/[id]` |

After the 3 parallel SELECTs resolve, the results are merged into a single array, sorted by `occurredAt DESC`, and sliced to 20 entries.

## Quick-Link Cards

| Card | Icon | Badge color | Badge value | Href |
| --- | --- | --- | --- | --- |
| Requests inbox | `Inbox` (orange) | orange-100 / orange-700 | `kpis.pendingRequests` | `/admin/requests?status=pending` |
| Automations in setup | `Wrench` (blue) | blue-100 / blue-700 | `kpis.inSetupAutomations` | `/admin/automations?status=in_setup` |

Badge value is reused from the same `kpis` object that `AdminHomeKpiCards` consumes — no duplicate query.

## Files Created/Modified

- `web/src/lib/admin/home-queries.ts` (MODIFIED) — appended `fetchAdminHomeActivity` (3 parallel SELECTs + JS merge/sort/slice); added `ACTIVITY_FEED_LIMIT` and `PER_SOURCE_LIMIT` constants
- `web/src/lib/admin/types.ts` (MODIFIED) — appended `AdminHomeActivityEventType` union and `AdminHomeActivityEntry` interface
- `web/src/components/admin/home/admin-home-quick-links.tsx` (NEW) — `AdminHomeQuickLinks` 2-card banner component with conditional badges
- `web/src/components/admin/home/admin-home-activity-feed.tsx` (NEW) — `AdminHomeActivityFeed` flat-list component with event-typed icons + template substitution + relative time
- `web/src/app/(admin)/admin/page.tsx` (REWRITTEN) — wires KPIs + QuickLinks + ActivityFeed top-down, fetches both queries in parallel via `Promise.all`
- `web/messages/en.json` (MODIFIED) — appended `admin.home.quickLinks.*` + `admin.home.feed.*`
- `web/messages/es.json` (MODIFIED) — same keys with accent-free Spanish

## Decisions Made

- **`automation_activated` proxy:** Phase 22 explicitly defers an audit log. The closest proxy to "when did this automation become active?" is `WHERE status='active' ORDER BY updated_at DESC`. False positives (an active automation re-saved for unrelated reasons) are acceptable per CONTEXT.md — the activity feed is "signal, not history."
- **20-per-source + global merge strategy:** Pulling 20 from each source guarantees that the global top-20 is preserved even when one source dominates (e.g. a fresh batch of 20 signups in one day still leaves room for older requests and automations to surface). A SQL UNION ALL view was considered and rejected — the JS merge keeps each per-source query trivial and lets us add/remove event types without a migration.
- **`t.raw` + manual substitution:** Feed event templates contain `{orgName}` / `{requestTitle}` / `{automationName}` placeholders. Using `t()` would invoke next-intl's ICU formatter, which can interfere with non-numeric/non-plural placeholders. Using `t.raw` returns the literal template string and lets `renderEventText` do plain string replacement.
- **Empty-state behavior:** Badge is hidden entirely when count is 0 (no "0" rendered, avoids looking like a loading state). The activity feed renders an "No recent activity" message in place of the row list when entries is empty.
- **`TimeT` adapter for next-intl `t`:** The `lib/utils/time.ts` `formatRelativeTime` util declares its translator as `(key: string) => string`. The page wraps the next-intl `tCommon` with `time={(k) => tCommon(k)}` to coerce the variance (next-intl's `t` accepts more overloads but is structurally compatible).
- **Quick-link color accents:** Per CONTEXT.md, KPIs stay neutral (gray icon background, no urgency colors), but quick-links justify color via the badge: "the number is the urgency signal." Used orange for requests (matches the request_created feed icon) and blue for automations.
- **Icon vocabulary:** `Inbox` for requests (matches both the sidebar nav and the request_created feed icon for visual continuity), `Zap` for automation_activated (energy/power metaphor), `UserPlus` for new_signup. All from `lucide-react` — no new dependencies.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- `npm run build` (production Next.js build) fails to reach `fonts.googleapis.com` in this sandbox environment due to TLS errors from `next/font` trying to fetch Geist/Geist Mono — this is an environment/network limitation, not a code issue. `npx tsc --noEmit` passes cleanly (no type errors) and `npx eslint` passes cleanly on all 5 touched files. The build will succeed in any environment that has outbound TLS to Google Fonts (Vercel, dev workstations with normal network access).

## User Setup Required

None — no external service configuration required.

## Verification Results

- `npx tsc --noEmit` exits 0 (full project typecheck clean)
- `npx eslint` on the 5 touched files (`src/lib/admin/home-queries.ts`, `src/lib/admin/types.ts`, `src/components/admin/home/admin-home-quick-links.tsx`, `src/components/admin/home/admin-home-activity-feed.tsx`, `src/app/(admin)/admin/page.tsx`) exits 0 — no warnings or errors
- EN/ES parity script for `admin.home.*` exits 0 with empty `EN only: []` and `ES only: []` arrays
- Both `messages/en.json` and `messages/es.json` parse as valid JSON
- All `must_haves.artifacts` paths exist on disk with the prescribed exports/contents
- Pre-existing lint errors in unrelated files (auth, dashboard) are out-of-scope per CLAUDE.md scope boundary — they are tech debt logged separately, not introduced by this plan

## Next Phase Readiness

- Phase 22 verification (`22-VERIFICATION.md`) can run now — both plans are complete on `feature/phase-22-admin-home`
- After verification passes, the branch can be merged to `main` per the CLAUDE.md branching policy (`git checkout main && git merge --no-ff feature/phase-22-admin-home`)
- Future iterations of the admin home (status_transition events in the feed, deeper analytics, etc.) can build on top of `fetchAdminHomeActivity` by adding new branches to the `Promise.all` block and new types to the `AdminHomeActivityEventType` union — no schema changes required

## Self-Check: PASSED

- `web/src/components/admin/home/admin-home-quick-links.tsx` — exists on disk
- `web/src/components/admin/home/admin-home-activity-feed.tsx` — exists on disk
- `web/src/lib/admin/home-queries.ts` — contains `export async function fetchAdminHomeActivity`
- `web/src/lib/admin/types.ts` — contains `AdminHomeActivityEventType` and `AdminHomeActivityEntry`
- `web/src/app/(admin)/admin/page.tsx` — imports both fetchers and renders all 3 sections
- `web/messages/en.json` — contains `admin.home.quickLinks.*` and `admin.home.feed.*`
- `web/messages/es.json` — contains `admin.home.quickLinks.*` and `admin.home.feed.*`
- Commit `5f7d6a3` (Task 1) — present in `git log`
- Commit `496384d` (Task 2) — present in `git log`
- Commit `8451ac1` (Task 3) — present in `git log`

---
*Phase: 22-admin-home*
*Completed: 2026-05-12*
