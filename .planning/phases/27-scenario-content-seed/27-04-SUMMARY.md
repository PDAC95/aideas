---
phase: 27-scenario-content-seed
plan: 04
subsystem: docs

tags: [roadmap, requirements, verification, phase-close, idempotent-seed, anon-rls, bilingual]

# Dependency graph
requires:
  - phase: 27-scenario-content-seed
    provides: "Plan 27-01 — 8 functional_areas seeded with stable slug join keys"
  - phase: 27-scenario-content-seed
    provides: "Plan 27-02 — locked 27-SCENARIO-DRAFT.md (50 bilingual scenarios + 150 DB-validated mappings)"
  - phase: 27-scenario-content-seed
    provides: "Plan 27-03 — 50 scenarios + 150 scenario_templates rows live in supabase/seed.sql via idempotent ON CONFLICT block"
provides:
  - "ROADMAP.md Phase 27 Goal + Success Criterion #1 + summary bullet corrected from '7 functional areas' to '8 functional areas' (now matches CAT-01 authoritative list)"
  - "REQUIREMENTS.md SCEN-01 wording synced to '8 functional areas' (now matches CAT-01)"
  - "End-to-end phase verification evidence — 8 areas, 50 scenarios, 150 mappings, 0 orphans, full bilingual coverage, integer hours 1-20, anon RLS chain returns full dataset"
  - "Known constraint gap surfaced for future hardening: scenarios.typical_hours_per_week DB CHECK is only '>= 0', the integer-1-to-20 rule is seed-time-only"
affects: [28-public-landing, 29-public-catalog, 30-roi-calculator, future-admin-CRUD-for-scenarios]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Phase-close doc-sync pattern: roadmap/requirements wording drift (placeholders like '7 areas') discovered during planning gets corrected IN-PHASE, not punted as follow-up — keeps the success-criteria contract consistent with reality at phase-close time"
    - "End-of-phase verification harness pattern: re-run db reset → SELECT anon-visible counts at every layer of the RLS chain (areas → scenarios → pivot) → confirm web/ build still green → capture all evidence in SUMMARY for verifier consumption"
    - "Constraint-gap documentation pattern: when seed-time validation enforces stricter rules than the underlying schema CHECK, surface the gap explicitly in the closing SUMMARY with a recommended ALTER TABLE for the next phase that opens an in-app write path"

key-files:
  created: []
  modified:
    - ".planning/ROADMAP.md (Phase 27 Goal + Success Criterion #1 + summary bullet: 7→8 functional areas; 27-03-PLAN row marked complete)"
    - ".planning/REQUIREMENTS.md (SCEN-01: 7→8 functional areas)"

key-decisions:
  - "Edit 4 in the plan (Plans block: 'TBD' → '4 plans' + bullet list) was a no-op because prior phase work had already populated the Plans section with the full 4-plan list — verified via Read, no Edit applied"
  - "Marked 27-03-PLAN.md as [x] complete in the ROADMAP Plans list since the underlying summary already shipped — keeps the in-line checkbox state coherent with the Progress Table row"
  - "Phase 27 Progress Table row is currently '3/4 | In Progress' (not '0/4 | Not started' as the planner's stale snapshot expected). Prior plans advanced the counter via gsd-tools state update-progress. The final state/roadmap CLI calls at plan close will flip this to 4/4 + Complete + dated."
  - "Constraint-gap deferred to a future admin-CRUD phase rather than added to Phase 27 — schema CHECK migration is out of Phase 27 scope (content + seed mechanics only per CONTEXT.md line 11), and not urgent because customers never write to scenarios.typical_hours_per_week (Patrick controls the draft)"

patterns-established:
  - "End-of-phase verification SQL block (V1-V7) reusable for future content-seed phases: count active rows per layer + per-parent distribution + bilingual-completeness FILTER aggregation + integer-range CHECK simulation + anon-role SET/RESET wrapping the whole RLS chain join"
  - "Doc-sync-at-phase-close pattern: any time CONTEXT.md surfaces a roadmap-wording drift (like '7 areas'), the closing plan of that phase corrects it inline with REQUIREMENTS sync — the verifier then validates the wording matches reality"

requirements-completed: [SCEN-01, SCEN-02, SCEN-03, SCEN-04]

# Metrics
duration: ~10min
completed: 2026-05-19
---

# Phase 27 Plan 04: Roadmap/Requirements Sync + Phase Verification Summary

**ROADMAP.md + REQUIREMENTS.md corrected from '7 functional areas' to '8' (matching CAT-01); end-to-end phase verification confirms 8 areas, 50 scenarios, 150 mappings, 0 orphans, full bilingual coverage, integer hours 1-20, and the anon RLS chain returns the full dataset — web build still exits 0; Phase 27 ready for /gsd:verify-work and /gsd:complete-phase.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-19T14:56:43Z
- **Completed:** 2026-05-19T15:06:00Z (approximate; SUMMARY write time)
- **Tasks:** 2 (1 doc-edit, 1 verification + REQUIREMENTS sync)
- **Files modified:** 2 (.planning/ROADMAP.md, .planning/REQUIREMENTS.md)

## Accomplishments

- ROADMAP.md Phase 27 summary bullet, Goal, and Success Criterion #1 all now read "8 functional areas" (was "7"); 27-03-PLAN row also flipped to `[x]` complete to keep the bullet list state coherent with the Progress Table
- REQUIREMENTS.md SCEN-01 wording synced to "8 functional areas" — matches CAT-01 authoritative list
- End-to-end phase verification (V1-V7) all passed: 8 areas with correct slugs, 50 scenarios, 150 mappings, 0 orphan scenarios, exact CONTEXT.md per-area distribution (10/10/8/6/6/4/3/3), zero missing bilingual fields, zero bad-hours, anon role sees the full dataset through the 4-table RLS chain
- `web/` build still exits 0 — no regression for the authenticated dashboard from Phase 27 content seed
- Known constraint gap documented for future hardening — schema CHECK is `>= 0`, seed-time rule is integer 1-20

## Task Commits

Each task was committed atomically:

1. **Task 1: Correct ROADMAP.md 7-to-8 areas + populate Plans section** — `80e0855` (docs)
2. **Task 2: Sync REQUIREMENTS.md SCEN-01 + run end-to-end phase verification** — `ba3cb56` (docs)

**Plan metadata commit:** (created at end of plan with SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `.planning/ROADMAP.md` — Three "7 functional areas" → "8 functional areas" corrections (summary bullet line ~68, Goal line ~112, Success Criterion #1 line ~116); 27-03-PLAN row marked `[x] (completed 2026-05-19)`. Edit 4 (Plans block "TBD" → 4-plan list) was a no-op because prior phase work had already populated this section.
- `.planning/REQUIREMENTS.md` — SCEN-01 wording corrected to "8 functional areas" (was "7").

## Diff Snippets

### ROADMAP.md (3 changes + 1 checkbox)

```diff
- - [ ] **Phase 27: Scenario Content Seed** — Seed 50 client-language scenarios mapped to ~135 n8n templates across 7 functional areas with EN/ES pain copy and typical-impact estimates
+ - [ ] **Phase 27: Scenario Content Seed** — Seed 50 client-language scenarios mapped to ~135 n8n templates across 8 functional areas with EN/ES pain copy and typical-impact estimates

- **Goal**: Populate the new schema with 50 client-language scenarios across 7 functional areas, mapped to ~135 n8n templates, ready for the public funnel to consume.
+ **Goal**: Populate the new schema with 50 client-language scenarios across 8 functional areas, mapped to ~135 n8n templates, ready for the public funnel to consume.

-   1. Querying `scenarios` returns 50 rows distributed across 7 functional areas, each with EN/ES pain copy.
+   1. Querying `scenarios` returns 50 rows distributed across 8 functional areas, each with EN/ES pain copy.

- - [ ] 27-03-PLAN.md — Transform approved draft into idempotent scenarios + scenario_templates seed migration
+ - [x] 27-03-PLAN.md — Transform approved draft into idempotent scenarios + scenario_templates seed (completed 2026-05-19)
```

### REQUIREMENTS.md (1 change)

```diff
- - [x] **SCEN-01**: Seed 50 client-language scenarios across 7 functional areas with EN/ES pain copy
+ - [x] **SCEN-01**: Seed 50 client-language scenarios across 8 functional areas with EN/ES pain copy
```

## Decisions Made

- **Edit 4 (Plans block) was a no-op** — the planner's snapshot assumed `**Plans**: TBD`, but prior phase work (27-01 / 27-02 / 27-03 SUMMARY commits via `roadmap update-plan-progress`) had already populated the section with the full 4-plan checklist. Read confirmed current state; no Edit applied. Correctness: the bullet list is present and accurate.
- **Marked 27-03 as [x] in the ROADMAP Plans bullet list** — since 27-03 shipped on 2026-05-19 with `d8ac808` (feat) + `8ba1b40` (docs), leaving the checkbox empty would have created a drift between the Plans bullet list and the Progress Table (which shows 3/4 complete). Phase 27 Plan 04 itself flips to [x] via /gsd:complete-phase after this plan's metadata commit lands.
- **Phase 27 Progress Table row is `3/4 | In Progress`, not `0/4 | Not started`** — the planner's stale snapshot expected the latter, but prior plans advanced the counter via `gsd-tools state update-progress`. The plan's verification grep would have failed against the stale expectation; I verified actual state via Read instead. The final `state advance-plan` + `roadmap update-plan-progress` calls at plan close will move this to 4/4 + the eventual `/gsd:complete-phase` will set status to Complete + date.
- **Constraint-gap deferred to a future admin-CRUD phase** — Phase 27 is content + seed mechanics only (CONTEXT.md line 11). A schema CHECK migration on `typical_hours_per_week` would be out of scope and not urgent: Patrick controls the draft, customers never write to this column, and the seed-time validator + transformer enforce the integer 1-20 rule on every replay. The future admin-CRUD-for-scenarios phase is the natural home for that ALTER TABLE.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plans-block Edit could not match a "TBD" anchor because prior phase work had already populated the section**

- **Found during:** Task 1
- **Issue:** Plan instructed `Find: '**Plans**: TBD' (under Phase 27) → Replace with: '**Plans**: 4 plans' + bullet list of 27-01..27-04`. Read confirmed Phase 27 already had `**Plans**: 4 plans` with all four bullets present (populated incrementally by 27-01/27-02/27-03 `roadmap update-plan-progress` calls). Applying the Edit as written would fail with "string not found".
- **Fix:** Verified current state via Read (lines 120-124 of ROADMAP.md). No Edit applied for that anchor. Instead, flipped the 27-03 bullet's checkbox from `[ ]` to `[x]` to reflect the just-shipped state and keep the bullet list in sync with the Progress Table row (which already read `3/4 | In Progress`).
- **Files modified:** `.planning/ROADMAP.md` (1 additional `[ ]` → `[x]` swap on the 27-03 bullet)
- **Verification:** `grep -c "27-04-PLAN.md" .planning/ROADMAP.md` = 1 (the bullet is present); `grep -c "8 functional areas" .planning/ROADMAP.md` = 5 (≥3 required); `grep -c "across 7 functional areas" .planning/ROADMAP.md` = 0
- **Committed in:** `80e0855` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking, doc-sync drift between planner snapshot and current ROADMAP state)
**Impact on plan:** Minor — the deviation was an artifact of the planner snapshot lagging behind incremental ROADMAP updates made by 27-01/02/03 plan-close runs. No scope creep, no content change, doc remains consistent. The 27-03-checkbox fix actually improved cohesion (Plans list now matches Progress Table).

## Issues Encountered

**Phase 27 Progress Table row expected vs actual state mismatch** — Plan 27-04 stated the row should currently read `| 27. Scenario Content Seed | 0/4 | Not started | - |` per the planner's snapshot. Actual state at execution time: `| 27. Scenario Content Seed | 3/4 | In Progress|  |`. This is correct — prior plan-close runs incrementally advanced the counter. No fix needed; final state-CLI calls at this plan's close will reach 4/4. Documented here for trace clarity.

## Verification Evidence

### Task 1 — ROADMAP.md grep verification

```
$ grep -c "8 functional areas" .planning/ROADMAP.md
5
$ grep -c "across 7 functional areas" .planning/ROADMAP.md
0
$ grep -c "27-04-PLAN.md" .planning/ROADMAP.md
1
```

5 occurrences of "8 functional areas" (≥3 required); zero "across 7 functional areas" remain; 27-04-PLAN.md appears in the Plans bullet list. PASS.

### Task 2, Step 1 — REQUIREMENTS.md grep verification

```
$ grep -c "across 8 functional areas" .planning/REQUIREMENTS.md
1
$ grep -c "across 7 functional areas" .planning/REQUIREMENTS.md
0
```

SCEN-01 line now reads "across 8 functional areas". PASS.

### Task 2, Step 2 — `npx supabase db reset --local` (clean baseline)

Last 8 lines:

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

Exit 0; no SQL errors during seed.sql application.

### Task 2, Step 3 — End-to-end phase verification (V1-V7)

All queries executed via `docker exec -i supabase_db_12ai psql -U postgres -d postgres < _verify_27_04.sql` (temp file deleted after use).

**V1 — 8 functional areas, correct slugs:**

```
 active_areas
--------------
            8

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

PASS — 8 active areas with all 8 expected slugs in CONTEXT.md canonical order.

**V2 — 50 active scenarios:**

```
 active_scenarios
------------------
               50
```

PASS.

**V3 — 150 mappings, 0 orphan scenarios:**

```
 total_mappings
----------------
            150

 orphan_scenarios
------------------
                0
```

150 mappings (well inside the 100-160 target); zero scenarios without mappings. PASS.

**V4 — Per-area distribution matches CONTEXT.md weights:**

```
          slug           | scenarios
-------------------------+-----------
 ventas                  |        10
 marketing               |        10
 atencion-al-cliente     |         8
 documentos              |         6
 productividad           |         6
 reportes                |         4
 agentes-ia              |         3
 integraciones-seguridad |         3
```

8 areas, sum = 10+10+8+6+6+4+3+3 = 50 (matches V2); floor of 3 per area honored; distribution hits CONTEXT.md targets exactly with zero deviation. PASS.

**V5 — Bilingual completeness (zero missing fields):**

```
 missing_en | missing_es | missing_body_en | missing_body_es | missing_impact_en | missing_impact_es
------------+------------+-----------------+-----------------+-------------------+-------------------
          0 |          0 |               0 |               0 |                 0 |                 0
```

All 50 scenarios have non-null/non-empty EN+ES headlines, bodies, and impact labels. PASS.

**V6 — Hours estimates are integers in [1, 20]:**

```
 bad_hours
-----------
         0
```

Every scenario's `typical_hours_per_week` is a whole integer in [1, 20]. PASS.

**V7 — Anon RLS chain end-to-end:**

```
SET
 visible_areas | visible_scenarios | visible_mappings
---------------+-------------------+------------------
             8 |                50 |              150
RESET
```

Anon role joining functional_areas → scenarios → scenario_templates sees all 8 areas, 50 scenarios, 150 mappings — matches V1+V2+V3 exactly. RLS chain open end-to-end for anonymous public-funnel consumers. PASS.

### Task 2, Step 4 — `web/ npm run build` sanity check

```
✓ Compiled successfully in 5.5s
```

Exit 0. Authenticated catalog UIs (which query `automation_templates` only) continue to build cleanly — no regression introduced by Phase 27 content.

## Known Constraint Gap (Future Hardening)

**`scenarios.typical_hours_per_week` schema CHECK is incomplete.**

The Phase 26 schema declared `typical_hours_per_week DOUBLE PRECISION` with only a `>= 0` CHECK constraint. CONTEXT.md mandates whole integers in `[1, 20]`, but that rule is currently enforced ONLY at seed time:

- Plan 27-02 validator (now-deleted Node script) verified all 50 draft scenarios pass the integer-1-to-20 rule before checkpoint.
- Plan 27-03 transformer (now-deleted Node script) re-validated on the way to SQL emission.
- Plan 27-04 verification query V6 confirms zero bad-hours in the live DB after `db reset`.

The DB itself would accept a fractional or out-of-range value if anything other than the seed writes to this column.

**Recommended future migration** (in the next phase that opens an in-app write path — likely the admin-CRUD-for-scenarios phase):

```sql
ALTER TABLE public.scenarios
  ADD CONSTRAINT scenarios_typical_hours_whole_int_1_to_20
  CHECK (typical_hours_per_week IS NULL OR
         (typical_hours_per_week BETWEEN 1 AND 20 AND
          typical_hours_per_week = floor(typical_hours_per_week)));
```

**Why deferred from Phase 27:**
- Out of scope: Phase 27 is content + seed mechanics only (CONTEXT.md line 11). Schema changes belong in dedicated schema phases or the phase that opens the write path.
- Low urgency: Patrick controls the draft (the only current write source); customers never write to this column directly; the seed-time validator + transformer enforce the rule on every replay.
- Migration complexity: a future ALTER TABLE could either swap the column type to INTEGER (data-loss-free since all values are already whole ints) or add the CHECK with `NOT VALID` + a separate `VALIDATE CONSTRAINT` on existing data. Decision belongs to the phase that ships the write path.

Tracked in this SUMMARY (not as a STATE.md blocker) since it does not block any current functionality.

## Next Phase Readiness

- Phase 27 is fully shipped: all 4 plans complete, SCEN-01..04 physically realized, ROADMAP + REQUIREMENTS doc-consistent.
- Ready for `/gsd:verify-work 27` (verifier should run the same V1-V7 query set + grep the doc corrections + re-run web/ build).
- After verifier passes: `/gsd:complete-phase 27` to flip ROADMAP Progress Table row 27 to `4/4 | Complete | 2026-05-19`, the Phases section checkbox to `[x]`, and mark SCEN-01..04 as Complete in REQUIREMENTS.md traceability (already marked [x] there from the 27-03 plan-close run).
- Next phase: Phase 28 (Public Landing Page) — consumes nothing from Phase 27 directly (it's the marketing surface, not the catalog), but Phase 29 (Public Catalog) will consume the full 8-areas + 50-scenarios + 150-mappings dataset.
- No blockers. One follow-up item recorded in this SUMMARY: future ALTER TABLE on `scenarios.typical_hours_per_week` (recommended at the admin-CRUD-for-scenarios phase).

## Self-Check: PASSED

- FOUND: `.planning/ROADMAP.md` (modified — 4 line edits committed in `80e0855`)
- FOUND: `.planning/REQUIREMENTS.md` (modified — 1 line edit committed in `ba3cb56`)
- FOUND: `.planning/phases/27-scenario-content-seed/27-04-SUMMARY.md` (this file)
- FOUND: commit `80e0855` (Task 1)
- FOUND: commit `ba3cb56` (Task 2)
- MISSING (expected): `.planning/phases/27-scenario-content-seed/_verify_27_04.sql` (verification helper deleted post-PASS per plan ephemeral-script lifecycle)

---

*Phase: 27-scenario-content-seed*
*Plan: 04*
*Completed: 2026-05-19*
