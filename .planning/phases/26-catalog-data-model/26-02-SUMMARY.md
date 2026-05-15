---
phase: 26-catalog-data-model
plan: 02
subsystem: database
tags: [supabase, postgres, rls, migration, i18n, catalog, pivot]

# Dependency graph
requires:
  - phase: 26-01
    provides: public.functional_areas table (FK target for scenarios.functional_area_id)
  - phase: 02-database-schema
    provides: public.automation_templates (FK target for scenario_templates.template_id); public.update_updated_at_column() trigger function
provides:
  - public.scenarios table (bilingual pain copy + impact estimate + FK to functional_areas)
  - public.scenario_templates pivot (many-to-many to automation_templates with display_order)
  - anon SELECT policy on automation_templates (filtered by is_active = true) — required for pivot RLS chain
  - RLS pattern for pivot tables gated by EXISTS on multiple active parents
affects: [27-scenario-content-seed, 29-public-catalog-navigation, 30-scenario-selector-roi]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pivot RLS via EXISTS subqueries against parent active-ness (anon + authenticated symmetric)"
    - "Composite PK on pivot (scenario_id, template_id) prevents duplicate mappings"
    - "ON DELETE CASCADE from both pivot parents (scenarios + automation_templates); ON DELETE RESTRICT from scenarios -> functional_areas to prevent accidental mass-delete via admin UI later"
    - "DOUBLE PRECISION for fractional hour estimates (e.g. 2.5 hrs/week) on scenarios.typical_hours_per_week"

key-files:
  created:
    - supabase/migrations/20260516000002_scenarios_and_pivot.sql
  modified: []

key-decisions:
  - "Single migration file for both scenarios + pivot — pivot cannot exist without parent; atomic ship matches existing pattern (20260305000002 ships multiple related tables together)"
  - "Added Section 8 anon SELECT policy on automation_templates (additive, authorized by CONTEXT.md line 39) after Task 3 smoke test surfaced the broken RLS chain — fixes pivot visibility for anonymous Phase 29 SSR"
  - "Slug uniqueness GLOBAL on scenarios (VARCHAR(80) UNIQUE) — admin renames must collide-check across all areas to prevent /catalog/<area>/<scenario> route collisions"
  - "CHECK constraint scenarios_typical_hours_nonnegative — defensive guard against negative ROI inputs"
  - "No updated_at trigger on scenario_templates pivot — display_order edits in place are acceptable without audit trail"

patterns-established:
  - "Pivot RLS recipe: ENABLE RLS + 2 SELECT policies (anon + authenticated) using AND-joined EXISTS subqueries against EACH parent's is_active flag; zero write policies; service_role handles seed/admin writes"
  - "When a pivot RLS predicate references a parent table, that parent MUST have a matching anon SELECT policy (or service-role-only writes are useless to the public funnel). Surfaced in smoke test, codified for future cross-table RLS"
  - "Smoke-test 5-assertion battery for pivot RLS: A) anon sees only active rows, B) anon sees only pivot rows whose parents are all active, C) anon writes rejected, D) disable upstream parent -> downstream rows vanish, E) disable downstream parent -> pivot rows vanish"

requirements-completed: [CAT-02, CAT-03]

# Metrics
duration: 6min
completed: 2026-05-15
---

# Phase 26 Plan 02: scenarios + scenario_templates Pivot Summary

**Bilingual `public.scenarios` table with parent-gated RLS, many-to-many `scenario_templates` pivot with cascading FKs, and the anon SELECT policy on `automation_templates` that completes the pivot's RLS chain — ready for Phase 27 to seed 50 scenarios and ~135 template mappings.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-15T18:15:29Z
- **Completed:** 2026-05-15T18:21:57Z
- **Tasks:** 3 (2 file-producing + 1 verification-only with deviation fix)
- **Files modified:** 1 created (migration), 0 other files modified

## Accomplishments

- Shipped additive migration `20260516000002_scenarios_and_pivot.sql` (~200 lines) containing:
  - `scenarios` table: 13 explicit columns + 1 CHECK constraint, FK to functional_areas RESTRICT, unique slug VARCHAR(80), bilingual pain_headline_en/es NOT NULL + optional pain_body_en/es, typical_hours_per_week DOUBLE PRECISION + impact_label_en/es, sort_order, is_active, timestamps.
  - `scenario_templates` pivot: composite PK (scenario_id, template_id), both FKs ON DELETE CASCADE, display_order, created_at.
  - 5 indexes total (3 on scenarios, 2 on pivot) — composite area+sort, partial active, slug, composite pivot forward, pivot reverse.
  - 4 RLS SELECT policies (2 anon + 2 authenticated) gated by parent active-ness via EXISTS.
  - 1 trigger (`scenarios_updated_at` reusing `public.update_updated_at_column()`).
  - 1 deviation-fix policy: anon SELECT on `automation_templates` filtered by `is_active = true` (Section 8, authorized by CONTEXT.md line 39, surfaced by smoke test).
- Verified `supabase db reset --local` exits 0 against the unmodified `supabase/seed.sql` across 3 successive runs.
- All 5 smoke-test assertions (A-E) pass on the final migration; cleanup leaves zero `__smoke_%` rows.
- `npm run build` in `web/` exits 0 — existing customer + admin catalog UIs unchanged.
- `supabase/seed.sql` diff is empty — Phase 27 content scope preserved.

## Task Commits

1. **Task 1: Write scenarios table DDL + RLS + indexes + trigger** — `6a2af69` (feat)
2. **Task 2: Append scenario_templates pivot DDL + RLS + indexes** — `bb3d55c` (feat)
3. **Task 3: FK + RLS smoke test (with deviation fix)** — `11d5ddc` (fix) — added anon SELECT policy on `automation_templates` to fix broken pivot RLS chain surfaced by assertion B

**Plan metadata commit:** _pending_ (`docs(26-02): complete scenarios-and-pivot plan` — includes this SUMMARY + STATE + ROADMAP + REQUIREMENTS updates)

## Files Created/Modified

- `supabase/migrations/20260516000002_scenarios_and_pivot.sql` — Additive migration creating `public.scenarios` + `public.scenario_templates` with full RLS, indexes, trigger, and the required anon SELECT policy on `automation_templates`. ~200 lines.

## Decisions Made

- **Both tables in one migration file** — pivot cannot exist without scenarios; atomic ship matches the existing pattern in `20260305000002_automation_business.sql` (multiple related tables in one migration).
- **Slug globally unique on scenarios** (`VARCHAR(80) UNIQUE`) — powers `/catalog/<area>/<scenario>` routes in Phase 29; admin rename collision-check is single-table.
- **`scenarios.functional_area_id` ON DELETE RESTRICT** (not CASCADE) — prevents accidental mass-deletion if a future admin UI exposes area deletion; admin must explicitly clear scenarios first.
- **`scenario_templates` both FKs ON DELETE CASCADE** — pivot is a derivative join; if either parent dies, the pivot row is meaningless. Matches CONTEXT.md decision.
- **`DOUBLE PRECISION` for `typical_hours_per_week`** — half-hour estimates (2.5, 4.5) need fractional precision for Phase 30 ROI math.
- **No `updated_at` on pivot** — display_order edits in place don't warrant trigger overhead.
- **CHECK constraint on typical_hours_per_week >= 0** — defensive guard against negative ROI inputs from admin tooling.
- **Added anon SELECT policy on `automation_templates`** (Section 8) — REQUIRED for the pivot RLS chain to work. Authorized by CONTEXT.md line 39: "automation_templates SELECT must become readable by anonymous clients for the public SSR to work — new policy adds anon SELECT filtered to active templates. Existing authenticated policies remain untouched."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added anon SELECT policy on `automation_templates` to unblock pivot RLS chain**

- **Found during:** Task 3 (smoke test assertion B failed — anon saw 0 pivot rows even with all parents active)
- **Issue:** The pivot's RLS predicate uses `EXISTS (SELECT 1 FROM automation_templates t WHERE t.id = ... AND t.is_active = true)`. This subquery evaluates under the calling role (anon). `automation_templates` had NO anon SELECT policy (only `automation_templates_select_active` for authenticated and the admin-only policies). So the EXISTS clause silently returned false under anon, making every pivot row invisible to anonymous clients. Would have broken Phase 29 public catalog SSR completely.
- **Fix:** Appended Section 8 to the same migration file. New policy `automation_templates_select_active_anon` grants `SELECT` to the `anon` role filtered by `is_active = true`. Authenticated policies left untouched (additive only).
- **Files modified:** `supabase/migrations/20260516000002_scenarios_and_pivot.sql`
- **Verification:** Re-ran `supabase db reset --local` + smoke fixtures + assertion B → now returns `visible_pivot_rows = 1` as expected. Assertions A, C, D, E all also pass.
- **Committed in:** `11d5ddc` (Task 3 fix commit)
- **Authorization:** CONTEXT.md line 39 explicitly authorizes this exact policy. Plan author omitted it.

---

**Total deviations:** 1 auto-fixed (1 missing-critical RLS policy)
**Impact on plan:** Fix essential for the pivot to be readable by the public funnel. No scope creep — the policy was already pre-authorized by CONTEXT.md and is purely additive. The plan's `<must_haves>` is fully satisfied with this fix included.

## Smoke Test Evidence

**Database access:** `docker exec -i supabase_db_12ai psql -U postgres -d postgres` (host `psql` not on PATH; container is `supabase_db_12ai`, port 54322 internal).

**Setup (service-role superuser, bypasses RLS):**

```
INSERT INTO public.functional_areas (slug, label_en, label_es, sort_order)
  VALUES ('__smoke_area', 'Smoke Area', 'Area Prueba', 999);
-- INSERT 0 1

INSERT INTO public.scenarios (functional_area_id, slug, pain_headline_en, pain_headline_es, typical_hours_per_week)
  SELECT id, '__smoke_scenario_active', 'Active', 'Activa', 4.5 FROM public.functional_areas WHERE slug='__smoke_area';
-- INSERT 0 1

INSERT INTO public.scenarios (functional_area_id, slug, pain_headline_en, pain_headline_es, is_active)
  SELECT id, '__smoke_scenario_inactive', 'Inactive', 'Inactiva', false FROM public.functional_areas WHERE slug='__smoke_area';
-- INSERT 0 1

INSERT INTO public.scenario_templates (scenario_id, template_id, display_order)
  SELECT id, 'ee010100-0000-0000-0000-000000000001'::uuid, 0 FROM public.scenarios WHERE slug='__smoke_scenario_active';
-- INSERT 0 1

INSERT INTO public.scenario_templates (scenario_id, template_id, display_order)
  SELECT id, 'ee010100-0000-0000-0000-000000000001'::uuid, 0 FROM public.scenarios WHERE slug='__smoke_scenario_inactive';
-- INSERT 0 1
```

Test template: `ee010100-0000-0000-0000-000000000001` (`lead-followup-email`, seeded by `supabase/seed.sql`, `is_active = true`).

**Assertion A — anon sees only active scenario:**

```
SET ROLE anon;
SELECT slug FROM public.scenarios WHERE slug LIKE '__smoke_%' ORDER BY slug;
          slug
-------------------------
 __smoke_scenario_active
(1 row)
```

PASS — RLS hides `__smoke_scenario_inactive` via `is_active = true` predicate; both fixtures point to an active parent area so only is_active gates here.

**Assertion B — anon sees only the pivot row tied to the active scenario:**

```
SET ROLE anon;
SELECT count(*) AS visible_pivot_rows FROM public.scenario_templates
  WHERE template_id = 'ee010100-0000-0000-0000-000000000001'::uuid;
 visible_pivot_rows
--------------------
                  1
(1 row)
```

PASS (after deviation fix) — anon sees 1 row (the one tied to `__smoke_scenario_active`); the row tied to the inactive scenario is hidden by the EXISTS-on-scenarios subquery. The active row is visible because (a) the active scenario passes the scenarios-EXISTS, (b) its area is active, and (c) the template is active AND anon can now read it via the new Section 8 policy.

**Assertion C — anon INSERT must be rejected:**

```
SET ROLE anon;
INSERT INTO public.scenarios (functional_area_id, slug, pain_headline_en, pain_headline_es)
  SELECT id, '__hack', 'X', 'X' FROM public.functional_areas WHERE slug='__smoke_area';
ERROR:  new row violates row-level security policy for table "scenarios"
```

PASS — no INSERT policy exists for `anon` on `scenarios`; RLS rejects the write.

**Assertion D — disabling parent area hides scenarios from anon:**

```
UPDATE public.functional_areas SET is_active = false WHERE slug='__smoke_area';
-- UPDATE 1

SET ROLE anon;
SELECT count(*) AS visible_scenarios FROM public.scenarios WHERE slug LIKE '__smoke_%';
 visible_scenarios
-------------------
                 0
(1 row)
```

PASS — cascading active-ness gate via parent area: even though `__smoke_scenario_active` is itself active, the EXISTS subquery against `functional_areas` now returns false because the parent is inactive, so anon sees zero rows.

**Assertion E — disabling template hides pivot row from anon (area re-enabled):**

```
UPDATE public.functional_areas SET is_active = true WHERE slug='__smoke_area';
UPDATE public.automation_templates SET is_active = false WHERE id = 'ee010100-0000-0000-0000-000000000001'::uuid;

SET ROLE anon;
SELECT count(*) AS visible_pivot_rows FROM public.scenario_templates
  WHERE template_id = 'ee010100-0000-0000-0000-000000000001'::uuid;
 visible_pivot_rows
--------------------
                  0
(1 row)
```

Sanity check (scenarios still visible because the area is active again):

```
SET ROLE anon;
SELECT slug FROM public.scenarios WHERE slug LIKE '__smoke_%';
          slug
-------------------------
 __smoke_scenario_active
(1 row)
```

PASS — the template-active gate works independently of the area/scenario gates; pivot row vanishes when the downstream template parent goes inactive.

**Cleanup:**

```
RESET ROLE;
UPDATE public.automation_templates SET is_active = true WHERE id = 'ee010100-0000-0000-0000-000000000001'::uuid;
DELETE FROM public.scenarios WHERE slug LIKE '__smoke_%';      -- DELETE 2 (cascades to pivot rows)
DELETE FROM public.functional_areas WHERE slug = '__smoke_area'; -- DELETE 1
-- leftover_scenarios=0, leftover_areas=0, test_template_is_active=t
```

Zero `__smoke_%` rows remain in either table; `lead-followup-email` template back to `is_active = true`.

## Final Schema

**`public.scenarios`** (from `\d public.scenarios`):

```
         Column         |           Type           | Nullable |      Default
------------------------+--------------------------+----------+--------------------
 id                     | uuid                     | not null | uuid_generate_v4()
 functional_area_id     | uuid                     | not null |
 slug                   | character varying(80)    | not null |
 pain_headline_en       | character varying(200)   | not null |
 pain_headline_es       | character varying(200)   | not null |
 pain_body_en           | text                     |          |
 pain_body_es           | text                     |          |
 typical_hours_per_week | double precision         |          |
 impact_label_en        | text                     |          |
 impact_label_es        | text                     |          |
 sort_order             | integer                  | not null | 0
 is_active              | boolean                  | not null | true
 created_at             | timestamp with time zone | not null | now()
 updated_at             | timestamp with time zone | not null | now()
Indexes:
    "scenarios_pkey" PRIMARY KEY, btree (id)
    "scenarios_slug_key" UNIQUE CONSTRAINT, btree (slug)
    "idx_scenarios_active" btree (is_active) WHERE is_active = true
    "idx_scenarios_area_sort" btree (functional_area_id, sort_order, slug)
    "idx_scenarios_slug" btree (slug)
Check constraints:
    "scenarios_typical_hours_nonnegative" CHECK (typical_hours_per_week IS NULL OR typical_hours_per_week >= 0)
Foreign-key constraints:
    "scenarios_functional_area_id_fkey" FOREIGN KEY (functional_area_id) REFERENCES functional_areas(id) ON DELETE RESTRICT
Policies:
    POLICY "scenarios_select_active_anon" FOR SELECT TO anon
      USING ((is_active = true) AND EXISTS (SELECT 1 FROM functional_areas fa
        WHERE fa.id = scenarios.functional_area_id AND fa.is_active = true))
    POLICY "scenarios_select_active_authenticated" FOR SELECT TO authenticated
      USING ((is_active = true) AND EXISTS (SELECT 1 FROM functional_areas fa
        WHERE fa.id = scenarios.functional_area_id AND fa.is_active = true))
Triggers:
    scenarios_updated_at BEFORE UPDATE ON scenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

**`public.scenario_templates`** (from `\d public.scenario_templates`):

```
    Column     |           Type           | Nullable | Default
---------------+--------------------------+----------+---------
 scenario_id   | uuid                     | not null |
 template_id   | uuid                     | not null |
 display_order | integer                  | not null | 0
 created_at    | timestamp with time zone | not null | now()
Indexes:
    "scenario_templates_pkey" PRIMARY KEY, btree (scenario_id, template_id)
    "idx_scenario_templates_scenario" btree (scenario_id, display_order, template_id)
    "idx_scenario_templates_template" btree (template_id)
Foreign-key constraints:
    "scenario_templates_scenario_id_fkey" FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
    "scenario_templates_template_id_fkey" FOREIGN KEY (template_id) REFERENCES automation_templates(id) ON DELETE CASCADE
Policies:
    POLICY "scenario_templates_select_active_anon" FOR SELECT TO anon
      USING (EXISTS (SELECT 1 FROM scenarios s JOIN functional_areas fa ON fa.id = s.functional_area_id
        WHERE s.id = scenario_templates.scenario_id AND s.is_active AND fa.is_active)
        AND EXISTS (SELECT 1 FROM automation_templates t
          WHERE t.id = scenario_templates.template_id AND t.is_active))
    POLICY "scenario_templates_select_active_authenticated" FOR SELECT TO authenticated
      USING (... identical predicate ...)
```

## Build Verification

`npm run build` in `web/` — last 5 lines of output:

```
├ ƒ /verify-email


ƒ Proxy (Middleware)

ƒ  (Dynamic)  server-rendered on demand
```

Exit code 0. All 16 routes (auth + dashboard + legal) still compile. Existing `automation_templates` queries (`fetchCatalogTemplates`, `fetchTemplateBySlug`) untouched.

## Idempotency Evidence

`npx supabase db reset --local` ran successfully across 3 sequential invocations (initial schema build, post-pivot re-apply, post-deviation-fix re-apply). Each run drops and rebuilds with zero errors; the `DROP POLICY IF EXISTS` / `CREATE TABLE IF NOT EXISTS` / `DROP TRIGGER IF EXISTS` guards all behave idempotently as designed.

## Issues Encountered

- **Pivot RLS chain silently broken under anon** — surfaced by smoke test assertion B (see Deviations above). Diagnosed quickly by checking `pg_policies` for `automation_templates`: only authenticated policies existed. Resolved by appending Section 8 to the migration. Took ~2 minutes from symptom to fix.

## User Setup Required

None — local-only schema change. No external service configuration required.

## Next Phase Readiness

- **Phase 26-03** unblocked: the remaining plan (industries) can lift the same RLS recipe verbatim from 26-01; reserve timestamp `20260516000003_industries.sql`.
- **Phase 27 (content seed)** unblocked at the schema level: empty `scenarios` + `scenario_templates` are ready to receive the 50 scenarios + ~135 template mappings.
- **Phase 29 (public catalog navigation)** unblocked at the schema level: anonymous reads through the full chain (functional_areas -> scenarios -> scenario_templates -> automation_templates) now work end-to-end as proven by smoke test.
- **Phase 30 (scenario selector + ROI)** unblocked: `typical_hours_per_week` + `impact_label_en/es` columns are present and queryable.
- **Customer dashboard** unaffected: `npm run build` exits 0; `automation_templates` authenticated queries unchanged.
- **No blockers.**

## Self-Check: PASSED

- FOUND: `supabase/migrations/20260516000002_scenarios_and_pivot.sql`
- FOUND: `.planning/phases/26-catalog-data-model/26-02-SUMMARY.md`
- FOUND COMMIT: `6a2af69` (Task 1 — scenarios DDL/RLS)
- FOUND COMMIT: `bb3d55c` (Task 2 — pivot DDL/RLS)
- FOUND COMMIT: `11d5ddc` (Task 3 — anon policy deviation fix)

---
*Phase: 26-catalog-data-model*
*Completed: 2026-05-15*
