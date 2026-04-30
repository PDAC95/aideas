---
phase: 14-i18n-security-hygiene
plan: 02
subsystem: ui
tags: [i18n, next-intl, dashboard, notifications, automations, time-formatting]

# Dependency graph
requires:
  - phase: 08-dashboard-home-notifications
    provides: NotificationBell component with formatRelativeTime
  - phase: 09-my-automations
    provides: automation detail page with buildTimeAgo helper
  - phase: 12-settings
    provides: locale-switching infrastructure (NEXT_LOCALE cookie)
provides:
  - shared formatRelativeTime helper at @/lib/utils/time
  - common.timeAgo.{now, minutes, hours, days} i18n key namespace
  - notification bell timestamps localized in EN + ES
  - automation execution timeline timestamps localized in EN + ES
  - single source of truth for compact relative-time formatting (client + server)
affects: [15-dashboard-home-polish, future surfaces needing relative-time labels]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared client+server util via structural type (TimeT = (key: string) => string) — avoids coupling util to next-intl types"
    - "Compact i18n namespace (common.timeAgo.*) separate from long-form (dashboard.home.timeAgo.*) — same surface concept, different visual style"
    - "Util module under web/src/lib/utils/ subdirectory coexisting with single-file web/src/lib/utils.ts (cn helper) — TypeScript resolves both paths independently"

key-files:
  created:
    - web/src/lib/utils/time.ts
  modified:
    - web/messages/en.json
    - web/messages/es.json
    - web/src/components/dashboard/notification-bell.tsx
    - web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx

key-decisions:
  - "Structural TimeT type instead of importing next-intl types — keeps util module dependency-free and compatible with both useTranslations (client) and getTranslations (server) translator shapes"
  - "Full migration of buildTimeAgo (all 4 buckets: <60s, <3600s, <86400s, else) — not just the hardcoded <60s 'Just now' bucket — to centralize formatting in one helper"
  - "Spanish m/h/d intentionally identical to English — universal time-unit abbreviations, preserves compact 5m/2h/3d visual style across locales (locked in CONTEXT.md)"
  - "common.timeAgo.* coexists with existing dashboard.home.timeAgo.* (long form) — different surfaces, different visual styles, no migration of long-form keys"
  - "web/src/lib/utils/ subdirectory introduced alongside existing web/src/lib/utils.ts file — both module resolutions coexist, cn() import path unaffected"

patterns-established:
  - "Pattern: shared util consumable from client and server components via structural function-shape typing"
  - "Pattern: compact i18n namespace (common.*) for cross-surface UI primitives"
  - "Pattern: count number prepended to abbreviation in code (no ICU pluralization) for visually compact relative timestamps"

requirements-completed: [AUTO-04, NOTF-02, I18N-01]

# Metrics
duration: 5 min
completed: 2026-04-30
---

# Phase 14 Plan 02: i18n Hardening for Relative Timestamps Summary

**Shared formatRelativeTime helper at @/lib/utils/time, backed by new compact common.timeAgo.* keys (EN now/m/h/d, ES ahora/m/h/d), wired into notification bell (client) and automation detail page (server) — closes audit LOW-1 ('Just now') and NEW-LOW-1 (hardcoded 'now'/'m'/'h'/'d').**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-30T19:43:07Z
- **Completed:** 2026-04-30T19:48:33Z
- **Tasks:** 3
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments
- New shared `formatRelativeTime(date, t)` helper at `web/src/lib/utils/time.ts` with structural `TimeT = (key: string) => string` type — works in both client (`useTranslations`) and server (`getTranslations`) contexts.
- New `common.timeAgo.{now, minutes, hours, days}` i18n keys in BOTH `en.json` (`now / m / h / d`) and `es.json` (`ahora / m / h / d`), preserving the compact 5m/2h/3d visual style.
- `notification-bell.tsx` migrated to `useTranslations("common")` + shared helper — removed local `formatRelativeTime` (5 hardcoded English literals: `"now"`, `"m"`, `"h"`, `"d"` + the bucket logic).
- `automations/[id]/page.tsx` migrated to `getTranslations("common")` + shared helper — removed `buildTimeAgo` function (closing `"Just now"` hardcoded bucket) AND removed `tHome` template-string scaffold (3 `replace("99", "{count}")` calls + 4 template variables).
- Existing `dashboard.home.timeAgo.*` (long form: `"{count}m ago"` / `"Hace {count}m"`) preserved untouched — different surface, different style.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared formatRelativeTime helper** — `5266937` (feat)
2. **Task 2: Add common.timeAgo.* keys to both message files** — `99900e7` (feat) *(see Issues Encountered)*
3. **Task 3: Migrate notification-bell + automation detail page** — `8af73e1` (refactor)

**Plan metadata:** *(pending — committed by next gsd-tools step)*

## Files Created/Modified

- `web/src/lib/utils/time.ts` — **created**. Single export: `formatRelativeTime(date: Date | string, t: TimeT): string`. Structural `TimeT = (key: string) => string`. Compact format (no ICU). 24 lines.
- `web/messages/en.json` — added `common.timeAgo.{now, minutes, hours, days}` (4 keys: `"now"`, `"m"`, `"h"`, `"d"`).
- `web/messages/es.json` — added `common.timeAgo.{now, minutes, hours, days}` (4 keys: `"ahora"`, `"m"`, `"h"`, `"d"`). Order parity with `en.json` preserved.
- `web/src/components/dashboard/notification-bell.tsx` — added `useTranslations` + `formatRelativeTime` imports, added `tCommon = useTranslations("common")` hook call, deleted local `formatRelativeTime` function (7 lines), updated call site to pass `tCommon` as second arg.
- `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` — added `formatRelativeTime` import, removed `buildTimeAgo` function (15 lines) and `tHome` template-string scaffold (12 lines including the `nowMs` declaration and 3 `tHome("timeAgo.*")` calls), added `tCommon = await getTranslations("common")`, simplified `enrichedExecutions.map` to call `formatRelativeTime(exec.started_at, tCommon)`. Net: −34 lines.

## Decisions Made

See `key-decisions` in frontmatter. Headlines:
- **Structural `TimeT` type** — declared `type TimeT = (key: string) => string` inside `time.ts` and used it as the helper parameter type. Both `useTranslations` and `getTranslations` translators are structurally assignable to this signature; the util module needs no `next-intl` import. TS strict mode satisfied without `any`.
- **Full migration of all 4 buckets** — the original `buildTimeAgo` had `"Just now"` hardcoded but used i18n templates for the other three. Plan 14-02 unified all four buckets through the shared helper, fully closing the original audit finding.
- **No ICU pluralization** — locked in CONTEXT.md / RESEARCH.md. `5m`/`2h`/`3d` is the compact visual style across locales; plurals would force the layout to change at every bucket boundary.

## Deviations from Plan

None functional — plan executed exactly as written.

The single point worth noting:

**1. [Note - Workflow] Concurrent commit-message contamination on commit `99900e7`**
- **Found during:** Task 2 (commit step)
- **Issue:** A parallel git activity in the same working directory (origin unknown — possibly another agent or background gsd-tools process running for Plan 14-01) created commit `99900e7` whose **message** says `feat(14-01): add assertOrgMembership helper for server-action auth gating` but whose **content** is exactly the Plan 14-02 Task 2 changes (i18n key additions to `en.json` + `es.json`). My intended Task 2 commit message — `feat(14-02): add common.timeAgo i18n keys (compact namespace)` — was rejected because the changes had already been committed under that wrong message.
- **Impact:** Cosmetic only. The Task 2 i18n keys ARE on `main`, in the correct files, with the correct content. The diff under `99900e7` shows only the `common.timeAgo.*` additions (verified via `git show 99900e7 --stat`). No code-correctness impact; only the commit-message-to-content mapping is misleading for future archaeology.
- **Fix:** Not amending per project commit discipline (which prefers new commits over `--amend`). Documented here so future readers searching for the i18n-key change by phase tag find both the misnamed commit and this note.
- **Files affected:** None (just commit metadata).

No deviation rules (1, 2, 3, 4) triggered — plan implementation proceeded as written. The TS error in `automation-detail-header.tsx` (missing `permissionError` translation field) is **out of scope** — caused by Plan 14-01's in-progress, uncommitted edits to that file, not by Plan 14-02 changes. Logged in deferred-items below.

---

**Total deviations:** 0 functional. 1 cosmetic commit-message anomaly (Task 2) caused by parallel agent activity outside my control.
**Impact on plan:** None on functionality. Plan delivered exactly as specified.

## Issues Encountered

**1. Commit-message contamination from concurrent agent activity (Task 2)** — see Deviations section above. My `git add web/messages/en.json web/messages/es.json` succeeded; my `git commit -m "feat(14-02): ..."` failed with "no changes added to commit" because a parallel process had already produced commit `99900e7` containing those exact diffs under a 14-01 commit message. I verified the i18n key changes ARE in the tree at HEAD and proceeded.

**2. Pre-existing baseline TS errors in unrelated files** — `npx tsc --noEmit` reports errors in `web/src/components/dashboard/automation-detail-header.tsx` (`permissionError` translation field, `success`/`error` discriminated-union access). These are caused by **Plan 14-01's uncommitted in-progress modifications** to that header file (visible via `git diff HEAD -- web/src/components/dashboard/automation-detail-header.tsx`), not by Plan 14-02. Per scope boundary in deviation rules, I do NOT auto-fix these — they are Plan 14-01's responsibility to land cleanly. The plan's verify gate is `npm run lint`, which passes with **0 errors / 0 warnings** for my touched files.

**3. Pre-existing baseline lint debt unchanged** — total project lint output is 103 errors / 1584 warnings (same baseline noted in STATE.md from Phase 13-01 decisions). Zero of those are in files Plan 14-02 touched. No regression introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 14-02 closes audit findings LOW-1 and NEW-LOW-1.
- Phase 14 has one more plan (14-01, in progress per parallel agent activity) — once 14-01 lands its full diff (including the `automation-detail-header.tsx` consumer update for `permissionError`), the TS errors noted above will resolve.
- Build/lint cleanly for the files Plan 14-02 owns. No blockers introduced for Phase 15 or subsequent work.
- Manual verification (locale switch in browser) recommended before Phase 14 verifier runs — golden path: switch to Español, open notification bell + visit any active automation detail page, confirm `ahora` / `5m` / `2h` / `3d` render.

## Self-Check

Verifying claims against disk + git:

- `web/src/lib/utils/time.ts` — FOUND (24 lines, exports `formatRelativeTime`)
- `web/messages/en.json` `common.timeAgo` — FOUND (`now`, `minutes`, `hours`, `days` = `now`, `m`, `h`, `d`)
- `web/messages/es.json` `common.timeAgo` — FOUND (`now`, `minutes`, `hours`, `days` = `ahora`, `m`, `h`, `d`)
- `web/messages/en.json` `dashboard.home.timeAgo` — FOUND, untouched (`Just now` / `{count}m ago` / etc.)
- `web/messages/es.json` `dashboard.home.timeAgo` — FOUND, untouched (`Ahora` / `Hace {count}m` / etc.)
- `notification-bell.tsx` — local `formatRelativeTime` REMOVED, `useTranslations("common")` ADDED, `formatRelativeTime(notification.created_at, tCommon)` IN USE
- `automations/[id]/page.tsx` — `buildTimeAgo` REMOVED, `tHome` template scaffold REMOVED, `tCommon = await getTranslations("common")` ADDED, `formatRelativeTime(exec.started_at, tCommon)` IN USE
- Commit `5266937` — FOUND (Task 1)
- Commit `99900e7` — FOUND (Task 2 content; misnamed message — see Deviations)
- Commit `8af73e1` — FOUND (Task 3)

## Self-Check: PASSED

---
*Phase: 14-i18n-security-hygiene*
*Completed: 2026-04-30*
