---
phase: 18-catalog-admin
plan: 01
subsystem: database
tags: [supabase, postgres, rls, i18n, next-intl, translations, catalog]

requires:
  - phase: 17-admin-foundation
    provides: is_platform_staff() helper, platform_staff table
  - phase: 07-schema-and-seed
    provides: automation_templates table, seed.sql with 66 templates
  - phase: 10-catalog
    provides: customer /dashboard/catalog list and detail pages

provides:
  - automation_template_translations table (template_id, locale, field, value)
  - 528-row backfill from web/messages/{en,es}.json
  - fetchCatalogTemplates(locale) and fetchTemplateBySlug(slug, locale) reading translations
  - Customer catalog pages free of getTranslations("templates") for template-specific copy

affects:
  - 18-02 (admin create/edit form will write to this table)
  - 18-03 (admin toggles read template copy via the same path)
  - any future admin write surface that touches template display strings

tech-stack:
  added: []
  patterns:
    - "Locale-aware embed JOIN: customer queries pass a locale parameter to .from('parent').select('translations:child!inner(...)') with .eq('translations.locale', locale) so display strings come back resolved at request time."
    - "Idempotent backfill via INSERT ... SELECT ... ON CONFLICT DO NOTHING in DO block — safe-no-op when parent table is empty (covers fresh dbs); safe-rerun when parent already has data."

key-files:
  created:
    - "supabase/migrations/20260507000001_template_translations.sql — 2756 lines, 528 inline INSERTs in DO block, 4 RLS policies, trigger reuse, full FK + CHECK constraints."
    - ".planning/phases/18-catalog-admin/deferred-items.md — logs the remaining 'a0' typos in seed.sql features/use_cases for a future cleanup commit."
  modified:
    - "supabase/seed.sql — 528-INSERT backfill block before COMMIT (mirrors migration); two slugs un-corrupted ('a0dience-segmentation' -> 'audience-segmentation', 'a0to-response-email' -> 'auto-response-email')."
    - "web/src/lib/dashboard/types.ts — CatalogTemplate.name -> displayName; CatalogTemplateDetail gains displayDescription/displayImpact/displayMetricLabel and drops i18n-key columns."
    - "web/src/lib/dashboard/queries.ts — fetchCatalogTemplates and fetchTemplateBySlug refactored to JOIN translations table filtered by locale."
    - "web/src/app/(dashboard)/dashboard/catalog/page.tsx — dropped getTranslations('templates') and templatesWithNames remap."
    - "web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx — dropped slug_snake derivation and three try/catch lookups; reads displayName/displayDescription/displayImpact directly off the query result."

key-decisions:
  - "Backfill the table from BOTH the migration DO block (for prod) AND the seed.sql (for local resets). Migrations run before seed, so on a fresh local db the migration's DO block finds an empty automation_templates and noops; the seed-side block fills the table after templates exist. Both paths are ON CONFLICT DO NOTHING idempotent."
  - "Keep the messages/templates JSON namespace in place. The migration sourced its values from that JSON, but no other consumer was identified, and removing keys from a shipped i18n bundle has its own risks (third-party tools, browser caches). Cleanup deferred."
  - "Locale-aware embed JOIN over a separate translations query. Saves a round trip per page load, lets Postgres do the locale filter once, and the resulting Supabase TypeScript shape is straightforward to map onto the resolved-string types."
  - "Defensive fallbacks in the query layer — displayName falls back to slug, the detail query returns null when no translation rows are returned. Cheap safety net for any future admin DELETE that orphans a translation."
  - "Auto-fix two corrupted slugs in seed.sql ('a0dience-' / 'a0to-') as Rule 1 (Bug). The slugs were also user-visible in the catalog URL, so this was a customer-facing defect already, not just a 18-01 verification blocker."

patterns-established:
  - "Locale-aware data plane: customer pages obtain locale via getLocale() once at the top of the server component and thread it into queries that need translated copy. Future feature areas with bilingual data should follow this same pattern (locale parameter, filtered embed JOIN, resolved display fields)."
  - "Translation table shape: (parent_id, locale, field, value) with PK on (parent_id, locale, field). Reusable for any future entity that needs admin-editable bilingual copy without redeploys."

requirements-completed: [CTLG-03]

duration: 16 min
completed: 2026-05-06
---

# Phase 18 Plan 1: Template Translations Data Plane Summary

**Runtime translations table for automation_templates with locale-aware JOIN queries, replacing build-time messages JSON for the customer catalog so admin edits propagate without a redeploy.**

## Performance

- **Duration:** 16 min
- **Started:** 2026-05-06T16:43:27Z
- **Completed:** 2026-05-06T16:59:48Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified) + 1 deferred-items log

## Accomplishments

- New table `public.automation_template_translations` with PK on `(template_id, locale, field)`, ON DELETE CASCADE FK to `automation_templates`, and CHECK constraints on `locale IN ('en','es')` and `field IN ('name','description','typical_impact_text','activity_metric_label')`.
- 528 backfill rows (66 templates x 4 fields x 2 locales) emitted programmatically after a pre-emission EN/ES parity check, inlined as `INSERT ... SELECT ... ON CONFLICT DO NOTHING` so the migration is idempotent.
- RLS posture mirrors the catalog: SELECT to all authenticated users, INSERT/UPDATE/DELETE behind the Phase 17 `is_platform_staff()` helper. 4 admin-CRUD policies, no FOR ALL.
- Customer queries `fetchCatalogTemplates(locale)` and `fetchTemplateBySlug(slug, locale)` JOIN the new table and return resolved display strings. The catalog list and detail pages no longer call `getTranslations("templates")` for template-specific copy.

## Task Commits

1. **Task 1: Create translations migration with RLS, admin policies, and backfill** — `a0ea810` (feat)
2. **Task 2: Refactor customer catalog queries and types to read from translations table** — `1b08f0a` (refactor)

## Files Created/Modified

- `supabase/migrations/20260507000001_template_translations.sql` — table + RLS + trigger + 528-row idempotent backfill DO block.
- `supabase/seed.sql` — 528-INSERT backfill block before COMMIT so local `db reset` populates the table after templates are seeded; two corrupted slugs fixed (see Deviations).
- `web/src/lib/dashboard/types.ts` — `CatalogTemplate.displayName` (resolved) instead of `name` (i18n key); detail type gains `displayDescription` / `displayImpact` / `displayMetricLabel`.
- `web/src/lib/dashboard/queries.ts` — `fetchCatalogTemplates(locale)` and `fetchTemplateBySlug(slug, locale)` rewritten as locale-aware embed JOINs over `automation_template_translations`.
- `web/src/app/(dashboard)/dashboard/catalog/page.tsx` — locale fetched first, then templates + chrome translations in parallel; `getTranslations("templates")` and the `templatesWithNames` remap removed.
- `web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx` — `slug_snake` derivation and three try/catch lookups removed; resolved display fields read directly off the query result.
- `.planning/phases/18-catalog-admin/deferred-items.md` — log of remaining `a0` typos in `seed.sql` `features[]` / `use_cases[]` (out of scope for 18-01).

## Decisions Made

- **Two-source backfill (migration + seed) over one.** The migration backfill alone cannot populate the table during `supabase db reset` because migrations run before `seed.sql`, when `automation_templates` is empty. Adding the same INSERT block to `seed.sql` (after the template inserts, before COMMIT) gives a clean 528-row local state without diverging from the prod path: the migration still backfills correctly when applied to an existing prod db that already has 66 templates.
- **Embed JOIN over separate translations query.** A single `automation_templates` select with `translations:automation_template_translations!inner(...)` and a `translations.locale` filter saves a round trip and keeps the locale filter inside Postgres. The resulting Supabase shape is one rowset that's straightforward to map onto the resolved-string types.
- **Keep messages/templates JSON namespace untouched.** No other consumer was identified, and the migration backfill sourced its values from that JSON, so the customer-side render is identical on day one. Removing keys from a shipped i18n bundle is its own risk (browser caches, any tool that scans messages files), so cleanup is deferred until there's a clear caller list.
- **Defensive null fallbacks in the query layer.** `displayName` falls back to `slug`; detail query returns `null` when no translation rows come back. Cheap safety net for any admin DELETE that orphans a translation row in the future.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrupted slugs in seed.sql blocked the 528-row target**

- **Found during:** Task 1 (verifying the row count after `supabase db reset`).
- **Issue:** `seed.sql` insert rows for two templates carried slugs `'a0dience-segmentation'` and `'a0to-response-email'` (the `i18n` keys correctly used `audience_segmentation` / `auto_response_email`). The backfill, which derives `slug = REPLACE(json_key, '_', '-')`, could not find these two templates, so only 64 of 66 templates ended up with translation rows (512 / 528 total). The corrupted slugs were also already shipping as customer URLs — `/dashboard/catalog/a0to-response-email` would have been the public route — so this is a pre-existing data-integrity defect, not something this plan introduced.
- **Fix:** Edited `seed.sql` lines 470 and 514 to use `'audience-segmentation'` and `'auto-response-email'`. After re-running `supabase db reset --local`, the count came back at 528 / 66 templates / 2 locales as required.
- **Files modified:** `supabase/seed.sql`.
- **Verification:** `SELECT COUNT(*) AS total, COUNT(DISTINCT template_id) AS templates, COUNT(DISTINCT locale) AS locales FROM automation_template_translations;` returns `528 | 66 | 2`. The two specific slugs return their expected EN/ES rows.
- **Committed in:** `a0ea810` (Task 1 commit).

**2. [Rule 3 - Blocking] Local Supabase stack was down**

- **Found during:** Task 1 (running `npx supabase status` before the first migration apply).
- **Issue:** Docker Desktop was not running, so the local Supabase containers were not up and `supabase db reset --local` failed with `Docker Desktop is a prerequisite for local development`. Without the stack up, none of Task 1's verification could happen.
- **Fix:** Started Docker Desktop, waited for `pg_isready` on `supabase_db_12ai`, then proceeded with the reset.
- **Files modified:** none.
- **Verification:** `docker ps` showed all Supabase containers `Up` and healthy; `supabase status` reported services running on the expected ports.
- **Committed in:** n/a (environment-only fix).

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking).
**Impact on plan:** No scope creep. The slug fix touched two single-character substrings already required for verification to pass, and the Docker start was a pure environment step. Both were necessary to surface the 528-row guarantee.

## Issues Encountered

None beyond the deviations above. Both task verifications passed on the first try after the slug fix:

- `supabase db reset --local` exits cleanly; `RAISE NOTICE` from the migration's DO block reports `0 rows total` (expected, because the migration runs before seed) and the post-seed `SELECT COUNT(*)` returns `528`.
- `npm run build` exits 0 with the same 26 routes as before; no TypeScript errors.
- Pre-existing `eslint` errors in `queries.ts` (5 errors / 1 warning) are unchanged after this plan's edits — verified by linting before and after with the same byte-for-byte output on lines I did not touch.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Data plane is ready for Plan 18-02 (admin create/edit form). The form will write to `automation_template_translations` and the customer side will pick the change up on the next request.
- Plan 18-03 (toggles) does not need this table directly, but the table's RLS posture is consistent with what 18-03 will add for `is_active` / `is_featured` writes.

## Self-Check: PASSED

- File `supabase/migrations/20260507000001_template_translations.sql` exists on disk (verified with `[ -f ]`).
- File `supabase/seed.sql` modified (verified by `git log --name-only`).
- Files `web/src/lib/dashboard/types.ts`, `web/src/lib/dashboard/queries.ts`, `web/src/app/(dashboard)/dashboard/catalog/page.tsx`, and `web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx` exist and are modified on this branch.
- File `.planning/phases/18-catalog-admin/deferred-items.md` exists.
- Commits `a0ea810` and `1b08f0a` exist in `git log --oneline` on `feature/phase-18-catalog-admin`.
- DB returns `total=528, templates=66, locales=2`.
- `npm run build` exits 0.

---
*Phase: 18-catalog-admin*
*Completed: 2026-05-06*
