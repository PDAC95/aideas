---
phase: 04-user-registration
plan: 02
subsystem: ui
tags: [next-intl, react-hook-form, zod, supabase-oauth, tailwind, shadcn]

# Dependency graph
requires:
  - phase: 03-auth-integration
    provides: Supabase client setup, auth callback route
provides:
  - Split-layout signup page (Server Component shell)
  - SignupForm client component with react-hook-form + zodResolver, mode onBlur
  - PasswordStrengthBar reactive visual strength indicator
  - GoogleOAuthButton triggering supabase.auth.signInWithOAuth
  - LanguageSwitcher setting NEXT_LOCALE cookie and calling router.refresh()
  - next-intl cookie-based i18n (no URL routing) for EN/ES
  - Zod signupSchema shared between form and Server Action
  - EN and ES translation files for signup, verifyEmail, completeRegistration
affects: [04-03-PLAN, 04-04-PLAN]

# Tech tracking
tech-stack:
  added: [next-intl@4.8.3]
  patterns:
    - next-intl without i18n routing — locale from NEXT_LOCALE cookie, fallback to Accept-Language header
    - SignupForm accepts optional onSubmit prop — Plan 03 wires the Server Action
    - zodResolver type mismatch with z.enum().default() — use .optional() instead; set default in form defaultValues

key-files:
  created:
    - web/src/app/(auth)/signup/page.tsx
    - web/src/components/auth/signup-form.tsx
    - web/src/components/auth/google-oauth-button.tsx
    - web/src/components/auth/password-strength-bar.tsx
    - web/src/components/auth/language-switcher.tsx
    - web/src/i18n/request.ts
    - web/src/lib/validations/signup.ts
    - web/messages/en.json
    - web/messages/es.json
  modified:
    - web/next.config.ts
    - web/src/app/layout.tsx
    - web/package.json

key-decisions:
  - "zodResolver with Zod v4: z.enum().default() causes input/output type mismatch — use .optional() and handle default in form defaultValues"
  - "next-intl v4 uses cookies() and headers() as async — await both in request.ts"
  - "SignupForm onSubmit is a prop (optional) — Plan 02 builds UI only, Plan 03 wires Server Action"
  - "Google button placed below form fields + divider (email form is primary CTA per UX convention)"
  - "captchaToken field required in schema (not optional) — Plan 03 will populate it via reCAPTCHA"

patterns-established:
  - "Auth form components go in web/src/components/auth/"
  - "Translation keys namespaced by page: signup.*, verifyEmail.*, completeRegistration.*"
  - "PasswordStrengthBar: weak=missing min reqs, medium=min reqs met, strong=min+special+12 chars"

requirements-completed: [REG-01, REG-02, REG-08]

# Metrics
duration: 7min
completed: 2026-03-31
---

# Phase 04 Plan 02: Signup UI Summary

**Split-layout signup page with react-hook-form + Zod blur validation, password strength bar, Google OAuth button, language switcher (ES/EN cookie-based), and next-intl i18n foundation**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-31T15:05:28Z
- **Completed:** 2026-03-31T15:12:46Z
- **Tasks:** 2 (+ prerequisite work from Plan 01)
- **Files modified:** 13

## Accomplishments

- Split-layout signup page: left branding panel (dark, hidden on mobile) with logo + 3 benefit bullets; right form panel with logo on mobile
- Full signup form with first name, last name, company, email, password (show/hide toggle), terms checkbox with /terms and /privacy links opening in new tab
- Reactive password strength bar (red/yellow/green) with Weak/Medium/Strong labels from i18n
- Google OAuth button using supabase.auth.signInWithOAuth with 5-second auto-dismiss error toast
- Language switcher in absolute top-right: sets NEXT_LOCALE cookie, calls router.refresh()
- next-intl installed and configured (cookie-based, no URL routing) with EN/ES translations
- Zod signup schema exported and shared; TypeScript build passes cleanly

## Task Commits

1. **Task 1 + Task 2: Signup page shell, form components, i18n prerequisites** - `598368b` (feat)

**Plan metadata:** (to be committed with this summary)

## Files Created/Modified

- `web/src/app/(auth)/signup/page.tsx` - Server Component split-layout with branding panel and SignupForm
- `web/src/components/auth/signup-form.tsx` - Client form with react-hook-form, zodResolver, mode onBlur
- `web/src/components/auth/google-oauth-button.tsx` - Google OAuth via Supabase with auto-dismiss error toast
- `web/src/components/auth/password-strength-bar.tsx` - Visual strength indicator (3 segments)
- `web/src/components/auth/language-switcher.tsx` - ES|EN toggle via NEXT_LOCALE cookie
- `web/src/i18n/request.ts` - next-intl getRequestConfig reading NEXT_LOCALE cookie
- `web/src/lib/validations/signup.ts` - Zod signupSchema + completeRegistrationSchema
- `web/messages/en.json` - English translations for signup, verifyEmail, completeRegistration, common
- `web/messages/es.json` - Spanish translations (informal "tu" form)
- `web/next.config.ts` - Wrapped with createNextIntlPlugin
- `web/src/app/layout.tsx` - Made async, added NextIntlClientProvider + getLocale/getMessages
- `web/package.json` + `package-lock.json` - Added next-intl@4.8.3

## Decisions Made

- **zodResolver + Zod v4 type mismatch:** `z.enum().default()` makes the input type optional but output type required, causing TypeScript errors in react-hook-form. Fix: use `.optional()` in schema, set default in `useForm({ defaultValues })`.
- **Google button below divider:** Email form is primary CTA; Google OAuth placed after the submit button and divider per standard SaaS convention.
- **onSubmit as prop:** SignupForm accepts `onSubmit?: (data) => Promise<...>` — keeps the UI layer clean and allows Plan 03 to inject the Server Action without modifying this component.
- **captchaToken not optional:** Field kept required in schema; Plan 03 wires reCAPTCHA to populate it before submission.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created Plan 01 prerequisite files**
- **Found during:** Task 1 (signup page shell)
- **Issue:** Plan 02 depends on next-intl, translation files, and Zod schema from Plan 01, which had not been executed
- **Fix:** Installed next-intl@4.8.3, created messages/en.json + es.json, web/src/i18n/request.ts, web/src/lib/validations/signup.ts, updated next.config.ts and layout.tsx
- **Files modified:** web/next.config.ts, web/src/app/layout.tsx, web/messages/en.json, web/messages/es.json, web/src/i18n/request.ts, web/src/lib/validations/signup.ts
- **Verification:** next build passes
- **Committed in:** 598368b (combined with task commit)

**2. [Rule 1 - Bug] Fixed zodResolver type incompatibility with Zod v4 default()**
- **Found during:** Task 2 — TypeScript build failure
- **Issue:** `z.enum(['en', 'es']).default('en')` creates input type `"en" | "es" | undefined` vs output type `"en" | "es"`, breaking zodResolver generic type constraint
- **Fix:** Changed to `z.enum(['en', 'es']).optional()` and handle locale via hidden input in form
- **Files modified:** web/src/lib/validations/signup.ts
- **Verification:** next build passes with no TypeScript errors
- **Committed in:** 598368b

---

**Total deviations:** 2 auto-fixed (1 blocking prerequisite, 1 type bug)
**Impact on plan:** Both necessary for execution. Prerequisite work properly scoped to what Plan 02 needs. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None — no external service configuration required for this plan. (reCAPTCHA setup is part of Plan 01/03.)

## Next Phase Readiness

- Signup page UI is complete and builds cleanly
- SignupForm accepts `onSubmit` prop — Plan 03 wires the Server Action
- Translation files have all keys needed for Plans 03 and 04
- Zod schema ready for import by the Server Action in Plan 03

---
*Phase: 04-user-registration*
*Completed: 2026-03-31*
