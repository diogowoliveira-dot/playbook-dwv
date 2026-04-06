'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMaterials } from '@/hooks/useMaterials'
import { getProfiles } from '@/lib/database'
import type { Material, MaterialFormData } from '@/lib/types'
import { StatsRow } from '@/components/StatsRow'
import { SearchBar } from '@/components/SearchBar'
import { FilterButtons } from '@/components/FilterButtons'
import { MaterialCard } from '@/components/MaterialCard'
import { MaterialModal } from '@/components/MaterialModal'
import { MaterialDetail } from '@/components/MaterialDetail'
import { IconPlus } from '@/components/Icons'
import { showToast } from '@/components/Toast'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { profile, isMaster } = useAuth()
  const {
    materials, allMaterials, loading,
    search, setSearch,
    categoryFilter, cycleCategory,
    typeFilter, cycleType,
    refresh,
  } = useMaterials()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [editMaterial, setEditMaterial] = useState<Material | null>(null)
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    if (isMaster) {
      getProfiles().then(p => setUserCount(p.length)).catch(() => {})
    }
  }, [isMaster])

  const stats = [
    { label: 'Total', value: allMaterials.length, color: 'text-white' },
    { label: 'Estudo', value: allMaterials.filter(m => m.category === 'estudo').length, color: 'text-dwv-blue' },
    { label: 'Venda', value: allMaterials.filter(m => m.category === 'venda').length, color: 'text-dwv-red' },
    ...(isMaster ? [{ label: 'Usuarios', value: userCount, color: 'text-dwv-amber' }] : []),
  ]

  const handleSave = useCallback(async (data: MaterialFormData) => {
    if (!profile) {
      showToast('Erro: perfil nao encontrado. Faca logout e login novamente.', 'error')
      throw new Error('Perfil nao encontrado')
    }

    const primaryType = data.links.length > 0 ? data.links[0].type : 'link'

    if (editMaterial) {
      // UPDATE via server API
      const res = await fetch('/api/materials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editMaterial.id,
          title: data.title,
          description: data.description,
          category: data.category,
          links: data.links,
          userId: profile.id,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        showToast(`Erro: ${result.error}`, 'error')
        throw new Error(result.error)
      }
      showToast('Material atualizado!')
    } else {
      // CREATE via server API
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          type: primaryType,
          createdBy: profile.id,
          links: data.links,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        showToast(`Erro: ${result.error}`, 'error')
        throw new Error(result.error)
      }
      showToast('Material criado!')
    }
    refresh()
  }, [editMaterial, profile, refresh])

  const handleDelete = useCallback(async (m: Material) => {
    if (!confirm(`Deletar "${m.title}"?`)) return
    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, userId: profile?.id }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      showToast('Material deletado!')
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao deletar'
      showToast(msg, 'error')
    }
  }, [refresh, profile])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Materiais</h1>
          <p className="text-sm text-dwv-muted mt-1">Central de materiais de estudo e venda</p>
        </div>
        {isMaster && (
          <button
            onClick={() => { setEditMaterial(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-dwv-red hover:bg-dwv-red-dark text-white text-sm font-medium transition-colors"
          >
            <IconPlus className="w-4 h-4" /> Novo Material
          </button>
        )}
      </div>

      <StatsRow stats={stats} />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <FilterButtons
          categoryFilter={categoryFilter}
          cycleCategory={cycleCategory}
          typeFilter={typeFilter}
          cycleType={cycleType}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-dwv-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dwv-muted text-sm">Nenhum material encontrado</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m, i) => (
            <MaterialCard
              key={m.id}
              material={m}
              isMaster={!!isMaster}
              viewMode="grid"
              index={i}
              onEdit={mat => { setEditMaterial(mat); setShowModal(true) }}
              onDelete={handleDelete}
              onClick={setDetailMaterial}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {materials.map((m, i) => (
            <MaterialCard
              key={m.id}
              material={m}
              isMaster={!!isMaster}
              viewMode="list"
              index={i}
              onEdit={mat => { setEditMaterial(mat); setShowModal(true) }}
              onDelete={handleDelete}
              onClick={setDetailMaterial}
            />
          ))}
        </div>
      )}

      {showModal && (
        <MaterialModal
          material={editMaterial}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      {detailMaterial && (
        <MaterialDetail
          material={detailMaterial}
          onClose={() => setDetailMaterial(null)}
        />
      )}
    </div>
  )
}
