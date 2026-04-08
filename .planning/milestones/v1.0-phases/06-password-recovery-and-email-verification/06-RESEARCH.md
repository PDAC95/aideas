# Phase 6: Password Recovery and Email Verification — Research

**Gathered:** 2026-04-01
**Status:** Ready for planning

---

## 1. Supabase Auth APIs

### 1.1 Forgot Password — `resetPasswordForEmail`

Triggers the Supabase password recovery email. The user receives an email with a magic link. Clicking it redirects them to the app's callback route with a PKCE code, which the callback exchanges for a session. The user is then on an authenticated session scoped only to password update — they can immediately call `updateUser`.

```ts
// Server Action: requestPasswordReset
const supabase = await createServerClient()
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
})
// Always return generic success — never reveal if email exists
```

Key facts:
- Always returns 200 even if the email doesn't exist (by design, to prevent enumeration).
- The project already uses PKCE flow (callback exchanges `code` via `exchangeCodeForSession`).
- `redirectTo` must be registered in Supabase Dashboard → Auth → URL Configuration → Redirect URLs.
- Rate limit on Supabase's built-in SMTP: **2 emails/hour per address**. Project uses custom SMTP (configured in Phase 3), so limit is governed by the SMTP provider.

### 1.2 Reset Password — `updateUser`

After the user lands on `/reset-password` and the callback has exchanged the code for a session, the user is temporarily authenticated. The new password is submitted via a Server Action:

```ts
// Server Action: resetPassword
const supabase = await createServerClient()
const { error } = await supabase.auth.updateUser({ password: newPassword })
// On success, sign them out so they go to /login fresh
await supabase.auth.signOut()
```

Notes:
- `updateUser` requires an active session. If the session is absent (expired link), `getUser()` will return null — detect this and redirect to `/forgot-password`.
- After a successful reset the project pattern (per CONTEXT.md) is: show success state, then user manually navigates to `/login`. Calling `signOut()` after `updateUser` ensures the temporary recovery session is cleared and they must log in with the new password.

### 1.3 Resend Verification Email — `auth.resend`

Already implemented in `web/src/lib/actions/auth.ts` as `resendVerificationEmail`:

```ts
export async function resendVerificationEmail(email: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: error.message }
  return { success: true }
}
```

This is the correct API. No changes needed for the resend action itself. The `/verify-email` page and `ResendEmailTimer` component already consume it with a 60-second cooldown.

### 1.4 Auth Callback Route — Handling `type` Variants

The existing callback at `web/src/app/(auth)/auth/callback/route.ts` handles PKCE code exchange and already works for signup verification. It needs to be extended to also handle:

- **`type=recovery`** — password reset link: exchange code, then redirect to `/reset-password`
- **`type=signup`** — email verification link: exchange code, then redirect to `/login?verified=true`

The `type` query param is sent by Supabase in the callback URL. Extended callback logic:

```ts
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' | 'signup' | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Password reset flow
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }

      // Email verification flow
      if (type === 'signup') {
        return NextResponse.redirect(`${origin}/login?verified=true`)
      }

      // OAuth / other flows (existing logic)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const isNewOAuthUser =
          !user.user_metadata?.company_name &&
          user.app_metadata?.provider === 'google'
        if (isNewOAuthUser) {
          return NextResponse.redirect(`${origin}/complete-registration`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Exchange failed — expired or invalid link
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/forgot-password?error=expired`)
    }
    if (type === 'signup') {
      return NextResponse.redirect(`${origin}/verify-email?error=invalid`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

**Important:** The `error_code` returned by Supabase on an expired recovery link is `otp_expired`. When `exchangeCodeForSession` fails, inspect `error.code` to distinguish expired vs. truly invalid.

---

## 2. File Structure — New Files

Following the `(auth)` route group pattern exactly:

```
web/src/app/(auth)/
  forgot-password/
    page.tsx                      # PWD-01: email input form page
  reset-password/
    page.tsx                      # PWD-03: new password form page

web/src/components/auth/
  forgot-password-form.tsx        # Client form component (email field)
  reset-password-form.tsx         # Client form component (password + strength bar)

web/src/lib/actions/
  auth.ts                         # Add: requestPasswordReset, resetPassword

web/src/lib/validations/
  password-reset.ts               # Zod schemas: forgotPasswordSchema, resetPasswordSchema

web/messages/
  en.json                         # Add: forgotPassword, resetPassword namespaces
  es.json                         # Add: same namespaces in Spanish
```

The auth callback route at `web/src/app/(auth)/auth/callback/route.ts` is modified in place (not a new file).

The middleware at `web/src/lib/supabase/middleware.ts` is modified in place to add the email verification gate.

---

## 3. Existing Patterns to Follow

### 3.1 Page Layout

- `/forgot-password` and `/reset-password` use the **simple centered-card layout** (like `/verify-email`), not the split branding layout. These are simple utility pages, not acquisition pages.
- Pattern from `verify-email/page.tsx`: `min-h-screen flex items-center justify-center p-6`, with `absolute top-4 right-4` for `LanguageSwitcher`, a `rounded-xl border bg-card shadow-sm p-8` card.
- Both pages show a relevant icon above the title (Lock for reset, Mail for forgot) in a `w-16 h-16 rounded-full bg-primary/10` circle — matches the `MailCheck` icon pattern in `/verify-email`.
- Login page (`login/page.tsx`) already has the `?verified=true` search param path available — we add a success banner in `LoginForm` for when `verified=true` is in the URL.

### 3.2 Server Actions

All auth actions live in `web/src/lib/actions/auth.ts` with `'use server'` at the top. New actions follow the same discriminated union return pattern:

```ts
// requestPasswordReset — always returns success (enumeration protection)
export async function requestPasswordReset(
  email: string
): Promise<{ success: true } | { error: string }> { ... }

// resetPassword
export async function resetPassword(
  password: string
): Promise<{ success: true } | { error: 'no_session' | 'weak_password' | 'generic' }> { ... }
```

`signInWithEmail` (Phase 5) already uses this pattern.

### 3.3 Form Validation (Zod)

New file `web/src/lib/validations/password-reset.ts`:

```ts
import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
})
export type ForgotPasswordFormData = z.input<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})
export type ResetPasswordFormData = z.input<typeof resetPasswordSchema>
```

Use `z.input<typeof schema>` for `useForm<T>` type param (consistent with Phase 4/5 pattern — avoids zodResolver generic mismatch).

### 3.4 Client Form Components

Both forms use `react-hook-form` + `zodResolver` + `useTranslations` (same as `LoginForm`, `SignupForm`). Key patterns:

- `mode: 'onBlur'`, `reValidateMode: 'onChange'`
- `setError('root', { message: 'errorKey' })` for server errors
- Root error rendered as `rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive`
- Password show/hide toggle using `Eye`/`EyeOff` from `lucide-react` with `absolute right-3` button
- After a successful form action, **replace the form** with a success state (not a banner above a disabled form) — this is an explicit CONTEXT.md decision.

### 3.5 Password Strength Bar

`PasswordStrengthBar` already exists at `web/src/components/auth/password-strength-bar.tsx` and uses `useTranslations('signup.passwordStrength')`. For the reset-password form, we can either:

- **Option A (recommended):** Reuse `PasswordStrengthBar` as-is since it already translates from `signup.passwordStrength` keys which exist in both locales. No changes needed.
- **Option B:** Extract the `getPasswordStrength` function to a shared util and keep the component. Same result.

Use Option A — no refactor needed. Minimum password requirements (8+ chars, 1 uppercase, 1 number) are already encoded in both the Zod schema (`signupSchema`) and `getPasswordStrength`. The `resetPasswordSchema` must use identical constraints so Zod and UI agree.

### 3.6 Cooldown Timer for Resend

`ResendEmailTimer` at `web/src/components/auth/resend-email-timer.tsx` already implements the 60-second countdown pattern. The `/forgot-password` success state (email sent) also needs a resend button with identical behavior. Options:

- **Reuse `ResendEmailTimer` directly** for the forgot-password success state by passing the email prop and wiring it to `requestPasswordReset` instead. But `ResendEmailTimer` is hardcoded to call `resendVerificationEmail`.
- **Extract to a generic `ResendTimer` component** that accepts an `onResend` async callback. Both `ResendEmailTimer` and the forgot-password resend button use it.

Recommendation: Extract to a generic `ResendTimer` component accepting `onResend: () => Promise<void>` and use it in both places. This is a small refactor, cleaner than two separate implementations.

### 3.7 i18n

Locale detection is via `NEXT_LOCALE` cookie, with `Accept-Language` fallback. Messages are in `web/messages/en.json` and `web/messages/es.json`. New namespaces to add:

**`en.json` additions:**
```json
"forgotPassword": {
  "title": "Forgot your password?",
  "subtitle": "Enter your email and we'll send you a reset link",
  "email": "Email",
  "emailPlaceholder": "you@company.com",
  "submit": "Send reset link",
  "submitting": "Sending...",
  "successTitle": "Check your inbox",
  "successSubtitle": "If an account exists for {email}, you'll receive a reset link shortly",
  "successTip": "Can't find it? Check your spam or junk folder",
  "resend": "Resend link",
  "cooldown": "Resend in {seconds}s",
  "backToLogin": "Back to sign in",
  "errors": {
    "generic": "Something went wrong. Please try again."
  }
},
"resetPassword": {
  "title": "Set new password",
  "subtitle": "Choose a strong password for your account",
  "password": "New password",
  "passwordPlaceholder": "Min. 8 characters",
  "submit": "Update password",
  "submitting": "Updating...",
  "successTitle": "Password updated",
  "successSubtitle": "Your password has been changed successfully",
  "backToLogin": "Go to sign in",
  "expiredTitle": "Link expired",
  "expiredSubtitle": "This password reset link has expired",
  "requestNew": "Request a new link",
  "errors": {
    "noSession": "This link has expired. Please request a new one.",
    "weakPassword": "Password does not meet requirements.",
    "generic": "Something went wrong. Please try again."
  }
},
"login": {
  ...existing...,
  "verified": "Email verified! You can now sign in."
},
"verifyEmail": {
  ...existing...,
  "invalidLink": "This verification link is invalid or has expired.",
  "alreadyVerified": "Your email is already verified.",
  "requestNew": "Resend verification email"
}
```

**`es.json` additions** (Spanish, all human-readable text):
```json
"forgotPassword": {
  "title": "¿Olvidaste tu contraseña?",
  "subtitle": "Ingresa tu correo y te enviaremos un enlace",
  "email": "Correo electrónico",
  "emailPlaceholder": "tu@empresa.com",
  "submit": "Enviar enlace",
  "submitting": "Enviando...",
  "successTitle": "Revisa tu correo",
  "successSubtitle": "Si existe una cuenta para {email}, recibirás un enlace en breve",
  "successTip": "¿No lo ves? Revisa tu carpeta de spam",
  "resend": "Reenviar enlace",
  "cooldown": "Reenviar en {seconds}s",
  "backToLogin": "Volver al inicio de sesión",
  "errors": {
    "generic": "Algo salió mal. Inténtalo de nuevo."
  }
},
"resetPassword": {
  "title": "Nueva contraseña",
  "subtitle": "Elige una contraseña segura para tu cuenta",
  "password": "Nueva contraseña",
  "passwordPlaceholder": "Mín. 8 caracteres",
  "submit": "Actualizar contraseña",
  "submitting": "Actualizando...",
  "successTitle": "Contraseña actualizada",
  "successSubtitle": "Tu contraseña fue cambiada exitosamente",
  "backToLogin": "Ir a iniciar sesión",
  "expiredTitle": "Enlace expirado",
  "expiredSubtitle": "Este enlace para restablecer contraseña ha expirado",
  "requestNew": "Solicitar nuevo enlace",
  "errors": {
    "noSession": "Este enlace ha expirado. Solicita uno nuevo.",
    "weakPassword": "La contraseña no cumple los requisitos.",
    "generic": "Algo salió mal. Inténtalo de nuevo."
  }
},
"login": {
  ...existing...,
  "verified": "¡Email verificado! Ya puedes iniciar sesión."
},
"verifyEmail": {
  ...existing...,
  "invalidLink": "Este enlace de verificación es inválido o ha expirado.",
  "alreadyVerified": "Tu email ya está verificado.",
  "requestNew": "Reenviar correo de verificación"
}
```

---

## 4. Email Verification Gate in Middleware

The current `web/src/lib/supabase/middleware.ts` checks authentication but does NOT enforce email verification. CONTEXT.md requires: unverified users can log in but are redirected to `/verify-email`.

The middleware needs to add an email verification gate **after** the existing auth check:

```ts
// After the existing "not user → redirect to /login" block:

// Email verification gate
if (
  user &&
  !user.email_confirmed_at &&
  !request.nextUrl.pathname.startsWith('/verify-email') &&
  !request.nextUrl.pathname.startsWith('/auth/') &&
  (request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/app/'))
) {
  const url = request.nextUrl.clone()
  url.pathname = '/verify-email'
  url.searchParams.set('email', user.email ?? '')
  return NextResponse.redirect(url)
}
```

Notes:
- `user.email_confirmed_at` is the field Supabase populates when the user clicks their verification link.
- Must exclude `/verify-email` and `/auth/` from the gate to prevent redirect loops.
- Google OAuth users will always have `email_confirmed_at` set (Google verifies emails), so this only affects email/password signups.
- `signInWithEmail` Server Action (Phase 5) already returns `{ error: 'email_not_verified' }` and the `LoginForm` redirects to `/verify-email`. The middleware gate is a defense-in-depth measure for direct URL access.

---

## 5. Password Strength Validation

### Approach

The `PasswordStrengthBar` component at `web/src/components/auth/password-strength-bar.tsx` already implements the correct strength logic and visual bar (red → yellow → green with label). It is already used in the signup form.

For the reset-password form: import and use `PasswordStrengthBar` unchanged. Wire it to `watch('password')`:

```tsx
// Inside ResetPasswordForm (client component)
const password = watch('password')
// ...
<Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} />
<PasswordStrengthBar password={password} />
```

### Zod schema enforcement

Minimum validation rules (8+ chars, 1 uppercase, 1 number) are enforced at the Zod level in `resetPasswordSchema`. Client-side validation via `zodResolver` prevents form submission for weak passwords. The strength bar is a UX aid; Zod is the gate.

### Retrofit to Registration (Phase 4 scope note)

CONTEXT.md says to apply the strength bar to the registration form too "for consistency." The `SignupForm` component lives at `web/src/components/auth/signup-form.tsx`. It already imports `PasswordStrengthBar` (confirmed from glob). This is already done — no retrofit needed.

---

## 6. Success States — Form Replacement Pattern

Both pages replace the form entirely on success (not show a banner above a disabled form). Implement with a `submitted` boolean state:

```tsx
const [submitted, setSubmitted] = useState(false)
const [submittedEmail, setSubmittedEmail] = useState('')

if (submitted) {
  return <ForgotPasswordSuccess email={submittedEmail} />
}

return <form>...</form>
```

The success UI is a separate JSX block (or a sub-component) that receives props from the parent. This is the pattern used in the verify-email page's conditional `setup` state rendering.

---

## 7. Edge Cases and Error Handling

### 7.1 Expired Reset Link

When `exchangeCodeForSession` fails in the callback:
- The callback redirects to `/forgot-password?error=expired`.
- The forgot-password page reads `searchParams.error` and shows an inline error: "Este enlace ha expirado" with a "Solicitar nuevo enlace" button (which is just the form again, pre-focused on email).
- The page Server Component reads `searchParams` as `Promise<{ error?: string }>` (Next.js 15 async pattern, consistent with `LoginPage`).

### 7.2 Already-Verified Email Verification Link

When a user clicks a verification link but `email_confirmed_at` is already set:
- `exchangeCodeForSession` still succeeds (Supabase doesn't error on re-verification).
- The callback sees `type=signup` and redirects to `/login?verified=true`.
- The login page shows the "Email verified! You can now sign in." banner.
- This is the correct behavior — indistinguishable from first-time verification, which is fine UX.

### 7.3 Invalid / Malformed Verification Link

When `exchangeCodeForSession` fails for `type=signup`:
- The callback redirects to `/verify-email?error=invalid`.
- The verify-email page detects `error=invalid` in `searchParams` and shows "Este enlace es inválido o ha expirado" with the resend button visible.
- The verify-email page already accepts `email` from searchParams — if email is absent (e.g., user clicked link directly without prior session), show the error without the masked email.

### 7.4 `/reset-password` Accessed Without Session

A user navigates directly to `/reset-password` without going through the email link flow. The Server Action `resetPassword` calls `supabase.auth.getUser()` — if no session exists, it returns `{ error: 'no_session' }`. The reset-password page should also check session server-side at page load (in the Server Component) and redirect to `/forgot-password` immediately, rather than showing the form and failing on submit.

```ts
// In reset-password/page.tsx (Server Component)
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect('/forgot-password?error=no_session')
}
```

### 7.5 Rate Limiting — Resend Buttons

Both the forgot-password resend and the verify-email resend use a 60-second client-side cooldown (using the existing `ResendEmailTimer` pattern). Server-side rate limiting on resend is handled by Supabase / the configured SMTP provider. No additional server-side rate limiting is needed in this phase (the project's SMTP provider in Phase 3 was configured with Supabase's custom SMTP).

If the resend Server Action returns an error (e.g., Supabase rate limit hit), surface a generic error message below the button. The `ResendEmailTimer` component currently ignores errors from `resendVerificationEmail` — this should be fixed for both the existing component and the new forgot-password resend.

### 7.6 Email Masking

The verify-email page CONTEXT.md spec says to show a partially masked email: `p***@gmail.com`. This is a display-only transformation applied in the page Server Component or passed as a prop:

```ts
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local[0]}***@${domain}`
}
```

Apply in `verify-email/page.tsx` before rendering. The current page shows the full unmasked email — this needs updating in Phase 6.

---

## 8. Supabase Dashboard Configuration Required

Before testing, verify these are set in the Supabase Dashboard:

1. **Auth → URL Configuration → Redirect URLs** — add:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://app.aideas.com/auth/callback` (production)
   - These likely already exist from Phase 3, but confirm.

2. **Auth → Email Templates** — the "Reset Password" email template was customized in Phase 3. Verify the `{{ .ConfirmationURL }}` link points to the app's callback route.

3. No new Supabase config changes are needed beyond confirming the above.

---

## 9. Implementation Order (Recommended)

1. **Extend auth callback** (`auth/callback/route.ts`) — handle `type=recovery` and `type=signup` redirects and error cases.
2. **Add Server Actions** (`auth.ts`) — `requestPasswordReset`, `resetPassword`.
3. **Add Zod schemas** (`validations/password-reset.ts`).
4. **Add i18n keys** (`messages/en.json`, `messages/es.json`).
5. **Build `/forgot-password` page + form component** — email input, success state with cooldown resend.
6. **Build `/reset-password` page + form component** — password input + strength bar, success state, expired link detection.
7. **Update middleware** — add email verification gate for `/dashboard` and `/app/*`.
8. **Update login page** — add `verified=true` banner in `LoginForm`.
9. **Fix email masking** in `verify-email/page.tsx`.
10. **Refactor `ResendEmailTimer`** into generic `ResendTimer` — only if time permits; can be a follow-up.

---

## 10. Summary

| Requirement | Implementation |
|-------------|----------------|
| PWD-01 `/forgot-password` | New page + `ForgotPasswordForm` client component |
| PWD-02 Reset email via Supabase | `requestPasswordReset` Server Action → `supabase.auth.resetPasswordForEmail` |
| PWD-03 `/reset-password` | New page + `ResetPasswordForm` client component |
| PWD-04 Password strength | Reuse existing `PasswordStrengthBar` + Zod validation in `resetPasswordSchema` |
| PWD-05 Confirmation message | Success state replaces form in `ResetPasswordForm` |
| PWD-06 Redirect to login | Manual button in success state (no auto-redirect per CONTEXT.md) |
| VERIFY-01 Verification email on signup | Already implemented in Phase 4 (`signUpWithEmail` passes `emailRedirectTo`) |
| VERIFY-02 Verification link confirms | Auth callback extended: `type=signup` → `exchangeCodeForSession` → redirect to `/login?verified=true` |
| VERIFY-03 `/verify-email` status | Already exists; extend with `error=invalid` handling and email masking |
| VERIFY-04 Unverified redirect | Middleware gate: `!user.email_confirmed_at` on `/dashboard` → `/verify-email` |
| VERIFY-05 Resend verification | Already implemented; minor: fix error handling in `ResendEmailTimer` |

*Phase: 06-password-recovery-and-email-verification*
*Research completed: 2026-04-01*
