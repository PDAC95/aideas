---
phase: 23-client-360-crosslink-fix
plan: 03
subsystem: ui
tags: [admin, client-360, deep-link, uat, uuid, icu-messageformat, i18n]

# Dependency graph
requires:
  - phase: 23-client-360-crosslink-fix
    plan: 01
    provides: resolveOrgIdentifier helper + envelope return shapes on fetchAdminRequests / fetchAdminAutomations
  - phase: 23-client-360-crosslink-fix
    plan: 02
    provides: ?org= parsing on /admin/requests and /admin/automations + AdminOrgFilterChip + orgFilter i18n subtrees
  - phase: 21-client-360
    provides: AdminClientRequestsTab / AdminClientAutomationsTab emitters that this plan verifies
provides:
  - "Confirmed emitter contract: both Client 360 tabs emit /admin/{requests|automations}?org=${encodeURIComponent(orgSlug)} with orgSlug = organization.slug"
  - "Phase 23 success criteria #1, #2, #3, #4 verified true via human UAT (5/5 tests in EN and ES)"
  - "Hotfix: lenient UUID-shape regex in resolveOrgIdentifier (accepts seed/nil UUIDs that fail RFC 4122 v1-5 strict validation)"
  - "Hotfix: ICU MessageFormat escape bug in orgFilter.notFound (double quotes instead of single quotes around {value})"
affects: [23-VERIFICATION, milestone-v1.2-audit]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verification-only task: when planner already extracted the contract via <interfaces>, the executor confirms with grep + one-level prop trace rather than rewriting"
    - "UAT-discovered hotfix: bugs surfaced during human UAT get patched in a single fix commit tagged with the verification plan's scope, summarized as deviations on the verification plan rather than rolling back to an earlier plan"

key-files:
  created:
    - ".planning/phases/23-client-360-crosslink-fix/23-03-SUMMARY.md"
  modified:
    - "web/src/lib/admin/org-identifier.ts"
    - "web/messages/en.json"
    - "web/messages/es.json"

key-decisions:
  - "23-03: isUuid regex relaxed to layout-only (8-4-4-4-12 hex, no RFC 4122 v1-5 version/variant enforcement) because Postgres accepts any 128-bit hex as a UUID and the seed values use 0-nibble version fields"
  - "23-03: orgFilter.notFound in en.json / es.json uses double quotes around {value} instead of single quotes — ICU MessageFormat treats single quotes as literal-escape syntax, which caused {value} to render verbatim"
  - "23-03: Pre-existing admin-layout language switcher gap (Phase 17 tech debt) accepted — UAT performed locale switch via document.cookie from browser console; logged in known tech debt, not a Phase 23 blocker"

patterns-established:
  - "Pattern: UUID-shape validators should be layout-only when discriminating between UUID and slug — the DB lookup is the source of truth, and overly-strict version/variant validation rejects legitimate Postgres UUIDs (seed data, nil UUID)"
  - "Pattern: ICU MessageFormat placeholders should be surrounded by double quotes (or no quotes) — single quotes activate ICU's literal-escape mode and break interpolation"

requirements-completed:
  - CLNT-04
  - AUTM-02

# Metrics
duration: ~25 min (includes human UAT + 2 tactical fix iterations)
completed: 2026-05-14
---

# Phase 23 Plan 03: Verify Cross-Link Emitters + End-to-End UAT Summary

**Confirmed the two Client 360 emitter tabs already match the slug-or-uuid resolver contract (zero code changes for Task 1), human-UAT'd all 5 success-criteria tests in EN and ES, and shipped two tactical hotfixes discovered mid-UAT (lenient UUID regex + ICU notFound interpolation).**

## Performance

- **Duration:** ~25 min (Task 1 verification ~3 min, Task 2 human UAT ~22 min including the two debug-fix iterations)
- **Started:** 2026-05-13T20:00:00Z (approx)
- **Completed:** 2026-05-14T00:30:00Z (approx)
- **Tasks:** 2 (Task 1 auto verification, Task 2 human-verify checkpoint)
- **Files modified:** 3 (all from the mid-UAT hotfix commit)

## Accomplishments

- **Emitter contract verified.** Both `admin-client-requests-tab.tsx` and `admin-client-automations-tab.tsx` already emit `/admin/{requests|automations}?org=${encodeURIComponent(orgSlug)}`, and the parent page `(admin)/admin/clients/[id]/page.tsx:191,200` passes `orgSlug={detail.slug}` — the prop is the slug, not the UUID. No code changes required for Task 1, exactly as the plan predicted.
- **Phase 23 success criteria #1, #2, #3, #4 all observably true end-to-end** via the 5-test UAT matrix run in both locales by `pdmckinster@gmail.com` on dev server `localhost:4000`.
- **Two latent bugs found and patched** during the human UAT for Test 3 (slug-or-uuid round-trip), shipped in a single hotfix commit `9053e3b` — see Deviations below.
- **REQUIREMENTS.md traceability for CLNT-04 and AUTM-02 is ready to flip** from "Pending (gap closure)" to "Complete (Phase 23)" once the verifier closes the phase in the next orchestrator step.

## Task Commits

Each task completion was atomic:

1. **Task 1: Confirm emitter behavior + tactical patch if needed** — no code commit (zero changes; verification documented inline here)
2. **Task 2: End-to-end UAT for both success criteria + EN/ES parity** — UAT approved by `pdmckinster@gmail.com`; mid-UAT hotfix landed as `9053e3b` (`fix(23-03): accept non-RFC-strict UUIDs + fix ICU notFound interpolation`)

_Plan metadata commit: appended after this summary lands._

## Files Created/Modified

- `web/src/lib/admin/org-identifier.ts` — relaxed `isUuid` regex from RFC 4122 v1-5 strict (`[1-5]` version nibble + `[89ab]` variant nibble) to layout-only (`[0-9a-f]{4}` in both positions). JSDoc updated to reflect that the DB lookup is the source of truth.
- `web/messages/en.json` — `admin.requests.list.orgFilter.notFound` and `admin.automations.list.orgFilter.notFound` switched from `Organization not found: '{value}'` to `Organization not found: "{value}"` (single → double quotes to escape ICU literal-quote behavior).
- `web/messages/es.json` — same fix for the Spanish strings (`Organización no encontrada: "{value}"`).

No emitter files were modified — Task 1's verification confirmed they were already correct.

## Decisions Made

- **Relax `isUuid` regex to layout-only.** Seed data UUIDs (`bbbbbbbb-0000-0000-0000-000000000001`) and the nil UUID (`00000000-...`) are valid Postgres UUIDs but fail strict RFC 4122 v1-5 validation because their version nibble is `0` and the variant nibble is `0`. The original regex incorrectly routed these to the slug path, producing the "Organization not found" destructive chip even though the UUID was real. Since Postgres accepts any 128-bit hex as a UUID and the resolver always does a DB lookup, the regex only needs to discriminate UUID-shape from slug-shape — layout-only is sufficient.
- **Switch ICU notFound placeholder quotes from single to double.** ICU MessageFormat treats single quotes (`'`) as literal-escape syntax — `'{value}'` becomes the literal text `{value}` instead of an interpolated placeholder. Double quotes have no ICU-special meaning, so `"{value}"` interpolates correctly while still showing the user input wrapped in quotes for readability.
- **Defer the admin-layout language switcher.** Test 4 (EN/ES parity) required switching locale, but the admin shell has no language switcher (pre-existing Phase 17 tech debt also blocking I18N-runtime UAT for the entire admin surface). Worked around it via `document.cookie = "NEXT_LOCALE=en"` from the browser console during UAT. Not a Phase 23 blocker — already logged as known tech debt under "Phase 19" in CLAUDE.md.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Strict RFC 4122 v1-5 regex rejected legitimate Postgres UUIDs**
- **Found during:** Task 2 (UAT Test 3 — slug-or-uuid transparency)
- **Issue:** Navigating to `/admin/automations?org=bbbbbbbb-0000-0000-0000-000000000001` (the GlobalTech seed UUID) rendered the destructive red "Organization not found" chip instead of resolving to the org. Root cause: `isUuid()` enforced version nibble in `[1-5]` and variant nibble in `[89ab]`, which seed UUIDs (and the nil UUID) violate. Falls through to slug path → no slug match → unresolved → not-found chip.
- **Fix:** Relaxed regex to `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` (layout-only, case-insensitive). JSDoc updated.
- **Files modified:** `web/src/lib/admin/org-identifier.ts`
- **Verification:** Re-ran Test 3 with same UUID → chip now reads "Organización: GlobalTech" (matches the slug path output). Approved by user.
- **Committed in:** `9053e3b`

**2. [Rule 1 - Bug] ICU single-quoted placeholder rendered literal `{value}` text**
- **Found during:** Task 2 (UAT Test 3 same iteration — visible alongside Bug 1)
- **Issue:** The destructive "Organization not found" chip rendered as literal text `Organization not found: '{value}'` instead of interpolating the user's input. Root cause: the en.json/es.json strings wrapped `{value}` in single quotes — ICU MessageFormat treats single quotes as a literal-escape mechanism (e.g., `'{value}'` means "the literal characters {value}", not "the placeholder value wrapped in quotes").
- **Fix:** Replaced single quotes with double quotes around `{value}` in both `en.json` and `es.json`. Visual outcome is identical (the user still sees the input wrapped in quotes), but ICU now interpolates the placeholder.
- **Files modified:** `web/messages/en.json`, `web/messages/es.json`
- **Verification:** After hot reload, the error chip renders `Organización no encontrada: "zzz-not-real"` (ES) and `Organization not found: "zzz-not-real"` (EN) with proper quote interpolation. Approved by user.
- **Committed in:** `9053e3b` (same commit as Bug 1)

---

**Total deviations:** 2 auto-fixed (2 bugs, both Rule 1).
**Impact on plan:** Both bugs were latent in Plan 01 + Plan 02 — UAT was the right gate to surface them. Plan 03's verification mandate is "confirm the round-trip works end-to-end," so patching the latent bugs is in-scope. No scope creep. The fixes are surgical (one-line regex change + 4 quote characters across 2 files) and preserve all existing behavior except where the bugs prevented correct rendering.

## Issues Encountered

- **Admin-layout language switcher missing** (pre-existing). UAT Test 4 (EN/ES parity) required switching the active locale, but the admin shell still has no language-switcher UI control. Worked around by setting `document.cookie = "NEXT_LOCALE=en"` from the browser DevTools console between EN and ES test passes. Verified parity in both locales. Already logged under Phase 19 tech debt in CLAUDE.md ("Language switcher missing in admin layout") — not introduced by Phase 23, not a Phase 23 blocker.
- **Dev server port 4000 vs documented 3000.** The plan referenced `http://localhost:3000`; the user ran the dev server on port 4000. Functionally identical; documented here for completeness.

## UAT Outcomes (5/5 passed in EN and ES)

| Test | Criterion | Result |
|------|-----------|--------|
| 1 | Requests cross-link from /admin/clients/[id] → /admin/requests?org=globaltech filters to 1 GlobalTech request; ✕ clears filter and reveals all 3 pending across orgs | PASS |
| 2 | Automations cross-link → /admin/automations?org=globaltech filters to 1 active row; "Activas (4)" tab remains active (cross-org tab + org filter render correctly); ✕ clears filter and reveals all 4 active | PASS |
| 3 | Slug-or-uuid transparency: ?org=<uuid> resolves identically to ?org=<slug> after the two hotfixes in commit 9053e3b | PASS (after fix) |
| 4 | EN/ES parity: chip reads "Organization: GlobalTech" in EN and "Organización: GlobalTech" in ES; error chip renders 'Organization not found: "zzz-not-real"' in EN and 'Organización no encontrada: "zzz-not-real"' in ES | PASS |
| 5 | Not-found state: /admin/requests?org=garbage-slug-xyz renders destructive red chip + empty table + tabs/sidebar fully functional; ✕ clears | PASS |

Approved by `pdmckinster@gmail.com` (super_admin) on dev server `localhost:4000`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Phase 23 ready for verifier.** The next orchestrator step is `/gsd:verify-work 23` which will write `23-VERIFICATION.md` documenting the 5/5 UAT outcomes + the two hotfix commits, and flip Phase 23 to Complete in ROADMAP.md.
- **REQUIREMENTS.md** ready to mark CLNT-04 and AUTM-02 as `Complete (Phase 23)` (verifier owns this flip).
- **deferred-items.md** in this phase dir still tracks the cosmetic dropdown mismatch on `/admin/automations` filter bar (not a Phase 23 blocker, follow-up sweep).
- **Admin-layout language switcher** remains the only known UAT-workflow friction for the admin surface (Phase 17 tech debt, cross-cutting across phases 17-23).

## Self-Check: PASSED

Verified files on disk and commits in git log:

- `.planning/phases/23-client-360-crosslink-fix/23-03-SUMMARY.md` — present (this file)
- `web/src/lib/admin/org-identifier.ts` — modified per commit 9053e3b
- `web/messages/en.json` — modified per commit 9053e3b
- `web/messages/es.json` — modified per commit 9053e3b
- Commit `9053e3b` (mid-UAT hotfix) — present in `git log --oneline`
- Emitter files `web/src/components/admin/clients/admin-client-{requests,automations}-tab.tsx` — present and unchanged (Task 1 verification)
- Prop trace `(admin)/admin/clients/[id]/page.tsx:191,200` passes `orgSlug={detail.slug}` — confirmed via grep

---
*Phase: 23-client-360-crosslink-fix*
*Completed: 2026-05-14*
