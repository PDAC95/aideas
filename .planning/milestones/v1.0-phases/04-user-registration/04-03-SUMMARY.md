---
phase: 04-user-registration
plan: "03"
subsystem: web/auth
tags: [server-actions, recaptcha, oauth, supabase, next-intl]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [email-signup-flow, oauth-callback, complete-registration]
  affects: [web/src/lib/actions/auth.ts, web/src/components/auth, web/src/app/(auth)]
tech_stack:
  added: [react-google-recaptcha-v3, disposable-email-domains-js]
  patterns: [server-actions-with-recaptcha, supabase-duplicate-detection, oauth-new-user-detection]
key_files:
  created:
    - web/src/lib/actions/auth.ts
    - web/src/components/auth/recaptcha-provider.tsx
    - web/src/components/auth/complete-registration-form.tsx
    - web/src/app/(auth)/complete-registration/page.tsx
  modified:
    - web/src/components/auth/signup-form.tsx
    - web/src/app/(auth)/signup/page.tsx
    - web/src/app/(auth)/auth/callback/route.ts
decisions:
  - "New OAuth user detection uses user_metadata.company_name absence + google provider check — simpler than identity timestamp comparison"
  - "RecaptchaProvider extracted to client component wrapper — signup page stays Server Component"
  - "completeRegistration generates slug in JS rather than DB RPC — avoids dependency on unverified RPC existence"
  - "Disabled isValid guard on submit button — reCAPTCHA token set programmatically means form is technically invalid until submit"
metrics:
  duration: "4 min"
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_changed: 7
---

# Phase 4 Plan 03: Registration Logic Wiring Summary

Full email signup and Google OAuth registration flows wired end-to-end: Server Actions with reCAPTCHA v3 verification, disposable email blocking, duplicate detection via Supabase identity check, org creation polling, and OAuth new-user routing to /complete-registration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Server Actions | 5712426 | web/src/lib/actions/auth.ts |
| 2 | Wire form + callback + complete-registration | 129c746 | 6 files |

## What Was Built

### Server Actions (`web/src/lib/actions/auth.ts`)

- `signUpWithEmail`: validates with signupSchema, checks disposable domains via `isDisposableEmailDomain()`, verifies reCAPTCHA v3 score (>= 0.5), calls `supabase.auth.signUp`, detects duplicate emails via empty `identities` array, polls org creation up to 3 times (1s delay each), returns `setupPending: true` if org not found after retries
- `completeRegistration`: gets authenticated user, looks up org via `organization_members`, updates org name and generated slug, optionally backfills Google OAuth name into profile
- `resendVerificationEmail`: wraps `supabase.auth.resend` for verification email resend

### Signup Form Updates (`signup-form.tsx`)

- Removed `onSubmit` prop (now directly imports and calls Server Action)
- Integrated `useGoogleReCaptcha` hook to obtain token on submit
- Error routing: `email_exists` shows inline message with /login link, `disposable_email` shows field error, `captcha_failed` shows root error
- Success routing: `setupPending` → `/verify-email?setup=pending&email=...`, normal → `/verify-email?email=...`

### Auth Callback (`auth/callback/route.ts`)

- After session exchange, checks `user.user_metadata.company_name` and `user.app_metadata.provider`
- New Google OAuth users (no company_name + google provider) redirect to `/complete-registration`
- Returning users continue to `next` param or `/dashboard`

### Complete Registration (`/complete-registration`)

- Server Component page shell using `getTranslations('completeRegistration')`
- Client `CompleteRegistrationForm` component with react-hook-form + zodResolver
- Calls `completeRegistration` Server Action on submit, redirects to `/verify-email` on success

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing] RecaptchaProvider extracted to separate client component**
- **Found during:** Task 2
- **Issue:** `GoogleReCaptchaProvider` requires client context but signup page is a Server Component; cannot put `'use client'` on the page without losing server-rendering benefits
- **Fix:** Created `web/src/components/auth/recaptcha-provider.tsx` as a thin `'use client'` wrapper; signup page imports and renders it around the form
- **Files modified:** web/src/components/auth/recaptcha-provider.tsx, web/src/app/(auth)/signup/page.tsx
- **Commit:** 129c746

**2. [Rule 1 - Bug] Removed isValid gate on submit button**
- **Found during:** Task 2
- **Issue:** `captchaToken` field has `z.string().min(1)` validation; the hidden field defaults to `"pending"` but the captcha token is fetched at submit time — the Zod schema sees `"pending"` as valid but the real token replaces it in the action payload. Keeping `disabled={!isValid}` would have caused issues in edge cases where the form considers the default captchaToken value
- **Fix:** Removed `!isValid` from disabled condition, kept only `isSubmitting`
- **Commit:** 129c746

**3. [Rule 1 - Bug] Validator false positive on callback route ignored**
- **Found during:** Task 2 post-write hook
- **Issue:** Post-write hook flagged `searchParams` as needing `await` in the callback route. This does not apply — `searchParams` is derived from `new URL(request.url)`, which returns a standard synchronous `URLSearchParams` object, not the async Next.js page prop
- **Fix:** No change required — recommendation is a false positive for Route Handlers

## Self-Check: PASSED

| Item | Status |
|------|--------|
| web/src/lib/actions/auth.ts | FOUND |
| web/src/components/auth/recaptcha-provider.tsx | FOUND |
| web/src/components/auth/complete-registration-form.tsx | FOUND |
| web/src/app/(auth)/complete-registration/page.tsx | FOUND |
| Commit 5712426 | FOUND |
| Commit 129c746 | FOUND |
