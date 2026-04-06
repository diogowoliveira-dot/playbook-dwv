'use client'

import type { Material } from '@/lib/types'
import { typeIcon, IconEdit, IconTrash, IconPdf, IconVideo, IconLink } from './Icons'

interface Props {
  material: Material
  isMaster: boolean
  viewMode: 'grid' | 'list'
  index: number
  onEdit?: (m: Material) => void
  onDelete?: (m: Material) => void
  onClick?: (m: Material) => void
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
          : 'bg-dwv-green/10 text-dwv-green/80'
        const icon = t === 'pdf' ? <IconPdf className="w-3 h-3" />
          : t === 'video' ? <IconVideo className="w-3 h-3" />
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

export function MaterialCard({ material, isMaster, viewMode, index, onEdit, onDelete, onClick }: Props) {
  const catColor = material.category === 'estudo'
    ? 'bg-dwv-blue/15 text-dwv-blue border-dwv-blue/25'
    : 'bg-dwv-red/15 text-dwv-red border-dwv-red/25'

  const contentTypes = getContentTypes(material)
  const linksCount = material.material_links?.length || 0

  if (viewMode === 'list') {
    return (
      <div
        className="bg-dwv-card border border-dwv-border rounded-lg p-4 flex items-center gap-4 hover:border-dwv-border-hover hover:bg-dwv-card-hover transition-all cursor-pointer animate-fade-in-up group"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onClick?.(material)}
      >
        <div className="flex-shrink-0">{typeIcon(material.type)}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{material.title}</h3>
          <p className="text-xs text-dwv-muted truncate mt-0.5">{material.description || 'Sem descricao'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${catColor}`}>{material.category}</span>
          <TypeBadges types={contentTypes} />
          {linksCount > 0 && <span className="text-[10px] text-dwv-muted">{linksCount} link{linksCount > 1 ? 's' : ''}</span>}
        </div>
        {isMaster && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onEdit?.(material) }} className="p-1.5 rounded-lg hover:bg-white/5 text-dwv-text2 hover:text-white"><IconEdit className="w-4 h-4" /></button>
            <button onClick={e => { e.stopPropagation(); onDelete?.(material) }} className="p-1.5 rounded-lg hover:bg-dwv-red/10 text-dwv-text2 hover:text-dwv-red"><IconTrash className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="bg-dwv-card border border-dwv-border rounded-xl p-5 hover:border-dwv-red/30 hover:shadow-[0_0_20px_rgba(232,57,42,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer animate-fade-in-up group"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onClick?.(material)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-dwv-bg2">{typeIcon(material.type)}</div>
        {isMaster && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={e => { e.stopPropagation(); onEdit?.(material) }} className="p-1.5 rounded-lg hover:bg-white/5 text-dwv-text2 hover:text-white"><IconEdit className="w-3.5 h-3.5" /></button>
            <button onClick={e => { e.stopPropagation(); onDelete?.(material) }} className="p-1.5 rounded-lg hover:bg-dwv-red/10 text-dwv-text2 hover:text-dwv-red"><IconTrash className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{material.title}</h3>
      <p className="text-xs text-dwv-muted mb-4 line-clamp-3">{material.description || 'Sem descricao'}</p>
      <div className="flex items-center gap-2 mt-auto flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${catColor}`}>{material.category}</span>
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
