'use client'

import { useState, useEffect, useRef } from 'react'
import type { Material, MaterialFormData } from '@/lib/types'
import { IconX, IconPlus, IconTrash, IconSparkle } from './Icons'

interface Props {
  material?: Material | null
  onClose: () => void
  onSave: (data: MaterialFormData) => Promise<void>
}

function IconUpload({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}

export function MaterialModal({ material, onClose, onSave }: Props) {
  const isEdit = !!material
  const [form, setForm] = useState<MaterialFormData>({
    title: '',
    description: '',
    category: 'estudo',
    links: [],
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUploadIndex = useRef<number | null>(null)

  useEffect(() => {
    if (material) {
      setForm({
        title: material.title,
        description: material.description || '',
        category: material.category,
        links: (material.material_links || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(l => ({ label: l.label, url: l.url, type: l.type || material.type })),
      })
    }
  }, [material])

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const generateWithAI = async () => {
    if (!form.title.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, type: form.links[0]?.type || 'link', category: form.category }),
      })
      const data = await res.json()
      if (data.description) {
        setForm(prev => ({ ...prev, description: data.description }))
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false)
    }
  }

  const addLink = (type: 'pdf' | 'video' | 'link' | 'site' = 'link') =>
    setForm(prev => ({ ...prev, links: [...prev.links, { label: '', url: '', type }] }))
  const removeLink = (i: number) => setForm(prev => ({ ...prev, links: prev.links.filter((_, idx) => idx !== i) }))
  const updateLink = (i: number, field: 'label' | 'url' | 'type', value: string) => {
    setForm(prev => ({
      ...prev,
      links: prev.links.map((l, idx) => idx === i ? { ...l, [field]: value } : l),
    }))
  }

  const handleUploadClick = (index: number) => {
    pendingUploadIndex.current = index
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const index = pendingUploadIndex.current
    if (!file || index === null) return

    // Reset file input
    e.target.value = ''

    if (file.type !== 'application/pdf') {
      alert('Apenas arquivos PDF sao permitidos')
      return
    }

    if (file.size > 52428800) {
      alert('Arquivo excede o limite de 50MB')
      return
    }

    setUploadingIndex(index)

    try {
      // Upload directly to Supabase Storage (bypasses Vercel 4.5MB limit)
      const { supabase } = await import('@/lib/supabase-client')
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `pdfs/${timestamp}_${safeName}`

      const { data, error } = await supabase.storage
        .from('materiais')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (error) {
        alert('Erro ao fazer upload: ' + error.message)
        return
      }

      const { data: urlData } = supabase.storage
        .from('materiais')
        .getPublicUrl(data.path)

      // Update the link URL with the uploaded file URL
      updateLink(index, 'url', urlData.publicUrl)

      // If label is empty, set the filename as label
      if (!form.links[index]?.label) {
        const cleanName = file.name.replace('.pdf', '').replace(/[_-]/g, ' ')
        updateLink(index, 'label', cleanName)
      }
    } catch {
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploadingIndex(null)
      pendingUploadIndex.current = null
    }
  }

  const isSupabaseUrl = (url: string) => url.includes('/storage/v1/object/public/materiais/')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dwv-card border border-dwv-border rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar Material' : 'Novo Material'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-dwv-muted hover:text-white">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Titulo *</label>
            <input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
              placeholder="Nome do material"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-dwv-muted uppercase tracking-wider">Categoria</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value as 'estudo' | 'venda' }))}
              className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50"
            >
              <option value="estudo">Estudo</option>
              <option value="venda">Venda</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-dwv-muted uppercase tracking-wider">Descricao</label>
              <button
                onClick={generateWithAI}
                disabled={generating || !form.title.trim()}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  generating
                    ? 'bg-dwv-red/20 text-dwv-red animate-glow'
                    : 'bg-dwv-red/10 text-dwv-red hover:bg-dwv-red/20'
                } disabled:opacity-40`}
              >
                <IconSparkle className="w-3.5 h-3.5" />
                {generating ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full bg-dwv-input border border-dwv-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-dwv-red/50 resize-none"
              placeholder="Descricao do material..."
            />
          </div>

          {/* Links / Conteudos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-dwv-muted uppercase tracking-wider">Conteudos</label>
              <div className="flex items-center gap-1">
                <button onClick={() => addLink('pdf')} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-dwv-red/10 text-dwv-red hover:bg-dwv-red/20 transition-colors">
                  <IconPlus className="w-3 h-3" /> PDF
                </button>
                <button onClick={() => addLink('video')} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-dwv-blue/10 text-dwv-blue hover:bg-dwv-blue/20 transition-colors">
                  <IconPlus className="w-3 h-3" /> Video
                </button>
                <button onClick={() => addLink('site')} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors">
                  <IconPlus className="w-3 h-3" /> Site
                </button>
                <button onClick={() => addLink('link')} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-dwv-green/10 text-dwv-green hover:bg-dwv-green/20 transition-colors">
                  <IconPlus className="w-3 h-3" /> Link
                </button>
              </div>
            </div>
            {form.links.length === 0 && (
              <p className="text-xs text-dwv-muted italic py-2">Nenhum conteudo adicionado. Use os botoes acima para adicionar PDF, Video ou Link.</p>
            )}
            <div className="space-y-2">
              {form.links.map((link, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <select
                      value={link.type}
                      onChange={e => updateLink(i, 'type', e.target.value)}
                      className={`w-16 bg-dwv-input border border-dwv-border rounded-lg px-1.5 py-2 text-[10px] font-medium text-center focus:outline-none focus:border-dwv-red/50 ${
                        link.type === 'pdf' ? 'text-dwv-red' : link.type === 'video' ? 'text-dwv-blue' : link.type === 'site' ? 'text-amber-500' : 'text-dwv-green'
                      }`}
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="site">Site</option>
                      <option value="link">Link</option>
                    </select>
                    <input
                      value={link.label}
                      onChange={e => updateLink(i, 'label', e.target.value)}
                      placeholder="Nome do conteudo"
                      className="flex-1 bg-dwv-input border border-dwv-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-dwv-red/50"
                    />
                    <button onClick={() => removeLink(i)} className="p-2 text-dwv-muted hover:text-dwv-red flex-shrink-0">
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* URL input + upload button for PDF */}
                  <div className="flex gap-2 items-center ml-[72px]">
                    <input
                      value={link.url}
                      onChange={e => updateLink(i, 'url', e.target.value)}
                      placeholder={link.type === 'pdf' ? 'URL do PDF ou faca upload abaixo' : link.type === 'video' ? 'URL do video (YouTube, Vimeo, Google Drive)' : link.type === 'site' ? 'URL do site (sera exibido inline, URL oculta)' : 'https://...'}
                      className={`flex-1 bg-dwv-input border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-dwv-red/50 ${
                        isSupabaseUrl(link.url) ? 'border-dwv-green/40' : 'border-dwv-border'
                      }`}
                    />
                    {link.type === 'pdf' && (
                      <button
                        onClick={() => handleUploadClick(i)}
                        disabled={uploadingIndex === i}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                          uploadingIndex === i
                            ? 'bg-dwv-red/20 text-dwv-red animate-pulse'
                            : isSupabaseUrl(link.url)
                            ? 'bg-dwv-green/10 text-dwv-green hover:bg-dwv-green/20'
                            : 'bg-dwv-red/10 text-dwv-red hover:bg-dwv-red/20'
                        }`}
                      >
                        <IconUpload className="w-3.5 h-3.5" />
                        {uploadingIndex === i ? 'Enviando...' : isSupabaseUrl(link.url) ? 'Enviado' : 'Upload'}
                      </button>
                    )}
                  </div>

                  {/* Upload success indicator */}
                  {link.type === 'pdf' && isSupabaseUrl(link.url) && (
                    <p className="text-[10px] text-dwv-green ml-[72px] flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 6L9 17l-5-5" /></svg>
                      PDF hospedado no sistema — sera exibido no visualizador inline
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dwv-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-dwv-text2 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-dwv-red hover:bg-dwv-red-dark text-white transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}
