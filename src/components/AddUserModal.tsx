'use client'

import { useState } from 'react'
import { IconX } from './Icons'

interface Props {
  onClose: () => void
  onSave: (data: { name: string; email: string; password: string; role: 'master' | 'user' }) => Promise<void>
}

export function AddUserModal({ onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'master' | 'user'>('user')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return
    setSaving(true)
    try {
      await onSave({ name, email, password, role })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dwv-card border border-dwv-border rounded-2xl w-full max-w-md mx-4 p-6 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Adicionar Usuario</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-dwv-muted hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50" />
          </div>
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50" />
          </div>
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50" />
          </div>
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as 'master' | 'user')} className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50">
              <option value="user">Usuario</option>
              <option value="master">Master</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dwv-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-dwv-text2 hover:text-white">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-medium bg-dwv-red hover:bg-dwv-red-dark text-white disabled:opacity-50">
            {saving ? 'Salvando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}
