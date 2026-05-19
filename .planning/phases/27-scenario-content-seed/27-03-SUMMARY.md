---
phase: 27-scenario-content-seed
plan: 03
subsystem: database

tags: [supabase, postgres, seed, idempotent, scenarios, scenario_templates, on-conflict, dollar-quoted-strings, catalog, i18n]

# Dependency graph
requires:
  - phase: 27-scenario-content-seed
    provides: "Plan 27-01 — 8 functional_areas seeded with stable slug join keys (resolves scenarios.functional_area_id via slug subquery)"
  - phase: 27-scenario-content-seed
    provides: "Plan 27-02 — locked 27-SCENARIO-DRAFT.md with 50 bilingual scenarios + 150 DB-validated template mappings (mechanically transformed into SQL)"
  - phase: 26-catalog-data-model
    provides: "Plan 26-02 — scenarios + scenario_templates schema with FK shape, anon-read RLS, and ON CONFLICT-friendly UNIQUE constraints"
provides:
  - "50 public.scenarios rows populated in the live DB via idempotent INSERT ... ON CONFLICT (slug) DO UPDATE block appended to supabase/seed.sql"
  - "150 public.scenario_templates rows populated via idempotent INSERT ... ON CONFLICT (scenario_id, template_id) DO UPDATE block — every scenario mapped to exactly 3 templates"
  - "Per-area distribution matching CONTEXT.md weights exactly: ventas=10, marketing=10, atencion-al-cliente=8, documentos=6, productividad=6, reportes=4, agentes-ia=3, integraciones-seguridad=3"
  - "End-to-end anon RLS chain proven: functional_areas → scenarios → scenario_templates → automation_templates returns all 50 scenarios + 150 mappings"
  - "SCEN-01, SCEN-02, SCEN-03, SCEN-04 physically realized in the DB"
affects: [27-04-verification, 28-public-landing, 29-public-catalog, 30-roi-calculator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mechanical Markdown-to-SQL transform pattern: ephemeral Node.js transformer reads locked draft, parses 11 stable fields per scenario block, emits idempotent SQL block; deleted post-emit so only the artifact (seed.sql delta) ships"
    - "Seed-as-append pattern: new sections appended to supabase/seed.sql with explicit Section banner + WHY comment + BEGIN/COMMIT wrapper — additive diff preserves existing seed integrity and survives git review"
    - "Re-emittable transformer pattern: anchor-based splice with prior-Section detection lets the transformer be re-run after draft edits without ending up with stacked duplicate sections"
    - "Dollar-quoted string body emission ($body_en$...$body_en$ / $body_es$...$body_es$) — survives any apostrophe, quote, or punctuation in multi-line pain copy without escape gymnastics"
    - "Slug-based FK subquery resolution for two cross-table FKs in one INSERT: functional_area_id via (SELECT id FROM functional_areas WHERE slug=...) and template_id via (SELECT id FROM automation_templates WHERE slug=...) — no hardcoded UUIDs in seed"

key-files:
  created: []
  modified:
    - "supabase/seed.sql (Section 14 appended: lines 4049-6733, +2687 lines, 50 scenarios INSERT + 150 scenario_templates INSERT inside one BEGIN/COMMIT)"

key-decisions:
  - "Section 14 lives in supabase/seed.sql (not in a migration) because scenario_templates.template_id FKs automation_templates which is itself seeded by seed.sql — a migration-based seed would run when automation_templates is empty and every pivot row would violate NOT NULL"
  - "ON CONFLICT (slug) DO UPDATE on scenarios refreshes pain copy, hours, sort_order, and forces is_active=true on re-run — lets the seed be re-applied in-place via psql pipe without conflict errors and pushes draft edits to existing rows"
  - "ON CONFLICT (scenario_id, template_id) DO UPDATE on the pivot refreshes display_order on re-run; the pivot is also TRUNCATE-CASCADEd via automation_templates so it gets fully recreated on every `supabase db reset --local`"
  - "Transformer script deleted post-emit per plan lifecycle — only the deterministic SQL artifact ships to git; re-running the transformer requires rebuilding it from the plan, which keeps the draft as the binding source-of-truth"
  - "display_order computed as (list_index + 1) * 10 so first template = 10, second = 20, third = 30 — leaves headroom for future inserts without renumbering"

patterns-established:
  - "Mechanical content transform: draft (human-edited Markdown) → ephemeral transformer (validated parser + DB cross-check) → seed.sql artifact (committed). Future content seeds follow the same pipeline."
  - "Section banner discipline: every new appended seed section gets a `-- =====`/`-- N. <name>`/`-- =====` header plus a WHY block explaining placement constraints — makes future Claude orient instantly when reading seed.sql top-to-bottom."
  - "Two-contract idempotency proof: (1) `supabase db reset --local` succeeds on consecutive runs with identical counts; (2) in-place `docker exec psql < seed.sql` succeeds with zero unique-violation errors and advances updated_at — proves ON CONFLICT clauses fire correctly under both replay modes."

requirements-completed: [SCEN-01, SCEN-02, SCEN-03, SCEN-04]

# Metrics
duration: ~14min
completed: 2026-05-19
---

# Phase 27 Plan 03: Scenario Seed Append Summary

**50 bilingual customer-pain scenarios + 150 scenario_templates mappings idempotently appended to supabase/seed.sql via a Markdown-to-SQL transformer; full RLS chain proven end-to-end against the live DB, double-reset and in-place replay both validated as idempotent.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-05-19T14:37:02Z
- **Completed:** 2026-05-19T14:50:51Z
- **Tasks:** 2 (1 implementation + 1 verification-only)
- **Files modified:** 1 (supabase/seed.sql, +2687 lines, additive only)

## Accomplishments

- Section 14 block appended to `supabase/seed.sql` (lines 4049-6733) with 50 scenarios + 150 scenario_templates mappings inside one BEGIN/COMMIT
- All 8 content-integrity assertions (A-H from the plan) pass against the live DB after `supabase db reset --local`
- Idempotency proven on both contracts: (1) consecutive db resets produce identical counts; (2) in-place re-apply via `docker exec psql < seed.sql` produces zero duplicate-key errors and advances `updated_at` (proving ON CONFLICT DO UPDATE fired)
- Anonymous RLS chain validated end-to-end: anon user sees all 50 scenarios + 150 mappings joined through functional_areas → scenarios → scenario_templates → automation_templates
- `web/` build still exits 0 — no schema break for the existing authenticated catalog
- Transformer script (`_emit_seed.mjs`) deleted post-emit per plan lifecycle requirement; only the seed.sql delta committed
- SCEN-01, SCEN-02, SCEN-03, SCEN-04 all physically realized in the database

## Task Commits

Each task was committed atomically:

1. **Task 1: Transform the approved draft and append the seed block to supabase/seed.sql** — `d8ac808` (feat)
2. **Task 2: Apply seed via db reset and verify content integrity** — verification-only, no files modified (plan declared `<files></files>`)

**Plan metadata commit:** (created at end of plan with SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `supabase/seed.sql` — Section 14 appended after the automation_template_translations section (lines 4049-6733). Block contains: (a) Section banner + WHY/idempotency comment block; (b) `BEGIN;`; (c) 50 scenarios INSERTs grouped by area in CONTEXT.md canonical order (ventas → marketing → atencion-al-cliente → documentos → productividad → reportes → agentes-ia → integraciones-seguridad), each scenario ordered by sort_order; (d) 150 scenario_templates INSERTs grouped by scenario with display_order = (list_index + 1) * 10; (e) `COMMIT;`; (f) `-- End of Section 14` marker. All prior sections of seed.sql untouched.

## Emit-Time Stats (Transformer Output)

The ephemeral transformer (`_emit_seed.mjs`, deleted post-emit) reported:

```json
{
  "scenarios": 50,
  "mappings": 150,
  "section14_banners": 1,
  "end_of_seed_banners": 1,
  "total_mappings": 150,
  "per_area": {
    "ventas": 10,
    "marketing": 10,
    "atencion-al-cliente": 8,
    "documentos": 6,
    "productividad": 6,
    "reportes": 4,
    "agentes-ia": 3,
    "integraciones-seguridad": 3
  }
}
```

The transformer also cross-validated every one of the 150 template slug references against the live `automation_templates` table (66 active templates) via `docker exec psql`, confirming zero orphan references at SQL-generation time before writing the seed.sql delta.

## Decisions Made

- **All content-modifying work goes into the transformer, not hand-edits to seed.sql** — the transformer is the deterministic source of the SQL artifact. Patrick can re-edit the draft later and a fresh transformer run will splice OUT the existing Section 14 and splice IN the new one (anchor logic detects prior banner + End-of-Section marker).
- **Two-block layout inside Section 14** — scenarios INSERTs first (grouped by area, in canonical order), then scenario_templates INSERTs (grouped by scenario, mapping order preserved via display_order * 10). Keeps the SQL diff readable and the runtime order safe (scenarios must exist before pivot rows that resolve scenario_id by slug).
- **Single BEGIN/COMMIT wrapping the entire Section 14** — atomic: if any INSERT fails (FK violation, syntax error), nothing in Section 14 commits. Keeps the DB in a consistent state under partial-failure conditions.
- **Re-emit splice logic** — the transformer detects a pre-existing Section 14 banner + End-of-Section marker and removes that entire range before appending the freshly-generated block. Without this, a re-run after a draft edit would stack two Section 14 blocks in the file.
- **No new migration files** — the previously-floated `20260517000002_scenarios_seed.sql` was NOT created. The migration-before-seed ordering of Supabase CLI made it impossible (automation_templates is empty during migration apply). Seed.sql is the only correct home for this content.

## Deviations from Plan

None — plan executed exactly as written. The transformer was built per the plan's step-by-step spec, ran cleanly on first invocation, and all 8 assertions passed without any retries.

## Issues Encountered

**1. Docker daemon offline at execution start**

- **Issue:** Docker Desktop was not running when execution started, blocking the transformer's DB cross-validation step and the subsequent `supabase db reset --local` verification.
- **Resolution:** Started Docker Desktop via PowerShell (`Start-Process` with elevated privileges); waited for daemon readiness (~2 seconds) before resuming. All Supabase containers came back online automatically.
- **Impact:** Negligible — added ~30 seconds of setup time; no impact on plan correctness.

No other issues. Transformer parse and validation logic worked on first run; ON CONFLICT clauses behaved exactly as designed; in-place replay and double-reset both produced stable counts with zero errors.

## Verification Evidence

### Task 1 — Automated verify (plan's `<verify>` block)

```
DELETED
scenarios=50 mappings=150 sec14_banners=1 end_of_seed_banners=1
```

All four counts hit target. Transformer artifact deleted post-emit. Exit 0.

### Task 2, Step 1 — First `supabase db reset --local`

Last 10 lines:

```
Applying migration 20260516000003_automation_templates_anon_select.sql...
Applying migration 20260517000001_functional_areas_seed.sql...
Seeding data from supabase/seed.sql...
NOTICE (00000): truncate cascades to table "automation_template_translations"
NOTICE (00000): truncate cascades to table "organization_notes"
NOTICE (00000): truncate cascades to table "scenario_templates"
Restarting containers...
Finished supabase db reset on branch main.
```

Exit code 0. No SQL errors during seed.sql application.

### Task 2, Step 2 — Assertions A through H

**Assertion A — Per-area distribution:**

```
          area           | scenarios
-------------------------+-----------
 ventas                  |        10
 marketing               |        10
 atencion-al-cliente     |         8
 documentos              |         6
 productividad           |         6
 reportes                |         4
 agentes-ia              |         3
 integraciones-seguridad |         3
(8 rows)
```

8 areas, sum=50, distribution matches CONTEXT.md targets exactly with zero deviation. PASS.

**Assertion B — Total active scenarios:**

```
 total_scenarios
-----------------
              50
```

PASS.

**Assertion C — Mapping count + per-scenario histogram:**

```
 total_mappings
----------------
            150

 templates_per_scenario | scenario_count
------------------------+----------------
                      3 |             50
```

150 mappings, every scenario has exactly 3 templates (well inside the cnt = 2/3/4 allowed band, no scenarios at cnt=0/1/5+). PASS.

**Assertion D — Orphan scenarios:**

```
 orphan_scenarios
------------------
                0
```

Zero scenarios without mappings. PASS.

**Assertion E — Orphan template references:**

```
 orphan_template_refs
----------------------
                    0
```

Zero pivot rows referencing non-existent templates (FK enforced this, asserted explicitly). PASS.

**Assertion F — Bilingual coverage (extended to cover headlines + bodies + impact labels):**

```
 missing_bilingual
-------------------
                 0
```

All 50 scenarios have non-null/non-empty EN+ES headlines, EN+ES bodies, and EN+ES impact labels. PASS.

**Assertion G — Integer hours 1-20:**

```
 bad_hours
-----------
         0
```

Every scenario's `typical_hours_per_week` is an integer in [1, 20]. PASS.

**Note for Plan 27-04 SUMMARY:** The DB column is `DOUBLE PRECISION` with a CHECK of only `>= 0`. The integer-1-to-20 rule is enforced ONLY at seed time (validator in 27-02 + transformer in 27-03), not at the schema level. A future hardening migration should add a stronger CHECK (`typical_hours_per_week >= 1 AND typical_hours_per_week <= 20 AND typical_hours_per_week = floor(typical_hours_per_week)`).

**Assertion H — Anonymous RLS chain (proves end-to-end read with real content):**

```
          area           | scenarios | mappings
-------------------------+-----------+----------
 ventas                  |        10 |       30
 marketing               |        10 |       30
 atencion-al-cliente     |         8 |       24
 documentos              |         6 |       18
 productividad           |         6 |       18
 reportes                |         4 |       12
 agentes-ia              |         3 |        9
 integraciones-seguridad |         3 |        9
(8 rows)
```

Anon user joins functional_areas → scenarios → scenario_templates and sees all 8 areas, 50 scenarios, 150 mappings (sum = 30+30+24+18+18+12+9+9 = 150, matches Assertion C exactly). RLS chain is open end-to-end for anon. PASS.

### Task 2, Step 3 — Second consecutive `supabase db reset --local`

Last 10 lines:

```
Applying migration 20260516000003_automation_templates_anon_select.sql...
Applying migration 20260517000001_functional_areas_seed.sql...
Seeding data from supabase/seed.sql...
NOTICE (00000): truncate cascades to table "automation_template_translations"
NOTICE (00000): truncate cascades to table "organization_notes"
NOTICE (00000): truncate cascades to table "scenario_templates"
Restarting containers...
Finished supabase db reset on branch main.
```

Re-assertion of A+B post-second-reset:

```
 scenarios_after_2nd_reset | mappings_after_2nd_reset |  max_updated_after_2nd_reset
---------------------------+--------------------------+-------------------------------
                        50 |                      150 | 2026-05-19 14:43:52.461741+00
```

Counts identical to first reset. Exit code 0. PASS (SCEN-04 reset-idempotency contract).

### Task 2, Step 4 — In-place replay via psql pipe

`docker exec -i supabase_db_12ai psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/seed.sql`

Exit code: `0`. Grep for `duplicate key` or `violates` in full output: zero matches.

Re-assertion post in-place replay:

```
 scenarios_after_inplace | mappings_after_inplace |   max_updated_after_inplace
-------------------------+------------------------+-------------------------------
                      50 |                    150 | 2026-05-19 14:48:12.195566+00
```

`updated_at` advanced from `14:43:52.461741+00` to `14:48:12.195566+00`, confirming ON CONFLICT DO UPDATE fired and the `updated_at = NOW()` clause refreshed every row. Counts unchanged. PASS (SCEN-04 in-place replay contract).

### Web build smoke check

```
cd web && npm run build
...
✓ Compiled successfully in 4.5s
```

No TypeScript or build break. Authenticated catalog unaffected.

### Diff-shape check (additive-only)

Pre-edit `wc -l supabase/seed.sql`: 4071
Post-edit `wc -l supabase/seed.sql`: 6758
Net delta: +2687 lines (exactly matches the commit's `1 file changed, 2687 insertions(+)` reported by git).

Zero deletions, zero modifications to prior sections — confirmed by the additive-only commit shape.

## Next Phase Readiness

- All 50 scenarios + 150 mappings are live in the local DB and replayable on demand. Plan 27-04 (verification harness) can read the seeded content directly to build its assertion suite.
- Anonymous RLS chain through all 4 catalog tables (functional_areas → scenarios → scenario_templates → automation_templates) returns the full dataset — Phase 29 (public catalog UI) can build read-side queries against this contract.
- Phase 30 (ROI calculator) has bilingual `pain_headline_*`, `impact_label_*`, and integer `typical_hours_per_week` for every scenario — the calculator can multiply hours × user-supplied hourly rate without any further data prep.
- Phase 28 (public landing) can consume `pain_headline_en/es` and `impact_label_en/es` directly for any landing-page scenario cards.
- **Open follow-up (for Plan 27-04 SUMMARY):** The DB-level CHECK constraint on `scenarios.typical_hours_per_week` is only `>= 0`. The integer-1-to-20 rule is seed-time only. Future hardening migration recommended (low priority — Patrick controls the draft, not customers, so production-write-path bypass is not a current risk).
- No blockers. Plan 27-04 is the last plan of Phase 27.

## Self-Check: PASSED

- FOUND: `supabase/seed.sql` (modified, 6758 lines, contains Section 14 banner at line 4049 and End-of-Section marker at line 6733)
- FOUND: commit `d8ac808` (Task 1)
- MISSING (expected): `.planning/phases/27-scenario-content-seed/_emit_seed.mjs` (transformer deleted post-emit per plan lifecycle)
- FOUND: `.planning/phases/27-scenario-content-seed/27-03-SUMMARY.md` (this file)

---

*Phase: 27-scenario-content-seed*
*Plan: 03*
*Completed: 2026-05-19*
