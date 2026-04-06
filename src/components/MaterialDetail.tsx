'use client'

import type { Material } from '@/lib/types'
import { typeIcon, IconX, IconExternalLink } from './Icons'

interface Props {
  material: Material
  onClose: () => void
}

export function MaterialDetail({ material, onClose }: Props) {
  const catColor = material.category === 'estudo' ? 'text-dwv-blue' : 'text-dwv-red'
  const links = material.material_links || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dwv-card border border-dwv-border rounded-2xl w-full max-w-lg mx-4 p-6 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-dwv-bg2">{typeIcon(material.type)}</div>
            <div>
              <h2 className="text-lg font-bold text-white">{material.title}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs font-medium ${catColor}`}>{material.category}</span>
                <span className="text-xs text-dwv-muted">{material.type.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-dwv-muted hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {material.description && (
          <p className="text-sm text-dwv-text2 mb-6 leading-relaxed">{material.description}</p>
        )}

        <div>
          <h3 className="text-xs uppercase tracking-wider text-dwv-muted mb-3">Links de acesso</h3>
          {links.length === 0 ? (
            <p className="text-sm text-dwv-muted italic">Nenhum link cadastrado</p>
          ) : (
            <div className="flex flex-col gap-2">
              {links.sort((a, b) => a.sort_order - b.sort_order).map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-dwv-bg2 border border-dwv-border hover:border-dwv-red/40 transition-colors group"
                >
                  <IconExternalLink className="w-4 h-4 text-dwv-muted group-hover:text-dwv-red transition-colors" />
                  <span className="text-sm text-white group-hover:text-dwv-red transition-colors">{link.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
