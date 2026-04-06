'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getProfiles } from '@/lib/database'
import { supabase } from '@/lib/supabase-client'
import type { Profile } from '@/lib/types'
import { StatsRow } from '@/components/StatsRow'
import { UserTable } from '@/components/UserTable'
import { AddUserModal } from '@/components/AddUserModal'
import { IconPlus } from '@/components/Icons'
import { showToast } from '@/components/Toast'

export default function UsuariosPage() {
  const { profile, isMaster, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (!authLoading && !isMaster) router.replace('/dashboard')
  }, [authLoading, isMaster, router])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProfiles()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (isMaster) fetchUsers() }, [isMaster, fetchUsers])

  const handleAddUser = async (data: { name: string; email: string; password: string; role: 'master' | 'user' }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro ao criar usuario')
      showToast(`Usuario "${data.name}" criado! Email de convite enviado.`)
      fetchUsers()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar usuario'
      showToast(msg, 'error')
    }
  }

  const handleDeleteUser = async (user: Profile) => {
    if (!confirm(`Remover "${user.name}"?`)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Usuario removido!')
      fetchUsers()
    } catch {
      showToast('Erro ao remover usuario', 'error')
    }
  }

  if (authLoading || !isMaster) return null

  const stats = [
    { label: 'Total', value: users.length, color: 'text-white' },
    { label: 'Masters', value: users.filter(u => u.role === 'master').length, color: 'text-dwv-red' },
    { label: 'Usuarios', value: users.filter(u => u.role === 'user').length, color: 'text-dwv-blue' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-dwv-muted mt-1">Gerenciar equipe</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-dwv-red hover:bg-dwv-red-dark text-white text-sm font-medium transition-colors"
        >
          <IconPlus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      <StatsRow stats={stats} />

      <div className="bg-dwv-card border border-dwv-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-dwv-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <UserTable users={users} currentUserId={profile!.id} onDelete={handleDeleteUser} />
        )}
      </div>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onSave={handleAddUser} />}
    </div>
  )
}
