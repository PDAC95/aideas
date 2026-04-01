import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { LanguageSwitcher } from '@/components/auth/language-switcher'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No active session — redirect to forgot-password with expired error
  if (!user) {
    redirect('/forgot-password?error=expired')
  }

  const t = await getTranslations('resetPassword')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Language switcher */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <KeyRound className="size-8 text-primary" />
            </div>
          </div>

          {/* Title + subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          </div>

          {/* Form */}
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
