'use client'

import type { Material, ViewStatus } from '@/lib/types'
import { typeIcon, IconEdit, IconTrash, IconPdf, IconVideo, IconLink, IconGlobe, IconCheck } from './Icons'

interface Props {
  material: Material
  isMaster: boolean
  viewMode: 'grid' | 'list'
  index: number
  viewStatus: ViewStatus
  onEdit?: (m: Material) => void
  onDelete?: (m: Material) => void
  onClick?: (m: Material) => void
  onMarkViewed?: (m: Material) => void
}

function getContentTypes(material: Material): string[] {
  const types = new Set<string>()
  if (material.type) types.add(material.type)
  material.material_links?.forEach(l => { if (l.type) types.add(l.type) })
  if (types.size === 0) types.add(material.type)
  return Array.from(types)
}

function TypeBadges({ types }: { types: string[] }) {
  return (
    <>
      {types.map(t => {
        const color = t === 'pdf' ? 'bg-dwv-red/10 text-dwv-red/80'
          : t === 'video' ? 'bg-dwv-blue/10 text-dwv-blue/80'
          : t === 'site' ? 'bg-dwv-amber/10 text-dwv-amber/80'
          : 'bg-dwv-green/10 text-dwv-green/80'
        const icon = t === 'pdf' ? <IconPdf className="w-3 h-3" />
          : t === 'video' ? <IconVideo className="w-3 h-3" />
          : t === 'site' ? <IconGlobe className="w-3 h-3" />
          : <IconLink className="w-3 h-3" />
        return (
          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${color}`}>
            {icon} {t}
          </span>
        )
      })}
    </>
  )
}

function StatusBadge({ status }: { status: ViewStatus }) {
  if (status === 'viewed') return null
  if (status === 'new') {
    return (
      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-dwv-amber text-black animate-pulse">
        Novo
      </span>
    )
  }
  return (
    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-dwv-blue text-white animate-pulse">
      Atualizado
    </span>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function IconCalendar({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function IconRefresh({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M1 4v6h6M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
  )
}

export function MaterialCard({ material, isMaster, viewMode, index, viewStatus, onEdit, onDelete, onClick, onMarkViewed }: Props) {
  const catColor = material.category === 'estudo'
    ? 'bg-dwv-blue/15 text-dwv-blue border-dwv-blue/25'
    : 'bg-dwv-red/15 text-dwv-red border-dwv-red/25'

  const contentTypes = getContentTypes(material)
  const linksCount = material.material_links?.length || 0
  const isMasterOnly = material.visibility === 'master'
  const createdDate = formatDate(material.created_at)
  const updatedDate = formatDate(material.updated_at)
  const wasUpdated = material.updated_at !== material.created_at
  const isUnseen = viewStatus === 'new' || viewStatus === 'updated'

  // Border glow for unseen items
  const unseenBorder = isUnseen
    ? viewStatus === 'new'
      ? 'border-dwv-amber/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
      : 'border-dwv-blue/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
    : ''

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-dwv-card border border-dwv-border rounded-lg p-4 flex items-center gap-4 hover:border-dwv-border-hover hover:bg-dwv-card-hover transition-all cursor-pointer animate-fade-in-up group ${unseenBorder}`}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onClick?.(material)}
      >
        <div className="flex-shrink-0 relative">
          {typeIcon(material.type)}
          {isUnseen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-dwv-amber border-2 border-dwv-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{material.title}</h3>
            <StatusBadge status={viewStatus} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-dwv-muted">
              <IconCalendar className="w-2.5 h-2.5" /> {createdDate}
            </span>
            {wasUpdated && (
              <span className="flex items-center gap-1 text-[10px] text-dwv-amber/60">
                <IconRefresh className="w-2.5 h-2.5" /> {updatedDate}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${catColor}`}>{material.category}</span>
          {isMasterOnly && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 font-medium">Master</span>
          )}
          <TypeBadges types={contentTypes} />
          {linksCount > 0 && <span className="text-[10px] text-dwv-muted">{linksCount} link{linksCount > 1 ? 's' : ''}</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isUnseen && (
            <button
              onClick={e => { e.stopPropagation(); onMarkViewed?.(material) }}
              className="p-1.5 rounded-lg hover:bg-dwv-green/10 text-dwv-muted hover:text-dwv-green transition-colors"
              title="Marcar como visto"
            >
              <IconCheck className="w-4 h-4" />
            </button>
          )}
          {viewStatus === 'viewed' && (
            <span className="text-dwv-green/50 p-1.5" title="Visto">
              <IconCheck className="w-4 h-4" />
            </span>
          )}
          {isMaster && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onEdit?.(material) }} className="p-1.5 rounded-lg hover:bg-white/5 text-dwv-text2 hover:text-white"><IconEdit className="w-4 h-4" /></button>
              <button onClick={e => { e.stopPropagation(); onDelete?.(material) }} className="p-1.5 rounded-lg hover:bg-dwv-red/10 text-dwv-text2 hover:text-dwv-red"><IconTrash className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-dwv-card border border-dwv-border rounded-xl p-5 hover:border-dwv-red/30 hover:shadow-[0_0_20px_rgba(232,57,42,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer animate-fade-in-up group flex flex-col ${unseenBorder}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onClick?.(material)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-dwv-bg2 relative">
          {typeIcon(material.type)}
          {isUnseen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-dwv-amber border-2 border-dwv-card" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={viewStatus} />
          {isUnseen && (
            <button
              onClick={e => { e.stopPropagation(); onMarkViewed?.(material) }}
              className="p-1.5 rounded-lg hover:bg-dwv-green/10 text-dwv-muted hover:text-dwv-green transition-colors"
              title="Marcar como visto"
            >
              <IconCheck className="w-3.5 h-3.5" />
            </button>
          )}
          {viewStatus === 'viewed' && (
            <span className="text-dwv-green/40 p-1" title="Visto">
              <IconCheck className="w-3.5 h-3.5" />
            </span>
          )}
          {isMaster && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onEdit?.(material) }} className="p-1.5 rounded-lg hover:bg-white/5 text-dwv-text2 hover:text-white"><IconEdit className="w-3.5 h-3.5" /></button>
              <button onClick={e => { e.stopPropagation(); onDelete?.(material) }} className="p-1.5 rounded-lg hover:bg-dwv-red/10 text-dwv-text2 hover:text-dwv-red"><IconTrash className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-white mb-1.5 line-clamp-2">{material.title}</h3>
      <p className="text-xs text-dwv-muted mb-3 line-clamp-2 flex-1">{material.description || 'Sem descricao'}</p>

      {/* Dates */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[10px] text-dwv-muted">
          <IconCalendar className="w-2.5 h-2.5" /> Criado {createdDate}
        </span>
        {wasUpdated && (
          <span className="flex items-center gap-1 text-[10px] text-dwv-amber/60">
            <IconRefresh className="w-2.5 h-2.5" /> Atualizado {updatedDate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${catColor}`}>{material.category}</span>
        {isMasterOnly && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 font-medium">Master</span>
        )}
        <TypeBadges types={contentTypes} />
      </div>
      {linksCount > 0 && (
        <div className="mt-3 pt-3 border-t border-dwv-border flex items-center justify-between">
          <span className="text-[10px] text-dwv-muted">{linksCount} conteudo{linksCount > 1 ? 's' : ''}</span>
          <span className="text-xs text-dwv-red font-medium opacity-0 group-hover:opacity-100 transition-opacity">Acessar →</span>
        </div>
      )}
    </div>
  )
}
