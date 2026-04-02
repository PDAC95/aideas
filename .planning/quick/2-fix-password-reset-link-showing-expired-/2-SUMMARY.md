---
phase: quick-2
plan: 01
subsystem: auth
tags: [password-reset, pkce, supabase, browser-client]
dependency_graph:
  requires: []
  provides: [working-password-reset-flow]
  affects: [forgot-password-form, auth-actions]
tech_stack:
  patterns: [browser-side-supabase-client-for-pkce]
key_files:
  modified:
    - web/src/components/auth/forgot-password-form.tsx
    - web/src/lib/actions/auth.ts
decisions:
  - "Browser Supabase client for resetPasswordForEmail — PKCE code_verifier cookie must be set in browser context"
  - "window.location.origin over NEXT_PUBLIC_SITE_URL — reliable for local dev vs production parity"
metrics:
  duration: 1 min
  completed: "2026-04-02T17:51:44Z"
---

# Quick Task 2: Fix Password Reset Link Showing Expired

Moved resetPasswordForEmail from server action to browser-side Supabase client so PKCE code_verifier cookie persists in browser context, fixing the "expired" error when users click the password reset email link.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Move resetPasswordForEmail to browser-side client | ed19bfc | forgot-password-form.tsx, auth.ts |

## Changes Made

### forgot-password-form.tsx
- Replaced import of `requestPasswordReset` server action with `createClient` from `@/lib/supabase/client`
- `onSubmit` now calls `supabase.auth.resetPasswordForEmail` directly via browser client
- `handleResend` similarly updated to use browser client
- Uses `window.location.origin` for redirectTo URL

### auth.ts
- Removed `requestPasswordReset` server action entirely (lines 232-248)
- All other exports unchanged

## Root Cause

The PKCE flow requires the `code_verifier` to be stored as a cookie in the browser. When `resetPasswordForEmail` ran in a server action, `@supabase/ssr` tried to set cookies via the `cookies()` API which does not reliably propagate to the browser in server action responses. The browser client sets the cookie directly in the browser, ensuring `exchangeCodeForSession` in the callback route can find it.

## Verification

- Build passes with no type errors
- No remaining references to `requestPasswordReset` in codebase (grep confirmed)
- Manual test needed: submit forgot password, check browser cookies for `sb-*-code-verifier`, click email link, confirm landing on `/reset-password`

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED
