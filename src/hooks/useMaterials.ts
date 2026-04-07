'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { getMaterials } from '@/lib/database'
import { apiFetch } from '@/lib/api-client'
import type { Material, MaterialView, ViewStatus } from '@/lib/types'

export type ViewFilter = 'all' | 'new' | 'viewed'

export function useMaterials(userId?: string) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [views, setViews] = useState<MaterialView[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'estudo' | 'venda'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'video' | 'link' | 'site'>('all')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMaterials()
      setMaterials(data)
    } catch (err) {
      console.error('Error fetching materials:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchViews = useCallback(async () => {
    if (!userId) return
    try {
      const res = await apiFetch('/api/views')
      if (!res.ok) return
      const data = await res.json()
      if (data.views) setViews(data.views)
    } catch (err) {
      console.error('Error fetching views:', err)
    }
  }, [userId])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])
  useEffect(() => { fetchViews() }, [fetchViews])

  // Map of materialId -> viewed_at
  const viewsMap = useMemo(() => {
    const map = new Map<string, string>()
    views.forEach(v => map.set(v.material_id, v.viewed_at))
    return map
  }, [views])

  // Get the view status for a material
  const getViewStatus = useCallback((material: Material): ViewStatus => {
    const viewedAt = viewsMap.get(material.id)
    if (!viewedAt) return 'new' // Never viewed
    // If material was updated after the user viewed it
    if (new Date(material.updated_at) > new Date(viewedAt)) return 'updated'
    return 'viewed'
  }, [viewsMap])

  // Sort: new and updated first, then viewed. Within each group, most recent first.
  const sorted = useMemo(() => {
    return [...materials].sort((a, b) => {
      const statusA = getViewStatus(a)
      const statusB = getViewStatus(b)
      const priorityA = statusA === 'new' ? 0 : statusA === 'updated' ? 1 : 2
      const priorityB = statusB === 'new' ? 0 : statusB === 'updated' ? 1 : 2
      if (priorityA !== priorityB) return priorityA - priorityB
      // Within same priority, newest first
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [materials, getViewStatus])

  const filtered = useMemo(() => {
    return sorted.filter(m => {
      const matchSearch = !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || m.category === categoryFilter
      const matchType = typeFilter === 'all' || m.type === typeFilter
      const status = getViewStatus(m)
      const matchView = viewFilter === 'all'
        || (viewFilter === 'new' && (status === 'new' || status === 'updated'))
        || (viewFilter === 'viewed' && status === 'viewed')
      return matchSearch && matchCat && matchType && matchView
    })
  }, [sorted, search, categoryFilter, typeFilter, viewFilter, getViewStatus])

  const cycleCategory = () => {
    const order: ('all' | 'estudo' | 'venda')[] = ['all', 'estudo', 'venda']
    const idx = order.indexOf(categoryFilter)
    setCategoryFilter(order[(idx + 1) % order.length])
  }

  const cycleType = () => {
    const order: ('all' | 'pdf' | 'video' | 'site' | 'link')[] = ['all', 'pdf', 'video', 'site', 'link']
    const idx = order.indexOf(typeFilter)
    setTypeFilter(order[(idx + 1) % order.length])
  }

  const cycleViewFilter = () => {
    const order: ViewFilter[] = ['all', 'new', 'viewed']
    const idx = order.indexOf(viewFilter)
    setViewFilter(order[(idx + 1) % order.length])
  }

  const markAsViewed = useCallback(async (materialId: string) => {
    if (!userId) return
    try {
      const res = await apiFetch('/api/views', {
        method: 'POST',
        body: JSON.stringify({ materialId }),
      })
      if (!res.ok) {
        console.error('Failed to mark as viewed')
        return
      }
      // Update local state immediately
      setViews(prev => {
        const existing = prev.findIndex(v => v.material_id === materialId)
        const now = new Date().toISOString()
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { material_id: materialId, viewed_at: now }
          return updated
        }
        return [...prev, { material_id: materialId, viewed_at: now }]
      })
    } catch (err) {
      console.error('Error marking as viewed:', err)
    }
  }, [userId])

  // Count of unseen (new + updated)
  const unseenCount = useMemo(() => {
    return materials.filter(m => {
      const s = getViewStatus(m)
      return s === 'new' || s === 'updated'
    }).length
  }, [materials, getViewStatus])

  return {
    materials: filtered,
    allMaterials: materials,
    loading,
    search, setSearch,
    categoryFilter, cycleCategory,
    typeFilter, cycleType,
    viewFilter, cycleViewFilter,
    getViewStatus,
    markAsViewed,
    unseenCount,
    refresh: fetchMaterials,
  }
}
