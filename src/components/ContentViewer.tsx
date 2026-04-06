'use client'

import { useState } from 'react'
import { IconX, IconExternalLink } from './Icons'

interface Props {
  url: string
  type: string
  label: string
  onClose: () => void
}

/** Extract YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\s#?]+)/,
    /youtube\.com\/shorts\/([^&\s#?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** Extract Vimeo video ID */
function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match ? match[1] : null
}

/** Extract Google Drive file ID and return embed URL */
function getGoogleDriveEmbedUrl(url: string): string | null {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  // Also handle open?id= format
  const match2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (match2) return `https://drive.google.com/file/d/${match2[1]}/preview`
  return null
}

/** Check if URL is a direct PDF (Supabase Storage or other direct links) */
function isDirectPdf(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') || url.includes('/storage/v1/object/public/materiais/')
}

export function ContentViewer({ url, type, label, onClose }: Props) {
  const [loading, setLoading] = useState(true)

  // Determine what to render
  let viewerContent: React.ReactNode

  if (type === 'pdf') {
    const driveEmbed = getGoogleDriveEmbedUrl(url)
    if (driveEmbed) {
      viewerContent = (
        <iframe
          src={driveEmbed}
          className="w-full h-full rounded-lg"
          allow="autoplay"
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    } else if (isDirectPdf(url)) {
      viewerContent = (
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full rounded-lg"
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    } else {
      viewerContent = (
        <iframe
          src={url}
          className="w-full h-full rounded-lg"
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    }
  } else if (type === 'video') {
    const youtubeId = getYouTubeId(url)
    const vimeoId = getVimeoId(url)
    const driveEmbed = getGoogleDriveEmbedUrl(url)

    if (youtubeId) {
      viewerContent = (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    } else if (vimeoId) {
      viewerContent = (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    } else if (driveEmbed) {
      // Google Drive video - use preview embed
      viewerContent = (
        <iframe
          src={driveEmbed}
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => setLoading(false)}
          title={label}
        />
      )
    } else {
      // Generic video URL - try HTML5 video player
      viewerContent = (
        <video
          src={url}
          controls
          autoPlay
          className="w-full h-full rounded-lg object-contain bg-black"
          onLoadedData={() => setLoading(false)}
          onError={() => setLoading(false)}
        >
          Seu navegador nao suporta o elemento de video.
        </video>
      )
    }
  } else {
    viewerContent = null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full h-full max-w-6xl max-h-[92vh] mx-4 my-4 flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              type === 'pdf' ? 'bg-dwv-red/15 text-dwv-red' : 'bg-dwv-blue/15 text-dwv-blue'
            }`}>
              {type.toUpperCase()}
            </span>
            <h3 className="text-white font-medium text-sm truncate">{label}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dwv-text2 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <IconExternalLink className="w-3.5 h-3.5" />
              Abrir original
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-dwv-muted hover:text-white transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 relative rounded-lg overflow-hidden bg-dwv-bg2 border border-dwv-border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-dwv-bg2 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-dwv-red border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-dwv-muted">Carregando {type === 'pdf' ? 'documento' : 'video'}...</p>
              </div>
            </div>
          )}
          {viewerContent}
        </div>
      </div>
    </div>
  )
}
