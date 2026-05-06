'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/password-reset'
import { resetPassword } from '@/lib/actions/auth'
import { PasswordStrengthBar } from '@/components/auth/password-strength-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordForm() {
  const t = useTranslations('resetPassword')
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const password = watch('password') ?? ''

  async function onSubmit(data: ResetPasswordFormData) {
    const result = await resetPassword(data.password)

    if ('error' in result) {
      if (result.error === 'no_session') {
        setError('root', { message: 'noSession' })
      } else if (result.error === 'weak_password') {
        setError('root', { message: 'weakPassword' })
      } else if (result.error === 'same_password') {
        setError('root', { message: 'samePassword' })
      } else {
        setError('root', { message: 'generic' })
      }
      return
    }

    setSubmitted(true)
  }

  // Success state — replaces form entirely
  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Check icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">{t('successTitle')}</h2>
          <p className="text-muted-foreground text-sm">{t('successSubtitle')}</p>
        </div>

        {/* Manual navigation to login — no auto-redirect */}
        <Button asChild className="w-full">
          <Link href="/login">{t('backToLogin')}</Link>
        </Button>
      </div>
    )
  }

  // Form state
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Root error banner */}
      {errors.root && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t(`errors.${errors.root.message}` as Parameters<typeof t>[0])}
        </div>
      )}

      {/* Password field */}
      <div className="space-y-1.5">
        <Label htmlFor="password">{t('password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordPlaceholder')}
            autoComplete="new-password"
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
        {/* Password strength bar */}
        <PasswordStrengthBar password={password} />
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
    </form>
  )
}
