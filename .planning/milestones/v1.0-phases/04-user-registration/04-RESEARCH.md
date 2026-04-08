# Phase 4: User Registration - Research

**Researched:** 2026-03-31
**Domain:** Next.js 16 / React 19 signup form, Supabase Auth (email + Google OAuth), org creation trigger, i18n, reCAPTCHA v3
**Confidence:** HIGH (stack verified against existing codebase and official docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Signup form layout**
- Split layout: left panel with branding, right panel with form
- On mobile: left panel hidden, only form shown centered with logo above
- Name and surname as separate fields (not a single "full name" field)
- Company name field is mandatory (used to create organization)
- Password strength indicator: visual color bar (red/yellow/green) with text labels (Weak/Medium/Strong)
- Password requirements: minimum 8 characters, at least one uppercase letter, one number

**Google OAuth position and flow**
- Claude's Discretion: position of Google button relative to form fields (above or below)
- After Google OAuth: additional step asking only for company name before completing registration (name already comes from Google)

**Branding panel (left side)**
- Claude's Discretion: content of the left branding panel (logo + benefits, testimonial, etc.)

**Validation and error handling**
- Validation triggers on blur (when user leaves a field)
- Email already registered: inline error under email field with text "This email is already registered. Want to log in?" with link to /login
- Submit button disabled while validation errors exist
- Submit button shows spinner and text changes to "Creating account..." while processing (prevents double-click)
- Google OAuth errors: toast notification at the top that disappears in 5 seconds

**Post-registration flow (verify-email page)**
- Page shows illustration/icon of envelope + instructions
- Displays the email address where verification was sent
- "Resend email" button with 60-second cooldown (shows countdown timer)
- Page is a "waiting room": user can only resend email, logout (change account), or read tips
- Tip text below resend button: "Can't find it? Check your spam or junk folder"
- No access to dashboard until email is verified

**Organization creation**
- Organization name = exact value from the company name field
- Auto-generated URL-friendly slug: "Acme Corp" → "acme-corp"
- Slug duplicates handled with incremental numbers: "acme-corp-2", "acme-corp-3"
- Profile stores: first name, last name, email, org_id
- Creator gets "owner" role (full permissions including transfer and delete)
- If org creation fails after auth user exists: silent retry up to 3 times, then redirect to /verify-email with "We're setting up your account" message

**Internationalization (i18n)**
- Bilingual interface: Spanish and English with language selector
- Default language: auto-detect from browser language (Spanish if browser is Spanish, English otherwise)
- Language selector: small "ES | EN" button in top-right corner of the page
- Verification emails sent in the language the user had selected at signup time

**Verification email**
- Branded email with AIDEAS logo in header
- Personalized greeting: "Hola, [First Name]" / "Hi, [First Name]"
- Large CTA button "Verify your email" / "Verifica tu email"
- Footer with company info
- Sender: AIDEAS <noreply@aideas.com>
- Subject: "Verifica tu email en AIDEAS" (ES) / "Verify your email on AIDEAS" (EN)
- Link expiration: 1 hour

**Terms and privacy**
- Mandatory checkbox: "I accept the Terms of Service and Privacy Policy" with links to /terms and /privacy
- /terms and /privacy pages are placeholder content for now (filled later)
- Links open in new tab so user doesn't lose form progress
- Timestamp of terms acceptance saved (date/time when user checked the box) for compliance audit

**Signup security**
- Google reCAPTCHA v3 (invisible) — evaluates in background, only shows challenge if bot detected
- Rate limiting: 5 signup attempts per IP per 15 minutes (already wired via slowapi in FastAPI — does NOT apply to Next.js form directly)
- Email normalization: lowercase and trim before processing (prevents duplicates from case variations)
- Block disposable email domains (mailinator, tempmail, etc.) with error: "Please use a work or personal email"

### Claude's Discretion
- Google OAuth button position (above or below form fields)
- Left branding panel content and design
- Initial subscription plan for new organizations (free/trial)
- Loading skeleton designs
- Exact spacing, typography, and color choices

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| REG-01 | Signup page at `/signup` with form (email, password, name, company) | Split-layout component pattern, react-hook-form + Zod schema, existing stub at web/src/app/(auth)/signup/page.tsx to replace |
| REG-02 | Form validation with Zod schema | Zod v4 + @hookform/resolvers v5.2.x with zodResolver, mode: "onBlur", setError for server errors |
| REG-03 | Account creation via Supabase Auth | supabase.auth.signUp() with options.data (first_name, last_name, company_name, locale, terms_accepted_at), emailRedirectTo → /auth/callback |
| REG-04 | Organization auto-created on first signup with user as admin | Extend handle_new_user trigger in new migration: create org, set slug, add owner role to organization_members. Requires migration for profiles (first_name/last_name split, org_id) and owner role in CHECK constraint |
| REG-05 | Email verification sent automatically | Supabase Auth sends automatically on signUp; custom branded templates already configured in Phase 3; template uses {{ .Data.first_name }} |
| REG-06 | Redirect to `/verify-email` after signup | auth/callback route already exists — update next param; create /verify-email page with resend + 60s countdown |
| REG-07 | Error message if email already exists | When email confirmation is enabled, Supabase returns obfuscated dummy response (no clear error). Use supabase.auth.admin.createUser() in a Server Action to get definitive 422 error for existing email |
| REG-08 | Google OAuth signup option | supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }) from client component. Post-OAuth: intercept callback, detect new user (created_at ≈ updated_at), redirect to /complete-registration for company name |
</phase_requirements>

---

## Summary

Phase 4 builds on top of a nearly complete foundation. The Next.js app at `web/` already has the Supabase client/server helpers, middleware session refresh, an auth callback route, and a basic signup page stub. The Supabase database has `organizations`, `profiles`, and `organization_members` tables with RLS. Three focused areas require work: (1) rebuilding the signup UI to match the detailed spec (split layout, i18n, reCAPTCHA, strength indicator), (2) extending the `handle_new_user` database trigger to create the organization and membership records alongside the profile, and (3) creating the `/verify-email` waiting page.

The most significant schema gap is that `profiles` currently stores `full_name` as a single field (not `first_name`/`last_name`) and has no `org_id` column. The `organization_members` role CHECK constraint allows `admin/operator/viewer` but the spec requires an `owner` role. Both gaps require a new Supabase migration. The `handle_new_user` trigger must be extended (not replaced) to also insert into `organizations` and `organization_members`.

A critical compatibility note: the project uses `zod: ^4.3.6` and `@hookform/resolvers: ^5.2.2`. Zod v4 had compatibility issues with earlier resolver versions, but `@hookform/resolvers` v5.0+ explicitly supports Zod v4. The installed version (5.2.2) is compatible. Import path remains `from '@hookform/resolvers/zod'`.

**Primary recommendation:** Build the signup UI as a client component using react-hook-form + zodResolver with `mode: "onBlur"`. Use a Server Action for the actual signup call (gives access to admin client for duplicate detection). Extend the DB trigger in a new migration for org creation. Add next-intl without URL routing for the ES/EN toggle.

---

## Standard Stack

### Core (already in web/package.json)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.8.0 | SSR-safe Supabase client | Already wired; handles PKCE, cookie sessions |
| @supabase/supabase-js | ^2.95.0 | Supabase client base | Required peer of @supabase/ssr |
| react-hook-form | ^7.71.1 | Form state management | Already installed; minimal re-renders, blur mode |
| @hookform/resolvers | ^5.2.2 | Zod resolver bridge | v5.0+ supports Zod v4 — confirmed compatible |
| zod | ^4.3.6 | Schema validation | Already installed; project standard |
| next | 16.1.6 | App Router framework | Already in use |
| tailwindcss | ^4 | Utility CSS | Already configured |
| lucide-react | ^0.563.0 | Icons | Already installed; use Mail, Eye, EyeOff, Check |

### New Packages to Install
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| next-intl | ^3.x | i18n without URL routing | Cookie-based locale; no path restructure required |
| react-google-recaptcha-v3 | ^1.x | reCAPTCHA v3 invisible | Simpler than manual script injection; React context |
| disposable-email-domains-js | ^1.x | Block temp email domains | Maintained list; lightweight domain check |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| next-intl (no routing) | next-intl with [locale] URL segments | URL segments need full route restructure — too invasive for single phase |
| react-google-recaptcha-v3 | @google-recaptcha/react | Newer TypeScript-first package but less ecosystem documentation |
| DB trigger for org creation | Server Action post-signup | Trigger is atomic (cannot partially fail auth); Server Action risks auth user existing without org |
| react-hook-form | useActionState only | useActionState alone doesn't give blur-per-field validation or strength indicator |

**Installation:**
```bash
cd web && npm install next-intl react-google-recaptcha-v3 disposable-email-domains-js
```

---

## Architecture Patterns

### Recommended Project Structure
```
web/src/
├── app/
│   ├── (auth)/
│   │   ├── signup/
│   │   │   └── page.tsx              # Replace existing stub — split layout shell (Server Component)
│   │   ├── verify-email/
│   │   │   └── page.tsx              # New: waiting room page
│   │   ├── complete-registration/
│   │   │   └── page.tsx              # New: post-Google-OAuth company name step
│   │   └── auth/callback/route.ts    # Existing — add /verify-email redirect for new signups
│   ├── (legal)/
│   │   ├── terms/page.tsx            # New: placeholder
│   │   └── privacy/page.tsx          # New: placeholder
│   └── layout.tsx                    # Add NextIntlClientProvider
├── components/
│   ├── auth/
│   │   ├── signup-form.tsx           # "use client" — react-hook-form, Zod, reCAPTCHA
│   │   ├── google-oauth-button.tsx   # "use client" — signInWithOAuth
│   │   ├── password-strength-bar.tsx # "use client" — visual strength indicator
│   │   ├── language-switcher.tsx     # "use client" — ES|EN toggle, sets cookie
│   │   └── resend-email-timer.tsx    # "use client" — 60s countdown
│   └── ui/                           # Existing shadcn components
├── lib/
│   ├── supabase/                     # Existing client/server/middleware
│   ├── actions/
│   │   └── auth.ts                   # Server Actions: signUpWithEmail, resendVerification
│   └── validations/
│       └── signup.ts                 # Zod schema export (used by both form and action)
├── i18n/
│   └── request.ts                    # next-intl config: cookie-based locale
└── messages/
    ├── en.json                       # English strings
    └── es.json                       # Spanish strings
supabase/migrations/
└── 20260401000001_user_registration.sql  # Extend profiles, add owner role, extend trigger
```

### Pattern 1: Signup Server Action with Admin Duplicate Detection
**What:** The form calls a Server Action that uses the Supabase admin client to detect duplicate emails definitively. When `signUp()` with email confirmation enabled gets a duplicate, it returns a fake/obfuscated user object — not an error. The admin client bypasses this.
**When to use:** Any signup where inline "email already exists" error is required without a page reload.

```typescript
// web/src/lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { signupSchema } from '@/lib/validations/signup'

export async function signUpWithEmail(formData: unknown) {
  const parsed = signupSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: 'validation', issues: parsed.error.flatten() }
  }

  const { email, password, firstName, lastName, companyName, locale, termsAcceptedAt } = parsed.data

  // Admin client for definitive duplicate check
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check for existing user
  const { data: existingUsers } = await adminClient.auth.admin.listUsers()
  const emailNormalized = email.toLowerCase().trim()
  const exists = existingUsers?.users?.some(u => u.email === emailNormalized)
  if (exists) {
    return { error: 'email_exists' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: emailNormalized,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/verify-email`,
      data: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        locale,                           // stored in raw_user_meta_data for email template
        terms_accepted_at: termsAcceptedAt,
      },
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}
```

**Note on admin listUsers approach:** This has O(n) cost. For production scale, prefer checking via a unique constraint violation or use Supabase Edge Function. For v1 with limited users, acceptable.

**Alternative:** A simpler pattern is to attempt signUp, then check if `data.user?.identities?.length === 0` — Supabase returns an empty identities array for duplicate emails when confirmation is enabled. This avoids the admin client.

```typescript
// Simpler duplicate detection — no admin client needed
const { data, error } = await supabase.auth.signUp({ email, password, options })
if (data.user && data.user.identities && data.user.identities.length === 0) {
  return { error: 'email_exists' }
}
```

### Pattern 2: Zod Schema for Signup (Zod v4 syntax)
**What:** Single schema shared between Server Action and client-side resolver.
**When to use:** Every field validation in the signup form.

```typescript
// web/src/lib/validations/signup.ts
// Source: zod.dev docs + react-hook-form docs
import { z } from 'zod'

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  companyName: z.string().min(1, 'Company name is required').max(100),
  email: z
    .string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' }),
  }),
  locale: z.enum(['en', 'es']).default('en'),
  termsAcceptedAt: z.string().datetime().optional(),
  captchaToken: z.string().min(1, 'reCAPTCHA verification required'),
})

export type SignupFormData = z.infer<typeof signupSchema>
```

### Pattern 3: react-hook-form with zodResolver and mode onBlur
**What:** Client component form wiring. Mode "onBlur" fires validation when user leaves each field.

```typescript
// Source: react-hook-form.com/docs/useform
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupSchema, type SignupFormData } from '@/lib/validations/signup'

const form = useForm<SignupFormData>({
  resolver: zodResolver(signupSchema),
  mode: 'onBlur',        // validate on field blur
  reValidateMode: 'onChange',  // re-validate on change after first error shown
  defaultValues: {
    firstName: '', lastName: '', companyName: '',
    email: '', password: '', termsAccepted: undefined,
    locale: 'en',
  },
})

// Setting server-side error (e.g. email_exists) onto a specific field:
form.setError('email', {
  type: 'server',
  message: 'This email is already registered.',
})
```

### Pattern 4: Password Strength Indicator (derived value, not Zod)
**What:** Compute a strength score from the current password value in real time. Separate from Zod validation (Zod only enforces minimum requirements; the bar shows strength above that).

```typescript
// No library needed — plain derivation
function getPasswordStrength(password: string): { score: 0 | 1 | 2; label: string; color: string } {
  if (password.length < 8) return { score: 0, label: 'Weak', color: 'bg-red-500' }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const longEnough = password.length >= 12
  const strong = hasUpper && hasNumber && hasSpecial && longEnough
  const medium = hasUpper && hasNumber
  if (strong) return { score: 2, label: 'Strong', color: 'bg-green-500' }
  if (medium) return { score: 1, label: 'Medium', color: 'bg-yellow-500' }
  return { score: 0, label: 'Weak', color: 'bg-red-500' }
}
```

### Pattern 5: Google OAuth with Post-OAuth Company Name Step
**What:** signInWithOAuth redirects to /auth/callback. Callback detects new user (identities[0].created_at ≈ user.created_at), stores intent in cookie, redirects to /complete-registration page for company name.

```typescript
// Client component
const handleGoogleSignup = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/complete-registration`,
    },
  })
  if (error) {
    // Show toast notification
  }
}
```

```typescript
// app/(auth)/auth/callback/route.ts — extend existing
// After exchangeCodeForSession, check if new user:
const { data: { user } } = await supabase.auth.getUser()
const isNewUser = user?.identities?.[0]?.created_at === user?.created_at
// Route to /complete-registration if new, /dashboard if returning
const destination = isNewUser ? '/complete-registration' : (next ?? '/dashboard')
return NextResponse.redirect(`${origin}${destination}`)
```

### Pattern 6: Database Trigger Extension (new migration)
**What:** The existing `handle_new_user` trigger only creates a profile with `full_name`. It must be extended to: (1) create organization, (2) generate slug, (3) add owner membership. The `profiles` table needs `first_name`, `last_name`, `org_id` columns. The `organization_members` role check needs `owner` added.

```sql
-- supabase/migrations/20260401000001_user_registration.sql

-- 1. Add first_name, last_name, org_id to profiles (keep full_name for backward compat)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS org_id     UUID REFERENCES public.organizations(id);

-- 2. Add 'owner' to organization_members role constraint
ALTER TABLE public.organization_members
  DROP CONSTRAINT IF EXISTS organization_members_role_check;
ALTER TABLE public.organization_members
  ADD CONSTRAINT organization_members_role_check
  CHECK (role IN ('owner', 'admin', 'operator', 'viewer'));

-- 3. Slug generation helper
CREATE OR REPLACE FUNCTION public.generate_org_slug(name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  counter   INT := 1;
BEGIN
  base_slug := lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  candidate := base_slug;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug = candidate) THEN
      RETURN candidate;
    END IF;
    counter := counter + 1;
    candidate := base_slug || '-' || counter;
  END LOOP;
END;
$$;

-- 4. Replace handle_new_user to also create org + membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_org_id  UUID;
  v_company TEXT;
  v_slug    TEXT;
BEGIN
  v_company := COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Organization');
  v_slug    := public.generate_org_slug(v_company);

  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (v_company, v_slug)
  RETURNING id INTO v_org_id;

  -- Create profile (first_name + last_name columns)
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    CONCAT(
      NEW.raw_user_meta_data ->> 'first_name', ' ',
      NEW.raw_user_meta_data ->> 'last_name'
    ),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    v_org_id
  );

  -- Add user as owner of the new org
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;
```

**Critical:** The trigger runs as SECURITY DEFINER. Since `organizations` and `organization_members` have "Writes are service_role only" (no INSERT policies for authenticated users), the trigger bypasses RLS correctly — this is the intended design already in place.

### Pattern 7: next-intl Without URL Routing (cookie-based)
**What:** Use next-intl in "without i18n routing" mode. Locale stored in NEXT_LOCALE cookie. No [locale] path segments needed.

```typescript
// web/src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const headerStore = await headers()

  // Respect explicit user preference first, then auto-detect
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const acceptLanguage = headerStore.get('accept-language') ?? ''
  const browserLocale = acceptLanguage.startsWith('es') ? 'es' : 'en'
  const locale = (cookieLocale === 'es' || cookieLocale === 'en')
    ? cookieLocale
    : browserLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

```typescript
// Language switcher (client component) — sets NEXT_LOCALE cookie
'use client'
function LanguageSwitcher() {
  const [locale, setLocale] = useState<'en' | 'es'>('en')
  const router = useRouter()

  const toggle = (lang: 'en' | 'es') => {
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`
    setLocale(lang)
    router.refresh()
  }

  return (
    <button onClick={() => toggle(locale === 'en' ? 'es' : 'en')}>
      {locale === 'en' ? 'ES' : 'EN'} | {locale === 'en' ? 'EN' : 'ES'}
    </button>
  )
}
```

### Anti-Patterns to Avoid
- **Checking `error.message` for duplicate email string matching:** Supabase obfuscates duplicate email errors when email confirmation is enabled. The `identities.length === 0` check is the reliable approach.
- **Putting signUp logic in a client component directly:** Exposes service role key risk, no reCAPTCHA server-side validation. Use Server Actions.
- **Replacing the trigger instead of extending it:** The existing trigger is referenced; do CREATE OR REPLACE to avoid orphaned trigger reference.
- **Adding [locale] path segments:** Would require moving all existing (auth) routes into [locale]/(...), a large refactor outside phase scope.
- **Validating reCAPTCHA only client-side:** Token must be verified server-side (in Server Action) against Google's API — client can be bypassed.
- **Using `z.coerce` with Zod v4 + @hookform/resolvers v5.2.x:** Known type inference issue. Use `z.transform` or `z.preprocess` instead if type coercion is needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state & blur validation | Custom useState per field | react-hook-form | Already installed; handles dirty state, touched, re-render optimization |
| Schema validation | Custom regex functions | Zod v4 | Already installed; `.regex()`, `.min()`, `.email()` cover all cases |
| Disposable email blocklist | Hardcoded domain array | disposable-email-domains-js | 40k+ domains, updated monthly, npm install |
| reCAPTCHA script loading | Manual script tag in layout | react-google-recaptcha-v3 | Provider handles load, useGoogleReCaptcha hook for token |
| Slug deduplication | Application-level loop with DB query | DB trigger with loop (see Pattern 6) | Atomic, no race conditions |
| i18n string management | Object literals in components | next-intl + JSON files | Hot-swap locale, server/client unified API |
| Password strength scoring | Custom multi-criteria check | Inline derivation function (Pattern 4) | Simple enough to be inline; no library needed |

**Key insight:** The hardest problems in this phase (atomic org creation, slug uniqueness, RLS bypass) are best solved at the database layer with a trigger rather than in application code. Triggers run inside the auth.users INSERT transaction — if org creation fails, the entire signup rolls back.

---

## Common Pitfalls

### Pitfall 1: Supabase Obfuscates Duplicate Email Errors
**What goes wrong:** `supabase.auth.signUp()` with email confirmation enabled returns a fake user object (not an error) when the email is already registered. `error` is null. The developer shows a success state while the real user never gets a second email.
**Why it happens:** Intentional Supabase design to prevent account enumeration.
**How to avoid:** Check `data.user?.identities?.length === 0` after signUp. If identities is empty, the email is already registered. Alternatively, use the admin client to check before signing up.
**Warning signs:** Users reporting "I signed up but never got an email" and no error displayed.

### Pitfall 2: Trigger Fails Silently — Auth User Exists But No Org
**What goes wrong:** If the `handle_new_user` trigger throws (e.g., constraint violation, NULL company_name), the entire auth.users INSERT rolls back in newer Supabase versions — but behavior depends on Supabase config. If trigger is non-blocking, user exists in auth but has no profile/org.
**Why it happens:** AFTER INSERT trigger with SECURITY DEFINER; silent failures in plpgsql unless error is propagated.
**How to avoid:** Add EXCEPTION handling in the trigger function. Log errors to a `signup_errors` table. The CONTEXT.md spec for "silent retry + redirect to /verify-email with 'We're setting up your account'" suggests handling this at app layer too.
**Warning signs:** User can log in but gets errors accessing anything org-scoped.

### Pitfall 3: Google OAuth Returns Full Name — Trigger Gets NULL first_name
**What goes wrong:** Google OAuth users don't go through the signup form, so `raw_user_meta_data` has `full_name` (or `name`) from Google, not separate `first_name`/`last_name`. If company_name is also NULL (user hasn't completed the extra step yet), the trigger fires immediately on OAuth callback with NULL company_name.
**Why it happens:** The trigger fires on every auth.users INSERT, including OAuth signups.
**How to avoid:** In the trigger, `COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'My Organization')` as fallback. The /complete-registration page then updates the org name and profile. Add an `UPDATE` path in the trigger or handle the update in the Server Action after company name is collected.
**Warning signs:** All Google OAuth users have organization named "My Organization".

### Pitfall 4: Rate Limiting Scope
**What goes wrong:** The CONTEXT.md mentions "5 signup attempts per IP per 15 minutes". The existing slowapi rate limiter is in FastAPI — it does NOT apply to the Next.js signup form.
**Why it happens:** Phase 3 added rate limiting to FastAPI API routes, not to Next.js Server Actions.
**How to avoid:** For Phase 4, the reCAPTCHA v3 is the primary spam protection. True IP-based rate limiting on the Next.js side requires Vercel's Edge Middleware or a Redis-backed counter. This is the correct scope for v1 — note it as a known limitation.
**Warning signs:** Bot spam through the signup form despite FastAPI rate limit being in place.

### Pitfall 5: Zod v4 `z.string().email()` Behavior Change
**What goes wrong:** Zod v4 changed some validation behavior. The `.email()` validator is stricter in v4 than v3.
**Why it happens:** Zod v4 is a near-complete rewrite with breaking changes.
**How to avoid:** Test the email schema against edge cases (subaddressing like user+tag@domain.com). The `.transform()` for lowercase/trim should come AFTER `.email()` validation so the error message shows before transformation.
**Warning signs:** Valid emails failing client-side validation; users can't sign up with legitimate addresses.

### Pitfall 6: Missing next.config.ts Plugin for next-intl
**What goes wrong:** next-intl requires its plugin to be added to next.config.ts. Without it, the `getRequestConfig` in i18n/request.ts is not picked up by the server.
**Why it happens:** next-intl needs to inject at the Next.js compiler level.
**How to avoid:** Add `createNextIntlPlugin` to next.config.ts.
```typescript
// web/next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
export default withNextIntl({ /* existing config */ })
```
**Warning signs:** `useTranslations` throws "Failed to call `unstable_setRequestLocale`".

---

## Code Examples

Verified patterns from official sources:

### Supabase signUp with metadata
```typescript
// Source: https://supabase.com/docs/reference/javascript/auth-signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: 'https://app.aideas.com/auth/callback',
    captchaToken: recaptchaToken,
    data: {
      first_name: 'John',
      last_name: 'Doe',
      company_name: 'Acme Corp',
      locale: 'es',
      terms_accepted_at: new Date().toISOString(),
    },
  },
})

// Reliable duplicate email detection (when email confirmation is ON):
if (data.user && data.user.identities && data.user.identities.length === 0) {
  // Email already registered — show inline error
}
```

### Google OAuth initiation
```typescript
// Source: https://supabase.com/docs/guides/auth/social-login/auth-google
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/complete-registration`,
  },
})
```

### Email template with personalization (Go template syntax)
```html
<!-- Source: https://supabase.com/docs/guides/auth/auth-email-templates -->
<!-- Subject: {{ if eq .Data.locale "es" }}Verifica tu email en AIDEAS{{ else }}Verify your email on AIDEAS{{ end }} -->
<h2>{{ if eq .Data.locale "es" }}Hola, {{ .Data.first_name }}!{{ else }}Hi, {{ .Data.first_name }}!{{ end }}</h2>
<a href="{{ .ConfirmationURL }}">
  {{ if eq .Data.locale "es" }}Verifica tu email{{ else }}Verify your email{{ end }}
</a>
```

### reCAPTCHA v3 setup
```typescript
// Source: react-google-recaptcha-v3 npm docs
// In layout or page wrapper:
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
// Wrap signup page: <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>

// In signup form component:
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
const { executeRecaptcha } = useGoogleReCaptcha()
const captchaToken = await executeRecaptcha('signup')
// Pass captchaToken to Server Action → verify server-side via:
// POST https://www.google.com/recaptcha/api/siteverify
```

### next-intl usage in component
```typescript
// Source: next-intl.dev/docs
import { useTranslations } from 'next-intl'

function SignupForm() {
  const t = useTranslations('signup')
  return <label>{t('email_label')}</label>
}

// Server component:
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('signup')
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useSession()` server-side | `supabase.auth.getUser()` | @supabase/ssr 0.5+ | `getUser()` is authoritative; `getSession()` trusts stale cookie |
| Supabase Auth Helpers (`@supabase/auth-helpers-nextjs`) | `@supabase/ssr` | 2023-2024 | Auth helpers deprecated; SSR package is the current standard |
| Zod v3 `.min()` + message | Zod v4 same API but rewritten core | Zod v4 (2024-2025) | API similar but peer dependency compatibility varies — check resolver version |
| `@hookform/resolvers` < v5 | `@hookform/resolvers` v5+ | 2025 | v5 adds explicit Zod v4 support |
| next-intl with [locale] URL | next-intl without-i18n-routing | next-intl v3 | Cookie-based mode available; no URL change needed |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated. Project correctly uses `@supabase/ssr`.
- `next-i18next`: Pages Router only. Not applicable to App Router project.
- `supabase.auth.getSession()` on server: Returns stale data from cookie. Use `getUser()`.

---

## Open Questions

1. **Schema migration strategy: `full_name` vs `first_name`/`last_name` in profiles**
   - What we know: Current `profiles` table has `full_name TEXT`. CONTEXT.md requires separate `first_name`/`last_name` and `org_id`.
   - What's unclear: Whether existing seed data or Phase 3 code references `full_name` directly (the middleware and lib only use auth.getUser(), not the profiles table).
   - Recommendation: ADD the new columns (don't drop `full_name`). Populate both in the trigger. Run `grep -r "full_name" web/src/` before the migration to confirm no existing code breaks.

2. **reCAPTCHA v3 score threshold and server verification**
   - What we know: Token must be POSTed to Google's siteverify endpoint in the Server Action. Scores below 0.5 typically indicate bots.
   - What's unclear: Whether to fail signup silently vs. show CAPTCHA challenge. The spec says "only shows challenge if bot detected" — but reCAPTCHA v3 cannot show a challenge (it's invisible-only). Challenge would require downgrade to v2.
   - Recommendation: For v1, use score threshold ≥ 0.5. Below threshold, return generic "Unable to verify you're human" error. Document that a v2 challenge fallback is a v2 enhancement.

3. **Google OAuth: when does the trigger fire vs. when company name is collected**
   - What we know: Trigger fires on auth.users INSERT (OAuth callback). Company name comes later from /complete-registration.
   - What's unclear: Should the org have a placeholder name until /complete-registration, or should org creation be deferred for OAuth users?
   - Recommendation: Create org with placeholder name "My Organization" in trigger (as shown in Pattern 6). The /complete-registration Server Action then UPDATEs the org name and re-generates the slug. Add a `needs_onboarding` flag in profile or check org name = "My Organization" to detect incomplete setup.

4. **Supabase email template locale selection**
   - What we know: `{{ .Data.locale }}` is accessible in Go templates from raw_user_meta_data.
   - What's unclear: Supabase's configured email templates (set in Dashboard or config.toml) are static per template type, not per-request. The `locale` in metadata can be used for conditional content within the template, but only ONE confirmation template exists per Supabase project.
   - Recommendation: Use Go template conditionals `{{ if eq .Data.locale "es" }}...{{ end }}` within the single template to produce bilingual output. Phase 3 already set up 10 template paths (5 EN + 5 ES) in config.toml — verify how that was structured and whether it can be leveraged for locale-aware routing.

---

## Sources

### Primary (HIGH confidence)
- https://supabase.com/docs/guides/auth/passwords — signUp API, PKCE flow, emailRedirectTo
- https://supabase.com/docs/guides/auth/social-login/auth-google — Google OAuth, signInWithOAuth pattern
- https://supabase.com/docs/guides/auth/managing-user-data — raw_user_meta_data, trigger patterns, {{ .Data }} template variables
- https://supabase.com/docs/guides/auth/auth-email-templates — Go template variables including .Data.locale
- https://react-hook-form.com/docs/useform — mode: onBlur, resolver, setError API
- Existing codebase (web/src/) — confirmed library versions, existing patterns, supabase helpers
- Existing migration (supabase/migrations/20260305000001_core_identity.sql) — confirmed schema gaps

### Secondary (MEDIUM confidence)
- https://next-intl.dev/docs/usage/configuration — without-i18n-routing, cookie-based locale (verified with WebFetch)
- https://www.npmjs.com/package/react-google-recaptcha-v3 — reCAPTCHA v3 React wrapper
- https://www.npmjs.com/package/disposable-email-domains-js — domain blocklist package
- https://github.com/react-hook-form/resolvers/issues/799 — Zod v4 compatibility status in @hookform/resolvers v5

### Tertiary (LOW confidence)
- Empty identities array technique for duplicate email detection — seen in multiple community sources but not in official Supabase docs. Verify in local Supabase dev before relying on it.
- reCAPTCHA v3 score threshold of 0.5 — Google recommends this as a starting point but it varies by traffic patterns.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in package.json with exact versions
- Schema gaps: HIGH — confirmed by reading migration SQL directly
- Architecture patterns: HIGH — derived from existing codebase structure and official docs
- Zod v4 + resolver compatibility: HIGH — confirmed fixed in v5.0+, installed version is 5.2.2
- next-intl no-routing mode: MEDIUM — WebFetch confirmed capability, not verified in running app
- Pitfalls: HIGH — schema mismatch confirmed by direct file inspection; trigger behavior from official docs

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (Supabase and next-intl APIs are stable; Zod v4 ecosystem still settling)
