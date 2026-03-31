import { getTranslations } from 'next-intl/server'
import { MailCheck } from 'lucide-react'
import { ResendEmailTimer } from '@/components/auth/resend-email-timer'
import { LanguageSwitcher } from '@/components/auth/language-switcher'
import { SignOutButton } from '@/components/auth/sign-out-button'

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string; setup?: string }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const t = await getTranslations('verifyEmail')
  const { email = '', setup } = await searchParams
  const isSetupPending = setup === 'pending'

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
              <MailCheck className="size-8 text-primary" />
            </div>
          </div>

          {/* Title + subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            {isSetupPending ? (
              <p className="text-muted-foreground text-sm">{t('settingUp')}</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t('subtitle')}{' '}
                {email && (
                  <span className="font-medium text-foreground">{email}</span>
                )}
              </p>
            )}
          </div>

          {/* Resend button with countdown */}
          {email && <ResendEmailTimer email={email} />}

          {/* Spam tip */}
          <p className="text-center text-xs text-muted-foreground">{t('tip')}</p>

          {/* Logout / change account */}
          <div className="flex justify-center">
            <SignOutButton label={t('logout')} redirectTo="/signup" />
          </div>
        </div>
      </div>
    </div>
  )
}
