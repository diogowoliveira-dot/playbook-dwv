'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? '/dashboard' : '/login')
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dwv-bg">
      <div className="w-6 h-6 border-2 border-dwv-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
