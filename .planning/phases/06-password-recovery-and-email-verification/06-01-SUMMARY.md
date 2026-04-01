---
phase: 06-password-recovery-and-email-verification
plan: 01
subsystem: auth
tags: [supabase, next-intl, react-hook-form, zod, lucide-react]

requires:
  - phase: 05-user-login
    provides: signInWithEmail Server Action, auth callback route, createClient pattern

provides:
  - requestPasswordReset Server Action (always returns success, email enumeration protection)
  - resetPassword Server Action (session check, updateUser, signOut recovery session)
  - /forgot-password page with email form + 60s resend cooldown + success state replacement
  - /reset-password page with server-side session guard + PasswordStrengthBar + success state
  - Auth callback extended for type=recovery and type=signup routing
  - Zod schemas: forgotPasswordSchema, resetPasswordSchema (8+ chars, uppercase, number)
  - i18n keys: forgotPassword and resetPassword namespaces in EN + ES, login.verified key

affects: [06-02-email-verification, future-login-page-verified-banner]

tech-stack:
  added: []
  patterns:
    - Auth callback type param routing (recovery → /reset-password, signup → /login?verified=true)
    - Form success state replacement (setSubmitted replaces form with confirmation UI entirely)
    - Inline cooldown in component (not reusing ResendEmailTimer which is hardcoded to resendVerificationEmail)
    - Server-side session guard in page component before rendering form
    - Email enumeration protection (requestPasswordReset always returns success regardless of email existence)

key-files:
  created:
    - web/src/lib/validations/password-reset.ts
    - web/src/app/(auth)/forgot-password/page.tsx
    - web/src/components/auth/forgot-password-form.tsx
    - web/src/app/(auth)/reset-password/page.tsx
    - web/src/components/auth/reset-password-form.tsx
  modified:
    - web/src/app/(auth)/auth/callback/route.ts
    - web/src/lib/actions/auth.ts
    - web/messages/en.json
    - web/messages/es.json

key-decisions:
  - "requestPasswordReset always returns success — never reveals if email exists (enumeration protection)"
  - "resetPassword signs out recovery session after update — user must re-login with new password"
  - "ForgotPasswordForm implements inline cooldown (not reusing ResendEmailTimer which is hardcoded to resendVerificationEmail)"
  - "ResetPasswordForm success state has manual Go to sign in link — no auto-redirect per CONTEXT.md"
  - "Auth callback type param checked before OAuth new-user detection logic — type-specific routing takes priority"

patterns-established:
  - "Form success state replacement: setSubmitted(true) replaces the form entirely with confirmation UI"
  - "Auth callback type routing: read type param, handle recovery/signup before falling through to OAuth logic"
  - "Server-side page guard: createClient + getUser in page component, redirect if no session"

requirements-completed: [PWD-01, PWD-02, PWD-03, PWD-04, PWD-05, PWD-06]

duration: 3min
completed: 2026-04-01
---

# Phase 06 Plan 01: Password Recovery Flow Summary

**Complete password reset flow: forgot-password page with email enumeration protection, reset-password page with PasswordStrengthBar and session guard, auth callback extended for recovery/signup type routing, EN/ES i18n**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-01T15:25:11Z
- **Completed:** 2026-04-01T15:28:31Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Auth callback now routes `type=recovery` to `/reset-password` and `type=signup` to `/login?verified=true`, with error fallbacks for expired/invalid links
- `requestPasswordReset` always returns `{ success: true }` regardless of email existence — prevents email enumeration
- `resetPassword` validates active session, updates password via `supabase.auth.updateUser`, signs out recovery session
- `/forgot-password` page with email form, success state replacement (Mail icon, resend with 60s cooldown), expired error banner
- `/reset-password` page with server-side session guard (redirect to `/forgot-password?error=expired` if no user), PasswordStrengthBar, show/hide toggle, success state with manual "Go to sign in" link
- `forgotPasswordSchema` and `resetPasswordSchema` enforce 8+ chars, 1 uppercase, 1 number (consistent with signup)
- `forgotPassword` and `resetPassword` i18n namespaces added to EN and ES, plus `login.verified` key

## Task Commits

1. **Task 1: Auth callback extension, Server Actions, and Zod schemas** - `9f3dd6f` (feat)
2. **Task 2: Forgot-password page, reset-password page, and i18n keys** - `46a5bf3` (feat)

## Files Created/Modified

- `web/src/lib/validations/password-reset.ts` - forgotPasswordSchema and resetPasswordSchema with 8+ chars, uppercase, number rules
- `web/src/app/(auth)/auth/callback/route.ts` - Extended with type=recovery/signup routing and error fallbacks
- `web/src/lib/actions/auth.ts` - Added requestPasswordReset and resetPassword Server Actions
- `web/src/app/(auth)/forgot-password/page.tsx` - Centered card page with Lock icon, expiredError prop, back to login link
- `web/src/components/auth/forgot-password-form.tsx` - Email form with success state replacement, 60s resend cooldown
- `web/src/app/(auth)/reset-password/page.tsx` - Server component with session guard, KeyRound icon
- `web/src/components/auth/reset-password-form.tsx` - Password form with PasswordStrengthBar, show/hide toggle, success state
- `web/messages/en.json` - Added forgotPassword, resetPassword namespaces and login.verified key
- `web/messages/es.json` - Added forgotPassword, resetPassword namespaces (ES) and login.verified key

## Decisions Made

- `requestPasswordReset` always returns `{ success: true }` — email enumeration protection, consistent with security best practices
- `resetPassword` signs out the recovery session after password update — user must authenticate with new password
- `ForgotPasswordForm` implements its own inline cooldown instead of reusing `ResendEmailTimer` (which is hardcoded to `resendVerificationEmail`)
- `ResetPasswordForm` success state provides manual "Go to sign in" link only — no auto-redirect per CONTEXT.md decisions
- Auth callback checks `type` param before OAuth new-user detection so recovery/signup routing takes priority

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Password recovery flow is complete end-to-end
- Auth callback handles all link types (recovery, signup, OAuth)
- Phase 06 Plan 02 (email verification UI) can build on the `login.verified` key already added and `verify-email?error=invalid` redirect in callback

---
*Phase: 06-password-recovery-and-email-verification*
*Completed: 2026-04-01*

## Self-Check: PASSED

All files verified present. All commits verified in git history.
