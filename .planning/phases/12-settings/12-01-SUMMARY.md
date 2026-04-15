---
phase: 12-settings
plan: 01
subsystem: database
tags: [supabase, storage, zod, server-actions, i18n, typescript]

# Dependency graph
requires:
  - phase: 11-reports-billing
    provides: fetchOrgHourlyCost pattern and settings JSONB column in organizations

provides:
  - Avatars storage bucket with user-scoped RLS policies
  - Zod validation schemas for all settings forms (profile, hourly cost, password change)
  - Server actions for all settings mutations (saveProfileName, saveCompanyName, saveAvatarUrl, saveHourlyCost, switchLocale, changePassword)
  - fetchSettingsData query function returning profile + org + role in parallel
  - SettingsProfileData and SettingsOrgData TypeScript types
  - dashboard.settings i18n namespace in en.json and es.json

affects: [12-02-settings-ui, 12-03-settings-security]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Zod v4 uses .issues[] not .errors[] for ZodError access"
    - "Service role client (getAdminClient) pattern used for org writes — no authenticated UPDATE policy on organizations"
    - "switchLocale sets NEXT_LOCALE cookie with httpOnly:false so client JS can read it"

key-files:
  created:
    - supabase/migrations/20260415000001_avatars_storage.sql
    - web/src/lib/validations/settings.ts
    - web/src/lib/actions/settings.ts
  modified:
    - web/src/lib/dashboard/types.ts
    - web/src/lib/dashboard/queries.ts
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "Zod v4 .issues[] — ZodError in v4 uses .issues property, not .errors; auto-fixed during Task 2"
  - "serviceRole for org writes — organizations table has no authenticated UPDATE policy; saveCompanyName and saveHourlyCost use getAdminClient() pattern from auth.ts"
  - "switchLocale uses httpOnly:false cookie — NEXT_LOCALE must be readable by next-intl client-side; consistent with existing locale handling"

patterns-established:
  - "Role check before service_role write: always query organization_members first, verify owner/admin before using admin client"
  - "Parallel settings fetch: profile + org + member queries via Promise.all in fetchSettingsData"

requirements-completed: [SETT-01, SETT-02, SETT-03, SETT-04, SETT-05, SETT-06]

# Metrics
duration: 3min
completed: 2026-04-15
---

# Phase 12, Plan 01: Settings Foundation Summary

**Avatars storage bucket with RLS, 6 server actions (profile/avatar/cost/locale/password), Zod schemas, and i18n keys for EN/ES settings page**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-15T18:28:38Z
- **Completed:** 2026-04-15T18:31:34Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Avatars storage bucket created with 4 RLS policies (authenticated users can manage own files, public read for all)
- Three Zod schemas (profileSchema, hourlyCostSchema, changePasswordSchema) with inferred TypeScript types
- Six server actions with auth checks, Zod validation, and `{ success: true } | { error: string }` returns
- fetchSettingsData query function fetches profile + org + role in parallel with Promise.all
- SettingsProfileData and SettingsOrgData types added to types.ts
- Complete dashboard.settings i18n namespace in both en.json and es.json (profile, preferences, security cards)

## Task Commits

Each task was committed atomically:

1. **Task 1: Storage migration, Zod schemas, types, and i18n keys** - `f8e4b86` (feat)
2. **Task 2: Server actions and query functions** - `6cdaede` (feat)

## Files Created/Modified

- `supabase/migrations/20260415000001_avatars_storage.sql` - Avatars bucket + 4 RLS policies
- `web/src/lib/validations/settings.ts` - profileSchema, hourlyCostSchema, changePasswordSchema
- `web/src/lib/actions/settings.ts` - 6 server actions for all settings mutations
- `web/src/lib/dashboard/types.ts` - Added SettingsProfileData and SettingsOrgData
- `web/src/lib/dashboard/queries.ts` - Added fetchSettingsData
- `web/messages/en.json` - Added dashboard.settings namespace
- `web/messages/es.json` - Added dashboard.settings namespace

## Decisions Made

- **Zod v4 .issues[]**: ZodError in Zod v4 exposes validation errors via `.issues` property, not `.errors`. Auto-fixed during Task 2 when TypeScript reported the type error.
- **serviceRole for org writes**: Organizations table has no authenticated UPDATE RLS policy. saveCompanyName and saveHourlyCost use the getAdminClient() pattern from auth.ts to write org data.
- **switchLocale httpOnly:false**: NEXT_LOCALE cookie must be readable by client-side next-intl. Setting httpOnly to false is required for locale switching to work in the browser.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 .errors -> .issues property**
- **Found during:** Task 2 (server actions)
- **Issue:** Plan specified `parsed.error.errors[0]?.message` but Zod v4 uses `.issues`, not `.errors`. TypeScript compilation failed with TS2339 on 3 occurrences.
- **Fix:** Replaced all `parsed.error.errors[0]?.message` with `parsed.error.issues[0]?.message`
- **Files modified:** `web/src/lib/actions/settings.ts`
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `6cdaede` (Task 2 commit)

**2. [Rule 1 - Bug] Removed Zod v4 invalid_type_error option**
- **Found during:** Task 1 (Zod schemas)
- **Issue:** `z.number({ invalid_type_error: '...' })` is not a valid option in Zod v4. TypeScript reported TS2353.
- **Fix:** Removed the `invalid_type_error` option from the `hourlyCostSchema`
- **Files modified:** `web/src/lib/validations/settings.ts`
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `f8e4b86` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Zod v4 API differences)
**Impact on plan:** Both fixes were minor API corrections for Zod v4 compatibility. No scope creep.

## Issues Encountered

None beyond the Zod v4 API differences noted above.

## User Setup Required

None - no external service configuration required. The Supabase storage bucket migration will be applied automatically when the database is reset or when running `supabase db push`.

## Next Phase Readiness

- All server actions are ready for the Settings UI components (Plans 02 and 03)
- fetchSettingsData is ready for the Settings page RSC to call
- i18n keys are in place for all three settings cards
- Types (SettingsProfileData, SettingsOrgData) define the data contracts for UI components

---
*Phase: 12-settings*
*Completed: 2026-04-15*
