'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { resendVerificationEmail } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

interface ResendEmailTimerProps {
  email: string
}

export function ResendEmailTimer({ email }: ResendEmailTimerProps) {
  const t = useTranslations('verifyEmail')
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  async function handleResend() {
    if (cooldown > 0 || sending) return

    setSending(true)
    await resendVerificationEmail(email)
    setSending(false)

    // Start 60-second cooldown
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

  const isDisabled = sending || cooldown > 0

  return (
    <Button
      variant="outline"
      onClick={handleResend}
      disabled={isDisabled}
      className="w-full"
    >
      {sending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {t('resending')}
        </>
      ) : cooldown > 0 ? (
        t('cooldown', { seconds: cooldown })
      ) : (
        t('resend')
      )}
    </Button>
  )
}
