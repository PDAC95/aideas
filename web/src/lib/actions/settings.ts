'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { assertOrgMembership } from '@/lib/auth/assert-org-membership'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { profileSchema, changePasswordSchema } from '@/lib/validations/settings'

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

  // Sync auth user_metadata so header picks up new name immediately
  await supabase.auth.updateUser({
    data: { first_name: fn, last_name: ln, full_name: fullName }
  })

  revalidatePath('/dashboard', 'layout')
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

  const denied = await assertOrgMembership(supabase, orgId, ['owner', 'admin'])
  if (denied) return denied

  const trimmed = companyName.trim()
  if (!trimmed || trimmed.length > 100) return { error: 'Invalid company name' }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('organizations')
    .update({ name: trimmed })
    .eq('id', orgId)
    .select('id, name')

  if (error) return { error: `DB error: ${error.message}` }
  if (!data || data.length === 0) return { error: `No org found for id: ${orgId}` }

  // Verify the write actually took effect
  const { data: verify } = await admin
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .single()

  if (verify?.name !== trimmed) {
    return { error: `Write verification failed: expected "${trimmed}", got "${verify?.name}"` }
  }

  revalidatePath('/dashboard/settings')
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
  revalidatePath('/dashboard', 'layout')
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

  if (typeof hourlyCost !== 'number' || hourlyCost < 0 || hourlyCost > 10000) {
    return { error: 'Invalid hourly cost' }
  }

  const denied = await assertOrgMembership(supabase, orgId, ['owner', 'admin'])
  if (denied) return denied

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

  const { data, error } = await admin
    .from('organizations')
    .update({ settings: newSettings })
    .eq('id', orgId)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'No organization found to update' }
  revalidatePath('/dashboard/settings')
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
