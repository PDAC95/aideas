---
phase: 27-scenario-content-seed
plan: 01
subsystem: database

tags: [supabase, postgres, migration, seed, idempotent, functional_areas, catalog, i18n, scenarios]

# Dependency graph
requires:
  - phase: 26-catalog-data-model
    provides: "public.functional_areas table (slug UNIQUE, bilingual columns, anon-read RLS) created empty by migration 20260516000001"
provides:
  - "8 functional_areas rows seeded with bilingual labels + descriptions, is_active=true, sort_order 10..80"
  - "Idempotent INSERT ... ON CONFLICT (slug) DO UPDATE pattern for taxonomy seeds"
  - "Stable slug join key for downstream FK resolution (scenarios -> functional_area_id via subquery)"
affects: [27-02-industries-seed, 27-03-scenarios-seed, 27-04-verification, 28-public-landing, 29-public-catalog, 30-roi-calculator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Idempotent taxonomy seed via INSERT ... ON CONFLICT (natural_key) DO UPDATE SET ... updated_at = NOW()"
    - "Seed-as-migration when no FK dependency exists on data seeded later in supabase/seed.sql"
    - "Slug as stable natural join key — avoids hardcoded UUIDs while keeping re-run identity"

key-files:
  created:
    - "supabase/migrations/20260517000001_functional_areas_seed.sql"
  modified: []

key-decisions:
  - "Used ON CONFLICT DO UPDATE (not DO NOTHING) so label/description edits re-applied via migration push through on re-run"
  - "Seeded via migration (not seed.sql) because functional_areas has no FK dependency on automation_templates — runs cleanly before seed.sql"
  - "No hardcoded UUIDs — slug UNIQUE is sufficient identity for re-runs and FK lookups (scenarios in 27-03 will resolve functional_area_id via slug subquery)"
  - "ON CONFLICT also forces is_active = true on re-apply to re-activate any soft-deleted rows (operational safety)"

patterns-established:
  - "Idempotent seed migration pattern: header comment block (purpose/strategy/idempotency/downstream) + single multi-row INSERT + ON CONFLICT (natural_key) DO UPDATE SET col = EXCLUDED.col, updated_at = NOW() + trailing verification-comment with expected count"
  - "Customer-pain voice for taxonomy descriptions (first-person SMB owner, not vendor pitch)"

requirements-completed: [SCEN-04]

# Metrics
duration: 8min
completed: 2026-05-15
---

# Phase 27 Plan 01: Functional Areas Seed Summary

**8 bilingual functional_areas seeded via idempotent ON CONFLICT migration — stable slug join key ready for Plan 27-03 scenarios FK resolution.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-15T19:51:00Z
- **Completed:** 2026-05-15T19:59:52Z
- **Tasks:** 2 (1 implementation + 1 verification-only)
- **Files modified:** 1 created, 0 modified

## Accomplishments

- All 8 functional_areas rows seeded with bilingual EN/ES labels and customer-pain-voice descriptions (sort_order 10, 20, 30, 40, 50, 60, 70, 80)
- Idempotency proven across both contracts required by SCEN-04: full `supabase db reset --local` and in-place re-apply via `docker exec -i ... psql ... < migration.sql`
- Zero duplicate-key errors on re-apply; updated_at timestamp advanced on all 8 rows confirming ON CONFLICT DO UPDATE fired
- `web/` build still exits 0 — no schema break for the existing authenticated catalog

## Task Commits

Each task was committed atomically:

1. **Task 1: Create idempotent functional_areas seed migration** — `efbcfd0` (feat)
2. **Task 2: Prove idempotency by re-applying the migration** — verification-only, no files committed (plan declared `<files></files>`)

**Plan metadata commit:** (created at end of plan with SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified

- `supabase/migrations/20260517000001_functional_areas_seed.sql` — Single multi-row INSERT of 8 fixed taxonomy rows with ON CONFLICT (slug) DO UPDATE; populates the empty functional_areas table created in Phase 26.

## Decisions Made

- **ON CONFLICT DO UPDATE over DO NOTHING** — re-running the migration after a label edit pushes the new copy through. DO NOTHING would silently drop edits.
- **Slug as the natural key, no hardcoded UUIDs** — Plan 27-03 scenarios resolve functional_area_id via `(SELECT id FROM public.functional_areas WHERE slug = '...')`, so 8 hardcoded UUID literals would add noise with no benefit. Slug UNIQUE is enough for both idempotency and FK lookup.
- **Migration (not seed.sql)** — functional_areas has no FK dependency on automation_templates, so it can safely live in a migration that runs before seed.sql. Scenarios (Plan 27-03) DO depend on automation_templates and must therefore live in seed.sql.
- **Force is_active = true on conflict** — operational safety: if a row was soft-deleted between releases, a re-run of the seed migration re-activates it without manual intervention.
- **One-sentence customer-pain descriptions per area** — first-person SMB voice ("Stop copy-pasting between forms…"), not vendor pitch. Matches the Phase 27 CONTEXT tone decision for scenarios and primes the same voice across catalog area landing pages.

## Deviations from Plan

None — plan executed exactly as written. Two-task structure followed verbatim; descriptions polished from the planner's examples but kept the customer-pain voice and ≤1-sentence rule.

## Issues Encountered

None.

## Verification Evidence

### Full-reset path (Task 1 verify)

After `npx supabase db reset --local`:

```
 active_areas
--------------
            8
(1 row)

          slug           |        label_en         |         label_es          | sort_order
-------------------------+-------------------------+---------------------------+------------
 ventas                  | Sales                   | Ventas                    |         10
 marketing               | Marketing               | Marketing                 |         20
 atencion-al-cliente     | Customer Service        | Atencion al Cliente       |         30
 documentos              | Documents               | Documentos                |         40
 productividad           | Productivity            | Productividad             |         50
 reportes                | Reports                 | Reportes                  |         60
 agentes-ia              | AI Agents               | Agentes IA                |         70
 integraciones-seguridad | Integrations & Security | Integraciones y Seguridad |         80
(8 rows)
```

Bilingual descriptions all non-null:

```
          slug           | en_ok | es_ok | en_len | es_len
-------------------------+-------+-------+--------+--------
 ventas                  | t     | t     |     57 |     63
 marketing               | t     | t     |     83 |     80
 atencion-al-cliente     | t     | t     |     60 |     74
 documentos              | t     | t     |     57 |     63
 productividad           | t     | t     |     62 |     85
 reportes                | t     | t     |     80 |     77
 agentes-ia              | t     | t     |     75 |     93
 integraciones-seguridad | t     | t     |     55 |     64
(8 rows)
```

### Second full reset (Task 2, full-reset path)

```
Applying migration 20260517000001_functional_areas_seed.sql...
Seeding data from supabase/seed.sql...
...
Finished supabase db reset on branch main.

 count_after_reset
-------------------
                 8
(1 row)

  max_updated_before_reapply
-------------------------------
 2026-05-15 19:57:58.442942+00
(1 row)
```

### In-place re-apply (Task 2, in-place path)

`docker exec -i supabase_db_12ai psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/migrations/20260517000001_functional_areas_seed.sql`:

```
INSERT 0 8
```

(8 rows processed via INSERT, 0 newly inserted — all hit ON CONFLICT and went to UPDATE. Zero unique-violation errors.)

Post-reapply state:

```
 count_after_reapply
---------------------
                   8
(1 row)

   max_updated_after_reapply
-------------------------------
 2026-05-15 19:58:22.231653+00
(1 row)
```

Updated_at advanced from `19:57:58.442942` to `19:58:22.231653` on all 8 rows, confirming the trigger fired via the DO UPDATE clause.

### Web build smoke check

`cd web && npm run build` exits 0:

```
Compiled successfully in 4.9s
```

## Next Phase Readiness

- Functional_areas taxonomy is live and re-applicable — Plan 27-02 (industries seed) and Plan 27-03 (scenarios seed) can both proceed.
- Slug join keys (`ventas`, `marketing`, `atencion-al-cliente`, `documentos`, `productividad`, `reportes`, `agentes-ia`, `integraciones-seguridad`) are stable contracts that Plan 27-03 will reference in its scenario-to-area subqueries.
- No blockers; no follow-up tech debt added.

## Self-Check: PASSED

- FOUND: `supabase/migrations/20260517000001_functional_areas_seed.sql`
- FOUND: `.planning/phases/27-scenario-content-seed/27-01-SUMMARY.md`
- FOUND: commit `efbcfd0` (Task 1)

---

*Phase: 27-scenario-content-seed*
*Plan: 01*
*Completed: 2026-05-15*
