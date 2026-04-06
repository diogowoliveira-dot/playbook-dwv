'use client'

interface StatCard {
  label: string
  value: number
  color: string
}

export function StatsRow({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-dwv-card border border-dwv-border rounded-xl p-4 animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <p className="text-dwv-muted text-xs uppercase tracking-wider mb-1">{s.label}</p>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
