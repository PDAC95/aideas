---
phase: 12-settings
plan: 02
subsystem: frontend
tags: [react, supabase-storage, react-hook-form, zod, i18n, typescript, settings-ui]

# Dependency graph
requires:
  - phase: 12-01
    provides: Server actions, Zod schemas, fetchSettingsData query, SettingsProfileData/SettingsOrgData types, i18n keys

provides:
  - Settings page RSC shell with parallel data fetch and translated props
  - SettingsProfileCard with avatar upload/remove, name editing, company name, email read-only
  - SettingsPreferencesCard with language switch (instant) and hourly cost (save button)

affects: [12-03-settings-security]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ProfileFormValues shadow type pattern — Zod optional+default creates type mismatch with useForm; define explicit form type { firstName: string; lastName: string } and cast resolver"
    - "Avatar cache-bust via ?v=Date.now() appended to Storage public URL"
    - "readLocaleCookie() reads NEXT_LOCALE from document.cookie on mount to initialize language select"
    - "radix-ui re-exports AlertDialog — import { AlertDialog } from 'radix-ui', not 'radix-ui/react-alert-dialog'"

key-files:
  created:
    - web/src/app/(dashboard)/dashboard/settings/page.tsx
    - web/src/components/dashboard/settings-profile-card.tsx
    - web/src/components/dashboard/settings-preferences-card.tsx
  modified: []

key-decisions:
  - "ProfileFormValues explicit type — Zod optional().default('') produces lastName?: string | undefined in inferred type; useForm generic requires non-optional fields; explicit form type avoids resolver type mismatch"
  - "isOAuthOnly commented-out in settings page — will be used by SettingsSecurityCard in Plan 03; keeping comment as marker"
  - "Company name inside Profile card (not Preferences) — closer to org identity data; consistent with plan spec"

patterns-established:
  - "Resolver cast pattern: zodResolver(schema) as Resolver<ExplicitFormValues> when Zod schema has optional+default fields"
  - "Avatar upload: browser-side createClient() Storage.upload() then saveAvatarUrl() server action to persist URL"

requirements-completed: [SETT-01, SETT-02, SETT-03, SETT-04]

# Metrics
duration: 4min
completed: 2026-04-15
---

# Phase 12, Plan 02: Settings UI Summary

**Settings page RSC + Profile card (avatar upload, name/company editing) + Preferences card (language switch, hourly cost)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-15T20:34:22Z
- **Completed:** 2026-04-15T20:38:09Z
- **Tasks:** 2
- **Files created:** 3

## Accomplishments

- Settings page RSC fetches data in parallel (fetchSettingsData + getTranslations) and passes translated props to each card
- SettingsProfileCard: avatar upload with instant preview, 2MB validation, remove button, initials fallback, react-hook-form + Zod name editing, company name field (disabled for non-admin), email read-only with help text, toast feedback
- SettingsPreferencesCard: language dropdown reads NEXT_LOCALE cookie on mount, calls switchLocale + router.refresh() on change, hourly cost input with $ prefix, save button for owner/admin only, toast feedback
- Security card placeholder rendered (Plan 03 already delivered it separately)
- TypeScript compiles without errors (`npx tsc --noEmit` clean)
- No ESLint errors

## Task Commits

1. **Task 1: Settings page RSC + Profile card** - `524e6fb` (feat)
2. **Task 2: Preferences card** - `1a582b5` (feat)

## Files Created

- `web/src/app/(dashboard)/dashboard/settings/page.tsx` — Settings page RSC shell, 87 lines
- `web/src/components/dashboard/settings-profile-card.tsx` — Profile card with avatar/name/company, 285 lines
- `web/src/components/dashboard/settings-preferences-card.tsx` — Preferences card with language/hourly cost, 200 lines

## Decisions Made

- **ProfileFormValues explicit type**: Zod's `optional().default('')` produces `lastName?: string | undefined` in the inferred type, causing a type mismatch with react-hook-form. Explicit `ProfileFormValues = { firstName: string; lastName: string }` type with resolver cast resolves this without changing the schema.
- **isOAuthOnly commented-out**: The variable was detected as unused by ESLint since the security card placeholder doesn't accept it. Left as a comment marker so Plan 03 can restore it when wiring SettingsSecurityCard.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod optional+default type mismatch with react-hook-form**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `useForm<ProfileFormData>` with `zodResolver(profileSchema)` failed — `ProfileFormData` infers `lastName?: string | undefined` from `.optional().default('')`, but `useForm` resolver expects concrete types. TypeScript TS2322 error.
- **Fix:** Defined explicit `ProfileFormValues = { firstName: string; lastName: string }` type and cast the resolver: `zodResolver(profileSchema) as Resolver<ProfileFormValues>`.
- **Files modified:** `web/src/components/dashboard/settings-profile-card.tsx`
- **Verification:** `npx tsc --noEmit` passes with no errors

**2. [Rule 1 - Bug] Fixed settings-security-card.tsx import from radix-ui/react-alert-dialog**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** `settings-security-card.tsx` (created in a prior session) used `import * as AlertDialog from 'radix-ui/react-alert-dialog'` — this subpath doesn't exist. Package `radix-ui` re-exports AlertDialog as a named export from the root.
- **Fix:** Changed to `import { AlertDialog } from 'radix-ui'` (correct re-export path). Auto-applied by linter before explicit fix was needed.
- **Files modified:** `web/src/components/dashboard/settings-security-card.tsx`
- **Verification:** `npx tsc --noEmit` passes with no errors

---

**Total deviations:** 2 auto-fixed (both Rule 1 - type/import corrections)
**Impact on plan:** Both fixes were minor type/import corrections. No scope creep.

## Self-Check

- [x] `web/src/app/(dashboard)/dashboard/settings/page.tsx` — FOUND
- [x] `web/src/components/dashboard/settings-profile-card.tsx` — FOUND
- [x] `web/src/components/dashboard/settings-preferences-card.tsx` — FOUND
- [x] Commit `524e6fb` — FOUND (feat(12-02): create settings page RSC and profile card component)
- [x] Commit `1a582b5` — FOUND (feat(12-02): create preferences card with language switch and hourly cost)

## Self-Check: PASSED

## Next Phase Readiness

- Settings page is fully wired and ready for verification
- SettingsSecurityCard (already in repo from prior session at `71ba4e3`) will be wired into settings page in Plan 03
- All four SETT-01 through SETT-04 requirements delivered

---
*Phase: 12-settings*
*Completed: 2026-04-15*
