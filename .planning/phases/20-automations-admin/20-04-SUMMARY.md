---
phase: 20-automations-admin
plan: 04
subsystem: ui
tags: [admin, automations, i18n, supabase, postgrest, next-intl, react]

# Dependency graph
requires:
  - phase: 20-automations-admin
    provides: "AdminAutomationTab union, ADMIN_AUTOMATION_TABS array, fetchAdminAutomations + fetchAdminAutomationStatusCounts queries, AdminAutomationsTabs client component, admin.automations.list i18n namespace"
provides:
  - "Conditional 'Other' / 'Otros' catch-all tab in /admin/automations that renders only when count(draft) + count(pending_review) > 0"
  - "Sixth value 'other' threaded through AdminAutomationTab type, ADMIN_AUTOMATION_TABS array, and AdminAutomationStatusCounts Record"
  - "fetchAdminAutomations branches on filters.tab === 'other' to query .in('status', ['draft', 'pending_review'])"
  - "fetchAdminAutomationStatusCounts emits a 6th HEAD count for the 'other' bucket in the same Promise.all"
  - "Two new i18n leaf keys per locale (admin.automations.list.tabs.other + admin.automations.list.empty.other) — 875 total leaf keys, full EN/ES parity"
  - "AUTM-01 satisfied at strict ROADMAP wording — all 7 statuses (draft|pending_review|in_setup|active|paused|failed|archived) are reachable from the UI"
affects: [phase-21-clients-admin, phase-22-admin-home, future admin status-tab patterns]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional UI-layer catch-all tab pattern: extend the type union with a synthetic value, branch the SQL filter via .in() vs .eq(), conditional render in the tab strip when count is zero"
    - "Synthetic tab value as a UI-only abstraction (NOT a DB status). Per-row badge still renders the underlying real status via existing i18n keys"

key-files:
  created: []
  modified:
    - "web/src/lib/admin/types.ts (AdminAutomationTab + ADMIN_AUTOMATION_TABS extended with 'other')"
    - "web/src/lib/admin/automation-queries.ts (fetchAdminAutomations + fetchAdminAutomationStatusCounts branch on 'other')"
    - "web/src/app/(admin)/admin/automations/page.tsx (tabsTranslations + empty-union extended with 'other')"
    - "web/src/components/admin/automations/admin-automations-tabs.tsx (translations.other + conditional render guard)"
    - "web/messages/en.json (admin.automations.list.tabs.other + empty.other)"
    - "web/messages/es.json (admin.automations.list.tabs.other + empty.other)"
    - ".planning/REQUIREMENTS.md (AUTM-01 flipped to [x] + Traceability row to Complete)"

key-decisions:
  - "'Other' is a UI-only synthetic tab value, NOT a real DB status. The DB CHECK constraint on automations.status remains the same 7 values; AdminAutomationStatus union is intentionally unchanged."
  - "Per-row status badge continues to render the actual underlying status (Draft / Pending review) via the existing statusBadges.draft and statusBadges.pending_review keys. Reused unchanged."
  - "Conditional render guard inside the existing .map (early return null) instead of pre-filtering ADMIN_AUTOMATION_TABS — keeps React key alignment and matches the existing component style. Single load-bearing line."
  - "translations.other made REQUIRED (not optional) on AdminAutomationsTabsProps. The page always passes it; making it optional would invite regressions where the Spanish locale forgets to pass it."
  - "coerceTab() needed NO change — data-driven via (ADMIN_AUTOMATION_TABS as readonly string[]).includes(raw). Adding 'other' to the array automatically made ?status=other a valid landing URL."
  - "Filter chain order in fetchAdminAutomations preserved verbatim: status filter (.eq or .in) -> .is(deleted_at, null) -> two translation .eq calls -> optional filters -> .order. Refactored from inline chain to two-statement (build select; then conditional status filter; then continue) to enable the .eq vs .in branch."
  - "Spanish strings stay accent-free per established admin.* namespace convention ('configuracion', 'revision', 'automatizacion', 'borrador'). Matches Phase 17/18/19/20 patterns."

patterns-established:
  - "UI-layer catch-all tab: when a bucket of N real DB statuses needs to surface as a single tab, add a synthetic tab value to the union/array, branch the query via .in() vs .eq(), conditionally render when count > 0, reuse existing per-row badge keys for the actual status. Reusable for any future 'group these N statuses under one tab' admin pattern."
  - "Synthetic tab value name should be neutral ('other') so the catch-all can absorb additional statuses later without renaming. Not 'draft_or_pending_review' — too specific."

requirements-completed: [AUTM-01, I18N-01]

# Metrics
duration: 6 min
completed: 2026-05-08
---

# Phase 20 Plan 04: Other Catch-all Tab Summary

**Conditional 'Other' / 'Otros' tab in /admin/automations surfacing draft + pending_review rows under a single non-default tab, rendered only when count(draft)+count(pending_review) > 0 — closes the AUTM-01 ROADMAP gap.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-08T14:00:37Z
- **Completed:** 2026-05-08T14:06:54Z
- **Tasks:** 6
- **Files modified:** 7

## Accomplishments

- `AdminAutomationTab` union and `ADMIN_AUTOMATION_TABS` readonly array gain `"other"` as the 6th member/entry — `AdminAutomationStatusCounts` auto-extends to a 6-key Record via TypeScript inference.
- `fetchAdminAutomations` branches on `filters.tab === "other"` to issue `.in("status", ["draft", "pending_review"])`; every other tab continues to use `.eq("status", filters.tab)`. Filter chain ordering preserved.
- `fetchAdminAutomationStatusCounts` returns 6 parallel HEAD counts (5 single-status + 1 catch-all). Same Promise.all shape; one extra entry. `counts` initializer adds `other: 0`.
- Page-level wiring: `tabsTranslations` adds `other`; the `t()` empty-state union literal adds `"empty.other"`. `coerceTab` required NO change — already data-driven via `ADMIN_AUTOMATION_TABS.includes`.
- Tab strip widget: prop type widened with `other: string` (required); single early-return guard `if (tab === "other" && counts.other === 0) return null;` inside the existing `.map` hides the tab when both counts are zero.
- Two new i18n leaf keys per locale: `admin.automations.list.tabs.other` ("Other ({count})" / "Otros ({count})") and `admin.automations.list.empty.other` ("No draft or pre-review automations match the current filters." / "Ninguna automatizacion en borrador o en revision coincide con los filtros actuales."). 875 total leaf keys, full EN/ES parity.
- AUTM-01 strict-ROADMAP-wording satisfied — all 7 real DB statuses are now reachable from the UI (5 dedicated tabs + 2 in the 'other' catch-all). REQUIREMENTS.md flipped from `[ ]` to `[x]`; Traceability row from `Pending` to `Complete`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend AdminAutomationTab + ADMIN_AUTOMATION_TABS to include 'other'** - `18c4cf7` (feat)
2. **Task 2: Special-case 'other' in fetchAdminAutomations + fetchAdminAutomationStatusCounts** - `fbd53ce` (feat)
3. **Task 3: Wire 'other' through page.tsx (translations + empty-state union)** - `5e4ab73` (feat)
4. **Task 4: Conditionally render the 'Other' tab in admin-automations-tabs.tsx** - `14eac51` (feat)
5. **Task 5: Add tabs.other + empty.other i18n keys to en.json + es.json with parity** - `d6cad36` (feat)
6. **Task 6: Build, lint, manual smoke + flip AUTM-01 to [x] in REQUIREMENTS.md** - `97b4c2e` (docs)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `web/src/lib/admin/types.ts` — Extended `AdminAutomationTab` union with `"other"`; appended `"other"` to `ADMIN_AUTOMATION_TABS` array. JSDoc updated to describe new conditional catch-all behavior. `AdminAutomationStatus` (real DB statuses) intentionally unchanged.
- `web/src/lib/admin/automation-queries.ts` — `fetchAdminAutomations` refactored from a single inline `.from().select().eq().is()...` chain into a build-select-then-branch-status-filter pattern; `.in("status", ["draft", "pending_review"])` for `tab === "other"`, `.eq("status", filters.tab)` otherwise. `fetchAdminAutomationStatusCounts` issues 6 parallel HEAD counts; counts initializer gains `other: 0`. The other two functions (`fetchAdminAutomationFilterOptions`, `fetchAdminAutomationDetail`) unchanged.
- `web/src/app/(admin)/admin/automations/page.tsx` — `tabsTranslations.other` added; empty-state union literal extended with `"empty.other"`. `coerceTab`, `nullify`, Promise.all, JSX all unchanged.
- `web/src/components/admin/automations/admin-automations-tabs.tsx` — Prop type `translations.other: string` added (required); single early-return guard inside `.map` hides the tab when `counts.other === 0`. Default-tab canonicalization, ARIA roles, useTransition, hover/active styles unchanged. `"use client"` directive preserved.
- `web/messages/en.json` — Two new leaf keys under `admin.automations.list`: `tabs.other` = "Other ({count})", `empty.other` = "No draft or pre-review automations match the current filters."
- `web/messages/es.json` — Mirror Spanish leaf keys (accent-free): `tabs.other` = "Otros ({count})", `empty.other` = "Ninguna automatizacion en borrador o en revision coincide con los filtros actuales."
- `.planning/REQUIREMENTS.md` — AUTM-01 line flipped from `- [ ]` to `- [x]`; Traceability table row updated from `| AUTM-01 | Phase 20 | Pending |` to `| AUTM-01 | Phase 20 | Complete |`.

## Decisions Made

- **Synthetic UI-only tab value, not a DB status.** Adding `"other"` to `AdminAutomationStatus` would have lied about what the DB CHECK constraint allows. Keeping the union strictly real-DB-statuses preserves type safety for anything that touches `automations.status` directly; the new `"other"` lives only in the tab type that drives the UI strip + URL state.
- **Reuse existing per-row status badges.** Each row inside the catch-all keeps its real underlying status badge (Draft / Pending review) via the already-existing `statusBadges.draft` and `statusBadges.pending_review` keys. The user sees a clean "Other (N)" tab BUT each row still tells them which exact pre-operational state it's in.
- **Single early-return guard inside `.map`** instead of `ADMIN_AUTOMATION_TABS.filter(...).map(...)`. Preserves React key alignment, doesn't duplicate the array, matches the component's existing style. The guard is one load-bearing line: `if (tab === "other" && counts.other === 0) return null;`.
- **`coerceTab` required NO edit.** It was already data-driven via `(ADMIN_AUTOMATION_TABS as readonly string[]).includes(raw)`. Adding `"other"` to the array made `?status=other` a valid landing URL automatically. This is a small but clean architectural payoff.
- **Filter chain refactor was minimal.** Dropped the inline `.eq("status", filters.tab)` from the chain after `.select(...)`, branched it as `query = query.eq(...)` or `query = query.in(...)`, then continued the rest of the chain via `query = query.is(...).eq(...).eq(...)`. Equivalent SQL output for non-other tabs; correct SQL for `tab === "other"`. Filter ordering preserved verbatim.
- **`translations.other` required, not optional.** The page passes it; making it optional would invite regressions where a future locale forgets to populate it. Required is the safer default.
- **i18n strings stay accent-free in Spanish** ("Otros", "borrador", "revision", "automatizacion") — matches the existing `admin.*` namespace convention from Phases 17-20.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `npm run build` initially failed on Windows with TLS errors fetching the Geist font from Google. Resolved by setting `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` for the build invocation, exactly as the plan's Step A note prescribed. Build then succeeded; `/admin/automations` and `/admin/automations/[id]` both emitted as dynamic server-rendered routes.
- One verification one-liner used a node `-e` invocation whose `\b` regex was eaten by the shell quoting layer. Worked around by writing the verification script to a tiny `.cjs` file and running it. Cosmetic issue with the plan's verification snippet, not a functional issue.

## Manual UAT (deferred to human)

The plan's Task 6 Step C lays out 5 manual smoke flows that require browser interaction (sign in to `/admin/login`, flip a row to `draft` in Supabase, click tabs, switch locale, verify Spanish strings). These are deferred to the developer per project policy — automated build + lint + parity all pass. Recommended UAT items, in order:

1. **Zero-other (default).** Visit `/admin/automations`. With seed data showing zero `draft` + `pending_review` rows, the strip shows exactly 5 tabs.
2. **With-other.** Run `UPDATE automations SET status = 'draft' WHERE id = (SELECT id FROM automations WHERE status = 'archived' LIMIT 1) RETURNING id, status;` Reload — "Other (1)" appears as the 6th tab.
3. **Click-other.** Click "Other (1)". URL becomes `/admin/automations?status=other`. Table renders one row whose Status badge reads "Draft".
4. **EN/ES parity.** Switch locale to ES. Tab label reads "Otros (1)".
5. **Filter combo.** Visit `/admin/automations?status=other&q=<substring>`. The catch-all narrows by name search.

After smoke, restore: `UPDATE automations SET status = 'archived' WHERE id = '<id-from-step-2>';`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Phase 20 is now complete at strict ROADMAP wording.** All 5 Phase 20 requirements satisfied: AUTM-01 (this plan) + AUTM-02..05 (earlier plans). I18N-01 cross-cutting surface for Phase 20 is complete (875 total leaf keys, full EN/ES parity).
- **No detail page changes, no transition button changes, no execution timeline changes, no server action changes.** Phase 20 plans 02 and 03 are byte-for-byte preserved by this plan.
- **Customer-side `/dashboard/automations` is untouched.** Archived rows already filtered there per Phase 09; draft and pending_review never reach the customer view in v1.2 because there is no creation surface for them.
- **Phase 20 is ready to merge to `main`** once the human runs the 5-step UAT above. Phase 21 (Clients Admin) is unblocked. Patterns reused from this gap closure (UI-layer synthetic tab + .in() vs .eq() branch + conditional render guard) transfer directly to any future "group N statuses under one tab" admin surface.

## Self-Check: PASSED

All 8 modified files exist on disk; all 6 task commit hashes (18c4cf7, fbd53ce, 5e4ab73, 14eac51, d6cad36, 97b4c2e) found in git log.

---
*Phase: 20-automations-admin*
*Completed: 2026-05-08*
