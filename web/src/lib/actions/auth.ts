'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  signupSchema,
  completeRegistrationSchema,
} from '@/lib/validations/signup'
import { isDisposableEmailDomain } from 'disposable-email-domains-js'
import { cookies } from 'next/headers'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) {
    console.warn('[reCAPTCHA] RECAPTCHA_SECRET_KEY not set — skipping verify')
    return true
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    })
    const json = (await res.json()) as { success: boolean; score?: number }
    return json.success === true && (json.score ?? 0) >= 0.5
  } catch (err) {
    console.error('[reCAPTCHA] verification error:', err)
    return false
  }
}

async function waitForOrgCreation(userId: string): Promise<boolean> {
  const admin = getAdminClient()
  for (let attempt = 1; attempt <= 3; attempt++) {
    await new Promise((r) => setTimeout(r, 1000))
    const { data, error } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .limit(1)
    if (!error && data && data.length > 0) {
      return true
    }
    console.warn(
      `[signup] org not found for user ${userId}, attempt ${attempt}/3`
    )
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────────────
// signUpWithEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function signUpWithEmail(formData: unknown): Promise<
  | { success: true; setupPending?: boolean }
  | { error: string; field?: string; issues?: unknown }
> {
  // 1. Validate input
  const parsed = signupSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: 'validation', issues: parsed.error.issues }
  }

  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    locale,
    termsAcceptedAt,
    captchaToken,
  } = parsed.data

  // 2. Disposable email check
  const domain = email.split('@')[1]
  if (domain && isDisposableEmailDomain(domain)) {
    return { error: 'disposable_email', field: 'email' }
  }

  // 3. reCAPTCHA verification
  const captchaOk = await verifyRecaptcha(captchaToken)
  if (!captchaOk) {
    return { error: 'captcha_failed' }
  }

  // 4. Supabase signup
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/verify-email`,
      data: {
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        locale: locale ?? 'en',
        terms_accepted_at: termsAcceptedAt ?? new Date().toISOString(),
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // 5. Duplicate email detection
  // When email confirmation is enabled, Supabase returns a dummy user with
  // empty identities array instead of an error for existing emails.
  if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
    return { error: 'email_exists', field: 'email' }
  }

  // 6. Wait for org creation trigger
  const orgCreated = await waitForOrgCreation(data.user.id)
  if (!orgCreated) {
    console.warn(
      `[signup] org not created after 3 retries for user ${data.user.id}`
    )
    return { success: true, setupPending: true }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// completeRegistration
// ─────────────────────────────────────────────────────────────────────────────

export async function completeRegistration(formData: unknown): Promise<
  { success: true } | { error: string }
> {
  // 1. Validate input
  const parsed = completeRegistrationSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: 'validation' }
  }

  const { companyName } = parsed.data

  // 2. Get current authenticated user
  const supabase = await createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'not_authenticated' }
  }

  // 3. Update org name via admin client (user hasn't verified email yet)
  const admin = getAdminClient()

  // Look up the user's organization via organization_members
  const { data: membership, error: memberError } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (memberError || !membership) {
    return { error: 'org_not_found' }
  }

  // Generate slug: lowercase, replace spaces with hyphens, strip non-alphanumeric
  const slug = companyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)

  const { error: updateOrgError } = await admin
    .from('organizations')
    .update({ name: companyName, slug })
    .eq('id', membership.organization_id)

  if (updateOrgError) {
    return { error: updateOrgError.message }
  }

  // 4. Update profile with Google OAuth name if not already set
  const googleMeta = user.user_metadata as Record<string, string> | undefined
  if (googleMeta?.full_name) {
    const parts = googleMeta.full_name.split(' ')
    const firstName = parts[0] ?? ''
    const lastName = parts.slice(1).join(' ') || ''

    await admin
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', user.id)
      .is('first_name', null) // only update if not already set
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// resendVerificationEmail
// ─────────────────────────────────────────────────────────────────────────────

export async function resendVerificationEmail(
  email: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// requestPasswordReset
// ─────────────────────────────────────────────────────────────────────────────

export async function requestPasswordReset(
  email: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
  })
  // Always return success — never reveal if email exists (enumeration protection)
  if (error) {
    console.warn('[requestPasswordReset]', error.message)
  }
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// resetPassword
// ─────────────────────────────────────────────────────────────────────────────

export async function resetPassword(
  password: string
): Promise<{ success: true } | { error: 'no_session' | 'weak_password' | 'generic' }> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'no_session' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (
      error.message?.toLowerCase().includes('weak') ||
      error.message?.toLowerCase().includes('password')
    ) {
      return { error: 'weak_password' }
    }
    return { error: 'generic' }
  }

  // Sign out the recovery session so user must log in with new password
  await supabase.auth.signOut()
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// signInWithEmail
// ─────────────────────────────────────────────────────────────────────────────

type LoginResult =
  | { success: true }
  | { error: 'invalid_credentials' | 'email_not_verified' | 'generic' }

export async function signInWithEmail(formData: {
  email: string
  password: string
  rememberMe?: boolean
}): Promise<LoginResult> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      return { error: 'email_not_verified' }
    }
    return { error: 'invalid_credentials' }
  }

  // Defensive check: email_confirmed_at may be null even without error
  if (data.user && !data.user.email_confirmed_at) {
    return { error: 'email_not_verified' }
  }

  // Set "remember me" cookie to control session duration in middleware
  const cookieStore = await cookies()
  if (formData.rememberMe) {
    cookieStore.set('sb-remember-me', 'true', {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  } else {
    // Session cookie (no maxAge) — deleted when browser closes
    cookieStore.set('sb-remember-me', 'false', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  return { success: true }
}
