'use client'

import type { Profile } from '@/lib/types'
import { IconTrash } from './Icons'

interface Props {
  users: Profile[]
  currentUserId: string
  onDelete: (user: Profile) => void
}

export function UserTable({ users, currentUserId, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dwv-border">
            <th className="text-left text-xs text-dwv-muted uppercase tracking-wider py-3 px-4">Usuario</th>
            <th className="text-left text-xs text-dwv-muted uppercase tracking-wider py-3 px-4">Email</th>
            <th className="text-left text-xs text-dwv-muted uppercase tracking-wider py-3 px-4">Role</th>
            <th className="text-left text-xs text-dwv-muted uppercase tracking-wider py-3 px-4">Criado em</th>
            <th className="text-right text-xs text-dwv-muted uppercase tracking-wider py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user.id}
              className="border-b border-dwv-border/50 hover:bg-dwv-card-hover transition-colors animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-dwv-red/20 flex items-center justify-center text-xs font-bold text-dwv-red flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium">{user.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-dwv-text2">{user.email}</td>
              <td className="py-3 px-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'master'
                    ? 'bg-dwv-red/15 text-dwv-red'
                    : 'bg-dwv-blue/15 text-dwv-blue'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-dwv-muted">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td className="py-3 px-4 text-right">
                {user.id !== currentUserId && (
                  <button
                    onClick={() => onDelete(user)}
                    className="p-1.5 rounded-lg hover:bg-dwv-red/10 text-dwv-muted hover:text-dwv-red transition-colors"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
