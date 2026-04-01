import { getTranslations } from 'next-intl/server'
import { Lock } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { LanguageSwitcher } from '@/components/auth/language-switcher'
import Link from 'next/link'

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const t = await getTranslations('forgotPassword')
  const { error } = await searchParams

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
              <Lock className="size-8 text-primary" />
            </div>
          </div>

          {/* Title + subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
          </div>

          {/* Form */}
          <ForgotPasswordForm expiredError={error === 'expired'} />
        </div>

        {/* Back to sign in link */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  )
}
