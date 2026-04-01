---
status: diagnosed
trigger: "Password recovery email not being received after requesting reset from /forgot-password"
created: 2026-04-01T12:00:00Z
updated: 2026-04-01T12:00:00Z
---

## Current Focus

hypothesis: NEXT_PUBLIC_SITE_URL env var is missing, causing redirectTo to be "undefined/auth/callback?type=recovery" which Supabase rejects silently
test: Checked .env.local for NEXT_PUBLIC_SITE_URL
expecting: Variable should be set to the app's base URL
next_action: Report root cause

## Symptoms

expected: User receives a password reset email after submitting the forgot-password form
actual: No email arrives; form shows success (enumeration protection)
errors: None visible to user (server action swallows error and returns success)
reproduction: Submit any email on /forgot-password
started: Likely always broken - env var was never configured

## Eliminated

(none needed - root cause found on first hypothesis)

## Evidence

- timestamp: 2026-04-01T12:00:00Z
  checked: web/.env.local for all environment variables
  found: Only 3 env vars set - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL. NO NEXT_PUBLIC_SITE_URL. NO SUPABASE_SERVICE_ROLE_KEY.
  implication: The redirectTo in resetPasswordForEmail resolves to "undefined/auth/callback?type=recovery"

- timestamp: 2026-04-01T12:01:00Z
  checked: requestPasswordReset in web/src/lib/actions/auth.ts (line 240-241)
  found: Uses `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery` as redirectTo
  implication: When NEXT_PUBLIC_SITE_URL is undefined, this becomes the string "undefined/auth/callback?type=recovery"

- timestamp: 2026-04-01T12:01:30Z
  checked: signUpWithEmail in same file (line 106)
  found: Same pattern - uses NEXT_PUBLIC_SITE_URL for emailRedirectTo
  implication: Signup verification emails likely have the same problem

- timestamp: 2026-04-01T12:02:00Z
  checked: Error handling in requestPasswordReset (lines 244-247)
  found: Errors are console.warned but success is always returned (enumeration protection)
  implication: Supabase may be returning an error about invalid redirect URL, but user never sees it

## Resolution

root_cause: NEXT_PUBLIC_SITE_URL environment variable is not set in web/.env.local. The requestPasswordReset server action constructs the redirect URL as `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`. With the env var missing, this evaluates to "undefined/auth/callback?type=recovery". Supabase likely rejects this malformed URL and does not send the email. The error is silently swallowed by the enumeration protection logic (always returns success).
fix: (not applied - diagnosis only)
verification: (not applied - diagnosis only)
files_changed: []
