---
phase: quick-fix
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/.env.local
autonomous: true
requirements: []

must_haves:
  truths:
    - "Password reset email link redirects to /auth/callback?type=recovery, not to root /"
    - "Auth callback processes recovery code and redirects user to /reset-password page"
  artifacts:
    - path: "web/.env.local"
      provides: "NEXT_PUBLIC_SITE_URL environment variable"
      contains: "NEXT_PUBLIC_SITE_URL=http://localhost:3000"
  key_links:
    - from: "web/src/lib/actions/auth.ts"
      to: "web/.env.local"
      via: "process.env.NEXT_PUBLIC_SITE_URL"
      pattern: "NEXT_PUBLIC_SITE_URL"
---

<objective>
Fix password reset email link redirecting to root (/) instead of the reset-password page.

Purpose: The reset password flow is broken because `NEXT_PUBLIC_SITE_URL` is missing from `web/.env.local`. The `requestPasswordReset` server action in `auth.ts:241` constructs `redirectTo` using this env var. When undefined, Supabase ignores the malformed URL and falls back to its Site URL config, sending the code to `/?code=xxx` instead of `/auth/callback?code=xxx&type=recovery`.

Output: Working password reset email flow where clicking the link lands on `/auth/callback` which then redirects to `/reset-password`.
</objective>

<execution_context>
@C:/Users/patri/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/patri/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@web/.env.local
@web/src/lib/actions/auth.ts
@web/src/app/(auth)/auth/callback/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add NEXT_PUBLIC_SITE_URL to web/.env.local</name>
  <files>web/.env.local</files>
  <action>
Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `web/.env.local`.

Place it in the Supabase section (after the existing NEXT_PUBLIC_SUPABASE_ANON_KEY line) since it is used by the Supabase auth redirectTo configuration.

Do NOT modify any other files. The auth callback route already handles `type=recovery` correctly and redirects to `/reset-password`.
  </action>
  <verify>
Run: grep "NEXT_PUBLIC_SITE_URL" web/.env.local
Expected output: NEXT_PUBLIC_SITE_URL=http://localhost:3000
  </verify>
  <done>
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` exists in `web/.env.local`. The `requestPasswordReset` action will now construct a valid `redirectTo` URL: `http://localhost:3000/auth/callback?type=recovery`.
  </done>
</task>

</tasks>

<verification>
1. `grep NEXT_PUBLIC_SITE_URL web/.env.local` returns the expected value
2. `cd web && npx next build 2>&1 | tail -5` completes without errors (env var is accessible)
</verification>

<success_criteria>
- NEXT_PUBLIC_SITE_URL is set in web/.env.local
- Password reset email will contain link to /auth/callback?type=recovery instead of root
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-password-reset-email-link-redirectin/1-SUMMARY.md`
</output>
