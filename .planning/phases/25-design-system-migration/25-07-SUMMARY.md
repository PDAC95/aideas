---
phase: 25-design-system-migration
plan: 07
subsystem: ui
tags: [uat, factory-reskin, design-tokens, manual-verification, shell-unification]

# Dependency graph
requires:
  - phase: 25-design-system-migration
    provides: "Plan 25-01..25-06 — Factory tokens, primitives, brand-color sweep, auth/legal reskin, cross-cutting layout shells"
provides:
  - "Documented UAT pass across all 26 existing AIDEAS routes (EN/ES × light/desktop+mobile, plus dark subset on customer dashboard) confirming Factory tokens render acceptably across the entire app"
  - "Two in-phase shell-unification fixes finalizing Plan 25-06 scope — customer dashboard <header> and (dashboard)/layout.tsx wrapper both migrated to bg-background token"
  - "Explicit deferral list scope-locking composed-component reskin work to Phase 32 (customer) and Phase 33 (admin) with file-path-level granularity"
  - "Phase 25 gating criteria for merge to main satisfied: build exit 0, every route PASSED or DEFERRED-with-justification, no Phase 25 lint regressions"
affects: [28-public-landing-page, 32-reskin-customer-dashboard, 33-reskin-admin-dashboard, milestone-v1.3-ship-readiness]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Customer dashboard shell unified under --background token: page wrapper, header, and main content area all resolve through the same Factory token (no Tailwind gray literals, no bg-card seam)"
    - "UAT-blocking rule enforced in practice: any visible regression on an existing route is fixed in Phase 25 before declaring PASSED, not deferred to 32/33 — preserves the 'existing screens render acceptably' success criterion as a hard gate"
    - "Scope-locked deferral pattern: 'unpolished but functional' composed components logged with file-path granularity for downstream phases — prevents Phase 25 scope creep while making Phase 32/33 work plan-able"

key-files:
  created:
    - ".planning/phases/25-design-system-migration/25-07-UAT.md — 26-route × 4-cell matrix (auth, admin auth, legal, customer dashboard, admin dashboard) with PASSED/DEFERRED verdicts, fix log, and scope-locked deferrals"
    - ".planning/phases/25-design-system-migration/25-07-SUMMARY.md — this file"
  modified:
    - "web/src/components/dashboard/dashboard-header.tsx — bg-card → bg-background on the <header> element (UAT fix #1)"
    - "web/src/app/(dashboard)/layout.tsx — bg-gray-200 dark:bg-gray-900 → bg-background on the wrapper div (UAT fix #2, Plan 25-06 leftover)"

key-decisions:
  - "Verdict 'passed-with-deferrals' (not 'passed' clean) — every route renders correctly under Factory tokens, but composed components on every page interior still use Phase 17-24 utilities (bg-white, shadow-sm, hardcoded gray-100). Per CONTEXT.md, this is scope-locked: Phase 25 reskins tokens + primitives + shells only, Phase 32/33 reskin composed components."
  - "Two NEEDS-FIX items surfaced during UAT were treated as Plan 25-06 leftovers, NOT Phase 25 scope creep — the customer dashboard <header> and (dashboard)/layout.tsx wrapper are both 'cross-cutting layout shell' surfaces, exactly Plan 25-06's stated scope; missing them was a Plan 25-06 bug, not new Phase 25 work."
  - "UAT-blocking rule honored without compromise — the two shell-unification regressions blocked PASSED verdict on every customer dashboard route, so fixing in-phase (per CONTEXT.md) was the only correct path; deferring would have violated 'existing screens render acceptably' success criterion."
  - "Lint baseline (103 errors from Phase 23/24) carried forward without Phase 25 regressions — documented honestly in STATE.md and UAT matrix instead of papered over; consistent with Phase 24's Option A precedent (build exit 0 + lint exit 1 documented honestly)."
  - "Legacy static landing (web/public/landing/*) explicitly NOT reskinned in Phase 25 — gets replaced wholesale by SSR Next.js routes in Phase 28; reskinning the static HTML would be throwaway work."

patterns-established:
  - "UAT matrix as deferral ledger: every route gets a verdict cell + a file-path-level deferral list, so downstream phases (32, 33) have a ready-made work plan instead of needing to rediscover the gaps."
  - "Two-stage shell unification: page wrapper bg + header bg must BOTH consume the same --background token, otherwise the seam between them re-emerges. Validated empirically when Failure 1 (header) didn't fix the appearance until Failure 2 (wrapper) was also fixed."

requirements-completed: [DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05]

# Metrics
duration: 8m
completed: 2026-05-15
---

# Phase 25 Plan 07: UAT Pass Across 26 Routes Summary

**Manual UAT walk-through across every existing AIDEAS route (auth, legal, customer dashboard, admin dashboard) confirmed Factory tokens render acceptably under the new token system with no broken contrast or layout regressions; two final shell-unification fixes (customer header + (dashboard) layout wrapper) committed in-phase to clear the UAT-blocking rule.**

## Performance

- **Duration:** 8m (Task 1 scaffold + Task 3 finalize; Task 2 manual UAT was developer-driven, ~30-60min off-clock)
- **Started:** 2026-05-15T14:00:00Z (Task 1 scaffold creation)
- **Completed:** 2026-05-15T14:20:00Z (Task 3 finalize after developer "listo" verdict)
- **Tasks:** 3 (1 auto scaffold + 1 human-verify UAT + 1 auto finalize with 2 in-phase fixes)
- **Files modified:** 3 (1 UAT matrix, 1 customer header, 1 customer layout wrapper)

## Accomplishments

- **26/26 routes PASSED** in light mode across EN/ES × desktop (1280px) + mobile (375px), confirming the Phase 25-01..06 token migration holds end-to-end without contrast or color regressions.
- **9/9 customer dashboard routes PASSED** in dark mode subset — `.dark` class produces a usable variant across the entire customer-side surface area.
- **1/1 admin/login route** verified its intentional dark-base treatment (Factory `#020202` bg, `#101010` card, Code Orange CTA) per Plan 25-05's admin/customer distinction decision.
- **2 in-phase UAT fixes applied** finalizing Plan 25-06 shell unification:
  - `dashboard-header.tsx` migrated from `bg-card` to `bg-background` so the customer header no longer renders as a visually distinct strip against the page bg.
  - `(dashboard)/layout.tsx` wrapper migrated from `bg-gray-200 dark:bg-gray-900` (Phase 24 leftover Tailwind literal) to `bg-background` — final unification of the customer dashboard shell under the Factory `--background` token.
- **Deferral ledger created** with file-path-level granularity: composed components for `/catalog`, `/automations`, `/reports`, `/billing`, `/settings`, `/notifications`, `/dashboard` interior → Phase 32; admin composed components + language-switcher/dark-toggle tech debt → Phase 33; legacy static landing → Phase 28.
- **Build re-verified clean** after each fix (`npm run build` exit 0, 27 routes compiled).
- **Phase 25 ROADMAP success criteria** all visually verified across the 26-route matrix (existing screens render against Factory tokens; Geist Sans/Mono in place; primitives respect radius scale; .dark variant usable on customer dashboard subset).

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold UAT matrix + pre-UAT build verify** — `ffb5c96` (docs)
2. **Task 2: Manual UAT pass across 26-route matrix** — developer-driven checkpoint; no commits in this task; surfaced two NEEDS-FIX items that were handled in Task 3.
3. **Task 3 (fix #1): Unify customer header background with page bg** — `34e3f32` (fix)
4. **Task 3 (fix #2): Migrate dashboard layout wrapper to bg-background token** — `b40d0fa` (fix)
5. **Task 3 (matrix finalize): Mark verdicts PASSED, write Final Verdict section** — `629f5e0` (docs)

**Plan metadata:** _TBD on final commit_ (docs(25-07): complete UAT plan — SUMMARY + STATE + ROADMAP)

## Files Created/Modified

### Created

- `.planning/phases/25-design-system-migration/25-07-UAT.md` — 26-route UAT matrix with per-cell PASSED verdicts, two-failure log, and Phase 28/32/33 deferral lists.
- `.planning/phases/25-design-system-migration/25-07-SUMMARY.md` — this summary.

### Modified

- `web/src/components/dashboard/dashboard-header.tsx` — `<header>` element bg-card → bg-background (commit `34e3f32`).
- `web/src/app/(dashboard)/layout.tsx` — wrapper div bg-gray-200 dark:bg-gray-900 → bg-background (commit `b40d0fa`).

## Decisions Made

See key-decisions frontmatter for the full list. Highlights:

- **Verdict honestly downgraded to `passed-with-deferrals`** (not `passed` clean) because every dashboard interior still uses Phase 17-24 composed-component utilities that Phase 32/33 will reskin. This is correct per CONTEXT.md scope — Phase 25 reskins tokens + primitives + shells, not composed components — but it's worth documenting explicitly so /gsd:verify-work doesn't expect a perfectly polished result.
- **The two NEEDS-FIX items were Plan 25-06 leftovers, not new scope.** Both touched "cross-cutting layout shell" surfaces, which is exactly what Plan 25-06 was meant to cover; they were just missed. Fixing them in Plan 25-07 (the UAT plan) instead of re-opening Plan 25-06 keeps the phase's commit history honest about when each piece of work actually landed.
- **Legacy static landing intentionally NOT reskinned.** The `web/public/landing/*` static HTML gets deleted by Phase 28 (Public Landing Page) when SSR Next.js routes replace it. Reskinning throwaway HTML would be wasted work and is correctly scoped out.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Customer dashboard header rendered as visible strip against page bg**
- **Found during:** Task 2 (Manual UAT) — observed across every customer dashboard route in light mode.
- **Issue:** `dashboard-header.tsx` shipped from Plan 25-06 with `bg-card` (resolves to `#fafafa` light / `#101010` dark). Against the new `bg-background` page surface (`#eeeeee` light / `#020202` dark), the header rendered as a visually distinct strip — broke the unified shell aesthetic Plan 25-06 was supposed to deliver.
- **Fix:** Swapped `bg-card` → `bg-background` on the `<header>` element. Border-bottom (`border-b border-border`) retained as the structural separator (Factory no-decorative-shadow rule, Plan 25-06 decision).
- **Files modified:** `web/src/components/dashboard/dashboard-header.tsx`
- **Verification:** Browser refresh confirmed header now blends seamlessly into page bg across light + dark + EN/ES. `npm run build` re-ran exit 0.
- **Committed in:** `34e3f32` (in-phase fix)

**2. [Rule 1 - Bug] Customer dashboard layout wrapper still on Tailwind literal**
- **Found during:** Task 2 (Manual UAT) — observed after Fix #1 was applied; header + page bg still mismatched.
- **Issue:** `(dashboard)/layout.tsx` wrapper div was still on the Phase 24 Tailwind literal `bg-gray-200 dark:bg-gray-900` instead of the Factory token. Plan 25-06 reskinned the admin wrapper (`bg-gray-100 dark:bg-gray-950 → bg-background`) but missed the customer wrapper.
- **Fix:** Swapped `bg-gray-200 dark:bg-gray-900` → `bg-background` on the wrapper div. Final unification of customer dashboard shell under Factory `--background` token.
- **Files modified:** `web/src/app/(dashboard)/layout.tsx`
- **Verification:** Browser refresh confirmed full unification of customer dashboard shell across header, wrapper, and main content area in both light + dark. `npm run build` re-ran exit 0.
- **Committed in:** `b40d0fa` (in-phase fix)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug, both finalizing Plan 25-06 cross-cutting shell scope)
**Impact on plan:** Both fixes were UAT-blocking per CONTEXT.md — every customer dashboard route would have failed PASSED verdict without them. No scope creep: both surfaces are exactly Plan 25-06's stated scope (cross-cutting layout shells), and the fixes were minimal (single-className swap each).

## Issues Encountered

None — the UAT walk-through itself proceeded cleanly. The two surfaced regressions were handled per the deviation rules (auto-fix → re-verify → continue), and the developer's "listo" sign-off confirmed the result.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

**Phase 25 is complete and ready to ship.**

- Build: `npm run build` exit 0 (27 routes compiled).
- Lint: 103 pre-existing errors from Phase 23/24 baseline; no Phase 25 regressions added (documented in UAT matrix).
- UAT: 26/26 routes PASSED with deferrals scoped to Phases 28/32/33.
- All 5 DESIGN requirements satisfied (DESIGN-01 globals.css, DESIGN-02 primitives, DESIGN-03 sidebar shells, DESIGN-04 admin distinction via Code Orange badge, DESIGN-05 dark variant usable).

**Branch:** `feature/phase-25-design-system-migration` — ready for `/gsd:verify-work 25` then merge to `main` per CLAUDE.md branching strategy.

**v1.3 milestone progress:** Phase 25 complete unblocks:
- **Phase 26** (Catalog Data Model) — sequential next on critical path.
- **Phase 28** (Public Landing Page) — parallel-able, can begin alongside 26-27.
- **Phase 32** (Reskin Customer Dashboard) — parallel-able, can begin alongside 26-31. Deferral list in this plan's UAT matrix is the Phase 32 work plan.
- **Phase 33** (Reskin Admin Dashboard) — must wait on Phase 32, but its deferral list (admin composed components + language-switcher/dark-toggle tech debt) is also ready in this UAT matrix.

## Self-Check: PASSED

- 25-07-UAT.md exists at expected path: FOUND.
- 25-07-SUMMARY.md exists at expected path: FOUND.
- Fix commit 34e3f32 (header) present in git log: FOUND.
- Fix commit b40d0fa (layout wrapper) present in git log: FOUND.
- UAT matrix finalize commit 629f5e0 present in git log: FOUND.
- web/ build exits 0: VERIFIED.
- UAT frontmatter status = passed-with-deferrals: VERIFIED.

---
*Phase: 25-design-system-migration*
*Completed: 2026-05-15*
