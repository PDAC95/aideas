'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Mail, Loader2 } from 'lucide-react'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/password-reset'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ForgotPasswordFormProps {
  expiredError?: boolean
}

export function ForgotPasswordForm({ expiredError }: ForgotPasswordFormProps) {
  const t = useTranslations('forgotPassword')
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setSubmittedEmail(data.email)
    setSubmitted(true)
  }

  function startCooldown() {
    setCooldown(60)
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

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

  // Success state — replaces form entirely
  if (submitted) {
    return (
      <div className="space-y-6">
        {/* Mail icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>
        </div>

        {/* Title + subtitle */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">{t('successTitle')}</h2>
          <p className="text-muted-foreground text-sm">
            {t('successSubtitle', { email: submittedEmail })}
          </p>
        </div>

        {/* Spam tip */}
        <p className="text-center text-xs text-muted-foreground">{t('successTip')}</p>

        {/* Resend button with cooldown */}
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={sending || cooldown > 0}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t('submitting')}
            </>
          ) : cooldown > 0 ? (
            t('cooldown', { seconds: cooldown })
          ) : (
            t('resend')
          )}
        </Button>
      </div>
    )
  }

  // Form state
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Expired link error banner */}
      {expiredError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t('errors.expired')}
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
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
