---
phase: 15-dashboard-home-polish
plan: 02
subsystem: docs
tags: [summary-frontmatter, requirement-traceability, audit-fix, gap-closure, phase-8-backfill]

# Dependency graph
requires:
  - phase: 08-dashboard-home-notifications
    provides: 4 SUMMARY files (08-01, 08-02, 08-04, 08-05) with established YAML frontmatter styles
  - phase: 13-catalog-coverage-fix
    provides: kebab-case requirements-completed pattern (`requirements-completed: [...]`) used by minimal-frontmatter SUMMARY style
  - phase: 14-i18n-security-hygiene
    provides: confirmation that kebab-case requirements-completed is the newer repo standard for SUMMARY frontmatter
provides:
  - 4 Phase 8 SUMMARY files with explicit requirement-ID traceability in frontmatter (audit-readable)
  - per-file YAML key-style consistency preserved (snake_case for 08-01/02/05; kebab-case for 08-04)
  - closure of v1.1 milestone audit tech-debt item: "SUMMARY frontmatter missing requirement-ID traceability"
affects: [v1.1-milestone-audit, audit-tooling, future-summary-frontmatter-consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SUMMARY frontmatter requirement-ID backfill: match each file's existing YAML key style (snake_case vs kebab-case) — do NOT standardize across files"
    - "Insertion location: just before metrics: top-level field (or before closing --- if no metrics:); never inside nested structures"
    - "Inline-array YAML syntax for requirement IDs: [HOME-02, HOME-03, ...] — IDs are valid bare YAML scalars, no quoting needed"

key-files:
  created:
    - .planning/phases/15-dashboard-home-polish/15-02-SUMMARY.md
  modified:
    - .planning/phases/08-dashboard-home-notifications/08-01-SUMMARY.md
    - .planning/phases/08-dashboard-home-notifications/08-02-SUMMARY.md
    - .planning/phases/08-dashboard-home-notifications/08-04-SUMMARY.md
    - .planning/phases/08-dashboard-home-notifications/08-05-SUMMARY.md

key-decisions:
  - "Match each file's existing YAML key style: 08-01/02/05 keep snake_case (existing convention via dependency_graph, tech_stack, key_files); 08-04 uses kebab-case (matches Phase 13/14 minimal-frontmatter standard)"
  - "Insert requirements_completed/requirements-completed line immediately before metrics: (or before closing --- where metrics: absent) — groups with top-level frontmatter fields, never inside nested objects"
  - "Inline-array syntax with bare-scalar requirement IDs (no quotes) — valid YAML, matches Phase 13/14 reference style"
  - "Do NOT extend backfill to 08-03 — out of audit scope; 08-03 already had requirements-completed from its original 2026-04-10 ship commit (verified via git log)"
  - "Body content is invariant — only frontmatter receives a single +1 line per file"

patterns-established:
  - "Pattern: gap-closure plans for documentation tech debt are minimal-edit, single-line additions per file — never reformat existing fields"
  - "Pattern: per-file YAML style preservation when backfilling — heterogeneous frontmatter styles across siblings are intentional, not normalized in passing"

requirements-completed: [HOME-01, HOME-02, HOME-04, I18N-01]

# Metrics
duration: 4 min
completed: 2026-04-30
---

# Phase 15 Plan 02: Phase 8 SUMMARY Frontmatter Backfill Summary

**Single-line `requirements_completed` / `requirements-completed` YAML field added to 4 Phase 8 SUMMARY files (08-01, 08-02, 08-04, 08-05) — each matching its file's existing key style — closing v1.1 milestone audit tech-debt for explicit requirement-ID traceability.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-30T20:28:37Z
- **Completed:** 2026-04-30T20:32:41Z
- **Tasks:** 2
- **Files modified:** 4 SUMMARY files

## Accomplishments

- 08-01-SUMMARY.md frontmatter now declares `requirements_completed: [HOME-02, HOME-03, HOME-04, NOTF-01, I18N-01]` (snake_case)
- 08-02-SUMMARY.md frontmatter now declares `requirements_completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, I18N-01]` (snake_case)
- 08-04-SUMMARY.md frontmatter now declares `requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01]` (kebab-case, matching Phase 13/14 minimal-frontmatter standard)
- 08-05-SUMMARY.md frontmatter now declares `requirements_completed: [HOME-05, NOTF-02, I18N-01]` (snake_case)
- Per-file YAML key style preserved (no normalization across files — locked decision)
- 08-03-SUMMARY.md NOT modified (out of audit scope; already had `requirements-completed` from original 2026-04-10 ship commit `3e89f9b`)
- Body content of all 4 modified files unchanged — verified via `git diff --stat` showing only +1 insertion per file, 0 deletions
- Closes v1.1 milestone audit tech-debt: "Phase 8 SUMMARY frontmatter missing requirement-ID traceability"

## Task Commits

Each task was committed atomically:

1. **Task 1: Backfill 08-01 and 08-02 (snake_case)** — `93a51a0` (docs) — content correct; commit message contaminated by parallel Plan 15-01 agent (see Issues Encountered)
2. **Task 2: Backfill 08-04 (kebab-case) and 08-05 (snake_case)** — `b318212` (docs)

**Plan metadata:** _(committed by next gsd-tools step)_

## Files Created/Modified

### `.planning/phases/08-dashboard-home-notifications/08-01-SUMMARY.md` (commit `93a51a0`)

```diff
   - daily_execution_count mutated onto automation objects after initial fetch to avoid extra round-trips
+requirements_completed: [HOME-02, HOME-03, HOME-04, NOTF-01, I18N-01]
 metrics:
```

### `.planning/phases/08-dashboard-home-notifications/08-02-SUMMARY.md` (commit `93a51a0`)

```diff
   - Template substitution for i18n count strings — getTranslations returns formatted strings (e.g., "5m ago"), so extract template by formatting with sentinel "99" then replacing with "{count}" for runtime substitution
+requirements_completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, I18N-01]
 metrics:
```

### `.planning/phases/08-dashboard-home-notifications/08-04-SUMMARY.md` (commit `b318212`)

```diff
 started: 2026-04-10
 completed: 2026-04-10
+requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01]
 ---
```

### `.planning/phases/08-dashboard-home-notifications/08-05-SUMMARY.md` (commit `b318212`)

```diff
   - "Short label for mobile CTA is 'New'/'Nueva' rather than '+' alone — more accessible and descriptive"
+requirements_completed: [HOME-05, NOTF-02, I18N-01]
 metrics:
```

### Files NOT touched (intentionally, per locked decision)

- `08-03-SUMMARY.md` — out of audit scope (audit named exactly four plans: 01, 02, 04, 05). 08-03 already has `requirements-completed: [NOTF-01, NOTF-02, NOTF-03]` from its original ship commit `3e89f9b` (2026-04-10).
- All body content of the 4 modified files — only frontmatter received the single-line addition.

## Decisions Made

See `key-decisions` in frontmatter. Headlines:

- **Per-file YAML style preservation** — 08-01/02/05 use snake_case to match their existing `dependency_graph` / `tech_stack` / `key_files` keys; 08-04 uses kebab-case to match its minimal-frontmatter style and the newer Phase 13/14 repo standard. Heterogeneous styles across siblings are intentional and locked by the planner.
- **Insertion location** — top-level field placement (before `metrics:` or before closing `---` if absent), never nested. This makes the field discoverable by audit tooling that reads frontmatter only.
- **Inline-array YAML syntax** — `[HOME-02, HOME-03, ...]` with bare scalars; no quotes. Matches Phase 13/14 SUMMARY reference style.
- **08-03 explicitly excluded** — audit specified exactly four plans; 08-03 already had requirement-ID traceability from its original ship.

## Deviations from Plan

None functional — plan executed exactly as written. The single point worth noting:

**1. [Note - Workflow] Concurrent commit-message contamination on commit `93a51a0` (Task 1)**

- **Found during:** Task 1 commit step
- **Issue:** A parallel agent activity in the same working directory (Plan 15-01 executor) absorbed Task 1's staged 08-01 + 08-02 frontmatter edits into commit `93a51a0`, whose message reads `refactor(15-01): remove kpiTrends placeholder and TrendIndicator from KpiCards`. The 08-01/08-02 frontmatter additions appear cleanly in that commit's diff (verified via `git show 93a51a0 --stat` and `git show 93a51a0 -- <files>`), but the commit message does not reference Plan 15-02. My intended Task 1 commit message — `docs(15-02): backfill requirements_completed in 08-01 and 08-02 SUMMARY frontmatter` — was rejected with "no changes added to commit" because the changes had already landed under the wrong message.
- **Impact:** Cosmetic only. Both Task 1 frontmatter additions ARE on `main`, in the correct files, with correct content (verified via `grep -n "requirements_completed:"` returning the expected values at lines 34 and 35 respectively). No code-correctness impact; only the commit-message-to-content mapping is misleading for future archaeology by phase tag.
- **Fix:** Not amending per project commit discipline (which prefers new commits over `--amend`). This is the same pattern documented in `14-02-SUMMARY.md` (commit `99900e7`) — second occurrence of cross-agent contamination during parallel execution.
- **Files affected:** None (just commit metadata). The Task 1 frontmatter content is correct.

No deviation rules (1, 2, 3, 4) triggered — plan implementation proceeded as written. All 4 frontmatter additions match the locked-decision arrays verbatim.

---

**Total deviations:** 0 functional. 1 cosmetic commit-message anomaly (Task 1) caused by parallel agent activity outside this plan's control.
**Impact on plan:** None on functionality. Plan delivered exactly as specified — 4 files modified, 4 single-line additions, body untouched, 08-03 untouched.

## Issues Encountered

**1. Commit-message contamination from concurrent Plan 15-01 agent (Task 1)** — see Deviations above. My `git add 08-01-SUMMARY.md 08-02-SUMMARY.md` succeeded; my `git commit -m "docs(15-02): ..."` failed with "no changes added to commit" because Plan 15-01's parallel commit `93a51a0` had already absorbed those exact frontmatter additions into its diff. Verified the additions ARE in the tree at HEAD via grep + git show, then proceeded to Task 2.

**2. gray-matter not at the planned path** — verification command in Task 1 referenced `C:/Users/patri/.claude/get-shit-done/node_modules/gray-matter`, which was not present. Used the documented fallback (grep + Read tool inspection of frontmatter) plus a custom regex-based YAML parse via Node `fs` to confirm the requirements arrays parse correctly. Both verification methods passed.

## User Setup Required

None — no external service configuration required. Pure documentation backfill in the `.planning/` tree.

## Next Phase Readiness

- ✅ Phase 15 Plan 02 complete — closes v1.1 milestone audit tech-debt for Phase 8 SUMMARY frontmatter traceability gap.
- Phase 15 has remaining plans (Plan 01 was in parallel progress at start of this plan; check `roadmap update-plan-progress` output for current Phase 15 plan-completion count).
- Audit tooling can now scan all Phase 8 SUMMARY frontmatter for requirement-ID coverage without spelunking body text.
- No new blockers introduced. Heterogeneous YAML key styles (`requirements_completed` vs `requirements-completed`) across the v1.1 SUMMARY corpus are documented as intentional — audit tooling should accept both spellings.

## Self-Check

Verifying claims against disk + git:

- `.planning/phases/08-dashboard-home-notifications/08-01-SUMMARY.md` — FOUND with `requirements_completed: [HOME-02, HOME-03, HOME-04, NOTF-01, I18N-01]` at line 34
- `.planning/phases/08-dashboard-home-notifications/08-02-SUMMARY.md` — FOUND with `requirements_completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, I18N-01]` at line 35
- `.planning/phases/08-dashboard-home-notifications/08-04-SUMMARY.md` — FOUND with `requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, NOTF-01, NOTF-02, NOTF-03, I18N-01]` at line 7
- `.planning/phases/08-dashboard-home-notifications/08-05-SUMMARY.md` — FOUND with `requirements_completed: [HOME-05, NOTF-02, I18N-01]` at line 24
- `.planning/phases/08-dashboard-home-notifications/08-03-SUMMARY.md` — UNCHANGED (already had `requirements-completed: [NOTF-01, NOTF-02, NOTF-03]` from commit `3e89f9b`)
- Commit `93a51a0` — FOUND in git log (Task 1 content; misnamed message — see Deviations)
- Commit `b318212` — FOUND in git log (Task 2)
- `git diff --stat 93a51a0~1..b318212` confirms 4 files changed, 4 insertions (+), 0 deletions across the 4 target files

## Self-Check: PASSED

---
*Phase: 15-dashboard-home-polish*
*Completed: 2026-04-30*
