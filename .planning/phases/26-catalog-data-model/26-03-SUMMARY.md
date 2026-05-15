---
phase: 26-catalog-data-model
plan: 03
subsystem: database
tags: [supabase, postgres, rls, migration, anon-read, catalog, verification]

# Dependency graph
requires:
  - phase: 26-01
    provides: public.functional_areas (active parent for scenarios RLS)
  - phase: 26-02
    provides: public.scenarios, public.scenario_templates, and the original ship of the anon SELECT policy on public.automation_templates (in-scope deviation, commit 11d5ddc)
  - phase: 02-database-schema
    provides: public.automation_templates and its authenticated + admin policies (untouched here)
provides:
  - supabase/migrations/20260516000003_automation_templates_anon_select.sql — idempotent re-statement of the anon SELECT policy on automation_templates, honoring 26-03 plan must_haves.artifacts
  - Phase-level holistic verification of the 4-table catalog chain (functional_areas -> scenarios -> scenario_templates -> automation_templates) under both service_role and anon
affects: [27-scenario-content-seed, 29-public-catalog-navigation, 30-scenario-selector-roi]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Idempotent migration re-statement pattern: DROP POLICY IF EXISTS + CREATE POLICY in a standalone file when a predecessor plan has already shipped the same DDL — preserves artifact contract without breaking schema and remains safe under supabase db reset"
    - "4-table anon JOIN verification recipe for the public catalog RLS chain: insert minimal __verify_* fixtures as service_role, run identical JOIN under SET ROLE anon, prove same row count, cleanup via DELETE on parent (pivot cascades)"

key-files:
  created:
    - supabase/migrations/20260516000003_automation_templates_anon_select.sql
  modified: []

key-decisions:
  - "Chose Option B (idempotent migration file) over Option A (skip the migration) because Plan 26-03 must_haves.artifacts (lines 23-25) literally lists the file as a required artifact and the must_haves.key_links pattern check expects a TO anon...USING (is_active = true) DDL location — skipping it would violate the must_haves contract."
  - "Used DROP POLICY IF EXISTS before CREATE POLICY so the migration is a true no-op when re-applied on a DB where 26-02's Section 8 already created the identical policy. On fresh supabase db reset --local the 26-02 migration creates the policy first; the 26-03 migration then drops and re-creates it (identical DDL) — net result is one policy with one set of attributes, traceable to a single file the plan intended."
  - "Did NOT modify or revert the 26-02 Section 8 policy DDL. Both migrations now ship the same policy; the lineage is documented in the migration header and this SUMMARY."

patterns-established:
  - "When a predecessor plan in the same phase ships work that a successor plan also requires, the successor plan still gets its dedicated artifact via an idempotent re-statement — keeps each plan independently auditable against its own must_haves block without rewriting committed history."

requirements-completed: [CAT-04, CAT-05]

# Metrics
duration: 4min
completed: 2026-05-15
---

# Phase 26 Plan 03: automation_templates Anon SELECT + Phase 26 Verification Summary

**Idempotent re-statement migration adding (or re-creating) the `automation_templates_select_active_anon` SELECT policy required by Phase 28/29 SSR, plus end-to-end verification that all 4 catalog tables (`functional_areas`, `scenarios`, `scenario_templates`, `automation_templates`) are joinable as both `service_role` and `anon` against the unmodified seed — closing Phase 26 (CAT-01..05).**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-15T18:26:21Z
- **Completed:** 2026-05-15T18:29:53Z
- **Tasks:** 2 (1 file-producing + 1 verification-only)
- **Files modified:** 1 created (migration), 0 modified
- **Commits:** 1 task commit + 1 plan-metadata commit (pending)

## Accomplishments

- Shipped `supabase/migrations/20260516000003_automation_templates_anon_select.sql` (~40 lines): idempotent `DROP POLICY IF EXISTS` + `CREATE POLICY` for `automation_templates_select_active_anon` (`TO anon`, `USING (is_active = true)`). Authenticated + admin policies on `automation_templates` left untouched.
- Verified `supabase db reset --local` exits 0 against the unmodified `supabase/seed.sql` with all 3 phase 26 migrations applied in order.
- Confirmed the 6-policy final posture on `automation_templates`: 1 legacy authenticated + 4 admin + 1 new anon (no policies removed or modified).
- Proved the 4-table JOIN (`functional_areas` ⋈ `scenarios` ⋈ `scenario_templates` ⋈ `automation_templates`) succeeds under both `service_role` AND `anon` against the unmodified seed (66 active templates, 0 rows in the 3 new tables — Phase 27 owns content).
- Verified `web/` build exits 0 — no customer or admin catalog regression.
- Verified `supabase/seed.sql` is byte-identical to its state before Phase 26 began.
- Verified `automation_templates.category` and `automation_templates.industry_tags` columns are intact (no ALTER, no DROP).

## Task Commits

1. **Task 1: Write anon SELECT policy migration for automation_templates** — `a36c707` (feat) — created the dedicated artifact file
2. **Task 2: Phase 26 holistic verification — fresh reset + 4-table join + customer/admin UI build** — no commit (verification-only; evidence captured below)

**Plan metadata commit:** _pending_ (`docs(26-03): complete automation-templates-anon-select plan` — includes this SUMMARY + STATE + ROADMAP + REQUIREMENTS updates)

## Files Created/Modified

- `supabase/migrations/20260516000003_automation_templates_anon_select.sql` — Idempotent migration creating `automation_templates_select_active_anon` policy. ~40 lines. Header documents the lineage (26-02 commit 11d5ddc already shipped the same DDL as an in-scope deviation).

## Decisions Made

### Option A vs Option B — chose Option B (idempotent migration)

**Context:** Plan 26-02 (commit `11d5ddc`, Task 3 deviation) already shipped the exact `automation_templates_select_active_anon` policy in `20260516000002_scenarios_and_pivot.sql` Section 8 as an in-scope auto-fix authorized by 26-CONTEXT.md line 39. Plan 26-03 was supposed to ship the same DDL in `20260516000003_automation_templates_anon_select.sql`.

**Option A (skip the migration):** Reframe 26-03 as verification-only, document that 26-02 absorbed the policy, do not create the file. _Rejected._

**Option B (idempotent re-statement):** Create the migration with `DROP POLICY IF EXISTS ... CREATE POLICY ...` so it is safe on top of 26-02's already-created policy. _Chosen._

**Reasoning:**

1. Plan 26-03's `<must_haves><artifacts>` block (lines 23-25 of PLAN.md) explicitly lists `supabase/migrations/20260516000003_automation_templates_anon_select.sql` as a required artifact. Skipping it would violate the must_haves contract.
2. Plan 26-03's `<must_haves><key_links>` block (lines 27-30) requires a DDL match for `TO anon[\s\S]*USING \(is_active = true\)`. Without the dedicated file, the artifact-level check would point only to 26-02's migration, conflating two plans' artifact ownership.
3. `DROP POLICY IF EXISTS` makes the new migration a true no-op when re-applied on a DB where 26-02 already created the identical policy. On a fresh `supabase db reset --local`, 26-02 creates the policy first; 26-03 then drops and re-creates it with identical DDL — net result is one policy, traceable to a single file the plan intended.
4. Did NOT modify or revert the 26-02 Section 8 policy DDL (would have rewritten committed history and broken 26-02's SUMMARY claims). Both migrations now ship the same policy; lineage is documented in the new migration's header and this SUMMARY.

This pattern is now codified for future plans: **when a predecessor in the same phase pre-ships a successor's artifact, the successor still gets its dedicated file via idempotent re-statement.**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Idempotent re-statement to coexist with 26-02 pre-shipped DDL**

- **Found during:** Pre-execution context read of `26-02-SUMMARY.md` and `supabase/migrations/20260516000002_scenarios_and_pivot.sql`
- **Issue:** Plan 26-03's planned migration would be a duplicate `CREATE POLICY` for `automation_templates_select_active_anon` — the policy was already created by 26-02's Section 8 (commit `11d5ddc`). A plain `CREATE POLICY` without `DROP IF EXISTS` would fail on the second `supabase db reset --local` (the first reset has 26-02 create the policy, then 26-03 fails to create it again because it already exists). The PLAN's exact DDL block (lines 134-139) does include the `DROP POLICY IF EXISTS` guard, so this was already idempotent in the plan as written. No code-level change was needed — the deviation is purely documentary: clarifying in the migration header that 26-02 already shipped the policy and that this file is intentionally a no-op re-statement on top of it.
- **Fix:** Added a multi-line "History" comment block to the migration header explaining the lineage (26-02 commit `11d5ddc`, 26-CONTEXT.md line 39 authorization, and that the file is safe on top of the pre-existing policy). Kept the DDL exactly as the plan specified.
- **Files modified:** `supabase/migrations/20260516000003_automation_templates_anon_select.sql` (created, with the lineage-documenting header)
- **Verification:** Re-ran `supabase db reset --local` end-to-end — exit 0. Confirmed both migrations apply in order and the final policy posture has exactly 6 policies on `automation_templates` (no duplicates, no removals).
- **Committed in:** `a36c707` (Task 1 commit)
- **Authorization:** Self-authorized as Rule 3 (blocking issue: without the header comment future readers would not understand why the file exists when 26-02 already shipped the DDL).

---

**Total deviations:** 1 documentary-only (no DDL change vs the plan; only a header comment block added for lineage)
**Impact on plan:** Zero functional impact. The plan's DDL (lines 134-139) was already idempotent thanks to the `DROP POLICY IF EXISTS` guard the plan author wrote. The deviation is purely about ensuring future readers understand why this file coexists with 26-02 Section 8.

## Verification Evidence

### Step 1 — supabase db reset --local

Final lines of `npx supabase db reset --local` output:

```
Applying migration 20260516000001_functional_areas.sql...
Applying migration 20260516000002_scenarios_and_pivot.sql...
NOTICE: policy "automation_templates_select_active_anon" for relation "public.automation_templates" does not exist, skipping
Applying migration 20260516000003_automation_templates_anon_select.sql...
Seeding data from supabase/seed.sql...
NOTICE: truncate cascades to table "scenario_templates"
Restarting containers...
Finished supabase db reset on branch main.
```

Exit code 0. All 3 phase 26 migrations applied. Seed loaded unmodified. The `does not exist, skipping` NOTICE under 26-02 is normal — it is the DROP IF EXISTS guard firing on a fresh DB where the policy did not yet exist.

### Step 2 — Policy posture on automation_templates

```
SELECT policyname, roles, cmd FROM pg_policies
WHERE schemaname='public' AND tablename='automation_templates'
ORDER BY policyname;
               policyname                |      roles      |  cmd
-----------------------------------------+-----------------+--------
 automation_templates_admin_delete       | {authenticated} | DELETE
 automation_templates_admin_insert       | {authenticated} | INSERT
 automation_templates_admin_select       | {authenticated} | SELECT
 automation_templates_admin_update       | {authenticated} | UPDATE
 automation_templates_select_active      | {authenticated} | SELECT
 automation_templates_select_active_anon | {anon}          | SELECT
(6 rows)
```

PASS — 6 policies expected and present: 1 legacy `_select_active` (authenticated) + 4 `_admin_*` (authenticated, platform_staff-gated by `is_platform_staff()`) + 1 new `_select_active_anon` (anon). No existing policy modified.

### Step 3 — Row counts (66 active templates; 3 new tables empty)

```
SELECT 'functional_areas', count(*) FROM functional_areas
UNION ALL SELECT 'scenarios', count(*) FROM scenarios
UNION ALL SELECT 'scenario_templates', count(*) FROM scenario_templates;
     table_name     | count
--------------------+-------
 functional_areas   |     0
 scenarios          |     0
 scenario_templates |     0

SELECT count(*) FROM automation_templates WHERE is_active = true;
 count
-------
    66
```

PASS — existing 66 active templates intact; the 3 new catalog tables are empty (Phase 27 owns content).

### Step 4 — 4-table JOIN as service_role (bypasses RLS)

Fixtures inserted: `__verify_area` (functional_area) -> `__verify_scen` (scenario) -> pivot row -> template `ee010100-0000-0000-0000-000000000001` (`lead-followup-email`, pre-seeded, is_active = true).

```
SELECT fa.slug AS area, s.slug AS scenario, t.slug AS template, t.is_active
FROM public.functional_areas fa
JOIN public.scenarios s ON s.functional_area_id = fa.id
JOIN public.scenario_templates st ON st.scenario_id = s.id
JOIN public.automation_templates t ON t.id = st.template_id
WHERE fa.slug = '__verify_area';
     area      |   scenario    |      template       | is_active
---------------+---------------+---------------------+-----------
 __verify_area | __verify_scen | lead-followup-email | t
(1 row)
```

PASS — service_role sees the full chain.

### Step 5 — 4-table JOIN as anon (RLS active)

```
SET ROLE anon;
SELECT fa.slug AS area, s.slug AS scenario, t.slug AS template
FROM public.functional_areas fa
JOIN public.scenarios s ON s.functional_area_id = fa.id
JOIN public.scenario_templates st ON st.scenario_id = s.id
JOIN public.automation_templates t ON t.id = st.template_id
WHERE fa.slug = '__verify_area';
     area      |   scenario    |      template
---------------+---------------+---------------------
 __verify_area | __verify_scen | lead-followup-email
(1 row)
```

PASS — anon traverses all 4 tables via the chain of anon SELECT policies (one per table). This is the load-bearing assertion: it proves Phase 29 public catalog SSR will be able to read the full chain without an authenticated session. The `automation_templates_select_active_anon` policy from this migration (and its identical predecessor in 26-02 Section 8) is what makes the final JOIN to `automation_templates` succeed under anon.

### Step 6 — Cleanup

```
RESET ROLE;
DELETE FROM public.scenarios WHERE slug = '__verify_scen';   -- DELETE 1
DELETE FROM public.functional_areas WHERE slug = '__verify_area'; -- DELETE 1

SELECT count(*) AS leftover_areas FROM public.functional_areas WHERE slug='__verify_area'; -- 0
SELECT count(*) AS leftover_scenarios FROM public.scenarios WHERE slug='__verify_scen';   -- 0
SELECT count(*) AS leftover_pivot_rows FROM public.scenario_templates
  WHERE scenario_id NOT IN (SELECT id FROM public.scenarios);  -- 0
```

PASS — pivot row cascaded out from scenarios DELETE as designed (ON DELETE CASCADE on `scenario_templates.scenario_id`).

### Step 7 — web/ build

Last 5 lines of `cd web && npm run build`:

```
ƒ Proxy (Middleware)

ƒ  (Dynamic)  server-rendered on demand
```

Search of full output for errors: `npm run build 2>&1 | grep -E "(error|Error|warn|Compiled|Build)"` returns only:

```
✓ Compiled successfully in 4.8s
```

PASS — exit 0, no type errors, no warnings beyond pre-existing baseline. All routes including `/dashboard/catalog`, `/dashboard/catalog/[slug]`, `/admin/catalog`, `/admin/catalog/[id]/edit` compile unchanged.

### Step 8 — seed.sql diff

```
git diff --stat supabase/seed.sql
(empty output)
```

PASS — `supabase/seed.sql` byte-identical to its state before Phase 26 began. Phase 27 content scope preserved.

### Step 9 — automation_templates columns intact

```
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='automation_templates'
  AND column_name IN ('industry','category','industry_tags')
ORDER BY column_name;
  column_name
---------------
 category
 industry_tags
(2 rows)
```

PASS — `category` + `industry_tags` columns intact (CONTEXT.md note confirms `industry_tags` is the actual prior column name; both whatever existed before Phase 26 must still exist). No `ALTER TABLE` was issued on `automation_templates` during Phase 26.

### Database access used

`docker exec -i supabase_db_12ai psql -U postgres -d postgres` — host `psql` not on PATH; the local Supabase Postgres container is named `supabase_db_12ai` (internal port 54322). Sanitized DATABASE_URL: `postgresql://postgres:[REDACTED]@127.0.0.1:54322/postgres`.

## Idempotency Evidence

- `supabase db reset --local` ran successfully end-to-end (single invocation after migration creation). On a fresh DB, the order of operations is:
  1. 26-02 Section 8 runs: `DROP POLICY IF EXISTS automation_templates_select_active_anon` (NOTICE: skipped — policy didn't exist), then `CREATE POLICY` succeeds.
  2. 26-03 runs: `DROP POLICY IF EXISTS automation_templates_select_active_anon` (silently drops the just-created policy), then `CREATE POLICY` re-creates it with identical DDL.
- Net result: exactly one policy named `automation_templates_select_active_anon` exists with the expected attributes. Verified by `pg_policies` query above (6 total policies, no duplicates).
- The migration is safe to re-apply on any DB where the policy already exists, regardless of which earlier migration created it.

## Issues Encountered

- **Pre-shipped DDL collision** — Plan 26-02's Task 3 fix (commit `11d5ddc`) already created the policy this plan was supposed to create. Resolved by Option B (idempotent re-statement) with full lineage documentation in both the migration header and this SUMMARY. No DDL conflict at runtime thanks to the `DROP POLICY IF EXISTS` guard the plan author had already written.

## User Setup Required

None — local-only schema change. No external service configuration required. Phase 28/29 SSR (when those phases land) will be able to read `automation_templates`, `functional_areas`, `scenarios`, and `scenario_templates` from anonymous Server Components without any further migration.

## Next Phase Readiness

- **Phase 26** complete: all 5 requirements (CAT-01..05) satisfied. Schema + RLS chain proven joinable end-to-end under anon. Verification: passed.
- **Phase 27 (scenario content seed)** unblocked at the schema level: 3 empty catalog tables ready to receive 50 scenarios + ~135 template mappings. `is_active`, `sort_order`, and `slug` constraints are in place to support idempotent re-seeding.
- **Phase 28 (public landing page)** unblocked at the data layer: anonymous Server Components can read active templates from `automation_templates` via the new anon policy (parallel to Phase 26-27, can start once content lands).
- **Phase 29 (public catalog navigation)** unblocked at the data layer: full 4-table anon JOIN proven to work end-to-end. SSR catalog/area/scenario pages can build their queries against this proven RLS chain.
- **Phase 30 (scenario selector + ROI calculator)** unblocked at the data layer: `scenarios.typical_hours_per_week` + `impact_label_en/es` columns are present, readable by anon, and aggregable across selected rows.
- **Customer dashboard** unaffected: `npm run build` exit 0, all 7 customer sections (Dashboard home, Automations, Catalog, Reports, Billing, Settings, Notifications) compile unchanged.
- **Admin dashboard** unaffected: all 5 admin surfaces (Home, Catalog, Requests, Automations, Clients) compile unchanged.
- **No blockers.**

## Self-Check: PASSED

- FOUND: `supabase/migrations/20260516000003_automation_templates_anon_select.sql`
- FOUND: `.planning/phases/26-catalog-data-model/26-03-SUMMARY.md`
- FOUND COMMIT: `a36c707` (Task 1 — anon SELECT migration)

---
*Phase: 26-catalog-data-model*
*Completed: 2026-05-15*
