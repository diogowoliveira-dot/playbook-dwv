'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { getMaterials } from '@/lib/database'
import type { Material } from '@/lib/types'

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'estudo' | 'venda'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'video' | 'link'>('all')

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

  useEffect(() => { fetchMaterials() }, [fetchMaterials])

  const filtered = useMemo(() => {
    return materials.filter(m => {
      const matchSearch = !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || m.category === categoryFilter
      const matchType = typeFilter === 'all' || m.type === typeFilter
      return matchSearch && matchCat && matchType
    })
  }, [materials, search, categoryFilter, typeFilter])

  const cycleCategory = () => {
    const order: ('all' | 'estudo' | 'venda')[] = ['all', 'estudo', 'venda']
    const idx = order.indexOf(categoryFilter)
    setCategoryFilter(order[(idx + 1) % order.length])
  }

  const cycleType = () => {
    const order: ('all' | 'pdf' | 'video' | 'link')[] = ['all', 'pdf', 'video', 'link']
    const idx = order.indexOf(typeFilter)
    setTypeFilter(order[(idx + 1) % order.length])
  }

  return {
    materials: filtered,
    allMaterials: materials,
    loading,
    search, setSearch,
    categoryFilter, cycleCategory,
    typeFilter, cycleType,
    refresh: fetchMaterials,
  }
}
