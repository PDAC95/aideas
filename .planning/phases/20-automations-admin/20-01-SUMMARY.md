---
phase: 20-automations-admin
plan: 01
subsystem: ui
tags: [next-intl, supabase, postgrest, admin, automations, list, tabs, filters]

# Dependency graph
requires:
  - phase: 17-admin-foundation
    provides: assertPlatformStaff helper, createAdminServerClient, AdminShell layout
  - phase: 19-requests-inbox
    provides: admin types pattern (AdminRequest*), request-queries.ts query pattern, admin-requests-tabs.tsx URL-state pattern
provides:
  - AdminAutomationStatus, AdminAutomationTab, AdminAutomationStatusCounts, AdminAutomationRow, AdminAutomationOrgOption, AdminAutomationTemplateOption, AdminAutomationListFilters types
  - ADMIN_AUTOMATION_TABS readonly constant
  - fetchAdminAutomations(filters) — global cross-org list with org+template+translations join + per-row execution count
  - fetchAdminAutomationStatusCounts() — five parallel HEAD count queries for tab counters
  - fetchAdminAutomationFilterOptions({locale}) — deduped + alphabetized org and template dropdown options
  - AdminAutomationsTabs (client) — URL-syncs ?status=, default Active drops the param
  - AdminAutomationsFilters (client) — three combinable filters URL-synced to ?org / ?template / ?q
  - AdminAutomationsTable (server) — 6-column read-only table with 7 status badges
  - admin.automations.list i18n namespace (32 leaf keys per locale, EN + ES)
  - /admin/automations real server-rendered page (Phase 17 placeholder removed)
affects: [20-02, 20-03, 21-clients-admin, 22-admin-home]

# Tech tracking
tech-stack:
  added: []  # No new libraries
  patterns:
    - "Cross-org admin list pattern: 4-way Promise.all (rows + counts + filterOptions + translations) -> server component composes tabs (client) + filters (client) + table (server)"
    - "URL-state sync via render-time setState (React docs 'storing information from previous renders' pattern) instead of setState-in-useEffect — avoids cascading-renders lint error"
    - "Per-row aggregate counts via second bucketed query (one round trip for all rows) instead of per-row aggregate"
    - "Tab values that map 1:1 to DB status values eliminate TAB_TO_STATUSES indirection"

key-files:
  created:
    - web/src/lib/admin/automation-queries.ts
    - web/src/components/admin/automations/admin-automations-tabs.tsx
    - web/src/components/admin/automations/admin-automations-filters.tsx
    - web/src/components/admin/automations/admin-automations-table.tsx
  modified:
    - web/src/lib/admin/types.ts (additive — AdminRequest* types untouched)
    - web/src/app/(admin)/admin/automations/page.tsx (placeholder -> real page)
    - web/messages/en.json (+admin.automations.list, -admin.placeholders.automations)
    - web/messages/es.json (+admin.automations.list, -admin.placeholders.automations)

key-decisions:
  - "Tab values map 1:1 to real DB status values, not to TAB_TO_STATUSES groupings. Default tab is 'active'."
  - "Per-row execution counts via second bucketed query instead of N per-row aggregate sub-selects."
  - "Filter chain order matches request-queries.ts verbatim (.eq(status).is(deleted_at,null).eq(translations.locale).eq(translations.field) THEN optional filters THEN .order)."
  - "URL-state sync via render-time setState (urlSig comparison) avoids setState-in-useEffect cascading-renders lint rule."
  - "ilike search escapes % and _ in user input to prevent wildcard injection."
  - "Customer-side /dashboard/automations untouched — archived already filtered there per Phase 09."
  - "No 'Create automation' button on list page — staff doesn't create automations from this surface."

patterns-established:
  - "Admin cross-org list: Promise.all([rows, counts, filterOptions, translations]) -> AdminXTabs (client) + AdminXFilters (client) + AdminXTable (server). Reusable for Phase 21 Clients Admin."
  - "URL-state controlled inputs: useState mirror + render-time signature comparison (urlSig). Reusable any time a client component needs to honor external URL changes."
  - "Per-row aggregate counts: rows.map(r => r.id) -> .in('automation_id', ids) -> bucket in JS keyed by id. Cheaper than N round-trips, simpler than a Postgres aggregate."

requirements-completed: [AUTM-01, I18N-01]

# Metrics
duration: 12min
completed: 2026-05-07
---

# Phase 20 Plan 01: Admin Automations List Summary

**Global cross-org /admin/automations list with 5 status tabs, 3 combinable filters (org / template / name), 6-column server-rendered table, and full EN/ES i18n parity — placeholder retired.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-07T19:30:00Z (approx, single uninterrupted execution)
- **Completed:** 2026-05-07T19:42:00Z
- **Tasks:** 3
- **Files modified:** 8 (4 created, 4 modified)

## Accomplishments

- Real /admin/automations page replaces the Phase 17 placeholder body. Server component fans out 4 parallel async calls (rows, counts, filterOptions, translations) and composes the three new components.
- Three new admin components: status tabs (client, URL-state), filter bar (client, URL-state with debounced search), table (server, no client state).
- Three new query functions in `web/src/lib/admin/automation-queries.ts`, all gated by `assertPlatformStaff`. Per-row execution counts via second bucketed query.
- Six new admin types appended to `web/src/lib/admin/types.ts` alongside the existing AdminRequest* surface — no removals, fully additive.
- 32 new i18n leaf keys per locale under `admin.automations.list` with full EN/ES parity (826 total keys after this plan).
- `admin.placeholders.automations` block removed from both locale files — placeholder is no longer referenced anywhere in the codebase.

## Task Commits

Each task was committed atomically on `feature/phase-20-automations-admin`:

1. **Task 1: Extend admin types + build automation-queries.ts** — `b65b712` (feat)
2. **Task 2: Build AdminAutomationsTabs + AdminAutomationsFilters + AdminAutomationsTable** — `c5d2efc` (feat)
3. **Task 3: Real /admin/automations page + admin.automations.list i18n + remove placeholder** — `a7afd6c` (feat)

## Files Created/Modified

**Created:**
- `web/src/lib/admin/automation-queries.ts` — three exported async functions (fetchAdminAutomations, fetchAdminAutomationStatusCounts, fetchAdminAutomationFilterOptions), all guarded by assertPlatformStaff; mirrors the structure of `request-queries.ts` exactly.
- `web/src/components/admin/automations/admin-automations-tabs.tsx` — client component, 5 tabs, URL-syncs ?status=, default 'active' drops the param. Uses startTransition for snappy active-state updates.
- `web/src/components/admin/automations/admin-automations-filters.tsx` — client component, three controls (org dropdown / template dropdown / 300ms-debounced name search), URL-syncs ?org / ?template / ?q. Renders empty values as dropped keys.
- `web/src/components/admin/automations/admin-automations-table.tsx` — server component, 6-column read-only table (Name / Customer / Template / Status / Executions / Created), 7 status badges (5 tabbed + draft + pending_review), Name cell links to `/admin/automations/[id]`, single empty-state slot.

**Modified:**
- `web/src/lib/admin/types.ts` — appended 6 new exported types + 1 readonly array constant (ADMIN_AUTOMATION_TABS); no AdminRequest* removals.
- `web/src/app/(admin)/admin/automations/page.tsx` — replaced placeholder body with real server component (Promise.all + coerceTab + nullify + 3-component composition).
- `web/messages/en.json` — added `admin.automations.list` (32 leaf keys); removed `admin.placeholders.automations`.
- `web/messages/es.json` — same shape with Spanish parity (accent-free per project convention).

## Decisions Made

- **Tab values map 1:1 to DB status values.** Unlike Phase 19 Requests (where 7 DB statuses fold into 3 UI tabs via `TAB_TO_STATUSES`), automations expose 5 tabs that exactly equal 5 of the 7 real statuses. The URL `?status=` value, the SQL filter, and the i18n key all share the same string. Draft and pending_review are intentionally not tabbed (CONTEXT.md "Claude's Discretion").
- **Per-row aggregate counts via second bucketed query, not per-row aggregate.** `fetchAdminAutomations` issues one round trip for the rowset, then ONE more `.in('automation_id', ids)` against `automation_executions` and buckets in JS. N-aggregate alternative explodes round trips for any list view; Postgres aggregate alternative forces awkward Supabase JS typings.
- **Filter chain ordering matters.** `.eq(status).is(deleted_at,null).eq(translations.locale).eq(translations.field)` THEN optional filters THEN `.order(...)`. Mirrors `request-queries.ts` verbatim because mixing this order has caused embedded-filter bugs in older postgrest-js. Worth re-asserting for Phase 20-02 + 20-03.
- **URL-state sync via render-time setState, not useEffect.** The initial draft used `useEffect(() => setLocal(params))` to honor external URL changes, which lint flagged as "setState in effect causes cascading renders". Refactored to the React-docs-blessed pattern: store `lastSyncedSig` in state, compare against `urlSig` during render, and call setState in render only when they diverge. Reusable for any client component that needs to honor external param changes.
- **ilike search escapes `%` and `_`** in user input so a search like `100%` doesn't blow into a wildcard.
- **Customer-side `/dashboard/automations` untouched.** Archived rows are already filtered out in `web/src/lib/dashboard/queries.ts` and the customer client tabs (All / Active / In Setup / Paused) per Phase 09; CONTEXT.md's "archived filtered out of customer view" requirement is already satisfied.
- **No `Create automation` button** on this list. Operators don't create automations from the global view; they create via the approve-request flow (Phase 19) or via Phase 20-02 detail page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Refactored URL-state sync to avoid setState-in-useEffect lint error**
- **Found during:** Task 3 (post-build lint pass on Phase 20-01 files only)
- **Issue:** Plan-prescribed `useEffect(() => { setOrgValue(params.get('org')); setTemplateValue(...); setQueryValue(...); }, [params])` triggered the project's `react-hooks/set-state-in-effect` ESLint rule which forbids synchronous setState calls inside useEffect bodies (cascading renders).
- **Fix:** Replaced the effect with the React-docs "storing information from previous renders" pattern: derive `urlSig` from current params during render, store `lastSyncedSig` in useState, and call setState during render only when the two diverge. Same external behavior (local state stays in sync with URL), zero cascading renders, lint passes.
- **Files modified:** `web/src/components/admin/automations/admin-automations-filters.tsx`
- **Verification:** `npx eslint` against Phase 20-01 files exits 0 with zero errors and zero warnings.
- **Committed in:** `a7afd6c` (Task 3 commit, bundled with the page+i18n work)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Single-file refactor inside one of the new components; same external API (props unchanged); no scope creep. The new pattern is now ready to be reused by Phase 21 Clients Admin filters.

## Issues Encountered

- The TypeScript type-check passes cleanly. The full `npm run lint` against the entire repo reports 104 pre-existing errors in unrelated files (auth, dashboard queries, signup form, etc.) — out of scope per the deviation-rules scope boundary. Pre-existing errors logged elsewhere are NOT in `deferred-items.md` for this phase since they aren't introduced by this plan.
- `npm run build` requires `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` env var on Windows to fetch Geist Google Fonts (carry-over from Phase 16 / 19). Build succeeds with the env var set. Build output emits `/admin/automations` route as `ƒ (Dynamic) — server-rendered on demand`, the expected shape.

## TypeScript-shape gotchas (for plan 20-02)

- Supabase JS embed shapes for `!inner` joins on UNIQUE-FK relations sometimes return as `T` (single object) and sometimes as `T[]`. We did NOT hit this in plan 20-01 because `automations -> organizations` is `!inner` not `!left` — but plan 20-02 detail page joining `automations -> automation_templates !left -> translations !left` will need the defensive `Array.isArray(x) ? x[0] ?? null : x ?? null` normalizer that Phase 19-01 established for `subscriptions`. Bake into the detail query from day 1.
- The translation embed comes back as `Array<{field, value, locale}>` even after the locale + field eq filters — array always, length 0..1. Always read via `translations?.[0]?.value ?? fallback`.
- `tabular-nums` Tailwind class on the Executions cell keeps numerals aligned without monospace fonts. Reuse for any aggregate-count column going forward.

## User Setup Required

None — no external service configuration. The `/admin/automations` page is wired against existing seed data (66+ templates, multiple seeded automations across the two demo orgs).

## Next Phase Readiness

- **20-02 (detail page) is unblocked.** The list table's Name column already links to `/admin/automations/[id]` — those links are dead until 20-02 ships. Acceptance noted in CONTEXT.md.
- **20-03 (status transitions) is unblocked.** The query layer + types are ready; 20-03 will add server actions next to `automation-queries.ts` (or in a new `automation-actions.ts` file) cloning the Phase 19-03 server-action skeleton.
- **AUTM-01 (List + filters) and I18N-01 (this slice) are now satisfied.** AUTM-02..05 remain for plans 20-02 + 20-03.

## Self-Check: PASSED

Files verified to exist:
- web/src/lib/admin/automation-queries.ts — FOUND
- web/src/lib/admin/types.ts — FOUND (modified)
- web/src/components/admin/automations/admin-automations-tabs.tsx — FOUND
- web/src/components/admin/automations/admin-automations-filters.tsx — FOUND
- web/src/components/admin/automations/admin-automations-table.tsx — FOUND
- web/src/app/(admin)/admin/automations/page.tsx — FOUND (overwritten)
- web/messages/en.json — FOUND (modified)
- web/messages/es.json — FOUND (modified)

Commits verified to exist on `feature/phase-20-automations-admin`:
- b65b712 — FOUND
- c5d2efc — FOUND
- a7afd6c — FOUND

Verifications run:
- `npx tsc --noEmit` exits 0 across the whole project (zero errors).
- `npm run build` exits 0 (with NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1) and emits `/admin/automations` as a dynamic server-rendered route.
- `npx eslint` against Phase 20-01 files (queries, types, 3 components, page) exits 0 with zero errors and zero warnings.
- i18n parity script: 826 total keys, zero missing in either direction.
- All 32 required `admin.automations.list.*` leaf keys present in both locales.
- `admin.placeholders.automations` removed from both locales (verified via parity script + grep).

---
*Phase: 20-automations-admin*
*Plan: 01*
*Completed: 2026-05-07*
