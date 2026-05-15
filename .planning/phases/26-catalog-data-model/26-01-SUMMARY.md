---
phase: 26-catalog-data-model
plan: 01
subsystem: database
tags: [supabase, postgres, rls, migration, i18n, catalog]

# Dependency graph
requires:
  - phase: 02-database-schema
    provides: public.update_updated_at_column() trigger function (reused, not redefined)
  - phase: 02-database-schema
    provides: anon + authenticated roles + uuid_generate_v4() extension already enabled
provides:
  - public.functional_areas table (bilingual top-level catalog taxonomy)
  - RLS pattern for public-readable + service-role-write catalog tables
  - Foundation for Phase 27 8-area content seed
affects: [27-scenario-content-seed, 29-public-catalog-navigation, 30-scenario-selector-roi]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bilingual columns via <field>_en / <field>_es pairs (CONTEXT.md default for next-intl two-locale apps)"
    - "Global catalog table: anon + authenticated SELECT on is_active = true; no INSERT/UPDATE/DELETE policies (service_role bypasses RLS)"
    - "Additive-only migration timestamp +1 day from latest existing (20260516000001 after 20260509000003), leaving 20260516000002/03 reserved for 26-02 / 26-03"

key-files:
  created:
    - supabase/migrations/20260516000001_functional_areas.sql
  modified: []

key-decisions:
  - "Bilingual storage via separate label_en/label_es + description_en/description_es columns (NOT JSONB) — matches existing next-intl en/es split, indexable, simplest server-side queries"
  - "Two SELECT policies (one per role: anon + authenticated) rather than a single TO public policy — explicit role surface keeps audit trail readable and aligns with project's existing pattern in 20260305000002 (single TO authenticated)"
  - "Slug column at VARCHAR(60) tightens the existing automation_templates VARCHAR(100) precedent — 8 areas with short URL-safe slugs (e.g. ventas, agentes-ia) need far less room and a shorter ceiling prevents accidental long-slug regressions in admin tooling"
  - "Partial index on is_active WHERE is_active = true — every RLS-visible read filters on this predicate, so a partial index keeps the index small and matches Postgres planner expectations"

patterns-established:
  - "Public-catalog RLS recipe: ENABLE RLS + two SELECT policies (anon + authenticated) gated on is_active = true; zero write policies; service_role handles seed/admin writes. Reused verbatim in 26-02 / 26-03."
  - "Bilingual column naming: <field>_en / <field>_es as separate columns; labels at VARCHAR(120), descriptions as TEXT (no length cap). Future catalog tables (industries, scenarios) follow this exact shape."
  - "Migration idempotency template: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS + CREATE POLICY, CREATE INDEX IF NOT EXISTS, DROP TRIGGER IF EXISTS + CREATE TRIGGER. Verified by running supabase db reset --local twice in succession with zero errors."

requirements-completed: [CAT-01]

# Metrics
duration: 4min
completed: 2026-05-15
---

# Phase 26 Plan 01: functional_areas Foundation Summary

**Bilingual `public.functional_areas` table with anon-readable RLS, partial index on is_active, and reused updated_at trigger — ready for Phase 27 to seed the 8 areas.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-15T18:06:59Z
- **Completed:** 2026-05-15T18:11:02Z
- **Tasks:** 2 (1 file-producing, 1 verification-only)
- **Files modified:** 1 created (migration), 0 modified

## Accomplishments

- Shipped additive migration `20260516000001_functional_areas.sql` with 10 columns, 2 RLS SELECT policies (anon + authenticated), 2 indexes (sort + active partial), and `functional_areas_updated_at` trigger reusing `public.update_updated_at_column()`.
- Verified idempotency: ran `supabase db reset --local` twice end-to-end; both runs exit 0.
- Verified RLS posture with smoke test against anon role: SELECT returns only active rows; INSERT rejected with "new row violates row-level security policy"; UPDATE returns 0 rows affected with no mutation observed.
- Confirmed customer dashboard build still passes (`npm run build` in `web/` builds all routes including catalog).
- `supabase/seed.sql` untouched (Phase 27 owns the 8-area content seed).

## Task Commits

1. **Task 1: Write functional_areas migration (DDL + indexes + trigger)** — `4d81eef` (feat)
2. **Task 2: Smoke-test anon SELECT and write-rejection on functional_areas** — verification-only, no file changes (migration unchanged from Task 1; assertions A-D all passed on first attempt)

**Plan metadata commit:** _pending_ (`docs(26-01): complete functional-areas plan`, includes this SUMMARY + STATE + ROADMAP + REQUIREMENTS updates)

## Files Created/Modified

- `supabase/migrations/20260516000001_functional_areas.sql` — Additive migration creating `public.functional_areas` with bilingual labels/descriptions, slug (unique), sort_order, is_active, timestamps; RLS allows anon + authenticated SELECT on active rows; updated_at trigger reuses existing function. 92 lines.

## Decisions Made

- **Bilingual via separate columns (label_en/label_es), not JSONB** — matches existing next-intl en/es split in `web/messages/{en,es}.json`, indexable, simplest server-side queries. Locked here for the rest of Phase 26 (industries 26-02, scenarios 26-03).
- **Two SELECT policies per role (anon + authenticated)** rather than a single `TO public` policy — explicit role surface keeps audit trail readable and follows the project's existing per-role pattern.
- **VARCHAR(60) for slug** — 8 short URL-safe slugs need far less than the 100-char ceiling on `automation_templates.slug`; the tighter cap prevents accidental long-slug regressions when admin CRUD ships.
- **Partial index on `is_active WHERE is_active = true`** — every RLS-visible read filters on this predicate, so a partial index stays small and aligns with the planner's expected predicate.

## Smoke Test Evidence

**Database URL used:** `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (local supabase, password is the well-known dev default — not sensitive)

**Access path:** `docker exec supabase_db_12ai psql -U postgres -d postgres ...` (host `psql` not installed; the Supabase Postgres container is `supabase_db_12ai`)

**Setup (service-role superuser, bypasses RLS):**
```sql
INSERT INTO public.functional_areas (slug, label_en, label_es, sort_order)
  VALUES ('__smoke_active', 'Smoke Active', 'Prueba Activa', 999);
-- INSERT 0 1

INSERT INTO public.functional_areas (slug, label_en, label_es, sort_order, is_active)
  VALUES ('__smoke_inactive', 'Smoke Inactive', 'Prueba Inactiva', 999, false);
-- INSERT 0 1
```

**Assertion A — anon sees only the active row:**
```
SET ROLE anon;
SELECT slug FROM public.functional_areas WHERE slug LIKE '__smoke_%' ORDER BY slug;
      slug
----------------
 __smoke_active
(1 row)
```
PASS — inactive row hidden by `USING (is_active = true)` RLS predicate.

**Assertion B — anon INSERT rejected:**
```
SET ROLE anon;
INSERT INTO public.functional_areas (slug, label_en, label_es)
  VALUES ('__smoke_anon_write', 'Hack', 'Hack');
ERROR:  new row violates row-level security policy for table "functional_areas"
```
PASS — no INSERT policy exists for anon; RLS blocks the write.

**Assertion C — anon UPDATE produces zero affected rows and no mutation:**
```
SET ROLE anon;
UPDATE public.functional_areas SET label_en = 'pwned' WHERE slug = '__smoke_active';
UPDATE 0
```
Defensive readback (as postgres):
```
SELECT slug, label_en FROM public.functional_areas WHERE slug LIKE '__smoke_%' ORDER BY slug;
       slug       |    label_en
------------------+----------------
 __smoke_active   | Smoke Active
 __smoke_inactive | Smoke Inactive
(2 rows)
```
PASS — `label_en` for `__smoke_active` is still `Smoke Active`, NOT `pwned`. No UPDATE policy exists; RLS filtered the row out of the UPDATE target set.

**Assertion D — authenticated sees only the active row:**
```
SET ROLE authenticated;
SELECT slug FROM public.functional_areas WHERE slug LIKE '__smoke_%' ORDER BY slug;
      slug
----------------
 __smoke_active
(1 row)
```
PASS — same RLS predicate, same result for authenticated role.

**Cleanup:**
```
RESET ROLE;
DELETE FROM public.functional_areas WHERE slug LIKE '__smoke_%';
-- DELETE 2

SELECT count(*) FROM public.functional_areas WHERE slug LIKE '__smoke_%';
-- 0
```
Zero `__smoke_%` rows remain. Migration file unchanged from Task 1 — no fixes were required.

## Idempotency Evidence

`npx supabase db reset --local` was run twice in sequence. Second run output (tail):
```
Restarting containers...
Finished supabase db reset on branch main.
```
No errors. `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS` + `CREATE POLICY`, `CREATE INDEX IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER` all behaved idempotently as designed.

## Final Schema (from `\d public.functional_areas`)

```
                            Table "public.functional_areas"
     Column     |           Type           | Nullable |      Default
----------------+--------------------------+----------+--------------------
 id             | uuid                     | not null | uuid_generate_v4()
 slug           | character varying(60)    | not null |
 label_en       | character varying(120)   | not null |
 label_es       | character varying(120)   | not null |
 description_en | text                     |          |
 description_es | text                     |          |
 sort_order     | integer                  | not null | 0
 is_active      | boolean                  | not null | true
 created_at     | timestamp with time zone | not null | now()
 updated_at     | timestamp with time zone | not null | now()
Indexes:
    "functional_areas_pkey" PRIMARY KEY, btree (id)
    "functional_areas_slug_key" UNIQUE CONSTRAINT, btree (slug)
    "idx_functional_areas_active" btree (is_active) WHERE is_active = true
    "idx_functional_areas_sort" btree (sort_order, slug)
Policies:
    POLICY "functional_areas_select_active_anon" FOR SELECT
      TO anon
      USING ((is_active = true))
    POLICY "functional_areas_select_active_authenticated" FOR SELECT
      TO authenticated
      USING ((is_active = true))
Triggers:
    functional_areas_updated_at BEFORE UPDATE ON functional_areas
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

## Deviations from Plan

None — plan executed exactly as written. All 10 columns shipped with the exact names, types, and nullability specified; both policies shipped with the exact names specified; both indexes shipped; trigger shipped. Smoke-test assertions A-D all passed on first attempt.

## Issues Encountered

- **Host `psql` not on PATH** — resolved by using `docker exec supabase_db_12ai psql -U postgres -d postgres ...` to talk to the running Supabase Postgres container directly. Functionally identical to the plan's `psql "$DATABASE_URL_LOCAL"`, just routes through Docker. The `\$DATABASE_URL_LOCAL` env-var hint in the plan was not strictly available; the local Supabase URL (`postgresql://postgres:postgres@127.0.0.1:54322/postgres`) was discovered via `supabase status` as the plan's NOTE allowed.

## User Setup Required

None — local-only schema change. No external service configuration required.

## Next Phase Readiness

- **Phase 26-02 (industries)** unblocked: same RLS recipe and bilingual column shape can be lifted verbatim; reserve timestamp `20260516000002_industries.sql`.
- **Phase 26-03 (scenarios)** unblocked: will FK into `functional_areas(id)` once 26-02 lands.
- **Phase 27 (content seed)** unblocked at the schema level: empty `functional_areas` is ready to receive the 8 seeded areas (Ventas, Marketing, Atencion al Cliente, Documentos, Productividad, Reportes, Agentes IA, Integraciones & Seguridad).
- **Customer dashboard** unaffected: `npm run build` in `web/` still produces the full route set without errors. `automation_templates` queries (`fetchCatalogTemplates`, `fetchTemplateBySlug`) are untouched.
- **No blockers.**

## Self-Check: PASSED

- FOUND: `supabase/migrations/20260516000001_functional_areas.sql`
- FOUND: `.planning/phases/26-catalog-data-model/26-01-SUMMARY.md`
- FOUND COMMIT: `4d81eef` (Task 1)

---
*Phase: 26-catalog-data-model*
*Completed: 2026-05-15*
