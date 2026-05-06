---
phase: 18-catalog-admin
plan: 03
subsystem: admin-ui
tags: [admin, catalog, i18n, next-intl, react-hook-form, zod, server-actions, forms, validation]

requires:
  - phase: 17-admin-foundation
    provides: assertPlatformStaff helper, createAdminServerClient, /admin shell layout
  - phase: 18-catalog-admin
    plan: 01
    provides: automation_template_translations table + locale-aware queries
  - phase: 18-catalog-admin
    plan: 02
    provides: /admin/catalog list with dead links to /new and /[slug]/edit, admin.catalog.* i18n namespace, toggle server actions

provides:
  - createTemplate / updateTemplate server actions (atomic template + 8 translations, rollback on partial failure)
  - fetchAdminTemplateForEdit(slug) server-side query returning template row + flat translations object
  - adminCatalogTemplateBaseSchema (always-required structural validation) and adminCatalogTemplateActiveSchema (refined with all activation gates)
  - <AdminTemplateForm /> shared client component (5 sections, slug auto-gen, industries chips, connected_apps multi-select, bilingual inputs, draft mode)
  - /admin/catalog/new page (server-rendered, renders form in create mode)
  - /admin/catalog/[slug]/edit page (server-rendered, renders form pre-populated with edit mode + slug locked)
  - admin.catalog.form.* i18n namespace at full EN/ES parity (47 keys per locale; 729 total parity)

affects:
  - customer /dashboard/catalog (admin creates/edits propagate via revalidatePath without redeploy)
  - any future admin write surface that needs the create/update + translations atomic pattern

tech-stack:
  added: []
  patterns:
    - "Custom RHF Resolver bridging form-layer values (USD strings, blank-as-null numerics) to Zod-layer values (cents, integers, nullable). Schema selection inside the resolver swaps between base and active variants based on current is_active so draft saves bypass activation gates without remounting the form."
    - "Translation-write atomicity: INSERT template -> INSERT 8 translation rows -> on failure DELETE the orphan template row. Update path uses UPDATE template -> UPSERT 8 translation rows on (template_id, locale, field) PK so re-saves are idempotent."
    - "Slug auto-gen via NFKD-normalize-and-strip-accents slugify on each name_en keystroke; sticky 'manual edit' flag (slugManuallyEdited ref) stops auto-sync once the operator types in the slug field directly. On edit pages slugManuallyEdited initializes true so the field is treated as locked."
    - "Form-layer dollar-vs-cent conversion: input shows USD with step=0.01; dollarsToCents helper rounds to integer cents on submit; centsToDollarString helper renders persisted cents as USD on edit. Zod schema only ever sees cents — server is authoritative."

key-files:
  created:
    - "web/src/lib/validations/admin-catalog-template.ts — Zod schemas (base + active superRefine) plus pickAdminCatalogTemplateSchema helper. Exports the 3 enum constants (categories, industries, pricing tiers) for client and server reuse."
    - "web/src/lib/admin/catalog-detail-queries.ts — fetchAdminTemplateForEdit(slug) returns the full template row plus a flat { name_en, name_es, ..., activity_metric_label_es } object built from the 8 translation rows. Defensive empty-string fallbacks for missing translation rows."
    - "web/src/components/admin/catalog/admin-template-form.tsx — 760-line shared form (use client). Custom RHF resolver, 5 grouped sections, slug auto-gen + lock, industries chips, connected_apps multi-select with datalist suggestions, 8 bilingual inputs, sticky submit row."
    - "web/src/app/(admin)/admin/catalog/new/page.tsx — server-rendered create entry. Pre-resolves the full translations bundle and instantiates initial values with is_active=false (so first save is a draft) and category=sales / pricing_tier=starter defaults."
    - "web/src/app/(admin)/admin/catalog/[slug]/edit/page.tsx — server-rendered edit entry. Loads via fetchAdminTemplateForEdit, calls notFound() on miss, maps cents -> USD-strings for the form's price fields, passes initialSlugLocked=true so the slug input is read-only."
  modified:
    - "web/src/lib/actions/admin-catalog.ts — added createTemplate + updateTemplate server actions (in addition to existing toggleTemplateActive / toggleTemplateFeatured). Both gated by assertPlatformStaff; both revalidate /admin/catalog and /dashboard/catalog (and update revalidates the edit page itself)."
    - "web/messages/en.json — admin.catalog.form.* namespace added (47 keys)."
    - "web/messages/es.json — admin.catalog.form.* namespace added (47 keys, Mexican-neutral, accent-free per project convention)."

key-decisions:
  - "Pricing input layer is USD, schema layer is cents. The form's price fields accept dollars with step=0.01 and inputMode=decimal; submit converts to integer cents via dollarsToCents which rounds to the nearest cent. Edit pre-fills via centsToDollarString so the operator sees what they typed (or close to it). Zod only ever validates cents, so server-side validation matches what gets persisted."
  - "Custom RHF resolver instead of zodResolver. zodResolver from @hookform/resolvers/zod expects 1:1 form-to-schema mapping; our form has different shapes (USD strings, blank-as-null numerics, snake_case price field rename). The custom resolver does formToZodInput conversion before safeParse, then maps Zod paths back to form-field paths (only setup_price -> setup_price_dollars and monthly_price -> monthly_price_dollars need renaming)."
  - "Schema selection happens INSIDE the resolver, not via prop swap. The resolver reads the current is_active value from the form on each invocation and picks adminCatalogTemplateActiveSchema or adminCatalogTemplateBaseSchema accordingly. After is_active toggles, an effect calls form.trigger() if the form has been submitted, so existing errors update without remounting."
  - "Slug auto-gen on EN-name keystroke vs an explicit 'Generate' button. The auto-gen approach matches the planner's CONTEXT decision and feels more natural to operators creating new templates. The slugManuallyEdited ref prevents the auto-gen from clobbering manual edits — once you type in the slug field, name_en changes no longer rewrite it."
  - "Slug field is disabled (not hidden) on edit pages with a lock icon to communicate the constraint. CONTEXT.md prescribes lock-after-creation; rendering the value (read-only) keeps the operator oriented during edit. Hidden-field would require either an empty placeholder or a duplicate display element above the form."
  - "Connected apps as multi-select with datalist suggestions, NOT chips. CONTEXT.md prescribed 'multi-select dropdown' over chips because the connected_apps list grows over time and a 6-chip pattern only scales to a fixed enum (like industries). The datalist gives the 12 most-common app names as autocomplete suggestions while still allowing free-text additions via Enter."
  - "Industries chips reuse the customer catalog visual pattern (border-purple when selected). Operators who flip between admin and customer catalog will see the same toggle pattern, reducing cognitive overhead."
  - "Atomic create with rollback over a database transaction. Supabase's JS client doesn't expose transactions across multiple .from(...) calls; the rollback strategy (DELETE the orphan template if translations INSERT fails) is the closest we can get without dropping to a stored procedure. The rollback is best-effort: if both the translations INSERT and the rollback DELETE fail, the orphan row is logged with templateId so an operator can clean it up. In practice this only happens if the DB is offline mid-write."
  - "Update path uses UPSERT on (template_id, locale, field) instead of DELETE + INSERT. Idempotent re-saves leave the table in the same state; partial saves don't clear other locales' rows. The PK on the table makes the UPSERT a single round trip."
  - "Legacy text columns (name, description, typical_impact_text, activity_metric_label) are KEPT and synced to EN values on every create/update. The customer-facing query layer reads from translations after Plan 18-01, but any unmigrated reader (e.g. an admin export script) would still see sane EN strings. The cost is one extra column per row, which is negligible. Drop these columns only when the migration namespace is empty AND no consumer references them."
  - "The 'Active' toggle is a regular HTML checkbox styled with Tailwind, not a switch component. shadcn/ui doesn't ship a Switch primitive in this project (only Button, Card, Form, Input, Label). The checkbox + 'Active in catalog' label communicates the same idea at zero new-component cost. The is_active state is also exposed as a label hint ('When OFF, template is saved as draft and required-field validation is skipped') so operators understand what activating does."
  - "Spanish translations stay accent-free per project convention (Informacion basica, Categorizacion, Categoria, etc.). Matches the existing es.json shape; tested against the 729-key parity check."

patterns-established:
  - "Atomic template + translations write pattern: assertPlatformStaff -> Zod parse -> INSERT/UPDATE template -> INSERT/UPSERT 8 translation rows -> revalidate admin AND customer routes. Future entities that need (parent, locale, field, value) translation tables (FAQ items, knowledge-base posts, marketing copy) should clone this shape verbatim."
  - "Form schema with conditional refinement for draft mode. Base schema enforces structural validation (slug shape, enum membership, numeric ranges) always; superRefine on top adds activation gates only when a status flag is true. Pattern reusable for any 'save as draft / publish' workflow (Phase 19 request templates, Phase 22 marketing campaigns)."
  - "Server actions return discriminated unions with field-level error maps. createTemplate / updateTemplate return { ok: true } or { ok: false, error, fieldErrors? }. The form maps fieldErrors back onto its inputs via setError. Same shape as authentication actions in (auth)/."

requirements-completed: [CTLG-02, CTLG-03, I18N-01]

duration: 12 min
completed: 2026-05-06
---

# Phase 18 Plan 3: Admin Catalog Create/Edit Form Summary

**Single-page grouped form at /admin/catalog/new and /admin/catalog/[slug]/edit with slug auto-gen, draft-mode-aware Zod validation, industries-as-chips, connected_apps multi-select, and atomic template + 8 translations writes.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-06T17:47:06Z
- **Completed:** 2026-05-06T17:59:14Z
- **Tasks:** 2
- **Files modified:** 8 (5 created, 3 modified)

## Accomplishments

- New Zod schemas: `adminCatalogTemplateBaseSchema` (always-required structural validation) + `adminCatalogTemplateActiveSchema` (refines with activation gates via superRefine). Helper `pickAdminCatalogTemplateSchema(isActive)` selects the right one. Both client form and server actions use the same selection logic so the server is authoritative.
- New server actions `createTemplate` / `updateTemplate` in `web/src/lib/actions/admin-catalog.ts` (alongside the existing toggle actions). Atomic create: INSERT template -> INSERT 8 translation rows -> on translation failure DELETE the orphan template. Update: UPDATE template -> UPSERT 8 translation rows on (template_id, locale, field). Both revalidate `/admin/catalog` and `/dashboard/catalog`; update also revalidates the edit page itself.
- New server-side query `fetchAdminTemplateForEdit(slug)` returning the template row plus a flat `{ name_en, name_es, description_en, ..., activity_metric_label_es }` object built from the 8 translation rows. Defensive empty-string fallback for missing rows.
- Shared `<AdminTemplateForm />` client component with 5 grouped sections (Basic info, Categorization, Pricing, Metrics, Translations) and one sticky submit row. Slug auto-generates from `name_en` on each keystroke (NFKD-normalize-and-strip-accents slugify, capped at 100 chars). Industries render as 6 togglable chips, connected_apps as a multi-select with chips + remove-X and a datalist of 12 common app suggestions. 8 bilingual inputs (EN+ES side-by-side) for the 4 translatable text fields.
- New pages `/admin/catalog/new` (form in create mode, draft-mode defaults) and `/admin/catalog/[slug]/edit` (form pre-populated, slug input locked with lock icon, cents converted to USD on display). Plan 18-02's "New template" button and table-row name links now resolve to real pages.
- `admin.catalog.form.*` i18n namespace added to both `en.json` and `es.json` (47 keys per locale, 729 total parity verified by the parity script).

## Task Commits

1. **Task 1: Add Zod schema, create/update server actions, and admin.catalog.form i18n keys** — `47ae997` (feat)
2. **Task 2: Build the shared form component + new and edit pages with slug auto-gen and bilingual inputs** — `e140e51` (feat)

**Plan metadata commit:** to follow.

## Files Created/Modified

### Created

- `web/src/lib/validations/admin-catalog-template.ts` — Zod base + active schemas plus the 3 enum constants exported for shared client/server use.
- `web/src/lib/admin/catalog-detail-queries.ts` — `fetchAdminTemplateForEdit(slug)` returning template row + flat translations object.
- `web/src/components/admin/catalog/admin-template-form.tsx` — single-page grouped form (use client), 5 sections, slug auto-gen, industries chips, connected_apps multi-select, 8 bilingual inputs, sticky submit row, custom RHF resolver bridging USD/string-numerics to cents/integers.
- `web/src/app/(admin)/admin/catalog/new/page.tsx` — server-rendered create entry.
- `web/src/app/(admin)/admin/catalog/[slug]/edit/page.tsx` — server-rendered edit entry with slug locked.

### Modified

- `web/src/lib/actions/admin-catalog.ts` — extended with `createTemplate` (atomic create + rollback) and `updateTemplate` (update + UPSERT translations).
- `web/messages/en.json` — `admin.catalog.form.*` namespace added (47 keys).
- `web/messages/es.json` — `admin.catalog.form.*` namespace added (47 keys, accent-free Mexican-neutral).

## Decisions Made

- **Pricing input layer is USD, schema layer is cents.** The form fields accept dollars with `step=0.01`; submit calls `dollarsToCents` to round to integer cents; edit pre-fills via `centsToDollarString`. Zod only ever validates cents.
- **Custom RHF resolver instead of `zodResolver`.** `zodResolver` from `@hookform/resolvers/zod` expects 1:1 form-to-schema mapping; this form needs USD-to-cents conversion plus blank-as-null coercion for numeric fields. The custom resolver does `formToZodInput` first, then `safeParse`, then maps `setup_price` -> `setup_price_dollars` and `monthly_price` -> `monthly_price_dollars` paths back onto the form fields.
- **Schema selection happens inside the resolver, not via prop swap.** The resolver reads `is_active` from the values on each invocation and picks active vs base accordingly. An effect calls `form.trigger()` after `is_active` toggles (only when the form has already been submitted) so existing errors update without remounting the form.
- **Slug auto-gen on EN-name keystroke + sticky manual-edit flag.** A `slugManuallyEdited` ref starts `false` on create / `true` on edit. As long as the user has not typed in the slug field directly, name_en changes auto-rewrite the slug via the slugify helper. On edit pages the ref starts `true` so the slug is treated as immutable; the input is also visually disabled with a lock icon.
- **Slug input is disabled (not hidden) on edit pages.** Communicates the lock-after-creation constraint without removing the value from the operator's view. CONTEXT.md prescribed lock-after-creation; this is the visual treatment.
- **Connected apps as multi-select with datalist, not chips.** Industries are a fixed 6-element enum and chip-toggle scales fine; connected_apps grows over time so chip-toggle would explode. Multi-select with chips-as-selected-items and a datalist of common suggestions (Slack, HubSpot, Salesforce, Zapier, Notion, Airtable, Stripe, Google Workspace, WhatsApp, Mailchimp, Zoho, Pipedrive) is the planner's prescribed shape.
- **Atomic create with best-effort rollback.** Supabase JS does not expose transactions across multiple `.from(...)` calls. Rollback strategy: INSERT template -> INSERT translations -> on translation failure DELETE the template. If both fail, log the orphan templateId for manual cleanup. In practice the only way both fail is the DB going offline mid-write, which is rare.
- **Update path uses UPSERT on `(template_id, locale, field)`** instead of DELETE + INSERT. Idempotent re-saves leave the table in the same state; partial saves don't clear other locales' rows.
- **Legacy text columns kept and synced to EN.** `automation_templates.{name, description, typical_impact_text, activity_metric_label}` are written with the EN translation values on every create/update so any unmigrated reader (admin export, debug query) sees sane strings. Drop only when no consumer remains.
- **Active toggle as HTML checkbox, not a switch.** shadcn/ui in this project does not ship a Switch primitive; a checkbox + label hint communicates the draft-vs-active state at zero new-component cost.
- **Spanish translations stay accent-free.** Matches existing es.json convention; "Informacion basica", "Categoria", "Metricas", "Traducciones", etc.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Custom RHF resolver type-check failure on the error path**

- **Found during:** Task 2, first `npm run build`.
- **Issue:** The initial resolver returned `{ values: {} as AdminTemplateFormValues, errors }` for the validation-failure case. RHF v7's `ResolverResult` type requires the error case to be `{ values: {} (Record<string, never>), errors: FieldErrors<T> }` — the `values` property must be the empty object literal, not the form-values type. Build failed with "Type 'AdminTemplateFormValues' is not assignable to type 'Record<string, never>'".
- **Fix:** Changed the error return to `{ values: {}, errors: errors as FieldErrors<AdminTemplateFormValues> }` and imported `FieldErrors` and `ResolverResult` types alongside `Resolver` from react-hook-form. The success branch keeps `{ values, errors: {} }` unchanged.
- **Files modified:** `web/src/components/admin/catalog/admin-template-form.tsx` (resolver definition + imports).
- **Verification:** `npm run build` exits 0 with 28 routes including `/admin/catalog/new` and `/admin/catalog/[slug]/edit`.
- **Committed in:** `e140e51` (Task 2 commit).

**2. [Rule 1 - Bug] Unused-disable warning from the eslint-disable comment for no-misleading-character-class**

- **Found during:** Task 2 lint pass.
- **Issue:** The slugify helper used `/[̀-ͯ]/g` (combining diacritics range U+0300–U+036F) to strip accents after NFKD normalize. I added an `// eslint-disable-next-line no-misleading-character-class` comment defensively, but ESLint reported the disable as unused — the rule did not actually fire on this regex shape, so the comment was dead.
- **Fix:** Removed the unused-disable comment.
- **Files modified:** `web/src/components/admin/catalog/admin-template-form.tsx`.
- **Verification:** `npm run lint` total error count stays at 103 (all pre-existing); warning count drops by one (the unused-disable warning is gone). `npm run build` still passes.
- **Committed in:** `e140e51` (Task 2 commit, applied right before commit).

---

**Total deviations:** 2 auto-fixed (1 blocking type-check, 1 bug — dead eslint-disable comment).
**Impact on plan:** No scope creep. Both were small adjustments needed for build/lint to be green. The custom resolver shape is canonical RHF v7; the eslint-disable removal is a one-line cleanup.

## Issues Encountered

None beyond the two deviations above. Both tasks' verifications passed:

- i18n parity check: 729 keys in both locales, zero missing in either direction.
- `npm run build` exits 0; 28 routes (up from 26 — the two new admin pages are alive).
- `npm run lint` total error count unchanged at 103 (all pre-existing in `dashboard/queries.ts`, `auth/login-form.tsx`, etc.); the new admin-template-form, admin-catalog-template, admin-catalog (write half), and catalog-detail-queries files all lint clean (zero new errors).

## User Setup Required

None. The `/admin/catalog/new` and `/admin/catalog/[slug]/edit` pages are reachable today by signing in at `/admin/login` with the seeded super_admin (`pdmckinster@gmail.com`). The "New template" button from Plan 18-02's header now resolves; the table row name-links from 18-02 also resolve.

## Next Phase Readiness

- Phase 18 is complete. CTLG-01 (Plan 18-02), CTLG-02 + CTLG-03 (this plan), CTLG-04 + CTLG-05 (Plan 18-02 toggles), and I18N-01 (every plan) are all satisfied.
- Branch `feature/phase-18-catalog-admin` carries 8 commits since `main` (3 docs/context + 5 task feat commits across 18-01 / 18-02 / 18-03). Ready for `/gsd:verify-work 18` and merge back to main.
- Plan 19 (Requests Inbox) can clone the server-action skeleton (`createAdminServerClient -> assertPlatformStaff -> Zod parse -> Supabase mutation -> revalidatePath both routes`) verbatim; the form pattern (custom resolver + grouped sections + draft mode) is reusable for any future admin write surface that needs partial-save support.

## Self-Check: PASSED

- File `web/src/lib/validations/admin-catalog-template.ts` exists.
- File `web/src/lib/admin/catalog-detail-queries.ts` exists.
- File `web/src/components/admin/catalog/admin-template-form.tsx` exists.
- File `web/src/app/(admin)/admin/catalog/new/page.tsx` exists.
- File `web/src/app/(admin)/admin/catalog/[slug]/edit/page.tsx` exists.
- File `web/src/lib/actions/admin-catalog.ts` modified (createTemplate + updateTemplate added alongside existing toggle actions).
- Files `web/messages/en.json` and `web/messages/es.json` modified with `admin.catalog.form.*` namespace.
- Commits `47ae997` and `e140e51` exist on `feature/phase-18-catalog-admin`.
- i18n parity check: PASS (729 keys, zero asymmetry).
- `npm run build` exits 0 with 28 routes.
- `npm run lint` introduces zero new errors / warnings in the new files.

---
*Phase: 18-catalog-admin*
*Completed: 2026-05-06*
