---
status: complete
phase: 06-password-recovery-and-email-verification
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md]
started: 2026-04-01T16:00:00Z
updated: 2026-04-07T18:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Forgot Password Page
expected: Navigate to /forgot-password. You should see a centered card with a Lock icon, a title like "Forgot Password", an email input field, a submit button, and a "Back to login" link.
result: pass

### 2. Forgot Password Submission
expected: Enter any email address and submit the form. The form should be replaced entirely by a success confirmation UI with a Mail icon, a message saying the reset link was sent, and a "Resend" button. This should happen regardless of whether the email exists (enumeration protection).
result: pass

### 3. Forgot Password Resend Cooldown
expected: After submitting, click the "Resend" button. It should send the email and then disable for 60 seconds with a countdown timer visible. You cannot click it again until the timer expires.
result: pass

### 4. Reset Password Page (No Session)
expected: Navigate directly to /reset-password without clicking a recovery link. You should be redirected to /forgot-password with an error banner indicating the link is expired or invalid.
result: pass

### 5. Reset Password Form
expected: Click a valid password recovery link from your email. You should land on /reset-password with a centered card, a KeyRound icon, a password field with show/hide toggle, a PasswordStrengthBar showing strength as you type, and a submit button.
result: pass
note: Previously blocked by missing env var. Now working — user confirmed UI renders correctly with all elements.

### 6. Reset Password Submission
expected: Enter a valid new password (8+ chars, 1 uppercase, 1 number) and submit. The form should be replaced by a success state with a "Go to sign in" link. No auto-redirect. You should be signed out of the recovery session.
result: skipped
reason: "Supabase rate limit (429) — max 2 emails/hour on free plan. Cannot receive recovery email to test reset flow. Previous issue (password error classification) was fixed in auth.ts. Needs retest when rate limit resets."
previous_result: issue
previous_reported: "La barra muestra Strong con Password123@ pero al enviar muestra error: Password does not meet requirements"

### 7. Middleware Email Verification Gate
expected: Sign up with a new email/password account but do NOT verify the email. Try to navigate to /dashboard. You should be redirected to /verify-email with your email shown (masked, like p***@gmail.com).
result: pass
previous_result: issue
fix_applied: "06-03 reCAPTCHA bypass + SUPABASE_SERVICE_ROLE_KEY added to web/.env.local"

### 8. Verify Email Invalid Link Error
expected: Navigate to /verify-email?error=invalid (or click an expired/invalid verification link). You should see a red/destructive error banner saying the verification link is invalid or expired.
result: pass

### 9. Login Verified Banner
expected: After verifying your email (clicking the confirmation link from signup), you should be redirected to /login with a green success banner saying your email has been verified. The banner should auto-dismiss after about 5 seconds.
result: pass

## Summary

total: 9
passed: 7
issues: 0
pending: 0
skipped: 1

## Gaps

- truth: "Password recovery email is received after requesting reset"
  status: failed
  reason: "User reported: no llego ningun correo"
  severity: blocker
  test: 5
  root_cause: "NEXT_PUBLIC_SITE_URL not set in web/.env.local — resetPasswordForEmail redirectTo evaluates to 'undefined/auth/callback?type=recovery'. Supabase silently fails. Error swallowed by enumeration protection (always returns success)."
  artifacts:
    - path: "web/src/lib/actions/auth.ts"
      issue: "Line 240-241: redirectTo uses undefined NEXT_PUBLIC_SITE_URL"
    - path: "web/.env.local"
      issue: "Missing NEXT_PUBLIC_SITE_URL"
  missing:
    - "Add NEXT_PUBLIC_SITE_URL=http://localhost:3000 to web/.env.local"
  debug_session: ".planning/debug/password-reset-email-not-sent.md"

- truth: "Unverified user accessing /dashboard is redirected to /verify-email with masked email"
  status: failed
  reason: "User reported: me marca este error - Verification failed. Please try again."
  severity: major
  test: 7
  root_cause: "reCAPTCHA env vars not set — NEXT_PUBLIC_RECAPTCHA_SITE_KEY missing causes executeRecaptcha to be null. signup-form.tsx:47 hard-blocks submission when executeRecaptcha is null, showing 'Verification failed'. Server-side has graceful bypass but request never reaches it."
  artifacts:
    - path: "web/src/components/auth/signup-form.tsx"
      issue: "Lines 47-49: hard-fails when executeRecaptcha is null, no dev bypass"
    - path: "web/src/components/auth/recaptcha-provider.tsx"
      issue: "Line 10: falls back to empty string site key"
    - path: "web/.env.local"
      issue: "Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY"
  missing:
    - "Add client-side bypass in signup-form.tsx mirroring server-side behavior when reCAPTCHA unavailable"
  debug_session: ".planning/debug/verification-failed-signup.md"

- truth: "User can submit a new strong password and see success state"
  status: failed
  reason: "User entered Password123@ (rated Strong by PasswordStrengthBar) but got error 'Password does not meet requirements'"
  severity: major
  test: 6
  root_cause: "auth.ts:268-270 — error detection is too broad. Any Supabase error containing the word 'password' is classified as weak_password. Likely the actual error is 'New password should be different from the old password' or a session/auth error whose message includes 'password'. Need to log the actual error and tighten the detection logic."
  artifacts:
    - path: "web/src/lib/actions/auth.ts"
      issue: "Lines 268-270: error.message.includes('password') catches non-weak-password errors"
  missing:
    - "Add console.error log before error classification to capture exact Supabase error"
    - "Tighten weak_password detection to only match actual weak password errors"
    - "Add separate error type for 'same password' if applicable"
    - "Consider adding a 'samePassword' error key + translation"
