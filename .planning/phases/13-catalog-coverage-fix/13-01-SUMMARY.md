---
phase: 13-catalog-coverage-fix
plan: 01
subsystem: ui
tags: [i18n, catalog, next-intl, gap-closure, audit-fix]

# Dependency graph
requires:
  - phase: 10-catalog
    provides: catalog UI shell, CATEGORY_ORDER constant, server-to-client translations map, CatalogCard pure display component
  - phase: 07-schema-and-seed
    provides: 66 automation_templates with operations category (8 rows) and agencias industry tag (48 rows) already seeded
provides:
  - operations category visible as catalog tab in EN ("Operations") and ES ("Operaciones")
  - agencias industry visible as catalog chip in EN ("Agencies") and ES ("Agencias")
  - catalog cards now resolve t.category and t.industry_tags through the i18n translations bundle (no raw DB slugs leaking to UI)
  - 100% of seeded automation_templates reachable via UI filters
affects: [phase-14-i18n-security-hygiene, phase-15-dashboard-home-polish, v1.1-milestone-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "i18n key registration: 3 sites required for new category (JSON keys in EN+ES, CATEGORY_ORDER array, server-to-client translations map)"
    - "Industry chip render order = JSON insertion order (Object.keys reflects insertion order); EN/ES must match byte-for-byte"
    - "Card display fields look up translations.categories[key] / translations.industries[key] with raw-key fallback for safety"

key-files:
  created: []
  modified:
    - web/messages/en.json
    - web/messages/es.json
    - web/src/components/dashboard/catalog-client.tsx
    - web/src/app/(dashboard)/dashboard/catalog/page.tsx

key-decisions:
  - "operations tab inserted between productivity and reports (not alphabetized) to group internal-process categories"
  - "agencias chip appended as LAST industry key to preserve EN/ES key-order parity and minimize visual disruption"
  - "Cards now map category and industry_tags through the i18n bundle in catalog-client.tsx (UAT finding: raw slugs were leaking through)"
  - "Translation lookup uses ?? raw-key fallback so unregistered slugs degrade gracefully instead of rendering 'undefined'"

patterns-established:
  - "Pattern: registering a new catalog category requires 3 sites (i18n JSON, CATEGORY_ORDER, translations map) — documented for future categories"
  - "Pattern: registering a new industry requires 2 sites (i18n JSON appended last, translations map appended last) — must match in both locales"

requirements-completed: [CATL-01, CATL-02, CATL-03, I18N-01]

# Metrics
duration: ~5h (Task 1: ~2h plan + edits + verify | UAT verification: ~2h | UAT fix + re-verify: ~1h)
completed: 2026-04-30
---

# Phase 13 Plan 01: Catalog Coverage Fix Summary

**Registered orphaned `operations` category (8 templates) and `agencias` industry (48 templates) into catalog UI via i18n keys, CATEGORY_ORDER, server-to-client translations map, and runtime card label resolution — 100% of seeded templates now reachable via filters in EN+ES.**

## Performance

- **Duration:** ~5h end-to-end (planning, execution, UAT, post-UAT fix)
- **Started:** 2026-04-30T14:30:00Z (Task 1 commit timestamp: 14:32 -0400)
- **Completed:** 2026-04-30 (UAT pass + post-UAT fix at 14:50 -0400, finalization same day)
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 4 source + 1 deferred-items log

## Accomplishments

- Operations tab now renders in catalog after Productivity and before Reports (10 total category tabs incl. "all" and "mas_populares") in both locales
- Agencias chip now renders as last industry chip after Restaurantes (7 total industry chips incl. "all") in both locales
- Catalog cards now display localized category labels (e.g. "Operaciones" instead of "operations") and localized industry tag labels (e.g. "Agencias" instead of "agencias")
- 8 seeded `operations` templates and 48 seeded `agencias` templates verified reachable via UI filters
- EN/ES industry key order verified byte-for-byte identical (prevents chip-order mismatch across locales)
- Closes audit gaps HIGH-1 (operations orphan) and HIGH-2 (agencias orphan) from `.planning/v1.1-MILESTONE-AUDIT.md`

## Task Commits

Each task was committed atomically:

1. **Task 1: Register operations category and agencias industry in i18n + UI registration points** — `7ff4b6e` (feat)
2. **Task 2: Manual UAT smoke test (6 tests)** — no code commit (verification gate); user approved after all 6 tests passed
3. **Post-UAT fix (deviation Rule 1, surfaced during Test 1):** `8fc33e0` (fix) — localize category and industry labels inside catalog cards

**Plan metadata:** _(this commit)_ `docs(13-01): complete plan with UAT pass`

## Files Created/Modified

### `web/messages/en.json` (commit `7ff4b6e`)

Added 2 keys to `dashboard.catalog`:

```diff
 "categories": {
   ...
   "productivity": "Productivity",
+  "operations": "Operations",
   "reports": "Reports",
   "ai_agents": "AI Agents"
 },
 "industries": {
   ...
-  "restaurantes": "Restaurants"
+  "restaurantes": "Restaurants",
+  "agencias": "Agencies"
 }
```

**Final EN counts:** 10 category keys (`all`, `mas_populares`, `sales`, `marketing`, `customer_service`, `documents`, `productivity`, **`operations`**, `reports`, `ai_agents`), 7 industry keys (`all`, `retail`, `salud`, `legal`, `inmobiliaria`, `restaurantes`, **`agencias`**).

### `web/messages/es.json` (commit `7ff4b6e`)

Mirror structure with translated labels:

```diff
 "categories": {
   ...
   "productivity": "Productividad",
+  "operations": "Operaciones",
   "reports": "Reportes",
   "ai_agents": "Agentes IA"
 },
 "industries": {
   ...
-  "restaurantes": "Restaurantes"
+  "restaurantes": "Restaurantes",
+  "agencias": "Agencias"
 }
```

**Final ES counts:** 10 category keys, 7 industry keys — order byte-for-byte identical to en.json.

### `web/src/components/dashboard/catalog-client.tsx` (commits `7ff4b6e` + `8fc33e0`)

**Edit 1 (commit `7ff4b6e`):** Added `"operations"` to `CATEGORY_ORDER` constant:

```diff
 const CATEGORY_ORDER = [
   "all",
   "mas_populares",
   "sales",
   "marketing",
   "customer_service",
   "documents",
   "productivity",
+  "operations",
   "reports",
   "ai_agents",
 ];
```

**Edit 2 (commit `8fc33e0`, post-UAT):** Map raw DB slugs through i18n bundle before passing to `CatalogCard`:

```diff
 <CatalogCard
   ...
-  category={t.category}
+  category={translations.categories[t.category] ?? t.category}
   ...
-  industryTags={t.industry_tags ?? []}
+  industryTags={(t.industry_tags ?? []).map(
+    (tag) => translations.industries[tag] ?? tag
+  )}
   ...
 />
```

### `web/src/app/(dashboard)/dashboard/catalog/page.tsx` (commit `7ff4b6e`)

Added 2 entries to the server-to-client `translations` object:

```diff
 categories: {
   ...
   productivity: t("categories.productivity"),
+  operations: t("categories.operations"),
   reports: t("categories.reports"),
   ai_agents: t("categories.ai_agents"),
 },
 industries: {
   ...
   restaurantes: t("industries.restaurantes"),
+  agencias: t("industries.agencias"),
 },
```

### Files NOT touched (intentionally, per plan constraints)

- `web/src/app/(dashboard)/dashboard/catalog/[slug]/page.tsx` — uses dynamic `t(\`categories.${template.category}\`)` with try/catch fallback; auto-resolves once en.json + es.json keys exist (verified in UAT Test 6)
- `web/src/components/dashboard/catalog-card.tsx` — pure display component; receives pre-localized strings from parent (after fix in commit `8fc33e0`)
- `web/src/lib/dashboard/queries.ts` — already returns all 66 templates with full `category` and `industry_tags` columns
- `web/src/lib/dashboard/types.ts` — string types compatible with new values
- `supabase/seed.sql` — counts already correct (8 operations rows, 48 agencias-tagged rows)
- `supabase/migrations/*` — `automation_templates.category` CHECK constraint already permits `'operations'` (migration 20260409000001_v1_1_schema_expansion.sql)

## Decisions Made

- **operations tab position:** between productivity and reports (groups internal-process categories productivity → operations → reports before AI Agents). Deliberately NOT alphabetized to match the conceptual flow defined in 13-CONTEXT.md.
- **agencias chip position:** appended as LAST industry key in both EN and ES. JSON insertion order = render order via `Object.keys(translations.industries)`, so any other position would create EN/ES layout mismatch.
- **Card label localization (post-UAT, commit `8fc33e0`):** Map `t.category` and each entry of `t.industry_tags` through the `translations.categories` / `translations.industries` lookup objects with raw-key fallback (`?? t.category`). This was a deviation from the original plan but necessary — see "Deviations" below.

## Deviations from Plan

### UAT Findings (auto-fixed during checkpoint:human-verify)

**1. [Rule 1 - Bug] Catalog cards rendered raw DB slugs for category and industry tags instead of i18n labels**

- **Found during:** Task 2 UAT Test 1 (Operations tab, ES locale)
- **Issue:** When the user clicked the "Operaciones" tab and the card grid rendered, each card's category badge displayed the raw DB slug `operations` (not the localized `Operaciones`). Same problem for industry tags: cards showed `agencias` instead of `Agencies`/`Agencias`. The bug was invisible before Phase 13 because every existing category had EN==ES labels (e.g. `marketing`/`marketing`, `sales`/`Sales` close enough not to notice). Operations was the first category whose ES label differed materially from the slug, exposing the gap.
- **Root cause:** `catalog-client.tsx:268-279` passed `t.category` (raw DB string) and `t.industry_tags` (array of raw strings) directly to `CatalogCard` without mapping through the `translations` props bundle. The card is a pure display component (per Phase 10-02 decision) so it correctly rendered whatever string it received.
- **Fix:** In `catalog-client.tsx`, look up each value through the translations object before passing to `CatalogCard`:
  - `category={translations.categories[t.category] ?? t.category}`
  - `industryTags={(t.industry_tags ?? []).map((tag) => translations.industries[tag] ?? tag)}`
  - Raw-key fallback (`?? t.category`) preserves safety for slugs not yet registered (e.g. if seed adds a new category before its i18n key lands).
- **Files modified:** `web/src/components/dashboard/catalog-client.tsx` (6 lines changed, 2 hunks)
- **Verification:** Post-fix, user re-ran all 6 UAT tests and reported all passing — operations tab shows "Operaciones" labels on cards (ES), "Operations" (EN); agencias chip shows "Agencies"/"Agencias" tag pills on cards.
- **Committed in:** `8fc33e0` (`fix(13-01): localize category and industry labels inside catalog cards`)

---

**Total deviations:** 1 auto-fixed (1 bug found during UAT)
**Impact on plan:** UAT-surfaced bug was a latent defect from Phase 10 that became visible only after Phase 13 added an asymmetric category label. Fix was necessary for correctness (raw slugs in user-facing UI = broken i18n contract). No scope creep — fix touched only the file already in the plan's `files_modified` list. The plan's original 4-file edit was correct; this is an additional 2-line edit to the same file.

## Issues Encountered

- **Pre-existing baseline lint debt (104 errors, 1584 warnings):** Discovered during Task 1 verification. Verified out of scope by stashing plan changes and re-running `npm run lint` on clean baseline (same 104/1584). Logged to `.planning/phases/13-catalog-coverage-fix/deferred-items.md` (DEFERRED-1) with recommendation to schedule a dedicated tech-debt phase before v1.2.

## UAT Results

User completed all 6 manual tests on 2026-04-30 and typed "approved":

1. ✅ **Test 1 (Operations tab, ES):** 8 cards render, "Mostrando 8 de 66" subtitle, tab label "Operaciones" (after fix `8fc33e0`)
2. ✅ **Test 2 (Agencias chip, ES):** 48 cards render, "Mostrando 48 de 66" subtitle, chip label "Agencias" as last in row
3. ✅ **Test 3 (Combined filter):** Agencias chip + Operations tab → non-empty intersection (4+ templates including `data_reconciliation`, `workflow_orchestrator`, `system_health_monitor`, `backup_verification`)
4. ✅ **Test 4 (Locale toggle EN):** Tab "Operations", chip "Agencies", same 8/48 counts preserved
5. ✅ **Test 5 (Mobile 375px):** All 9 category tabs reachable via horizontal scroll, no overlap with chip row or sidebar, no clipped layout
6. ✅ **Test 6 (Detail page):** Operations template detail page renders localized category badge ("Operations" in EN, "Operaciones" in ES) — auto-resolved by existing dynamic `t()` lookup in `[slug]/page.tsx`

## User Setup Required

None — no external service configuration required. The fix is purely frontend (i18n keys + UI registration). Existing Supabase seed already contains the data; no migration or seed re-run needed.

## Next Phase Readiness

- ✅ Phase 13 complete — ready for `/gsd:verify-work` orchestrator pass
- ✅ Closes audit HIGH-1 (operations category orphan, 8 templates) and HIGH-2 (agencias industry orphan, 48 templates) from `.planning/v1.1-MILESTONE-AUDIT.md`
- Phase 14 (i18n & Security Hygiene) and Phase 15 (Dashboard Home Polish) remain in v1.1 backlog — both independent of Phase 13 changes
- One pre-existing concern logged to `deferred-items.md`: 104 baseline lint errors in unrelated files (queries.ts `any` types, RHF `watch()` purity warnings in auth forms). Out of scope for v1.1; recommend tech-debt phase before v1.2.

## Self-Check: PASSED

All claimed files and commits verified to exist:

- `web/messages/en.json` — FOUND
- `web/messages/es.json` — FOUND
- `web/src/components/dashboard/catalog-client.tsx` — FOUND
- `web/src/app/(dashboard)/dashboard/catalog/page.tsx` — FOUND
- Commit `7ff4b6e` (Task 1) — FOUND in git log
- Commit `8fc33e0` (UAT fix) — FOUND in git log

---
*Phase: 13-catalog-coverage-fix*
*Completed: 2026-04-30*
