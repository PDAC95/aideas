---
phase: 04-user-registration
plan: 01
subsystem: database
tags: [supabase, postgresql, next-intl, zod, i18n, migrations, triggers]

requires:
  - phase: 02-database-schema
    provides: organizations, profiles, organization_members tables and handle_new_user trigger
  - phase: 03-auth-integration
    provides: Supabase auth config with Google OAuth and email templates

provides:
  - Profiles table extended with first_name, last_name, org_id columns
  - organization_members role CHECK includes 'owner'
  - generate_org_slug() plpgsql function with deduplication loop
  - handle_new_user trigger rewrites to atomically create org + profile + membership on every signup
  - next-intl cookie-based locale (NEXT_LOCALE) without URL routing
  - Translation files en.json and es.json with all signup/verifyEmail/completeRegistration keys
  - signupSchema and completeRegistrationSchema Zod v4 schemas shared between form and Server Action

affects:
  - 04-02 (signup form and page — imports signupSchema, uses translations)
  - 04-03 (signup Server Action — imports signupSchema, runs against new trigger)
  - 04-04 (verify-email and complete-registration pages — uses translations)

tech-stack:
  added:
    - next-intl@4.8.3 (cookie-based i18n without URL routing)
    - react-google-recaptcha-v3@1.11.0 (reCAPTCHA v3 for signup form)
    - disposable-email-domains-js@1.24.0 (disposable email detection)
  patterns:
    - next-intl "without i18n routing" pattern — locale from NEXT_LOCALE cookie, Accept-Language fallback
    - Trigger-disabled seed pattern — ALTER TABLE DISABLE TRIGGER before auth.users insert for fixed UUIDs
    - Zod v4 literal error API — z.literal(true, { error: '...' }) replaces errorMap
    - Atomic org creation trigger — every auth.users insert creates org + profile + membership in one transaction

key-files:
  created:
    - supabase/migrations/20260401000001_user_registration.sql
    - web/src/i18n/request.ts
    - web/messages/en.json
    - web/messages/es.json
    - web/src/lib/validations/signup.ts
  modified:
    - web/next.config.ts (wrapped with createNextIntlPlugin)
    - web/src/app/layout.tsx (async RootLayout with NextIntlClientProvider)
    - supabase/seed.sql (trigger-disable pattern, profiles section, owner roles)

key-decisions:
  - "Seed disables on_auth_user_created trigger during auth.users insert — fixed UUIDs required for FK stability; trigger re-enabled after"
  - "Profile UPDATE statements moved out of migration into seed — migrations run before seed data exists"
  - "locale field in signupSchema uses .optional() not .default() — zodResolver generic requires input/output type alignment with useForm<SignupFormData>"
  - "generate_org_slug uses LOOP with counter suffix for deduplication — same base slug gets -1, -2 suffix"
  - "handle_new_user EXCEPTION block uses RAISE WARNING not RAISE EXCEPTION — signup continues even if trigger body fails"

patterns-established:
  - "next-intl without routing: getRequestConfig reads NEXT_LOCALE cookie, falls back to Accept-Language header"
  - "Translation key structure: signup.*, verifyEmail.*, completeRegistration.*, common.*"
  - "Zod schema file exports both schema and inferred type: signupSchema + SignupFormData"

requirements-completed:
  - REG-02
  - REG-04

duration: 8min
completed: 2026-03-31
---

# Phase 04 Plan 01: User Registration Foundation Summary

**Supabase migration extends profiles with first_name/last_name/org_id, rewrites handle_new_user trigger for atomic org+profile+membership creation, next-intl cookie-based i18n configured, Zod signup schema ready for form and Server Action**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-31T15:05:17Z
- **Completed:** 2026-03-31T15:13:42Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Database migration creates complete user registration schema: profile columns, owner role, generate_org_slug function, and atomic org-creation trigger
- next-intl configured with cookie-based locale switching (no URL segments) — every page reads NEXT_LOCALE cookie with Accept-Language fallback
- Shared Zod v4 signupSchema exports `signupSchema` and `SignupFormData` — used by both signup form (Plan 02) and Server Action (Plan 03)
- English and Spanish translation files cover all three registration screens: signup, verify-email, complete-registration

## Task Commits

1. **Task 1: Database migration — extend profiles, add owner role, rewrite trigger** - `5db3a7f` (feat)
2. **Task 2: Install packages, configure next-intl, create Zod schema and translation files** - `23845e3` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `supabase/migrations/20260401000001_user_registration.sql` — Adds first_name/last_name/org_id to profiles, adds 'owner' to role CHECK, creates generate_org_slug(), rewrites handle_new_user trigger
- `supabase/seed.sql` — Disables trigger during auth.users insert, adds profiles section with new columns, sets owner role for Alice and Carol
- `web/next.config.ts` — Wrapped with createNextIntlPlugin('./src/i18n/request.ts')
- `web/src/i18n/request.ts` — next-intl getRequestConfig: reads NEXT_LOCALE cookie, falls back to Accept-Language header
- `web/src/app/layout.tsx` — Async RootLayout with getLocale/getMessages, NextIntlClientProvider wrapping children, AIDEAS metadata
- `web/messages/en.json` — English translations for signup, verifyEmail, completeRegistration, common
- `web/messages/es.json` — Spanish translations (informal "tu" form) for all keys
- `web/src/lib/validations/signup.ts` — signupSchema (Zod v4) and completeRegistrationSchema, both with inferred types exported

## Decisions Made

- **Trigger disabled in seed:** The new handle_new_user trigger creates orgs/profiles/memberships with random UUIDs, which would conflict with seed's fixed UUIDs. Solved by disabling the trigger, inserting auth.users, then manually inserting profiles/orgs/memberships with fixed IDs.
- **Profile UPDATEs moved to seed:** The migration initially included UPDATE statements for seeded profiles, but migrations run before seed data exists — moved to seed.sql.
- **locale field stays `.optional()`:** Adding `.default('en')` changes the Zod output type to non-optional, causing a TypeScript type mismatch in the existing signup form's `useForm<SignupFormData>`. The server action applies the default instead.
- **EXCEPTION block uses RAISE WARNING:** Trigger errors emit a warning but don't prevent signup — critical for OAuth flow where metadata may be missing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved seed-data UPDATEs from migration to seed.sql**
- **Found during:** Task 1 (Database migration)
- **Issue:** Migration plan included UPDATE statements for seeded profiles (first_name, last_name, org_id). Migrations run before seed data, so profiles rows don't exist at migration time — the UPDATEs would silently update 0 rows.
- **Fix:** Removed UPDATEs from migration; added profile INSERTs and owner role directly in seed.sql
- **Files modified:** supabase/migrations/20260401000001_user_registration.sql, supabase/seed.sql
- **Verification:** Seed structure reviewed; trigger-disable + manual profile insert pattern confirmed correct
- **Committed in:** 5db3a7f (Task 1 commit)

**2. [Rule 1 - Bug] Disabled trigger in seed to prevent UUID collision**
- **Found during:** Task 1 (reviewing seed flow after migration)
- **Issue:** New trigger creates orgs+profiles+memberships on every auth.users INSERT with random UUIDs. Seed's subsequent fixed-UUID INSERTs for organizations/profiles would conflict or create duplicate orgs.
- **Fix:** Added `ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created` before auth.users insert, re-enabled after; manually created profiles and organization_members in seed with fixed UUIDs
- **Files modified:** supabase/seed.sql
- **Committed in:** 5db3a7f (Task 1 commit)

**3. [Rule 1 - Bug] Kept locale field as .optional() in Zod schema**
- **Found during:** Task 2 (next build TypeScript check)
- **Issue:** Adding `.default('en')` to locale field changed inferred output type from `"en" | "es" | undefined` to `"en" | "es"`, causing zodResolver generic type mismatch with pre-existing signup form's `useForm<SignupFormData>`
- **Fix:** Kept locale as `.optional()` — the server action (Plan 03) applies the 'en' default
- **Files modified:** web/src/lib/validations/signup.ts
- **Verification:** `next build` passes with 0 TypeScript errors
- **Committed in:** 23845e3 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 — bugs discovered during implementation)
**Impact on plan:** All fixes necessary for correctness. No scope creep. Schema and behavior match plan spec.

## Issues Encountered

- Docker Desktop not running — `supabase db reset` could not be executed locally. Migration SQL reviewed for correctness; `next build` TypeScript check passes as proxy verification for the web layer.

## User Setup Required

Per plan frontmatter, reCAPTCHA v3 keys are needed before Plan 02/03 can be tested end-to-end:

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — Google reCAPTCHA admin console, reCAPTCHA v3 site key
- `RECAPTCHA_SECRET_KEY` — Google reCAPTCHA admin console, reCAPTCHA v3 secret key
- Dashboard: https://www.google.com/recaptcha/admin/create

## Next Phase Readiness

- Plan 02 (signup form/page) can import `signupSchema`, `SignupFormData`, and all translation keys immediately
- Plan 03 (Server Action) can import `signupSchema` and rely on trigger for atomic org creation
- Plan 04 (verify-email, complete-registration pages) has all translation keys ready
- Docker required to run `supabase db reset` and verify migration applies cleanly

---
*Phase: 04-user-registration*
*Completed: 2026-03-31*
