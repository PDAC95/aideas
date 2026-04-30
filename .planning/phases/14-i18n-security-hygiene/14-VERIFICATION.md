---
phase: 14-i18n-security-hygiene
verified: 2026-04-30T20:15:00Z
status: passed
score: 10/10 must-haves verified
plans_verified: [14-01, 14-02]
requirements_verified: [AUTO-04, AUTO-06, NOTF-02, I18N-01]
---

# Phase 14: i18n & Security Hygiene Verification Report

**Phase Goal:** Defense-in-depth on automation lifecycle action; full i18n coverage on user-visible time strings (close audit gaps MEDIUM-1, LOW-1, NEW-LOW-1).
**Verified:** 2026-04-30T20:15:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Plan 14-01: Security)

| #   | Truth                                                                                                         | Status     | Evidence                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | User of Org A cannot mutate an automation belonging to Org B; receives a generic, localized permission-error toast | VERIFIED   | `actions.ts:22-48` performs pre-flight org read + `assertOrgMembership` gate; both return `{ error: "forbidden" }` |
| 2   | Viewers in Org A cannot pause/resume/cancel; only owner/admin/operator roles succeed                          | VERIFIED   | `actions.ts:40` passes role allowlist `["owner","admin","operator"]`; `assert-org-membership.ts:41` rejects others |
| 3   | Backend logs a structured `console.error` line with userId, attemptedOrgId, and automationId on every rejection | VERIFIED   | `assert-org-membership.ts:42-45` logs userId+attemptedOrgId; `actions.ts:43-46` logs automationId+attemptedOrgId |
| 4   | Permission-error toast is rendered in Spanish when the locale is Spanish (no English fallback)                | VERIFIED   | `es.json:299` has `"No tienes permiso para realizar esta acción"`; threaded through `headerTranslations` prop   |
| 5   | `updateAutomationStatus` actually succeeds for an authorized owner/admin/operator (admin-client write path is wired) | VERIFIED   | `actions.ts:51-55` instantiates admin client with `SUPABASE_SERVICE_ROLE_KEY` and performs `.update()`           |

### Observable Truths (Plan 14-02: i18n)

| #   | Truth                                                                                                                          | Status     | Evidence                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 6   | Switching the locale to Spanish renders notification bell timestamps as `ahora` / `5m` / `2h` / `3d` (no `now` leaking)        | VERIFIED   | `notification-bell.tsx:60,137` uses `useTranslations("common")` + shared helper; `es.json:475` = `"ahora"`         |
| 7   | Switching the locale to Spanish renders automation detail timeline timestamps as `ahora` / `5m` / `2h` / `3d` (no `Just now`)  | VERIFIED   | `page.tsx:56,73` uses `getTranslations("common")` + shared helper; old `buildTimeAgo` removed from this file       |
| 8   | English locale renders `now` / `5m` / `2h` / `3d` for both surfaces — no regression                                            | VERIFIED   | `en.json:475-478` = `"now"`/`"m"`/`"h"`/`"d"`; same helper consumes both                                          |
| 9   | Both bell (client) and detail page (server) consume the same `formatRelativeTime` helper from `@/lib/utils/time`               | VERIFIED   | Single source: both files import from `@/lib/utils/time`; `time.ts:16` is sole export                              |
| 10  | Compact visual style preserved (`5m`, not `5 minutes` — number prepended in code, not via ICU)                                 | VERIFIED   | `time.ts:21-23` uses `${Math.floor(seconds/60)}${t("timeAgo.minutes")}`; no ICU plural                             |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact                                                                | Expected                                                       | Status     | Details                                                                              |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| `web/src/lib/auth/assert-org-membership.ts`                             | Reusable membership-and-role gate                              | VERIFIED   | 50 LOC. Exports `assertOrgMembership`. Used by `actions.ts:6,37`                     |
| `web/src/app/(dashboard)/dashboard/automations/[id]/actions.ts`         | Hardened with org gate + admin-client write                    | VERIFIED   | 64 LOC. Three-step gate (read → assert → admin write). Returns discriminated union   |
| `web/src/components/dashboard/automation-detail-header.tsx`             | Localized red toast on permission failure                      | VERIFIED   | Typed toast `{type, message}`; `bg-red-600` for errors, `bg-green-600` for success    |
| `web/messages/en.json` `dashboard.automations.actions.permissionError`  | EN permission-error string                                     | VERIFIED   | `en.json:299` = `"You don't have permission to perform this action"`                 |
| `web/messages/es.json` `dashboard.automations.actions.permissionError`  | ES permission-error string with diacritic                      | VERIFIED   | `es.json:299` = `"No tienes permiso para realizar esta acción"` (correct accent)     |
| `web/src/lib/utils/time.ts`                                             | Shared formatRelativeTime helper (client+server)               | VERIFIED   | 24 LOC. Exports `formatRelativeTime(date, t)`. Structural `TimeT` type, no ICU       |
| `web/messages/en.json` `common.timeAgo.{now,minutes,hours,days}`        | Compact EN keys                                                | VERIFIED   | `en.json:474-479` = `now`/`m`/`h`/`d`                                                |
| `web/messages/es.json` `common.timeAgo.{now,minutes,hours,days}`        | Compact ES keys                                                | VERIFIED   | `es.json:474-479` = `ahora`/`m`/`h`/`d` (m/h/d intentionally identical to EN)        |
| `web/src/components/dashboard/notification-bell.tsx`                    | Bell consumes shared helper via `useTranslations("common")`    | VERIFIED   | `:6` imports `useTranslations`, `:8` imports helper, `:60` hooks, `:137` calls       |
| `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx`           | Detail page consumes shared helper via `getTranslations("common")` | VERIFIED   | `:7` imports helper, `:56` hooks `tCommon`, `:73` calls; `buildTimeAgo` removed; `permissionError` threaded `:109` |

### Key Link Verification

| From                                | To                                            | Via                                               | Status   | Details                                                                         |
| ----------------------------------- | --------------------------------------------- | ------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `actions.ts`                        | `assert-org-membership.ts`                    | `import { assertOrgMembership } from "@/lib/auth/assert-org-membership"` | WIRED    | Line 6 import; line 37-41 call with role allowlist `["owner","admin","operator"]` |
| `actions.ts`                        | `@supabase/supabase-js admin client`          | `createAdminClient` with `SUPABASE_SERVICE_ROLE_KEY` | WIRED    | Line 11: `process.env.SUPABASE_SERVICE_ROLE_KEY!`; line 51: `getAdminClient()` invoked |
| `automation-detail-header.tsx`      | `translations.permissionError`                | `setToast({ type: "error", message: translations.permissionError })` | WIRED    | Lines 85, 98, 110 (all 3 error branches: pause/resume/cancel)                   |
| `automations/[id]/page.tsx`         | `headerTranslations.permissionError`          | `permissionError: t("actions.permissionError")`   | WIRED    | Line 109 — passed via `headerTranslations` prop into `<AutomationDetailHeader>` |
| `notification-bell.tsx`             | `web/src/lib/utils/time.ts`                   | `import { formatRelativeTime } from "@/lib/utils/time"` | WIRED    | Line 8 import; line 137: `formatRelativeTime(notification.created_at, tCommon)` |
| `automations/[id]/page.tsx`         | `web/src/lib/utils/time.ts`                   | `import { formatRelativeTime } from "@/lib/utils/time"` | WIRED    | Line 7 import; line 73: `formatRelativeTime(exec.started_at, tCommon)`           |
| `notification-bell.tsx`             | `next-intl useTranslations("common")`         | `useTranslations` hook                            | WIRED    | Line 6 import; line 60: `const tCommon = useTranslations("common")`              |
| `automations/[id]/page.tsx`         | `next-intl getTranslations("common")`         | `await getTranslations` call                      | WIRED    | Line 4 import; line 56: `const tCommon = await getTranslations("common")`        |

All 8 key links verified WIRED.

### Requirements Coverage

| Requirement | Source Plan(s) | Description                                                  | Status    | Evidence                                                                                                 |
| ----------- | -------------- | ------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------- |
| AUTO-04     | 14-01, 14-02   | User sees activity timeline of last 20 executions in detail view (audit closure: localized timestamps) | SATISFIED | `automations/[id]/page.tsx:73` uses shared `formatRelativeTime` with `tCommon` for all 4 buckets; `Just now` literal removed |
| AUTO-06     | 14-01          | User sees pause/resume/cancel buttons (audit closure: org ownership check)                              | SATISFIED | `actions.ts` enforces `assertOrgMembership(["owner","admin","operator"])` + admin-client write           |
| NOTF-02     | 14-02          | User can open dropdown with last 20 notifications with timestamps (audit closure: localized timestamps) | SATISFIED | `notification-bell.tsx:60,137` consumes `useTranslations("common")` + shared helper; ES locale renders `ahora` |
| I18N-01     | 14-02          | All new dashboard UI text available in both EN and ES (audit closure: time strings)                     | SATISFIED | `en.json:474-479` and `es.json:474-479` both have `common.timeAgo.{now,minutes,hours,days}` with locked translations |

No orphaned requirements — all 4 IDs from ROADMAP.md (`AUTO-04, AUTO-06, NOTF-02, I18N-01`) appear in plan frontmatter and are SATISFIED.

### Anti-Patterns Found

None in phase 14 files. All scanned files (`assert-org-membership.ts`, `time.ts`, `actions.ts`, `automation-detail-header.tsx`, `notification-bell.tsx`, `automations/[id]/page.tsx`) are clean of `TODO`, `FIXME`, `XXX`, `HACK`, `PLACEHOLDER`, `console.log`, and stub-style return values.

**Pre-existing baseline lint debt** (103 errors / 1584 warnings) is documented in STATE.md and lives entirely in `lib/dashboard/queries.ts` and auth forms — zero new lint issues introduced by phase 14.

### Out-of-Scope Confirmations

The following remained intact as expected per `14-CONTEXT.md` "Out of scope":

- `web/src/app/(dashboard)/dashboard/page.tsx` still has its own `buildTimeAgo` (line 14) using `dashboard.home.timeAgo.*` keys for the activity feed. Phase 14 explicitly excludes this surface — Phase 15 territory.
- Existing `dashboard.home.timeAgo.*` long-form keys (`"{count}m ago"` / `"Hace {count}m"`) preserved untouched in both message files.
- `notification-bell.tsx` translations prop interface unchanged — only `formatRelativeTime` migrated; other strings deferred per CONTEXT.md guardrail.

### Build & Type Verification

- **TypeScript:** `npx tsc --noEmit` — 0 errors
- **Lint (whole repo):** 103 errors / 1584 warnings — same baseline as STATE.md, zero in phase 14 files
- **Lint (phase 14 files only):** 0 errors, 0 warnings (verified by filtering on touched paths)

### Commit History Note

Per user-provided context, two commits have misattributed messages but correct content on disk:

- **`99900e7`** — message says `feat(14-01): add assertOrgMembership helper` but diff is the `common.timeAgo` i18n keys for 14-02. Verified: keys exist on disk at `en.json:474-479` and `es.json:474-479`.
- **`8af73e1`** — message says `refactor(14-02): migrate notification-bell and automation detail` but also contains the single-line `permissionError: t("actions.permissionError")` addition for 14-01. Verified: line exists at `page.tsx:109`.

Both incidents are commit-history-only; runtime behavior, file contents, and verification gates are clean. Verification was performed against file contents per user instruction, not commit messages.

### Human Verification Required

While automated verification confirms all artifacts exist, are substantive, and are wired correctly, the following live behaviors warrant a human UAT pass before declaring the audit gaps closed in production:

1. **Cross-org permission test (security)**
   - **Test:** Sign in as Org A user. Navigate directly to `/dashboard/automations/{Org-B-automation-id}`. Click Pause/Resume/Cancel.
   - **Expected:** Red toast (`bg-red-600`) renders with the localized message ("You don't have permission to perform this action" / "No tienes permiso para realizar esta acción"). DB row unchanged. Server console logs both `[assertOrgMembership] access denied {userId, attemptedOrgId}` and `[updateAutomationStatus] access denied {automationId, attemptedOrgId}`.
   - **Why human:** RLS policies + admin-client write path interaction must be observed end-to-end against a real Supabase instance.

2. **Same-org happy-path test (security)**
   - **Test:** As Org A owner/admin/operator, click Pause on an Org A active automation.
   - **Expected:** Green toast (`bg-green-600`), optimistic status flips to paused, persists in DB after revalidation. Confirms admin-client write path works.
   - **Why human:** Verifies the dual-client pattern (anon read + admin write) actually persists state.

3. **Viewer-rejection test (security)**
   - **Test:** Temporarily UPDATE `organization_members.role = 'viewer'` for the test user. Click Pause.
   - **Expected:** Red permission-error toast. Revert role afterwards.
   - **Why human:** Requires DB role manipulation that automated checks can't simulate.

4. **Spanish locale i18n test**
   - **Test:** Settings → Preferences → Language → Español. Save. Open notification bell + visit `/dashboard/automations/{any-active-id}`.
   - **Expected:** Bell timestamps render `ahora` / `5m` / `2h` / `3d`. Detail timeline renders the same compact Spanish format. No `now` or `Just now` leaks anywhere.
   - **Why human:** Visual verification of locale switch + cookie-based next-intl resolution.

5. **English locale regression test**
   - **Test:** Switch back to English. Repeat bell + detail view inspection.
   - **Expected:** `now` / `5m` / `2h` / `3d` everywhere. No `Just now` literal.
   - **Why human:** Confirms no regression in the previously-working EN path.

### Gaps Summary

No gaps. All 10 observable truths verified. All 10 artifacts pass existence + substantive + wired checks. All 8 key links verified WIRED. All 4 requirement IDs (AUTO-04, AUTO-06, NOTF-02, I18N-01) SATISFIED with concrete code evidence. Build and TypeScript clean; lint baseline preserved.

Phase 14 closes audit findings MEDIUM-1, LOW-1, and NEW-LOW-1 as specified in ROADMAP.md. Ready for human UAT and phase commit.

---

_Verified: 2026-04-30T20:15:00Z_
_Verifier: Claude (gsd-verifier)_
