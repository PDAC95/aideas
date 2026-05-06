---
phase: 18-catalog-admin
verified: 2026-05-06T20:30:00Z
human_verified: 2026-05-07T00:00:00Z
status: passed
score: 6/6 truths verified, 8/8 human UAT passed
human_verification:
  - test: "Visit /admin/catalog as super_admin and confirm all 66+ templates render including any inactive seed rows; filters by category and industry narrow the list as expected"
    expected: "Table view (default) shows 9 columns (Name, Slug, Category, Industries, Pricing tier, Setup, Monthly, Active, Featured). No horizontal scroll on a 1280px viewport. Grid toggle persists in URL (?view=grid)."
    why_human: "Visual layout, dense table fit on 1280px viewport, and URL state across page reloads cannot be verified by grep. Database row counts depend on seed application that is environment-dependent."
  - test: "Toggle is_active OFF on a template that has live customer automations"
    expected: "Warn-but-allow modal opens with the count of live automations; Confirm proceeds, Cancel reverts the switch"
    why_human: "Modal interaction, optimistic update, and revert-on-cancel UX cannot be verified statically. Requires real customer automations seeded against a template id."
  - test: "Customer /dashboard/catalog after admin toggles is_active OFF on a template"
    expected: "Template disappears from customer catalog within 1 page reload (no rebuild required) thanks to revalidatePath('/dashboard/catalog')"
    why_human: "End-to-end propagation across two routes with Next.js cache invalidation requires running the dev server, signing in twice, and reloading."
  - test: "Customer /dashboard/catalog 'Mas populares' tab after admin toggles is_featured"
    expected: "Template appears/disappears in 'Mas populares' tab within 1 page reload"
    why_human: "Same dual-route cache propagation as above; requires runtime verification."
  - test: "Create new template via /admin/catalog/new in draft mode (is_active=false) leaving required fields blank"
    expected: "Form saves successfully (draft mode bypasses required-field validation), redirects to /admin/catalog, new template appears in list with Active=Inactive"
    why_human: "Form submission round-trip plus react-hook-form resolver swap on is_active toggle requires a real browser and database."
  - test: "Edit existing template via /admin/catalog/{slug}/edit, change description_es, save, then visit customer /dashboard/catalog/{slug} in ES locale"
    expected: "Updated Spanish description visible on the customer detail page on next reload (no redeploy)"
    why_human: "Three-route end-to-end propagation (admin edit -> automation_template_translations upsert -> customer locale-aware JOIN) requires running dev server with both EN and ES sessions."
  - test: "Slug auto-generation while typing name_en on /admin/catalog/new"
    expected: "Slug field populates lowercase-hyphenated derivative of name_en on each keystroke until the user manually edits the slug field; on edit page slug is read-only"
    why_human: "Keystroke-driven derivation with manual-override detection and lock-after-create state cannot be verified by grep alone."
  - test: "Toggle EN/ES via locale cookie on both admin and customer catalog"
    expected: "Column headers, switch labels, modal copy, form labels, validation messages all swap between EN and ES; no missing keys, no raw key strings showing through"
    why_human: "i18n parity check passes by file count (729 keys identical), but visual rendering with the next-intl provider must be verified at runtime."
---

# Phase 18: Catalog Admin Verification Report

**Phase Goal:** Operations can manage the `automation_templates` catalog through `/admin/catalog` UI instead of editing seed.sql.
**Verified:** 2026-05-06T20:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria)

| #   | Truth                                                                                                                                                                                                                                            | Status      | Evidence                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Staff loads `/admin/catalog` and sees ALL templates (including `is_active=false`) with the 9 specified columns; filters by category and industry work                                                                                              | ✓ VERIFIED  | `web/src/lib/admin/catalog-queries.ts:58-71` selects ALL templates with no `is_active` filter. `admin-catalog-table.tsx:81-110` renders 9 column headers. `admin-catalog-client.tsx` syncs view/category/industry/search to URL. Build emits `/admin/catalog` route.    |
| 2   | Staff creates a new template through a form with Zod validation on every required field and the new template appears in the list                                                                                                                  | ✓ VERIFIED  | `admin-catalog-template.ts:101-151` provides `adminCatalogTemplateActiveSchema.superRefine` enforcing all required fields when is_active=true. `admin-catalog.ts:220-327` `createTemplate` inserts template + 8 translation rows + revalidates `/admin/catalog`.        |
| 3   | Staff edits any field on an existing template; saves persist and customer `/dashboard/catalog` reflects the change on next load                                                                                                                    | ✓ VERIFIED  | `admin-catalog.ts:341-431` `updateTemplate` UPDATEs row + UPSERTs 8 translation rows + `revalidatePath('/dashboard/catalog')` + `revalidatePath('/admin/catalog/${slug}/edit')`. Customer `queries.ts:329` reads from `automation_template_translations` JOIN at request time. |
| 4   | Staff toggles `is_active` off; template no longer appears in customer catalog (still visible in admin list)                                                                                                                                       | ✓ VERIFIED  | Customer `queries.ts:331,374` filters `.eq("is_active", true)`. Admin query has no such filter. `toggleTemplateActive` calls `revalidatePath('/dashboard/catalog')`. Warn modal wired in `catalog-toggle-cell.tsx:131-162`.                                              |
| 5   | Staff toggles `is_featured`; template appears/disappears in customer "Mas populares" tab                                                                                                                                                          | ✓ VERIFIED  | `dashboard/catalog-client.tsx:123` counts `t.is_featured`; line 138-139 filters by `is_featured` in `mas_populares` tab. `toggleTemplateFeatured` revalidates `/dashboard/catalog`.                                                                                     |
| 6   | All admin catalog UI strings have EN/ES parity                                                                                                                                                                                                    | ✓ VERIFIED  | Parity check passes: 729 keys identical between en.json and es.json. `admin.catalog` namespace has 12 top-level keys + nested `form` section with 9 sub-namespaces (sections, fields, errors, etc.).                                                                    |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact                                                                                                | Expected                                                                                              | Status     | Details                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260507000001_template_translations.sql`                                          | translations table, RLS, 528 inserts                                                                  | ✓ VERIFIED | 2756 lines. CREATE TABLE present. 4 RLS policies (select_authenticated + admin INSERT/UPDATE/DELETE). 528 INSERT statements counted via grep.                    |
| `web/src/lib/dashboard/types.ts`                                                                        | CatalogTemplate.displayName + CatalogTemplateDetail with displayDescription/Impact/MetricLabel        | ✓ VERIFIED | 160 lines. Lines 85-102 confirm displayName, displayDescription, displayImpact, displayMetricLabel.                                                              |
| `web/src/lib/dashboard/queries.ts`                                                                      | fetchCatalogTemplates / fetchTemplateBySlug JOINing automation_template_translations                  | ✓ VERIFIED | 741 lines. Lines 320, 358 declare functions taking `locale`. Lines 329, 371 embed `automation_template_translations!inner`.                                       |
| `web/src/app/(dashboard)/dashboard/catalog/page.tsx`                                                    | passes locale to fetchCatalogTemplates, no getTranslations("templates") for template-specific copy    | ✓ VERIFIED | Imports fetchCatalogTemplates, calls with `locale`. No `getTranslations("templates")` in file.                                                                   |
| `web/src/lib/admin/catalog-queries.ts`                                                                  | fetchAdminCatalogTemplates with has_active_automations                                                | ✓ VERIFIED | 124 lines. Exports `fetchAdminCatalogTemplates` and `AdminCatalogTemplate`. Second query against `automations` aggregates active-like statuses.                  |
| `web/src/lib/actions/admin-catalog.ts`                                                                  | toggleTemplateActive/Featured + createTemplate + updateTemplate, gated by assertPlatformStaff         | ✓ VERIFIED | 431 lines. All 4 actions present. Each calls `assertPlatformStaff`. `createTemplate` rolls back on translation failure (lines 305-322).                          |
| `web/src/lib/validations/admin-catalog-template.ts`                                                     | base + active schemas with superRefine for is_active=true                                             | ✓ VERIFIED | 163 lines. Lines 52-88 base schema. Lines 101-151 active schema with superRefine on text/numeric/industry_tags. `pickAdminCatalogTemplateSchema` helper exported. |
| `web/src/lib/admin/catalog-detail-queries.ts`                                                           | fetchAdminTemplateForEdit returning template + flat translations                                      | ✓ VERIFIED | 137 lines. Returns `{ template, translations }` with all 8 `${field}_${locale}` keys. assertPlatformStaff guard.                                                 |
| `web/src/components/admin/catalog/admin-template-form.tsx`                                              | shared form, slug auto-gen, lock on edit, 5 sections, bilingual inputs                                | ✓ VERIFIED | 977 lines. Imports createTemplate/updateTemplate. `slugify` defined at line 155. Watches name_en for auto-fill. Renders 5 sections (basicInfo/categorization/pricing/metrics/translations). |
| `web/src/components/admin/catalog/admin-catalog-client.tsx`                                             | URL-synced view/category/industry/search                                                              | ✓ VERIFIED | 300 lines. "use client". Renders Table or Grid based on view.                                                                                                    |
| `web/src/components/admin/catalog/admin-catalog-table.tsx`                                              | 9-column dense table with toggle cells and edit links                                                 | ✓ VERIFIED | 191 lines. 9 column headers verified at lines 81-110. Name links to `/admin/catalog/${slug}/edit`. Inactive rows opacity-60.                                     |
| `web/src/components/admin/catalog/admin-catalog-grid.tsx`                                               | grid layout reusing toggle cells                                                                      | ✓ VERIFIED | 138 lines. Uses CatalogToggleCell.                                                                                                                                |
| `web/src/components/admin/catalog/catalog-toggle-cell.tsx`                                              | optimistic switch + revert + warn modal                                                               | ✓ VERIFIED | 170 lines. Imports toggleTemplateActive/Featured. Local state for checked/error/modalOpen. Modal renders deactivateModal copy with `{count}` interpolation.       |
| `web/src/app/(admin)/admin/catalog/page.tsx`                                                            | server-rendered list, builds translations object                                                      | ✓ VERIFIED | 124 lines. Calls fetchAdminCatalogTemplates(locale). Builds full translations object. Renders AdminCatalogClient.                                                |
| `web/src/app/(admin)/admin/catalog/new/page.tsx`                                                        | renders AdminTemplateForm mode='create' with sane defaults                                            | ✓ VERIFIED | 144 lines. mode="create", initialSlugLocked=false, defaults match plan (is_active=false, category=sales, pricing_tier=starter).                                  |
| `web/src/app/(admin)/admin/catalog/[slug]/edit/page.tsx`                                                | calls fetchAdminTemplateForEdit, passes mapped initial values, slug locked                            | ✓ VERIFIED | 196 lines. notFound() on missing template. mode="edit", initialSlugLocked=true. Cents-to-dollars conversion for setup_price/monthly_price.                       |

### Key Link Verification

| From                                       | To                                            | Via                                                                            | Status     | Details                                                                                              |
| ------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------- |
| fetchCatalogTemplates (customer)           | automation_template_translations              | Supabase embed JOIN with `.eq('translations.locale', locale)`                  | ✓ WIRED    | queries.ts:329-336 confirms embedded resource and locale filter                                      |
| /admin/catalog/page.tsx                    | fetchAdminCatalogTemplates                    | server-side call with locale + render via AdminCatalogClient                   | ✓ WIRED    | page.tsx:25-26                                                                                       |
| catalog-toggle-cell.tsx                    | toggleTemplateActive / toggleTemplateFeatured | server action invoked from client, optimistic flip + revert on failure         | ✓ WIRED    | toggle-cell.tsx:5,61-67 imports and awaits                                                           |
| toggleTemplateActive                       | automations table                             | counted server-side in fetchAdminCatalogTemplates and surfaced via has_active_automations | ✓ WIRED    | catalog-queries.ts:91-104. Note: count computed in fetch query, server action itself does not re-check (per plan: warn is client UX) |
| admin/catalog table row                    | /admin/catalog/[slug]/edit                    | Link wrapping Name column                                                      | ✓ WIRED    | admin-catalog-table.tsx:127-131                                                                      |
| createTemplate                             | automation_templates + automation_template_translations | INSERT template, INSERT 8 translations, DELETE template on translation failure | ✓ WIRED    | admin-catalog.ts:286-322. Rollback path explicit.                                                    |
| updateTemplate                             | automation_templates + automation_template_translations | UPDATE template, UPSERT 8 translation rows                                     | ✓ WIRED    | admin-catalog.ts:402-417. onConflict 'template_id,locale,field'.                                     |
| /admin/catalog/[slug]/edit                 | fetchAdminTemplateForEdit                     | server-side fetch with notFound() on null                                      | ✓ WIRED    | edit/page.tsx:61-62                                                                                  |
| AdminTemplateForm submit                   | createTemplate / updateTemplate               | react-hook-form handleSubmit; choice depends on mode prop                      | ✓ WIRED    | admin-template-form.tsx:401, 432                                                                     |
| createTemplate / updateTemplate success    | /admin/catalog list + customer /dashboard/catalog | revalidatePath calls in both actions                                          | ✓ WIRED    | admin-catalog.ts:324-325, 427-429                                                                    |

### Requirements Coverage

| Requirement | Source Plan(s)        | Description                                                                                          | Status        | Evidence                                                                                                              |
| ----------- | --------------------- | ---------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| CTLG-01     | 18-02                 | Staff sees table with ALL templates and 9 columns, filterable                                        | ✓ SATISFIED   | fetchAdminCatalogTemplates returns all rows (no is_active filter); admin-catalog-table renders 9 columns               |
| CTLG-02     | 18-03                 | Staff creates new template via form with Zod                                                         | ✓ SATISFIED   | createTemplate + adminCatalogTemplateActiveSchema; form at /admin/catalog/new                                          |
| CTLG-03     | 18-01, 18-03          | Staff edits any field; updates reflect in customer catalog                                           | ✓ SATISFIED   | updateTemplate + revalidatePath + customer query reading from translations table at request time                       |
| CTLG-04     | 18-02                 | Staff toggles is_active; inactive templates hidden from customer catalog                             | ✓ SATISFIED   | toggleTemplateActive + customer query filter `.eq("is_active", true)`                                                  |
| CTLG-05     | 18-02                 | Staff toggles is_featured; controls "Mas populares" tab                                              | ✓ SATISFIED   | toggleTemplateFeatured + customer catalog-client filters mas_populares by is_featured                                  |
| I18N-01     | 18-02, 18-03 (cross-cutting) | All admin UI strings present in EN and ES at full parity                                       | ✓ SATISFIED   | 729 keys identical; admin.catalog and admin.catalog.form namespaces present in both files                              |

No orphaned requirements: REQUIREMENTS.md maps CTLG-01..05 to Phase 18 (all claimed). I18N-01 is cross-cutting; phase 18 surface satisfied by admin.catalog.* keys.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |

No anti-patterns detected. No TODO/FIXME/PLACEHOLDER strings in any phase 18 source. The only matches for "placeholder" were legitimate HTML attribute references (search input placeholder, connectedAppsPlaceholder i18n key).

### Build Verification

- `npm run build` exits 0
- All 3 admin catalog routes emitted: `/admin/catalog`, `/admin/catalog/new`, `/admin/catalog/[slug]/edit`
- i18n parity check (729 keys) passes
- TypeScript compiles with no errors

### Branch Verification

- Branch `feature/phase-18-catalog-admin` (per task brief). Recent commits show 9 phase-18 commits (3 feat + 3 docs + 3 plan polish/fixup) covering all 3 plans.

### Human Verification Required

8 items need human testing — see frontmatter `human_verification:` for full details. Summary:

1. **Admin list rendering at 1280px** — Verify 9-column table fits without horizontal scroll, view toggle persists in URL
2. **Deactivation warn modal** — Toggle is_active OFF on a template with live automations, confirm modal opens with count
3. **Customer catalog cache propagation (deactivate)** — After admin deactivates template, customer catalog hides it on next reload
4. **Customer "Mas populares" propagation** — After admin toggles featured, customer tab updates on next reload
5. **Draft mode create flow** — Create template with is_active=false, leave required fields blank, save succeeds
6. **End-to-end edit propagation** — Edit description_es, save, verify customer ES locale shows new value
7. **Slug auto-generation + lock** — Verify slug auto-fills on name_en keystrokes (create) and is read-only (edit)
8. **EN/ES locale toggle** — Switch locale cookie, verify all admin/customer strings swap correctly

### Gaps Summary

No automated gaps. All 6 success criteria verified at the code/artifact level. All 13 must-have artifacts exist with substantive line counts (124-2756 lines, no stubs). All 10 key links wired (server actions invoked, revalidatePath called, queries embed translations JOIN, form submits to right server action). All 6 requirement IDs (CTLG-01..05, I18N-01) satisfied.

The phase goal is structurally achieved: ops can now manage the catalog through `/admin/catalog`, `/admin/catalog/new`, and `/admin/catalog/[slug]/edit` instead of editing `seed.sql`. The translations data plane (Plan 18-01) ensures admin edits propagate to customers without redeploy.

Human verification is needed only for runtime UX behaviors that cannot be statically grepped: layout fit, modal interaction, form submission round-trip, cache invalidation across routes, and visual locale swap. None of these block confidence that the wiring is correct — they are the standard end-to-end UAT pass that always follows automated verification.

**Recommended next step:** run `/gsd:verify-work` against the 8 human-verification items above with the dev server, then mark Phase 18 complete in ROADMAP.md.

---

_Verified: 2026-05-06T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
