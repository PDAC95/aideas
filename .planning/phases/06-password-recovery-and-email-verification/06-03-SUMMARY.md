---
phase: 06-password-recovery-and-email-verification
plan: "03"
subsystem: auth
tags: [recaptcha, env-vars, signup, password-reset, dev-bypass]

requires:
  - phase: 06-password-recovery-and-email-verification
    provides: password reset flow, signup flow, email verification gate

provides:
  - NEXT_PUBLIC_SITE_URL in .env.local (http://localhost:3000) enabling correct password reset redirectTo URL
  - Client-side reCAPTCHA dev bypass in signup-form.tsx matching server-side graceful degradation

affects: [signup, password-reset, email-verification]

tech-stack:
  added: []
  patterns:
    - "reCAPTCHA dev bypass: check executeRecaptcha first, fall back to dev-bypass token when not configured; fail only when key is set but library fails to load"
    - "Environment-gated graceful degradation: client and server must agree — server already bypassed when RECAPTCHA_SECRET_KEY absent"

key-files:
  created: []
  modified:
    - web/.env.local
    - web/src/components/auth/signup-form.tsx

key-decisions:
  - "NEXT_PUBLIC_SITE_URL set to http://localhost:3000 in .env.local — fixes resetPasswordForEmail redirectTo evaluating to undefined/auth/callback"
  - "reCAPTCHA bypass uses dev-bypass token (not empty string) so captchaToken field is always non-empty — avoids schema validation failure"
  - "Bypass exits only when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set but executeRecaptcha is null — distinguishes real failure from unconfigured dev environment"
  - ".env.local is gitignored — Task 1 fix is on-disk only, not committable"

requirements-completed: [PWD-02, VERIFY-01]

duration: 2min
completed: "2026-04-07"
---

# Phase 06 Plan 03: Gap Closure (Site URL + reCAPTCHA Bypass) Summary

**Password reset email flow unblocked via NEXT_PUBLIC_SITE_URL in .env.local; signup form now degrades gracefully when reCAPTCHA is unconfigured via client-side bypass matching server-side pattern**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-07T17:07:47Z
- **Completed:** 2026-04-07T17:09:02Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `web/.env.local` so `resetPasswordForEmail` constructs a valid `redirectTo` URL instead of `undefined/auth/callback?type=recovery`
- Replaced hard-fail reCAPTCHA guard in signup form with graceful bypass: proceeds with `dev-bypass` token when `executeRecaptcha` is null and no site key is configured
- Still fails correctly when `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set but the reCAPTCHA library fails to load
- Next.js build confirmed passing after both changes

## Task Commits

1. **Task 1: Add NEXT_PUBLIC_SITE_URL to .env.local** - (file is gitignored; value verified on disk via `grep`)
2. **Task 2: Add client-side reCAPTCHA dev bypass in signup form** - `6058de6` (fix)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `web/.env.local` - Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (gitignored, on-disk only)
- `web/src/components/auth/signup-form.tsx` - Replaced hard-fail reCAPTCHA guard with dev bypass pattern

## Decisions Made

- `captchaToken` uses `"dev-bypass"` string (not empty string) so the hidden field always has a non-empty value, avoiding any downstream schema rejections
- Client bypass mirrors server-side `verifyRecaptcha()` logic (auth.ts lines 26-27) — both degrade together when `RECAPTCHA_SECRET_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` are absent
- `.env.local` is gitignored per `web/.gitignore` — Task 1 is only verifiable on disk, not in git history

## Deviations from Plan

None - both tasks were already partially implemented from quick-fix sessions. The signup-form.tsx diff was staged and committed; .env.local value was present on disk. Plan executed exactly as written.

## Issues Encountered

- `.env.local` is gitignored — cannot be committed. Value verified on disk via `grep`. This is expected behavior (secrets file).
- Both fixes were already present from prior quick-fix sessions (quick-1 and quick-2 addressed redirect and PKCE); this plan formalizes and commits the signup form change.

## User Setup Required

None - no external service configuration required for these fixes. The `.env.local` value is already correct on disk.

## Next Phase Readiness

- Password reset email flow is fully unblocked: Supabase receives valid `redirectTo` URL
- Signup form works without reCAPTCHA keys configured in development
- Both features remain functional when keys ARE configured
- UAT gaps PWD-02 and VERIFY-01 closed

---
*Phase: 06-password-recovery-and-email-verification*
*Completed: 2026-04-07*
