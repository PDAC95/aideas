---
phase: 21-clients-admin
plan: 01
subsystem: admin
tags: [admin, clients, supabase, rls, next-intl, server-components, pagination, debounce]

requires:
  - phase: 17-admin-foundation
    provides: is_platform_staff helper, admin RLS policies, /admin shell
  - phase: 19-requests-inbox
    provides: ACTIVE_LIKE_STATUSES set, automation status semantics
  - phase: 20-automations-admin
    provides: defensive ILIKE %_ escape pattern, two-round-trip + bucket-in-JS pattern, render-time setState URL sync pattern
provides:
  - organization_notes table with admin-only RLS policies (foundation for 21-03 notes CRUD)
  - fetchAdminClients(filters) returning rows + total count + page metadata, gated by assertPlatformStaff
  - /admin/clients list page replacing Phase 17 placeholder
  - admin.clients.list i18n namespace with EN/ES parity
affects: [21-02, 21-03]

tech-stack:
  added: []
  patterns:
    - "Two round trips for paginated list with per-row counts: main .range() + count: exact, then parallel .in() pair against child tables, bucketed in JS keyed by FK"
    - "ILIKE-OR free-text filter escapes %/_ in user input to prevent wildcard injection (.or(`name.ilike.${pat},slug.ilike.${pat}`))"
    - "URL-state sync via render-time setState comparison (no useEffect — avoids react-hooks/set-state-in-effect)"
    - "Migration RLS: 4 admin policies (one per verb) gated by is_platform_staff with USING + WITH CHECK; idempotent via DROP POLICY IF EXISTS"

key-files:
  created:
    - supabase/migrations/20260509000001_organization_notes.sql
    - web/src/lib/admin/client-queries.ts
    - web/src/components/admin/clients/admin-clients-search.tsx
    - web/src/components/admin/clients/admin-clients-table.tsx
    - web/src/components/admin/clients/admin-clients-pagination.tsx
    - .planning/phases/21-clients-admin/deferred-items.md
  modified:
    - web/src/lib/admin/types.ts
    - web/src/app/(admin)/admin/clients/page.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "Migration owned by 21-01 (not 21-03) so 21-02 can render the empty notes-tab state without a migration race"
  - "Defensive ILIKE wildcard escape on user input (mirrors Phase 20 automation-queries.ts pattern)"
  - "Two round trips beat embeds: main paginated org query + parallel pair of child-table .in() queries, bucketed in JS"
  - "Pager hidden when totalPages <= 1 (avoids visual noise at small org counts)"
  - "Search input owns ?q= URL state; resetting search drops ?page= so user lands on page 1 of new filtered results"
  - "Render-time setState sync for honoring external URL changes (back/forward nav) instead of useEffect — pattern reuse from Phase 20"
  - "ACTIVE_LIKE_STATUSES literal duplicated from request-queries.ts (4 statuses); duplication cheaper than cross-module import for 4-element tuple"

patterns-established:
  - "Plan-1-of-phase migration foundation: migration ships in the first plan even if its writes land in later plans (avoids cross-plan migration races)"
  - "Paginated admin list pattern: PAGE_SIZE constant + parsePage()/nullify() helpers + Promise.all([fetch, getTranslations]) at top of page component"
  - "Pagination component renders nothing when totalPages <= 1 (declarative; no caller branch)"

requirements-completed: [CLNT-01, CLNT-02, I18N-01]

duration: 5 min
completed: 2026-05-08
---

# Phase 21 Plan 01: Clients List Foundation Summary

**Cross-org organizations list at /admin/clients with 300ms ILIKE-debounced name/slug search, 25-row pagination, and the organization_notes RLS foundation for Plan 21-03's notes CRUD.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-08T15:58:43Z
- **Completed:** 2026-05-08T16:03:59Z
- **Tasks:** 3
- **Files created:** 6 (5 source + 1 deferred-items log)
- **Files modified:** 4 (types, page, en.json, es.json)

## Accomplishments

- `/admin/clients` shows every non-soft-deleted organization with Name, Slug, # Active automations, # Members, Created date — sorted created_at DESC, default 25 per page.
- `?q=` ILIKE substring filter on (name OR slug) with 300ms debounce; resetting search clears `?page=` so user always lands on page 1 of the new filter.
- `?page=` pager with Previous / Next + "Page X of Y" + "{from}-{to} of {total}"; hidden when totalPages <= 1.
- `organization_notes` table with 4 admin-only RLS policies (SELECT/INSERT/UPDATE/DELETE all gated by `is_platform_staff((SELECT auth.uid()))`), 2 supporting indexes, and an `updated_at` trigger reusing `update_updated_at_column()`. Customer users cannot read this table at all — only platform_staff.
- `admin.clients.list.*` i18n namespace populated in both `en.json` and `es.json` with full parity (15 leaf keys per locale); `admin.placeholders.clients` removed from both locales.

## Task Commits

1. **Task 1: Create organization_notes migration** — `738a40e` (feat)
2. **Task 2: Add admin client types + fetchAdminClients query** — `68d657d` (feat)
3. **Task 3: Wire list page + search + table + pagination + i18n** — `c2b8f2a` (feat)

**Plan metadata:** _(separate commit after this SUMMARY is written)_

## Files Created/Modified

### Created

- `supabase/migrations/20260509000001_organization_notes.sql` — staff-only notes table + RLS + indexes + updated_at trigger
- `web/src/lib/admin/client-queries.ts` — `fetchAdminClients(filters)` returning paginated rows + counts
- `web/src/components/admin/clients/admin-clients-search.tsx` — client component, 300ms debounce, owns `?q=`
- `web/src/components/admin/clients/admin-clients-table.tsx` — server component, 5-column table + empty state
- `web/src/components/admin/clients/admin-clients-pagination.tsx` — client component, owns `?page=`, hidden at totalPages <= 1
- `.planning/phases/21-clients-admin/deferred-items.md` — log for the pre-existing `npm run build` Google Fonts TLS issue (out of scope)

### Modified

- `web/src/lib/admin/types.ts` — appended `AdminClientRow`, `AdminClientListFilters`, `AdminClientsListResult`
- `web/src/app/(admin)/admin/clients/page.tsx` — replaced Phase 17 placeholder with real list (server component composing search + table + pager)
- `web/messages/en.json` — added `admin.clients.list.*` (15 keys), removed `admin.placeholders.clients`
- `web/messages/es.json` — added `admin.clients.list.*` (15 keys, accent-free Spanish), removed `admin.placeholders.clients`

## Decisions Made

### Schema + RLS

- **Migration owned by 21-01 (not 21-03).** Pulling `organization_notes` into Plan 1 means Plan 2's detail page can render the (empty) notes tab on day one, and Plan 3 only adds writes — no migration race between plans. Establishes a "plan-1-of-phase migration foundation" pattern: ship the migration in the first plan even if its writes land later.
- **4 RLS policies, one per verb.** Mirrors the `organizations` admin policies in `20260506000001_admin_foundation.sql` (lines 122-149). Clearer audit trail than `FOR ALL`; easier to revoke a single verb later if requirements shift.
- **No customer-facing policy.** CONTEXT.md is explicit: "Notes are NEVER visible to customer users — only on the admin client detail page. RLS enforces this." Customers must not be able to read this table at all; only platform_staff can.
- **`author_id` references `profiles(id) ON DELETE RESTRICT`.** A staff-author profile cannot be deleted while their notes exist — preserves audit trail.
- **`organization_id` references `organizations(id) ON DELETE CASCADE`.** When an org is hard-deleted, its notes go with it (notes have no value detached from their org).

### Query strategy (reusable for 21-02)

- **Two round trips, not one with embeds.** The main paginated org query uses `.range()` + `{ count: "exact" }` to get rows + totalCount in one shot. The per-org counts are then derived from a parallel pair of `.in('organization_id', ids)` queries — one against `automations` (filtered to ACTIVE_LIKE_STATUSES + `deleted_at IS NULL`), one against `organization_members` (filtered to `is_active=true`). Both bucketed in JS keyed by `organization_id`. Established Phase 20 pattern (see `fetchAdminAutomations` lines 110-121); embed-style child counts cause Supabase JS typing pain and aren't faster at our volume.
- **`ACTIVE_LIKE_STATUSES` duplicated, not imported from request-queries.** 4-element `as const` tuple. Cross-module import would couple the two query modules; duplication is cheaper.
- **Defensive ILIKE wildcard escape.** `filters.q.replace(/[%_]/g, c => '\\' + c)` before the `.or('name.ilike.{pat},slug.ilike.{pat}')` call. Defends against a search like `100%` exploding into a wildcard match. Same defense Phase 20 uses.
- **`.or()` syntax for name OR slug.** Supabase JS PostgREST `.or('col1.ilike.value,col2.ilike.value')` — a single string with comma-separated branches, no per-column branch. Pattern reused for any future free-text search across multiple columns.
- **Defensive page/pageSize coercion.** `Math.max(1, Math.floor(filters.page) || 1)` and `Math.min(MAX_PAGE_SIZE, ...)` so a hostile `?pageSize=10000` URL caps at 100, and `?page=garbage` lands on 1.

### UI / URL state

- **Render-time setState comparison for URL sync, NOT useEffect.** The search component honors external URL changes (back/forward nav, programmatic `router.push` from elsewhere) by deriving `urlQ` during render, comparing against `lastSyncedQ`, and calling `setValue` in render only when they diverge. Pattern proven in Phase 20 (20-01-SUMMARY decision "URL-state sync via render-time setState comparison, not useEffect"); avoids the `react-hooks/set-state-in-effect` ESLint rule.
- **Pagination component returns null when totalPages <= 1.** Caller doesn't have to branch — the component decides. Same pattern reusable for 21-02 (per-org members tab if it ever paginates) and Phase 22.
- **Search debounce = 300ms.** CONTEXT.md prescribed value; long enough to debounce typing, short enough to feel responsive.
- **Resetting search drops `?page=`.** A user who narrows their search shouldn't land on a page 3 that no longer exists for the new filtered result.
- **Row link target `/admin/clients/${row.id}` 404s until 21-02.** CONTEXT.md accepts this cross-plan dead link (Phase 19 SUMMARY established the pattern). Worth being explicit so no executor wastes a deviation reverting it.

### i18n

- **`admin.clients.list.*` namespace shape (so 21-02 / 21-03 can extend without surprise):**
  - `title`, `subtitle` — page header strings
  - `search.{label,placeholder,clear}` — search box strings
  - `columns.{name,slug,activeAutomations,members,createdAt}` — table header strings
  - `empty.{noResults,noOrgs}` — distinct empty states for "search returned nothing" vs "no orgs at all"
  - `pagination.{label,previous,next,page}` — pager strings; `label` is the "{from}-{to} of {total}" template, `page` is the "Page {page} of {total}" template (both substituted in the client component, not via t())
  - **For 21-02:** add `admin.clients.detail.*` peer namespace; do NOT nest under `clients.list.detail`.
  - **For 21-03:** add `admin.clients.detail.notes.*` peer namespace under `clients.detail`.
- **`admin.placeholders.clients` removed from both locales.** The Phase 17 placeholder is now superseded; leaving stale keys risks future copy-paste reuse.
- **Spanish stays accent-free** ("Clientes", "Buscar por nombre o slug", "Pagina", "Anterior", "Siguiente", "Limpiar busqueda", "Aun no existen organizaciones") — matches the existing `admin.*` namespace convention from Phases 17-20.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

### `npm run build` fails on pre-existing Google Fonts TLS issue (out of scope)

`npm run build` reports a TLS error fetching `Geist` / `Geist Mono` from `fonts.googleapis.com`. This is environmental — not introduced by 21-01 changes — and affects every Next.js 16 build on this machine, not the admin clients page specifically. Logged in `.planning/phases/21-clients-admin/deferred-items.md` for a separate cleanup commit (the recommended fix is `experimental.turbopackUseSystemTlsCerts: true` in `next.config.ts` or self-hosting the font assets).

The plan's required automated verifications all pass:
- `npx tsc --noEmit` exits 0
- `npx eslint src/app/(admin)/admin/clients/page.tsx src/components/admin/clients/` exits 0
- i18n parity script confirms `admin.clients.list.*` keys match EN/ES and `admin.placeholders.clients` is gone from both locales

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **`/admin/clients` list is live.** Phase 21-02 (detail page) can clone the patterns established here verbatim:
  - Two-round-trip query shape with per-row counts bucketed in JS keyed by FK
  - Render-time setState URL sync (any client subtree on the detail page)
  - `admin.clients.detail.*` peer namespace under `admin.clients`
- **`organization_notes` schema is live.** Plan 21-02 can render an (initially empty) Notes tab against this table on day one. Plan 21-03 only needs to add writes — no migration work.
- **Row link target `/admin/clients/[orgId]` 404s until 21-02 ships.** Cross-phase dead link accepted per CONTEXT.md.
- **No blockers for 21-02 or 21-03.**

## Self-Check: PASSED

- supabase/migrations/20260509000001_organization_notes.sql: FOUND on disk
- web/src/lib/admin/client-queries.ts: FOUND on disk
- web/src/components/admin/clients/admin-clients-search.tsx: FOUND on disk
- web/src/components/admin/clients/admin-clients-table.tsx: FOUND on disk
- web/src/components/admin/clients/admin-clients-pagination.tsx: FOUND on disk
- Commit 738a40e: FOUND in git log
- Commit 68d657d: FOUND in git log
- Commit c2b8f2a: FOUND in git log

---
*Phase: 21-clients-admin*
*Completed: 2026-05-08*
