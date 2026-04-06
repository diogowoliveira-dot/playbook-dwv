'use client'

import { useState } from 'react'
import type { Material } from '@/lib/types'
import { IconX, IconExternalLink, IconPdf, IconVideo, IconLink, IconGlobe } from './Icons'
import { ContentViewer } from './ContentViewer'

interface Props {
  material: Material
  onClose: () => void
}

function linkTypeIcon(type: string) {
  switch (type) {
    case 'pdf': return <IconPdf className="w-4 h-4 text-dwv-red" />
    case 'video': return <IconVideo className="w-4 h-4 text-dwv-blue" />
    case 'site': return <IconGlobe className="w-4 h-4 text-dwv-amber" />
    case 'link': return <IconLink className="w-4 h-4 text-dwv-green" />
    default: return <IconExternalLink className="w-4 h-4 text-dwv-muted" />
  }
}

function linkTypeBadge(type: string) {
  const color = type === 'pdf' ? 'text-dwv-red bg-dwv-red/10'
    : type === 'video' ? 'text-dwv-blue bg-dwv-blue/10'
    : type === 'site' ? 'text-dwv-amber bg-dwv-amber/10'
    : 'text-dwv-green bg-dwv-green/10'
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${color} uppercase font-medium`}>{type}</span>
}

function IconPlay({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function IconEye({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function MaterialDetail({ material, onClose }: Props) {
  const [viewerLink, setViewerLink] = useState<{ url: string; type: string; label: string } | null>(null)

  const catColor = material.category === 'estudo' ? 'text-dwv-blue' : 'text-dwv-red'
  const links = material.material_links || []
  const types = [...new Set(links.map(l => l.type || material.type))]

  const handleLinkClick = (link: { url: string; type: string; label: string }) => {
    if (link.type === 'pdf' || link.type === 'video' || link.type === 'site') {
      // Open inline viewer for PDFs, videos and sites
      setViewerLink(link)
    } else {
      // Open external link in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-dwv-card border border-dwv-border rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto animate-fade-in-up"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">{material.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  material.category === 'estudo' ? 'bg-dwv-blue/15 text-dwv-blue' : 'bg-dwv-red/15 text-dwv-red'
                }`}>{material.category}</span>
                {types.map(t => (
                  <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    t === 'pdf' ? 'bg-dwv-red/10 text-dwv-red' : t === 'video' ? 'bg-dwv-blue/10 text-dwv-blue' : t === 'site' ? 'bg-dwv-amber/10 text-dwv-amber' : 'bg-dwv-green/10 text-dwv-green'
                  }`}>{t.toUpperCase()}</span>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-dwv-muted hover:text-white ml-3 flex-shrink-0">
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {material.description && (
            <p className="text-sm text-dwv-text2 mb-6 leading-relaxed">{material.description}</p>
          )}

          <div>
            <h3 className="text-xs uppercase tracking-wider text-dwv-muted mb-3">
              Conteudos ({links.length})
            </h3>
            {links.length === 0 ? (
              <p className="text-sm text-dwv-muted italic">Nenhum conteudo cadastrado</p>
            ) : (
              <div className="flex flex-col gap-2">
                {links.sort((a, b) => a.sort_order - b.sort_order).map(link => {
                  const linkType = link.type || material.type
                  const isViewable = linkType === 'pdf' || linkType === 'video' || linkType === 'site'

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick({ url: link.url, type: linkType, label: link.label })}
                      className="flex items-center gap-3 p-3 rounded-lg bg-dwv-bg2 border border-dwv-border hover:border-dwv-red/40 transition-all group text-left w-full"
                    >
                      {linkTypeIcon(linkType)}
                      <span className="text-sm text-white group-hover:text-dwv-red transition-colors flex-1 truncate">
                        {link.label}
                      </span>
                      {linkTypeBadge(linkType)}
                      {isViewable ? (
                        <span className="flex items-center gap-1 text-[10px] text-dwv-muted group-hover:text-dwv-red transition-colors flex-shrink-0">
                          {linkType === 'video' ? <IconPlay className="w-3.5 h-3.5" /> : <IconEye className="w-3.5 h-3.5" />}
                          {linkType === 'video' ? 'Assistir' : linkType === 'site' ? 'Acessar' : 'Visualizar'}
                        </span>
                      ) : (
                        <IconExternalLink className="w-3.5 h-3.5 text-dwv-muted group-hover:text-dwv-red transition-colors flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Content Viewer */}
      {viewerLink && (
        <ContentViewer
          url={viewerLink.url}
          type={viewerLink.type}
          label={viewerLink.label}
          onClose={() => setViewerLink(null)}
        />
      )}
    </>
  )
}
