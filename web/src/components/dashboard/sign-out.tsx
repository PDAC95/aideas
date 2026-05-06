'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface DashboardSignOutProps {
  label: string
}

export function DashboardSignOut({ label }: DashboardSignOutProps) {
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      {label}
    </Button>
  )
}
