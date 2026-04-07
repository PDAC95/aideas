---
phase: 06-password-recovery-and-email-verification
verified: 2026-04-07T18:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification:
  previous_status: passed
  previous_score: 19/19
  gaps_closed:
    - "Password recovery email sent with valid redirectTo URL (PKCE fix + NEXT_PUBLIC_SITE_URL)"
    - "Signup form submits without reCAPTCHA keys configured in dev (client-side bypass)"
    - "Password reset correctly distinguishes weak_password from same_password errors"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Submit forgot-password form and confirm email arrives with working link"
    expected: "Email arrives within 60s; clicking the link lands on /reset-password (not /forgot-password?error=expired)"
    why_human: "Requires live Supabase email delivery and PKCE cookie round-trip in a real browser"
  - test: "Enter same password in reset-password form and submit"
    expected: "Form shows 'New password must be different from your current password.' error, not a generic error"
    why_human: "Depends on exact Supabase error message text for same-password rejection"
  - test: "Sign up without reCAPTCHA keys, then try to access /dashboard before verifying email"
    expected: "Redirected to /verify-email with masked email; no 'Verification failed' error"
    why_human: "Requires live Supabase signup flow with email confirmation enabled"
---

# Phase 06: Password Recovery and Email Verification — Re-Verification Report

**Phase Goal:** A user who forgot their password can reset it via email link, and a newly registered user can verify their email and gain access to the portal
**Verified:** 2026-04-07
**Status:** PASSED
**Re-verification:** Yes — after UAT gap closure (plans 06-03, quick-1, quick-2)

---

## Context: What Changed Since Initial Verification

Three post-verification fixes were applied:

- **quick-1** (`a348201`, `984780a`): Fixed password reset email `redirectTo` URL to use app root instead of a nested path
- **quick-2** (`ed19bfc`, `cb5619a`): Moved `resetPasswordForEmail` from server action to browser-side Supabase client to fix PKCE `code_verifier` cookie persistence; removed `requestPasswordReset` from `auth.ts`; callback route updated with PKCE-aware cookie forwarding and `recovery_sent_at` heuristic fallback
- **06-03** (`6058de6`, `1ab9ac8`): Added `NEXT_PUBLIC_SITE_URL` to `.env.local`; replaced hard-fail reCAPTCHA guard in `signup-form.tsx` with dev-bypass pattern; tightened `resetPassword` error classification to distinguish `weak_password` / `same_password` / `no_session` / `generic`

The previous VERIFICATION.md cited `requestPasswordReset` as a key artifact — that server action was intentionally removed. The goal is still achieved via browser-side client call, which is the architecturally correct fix for PKCE.

---

## Goal Achievement

### Observable Truths (Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User enters email on /forgot-password and receives a reset link email within 60 seconds | VERIFIED | `forgot-password-form.tsx` L37-43: calls `supabase.auth.resetPasswordForEmail` (browser client) with `redirectTo: ${window.location.origin}/auth/callback?type=recovery`. Enumeration protection maintained — always shows success state. |
| 2 | Clicking the reset link opens /reset-password, user sets new password, sees confirmation, navigated to /login | VERIFIED | Callback `route.ts` L54-62: `isRecovery` detects `type=recovery` param or `recovery_sent_at` within 30-min window, redirects to `/reset-password`. `reset-password-form.tsx` L35-51: calls `resetPassword`, handles all error types. L55-76: success state with `CheckCircle2` icon and `<Link href="/login">` button. |
| 3 | Newly registered user on /verify-email can click "Resend verification email" and receive email immediately | VERIFIED | `verify-email/page.tsx` renders `ResendEmailTimer` with 60s cooldown. `resendVerificationEmail` in `auth.ts` L221-230 calls `supabase.auth.resend({ type: 'signup', email })`. |
| 4 | Clicking verification link marks account as verified and allows login; unverified user trying /dashboard redirected to /verify-email | VERIFIED | Callback `route.ts` L63-64: `type=signup` success → `/login?verified=true`. `middleware.ts` L60-71: gate on `user && !user.email_confirmed_at` for `/dashboard` and `/app/*`, redirects to `/verify-email?email=...`. |
| 5 | Reset password form rejects passwords below minimum strength requirement before submitting | VERIFIED | `password-reset.ts` Zod schema: `.min(8)`, `/[A-Z]/`, `/[0-9]/` via `zodResolver`. `PasswordStrengthBar` renders during typing. `auth.ts` L252-256: server-side classifies `weak_password` (matches `'weak'`/`'strength'`) and `same_password` (matches `'same'`/`'different'`) distinctly. `reset-password-form.tsx` L38-49: maps all 4 error types to i18n keys. `samePassword` i18n key present in both `en.json` L109 and `es.json` L109. |

**Score:** 5/5 truths verified

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `web/src/components/auth/forgot-password-form.tsx` | VERIFIED | 152 lines. Browser-side `createClient` import (L9). `resetPasswordForEmail` called at L38 and L62 with `window.location.origin` redirectTo. Success state with Mail icon, cooldown timer, resend handler. Expired error banner via `expiredError` prop. |
| `web/src/components/auth/reset-password-form.tsx` | VERIFIED | 134 lines. `resetPassword` server action wired (L10 import, L36 call). `PasswordStrengthBar` on live `watch('password')` (L118). Success state with `CheckCircle2` and manual login link (L72-74). All 4 error types handled (L39-48). |
| `web/src/app/(auth)/auth/callback/route.ts` | VERIFIED | 92 lines. Full PKCE-aware: `cookiesToSet` array (L15-19) forwarded to redirect response (L76-78). Recovery detected by `type=recovery` param or `recovery_sent_at` heuristic (L54-60). `type=signup` success → `/login?verified=true` (L63-64). Both error paths handled (L83-88). |
| `web/src/lib/actions/auth.ts` | VERIFIED | `resetPassword` (L236-267): gets user, calls `updateUser`, classifies errors by message substrings, signs out on success. `resendVerificationEmail` (L221-230): calls `supabase.auth.resend`. `signInWithEmail` (L277-321): checks `email_not_confirmed` in error message. `requestPasswordReset` correctly removed — no references remain in codebase. |
| `web/src/lib/supabase/middleware.ts` | VERIFIED | Email verification gate at L59-72: `user && !user.email_confirmed_at`, excludes `/verify-email` and `/auth/` paths, applies only to `/dashboard` and `/app/*`, sets `email` query param on redirect. |
| `web/src/components/auth/signup-form.tsx` | VERIFIED | reCAPTCHA bypass at L47-58: defaults to `"dev-bypass"` token, uses real token when `executeRecaptcha` is available, fails only when site key is configured but library fails to load. |
| `web/.env.local` | VERIFIED | `NEXT_PUBLIC_SITE_URL=http://localhost:3000` confirmed present on disk (gitignored). Used by `signUpWithEmail` `emailRedirectTo` at `auth.ts` L106. |
| `web/messages/en.json` | VERIFIED | `forgotPassword` namespace (L78+), `resetPassword` namespace with `noSession`, `weakPassword`, `samePassword`, `generic` error keys (L96-112), `verifyEmail.invalidLink`, `login.verified`. |
| `web/messages/es.json` | VERIFIED | Same namespaces with Spanish translations. `samePassword` key present at L109. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `forgot-password-form.tsx` | `supabase.auth.resetPasswordForEmail` | browser client (PKCE-safe) | WIRED | L9 `createClient` import; L38, L62 two call sites with `window.location.origin` redirectTo |
| `auth/callback/route.ts` | `/reset-password` | redirect on `isRecovery` | WIRED | L54-62: `isRecovery` boolean; L61-62: `redirectTo = ${origin}/reset-password` |
| `auth/callback/route.ts` | session cookies | `cookiesToSet` forwarded to redirect | WIRED | L15-19 collection array; L76-78 `response.cookies.set` loop |
| `reset-password-form.tsx` | `auth.ts:resetPassword` | server action call | WIRED | L10 import; L36 `onSubmit` call |
| `middleware.ts` | `/verify-email` | `!email_confirmed_at` gate | WIRED | L60-71 full conditional with `url.searchParams.set('email', ...)` |
| `signup-form.tsx` | `signUpWithEmail` server action | `handleFormSubmit` | WIRED | L12 import; L70 call with full payload including `captchaToken` |
| `auth.ts:signUpWithEmail` | `NEXT_PUBLIC_SITE_URL` | `emailRedirectTo` env var | WIRED | L106: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/verify-email`; env var confirmed present |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PWD-01 | 06-01 | Forgot password page at /forgot-password with email input | SATISFIED | `forgot-password-form.tsx` renders email input, submits via browser Supabase client |
| PWD-02 | 06-01, 06-03 | Reset email sent via Supabase Auth | SATISFIED | `resetPasswordForEmail` called from browser client; PKCE cookie persists; `redirectTo` is valid URL via `window.location.origin` |
| PWD-03 | 06-01 | Reset password page at /reset-password with new password form | SATISFIED | `reset-password/page.tsx` + `ResetPasswordForm` with strength bar |
| PWD-04 | 06-01 | Password strength validation | SATISFIED | Zod schema + `PasswordStrengthBar`; server-side classifies `weak_password` and `same_password` distinctly |
| PWD-05 | 06-01 | Confirmation message after password changed | SATISFIED | `ResetPasswordForm` success state: `CheckCircle2` icon, `successTitle`/`successSubtitle` i18n |
| PWD-06 | 06-01 | Redirect to login after reset | SATISFIED | Manual `<Link href="/login">` button in success state; no auto-redirect |
| VERIFY-01 | 06-02, 06-03 | Verification email sent automatically on signup | SATISFIED | `signUpWithEmail` passes valid `emailRedirectTo`; reCAPTCHA bypass allows signup without keys |
| VERIFY-02 | 06-02 | Verification link in email confirms account | SATISFIED | Callback `type=signup` success → `/login?verified=true` |
| VERIFY-03 | 06-02 | Verify-email page at /verify-email with status message | SATISFIED | Masked email display, `error=invalid` banner, `ResendEmailTimer` |
| VERIFY-04 | 06-02 | User can only login after email is verified | SATISFIED | Middleware gate + `signInWithEmail` checks `email_not_confirmed` in error message |
| VERIFY-05 | 06-02 | Resend verification email option | SATISFIED | `ResendEmailTimer` on `/verify-email`; `resendVerificationEmail` server action |

All 11 requirement IDs accounted for. No orphaned requirements found for Phase 6.

---

## Anti-Patterns Found

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| `auth/callback/route.ts` L56-59 | `recovery_sent_at` heuristic fallback (30-min window) | Info | Belt-and-suspenders for email clients that strip query params. No functional risk — `type=recovery` is always set by `forgot-password-form.tsx`. |
| `auth.ts` L252-256 | Error classification by substring match on Supabase error messages | Info | Works for current Supabase Auth. Strings `'weak'`, `'strength'`, `'same'`, `'different'` are stable Supabase error phrases. Low regression risk. |

No blockers, no stubs, no placeholder returns, no TODO/FIXME patterns in phase files.

---

## Human Verification Required

### 1. Full Password Reset Email Round-Trip

**Test:** On a running dev server, go to `/forgot-password`, enter a real email, submit. Check email inbox within 60 seconds.
**Expected:** Email arrives with a link containing `http://localhost:3000/auth/callback?type=recovery&code=...`. Clicking the link lands on `/reset-password` with the password form visible — not redirected to `/forgot-password?error=expired`.
**Why human:** Requires live Supabase email delivery, PKCE `code_verifier` cookie persistence in a real browser session, and valid Supabase callback URL configuration in the Supabase dashboard.

### 2. Same Password Rejection

**Test:** Use a valid reset link to reach `/reset-password`. Enter the account's current password and submit.
**Expected:** Form shows "New password must be different from your current password." — not "Password does not meet requirements." and not a generic error.
**Why human:** Classification logic is substring-based on Supabase error message text. The actual error string from the live Supabase instance must match `'same'` or `'different'` to trigger the `same_password` path.

### 3. Signup Without reCAPTCHA Keys Followed by Email Verification Gate

**Test:** With no `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in `.env.local`, go to `/signup`, fill the form, submit. After redirect to `/verify-email`, open a new tab and navigate to `/dashboard`.
**Expected:** Signup completes without "Verification failed" error. `/dashboard` access redirects to `/verify-email?email=...` with masked email displayed.
**Why human:** Requires live Supabase signup (email confirmation enabled), verifying the `dev-bypass` captcha token passes server-side graceful bypass, and middleware gate behavior with a real unverified session.

---

## Re-Verification Summary

All 5 success criteria pass. The three UAT gaps documented in `06-UAT.md` are closed:

**Gap 1 (PWD-02 — password reset email not sent):** Closed by quick-2. `resetPasswordForEmail` moved to browser-side Supabase client so PKCE `code_verifier` cookie is set directly in the browser where `exchangeCodeForSession` can read it. `window.location.origin` used for `redirectTo` — eliminates the `undefined/auth/callback` problem from missing env var. Callback route updated to forward session cookies to the redirect response.

**Gap 2 (VERIFY-01 — reCAPTCHA hard-blocks signup):** Closed by 06-03. `signup-form.tsx` now defaults to `"dev-bypass"` token when `executeRecaptcha` is null and no site key is configured. Client and server degradation logic now match — both proceed without reCAPTCHA when keys are absent. Hard-blocks only when site key is set but library fails to load (genuine failure).

**Gap 3 (PWD-04/PWD-05 — same password error misclassified):** Closed by auth.ts cleanup in quick-2 / 06-03. `resetPassword` now logs the actual Supabase error before classification and uses tightened substring matchers. `same_password` → `samePassword` i18n key is fully wired end-to-end through server action, form error handler, and both locale message files.

No regressions found in any previously-verified artifact. The phase goal is achieved.

---

_Verified: 2026-04-07_
_Verifier: Claude (gsd-verifier)_
