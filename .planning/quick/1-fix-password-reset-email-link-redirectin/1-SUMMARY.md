---
phase: quick-fix
plan: 01
subsystem: auth
tags: [env-config, password-reset, supabase]
dependency_graph:
  requires: []
  provides: [NEXT_PUBLIC_SITE_URL]
  affects: [web/src/lib/actions/auth.ts]
tech_stack:
  added: []
  patterns: []
key_files:
  modified:
    - web/.env.local
decisions:
  - NEXT_PUBLIC_SITE_URL placed in Supabase section of .env.local (logically grouped with Supabase config)
metrics:
  duration: "<1 min"
  completed: "2026-04-01T19:41:30Z"
---

# Quick Fix Plan 01: Fix Password Reset Email Link Redirect Summary

Added NEXT_PUBLIC_SITE_URL=http://localhost:3000 to web/.env.local so requestPasswordReset constructs valid redirectTo URL pointing to /auth/callback?type=recovery.

## What Changed

### Task 1: Add NEXT_PUBLIC_SITE_URL to web/.env.local

- Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` after the `NEXT_PUBLIC_SUPABASE_ANON_KEY` line
- This env var is read by `requestPasswordReset` in `web/src/lib/actions/auth.ts:241` to construct the `redirectTo` parameter for Supabase password reset
- Without it, `redirectTo` was `undefined/auth/callback?type=recovery` which Supabase ignored, falling back to Site URL config and sending users to `/?code=xxx`
- With it, the redirect URL becomes `http://localhost:3000/auth/callback?type=recovery` which the existing callback route handles correctly

**Note:** `web/.env.local` is gitignored (correctly - it contains Supabase secrets). The change is applied locally but not committed to version control. This is the expected pattern for environment configuration.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `grep NEXT_PUBLIC_SITE_URL web/.env.local` returns `NEXT_PUBLIC_SITE_URL=http://localhost:3000` -- PASSED
- Build verification skipped (env file change only, no code changes)

## Self-Check: PASSED

- [x] `web/.env.local` contains NEXT_PUBLIC_SITE_URL=http://localhost:3000
- [x] No commit created (file is gitignored - correct behavior for env files with secrets)
