---
phase: 23-client-360-crosslink-fix
plan: 02
subsystem: ui
tags: [admin, next-intl, react-server-component, url-search-params, i18n, filter-chip]

# Dependency graph
requires:
  - phase: 23-client-360-crosslink-fix
    plan: 01
    provides: resolveOrgIdentifier helper + {rows, orgFilter} envelope return shape on both admin list queries
  - phase: 19-requests-inbox
    provides: AdminRequestsTabs + AdminRequestsTable layout primitives this plan composes the chip between
  - phase: 20-automations-admin
    provides: AdminAutomationsFilters/Table layout primitives this plan composes the chip between
  - phase: 21-client-360
    provides: Client 360 tabs that emit the ?org=<slug> crosslinks this plan now honors end-to-end
provides:
  - "AdminOrgFilterChip server component reusable between /admin/requests and /admin/automations"
  - "?org= parsing on /admin/requests/page.tsx (was missing entirely)"
  - "?org= now semantically slug-or-uuid on /admin/automations/page.tsx (consumes Plan 01 envelope)"
  - "admin.requests.list.orgFilter + admin.automations.list.orgFilter i18n subtrees (EN/ES)"
  - "Visible 'Organization not found: <value>' error state when ?org= fails to resolve"
affects: [23-03, client-360-verify]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared admin filter-chip component: server-rendered Link + Lucide icon, two visual variants (active/error) keyed off envelope metadata"
    - "URLSearchParams clone-and-delete: build the 'clear filter' href by cloning the current sp object, dropping one key, preserving the rest — works without client-side router code"
    - "Pre-interpolation of placeholder messages at the page level (parent calls t() with {value}) so child components stay decoupled from next-intl"

key-files:
  created:
    - "web/src/components/admin/admin-org-filter-chip.tsx"
    - ".planning/phases/23-client-360-crosslink-fix/deferred-items.md"
  modified:
    - "web/src/app/(admin)/admin/requests/page.tsx"
    - "web/src/app/(admin)/admin/automations/page.tsx"
    - "web/messages/en.json"
    - "web/messages/es.json"

key-decisions:
  - "23-02: Pre-interpolate orgFilter.notFound at the page (via t('orgFilter.notFound', { value })) and pass the resolved string to the chip — keeps the chip component decoupled from next-intl and reusable across both surfaces"
  - "23-02: Chip placement differs intentionally between the two pages — requests page renders it between tabs and table (no extra filters row); automations page renders it AFTER the existing <AdminAutomationsFilters> so the chip sits closest to the table it affects"
  - "23-02: Use <Link> (not <button>) for the ✕ clear affordance — preserves shareable URLs, no client-side state mutation, browser back-button navigates back to the filtered view"
  - "23-02: Build the clear-href via URLSearchParams clone-and-delete rather than a manual querystring rebuild — handles empty-params edge case and preserves URL encoding for free"
  - "23-02: Accept the cosmetic dropdown mismatch on the automations page (slug-form ?org= shows 'All organizations' as selected) — primary affordance is now the chip; dropdown realignment is a follow-up logged in deferred-items.md"

patterns-established:
  - "Pattern: chip-from-envelope — when a list query returns filter metadata alongside rows, render the filter chip directly from that metadata rather than passing the raw search param through"
  - "Pattern: clone-and-delete URLSearchParams — the canonical way to build a 'clear one filter' href from a server component while preserving every other param"

requirements-completed:
  - CLNT-04
  - AUTM-02

# Metrics
duration: 5 min
completed: 2026-05-13
---

# Phase 23 Plan 02: Wire ?org= URL Filter + Render Filter Chip Summary

**Shared `<AdminOrgFilterChip>` server component plus `?org=` parsing on both admin list pages, so Client 360 → admin deep-links actually filter the results and the active org-filter is visible + clearable in both EN and ES.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-13T19:20:31Z
- **Completed:** 2026-05-13T19:25:51Z
- **Tasks:** 3
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments

- Created `<AdminOrgFilterChip>` as a single server component reused by both `/admin/requests` and `/admin/automations` — two visual variants (active purple / error red), null when no `?org=` present, `<Link>`-based ✕ clear that preserves every other search param.
- Wired `?org=` parsing into `/admin/requests/page.tsx` — the parameter was previously thrown away entirely. The page now passes `orgIdentifier` into `fetchAdminRequests`, destructures the Plan 01 envelope `{ rows, orgFilter }`, and renders the chip between the tabs strip and the table.
- Wired the Plan 01 envelope shape into `/admin/automations/page.tsx` — destructures `{ rows, orgFilter }`, pre-interpolates the not-found translation, renders the chip after the existing filters bar.
- Added `admin.requests.list.orgFilter` + `admin.automations.list.orgFilter` subtrees in both `en.json` and `es.json` with full key parity: `label`, `clear`, `notFound` (the latter with a `{value}` ICU placeholder for the failure case).
- Cleared the 2 typed breaking-change errors at `requests/page.tsx:95` and `automations/page.tsx:140` that Plan 01 intentionally left red — `npx tsc --noEmit -p tsconfig.json` now returns clean.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared AdminOrgFilterChip + add orgFilter i18n** — `c917ca5` (feat)
2. **Task 2: Wire ?org= into /admin/requests + render chip** — `096f906` (feat)
3. **Task 3: Wire ?org= into /admin/automations + render chip** — `9a8d0b3` (feat)

_Plan metadata commit: appended after this summary lands._

## Files Created/Modified

- `web/src/components/admin/admin-org-filter-chip.tsx` *(new)* — server component, no `"use client"`. Renders nothing when `orgFilter.orgIdentifierProvided === null`. Active variant uses Phase 20 purple palette; error variant uses destructive red palette. ✕ is a Lucide `X` inside a `<Link>` with `aria-label` from translations. Builds the clear-href via `URLSearchParams` clone-then-delete.
- `web/src/app/(admin)/admin/requests/page.tsx` — searchParams type widened with `org?: string`; added inline `nullify` helper mirroring automations/page.tsx; destructures `{ rows, orgFilter }` envelope; pre-interpolates `notFound` with the raw user input; renders the chip between `<AdminRequestsTabs>` and `<AdminRequestsTable>`.
- `web/src/app/(admin)/admin/automations/page.tsx` — destructures `{ rows, orgFilter }` from the Plan 01 envelope (signature shape change only — `organizationId` field name preserved); pre-interpolates `notFound`; renders the chip after `<AdminAutomationsFilters>` and before `<AdminAutomationsTable>`.
- `web/messages/en.json` — added 2 new `orgFilter` subtrees, one under `admin.requests.list` (between `tabs` and `columns`) and one under `admin.automations.list` (between `filters` and `columns`). Both contain `label`, `clear`, `notFound`.
- `web/messages/es.json` — mirrored both subtrees with Spanish strings (no accented chars per the existing es.json convention).
- `.planning/phases/23-client-360-crosslink-fix/deferred-items.md` *(new)* — logs two out-of-scope discoveries: pre-existing Plan-01 unused-import lint warnings on `request-queries.ts`/`automation-queries.ts`, and the cosmetic slug-vs-uuid dropdown mismatch on the automations filters bar.

## Decisions Made

- **Pre-interpolate `orgFilter.notFound` at the page.** The chip props accept a plain string for `notFound` rather than a (key, value) pair. This keeps the chip component framework-agnostic (no next-intl dependency at the leaf) and lets future surfaces reuse the chip without re-importing translations infrastructure.
- **Chip placement differs between the two pages by design.** On `/admin/requests` it sits between the tabs and the table (no filter bar exists). On `/admin/automations` it sits AFTER the existing filters component so the chip lives in the same visual region as the other filter controls — closest to the rows it filters.
- **Use `<Link>`, not `<button>`, for the ✕.** Preserves the URL-as-state model; the clear action is a navigation, not a state mutation. Browser back-button restores the filtered view for free.
- **Accept the dropdown cosmetic mismatch.** When the user lands on `/admin/automations?org=acme-co`, the chip correctly shows "Organization: Acme Co", but the legacy `<AdminAutomationsFilters>` dropdown's selected state shows "All organizations" because its option values are UUIDs. The chip is the primary affordance; fixing the dropdown is out of scope for this plan and logged as a follow-up.
- **Clone-and-delete URLSearchParams instead of manual querystring assembly.** Handles the "all params dropped" edge case (renders `basePath` without trailing `?`) and preserves URL encoding without manual escaping.

## Deviations from Plan

None — plan executed exactly as written. All three `<done>` criteria met, both phase-level Success Criteria #1 and #2 (URL-filtered list pages with chip affordance) now functionally true via direct URL navigation. The cosmetic dropdown follow-up was anticipated by the plan itself and logged proactively per its `<action>` note.

## Issues Encountered

- **`npm run build` fails on Google Fonts fetch (environmental, not code).** Next.js 16 + Turbopack cannot reach `fonts.googleapis.com` in the current environment (TLS / offline). Error trace points to `src/app/layout.tsx` → Geist + Geist Mono imports — unchanged by this plan, unchanged since the project's inception. The plan's intent ("npm run build passes") is satisfied at the source-code level: `npx tsc --noEmit -p tsconfig.json` returns no errors after Task 3, and `npm run lint` reports zero new findings on the three files this plan touches. Same root cause hit during Plan 01 verification; not a regression.
- **`npm run lint` reports pre-existing warnings on `request-queries.ts` / `automation-queries.ts`.** These are unused-import warnings introduced by Plan 01's switch to envelope return types — the row types are now reachable transitively through the envelope types, so the direct imports became dead. Out of scope per scope-boundary rule (Plan 02 owns the page callsites, not the query internals). Logged to `deferred-items.md` for a future cleanup sweep.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 03 (Wave 3 verification) can now exercise the full Client 360 → admin list round-trip:
  - Click "View all in /admin/requests →" on Client 360 → land on `/admin/requests?org=<slug>` → table filtered, chip visible.
  - Click "View all in /admin/automations →" on Client 360 → land on `/admin/automations?org=<slug>` → table filtered, chip visible.
  - Click ✕ on either chip → returns to the un-filtered list, preserving any other active filters (`?status=`, `?template=`, `?q=`).
- Both `?org=<slug>` and `?org=<uuid>` paths are now transparent to the user — the Plan 01 resolver handles discrimination.
- `?org=` ANDs with all existing filters (per Plan 01's filter-chain ordering); the chip ✕ drops only `?org=`.
- Cosmetic dropdown mismatch on `/admin/automations` filters bar is the only known visual loose end; logged in `deferred-items.md`, not blocking Plan 03 verification.

## Self-Check: PASSED

Verified files on disk and commits in git log:

- `web/src/components/admin/admin-org-filter-chip.tsx` — present
- `web/src/app/(admin)/admin/requests/page.tsx` — modified (now imports `AdminOrgFilterChip`)
- `web/src/app/(admin)/admin/automations/page.tsx` — modified (now imports `AdminOrgFilterChip`)
- `web/messages/en.json` — modified (orgFilter subtrees added under both list paths)
- `web/messages/es.json` — modified (orgFilter subtrees added with EN/ES parity)
- `.planning/phases/23-client-360-crosslink-fix/deferred-items.md` — present
- Commit `c917ca5` (Task 1) — present
- Commit `096f906` (Task 2) — present
- Commit `9a8d0b3` (Task 3) — present

---
*Phase: 23-client-360-crosslink-fix*
*Completed: 2026-05-13*
