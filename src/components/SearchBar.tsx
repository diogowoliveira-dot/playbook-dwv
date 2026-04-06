'use client'

import { IconSearch } from './Icons'

export function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dwv-muted" />
      <input
        type="text"
        placeholder="Buscar materiais..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-dwv-input border border-dwv-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-dwv-muted focus:outline-none focus:border-dwv-red/50 transition-colors"
      />
    </div>
  )
}
