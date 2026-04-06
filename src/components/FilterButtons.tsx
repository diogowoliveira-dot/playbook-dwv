'use client'

interface FilterButtonsProps {
  categoryFilter: string
  cycleCategory: () => void
  typeFilter: string
  cycleType: () => void
  viewMode: 'grid' | 'list'
  setViewMode: (v: 'grid' | 'list') => void
}

import { IconGrid, IconList } from './Icons'

export function FilterButtons({
  categoryFilter, cycleCategory,
  typeFilter, cycleType,
  viewMode, setViewMode,
}: FilterButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={cycleCategory}
        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
          categoryFilter !== 'all'
            ? 'bg-dwv-red/20 border-dwv-red/40 text-dwv-red'
            : 'bg-dwv-card border-dwv-border text-dwv-text2 hover:border-dwv-border-hover'
        }`}
      >
        {categoryFilter === 'all' ? 'Categoria' : categoryFilter === 'estudo' ? 'Estudo' : 'Venda'}
      </button>
      <button
        onClick={cycleType}
        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
          typeFilter !== 'all'
            ? 'bg-dwv-blue/20 border-dwv-blue/40 text-dwv-blue'
            : 'bg-dwv-card border-dwv-border text-dwv-text2 hover:border-dwv-border-hover'
        }`}
      >
        {typeFilter === 'all' ? 'Tipo' : typeFilter.toUpperCase()}
      </button>
      <div className="flex items-center border border-dwv-border rounded-lg overflow-hidden ml-auto">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-dwv-red/20 text-dwv-red' : 'text-dwv-muted hover:text-white'}`}
        >
          <IconGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-dwv-red/20 text-dwv-red' : 'text-dwv-muted hover:text-white'}`}
        >
          <IconList className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
