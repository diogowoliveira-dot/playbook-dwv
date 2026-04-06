'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'
import { getCurrentProfile } from '@/lib/database'
import type { Profile } from '@/lib/types'

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const p = await getCurrentProfile()
      setProfile(p)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  return { profile, loading, isMaster: profile?.role === 'master', refresh }
}
