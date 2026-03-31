'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface SignOutButtonProps {
  label: string
  redirectTo?: string
}

export function SignOutButton({ label, redirectTo = '/signup' }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(redirectTo)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
      {label}
    </Button>
  )
}
