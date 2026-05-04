---
status: resolved
trigger: "UAT Phase 06 - 'Verification failed. Please try again.' error on signup"
created: 2026-04-01T00:00:00Z
updated: 2026-05-04T00:00:00Z
resolution_type: code_fix
closed_by: phase-16-03
---

## Final Resolution (2026-05-04, Phase 16-03)

Closed by **code fix** under Phase 16-03 (CARRY-04). The asymmetry called out in the original tech-debt observation was actually corrected.

`web/src/components/auth/signup-form.tsx` now contains a dev-only bypass:
- When `process.env.NODE_ENV !== "production"` AND `process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is unset, the form skips reCAPTCHA, sends `captchaToken=""` to the server, and emits a single `console.warn`.
- The server's existing `verifyRecaptcha("")` graceful path (when `RECAPTCHA_SECRET_KEY` is also unset) accepts the empty token, so signup completes locally without any reCAPTCHA configuration.
- Production retains hard-fail behavior — both `NODE_ENV` and `NEXT_PUBLIC_*` vars are statically inlined at build time, so the bypass branch is dead-code-eliminated from production bundles. Confirmed: the string `reCAPTCHA bypass` does not appear in any `.next/**/*.js` runtime chunk.
- Defense-in-depth: even if the bypass branch ever leaked to production, Google's siteverify would reject the empty token because `RECAPTCHA_SECRET_KEY` MUST be set in production deploys.

See `.planning/phases/16-carry-over-cleanup/16-03-SUMMARY.md` for full diff and verification evidence.

## Earlier Resolution Note (2026-05-04, superseded)

Originally closed as environment configuration, not a code defect. The tech-debt observation flagged the client/server asymmetry as a future hardening task. Phase 16-03 promoted that hardening from "future" to "done."

**Action for developers:** No env vars required for local signup testing. If you DO set reCAPTCHA env vars locally, the real reCAPTCHA flow runs as expected.

## Current Focus

hypothesis: reCAPTCHA site key is missing from .env.local, causing executeRecaptcha to be unavailable on the client, which triggers the "captchaFailed" error message
test: confirmed by checking .env.local - no RECAPTCHA vars present
expecting: n/a - confirmed
next_action: report root cause

## Symptoms

expected: User signs up, gets redirected to /verify-email page
actual: User sees "Verification failed. Please try again." error on the signup form
errors: "Verification failed. Please try again." (translation key: signup.errors.captchaFailed)
reproduction: Fill out signup form and submit
started: Likely always broken in local dev without reCAPTCHA keys configured

## Eliminated

(none needed - root cause found on first hypothesis)

## Evidence

- timestamp: 2026-04-01
  checked: web/messages/en.json for error string origin
  found: "Verification failed. Please try again." is the translation for key "signup.errors.captchaFailed" (line 29)
  implication: Error is specifically about captcha/reCAPTCHA failure, not about email verification

- timestamp: 2026-04-01
  checked: web/src/components/auth/signup-form.tsx lines 46-54
  found: handleFormSubmit checks `if (!executeRecaptcha)` and sets root error to captchaFailed message. This is the FIRST check before any server call.
  implication: If the reCAPTCHA provider fails to initialize, signup is completely blocked at the client level

- timestamp: 2026-04-01
  checked: web/src/components/auth/recaptcha-provider.tsx
  found: Site key is read from `process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""` - falls back to empty string
  implication: With empty string site key, GoogleReCaptchaProvider initializes but executeRecaptcha is null/unavailable

- timestamp: 2026-04-01
  checked: web/.env.local for RECAPTCHA variables
  found: NO reCAPTCHA environment variables are set (neither NEXT_PUBLIC_RECAPTCHA_SITE_KEY nor RECAPTCHA_SECRET_KEY)
  implication: Root cause confirmed - client cannot get a captcha token, so signup is blocked before it ever reaches the server

- timestamp: 2026-04-01
  checked: web/src/lib/actions/auth.ts lines 23-28 (server-side verifyRecaptcha)
  found: Server-side gracefully skips verification when RECAPTCHA_SECRET_KEY is not set (returns true with a console.warn)
  implication: Server-side has a bypass for missing keys, but CLIENT-SIDE does NOT. The asymmetry is the design flaw.

## Resolution

root_cause: |
  The reCAPTCHA environment variables (NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY) are not configured in web/.env.local.
  
  The client-side signup form (signup-form.tsx lines 46-54) checks if `executeRecaptcha` is available from the react-google-recaptcha-v3 hook. When NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing/empty, the GoogleReCaptchaProvider initializes with an empty key, causing `executeRecaptcha` to be null/undefined. The form then sets the error "Verification failed. Please try again." and returns before ever calling the server action.
  
  Notably, the SERVER-side verifyRecaptcha function (auth.ts line 26) already handles missing keys gracefully by returning true with a warning. But the CLIENT-side has no equivalent bypass -- it hard-fails when executeRecaptcha is unavailable.

fix: (not applied - diagnosis only)
verification: (not applied)
files_changed: []
