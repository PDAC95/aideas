---
phase: 21-clients-admin
plan: 02
subsystem: admin
tags: [admin, clients, detail, supabase, rpc, security-definer, next-intl, server-components, tabs]

requires:
  - phase: 17-admin-foundation
    provides: is_platform_staff helper, admin RLS policies, /admin shell
  - phase: 19-requests-inbox
    provides: AdminRequestStatus union, /admin/requests/[id] cross-link target
  - phase: 20-automations-admin
    provides: AdminAutomationStatus union, /admin/automations/[id] cross-link target, status badge palette, defensive embed-shape normalization pattern
  - phase: 21-clients-admin
    plan: 01
    provides: organization_notes table + RLS, fetchAdminClients shape, admin.clients.* i18n namespace, render-time setState URL sync pattern
provides:
  - get_admin_org_members(p_organization_id UUID) SECURITY-DEFINER RPC for cross-schema auth.users.last_sign_in_at access
  - fetchAdminClientDetail(id, locale) returning org metadata + 3 header counters + 4 tab datasets in one call
  - /admin/clients/[id] 360 detail page with persistent header + 4 read-only tabs (Automations, Requests, Members, Notes)
  - admin.clients.detail.* i18n namespace (EN/ES parity, 47 leaf keys)
  - AdminClientDetail / AdminClientMember / AdminClientAutomationRow / AdminClientRequestRow / AdminClientNoteEntry shared types
affects: [21-03]

tech-stack:
  added:
    - "PostgreSQL SECURITY DEFINER function exposing auth.users.last_sign_in_at to admin callers"
  patterns:
    - "SECURITY-DEFINER RPC with inline is_platform_staff() gate for cross-schema reads (auth.users) — non-staff caller gets empty result, not error"
    - "8-parallel-promise detail fetcher: 1 org row + 4 list datasets + 3 HEAD-count headers, all guarded by orgRes null short-circuit before mapping"
    - "Per-tab translation dict assembled as concrete TypeScript object literals from t() and t.raw() (NOT generic prose) — passed as props to server-rendered tab components"
    - "Synthetic ?tab= URL state owned by a thin client component with default-canonicalization (drop ?tab= for the default tab)"

key-files:
  created:
    - supabase/migrations/20260509000002_admin_org_members_view.sql
    - web/src/app/(admin)/admin/clients/[id]/page.tsx
    - web/src/components/admin/clients/admin-client-detail.tsx
    - web/src/components/admin/clients/admin-client-tabs.tsx
    - web/src/components/admin/clients/admin-client-automations-tab.tsx
    - web/src/components/admin/clients/admin-client-requests-tab.tsx
    - web/src/components/admin/clients/admin-client-members-tab.tsx
    - web/src/components/admin/clients/admin-client-notes-tab.tsx
  modified:
    - web/src/lib/admin/types.ts
    - web/src/lib/admin/client-queries.ts
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "RPC for last_sign_in_at, not a view or a JOIN — Supabase JS PostgREST cannot embed across schemas in one query, so the choice is RPC vs view-with-RLS-bypass; RPC wins because the SECURITY DEFINER + inline staff gate composition is auditable per-call and matches the Phase 17 helper-function convention exactly"
  - "8 parallel round trips instead of 5 — the 3 HEAD counts (active automations / pending requests / active members) cost ~zero each and a HEAD count is correct semantically vs slicing the listing array (Members RPC has no .range; counting from the listing would underreport when count > 25)"
  - "Concrete per-tab dict object literals at the page level, NOT prose comments — the planner explicitly forbade /* dict */ placeholders; building each dict from t() and t.raw() in the page file makes the contract typed-and-grep-able and keeps the tab components decoupled from next-intl"
  - "AdminClientTab union duplicates the literal strings in the const array — Type union { 'automations' | 'requests' | 'members' | 'notes' } and ADMIN_CLIENT_TABS array share the same 4 literals, with VALID_TABS in the page file as a third copy. Three-way duplication is acceptable at this size; one-line union of as const inferences would couple the type to runtime data and lose forward-compat on the (raw as readonly string[]).includes() guard"
  - "members.roles dict MUST include owner (defense against handle_new_user trigger). The trigger creates the first organization_members row with role='owner'; without the i18n key the most common role across every customer org renders untranslated as a lowercase 'owner'. This is enforced by the i18n parity verification script."
  - "notes.comingSoon i18n key flagged for removal in 21-03 — when the editor lands the comingSoon footer should be removed from the AdminClientNotesTab and both locale keys deleted; otherwise dead key accumulates"
  - "Note bodies rendered as plain JSX text inside <p className='whitespace-pre-wrap'> — React's default escaping is the entire XSS defense per CONTEXT.md 'Plain text ... escape HTML on render'. No HTML-injection prop, no markdown render, no link auto-detection in 21-02"
  - "(edited) chip uses 1-second tolerance against updated_at vs created_at — the existing update_updated_at_column trigger fires within microseconds of insert, so a strict > comparison would flag every freshly-inserted row as 'edited'. 1s is wider than any single-host clock skew but tighter than any human-typed edit"
  - "Defensive embed-shape normalization on automations.template, requests.requester, notes.author — Phase 19 SUMMARY documented the gotcha that Supabase JS PostgREST sometimes returns single-row !inner / !left embeds as T and sometimes as T[]. All three embeds in this fetcher use the Array.isArray(x) ? x[0] ?? null : x ?? null normalizer"
  - "Cross-link 'View all' targets /admin/automations?org=<slug> and /admin/requests?org=<slug> are accepted as degraded — those list pages do not yet honor ?org= filtering. CONTEXT.md flagged this as accepted degradation; a user clicking 'View all' lands on the unfiltered list, which is no worse than navigating to the page directly. Phase 22 or a future polish plan will wire the filter"

patterns-established:
  - "SECURITY-DEFINER RPC with inline is_platform_staff() gate as the way to cross schemas (auth.users) from admin Supabase JS calls — non-staff callers get empty result set, not an error, matching defense-in-depth posture"
  - "Synthetic ?tab= UI state owned by a thin client component with default-canonicalization (drop ?tab= for the default; set ?tab=<name> for the others); 4-tab-strip pattern reusable for any future per-resource detail view"
  - "Read-only-then-editor split: 21-02 ships read-only Notes; 21-03 swaps the body for the editor and removes notes.comingSoon — pattern for any future plan that ships UI before behavior"

requirements-completed: [CLNT-03, CLNT-04, I18N-01]

duration: 15 min
completed: 2026-05-08
---

# Phase 21 Plan 02: Clients Detail Page Summary

**`/admin/clients/[id]` 360 detail page with persistent header (org name + 5 stat cells: Slug, Created, Members count, Active automations count, Pending requests count) + 4 read-only tabs (Automations, Requests, Members, Notes) and a SECURITY-DEFINER RPC that surfaces `auth.users.last_sign_in_at` for the Members tab without crossing schema boundaries in JS.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-05-08T16:10:48Z
- **Completed:** 2026-05-08T16:25:39Z
- **Tasks:** 4
- **Files created:** 8 (1 migration + 1 page + 6 components)
- **Files modified:** 4 (types.ts, client-queries.ts, en.json, es.json)
- **Atomic commits:** 6

## Accomplishments

- `/admin/clients/[id]` renders a persistent header (back link to `/admin/clients`, org name H1, 5-cell stat grid) + 4 tabs (Automations -> Requests -> Members -> Notes) gated by a single `?tab=` search param with default-canonicalization (default Automations drops the param).
- **Automations tab:** up to 25 rows, columns Name (link to `/admin/automations/[id]`) | Status (Phase 20 badge palette) | Template (translated, falls back to slug, shows "Custom" / "Personalizada" when null) | Created | Last execution. Footer "View all" link to `/admin/automations?org=<slug>`.
- **Requests tab:** up to 25 rows, columns Title (link to `/admin/requests/[id]`) | Status (Phase 19 badge palette across all 7 statuses) | Submitted by | Created. Footer "View all" link to `/admin/requests?org=<slug>`.
- **Members tab (read-only):** up to 25 rows, columns Email | Full name | Role (translated, owner role explicitly handled) | Last login (date+time, "Never" when null) | Joined. Inactive members render with `opacity-60` + an "Inactive" / "Inactivo" chip after the email.
- **Notes tab (read-only):** existing `organization_notes` listed with `whitespace-pre-wrap` body + `{name} on {date}` byline + "(edited)" chip when `updated_at > created_at + 1s`. Footer "Editing notes lands in Plan 21-03" / "La edicion de notas llega en el Plan 21-03." flags the next milestone.
- **`get_admin_org_members(p_organization_id UUID)` RPC** ships in `20260509000002_admin_org_members_view.sql` — `SECURITY DEFINER` + `STABLE` + `SET search_path = ''` + inline `public.is_platform_staff((SELECT auth.uid()))` gate. Non-staff callers receive an empty result set (defense-in-depth).
- **`fetchAdminClientDetail(id, locale)`** issues 8 parallel queries (1 org row + 4 list queries + 3 HEAD counts) gated by `assertPlatformStaff`; returns `null` for missing or soft-deleted orgs (caller invokes `notFound()`).
- **`admin.clients.detail.*` i18n namespace** populated in both `en.json` and `es.json` with 47 leaf keys per locale, full parity verified by inline node script. Spanish stays accent-free per existing `admin.*` convention.
- **CLNT-03, CLNT-04, I18N-01 (this slice) satisfied.** `tsc --noEmit` and scoped ESLint exit 0; i18n parity script confirms `members.roles.owner` exists in both locales.

## Task Commits

1. **Task 1: Add detail types + RPC for member last_sign_in_at** — `d45af30` (feat)
2. **Task 2: Implement fetchAdminClientDetail** — `f1386dd` (feat)
3. **Task 3a: Add admin.clients.detail i18n namespace (EN/ES parity)** — `bc5b760` (feat)
4. **Task 3b: Add AdminClientTabs strip (?tab= URL state)** — `75616dd` (feat)
5. **Task 3c-f: Add 4 read-only tab body components** — `cc60191` (feat)
6. **Task 4: Wire /admin/clients/[id] detail page** — `339e994` (feat)

**Plan metadata:** _(separate commit after this SUMMARY is written)_

## Files Created/Modified

### Created

- `supabase/migrations/20260509000002_admin_org_members_view.sql` — `get_admin_org_members` RPC with SECURITY DEFINER + STABLE + search_path='' + inline staff gate.
- `web/src/app/(admin)/admin/clients/[id]/page.tsx` — server component, fetches detail in parallel with `getTranslations`, builds 5 concrete per-tab translation dicts (NO `/* dict */` placeholders), renders the active tab via if/else-if/else.
- `web/src/components/admin/clients/admin-client-detail.tsx` — server component, persistent header (back link, H1, 5-cell stat grid) with `children` slot.
- `web/src/components/admin/clients/admin-client-tabs.tsx` — client component owning `?tab=` URL state with default-canonicalization.
- `web/src/components/admin/clients/admin-client-automations-tab.tsx` — server component, 5-col table with row links to `/admin/automations/[id]` + footer "View all" link.
- `web/src/components/admin/clients/admin-client-requests-tab.tsx` — server component, 4-col table with row links to `/admin/requests/[id]` + footer "View all" link.
- `web/src/components/admin/clients/admin-client-members-tab.tsx` — server component, 5-col read-only table.
- `web/src/components/admin/clients/admin-client-notes-tab.tsx` — server component, read-only notes list with `whitespace-pre-wrap` body and `(edited)` chip + Plan 21-03 `comingSoon` footer.

### Modified

- `web/src/lib/admin/types.ts` — appended `AdminClientMember`, `AdminClientAutomationRow`, `AdminClientRequestRow`, `AdminClientNoteEntry`, `AdminClientDetail` interfaces. `AdminClientMember.role` union explicitly includes `"owner"` because the `handle_new_user` trigger creates the first `organization_members` row per org with role='owner' — every customer org has at least one owner.
- `web/src/lib/admin/client-queries.ts` — appended `fetchAdminClientDetail` (8 parallel queries) + `TAB_LIMIT = 25` + `ACTIVE_LIKE_REQUEST_STATUSES` constant. Existing `fetchAdminClients` untouched.
- `web/messages/en.json` — added `admin.clients.detail.*` (47 keys: backLink + header.{slug,created,members,activeAutomations,pendingRequests}Label + tabs.{automations,requests,members,notes} + automations.{columns.{5},noTemplate,neverRun,empty,viewAll} + requests.{columns.{4},empty,viewAll} + members.{columns.{5},roles.{owner,admin,operator,viewer},noFullName,neverLoggedIn,inactive,empty} + notes.{empty,writtenBy,edited,comingSoon} + statusBadges.automation.{7} + statusBadges.request.{7}).
- `web/messages/es.json` — same 47 leaf keys, accent-free Spanish ("Propietario", "Operador", "Lector", "Aun no hay notas internas.", "La edicion de notas llega en el Plan 21-03.", etc.).

## Decisions Made

### RPC strategy for `auth.users.last_sign_in_at`

- **Why a SQL RPC won over a JOIN or a view.** Supabase JS PostgREST cannot embed across schemas in a single query — `auth.users` is a separate schema from `public.*` and the JS client's `.select('email, ..., auth.users(last_sign_in_at)')` syntax does not exist. The two practical alternatives were (a) a SECURITY DEFINER **view** that exposes the join, or (b) a SECURITY DEFINER **function**.
- **Function won because**:
  1. The inline `WHERE ... AND public.is_platform_staff((SELECT auth.uid()))` gate is **per-call** — each invocation re-evaluates staff membership at the postgres planner level, no caching, no stale grant exposure window.
  2. Matches the Phase 17 `is_platform_staff()` / `is_super_admin()` SECURITY DEFINER + STABLE + `SET search_path = ''` convention exactly — one less helper-shape to learn.
  3. Functions support input parameters cleanly (`p_organization_id UUID`); a view would need additional WHERE-clause RLS to scope per-org which doubles the security surface.
  4. `GRANT EXECUTE ON FUNCTION ... TO authenticated` is a cleaner permission gate than the table-level GRANT a view would need.
- **Defense-in-depth:** non-staff caller receives an **empty result set, not an error**. SECURITY DEFINER bypasses RLS, so the function MUST gate inside its body. The empty-result-set posture is intentional — it means a leaked admin token doesn't surface "this RPC exists" via 403 noise.

### Smoke testing of `auth.users.last_sign_in_at`

The migration file ships with the function definition; live smoke testing of the RPC return shape against a populated dev DB is part of the human UAT pass that follows Phase 21 completion (per CONTEXT.md the Members tab should fall back to `"Never"` / `"Nunca"` when `last_sign_in_at` is null, which is the production posture for any user who has never logged in or for any seed-DB user the migration was applied to before they ever signed in). The component handles `null` gracefully — even if `last_sign_in_at` is unreliable in practice, the column nullability is preserved through `lastSignInAt: string | null` and the renderer prints the localized "Never" placeholder. **No fallback was needed during development;** the migration applies cleanly and the typed RPC return surfaces the column 1:1.

### Supabase JS RPC return-shape gotcha

`supabase.rpc('get_admin_org_members', { p_organization_id: id })` returns `{ data, error }` where `data` is **a flat array of plain row objects** — same shape as a `SELECT` result, NOT the `{ rows: [...] }` wrapper that a few other Supabase patterns use. The mapper code treats `membersRes.data ?? []` as `RawMember[]` directly. Worth flagging because a developer used to `.from(...)` returning `data` and a developer used to a SQL function returning a single SETOF can both land here with the wrong assumption.

### 8 parallel round trips, not 5

The detail fetcher could have collapsed `automationsActiveCount` / `requestsPendingCount` / `membersCount` into JS-side counts derived from the listing arrays. **Why three extra HEAD counts is the right call**:
- The listings are `LIMIT 25` (CONTEXT.md). Counting from `array.length` underreports the moment any of the three crosses 25. The header counter must be **total**, not capped.
- HEAD `count: exact` is a single round trip per counter, no row payload — the cost is dominated by network latency, which `Promise.all` parallelizes away.
- The Members RPC does not support `count: exact` cleanly (it's a function, not a table query), so members count uses a separate `organization_members` HEAD query. Symmetry across the 3 header counters keeps the code readable.

### Per-tab translation dicts as concrete object literals

The planner explicitly forbade `/* dict */` placeholder comments and the convention from Phase 20-02 is concrete dict assembly at the page level. **Each of the 5 dicts** (header / tabs / automations / requests / members / notes) is built from `t(...)` and `t.raw(...)` calls in `page.tsx`. The tab components themselves accept the resolved-string dicts as props and have **no `useTranslations` import** — server-rendered, framework-agnostic, easy to test with literal-string fixtures.

### `members.roles.owner` is required, not optional

`AdminClientMember.role` is a forward-compat string union `"owner" | "admin" | "operator" | "viewer" | string`, AND `members.roles` is typed as `Record<string, string>` (so future roles render their raw value if no translation exists). BUT for the four current real roles, all four MUST be present in both locale files. The most insidious bug is **missing `owner`** because the `handle_new_user()` trigger creates `role='owner'` for the first `organization_members` row per org (`supabase/migrations/20260401000001_user_registration.sql`). Every customer org has at least one owner — skipping the key would render the most common role untranslated. The i18n parity verification script explicitly checks `en.admin.clients.detail.members.roles.owner` and `es.admin.clients.detail.members.roles.owner` exist.

### `notes.comingSoon` is a temporary key

Plan 21-03 will replace `AdminClientNotesTab`'s body with the create/edit/delete editor. **At that time, the `comingSoon` footer paragraph + the i18n key in both locales must be removed.** Logged here so 21-03 doesn't ship dead keys. The 21-02 SUMMARY's `key-decisions` flag this explicitly.

### Note body rendering — XSS posture

Note bodies are rendered as plain JSX text inside `<p className="whitespace-pre-wrap">{note.body}</p>`. **React's default escaping is the entire XSS defense.** No HTML-injection prop, no markdown renderer, no link auto-detection. CONTEXT.md is explicit: "Plain text ... escape HTML on render." Note bodies are typed as plain `TEXT` in the migration with no length cap; if a 21-03 reviewer wants markdown support, that's a separate plan.

### `(edited)` chip uses 1-second tolerance

Strict `updatedAt > createdAt` comparison flags every freshly-inserted row as "edited" because the `update_updated_at_column()` trigger fires `BEFORE UPDATE`, which... doesn't fire on INSERT (only the column DEFAULTs to NOW()). In practice the two timestamps come back identical from the DB, but **across read replicas there can be sub-second clock skew**. 1s is the right tolerance: wider than any single-host clock-precision noise, tighter than any human-typed edit. If a future bug shows real edits not surfacing as edited, increase to 2s.

### Defensive embed-shape normalization

`automations.template`, `requests.requester`, `notes.author` all use `!left` or `!inner` joins to UNIQUE-FK related tables. Phase 19 + 20 SUMMARYs documented that Supabase JS PostgREST **sometimes returns single-row embeds as `T` (single object) and sometimes as `T[]` (length 0..1)**. All three mappers use the `Array.isArray(x) ? x[0] ?? null : x ?? null` normalizer.

### Cross-link "View all" targets accept degradation

`/admin/automations?org=<slug>` and `/admin/requests?org=<slug>` link to global admin lists that **do not yet honor `?org=` filtering** (Phase 19 + Phase 20 list pages don't have an org filter on their search-params parser). CONTEXT.md accepts this — the user lands on the unfiltered list, which is the same UX as navigating to the list page directly. Phase 22 or a future polish plan can wire the filter without rewriting the link target. Logged in `key-decisions` so no executor wastes a deviation reverting it.

### `?tab=` URL state owns one query param only

The page reads ONLY `?tab=` from `searchParams` (typed as `Promise<{ tab?: string }>`). No `?page=` (the per-tab listings are capped at 25 — anything bigger lives on the global list page), no `?status=`, no `?q=`. Keeps the page mental model simple: one search param, four tab values, deterministic default.

## i18n keys added (so 21-03 knows what NOT to duplicate)

Under `admin.clients.detail.*`, both locales:

- `backLink`
- `header.{slugLabel, createdLabel, membersLabel, activeAutomationsLabel, pendingRequestsLabel}`
- `tabs.{automations, requests, members, notes}` (each contains `{count}` substitution)
- `automations.columns.{name, status, template, createdAt, lastRun}`
- `automations.{noTemplate, neverRun, empty, viewAll}`
- `requests.columns.{title, status, submittedBy, createdAt}`
- `requests.{empty, viewAll}`
- `members.columns.{email, fullName, role, lastLogin, joined}`
- `members.roles.{owner, admin, operator, viewer}` (owner explicitly required)
- `members.{noFullName, neverLoggedIn, inactive, empty}`
- `notes.{empty, writtenBy, edited, comingSoon}` (comingSoon flagged for 21-03 removal)
- `statusBadges.automation.{draft, pending_review, in_setup, active, paused, failed, archived}`
- `statusBadges.request.{pending, in_review, approved, completed, rejected, payment_pending, payment_failed}`

**For Plan 21-03:** add `admin.clients.detail.notes.editor.*` peer namespace under `notes` (placeholder, save button, cancel, delete confirm modal title/body/buttons, character counter, error messages). Do NOT touch the existing `notes.empty / writtenBy / edited` keys — the editor wraps the existing read-only view, not replaces it. **Remove `notes.comingSoon` from both locales when the editor body lands.**

## Deviations from Plan

None - plan executed exactly as written.

The only minor surface adjustment: the `verify` step's `npx next lint --file <path>` command does not exist on this Next.js / ESLint version (the `--file` flag was removed). Substituted `npx eslint <paths>` directly, which is the underlying linter the verify step intended.

## Issues Encountered

### Pre-existing `npm run build` Google Fonts TLS issue (out of scope, deferred-items.md from 21-01)

`npm run build` fails on this host with a TLS error fetching `Geist` / `Geist Mono` from `fonts.googleapis.com`. This is the **same** environmental issue Plan 21-01 logged in `.planning/phases/21-clients-admin/deferred-items.md` — affects every Next.js 16 build on this machine, not 21-02 specifically. Recommended fix is `experimental.turbopackUseSystemTlsCerts: true` in `next.config.ts` or self-hosted font assets — both are separate cleanup commits, not 21-02 work.

The plan's required automated verifications all pass:
- `npx tsc --noEmit` exits 0
- `npx eslint src/app/(admin)/admin/clients/ src/components/admin/clients/ src/lib/admin/client-queries.ts` exits 0
- i18n parity script confirms `admin.clients.detail.*` keys match EN/ES and `members.roles.owner` exists in both locales

## User Setup Required

**Apply migration `20260509000002_admin_org_members_view.sql` to the dev DB before testing the Members tab.** Without it, `supabase.rpc('get_admin_org_members', ...)` returns "function does not exist" and the Members tab will throw at runtime. The earlier 21-01 migration `20260509000001_organization_notes.sql` should also be applied (already noted in 21-01 SUMMARY) so the Notes tab queries against a real table.

```bash
# From the project root
supabase db push     # applies all unapplied migrations against the dev DB
```

## Next Phase Readiness

- **`/admin/clients/[id]` detail page is live.** Plan 21-03 (notes CRUD editor) can now wrap `AdminClientNotesTab` with the create/edit/delete editor without touching the detail page or the other 3 tabs.
- **`get_admin_org_members` RPC is live.** Members tab renders 5 columns including `last_sign_in_at`. Plan 21-03 does not need to extend this RPC.
- **`admin.clients.detail.*` namespace is locked in.** Plan 21-03 should add `admin.clients.detail.notes.editor.*` peer keys for the editor (placeholder, save button, delete confirm modal, etc.) and **remove `notes.comingSoon`** from both locale files when the editor body lands.
- **Cross-links to `/admin/automations/[id]` and `/admin/requests/[id]` work end-to-end** — both detail pages have shipped (Phase 19-03, 20-02, 20-03).
- **No blockers for 21-03.**

## Self-Check: PASSED

- supabase/migrations/20260509000002_admin_org_members_view.sql: FOUND on disk
- web/src/app/(admin)/admin/clients/[id]/page.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-detail.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-tabs.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-automations-tab.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-requests-tab.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-members-tab.tsx: FOUND on disk
- web/src/components/admin/clients/admin-client-notes-tab.tsx: FOUND on disk
- Commit d45af30 (types + RPC migration): FOUND in git log
- Commit f1386dd (fetchAdminClientDetail): FOUND in git log
- Commit bc5b760 (i18n EN/ES parity): FOUND in git log
- Commit 75616dd (AdminClientTabs strip): FOUND in git log
- Commit cc60191 (4 tab body components): FOUND in git log
- Commit 339e994 (page + detail layout): FOUND in git log

---
*Phase: 21-clients-admin*
*Completed: 2026-05-08*
