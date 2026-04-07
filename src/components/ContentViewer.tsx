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
  const match2 = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (match2) return `https://drive.google.com/file/d/${match2[1]}/preview`
  return null
}

/** Check if URL is a direct PDF (Supabase Storage or other direct links) */
function isDirectPdf(url: string): boolean {
  return url.toLowerCase().endsWith('.pdf') ||
    (url.includes('/storage/v1/object/public/materiais/') && url.includes('/pdfs/'))
}

/** Check if URL is an image */
function isImage(url: string): boolean {
  const lower = url.toLowerCase()
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') ||
    (url.includes('/storage/v1/object/public/materiais/') && url.includes('/images/'))
}

export function ContentViewer({ url, type, label, onClose }: Props) {
  const [loading, setLoading] = useState(true)

  let viewerContent: React.ReactNode
  const isSite = type === 'site'

  if (type === 'pdf') {
    // Check if it's actually an image file uploaded under "pdf" type
    if (isImage(url)) {
      viewerContent = (
        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-full object-contain rounded-lg"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      )
    } else {
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
  } else if (type === 'site') {
    // Embed site in iframe — URL stays hidden from user
    viewerContent = (
      <iframe
        src={url}
        className="w-full h-full rounded-lg bg-white"
        sandbox="allow-scripts allow-forms allow-popups"
        onLoad={() => setLoading(false)}
        title={label}
      />
    )
  } else {
    viewerContent = null
  }

  const badgeColor = type === 'pdf' ? 'bg-dwv-red/15 text-dwv-red'
    : type === 'video' ? 'bg-dwv-blue/15 text-dwv-blue'
    : type === 'site' ? 'bg-dwv-amber/15 text-dwv-amber'
    : 'bg-dwv-green/15 text-dwv-green'

  const isImgFile = type === 'pdf' && isImage(url)
  const loadingLabel = isImgFile ? 'imagem'
    : type === 'pdf' ? 'documento'
    : type === 'video' ? 'video'
    : 'pagina'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full h-full max-w-6xl max-h-[92vh] mx-4 my-4 flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>
              {type.toUpperCase()}
            </span>
            <h3 className="text-white font-medium text-sm truncate">{label}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hide "Abrir original" for site type — URL is confidential */}
            {!isSite && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dwv-text2 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <IconExternalLink className="w-3.5 h-3.5" />
                Abrir original
              </a>
            )}
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
                <p className="text-sm text-dwv-muted">Carregando {loadingLabel}...</p>
              </div>
            </div>
          )}
          {viewerContent}
        </div>
      </div>
    </div>
  )
}
