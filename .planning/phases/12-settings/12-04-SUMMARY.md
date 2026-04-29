---
phase: 12-settings
plan: 04
subsystem: dashboard-ui
tags: [next-cache, revalidate-path, supabase-auth, server-actions, rls, profiles, organizations]

# Dependency graph
requires:
  - phase: 12-settings
    plan: 01
    provides: saveProfileName, saveCompanyName, saveAvatarUrl, saveHourlyCost server actions and Zod schemas
  - phase: 12-settings
    plan: 02
    provides: Settings page RSC, Profile card, Preferences card forms that consume the server actions
  - phase: 08-dashboard-home-notifications
    plan: 03
    provides: DashboardHeader server component (rendered by dashboard layout) that shows the user's name and avatar initial

provides:
  - Cache-invalidating server actions via `revalidatePath` after every successful settings write
  - Auth metadata sync (`supabase.auth.updateUser`) so the header reflects name changes immediately
  - Dashboard header that reads `first_name` from the `profiles` table as source of truth (with auth metadata fallback)
  - Verified row-count writes for admin-client updates (organizations name + settings JSONB)
  - Resolution of UAT gaps for tests 2, 3, 4, 5, and 7 (avatar upload/remove, name save header sync, company name persistence, hourly cost persistence + toast)

affects: [12-VERIFICATION (UAT re-run), future settings tweaks, anyone consuming saveProfileName / saveCompanyName / saveAvatarUrl / saveHourlyCost]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "revalidatePath('/dashboard', 'layout') after writes that affect any layout-rendered data (header, sidebar)"
    - "revalidatePath('/dashboard/settings') after writes scoped to the Settings page only"
    - "Sync auth user_metadata alongside profiles row updates so RSCs reading auth.user have fresh data"
    - "Admin-client updates use .select('id') + length check to verify rows actually changed (RLS / wrong-id detection)"
    - "Header components query the profiles table for canonical user fields, falling back to auth metadata"

key-files:
  created: []
  modified:
    - web/src/lib/actions/settings.ts
    - web/src/components/dashboard/dashboard-header.tsx
    - web/src/components/dashboard/settings-preferences-card.tsx

key-decisions:
  - "revalidatePath scope split — '/dashboard' layout for header-affecting writes (avatar, name); '/dashboard/settings' page for org-only writes (company name, hourly cost)"
  - "Sync auth.updateUser inside saveProfileName so user_metadata.first_name stays consistent with profiles.first_name; header keeps a metadata fallback for resilience"
  - "Profiles query in dashboard-header.tsx uses .single() — header is org-scoped and the profile row is guaranteed by handle_new_user trigger"
  - "Inline hourly-cost validation replaced Zod resolver in the form — silent resolver failure on hidden orgId field was swallowing toast and submission (Plan 12-04 follow-up commit)"
  - "Admin-client updates now select('id') and assert length > 0 to surface RLS/zero-row writes as errors instead of false success"

patterns-established:
  - "Cache invalidation pattern: every server action that mutates DB rows used by SSR must call revalidatePath before returning success"
  - "Source-of-truth pattern: profile fields rendered in dashboard chrome (header/sidebar) read from profiles table, not auth metadata"
  - "Write verification pattern: admin-client updates always select a column and check returned row count"

requirements-completed: [SETT-01, SETT-02, SETT-04]

# Metrics
duration: ~106min
completed: 2026-04-16
---

# Phase 12 Plan 04: Settings Persistence Gap Closure Summary

**revalidatePath added to every settings server action, auth metadata synced on name save, and the dashboard header rewired to read names from the profiles table — closing 5 UAT failures around save-then-refresh persistence**

## Performance

- **Duration:** ~106 min (across two related fix commits + later supporting fix)
- **Started:** 2026-04-16T09:33:22-04:00 (commit `9015053`)
- **Completed:** 2026-04-16T11:19:26-04:00 (commit `333fa40`)
- **Tasks:** 2 plan tasks (settings.ts changes + dashboard-header.tsx rewrite) plus follow-up persistence verification fix
- **Files modified:** 3 (`settings.ts`, `dashboard-header.tsx`, `settings-preferences-card.tsx`)

## Accomplishments

- `saveProfileName` now syncs auth `user_metadata` (`first_name`, `last_name`, `full_name`) and calls `revalidatePath('/dashboard', 'layout')` so the header user menu reflects new names immediately on refresh.
- `saveCompanyName` now performs `.select('id')` after admin-client update, verifies a row changed, and calls `revalidatePath('/dashboard/settings')` — fixing silent RLS / wrong-org writes.
- `saveAvatarUrl` invalidates the dashboard layout so the profile avatar in the header (and any layout consumer) refreshes after upload / remove.
- `saveHourlyCost` verifies row count, invalidates the settings page cache, and uses inline numeric validation (replacing the Zod resolver path that was silently failing on the hidden `orgId` field, blocking the success toast).
- Dashboard header (`dashboard-header.tsx`) now queries the `profiles` table for `first_name` and `avatar_url` and uses auth metadata only as a defensive fallback. Header was also restyled with the dashboard's purple accent header pattern (search bar, Create Agent CTA, notification + inbox pill, UserMenu component).

## Task Commits

1. **Task 1+2: Add revalidatePath, auth metadata sync, and profile-table-driven header** — `9015053` (`fix(12): add revalidatePath to all settings server actions and sync auth metadata`)
   - Adds `import { revalidatePath } from 'next/cache'`
   - Adds `supabase.auth.updateUser` in `saveProfileName`
   - Adds `revalidatePath('/dashboard', 'layout')` to `saveProfileName` and `saveAvatarUrl`
   - Adds `revalidatePath('/dashboard/settings')` to `saveCompanyName` and `saveHourlyCost`
   - Rewrites `dashboard-header.tsx` to query profiles and render the new purple-accent header

2. **Follow-up: Persistence verification + form fix for company name and hourly cost** — `333fa40` (`fix(12): fix company name and hourly cost persistence`)
   - `.select('id')` + zero-row assertion on admin-client updates in `saveCompanyName` and `saveHourlyCost`
   - Inline numeric validation (`typeof === 'number' && 0 ≤ x ≤ 10000`) in `saveHourlyCost`, removing the Zod resolver path that was blocking the form silently
   - `settings-preferences-card.tsx` simplified to pass `orgId` directly into the action instead of through a hidden form field

**Plan metadata:** _this commit_ (`docs(12-04): complete settings persistence gap closure plan`)

_Note: Code was already committed before SUMMARY.md was authored. This summary documents the as-shipped behavior matching the plan's success criteria._

## Files Created/Modified

- `web/src/lib/actions/settings.ts` — Added `revalidatePath` import; added `supabase.auth.updateUser` sync inside `saveProfileName`; added `revalidatePath` calls to all four mutation actions; added `.select('id')` + zero-row guard for admin-client updates; replaced Zod resolver path in `saveHourlyCost` with inline numeric validation.
- `web/src/components/dashboard/dashboard-header.tsx` — Now an async server component that queries the `profiles` table for `first_name` and `avatar_url`, with auth metadata fallback; restyled with search bar, Create Agent CTA, NotificationBell + Inbox pill, and `UserMenu` component for displayName/avatarInitial.
- `web/src/components/dashboard/settings-preferences-card.tsx` — `orgId` now passed directly to `saveHourlyCost`; removed hidden form field path that was silently failing Zod validation.

## Decisions Made

- **revalidatePath scope split:** `/dashboard` layout for changes that affect header/sidebar (avatar, name); `/dashboard/settings` page for org-only writes (company name, hourly cost). Layout invalidation is more expensive — used only when needed.
- **Keep auth metadata fallback in header:** Even after `saveProfileName` syncs `user_metadata`, the header retains `(user.user_metadata?.first_name as string) || ""` as a fallback so prior accounts with metadata-only data still render correctly until they next save.
- **Inline numeric validation for hourly cost:** The Zod resolver path on the client form was silently failing on a hidden `orgId` field, swallowing the success toast. Replaced with explicit `typeof === 'number' && 0 ≤ x ≤ 10000` in the server action so behavior is deterministic and the form can pass the value directly.
- **Verify writes after admin-client updates:** Admin client bypasses RLS, but a wrong `orgId` (or a `.eq('id', orgId)` mismatch) silently returned `error: null` with zero rows. `.select('id')` + length check converts that into a real error.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Admin-client updates silently succeeding on zero rows**
- **Found during:** Test verification of company name + hourly cost saves (UAT tests 5 and 7 still failing after initial revalidatePath fix)
- **Issue:** `admin.from('organizations').update(...).eq('id', orgId)` returned `{ error: null }` even when zero rows matched, so the action returned `success: true` while nothing persisted.
- **Fix:** Added `.select('id')` to both updates and `if (!data || data.length === 0) return { error: '...' }` guard.
- **Files modified:** `web/src/lib/actions/settings.ts`
- **Verification:** Manual UAT re-run — company name and hourly cost now persist on refresh.
- **Committed in:** `333fa40`

**2. [Rule 1 - Bug] Hourly cost form silently failing Zod validation**
- **Found during:** Same UAT re-run (test 7: "doy save no sale ningun mensaje de exito")
- **Issue:** `hourlyCostSchema` required `orgId` UUID via a hidden form field; the resolver rejected silently, the success branch never ran, and no toast appeared.
- **Fix:** Removed `hourlyCostSchema` import and replaced with inline numeric validation in `saveHourlyCost`. `settings-preferences-card.tsx` passes `orgId` directly to the server action instead of through the form.
- **Files modified:** `web/src/lib/actions/settings.ts`, `web/src/components/dashboard/settings-preferences-card.tsx`
- **Verification:** Toast now appears on save; value persists on refresh.
- **Committed in:** `333fa40`

**3. [Rule 1 - Bug] Header style drift carried alongside profile-source rewrite**
- **Found during:** Task 2 (header rewrite for profiles-table source of truth)
- **Issue:** The original header was `fixed top-0 right-0 left-64 ... border-b ... z-30` with a single colored circle for the avatar — inconsistent with the rest of the dashboard's purple-accent design. Touching the file for the source-of-truth fix created an opportunity to bring it in line.
- **Fix:** Rewrote header to use search bar, Create Agent CTA, notification + inbox pill, and `UserMenu` component matching the dashboard chrome.
- **Files modified:** `web/src/components/dashboard/dashboard-header.tsx`
- **Verification:** Visual inspection on dashboard, manual UAT.
- **Committed in:** `9015053`

---

**Total deviations:** 3 auto-fixed (3 × Rule 1 bugs)
**Impact on plan:** All three were necessary for the plan's success criteria to actually hold (correctness of writes, reliability of toast, visible name in header). No scope creep.

## Issues Encountered

- **Pre-existing build failure (out of scope):** `npm run build` fails in `web/src/app/(dashboard)/dashboard/automations/[id]/page.tsx` because Next.js 16 / Turbopack disallows `next/dynamic { ssr: false }` in Server Components. This file was authored in Phase 9 and is unrelated to plan 12-04. Logged to `deferred-items.md` for a future plan/quick task. Plan 12-04's two modified files compile cleanly under `tsc --noEmit`.

## User Setup Required

None — no external service configuration required. Plan only modified existing server actions and a server component.

## Next Phase Readiness

- Plan 12-05 (the remaining gap-closure plan in this phase) and the broader Phase 12 verification re-run are unblocked.
- The deferred Next.js 16 dynamic-import build issue must be resolved before any production deploy of v1.1, but does not block further development against the dev server.

## Self-Check: PASSED

- `web/src/lib/actions/settings.ts` exists and contains `revalidatePath` (4 call sites) plus `supabase.auth.updateUser` in `saveProfileName` — verified by reading the file.
- `web/src/components/dashboard/dashboard-header.tsx` exists and queries `from('profiles').select('first_name, avatar_url')` — verified by reading the file.
- Commits `9015053` and `333fa40` exist in `git log` — verified.
- TypeScript compilation (`npx tsc --noEmit`) returns zero errors — verified.
- Build failure is in a Phase 9 file, not Phase 12 / Plan 12-04 scope — documented in `deferred-items.md`.

---
*Phase: 12-settings*
*Completed: 2026-04-16*
