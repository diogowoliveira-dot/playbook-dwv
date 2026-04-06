'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/Sidebar'
import { ToastContainer } from '@/components/Toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !profile) router.replace('/login')
  }, [loading, profile, router])

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dwv-bg">
        <div className="w-6 h-6 border-2 border-dwv-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-dwv-bg">
      <Sidebar profile={profile} />
      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}
