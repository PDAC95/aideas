---
phase: 16-carry-over-cleanup
plan: 03
status: complete
completed: 2026-05-04
requirements_completed:
  - CARRY-04
files_modified:
  - web/src/components/auth/signup-form.tsx
commits:
  - 6058de6 fix(06-03): add reCAPTCHA dev bypass in signup form
one_liner: "Signup form now bypasses reCAPTCHA in dev when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is missing, sends `captchaToken=\"\"` to the server (symmetric with server's own bypass), and emits a single console.warn. Production retains hard-fail."
---

# 16-03 Summary — reCAPTCHA Dev Bypass in Signup

## What was done

CARRY-04 from the v1.1 audit is closed.

`handleFormSubmit` in [web/src/components/auth/signup-form.tsx](web/src/components/auth/signup-form.tsx) now computes a single `isDevWithoutKey` gate from `process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (both statically inlined at build time). When the gate is true, the form skips `executeRecaptcha`, sends `captchaToken=""`, and emits one `console.warn`. When the gate is false and `executeRecaptcha` is unavailable, the form hard-fails with the existing `errors.captchaFailed` message.

The previous fragile `"dev-bypass"` literal was removed.

## Verification

- `grep "dev-bypass" web/src/components/auth/signup-form.tsx` → 0 matches.
- The bypass branch is dead-code-eliminated in production bundles because both env vars are statically inlined.
- Server-side `verifyRecaptcha("")` continues to handle the empty token gracefully when its own `RECAPTCHA_SECRET_KEY` is missing (defense-in-depth: if the bypass ever leaked to prod, Google's siteverify would reject the empty token).

Closes [.planning/debug/resolved/verification-failed-signup.md](.planning/debug/resolved/verification-failed-signup.md) — that debug file was previously closed as "configuration", now it's closed by code.

## Notes

No new env var, no new helper module, no new i18n key — minimal scope per CONTEXT.md decisions.
