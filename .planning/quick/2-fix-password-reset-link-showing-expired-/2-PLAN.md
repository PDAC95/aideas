---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - web/src/components/auth/forgot-password-form.tsx
  - web/src/lib/actions/auth.ts
autonomous: true
requirements: [QUICK-2]

must_haves:
  truths:
    - "User clicks forgot password email link and lands on /reset-password with a valid session"
    - "User can successfully set a new password after clicking the email link"
    - "PKCE code_verifier cookie is set in the browser context, not server action context"
  artifacts:
    - path: "web/src/components/auth/forgot-password-form.tsx"
      provides: "Browser-side password reset request using Supabase browser client"
    - path: "web/src/lib/actions/auth.ts"
      provides: "requestPasswordReset server action removed or kept as dead code cleanup"
  key_links:
    - from: "web/src/components/auth/forgot-password-form.tsx"
      to: "web/src/lib/supabase/client.ts"
      via: "createClient() browser client for resetPasswordForEmail"
      pattern: "createClient.*resetPasswordForEmail"
---

<objective>
Fix the password reset link showing "expired" when users click the forgot password email link.

Purpose: The PKCE code_verifier cookie is not persisting because `resetPasswordForEmail` is called from a server action (server-side context) where cookies set by `@supabase/ssr` don't reliably reach the browser. Moving this call to the browser-side Supabase client ensures the code_verifier cookie is set in the correct context.

Output: Working password reset flow where clicking the email link successfully establishes a recovery session.
</objective>

<execution_context>
@C:/Users/patri/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/patri/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@web/src/components/auth/forgot-password-form.tsx
@web/src/lib/actions/auth.ts
@web/src/app/(auth)/auth/callback/route.ts
@web/src/lib/supabase/client.ts
@web/src/lib/supabase/server.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move resetPasswordForEmail to browser-side client</name>
  <files>
    web/src/components/auth/forgot-password-form.tsx
    web/src/lib/actions/auth.ts
  </files>
  <action>
In `web/src/components/auth/forgot-password-form.tsx`:

1. Add import for the browser Supabase client:
   `import { createClient } from '@/lib/supabase/client'`

2. Remove the import of `requestPasswordReset` from `@/lib/actions/auth`.

3. Replace the `onSubmit` function body. Instead of calling the server action, call the browser Supabase client directly:
   ```
   async function onSubmit(data: ForgotPasswordFormData) {
     const supabase = createClient()
     await supabase.auth.resetPasswordForEmail(data.email, {
       redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
     })
     setSubmittedEmail(data.email)
     setSubmitted(true)
   }
   ```
   Note: We still always show success (never reveal if email exists) because Supabase's `resetPasswordForEmail` does not throw for non-existent emails by default.

4. Replace the `handleResend` function body similarly:
   ```
   async function handleResend() {
     if (cooldown > 0 || sending) return
     setSending(true)
     const supabase = createClient()
     await supabase.auth.resetPasswordForEmail(submittedEmail, {
       redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
     })
     setSending(false)
     startCooldown()
   }
   ```

In `web/src/lib/actions/auth.ts`:

5. Remove the `requestPasswordReset` function entirely (lines 236-248). It is no longer called from anywhere. Keep all other exports unchanged.

Why browser client: The PKCE flow requires the `code_verifier` to be stored as a cookie in the browser. When `resetPasswordForEmail` runs in a server action, `@supabase/ssr` tries to set cookies via the `cookies()` API which does not reliably propagate to the browser in server action responses. The browser client sets the cookie directly in the browser, ensuring `exchangeCodeForSession` in the callback route can find it.

Why `window.location.origin` instead of `process.env.NEXT_PUBLIC_SITE_URL`: This is a client component, so we use `window.location.origin` to get the current origin. `NEXT_PUBLIC_SITE_URL` would also work since it's a NEXT_PUBLIC_ env var, but `window.location.origin` is more reliable for local dev vs production parity.
  </action>
  <verify>
    <automated>cd C:/dev/12ai/web && npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - `forgot-password-form.tsx` imports browser Supabase client and calls `resetPasswordForEmail` directly
    - `requestPasswordReset` server action removed from `auth.ts`
    - Build succeeds with no type errors
    - PKCE code_verifier cookie will now be set in browser context, fixing the "expired" error on email link click
  </done>
</task>

</tasks>

<verification>
1. Build passes: `cd web && npx next build`
2. No remaining imports of `requestPasswordReset` anywhere in the codebase (grep confirms)
3. Manual test: Submit forgot password form, check browser cookies for `sb-*-code-verifier`, click email link, confirm landing on `/reset-password` (not `/forgot-password?error=expired`)
</verification>

<success_criteria>
- Password reset email link no longer shows "expired" error
- User lands on /reset-password with a valid recovery session after clicking email link
- Build compiles without errors
</success_criteria>

<output>
After completion, create `.planning/quick/2-fix-password-reset-link-showing-expired-/2-SUMMARY.md`
</output>
