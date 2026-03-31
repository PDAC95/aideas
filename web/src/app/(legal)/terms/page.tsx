import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function TermsPage() {
  const t = await getTranslations('legal')

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t('terms.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('terms.updated')}</p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {t('terms.placeholder')}
          </p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            {t('backToSignup')}
          </Link>
        </div>
      </div>
    </div>
  )
}
