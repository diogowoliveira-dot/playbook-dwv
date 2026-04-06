'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { signOut } from '@/lib/database'
import { IconMaterials, IconUsers, IconLogout, IconMenu, IconX } from './Icons'

interface Props {
  profile: Profile
}

export function Sidebar({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const isMaster = profile.role === 'master'

  const nav = [
    { label: 'Materiais', href: '/dashboard', icon: <IconMaterials className="w-5 h-5" /> },
    ...(isMaster ? [{ label: 'Usuarios', href: '/dashboard/usuarios', icon: <IconUsers className="w-5 h-5" /> }] : []),
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dwv-border">
        <div className="flex items-center gap-3">
          <img
            src="https://site.dwvapp.com.br/wp-content/uploads/2025/07/cropped-cropped-Prancheta-1@2x-8.png"
            alt="DWV"
            className="w-9 h-9 object-contain"
          />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">PLAYBOOK DWV</h1>
            <p className="text-[10px] text-dwv-muted">Central de Materiais</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-dwv-red/15 text-dwv-red'
                  : 'text-dwv-text2 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-dwv-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-dwv-red/20 flex items-center justify-center text-xs font-bold text-dwv-red">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile.name}</p>
            <p className="text-[10px] text-dwv-muted">{profile.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-dwv-muted hover:text-dwv-red hover:bg-dwv-red/10 transition-colors"
        >
          <IconLogout className="w-4 h-4" /> Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dwv-card border border-dwv-border lg:hidden"
      >
        <IconMenu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-dwv-bg border-r border-dwv-border" onClick={e => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-dwv-muted hover:text-white">
              <IconX className="w-5 h-5" />
            </button>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-dwv-border bg-dwv-bg h-screen sticky top-0">
        {content}
      </aside>
    </>
  )
}
