'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Monitor, Loader2, Shield } from 'lucide-react'
import { AlertDialog } from 'radix-ui'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/settings'
import { changePassword } from '@/lib/actions/settings'
import { createClient } from '@/lib/supabase/client'
import { PasswordStrengthBar } from '@/components/auth/password-strength-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Browser / OS detection helpers (no external libraries)
// ─────────────────────────────────────────────────────────────────────────────

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent
  if (ua.includes('Edg/')) return 'Microsoft Edge'
  if (ua.includes('Chrome/')) return 'Google Chrome'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  return 'Unknown browser'
}

function detectOS(): string {
  if (typeof navigator === 'undefined') return ''
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SecurityCardTranslations {
  title: string
  changePassword: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  changePasswordBtn: string
  changingPassword: string
  passwordChanged: string
  wrongCurrentPassword: string
  sessions: string
  sessionsDescription: string
  signOutOthers: string
  signOutOthersConfirmTitle: string
  signOutOthersConfirmMessage: string
  signOutOthersConfirmBtn: string
  signOutOthersCancel: string
  signOutOthersSuccess: string
}

interface SettingsSecurityCardProps {
  isOAuthOnly: boolean
  translations: SecurityCardTranslations
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SettingsSecurityCard({
  isOAuthOnly,
  translations,
}: SettingsSecurityCardProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  // Auto-dismiss toast after 3 s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // ── Password change form ──────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const watchedNewPassword = watch('newPassword') ?? ''

  async function onSubmitPassword(data: ChangePasswordFormData) {
    const result = await changePassword(
      data.currentPassword,
      data.newPassword,
      data.confirmPassword,
    )

    if ('error' in result) {
      if (result.error === 'wrong_current_password') {
        setToast({ message: translations.wrongCurrentPassword, type: 'error' })
      } else {
        setToast({ message: result.error, type: 'error' })
      }
      return
    }

    setToast({ message: translations.passwordChanged, type: 'success' })
    reset()
  }

  // ── Sign out other sessions ───────────────────────────────────────────────

  async function handleSignOutOthers() {
    setSigningOut(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut({ scope: 'others' })
      if (error) {
        setToast({ message: error.message, type: 'error' })
      } else {
        setToast({ message: translations.signOutOthersSuccess, type: 'success' })
      }
    } catch (err) {
      setToast({ message: String(err), type: 'error' })
    } finally {
      setSigningOut(false)
    }
  }

  // ── Device info (deferred to client to avoid hydration mismatch) ────────

  const [deviceInfo, setDeviceInfo] = useState<{
    browser: string
    os: string
    timezone: string
  } | null>(null)

  useEffect(() => {
    setDeviceInfo({
      browser: detectBrowser(),
      os: detectOS(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }, [])

  const deviceLabel = deviceInfo
    ? [deviceInfo.browser, deviceInfo.os].filter(Boolean).join(' on ')
    : ''
  const timezone = deviceInfo?.timezone ?? ''

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Card */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Shield className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{translations.title}</h2>
        </div>

        {/* ── Change Password section (hidden for OAuth-only users) ── */}
        {!isOAuthOnly && (
          <>
            <section aria-labelledby="change-password-heading">
              <h3
                id="change-password-heading"
                className="text-sm font-medium text-foreground mb-4"
              >
                {translations.changePassword}
              </h3>

              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                {/* Current password */}
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">{translations.currentPassword}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    {...register('currentPassword')}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New password + strength bar */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">{translations.newPassword}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('newPassword')}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                  )}
                  <PasswordStrengthBar password={watchedNewPassword} />
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">{translations.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isSubmitting} size="sm">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      {translations.changingPassword}
                    </>
                  ) : (
                    translations.changePasswordBtn
                  )}
                </Button>
              </form>
            </section>

            {/* Divider */}
            <div className="border-t my-6" />
          </>
        )}

        {/* ── Active Sessions section ── */}
        <section aria-labelledby="sessions-heading">
          <h3 id="sessions-heading" className="text-sm font-medium text-foreground mb-1">
            {translations.sessions}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {translations.sessionsDescription}
          </p>

          {/* Current session block */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 mb-4">
            <Monitor className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground truncate">
                  {deviceLabel || 'Current device'}
                </span>
                {/* Green "Current" badge */}
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Current
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {timezone}
              </p>
            </div>
          </div>

          {/* Sign out other sessions — AlertDialog */}
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'text-red-600 border-red-200 hover:bg-red-50',
                  'dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20',
                )}
                disabled={signingOut}
              >
                {signingOut ? (
                  <>
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                    {translations.signOutOthers}
                  </>
                ) : (
                  translations.signOutOthers
                )}
              </Button>
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <AlertDialog.Content
                className={cn(
                  'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
                  'rounded-xl border bg-card p-6 shadow-lg',
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                )}
              >
                <AlertDialog.Title className="text-base font-semibold mb-2">
                  {translations.signOutOthersConfirmTitle}
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-muted-foreground mb-5">
                  {translations.signOutOthersConfirmMessage}
                </AlertDialog.Description>

                <div className="flex justify-end gap-3">
                  <AlertDialog.Cancel asChild>
                    <Button variant="outline" size="sm">
                      {translations.signOutOthersCancel}
                    </Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
                      onClick={handleSignOutOthers}
                    >
                      {translations.signOutOthersConfirmBtn}
                    </Button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </section>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg',
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white',
          )}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
