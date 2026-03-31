# Phase 5: User Login - Research

**Researched:** 2026-03-31
**Domain:** Next.js authentication with Supabase SSR, session management, React Hook Form, next-intl
**Confidence:** HIGH

## Summary

Phase 5 builds a login experience that mirrors the Phase 4 registration UI (split layout, same component library, same i18n pattern). The core authentication logic is already wired up — `supabase.auth.signInWithPassword()` on the client, session persisted via cookies through `@supabase/ssr`, and the auth/callback route already handles Google OAuth. The existing login page at `/login` is a barebones placeholder (plain card, no i18n, no "Remember me", no Google OAuth button) that needs to be fully replaced.

The middleware already protects `/dashboard` and redirects authenticated users away from `/login`, so auth guard is complete. A dashboard placeholder and `DashboardNav` with logout also already exist (in English only). The main work is: (1) rebuild `LoginForm` as a proper component following the SignupForm pattern with react-hook-form + Zod + Server Action, (2) add "Remember me" / rate limiting (client-side counter, 5 attempts), (3) wire multi-tab logout via `onAuthStateChange`, (4) add `login` namespace to both message files, and (5) update the dashboard placeholder to use i18n and show the user's first name.

The session/cookie lifetime for "Remember me" cannot be directly configured via Supabase JS client v2 `signInWithPassword` (no `expiresIn` option in that call). Session duration is controlled by Supabase project settings (Auth > Sessions > JWT expiry) or by the `cookieOptions.maxAge` on `createBrowserClient`. The practical approach for "remember me" in a cookie-based SSR setup is to use the existing Supabase cookie (which defaults to ~1 hour access token + ~1 week refresh token refresh behavior) and treat "remember me" as whether to **not** use a session-scoped cookie — however, the current `@supabase/ssr` cookie setup uses defaults that are already persistent (not session cookies). Rate limiting (5 attempts → lockout with countdown) is best implemented client-side in component state since Supabase's server-side password verification hook requires Supabase Pro plan.

**Primary recommendation:** Rebuild the `/login` page following the exact same component split and action pattern as Phase 4 (Server Component page → `LoginForm` client component → `signInWithEmail` Server Action). Implement rate limiting purely client-side (counter in state, localStorage for persistence across page reloads). Implement multi-tab logout via `onAuthStateChange` in a root-level client component or inside LoginForm's useEffect on mount. Update middleware to also protect `/app/*` routes.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Layout and design:**
- Reuse the same split layout from registration (branding left, form right)
- Left panel content: different from registration — Claude's discretion (e.g., welcome back message)
- Mobile: same behavior as registration (left panel hidden, form centered with logo)
- Google OAuth button: same position relative to form fields as in registration page
- Checkbox "Recordarme" (Remember me) below the password field
- Password field has show/hide toggle (eye icon)
- "¿Olvidaste tu contraseña?" link below the password field, right-aligned
- "¿No tienes cuenta? Regístrate" link below the login button, linking to /register
- Language selector (ES | EN) identical to registration: top-right corner, auto-detect from browser

**Error handling and states:**
- Wrong credentials: inline red message below the form — "Email o contraseña incorrectos" — no page reload, password field cleared
- Unverified user attempts login: redirect to /verify-email (no credential error shown)
- Rate limiting: block after 5 failed attempts — show "Demasiados intentos. Inténtalo en X minutos." with countdown
- Google OAuth errors: toast notification at top, disappears in 5 seconds (consistent with registration)

**Session persistence:**
- "Remember me" checked: session lasts 30 days
- "Remember me" unchecked: browser session (closes when all tabs closed)
- Token storage: Claude's discretion (choose the most secure approach that works with the current stack)
- Session expiry while using app: redirect to /login with message "Tu sesión ha expirado. Inicia sesión de nuevo."
- Multi-tab sync: logout in one tab triggers redirect to /login in all other tabs
- Multi-device: unlimited simultaneous sessions allowed

**Logout:**
- Logout button visible in the dashboard header (top-right user menu area)
- After logout: redirect to /login
- Logout clears all session data

**Redirects and auth guard:**
- Successful login: always redirect to /dashboard
- Visiting /login while authenticated: immediate redirect to /dashboard
- Auth middleware protects: /dashboard and everything under /app/*
- Public routes (no auth required): /login, /register, /verify-email, /forgot-password, /reset-password

**Dashboard placeholder:**
- Simple page: "Bienvenido, [nombre]" greeting + logout button
- No real content — just enough to confirm login works
- Real dashboard content comes in future phases

**Google OAuth edge case (new user via login):**
- If Google OAuth on login page detects a new user (no organization), redirect to company name step (same flow as registration in Phase 4)
- After org creation, redirect to /dashboard

**Internationalization (i18n):**
- Same i18n setup as registration: bilingual ES/EN, auto-detect, selector in top-right corner
- All login page text, error messages, and dashboard placeholder are translatable

### Claude's Discretion
- Left panel content (welcome back message, icons, copy)
- Token storage approach (most secure that works with current stack)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LOGIN-01 | Login page at `/login` with email + password form | Replace existing placeholder at `web/src/app/(auth)/login/page.tsx` — split layout matching signup page |
| LOGIN-02 | Login via Supabase Auth with JWT in cookies | `supabase.auth.signInWithPassword()` via Server Action; `@supabase/ssr` handles cookie storage — already wired in lib/supabase/* |
| LOGIN-03 | Redirect to `/dashboard` after successful login | `router.push('/dashboard')` after successful Server Action; middleware already redirects auth users from /login → /dashboard |
| LOGIN-04 | Error message for incorrect credentials | Server Action returns typed error; form `setError('root', ...)` displays inline — same pattern as SignupForm |
| LOGIN-05 | Link to forgot password page | `<Link href="/forgot-password">` in form — page is placeholder for Phase 6 |
| LOGIN-06 | Google OAuth login option | `GoogleOAuthButton` component already exists; pass `redirectTo="/dashboard"` (differs from signup's `/complete-registration`) |
| LOGIN-07 | Session persists across browser refresh | `@supabase/ssr` cookies + middleware `updateSession` already handles token refresh — validated in existing middleware.ts |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | `^0.8.0` | Cookie-based session management, server client, browser client | Already in project; handles cookie chunking, token refresh |
| `@supabase/supabase-js` | `^2.95.0` | Auth client methods (`signInWithPassword`, `onAuthStateChange`, `signOut`) | Already in project |
| `react-hook-form` | `^7.71.1` | Form state, validation, error display | Already used in SignupForm — consistent pattern |
| `@hookform/resolvers` | `^5.2.2` | Zod integration for react-hook-form | Already in project |
| `zod` | `^4.3.6` | Schema validation for login form | Already in project — add `loginSchema` to validations |
| `next-intl` | `^4.8.3` | i18n translations | Already in project — add `login` namespace to en.json/es.json |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | `^0.563.0` | Eye/EyeOff icons (password toggle), lock/mail icons | Password show/hide toggle — already used in SignupForm |

### Not Needed (Don't Add)
- No new rate-limit library: client-side counter in `useState` + `localStorage` is sufficient for 5-attempt UI lock
- No new cookie library: `@supabase/ssr` manages all cookie operations
- No toast library: Google OAuth errors use the existing inline dismissible pattern from `GoogleOAuthButton` — no additional library

**Installation:** No new packages needed — all dependencies already in `web/package.json`.

---

## Architecture Patterns

### Project File Structure for This Phase
```
web/src/
├── app/(auth)/login/
│   └── page.tsx                    # Replace placeholder — Server Component, matches signup/page.tsx
├── components/auth/
│   ├── login-form.tsx              # NEW: client component — react-hook-form + Zod
│   └── auth-sync.tsx               # NEW: client component — onAuthStateChange for multi-tab logout
├── lib/
│   ├── actions/auth.ts             # ADD: signInWithEmail Server Action
│   └── validations/
│       └── login.ts                # NEW: loginSchema (email + password + rememberMe)
├── i18n/
│   ├── en.json                     # ADD: "login" namespace
│   └── es.json                     # ADD: "login" namespace (Spanish)
└── middleware.ts                   # UPDATE: add /app/* to protected routes matcher
```

### Dashboard files that need updating:
```
web/src/
├── app/(dashboard)/dashboard/
│   └── page.tsx                    # UPDATE: i18n greeting ("Bienvenido, [nombre]"), simpler placeholder
└── components/dashboard/
    └── nav.tsx                     # UPDATE: logout redirects to /login (already does), i18n for nav labels
```

### Pattern 1: Server Component Page → Client Form Component
**What:** Same as signup — page.tsx is async Server Component that loads translations, renders split layout and passes nothing to the form (form fetches its own data).
**When to use:** All auth pages — consistent, allows server-side translation loading

```typescript
// Source: follows web/src/app/(auth)/signup/page.tsx pattern
// web/src/app/(auth)/login/page.tsx
import { getTranslations } from 'next-intl/server'
import { LoginForm } from '@/components/auth/login-form'
import { LanguageSwitcher } from '@/components/auth/language-switcher'
import Image from 'next/image'
import { CheckCircle, TrendingUp, Users } from 'lucide-react'

export default async function LoginPage() {
  const t = await getTranslations('login')
  // Left panel uses "welcome back" theme — different from signup benefits
  const highlights = [
    { icon: CheckCircle, text: t('branding.highlight1') },
    { icon: TrendingUp, text: t('branding.highlight2') },
    { icon: Users, text: t('branding.highlight3') },
  ]
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — same CSS as signup */}
      <div className="hidden lg:flex lg:w-1/2 ...">...</div>
      {/* Right form panel */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center lg:hidden">
            <Image src="/logo.png" alt="AIDEAS" width={100} height={32} priority />
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 2: Login Server Action
**What:** Server Action in `lib/actions/auth.ts` — calls `supabase.auth.signInWithPassword()`, checks email_confirmed, returns typed result
**When to use:** All form submissions that mutate auth state

```typescript
// Source: follows signUpWithEmail pattern in web/src/lib/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function signInWithEmail(formData: { email: string; password: string }): Promise<
  | { success: true }
  | { error: 'invalid_credentials' | 'email_not_verified' | 'generic'; message?: string }
> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    // Supabase returns "Invalid login credentials" for wrong password OR unverified email
    // Check email_confirmed separately
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      return { error: 'email_not_verified' }
    }
    return { error: 'invalid_credentials' }
  }

  // Double-check email confirmation (Supabase may allow login before confirm in some configs)
  if (data.user && !data.user.email_confirmed_at) {
    return { error: 'email_not_verified' }
  }

  return { success: true }
}
```

**Important:** Supabase `signInWithPassword` from a Server Action (server client) sets the session cookie automatically via `@supabase/ssr`. The browser client does NOT need to be called for login — the server action handles it.

### Pattern 3: "Remember Me" Session Duration
**What:** Supabase SSR sets cookies with its own `maxAge`. To implement "remember me" (30 days vs session-only), the approach is to store a `rememberMe` flag and control the **cookie expiry** at the browser client level.

**How it works in this stack:**
- Supabase access token expires per project settings (default 3600s / 1 hour), but the **refresh token** is long-lived
- `@supabase/ssr` sets cookies with a default `maxAge` that persists them
- "Browser session" (no remember me) = set cookie without `maxAge` (session cookie, deleted when browser closes)
- "30-day session" (remember me) = set cookie with `maxAge: 60 * 60 * 24 * 30`

**Implementation approach (pragmatic):**
Since `createBrowserClient` handles all cookie setting internally, and the Server Action uses `createServerClient`, the cleanest approach is:
1. On successful login, if `rememberMe=false`, immediately call `supabase.auth.getSession()` client-side and re-set the auth cookies as session cookies (no maxAge). This is complex.
2. **Simpler alternative:** Store `rememberMe` preference in a separate cookie after login. On middleware `updateSession`, if `rememberMe` cookie is absent or false, check if the browser session was closed (not detectable server-side).
3. **Most practical for v1:** The user decision says "browser session closes when all tabs closed" for unchecked — this is the **default browser behavior for session cookies**. Since `@supabase/ssr` already sets persistent cookies by default, "remember me" unchecked means we override `cookieOptions.maxAge` to undefined (session cookie). This requires a custom Supabase client init.

**Recommended implementation:**
- Add `rememberMe: z.boolean().default(false)` to `loginSchema`
- After successful `signInWithPassword` in Server Action, if `!rememberMe`, set a `sb-remember-me=false` cookie with `maxAge: undefined` (session cookie behavior)
- On `createBrowserClient` in `lib/supabase/client.ts`, check for `sb-remember-me` cookie and set `cookieOptions.maxAge` accordingly
- This is a best-effort approach — Supabase SSR doesn't have a native "session cookie" mode per official docs

**Confidence:** MEDIUM — the cookie maxAge override approach is verified as possible per `@supabase/ssr` docs (custom `cookieOptions`), but interaction with token refresh behavior needs validation.

### Pattern 4: Multi-Tab Logout Sync
**What:** When user signs out in one tab, all other tabs redirect to /login
**Implementation:** `supabase.auth.onAuthStateChange` on the browser client

```typescript
// Source: Supabase official docs - onAuthStateChange
// web/src/components/auth/auth-sync.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      if (event === 'TOKEN_REFRESHED') {
        // Session refreshed — no action needed, middleware handles cookie update
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return null
}
```

Place `<AuthSync />` in the dashboard layout (`(dashboard)/layout.tsx`) so it only runs when authenticated.

### Pattern 5: Client-Side Rate Limiting (5 attempts)
**What:** Track failed login attempts in component state + localStorage. After 5 failures within a session, show countdown lockout.

```typescript
// In LoginForm component state
const [failedAttempts, setFailedAttempts] = useState(() => {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('login_failed_attempts')
  if (!stored) return 0
  const { count, lockedUntil } = JSON.parse(stored)
  if (lockedUntil && Date.now() < lockedUntil) return count
  return 0
})
const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('login_failed_attempts')
  if (!stored) return null
  const { lockedUntil } = JSON.parse(stored)
  return lockedUntil && Date.now() < lockedUntil ? lockedUntil : null
})

// On failed credential attempt:
const newCount = failedAttempts + 1
if (newCount >= 5) {
  const until = Date.now() + 10 * 60 * 1000 // 10 minutes
  localStorage.setItem('login_failed_attempts', JSON.stringify({ count: newCount, lockedUntil: until }))
  setLockedUntil(until)
} else {
  localStorage.setItem('login_failed_attempts', JSON.stringify({ count: newCount, lockedUntil: null }))
}
setFailedAttempts(newCount)
```

**Note:** The CONTEXT.md says "X minutos" without specifying — use 10 minutes (standard industry practice). Clear on successful login.

### Pattern 6: Zod Login Schema
```typescript
// web/src/lib/validations/login.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

### Pattern 7: i18n Namespace Structure for Login
```json
// messages/en.json — add "login" key
"login": {
  "title": "Welcome back",
  "subtitle": "Sign in to your account",
  "email": "Email",
  "emailPlaceholder": "you@company.com",
  "password": "Password",
  "passwordPlaceholder": "••••••••",
  "rememberMe": "Remember me",
  "forgotPassword": "Forgot your password?",
  "submit": "Sign in",
  "submitting": "Signing in...",
  "googleButton": "Continue with Google",
  "noAccount": "Don't have an account?",
  "register": "Sign up",
  "or": "or",
  "errors": {
    "invalidCredentials": "Invalid email or password.",
    "emailNotVerified": "Please verify your email before signing in.",
    "tooManyAttempts": "Too many attempts. Try again in {minutes} minutes.",
    "generic": "Something went wrong. Please try again."
  },
  "sessionExpired": "Your session has expired. Please sign in again.",
  "branding": {
    "headline": "Welcome back",
    "subheadline": "Your automations are running. Check in on your business.",
    "highlight1": "Real-time automation monitoring",
    "highlight2": "Track ROI and time saved",
    "highlight3": "Collaborate with your team"
  }
}
```

### Anti-Patterns to Avoid
- **Calling signInWithPassword from a "use client" component directly:** The existing placeholder does this. It works but bypasses the Server Action pattern established in Phase 4 (which enables server-side validation, better error mapping, and avoids exposing Supabase errors to the client).
- **Storing JWT in localStorage:** `@supabase/ssr` uses httpOnly cookies — do NOT override this.
- **Implementing server-side rate limiting with a DB hook:** Requires Supabase Pro plan for Auth hooks. Use client-side approach for v1.
- **Using router.refresh() alone after login:** The existing placeholder does `router.push("/dashboard"); router.refresh()` — with Server Actions and `@supabase/ssr`, the cookie is set server-side; `router.push` is sufficient.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie management | Custom cookie read/write | `@supabase/ssr` `createBrowserClient` / `createServerClient` | Cookie chunking (3180 byte limit), automatic refresh, SameSite attributes |
| Google OAuth flow | Custom OAuth redirect handler | Existing `GoogleOAuthButton` + `/auth/callback/route.ts` | PKCE flow already implemented; callback detects new users |
| Password show/hide | Custom toggle | `useState` + `Eye`/`EyeOff` from lucide-react | Already done in SignupForm — copy the pattern |
| Form validation | Custom validation logic | `loginSchema` (Zod) + `zodResolver` | Consistent with SignupForm pattern |
| Language switching | Cookie management | `LanguageSwitcher` component | Already built — just import |

**Key insight:** The auth plumbing (Supabase clients, middleware, OAuth callback) is 100% reusable from Phase 3/4. Phase 5 is primarily a UI build with a thin Server Action layer.

---

## Common Pitfalls

### Pitfall 1: "Email not confirmed" error surface
**What goes wrong:** Supabase returns `AuthApiError: Email not confirmed` when an unverified user attempts login. The CONTEXT decision says redirect to /verify-email (not show a credential error). But the error message from Supabase can vary by project config.
**Why it happens:** Supabase project may have "Confirm email" enabled — login is blocked until verification.
**How to avoid:** In the Server Action, check `error.message` for `"email not confirmed"` (case-insensitive). Also check `data.user?.email_confirmed_at` explicitly if `error` is null (some Supabase versions allow login before confirm).
**Warning signs:** Users stuck on login page after registration without verify-email redirect.

### Pitfall 2: "Remember me" + @supabase/ssr cookie interaction
**What goes wrong:** `@supabase/ssr` sets auth cookies with `maxAge` by default. Setting `maxAge: undefined` in `cookieOptions` doesn't automatically convert them to session cookies in all SSR scenarios because the middleware's `updateSession` may re-set cookies with default options on each request.
**Why it happens:** `updateSession` in middleware calls `setAll` with the original cookie options from the initial auth. The `rememberMe` preference needs to be threaded through.
**How to avoid:** Store `rememberMe=false` as a separate cookie (non-auth). In `middleware.ts` `updateSession`, after `supabase.auth.getUser()`, if `rememberMe` cookie is `false`, override the Supabase cookie `maxAge` to `undefined` in the `setAll` callback.
**Warning signs:** Sessions persist even after "remember me" is unchecked and browser is restarted.

### Pitfall 3: Multi-tab logout not triggering
**What goes wrong:** `onAuthStateChange` only fires in the **same tab** by default in some Supabase SDK versions. Cross-tab sync requires the BroadcastChannel API (used internally by Supabase JS v2).
**Why it happens:** Supabase JS v2 uses a storage event listener (`localStorage`) for cross-tab communication. This works if `storageKey` is consistent across tabs.
**How to avoid:** Use `createBrowserClient` (singleton) — the `isSingleton: true` default ensures the same storage key. `onAuthStateChange` with `SIGNED_OUT` **does** fire cross-tab in Supabase JS v2 via localStorage events.
**Warning signs:** Logout in one tab doesn't redirect other tabs. Test explicitly in dev.

### Pitfall 4: `useTranslations` in Server Action context
**What goes wrong:** Server Actions run in server context. `useTranslations` (client hook) cannot be used there.
**Why it happens:** Mixing server/client i18n APIs.
**How to avoid:** Return error **keys** (not messages) from Server Action: `{ error: 'invalid_credentials' }`. The `LoginForm` client component maps keys to translated strings via `useTranslations('login')`.

### Pitfall 5: `next` param in Google OAuth callback for login page
**What goes wrong:** The `GoogleOAuthButton` component uses `redirectTo="/complete-registration"` by default. On the login page, it should redirect to `/dashboard`.
**Why it happens:** Default prop value was set for signup flow.
**How to avoid:** Pass `redirectTo="/dashboard"` when using `GoogleOAuthButton` on the login page.

### Pitfall 6: Middleware not protecting `/app/*`
**What goes wrong:** The current middleware only protects `/dashboard`. CONTEXT.md says `/app/*` should also be protected.
**Why it happens:** Current `updateSession` in `middleware.ts` only checks `request.nextUrl.pathname.startsWith('/dashboard')`.
**How to avoid:** Update the condition to: `pathname.startsWith('/dashboard') || pathname.startsWith('/app/')`.

---

## Code Examples

### signInWithEmail Server Action (complete)
```typescript
// Source: follows signUpWithEmail pattern in web/src/lib/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'

type LoginResult =
  | { success: true }
  | { error: 'invalid_credentials' | 'email_not_verified' | 'generic' }

export async function signInWithEmail(
  formData: { email: string; password: string }
): Promise<LoginResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      return { error: 'email_not_verified' }
    }
    // "Invalid login credentials" covers wrong email/password
    return { error: 'invalid_credentials' }
  }

  // Defensive check: email_confirmed_at may be null even without error in some configs
  if (data.user && !data.user.email_confirmed_at) {
    return { error: 'email_not_verified' }
  }

  return { success: true }
}
```

### LoginForm submit handler (excerpt)
```typescript
// Source: follows SignupForm pattern in web/src/components/auth/signup-form.tsx
const handleFormSubmit = async (data: LoginFormData) => {
  if (lockedUntil && Date.now() < lockedUntil) return // UI already blocks, safety guard

  const result = await signInWithEmail({ email: data.email, password: data.password })

  if ('error' in result) {
    if (result.error === 'email_not_verified') {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
      return
    }
    if (result.error === 'invalid_credentials') {
      const newCount = failedAttempts + 1
      setValue('password', '') // Clear password field per CONTEXT.md decision
      if (newCount >= 5) {
        const until = Date.now() + 10 * 60 * 1000
        setLockedUntil(until)
        localStorage.setItem('login_failed_attempts', JSON.stringify({ count: newCount, lockedUntil: until }))
      } else {
        setFailedAttempts(newCount)
        localStorage.setItem('login_failed_attempts', JSON.stringify({ count: newCount, lockedUntil: null }))
        setError('root', { message: 'invalid_credentials' }) // key, not message
      }
      return
    }
    setError('root', { message: 'generic' })
    return
  }

  // Success — clear rate limit state
  localStorage.removeItem('login_failed_attempts')
  router.push('/dashboard')
}
```

### AuthSync for multi-tab logout
```typescript
// Source: Supabase docs - onAuthStateChange
// web/src/components/auth/auth-sync.tsx
'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthSync() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  return null
}
```

### Updated middleware protected routes
```typescript
// Source: web/src/lib/supabase/middleware.ts — update condition
if (
  !user &&
  (request.nextUrl.pathname.startsWith('/dashboard') ||
   request.nextUrl.pathname.startsWith('/app/'))
) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localStorage` JWT storage | Cookie-based via `@supabase/ssr` | Supabase JS v2 / @supabase/ssr introduction | Enables SSR session access, prevents XSS token theft |
| Calling auth from client component directly | Server Action + server client | Phase 4 pattern established | Better error mapping, server-side validation |
| `supabase.auth.signIn()` | `supabase.auth.signInWithPassword()` | Supabase JS v2 | Old method removed; new one is explicit about method type |
| `useUser()` hook (from older Supabase helpers) | `supabase.auth.getUser()` (server) | @supabase/ssr v0.x | `getUser()` makes network request to validate token; more secure than `getSession()` for server use |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` — do NOT import from auth-helpers
- `supabase.auth.getSession()` for server-side auth checks: Use `getUser()` instead (session can be spoofed; getUser validates with server)

---

## Open Questions

1. **"Remember me" = 30 days: how to implement with @supabase/ssr**
   - What we know: `cookieOptions.maxAge` can be set on `createBrowserClient`. Default Supabase session is ~1 week (refresh token expiry configurable in Supabase project settings).
   - What's unclear: Whether overriding `cookieOptions.maxAge` on `createBrowserClient` affects the auth cookie lifetime, or if Supabase project-level session settings override it. The 30-day requirement may need a Supabase project settings change (Auth > Sessions > JWT expiry / refresh token lifetime).
   - Recommendation: Set Supabase project refresh token lifetime to 30 days (in dashboard). For "no remember me", store a `sb-no-persist` session cookie and on `onAuthStateChange(SIGNED_IN)` client-side, call `supabase.auth.signOut()` if the browser session was previously closed (not easily detectable). **Practical v1 approach:** Accept that Supabase SSR cookies are always persistent (this is the default behavior) and implement "remember me" as a UX affordance only — the checkbox is shown but true session-cookie behavior is deferred. Validate this tradeoff with user.

2. **Session expiry redirect with message**
   - What we know: `onAuthStateChange` fires `TOKEN_REFRESHED` on refresh and `SIGNED_OUT` when session truly expires.
   - What's unclear: The exact event fired when a refresh token expires (after the user closes the browser for a long time). It may be `SIGNED_OUT` or may not fire until the user opens the app again.
   - Recommendation: Handle in `AuthSync` — on `SIGNED_OUT`, redirect to `/login?reason=expired` and show a dismissible banner on the login page when `reason=expired` is in searchParams.

---

## Validation Architecture

> nyquist_validation is not in config.json — skip this section.

---

## Sources

### Primary (HIGH confidence)
- `/supabase/ssr` (Context7) — `createBrowserClient` cookie options, session persistence, `createBrowserClient` overview
- `/supabase/supabase` (Context7) — `onAuthStateChange`, `signOut`, rate limiting password hook, async auth overhaul
- `web/src/lib/supabase/middleware.ts` — existing middleware pattern (direct read)
- `web/src/components/auth/signup-form.tsx` — react-hook-form pattern (direct read)
- `web/src/lib/actions/auth.ts` — Server Action pattern (direct read)
- `web/src/app/(auth)/auth/callback/route.ts` — OAuth callback pattern (direct read)
- `web/src/app/(auth)/signup/page.tsx` — split layout pattern (direct read)

### Secondary (MEDIUM confidence)
- Supabase `signInWithPassword` error message format ("email not confirmed", "Invalid login credentials") — verified via multiple project examples; exact string may vary by Supabase version
- "Remember me" via `cookieOptions.maxAge` override — documented in `@supabase/ssr` custom cookie handling example; interaction with middleware token refresh not confirmed

### Tertiary (LOW confidence)
- Cross-tab logout via `onAuthStateChange` + `SIGNED_OUT` — documented in React Native example; behavior in Next.js App Router with `createBrowserClient` (singleton) should be identical but not directly confirmed in official Next.js guide

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new installs
- Architecture: HIGH — directly mirrors Phase 4 patterns; Server Action + Server Component + Client Form is confirmed working
- "Remember me" implementation: MEDIUM — cookie maxAge override is documented but full interaction with middleware refresh needs validation
- Pitfalls: HIGH — sourced from project code inspection + official Supabase docs

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable stack; @supabase/ssr API unlikely to change)
