interface StatBarProps {
  label: string
  homeValue: number | string
  awayValue: number | string
  homePercent?: number
  awayPercent?: number
  variant?: 'default' | 'possession' | 'shots'
}

export function StatBar({
  label,
  homeValue,
  awayValue,
  homePercent,
  awayPercent,
  variant = 'default',
}: StatBarProps) {
  const totalPercent = (homePercent || 0) + (awayPercent || 0)
  const homePercentNormalized = totalPercent > 0 ? (homePercent! / totalPercent) * 100 : 50
  const awayPercentNormalized = totalPercent > 0 ? (awayPercent! / totalPercent) * 100 : 50

  return (
    <div className="sports-card p-4 sm:p-6 space-y-4">
      {/* Label and Percentages */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{label}</h3>
        {homePercent !== undefined && (
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="text-primary">{homePercentNormalized.toFixed(0)}%</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-cyan-400">{awayPercentNormalized.toFixed(0)}%</span>
          </div>
        )}
      </div>

      {/* Visual Bar */}
      {homePercent !== undefined ? (
        <div className="flex h-4 overflow-hidden rounded-full bg-secondary/50 gap-1">
          <div
            className="bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all duration-500 shadow-lg shadow-primary/30"
            style={{ width: `${homePercentNormalized}%` }}
          />
          <div
            className="bg-gradient-to-r from-cyan-400 to-primary rounded-full transition-all duration-500 shadow-lg shadow-cyan-400/30"
            style={{ width: `${awayPercentNormalized}%` }}
          />
        </div>
      ) : (
        /* Value Cards */
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary/10 px-3 py-3 text-center">
            <p className="text-3xl font-black text-primary">{homeValue}</p>
          </div>
          <div className="rounded-lg bg-cyan-400/10 px-3 py-3 text-center">
            <p className="text-3xl font-black text-cyan-400">{awayValue}</p>
          </div>
        </div>
      )}
    </div>
  )
}
