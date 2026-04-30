# Phase 13 — Deferred Items

## DEFERRED-1: Pre-existing lint debt (104 errors, 1584 warnings) on baseline

**Discovered during:** Plan 13-01 Task 1 verification (`npm run lint`)
**Scope:** OUT OF SCOPE for Phase 13 — none of these errors are in any file modified by this plan

**Verified:** Ran `git stash` to remove plan changes, re-ran `npm run lint` on clean baseline. Same 104 errors and 1584 warnings present. Confirmed 0 errors / 0 warnings introduced by Plan 13-01 edits.

**Errors are concentrated in:**

- `web/src/components/auth/login-form.tsx` — `react-hooks/purity` (`Date.now()` in event handler)
- `web/src/components/auth/reset-password-form.tsx` — `react-hooks/incompatible-library` (`watch()` from RHF)
- `web/src/components/auth/signup-form.tsx` — same RHF `watch()` issue + unused-var warning
- `web/src/lib/dashboard/queries.ts` — 4 `@typescript-eslint/no-explicit-any` errors + 1 `prefer-const` error
- 1583 other warnings spread across the codebase (mostly `react-hooks/incompatible-library` for RHF `watch()`)

**Why deferred:**

- Per GSD execution scope boundary, Phase 13 only touches 4 files (en.json, es.json, catalog-client.tsx, catalog/page.tsx)
- All four touched files pass lint cleanly (verified via filtered grep)
- Fixing 104 errors in unrelated files would require a dedicated tech-debt phase

**Recommendation:**

- Schedule a dedicated tech-debt phase (e.g., Phase 16) to address baseline lint hygiene before v1.2
- Top priority: replace `any` types in `queries.ts` (5 errors total, blocks strict-mode confidence)
- Medium priority: investigate React Compiler purity rules vs `Date.now()` in event handlers (auth flows)
- Low priority: 1584 RHF `watch()` warnings are advisory — React Compiler skips memoization but functionality unaffected

**Build status:** `npm run build` passes cleanly (TypeScript types valid, all 19 routes compile, 4.8s compile time).
