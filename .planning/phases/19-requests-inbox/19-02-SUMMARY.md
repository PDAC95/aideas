---
phase: 19-requests-inbox
plan: 02
subsystem: admin-ui
tags: [next.js, react, server-components, client-components, i18n, admin, tabs, url-state]

requires:
  - phase: 19-requests-inbox
    plan: 01
    provides: fetchAdminRequests, fetchAdminRequestStatusCounts, AdminRequestRow, AdminRequestStatus, AdminRequestStatusCounts
  - phase: 17-admin-foundation
    provides: (admin) route group, AdminShell layout, /admin/requests placeholder route

provides:
  - /admin/requests real list page (replaces Phase 17 placeholder body)
  - AdminRequestsTabs client component with ?status= URL state sync
  - AdminRequestsTable server component (5-column table per CONTEXT.md)
  - admin.requests.list i18n namespace (18 keys per locale, full EN/ES parity)

affects: [19-03-detail-and-actions]

tech-stack:
  added: []
  patterns:
    - "Server component owns translation resolution; passes plain object as `translations` prop to mixed server+client subtree (Phase 18 catalog pattern reused verbatim)"
    - "Tab labels containing {count} placeholder are passed via t.raw() so the client component can substitute live counts without an extra translation call per render"
    - "Default-tab canonicalization: dropping the ?status=pending param keeps the URL bare on the canonical default and produces shareable/refresh-stable URLs"
    - "Per-tab empty-state copy resolved server-side via dynamic empty.${status} key — the table component only sees the single string that applies"
    - "Status-based ascending/descending order is enforced server-side in fetchAdminRequests, not at the UI; the page never sorts client-side"

key-files:
  created:
    - "web/src/components/admin/requests/admin-requests-tabs.tsx"
    - "web/src/components/admin/requests/admin-requests-table.tsx"
  modified:
    - "web/src/app/(admin)/admin/requests/page.tsx"
    - "web/messages/en.json"
    - "web/messages/es.json"

key-decisions:
  - "AdminRequestsTabs is the only client component on the page; the table itself is server-rendered because rows have no client-side state (just <Link> elements)"
  - "Status badge palette is amber/green/red — amber on Pending signals 'waiting' more clearly than CONTEXT.md's optional blue suggestion"
  - "coerceStatus() silently falls back to pending on garbage ?status= input; no 404, no error toast (the canonical default is the safe landing)"
  - "admin.placeholders.requests keys preserved deliberately; Plan 19-03 removes them when the detail page replaces the last placeholder consumer"
  - "Tab labels use t.raw() to keep the {count} placeholder unresolved server-side; client substitutes it from live counts to avoid stale-after-action numbers"

requirements-completed: [REQS-01, I18N-01]

duration: 5 min
completed: 2026-05-07
---

# Phase 19 Plan 02: Requests Inbox List Page Summary

**Replaces the Phase 17 placeholder at /admin/requests with the real inbox: 3 status tabs (Pending default, with live counters), a 5-column table (FIFO ordering for pending, DESC for the others), and full EN/ES i18n. Closes the entire surface of REQS-01 except for the click target itself, which 19-03 ships.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-07T13:30:50Z
- **Completed:** 2026-05-07T13:35:37Z
- **Tasks:** 3
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments

- **i18n** — `admin.requests.list` namespace with 18 leaf keys per locale: title, subtitle, 3 tabs (with `{count}` placeholder), 5 column headers, 3 status badges, 3 per-tab empty states, and `noTemplate` / `noRequirements` fallback labels. Parity verified by recursive flattening script (zero missing keys in either direction). Existing `admin.placeholders.requests` kept untouched per the plan.
- **Tabs component** (`admin-requests-tabs.tsx`) — `"use client"`, owns the `?status=` URL state via `useRouter` + `useSearchParams` + `usePathname`. Three `<button role="tab">`s with `aria-selected`, live counts substituted at render via `label.replace("{count}", String(counts[status]))`. `useTransition` keeps the click responsive while the server re-renders. Pending click drops the param entirely (canonical default), Approved/Rejected set it.
- **Table component** (`admin-requests-table.tsx`) — server component. 5 columns: Customer (linked to detail), Template (or `noTemplate` label when `template_id` is null), Status (badge), Custom requirements (preview, linked to detail), Created (locale-formatted date). Status badges: amber for pending, green for approved, red for rejected. Empty state is a single dashed-border card with the per-tab copy passed in by the parent.
- **Page** (`page.tsx`) — server component, no `"use client"`. Reads `searchParams.status`, coerces invalid input to `pending`, runs `Promise.all` over `fetchAdminRequests`, `fetchAdminRequestStatusCounts`, and `getTranslations("admin.requests.list")`. Pre-resolves every translation into a plain `translations` object (tabs as raw `{count}` strings, columns/badges via `t()`, per-tab empty state via `t(\`empty.${status}\`)`). Renders header + tabs + table.
- **Build verified** — `npx tsc --noEmit` exit 0, scoped lint exit 0 against the three touched files, and `npm run build` (with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` to dodge the same sandbox-only Google Fonts TLS issue documented in 19-01) emits `/admin/requests` as a dynamic server-rendered route (exit 0).

## Task Commits

1. **Task 1: Add admin.requests.list i18n namespace (EN+ES)** — `2132bd2` (feat)
2. **Task 2: Build AdminRequestsTabs and AdminRequestsTable components** — `587693b` (feat)
3. **Task 3: Replace /admin/requests placeholder with real list page** — `c1ed621` (feat)

**Plan metadata:** _(committed after this summary)_

## Files Created/Modified

- `web/src/components/admin/requests/admin-requests-tabs.tsx` — Client tabs with URL-synced active state.
- `web/src/components/admin/requests/admin-requests-table.tsx` — Server-rendered 5-column table; rows are `<Link>`s to `/admin/requests/[id]` (target ships in 19-03).
- `web/src/app/(admin)/admin/requests/page.tsx` — Server page: validates `?status=`, fetches rows + counts + translations in parallel, renders header + tabs + table.
- `web/messages/en.json` — Adds `admin.requests.list.*` (18 leaf keys).
- `web/messages/es.json` — Adds `admin.requests.list.*` (18 leaf keys, accent-free per existing `admin.*` Spanish convention).

## Decisions Made

- **Tabs are client; table is server.** The table has no client state — every interactive surface in a row is a `<Link>`, which is fine in a server component. Only the active-tab decision needs `useRouter` / `useSearchParams`, so only the tabs row pays the client-bundle cost. Pattern reusable for any URL-state-driven filter on top of a static table.
- **Default-tab canonicalization.** When the user clicks Pending we `next.delete("status")` rather than `next.set("status", "pending")`. Refreshing on Pending stays bare (`/admin/requests`); refreshing on Approved keeps `?status=approved`. Shareable URLs are minimal and the canonical default never accumulates a redundant query string.
- **`t.raw()` for `{count}` tab labels.** The placeholder is substituted client-side at render with the live counts so the labels stay accurate after any future client-side action. Reading via `t("tabs.pending", { count })` server-side would freeze the value at request time and skip the substitution layer entirely; the raw-string-then-replace path keeps the substitution close to the data it depends on.
- **`coerceStatus()` instead of throwing on invalid input.** A user fat-fingering `?status=garbage` lands silently on Pending. The validity check is `(VALID_STATUSES as string[]).includes(raw)`. No 404, no error toast — the canonical default is the right landing for any unknown value.
- **Status badges use amber/green/red** (CONTEXT.md "Claude's Discretion"). Amber on Pending reads as "waiting" more clearly than blue, and the green/red pair on Approved/Rejected matches universal terminal-state semantics. Tailwind `bg-amber-100/text-amber-700` (light) + `bg-amber-900/40 text-amber-200` (dark) follows the existing admin-UI palette pattern.
- **`admin.placeholders.requests` preserved deliberately.** Removing those keys now would break the Phase 17-03 fallback for any environment that hadn't yet pulled this plan's commits. Plan 19-03 (which fully replaces the last placeholder consumer with the detail page) is the right place for that cleanup.

## Deviations from Plan

None - plan executed exactly as written.

The plan's verify command for Task 3 included `npm run build` which fails in this sandbox due to a Google Fonts TLS issue (already documented in 19-01-SUMMARY.md as out-of-scope environmental). I confirmed the build succeeds when the same workaround flag (`NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`) is applied — `/admin/requests` shows up in the route manifest as expected.

## Issues Encountered

- **`npm run lint` reports 103 pre-existing errors and 1587 warnings** in unrelated files (signup forms, dashboard queries, nav, etc.). These predate this plan and are out of scope per the executor's scope-boundary rule. Scoped lint against the three touched files exits 0, and `npx tsc --noEmit` exits 0 across the project. No new lint errors introduced.
- **`npm run build` fails on Google Fonts TLS in the bare sandbox.** Same issue 19-01 documented. With `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` the build exits 0 and emits `/admin/requests` as a dynamic route. Not a code defect; an environmental constraint to be aware of when running CI.

## User Setup Required

None — no external service or env var changes. Manual UAT step from the plan: visit `/admin/requests` while signed in as a platform-staff account; the Pending tab should show the seed pending request, switching to Approved should update the URL to `?status=approved`, and Rejected should render either rows or the localized empty-state copy.

## Next Phase Readiness

- **Plan 19-03** can wire `/admin/requests/[id]` and the approve/reject server actions. The list-page row links to that route are already in place — once 19-03 ships, every row's Customer cell and Custom-Requirements cell becomes a live navigation. The `admin.placeholders.requests` keys can be deleted in the same commit that removes the last reference (the page was the only consumer; verify before deletion).
- **Tab counters update on navigation** because the page is dynamic (no `force-static`); a refresh after an approve/reject from 19-03 will pick up the new count automatically with no extra cache-bust work needed.
- **The `templateDisplayName` fallback chain** — `translation -> slug -> title` — already runs server-side in `fetchAdminRequests`, so 19-03 can rely on `row.templateDisplayName` always being a usable string in the detail page if it copies the same shape.

---
*Phase: 19-requests-inbox*
*Completed: 2026-05-07*

## Self-Check: PASSED

All claimed artifacts verified on disk:
- `web/src/components/admin/requests/admin-requests-tabs.tsx` — FOUND
- `web/src/components/admin/requests/admin-requests-table.tsx` — FOUND
- `web/src/app/(admin)/admin/requests/page.tsx` — FOUND
- `web/messages/en.json` — FOUND
- `web/messages/es.json` — FOUND
- `.planning/phases/19-requests-inbox/19-02-SUMMARY.md` — FOUND

All claimed commits verified in `git log`:
- `2132bd2` feat(19-02): add admin.requests.list i18n namespace (EN+ES) — FOUND
- `587693b` feat(19-02): add AdminRequestsTabs and AdminRequestsTable components — FOUND
- `c1ed621` feat(19-02): replace /admin/requests placeholder with real list page — FOUND

Verification commands run during execution (all passed):
- i18n parity script (recursive flatten, both directions, 18 required leaf keys) — exit 0
- Route static check (page imports fetchAdminRequests, fetchAdminRequestStatusCounts, AdminRequestsTabs, AdminRequestsTable, coerceStatus; no `admin.placeholders.requests` reference) — OK
- `npx tsc --noEmit -p .` from `web/` — exit 0
- Scoped `npx eslint` against the three touched files — exit 0
- `npm run build` (with `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`) — exit 0, `/admin/requests` emitted as dynamic server-rendered route
