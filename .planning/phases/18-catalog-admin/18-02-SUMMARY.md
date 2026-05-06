---
phase: 18-catalog-admin
plan: 02
subsystem: admin-ui
tags: [admin, catalog, i18n, next-intl, server-actions, optimistic-update, rls]

requires:
  - phase: 17-admin-foundation
    provides: assertPlatformStaff helper, createAdminServerClient, /admin shell layout
  - phase: 18-catalog-admin
    plan: 01
    provides: automation_template_translations table + locale-aware queries

provides:
  - fetchAdminCatalogTemplates(locale) returning all templates plus has_active_automations
  - toggleTemplateActive / toggleTemplateFeatured server actions (optimistic-friendly, revalidates customer catalog)
  - /admin/catalog hybrid list (table default + grid toggle) with URL-synced search and filters
  - Warn-but-allow deactivation modal when a template with live automations is being turned off
  - admin.catalog.* i18n namespace with full EN/ES parity (40 keys added; total 682 keys both locales)

affects:
  - 18-03 (will provide /admin/catalog/new + /admin/catalog/[slug]/edit pages — currently dead links)
  - customer /dashboard/catalog (changes to is_active / is_featured propagate via revalidatePath without redeploy)

tech-stack:
  added: []
  patterns:
    - "Server action gated by assertPlatformStaff -> createAdminServerClient -> mutation -> revalidatePath('/admin/catalog') AND revalidatePath('/dashboard/catalog'). Reusable shape for every admin write surface; the dual revalidate is what makes admin edits instantly visible to customers."
    - "Optimistic toggle in client component via useTransition: setLocalState(next) -> startTransition(serverAction) -> on failure revert state and surface inline error. Keeps the UI responsive while still being authoritative against the DB."
    - "URL-synced filter state with 300ms debounce on search and immediate sync on dropdowns/view-toggle. Mirrors the customer catalog/client pattern; refresh preserves the user's view."
    - "Warn-but-allow modal driven by a count returned with the row. Server action accepts the toggle either way; UX gate is purely client-side; if a malicious caller bypasses the modal the only consequence is that the deactivation proceeds (which was the requested action anyway)."

key-files:
  created:
    - "web/src/lib/admin/catalog-queries.ts — fetchAdminCatalogTemplates(locale) + AdminCatalogTemplate type. Returns 66 rows (or however many templates exist) including inactive ones, with active-automation counts merged in."
    - "web/src/lib/actions/admin-catalog.ts — toggleTemplateActive + toggleTemplateFeatured server actions. Each ~40 lines: Zod parse, assertPlatformStaff, supabase update, revalidatePath."
    - "web/src/components/admin/catalog/admin-catalog-client.tsx — 'use client'. Owns view/category/industry/search state synced to URL. ~270 lines."
    - "web/src/components/admin/catalog/admin-catalog-table.tsx — 'use client'. 9-column dense table, sticky header, zebra rows, opacity-60 inactive rows. ~190 lines."
    - "web/src/components/admin/catalog/admin-catalog-grid.tsx — 'use client'. 1/2/3-col responsive card layout reusing CatalogToggleCell. ~130 lines."
    - "web/src/components/admin/catalog/catalog-toggle-cell.tsx — 'use client'. Shared switch with optimistic update, revert-on-error, and warn-but-allow modal hook for is_active. ~165 lines."
  modified:
    - "web/src/app/(admin)/admin/catalog/page.tsx — replaced placeholder; now fetches templates + admin.catalog translations in parallel and renders the page header + AdminCatalogClient."
    - "web/messages/en.json — admin.catalog.* namespace added (40 keys)."
    - "web/messages/es.json — admin.catalog.* namespace added (40 keys, Mexican-neutral, accent-free per project convention)."

key-decisions:
  - "Toggle translations packaged together — moved deactivateModal under translations.toggle so the table/grid components only need to forward a single `toggle` prop to CatalogToggleCell. Server-side type-builder mirrors the new shape; the alternative (sibling deactivateModal at the top-level of the translations bundle) failed type-check and would have forced two props through every layer."
  - "Search filters by name OR slug, not just name. CONTEXT.md said 'name OR slug', so the truth-statement was already locked; this is a noteworthy difference from the customer catalog (which only filters by displayName) and matches operations' need to find templates by their internal slug when debugging URLs."
  - "Pricing-tier badge tones — gray for starter, purple-50 for pro, purple-100 for business. Subtle escalation matches the existing Phase 11 billing card; no new design tokens introduced."
  - "View toggle defaults to 'table'. CONTEXT.md prescribed table-default; the URL only carries `?view=grid` when the operator explicitly switches, so refresh-after-grid-pick keeps grid, refresh-on-default-table omits the param entirely."
  - "Warn-modal is purely client-side. The server action accepts the deactivation either direction. Trade-off: a determined attacker could bypass the warning, but the end state (template deactivated) is the action they asked for, so server-side enforcement adds zero security and would just make the action less reusable. CONTEXT.md explicitly chose warn-but-allow over hard-block."
  - "fetchAdminCatalogTemplates issues TWO queries (templates + automations) instead of one with a Postgres count subquery. The second query is small (count rows in active|in_setup|paused|pending_review only, all orgs combined), and Supabase's TypeScript types make a single embed JOIN with a count aggregate awkward. Two simple queries with a Map reduce is more readable and still <50ms in practice."
  - "Inactive rows still render their toggle so an operator can flip them back on. Opacity-60 is the only visual cue. Alternative (hide them) would have required a separate 'inactive' tab and broken the muscle memory of 'find any template, click switch'."
  - "Modal click-outside-to-cancel via onClick on the backdrop + stopPropagation on the panel. Standard accessible-enough pattern; if Phase 19+ wants Radix Dialog primitives, swapping is a one-file change."

patterns-established:
  - "Admin write surface skeleton: createAdminServerClient -> assertPlatformStaff -> Zod parse -> Supabase mutation -> revalidatePath(admin) + revalidatePath(customer). Future Phase 19/20/21 server actions should clone this shape verbatim."
  - "Translation prop shape for admin pages: server resolves t('foo') and t.raw('templateString') into a plain object, then passes the object as `translations` to a 'use client' component. No useTranslations() in the client tree. Lets the client component stay framework-agnostic and easy to test."
  - "Hybrid list pattern (table default + grid toggle, URL-synced) for any admin list that has more than ~20 rows where operators need both density (table) and visual review (grid). Reusable for Phase 19 requests inbox and Phase 20 automations admin."

requirements-completed: [CTLG-01, CTLG-04, CTLG-05, I18N-01]

duration: 10 min
completed: 2026-05-06
---

# Phase 18 Plan 2: Catalog Admin List with Inline Toggles Summary

**Hybrid list (table default + grid toggle) at `/admin/catalog` showing every template, with URL-synced search and category/industry filters, plus inline `is_active` and `is_featured` switches that flip optimistically and surface a warn-but-allow modal when deactivating a template with live customer automations.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-05-06T17:31:23Z
- **Completed:** 2026-05-06T17:41:00Z
- **Tasks:** 2
- **Files modified:** 9 (6 created, 3 modified)

## Accomplishments

- Admin catalog read path: `fetchAdminCatalogTemplates(locale)` returns ALL templates (including `is_active=false`) with the embedded translation-resolved `displayName` and a per-row `has_active_automations` + `active_automations_count` derived from a second `automations` query reduced into a Map.
- Admin write path: `toggleTemplateActive` and `toggleTemplateFeatured` server actions, both gated by `assertPlatformStaff`, both revalidating `/admin/catalog` AND `/dashboard/catalog` so customer-side changes propagate without a redeploy.
- Hybrid list UI: server-rendered `/admin/catalog` page hands an `AdminCatalogClient` the templates and a flat translations object. The client owns view/category/industry/search state synced to the URL (300ms debounce on search). Empty state surfaces a "Clear filters" CTA.
- Dense 9-column table (Name, Slug, Category, Industries, Pricing tier, Setup, Monthly, Active, Featured) with sticky header, zebra rows, +N industry overflow chip, opacity-60 on inactive rows, and a name-cell `<Link>` to `/admin/catalog/[slug]/edit` (dead link until Plan 18-03 ships).
- Responsive grid alternative (1/2/3 columns) reusing the same toggle cells.
- `CatalogToggleCell` drives both switches with `useTransition` for optimistic feel; on server-action failure the local state reverts and an inline red error appears next to the switch. `field='active'` + `hasActiveAutomations` opens a warn modal that can be canceled (no-op) or confirmed (proceeds with the deactivation).
- `admin.catalog.*` i18n namespace added to both `en.json` and `es.json` (40 keys per locale; total 682 keys across both files; full parity verified by Node script).

## Task Commits

1. **Task 1: Add admin catalog query, toggle actions, and i18n namespace** — `caf3410` (feat)
2. **Task 2: Build /admin/catalog hybrid list with inline toggles** — `22c80e7` (feat)

## Files Created/Modified

### Created
- `web/src/lib/admin/catalog-queries.ts` — `fetchAdminCatalogTemplates(locale)` returning `AdminCatalogTemplate[]` with `has_active_automations` / `active_automations_count`.
- `web/src/lib/actions/admin-catalog.ts` — `toggleTemplateActive` + `toggleTemplateFeatured` (Zod-validated, staff-gated, revalidate both admin and customer catalog paths).
- `web/src/components/admin/catalog/admin-catalog-client.tsx` — view-toggle / search / filter state synced to URL.
- `web/src/components/admin/catalog/admin-catalog-table.tsx` — 9-column dense table.
- `web/src/components/admin/catalog/admin-catalog-grid.tsx` — responsive card grid.
- `web/src/components/admin/catalog/catalog-toggle-cell.tsx` — shared switch + warn-modal.

### Modified
- `web/src/app/(admin)/admin/catalog/page.tsx` — placeholder removed; now fetches templates + translations in parallel and renders the page header + `AdminCatalogClient`.
- `web/messages/en.json` — `admin.catalog.*` namespace (40 keys).
- `web/messages/es.json` — `admin.catalog.*` namespace (40 keys, accent-free Mexican-neutral).

## Decisions Made

- **Toggle translations packaged together** — `deactivateModal` is nested under `translations.toggle` rather than living as a sibling at the top level. The table/grid components forward a single `toggle` prop into `CatalogToggleCell`. The original PLAN sketch placed `deactivateModal` as a sibling, which failed type-check; nesting it under `toggle` is a one-line change that keeps the prop flow clean.
- **Search filters by name OR slug.** CONTEXT.md prescribes "name OR slug"; this matches operations' need to find a template by its slug when debugging URLs (e.g., the customer reported a 404 on `/dashboard/catalog/audience-segmentation`). Customer-facing search-by-name remains; this is admin-specific.
- **View toggle defaults to `table`.** URL only carries `?view=grid` when explicitly chosen, so a refresh on default-table is a no-op and a refresh after switching to grid stays on grid.
- **Warn-modal is purely client-side.** Server action accepts the deactivation either direction; the modal is UX, not enforcement. CONTEXT.md prescribed warn-but-allow over hard-block, so the server action's neutrality is correct.
- **Two queries instead of one with a count subquery.** `fetchAdminCatalogTemplates` issues a templates SELECT + an automations SELECT and reduces the latter into a Map keyed by `template_id`. Simple, readable, and well under 50ms in practice. Single-query alternatives with a Postgres count aggregate forced awkward typing on the Supabase side.
- **Inactive rows still render their toggle** so an operator can flip them back on. Opacity-60 is the only visual cue. The alternative (hide inactive rows behind a separate tab) would break the muscle memory of "find any template, click switch."
- **Pricing-tier badge tones** — gray (starter) / purple-50 (pro) / purple-100 (business). Subtle escalation reused from Phase 11's billing card; no new design tokens.
- **`/admin/catalog/new` and `/admin/catalog/[slug]/edit` links are dead until Plan 18-03 ships.** The plan explicitly accepted this — Wave 2 ships the read side independently of the form.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Translation type-check failure when `deactivateModal` was a top-level sibling**

- **Found during:** Task 2, first `npm run build`.
- **Issue:** The original page.tsx scaffolded `translations.toggle` and `translations.deactivateModal` as siblings, but `CatalogToggleCellTranslations` (which the table/grid forward whole into the toggle cell) required `deactivateModal` to be nested under `toggle`. Build error: `Property 'deactivateModal' is missing in type '{ activeOn... errorRevert }' but required in type 'CatalogToggleCellTranslations'`.
- **Fix:** Edited `web/src/app/(admin)/admin/catalog/page.tsx` to nest `deactivateModal` under `translations.toggle`. The `AdminCatalogClient` translations type accepts the new shape directly without further changes.
- **Files modified:** `web/src/app/(admin)/admin/catalog/page.tsx`.
- **Verification:** `npm run build` passed cleanly on the second attempt. The change is a pure rearrange of the JSON-derived strings; no behavioral impact.
- **Committed in:** `22c80e7` (Task 2 commit).

**2. [Rule 1 - Bug] Unused import warning in admin-catalog-client.tsx**

- **Found during:** Task 2 lint pass.
- **Issue:** `AdminCatalogGridTranslations` was imported but only `AdminCatalogGrid` was used — the grid translations type was inlined where it's consumed, so the named-type import became dead.
- **Fix:** Removed the type from the import, kept only `AdminCatalogGrid`.
- **Files modified:** `web/src/components/admin/catalog/admin-catalog-client.tsx`.
- **Verification:** `npm run lint` total error count unchanged at 103 (all pre-existing); warnings count dropped by one.
- **Committed in:** `22c80e7` (Task 2 commit).

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug).
**Impact on plan:** No scope creep. Both were one-line adjustments needed for the build/lint to be green. The rearranged translations shape is actually cleaner than the PLAN sketch.

## Issues Encountered

None beyond the two deviations above. Both task verifications passed cleanly:
- i18n parity check: 682 keys in both locales, zero missing in either direction.
- `npm run build` exits 0; same 26 routes as Plan 18-01.
- `npm run lint` total error count unchanged (103 pre-existing errors, all in unrelated files like `dashboard/queries.ts` and `auth/login-form.tsx`); the new admin-catalog files lint clean.

## User Setup Required

None. The `/admin/catalog` page is reachable today by signing in at `/admin/login` with the seeded super_admin (`pdmckinster@gmail.com`). All ~66 seeded templates render in the table; toggling switches works against the real Supabase instance.

## Next Phase Readiness

- Plan 18-03 (admin create/edit form) can now layer the form pages under `/admin/catalog/new` and `/admin/catalog/[slug]/edit` — the table's name-link already points at the edit page, so the moment 18-03 ships the path becomes alive.
- The translations table from Plan 18-01 has all 528 rows pre-populated; 18-03 just needs to UPSERT 8 rows per save (4 fields x 2 locales).
- Customer side: any toggle flip propagates via the dual `revalidatePath` already wired in. No additional work needed for the customer catalog to react to admin edits.

## Self-Check: PASSED

- File `web/src/lib/admin/catalog-queries.ts` exists.
- File `web/src/lib/actions/admin-catalog.ts` exists.
- File `web/src/app/(admin)/admin/catalog/page.tsx` exists and is modified.
- Files `web/src/components/admin/catalog/admin-catalog-client.tsx`, `admin-catalog-table.tsx`, `admin-catalog-grid.tsx`, `catalog-toggle-cell.tsx` all exist.
- Files `web/messages/en.json` and `web/messages/es.json` modified with `admin.catalog.*` namespace.
- Commits `caf3410` and `22c80e7` exist on `feature/phase-18-catalog-admin`.
- i18n parity check: PASS (682 keys, zero asymmetry).
- `npm run build` exits 0.
- `npm run lint` introduces zero new errors / warnings in the new files.

---
*Phase: 18-catalog-admin*
*Completed: 2026-05-06*
