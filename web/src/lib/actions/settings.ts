'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { profileSchema, hourlyCostSchema, changePasswordSchema } from '@/lib/validations/settings'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save the user's first and last name.
 * Updates profiles table: first_name, last_name, full_name.
 */
export async function saveProfileName(
  firstName: string,
  lastName: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'unauthorized' }

  const parsed = profileSchema.safeParse({ firstName, lastName })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const { firstName: fn, lastName: ln } = parsed.data
  const fullName = [fn, ln].filter(Boolean).join(' ')

  const { error } = await supabase
    .from('profiles')
    .update({ first_name: fn, last_name: ln, full_name: fullName })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Save the organization's company name.
 * Requires owner or admin role. Uses service_role client (no authenticated UPDATE policy on organizations).
 */
export async function saveCompanyName(
  orgId: string,
  companyName: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'unauthorized' }

  // Verify org membership with owner or admin role
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return { error: 'unauthorized' }
  }

  const trimmed = companyName.trim()
  if (!trimmed || trimmed.length > 100) return { error: 'Invalid company name' }

  const admin = getAdminClient()
  const { error } = await admin
    .from('organizations')
    .update({ name: trimmed })
    .eq('id', orgId)

  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Save the user's avatar URL (or null to remove avatar).
 * Updates profiles.avatar_url for the authenticated user.
 */
export async function saveAvatarUrl(
  avatarUrl: string | null
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Preferences actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save the organization's hourly cost in the settings JSONB column.
 * Requires owner or admin role. Uses service_role client for org update.
 */
export async function saveHourlyCost(
  orgId: string,
  hourlyCost: number
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'unauthorized' }

  const parsed = hourlyCostSchema.safeParse({ orgId, hourlyCost })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  // Role check: must be owner or admin
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return { error: 'unauthorized' }
  }

  const admin = getAdminClient()

  // Fetch current settings to merge
  const { data: org } = await admin
    .from('organizations')
    .select('settings')
    .eq('id', orgId)
    .single()

  const newSettings = {
    ...((org?.settings as Record<string, unknown>) ?? {}),
    hourly_cost: hourlyCost,
  }

  const { error } = await admin
    .from('organizations')
    .update({ settings: newSettings })
    .eq('id', orgId)

  if (error) return { error: error.message }
  return { success: true }
}

/**
 * Switch the UI locale by setting the NEXT_LOCALE cookie.
 * The cookie is readable by client JS (httpOnly: false) so next-intl can pick it up.
 */
export async function switchLocale(locale: 'en' | 'es'): Promise<void> {
  if (locale !== 'en' && locale !== 'es') return

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Security actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Change the user's password.
 * Verifies current password via signInWithPassword before updating.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'unauthorized' }

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) return { error: 'wrong_current_password' }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { error: 'update_failed' }

  return { success: true }
}
