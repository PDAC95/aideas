---
phase: 14-i18n-security-hygiene
plan: 01
subsystem: auth
tags: [server-actions, supabase, rls, role-check, i18n, next-intl, react]

# Dependency graph
requires:
  - phase: 09-my-automations
    provides: updateAutomationStatus server action + automation-detail-header.tsx toast pattern
  - phase: 12-settings
    provides: Dual-client (anon read + admin write) + role check pattern from settings.ts
provides:
  - Reusable assertOrgMembership helper for any future server action that mutates org-scoped resources
  - Hardened updateAutomationStatus with org-ownership + role gate + admin-client write path
  - Localized permission-error toast (red bg-red-600, EN + ES) on automation detail header
  - Discriminated-union return shape ({ success: true } | { error: string }) on automation status mutations
affects: [phase-14-02, future-server-actions, audit-MEDIUM-1]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Generic 'forbidden' error (no resource-existence oracle) when read or membership check fails"
    - "Reusable assertOrgMembership helper accepts caller-supplied SupabaseClient to reuse session"
    - "Structured console.error logs with userId + attemptedOrgId + automationId for grep-ability in Vercel"
    - "Typed toast { type: 'success' | 'error', message } for color-discriminated UX"
    - "is_active=true filter on organization_members read (defense-in-depth)"

key-files:
  created:
    - web/src/lib/auth/assert-org-membership.ts
  modified:
    - web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts
    - web/src/components/dashboard/automation-detail-header.tsx
    - web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "Role allowlist owner|admin|operator (viewer rejected) — matches existing automation list affordances"
  - "Treat read-failure (RLS-blocked or not-found) as 'forbidden' to avoid leaking automation IDs"
  - "Discriminated union { success: true } | { error: string } — narrows correctly with 'error' in result"
  - "Typed toast shape { type, message } — matches settings-{profile,preferences,security}-card pattern"
  - "Spanish text: 'No tienes permiso para realizar esta acción' (with diacritic acción)"
  - "Caller supplies its supabase client to assertOrgMembership — keeps cookie/session context"

patterns-established:
  - "Defense-in-depth on server actions: pre-flight read of resource org → assert membership → admin-client write"
  - "Generic permission errors: use 'forbidden' on read failure AND membership failure (no oracle)"
  - "Localized error toasts: pass error string via translations prop, render red variant inline (no toast lib)"

requirements-completed: [AUTO-06]

# Metrics
duration: 9min
completed: 2026-04-30
---

# Phase 14 Plan 01: Automation-Action Org Gate + Localized Permission Toast Summary

**Hardened `updateAutomationStatus` server action with org+role gate via reusable `assertOrgMembership` helper, admin-client write path, and bilingual red permission-error toast on automation detail header.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-04-30T19:42:59Z
- **Completed:** 2026-04-30T19:51:00Z
- **Tasks:** 3
- **Files modified:** 5 (1 new, 4 modified)

## Accomplishments

- Closed audit MEDIUM-1 (cross-org pause/resume/cancel was silently RLS-blocked but exposed raw error message; now generic 'forbidden')
- New reusable `assertOrgMembership` helper available for all future server actions that mutate org-scoped data
- `updateAutomationStatus` now performs three-step gate: read org → assert membership(owner|admin|operator) → admin-client write
- Permission errors render as red bg-red-600 toast in EN ("You don't have permission to perform this action") and ES ("No tienes permiso para realizar esta acción")
- Structured `console.error` lines emit userId + attemptedOrgId + automationId on every rejection — greppable in Vercel logs

## Task Commits

1. **Task 1: Create reusable assertOrgMembership helper** — `38a21ae` (feat)
2. **Task 2: Harden updateAutomationStatus with org gate + admin-client write** — `8be3a39` (feat)
3. **Task 3: Localize permission-error toast on automation detail header** — `649b0e9` (feat)

## Files Created/Modified

- **`web/src/lib/auth/assert-org-membership.ts`** (NEW, 50 LOC) — Reusable helper. Verifies authenticated user is active member of orgId with allowed role. Returns `{ error: 'forbidden' | 'unauthorized' }` on failure, `null` on success. Logs `[assertOrgMembership] access denied` with userId + attemptedOrgId on rejection.
- **`web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts`** (rewritten, 24→64 LOC) — Three-step gate: pre-flight read of `automations.organization_id` via cookie client → `assertOrgMembership([owner, admin, operator])` → admin-client `.update()`. Returns `{ success: true } | { error: string }`.
- **`web/src/components/dashboard/automation-detail-header.tsx`** (modified) — Added `permissionError: string` to translations prop. Toast state shape changed to `{ type: 'success' | 'error', message: string } | null`. Three handlers (`handlePause`, `handleResume`, `handleCancelConfirm`) updated to use `'error' in result` discriminant. Toast JSX renders red `bg-red-600` for errors, green `bg-green-600` for success.
- **`web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx`** (modified — `permissionError: t("actions.permissionError")` added to `headerTranslations` object; this single-line edit was committed as part of plan 14-02's refactor commit `8af73e1` due to parallel-execution race — see Issues Encountered).
- **`web/messages/en.json`** (modified) — Added `dashboard.automations.actions.permissionError = "You don't have permission to perform this action"`.
- **`web/messages/es.json`** (modified) — Added `dashboard.automations.actions.permissionError = "No tienes permiso para realizar esta acción"`.

## Decisions Made

1. **Role allowlist `[owner, admin, operator]` (viewer rejected).** Matches the role hierarchy implied by the dashboard UI; viewer is read-only by design.
2. **Generic `'forbidden'` on read failure.** RLS-blocked SELECT and not-found are treated identically — no resource-existence oracle. Both code paths log distinct console.error entries for ops debugging.
3. **Discriminated union `{ success: true } | { error: string }`.** Mirrors the pattern in `web/src/lib/actions/settings.ts`; client narrows via `'error' in result` (cleaner than `result.success === true` which TypeScript can't narrow when error branch lacks `success`).
4. **Caller passes its supabase client to `assertOrgMembership`.** The helper does NOT call `createClient()` itself — keeps the cookie/session context the caller already has.
5. **Typed toast `{ type, message }`.** Allows red/green color discrimination without adding a toast library (sonner is not installed). Matches existing pattern in `settings-profile-card.tsx`, `settings-preferences-card.tsx`, `settings-security-card.tsx`.
6. **Spanish phrasing locked: `"No tienes permiso para realizar esta acción"`.** Lifted directly from CONTEXT.md's Error UX section (with diacritic).

## Deviations from Plan

None - plan executed exactly as written. The `'error' in result` discriminant was used in place of `result.success` (the plan suggested `result.success === true` which doesn't narrow with the failure branch); this is a more idiomatic TS pattern and was internally consistent across all three handlers.

## Issues Encountered

**Parallel-execution race with plan 14-02 executor.** Plans 14-01 (this plan) and 14-02 were both wave 1 and ran concurrently in the same working tree. This caused two minor incidents:

1. **Misleading commit `99900e7`.** During Task 1, a `git commit --only`-equivalent did not constrain to my staged file in time; the resulting commit captured plan 14-02's `web/messages/{en,es}.json` `common.timeAgo` block under the message `feat(14-01): add assertOrgMembership helper`. The commit content is legitimate (it's plan 14-02 i18n work) — only the message scope is wrong. Subsequently I committed the actual `assert-org-membership.ts` file under correct message `38a21ae feat(14-01): create assertOrgMembership server-action helper`. No data loss; only commit hygiene affected. Recommend `git rebase -i be3ebf8` post-phase to reword `99900e7` to `feat(14-02)`.
2. **`page.tsx` permissionError edit committed under `8af73e1`.** My single-line addition `permissionError: t("actions.permissionError")` to `headerTranslations` was picked up by plan 14-02's `refactor(14-02): migrate notification-bell and automation detail to shared helper` commit. Functionally correct — the line is in HEAD and the translation is wired — but attribution sits under 14-02 instead of 14-01.

Both incidents are commit-history-only artifacts. The runtime behavior, file contents, and verification gates are all clean.

**Out-of-scope discovery:** No deferred items raised. Pre-existing baseline lint debt (103 errors / 1584 warnings in `queries.ts`, auth forms) untouched per STATE.md tech-debt phase plan.

## Verification Evidence

- **TypeScript:** `cd web && npx tsc --noEmit` — 0 errors. The three consumer errors that surfaced after Task 2 (`Property 'success' does not exist on { success: true } | { error: string }`) were resolved by Task 3's discriminant-based narrowing.
- **Lint (touched files):** `npx eslint src/lib/auth/ "src/app/(dashboard)/dashboard/automations/[id]/" src/components/dashboard/automation-detail-header.tsx` — 0 errors, 0 warnings.
- **Lint (whole repo):** Same baseline as STATE.md (103 errors / 1584 warnings in unrelated files). Zero new errors introduced.
- **Build:** `npm run build` — `✓ Compiled successfully in 5.0s`, all 19 routes generated, 0 type errors. `/dashboard/automations/[id]` route present.
- **Manual cross-org test:** Not executed in this session (executor scope ends at automated verification). Recommended manual UAT in `14-VERIFICATION.md` per `<verification>` block of plan.

## User Setup Required

None — no external service configuration required. The hardening uses already-configured `SUPABASE_SERVICE_ROLE_KEY` (already in `.env.local`).

## Next Phase Readiness

- Plan 14-02 (i18n hygiene) executes in parallel — its commits are interleaved in this branch (`5266937`, `8af73e1`, plus the misattributed `99900e7`). Coordinate phase verification at the wave-1 boundary.
- `assertOrgMembership` is now available as `import { assertOrgMembership } from '@/lib/auth/assert-org-membership'` for any future server action that mutates org-scoped resources (e.g., `automations`, `automation_requests`, `automation_executions` writes — should they ever be wired through Next).
- AUTO-06 (org ownership check) closed. AUTO-04 (i18n on permission error) partially closed by 14-01 — Spanish localization side; broader i18n hygiene continues in 14-02.
- Recommended manual UAT before phase verifier:
  1. Sign in as Org A user, attempt pause/resume on Org B automation via direct URL → red toast in current locale, no DB write, server logs both `[assertOrgMembership]` and `[updateAutomationStatus]` access-denied lines.
  2. Same-org owner action → green toast, status persists in DB.

---
*Phase: 14-i18n-security-hygiene*
*Completed: 2026-04-30*

## Self-Check: PASSED

All 6 expected artifacts present on disk:
- web/src/lib/auth/assert-org-membership.ts (NEW)
- web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts (modified)
- web/src/components/dashboard/automation-detail-header.tsx (modified)
- web/messages/en.json (modified)
- web/messages/es.json (modified)
- .planning/phases/14-i18n-security-hygiene/14-01-SUMMARY.md (this file)

All 3 task commits present in git log:
- 38a21ae feat(14-01): create assertOrgMembership server-action helper
- 8be3a39 feat(14-01): harden updateAutomationStatus with org gate + admin-client write
- 649b0e9 feat(14-01): localize permission-error toast on automation detail header
