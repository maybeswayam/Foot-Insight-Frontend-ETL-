'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { CountryFlag } from '@/components/CountryFlag'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type { Player } from '@/lib/types'
import {
  Search,
  Trophy,
  Target,
  Zap,
  Users,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react'

type SortField = 'goals' | 'assists' | 'goalsPerGame' | 'xG' | 'name'

/* ── Position colours ──────────────────────────── */
const POS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  GK: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
  DF: { bg: 'bg-blue-500/15',  text: 'text-blue-400',  border: 'border-blue-500/25' },
  MF: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/25' },
  FW: { bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/25' },
}

const MEDAL = ['bg-yellow-500 text-yellow-950', 'bg-gray-300 text-gray-800', 'bg-orange-400 text-orange-950']

export default function PlayersPage() {
  const [players, setPlayers]   = useState<Player[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [posFilter, setPosFilter] = useState<string>('All')
  const [sortBy, setSortBy]     = useState<SortField>('goals')

  useEffect(() => {
    apiClient.getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load players'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Derived data ──────────────────────────── */
  const positions = useMemo(() => {
    const set = new Set(players.map((p) => p.position))
    return ['All', ...Array.from(set).sort()]
  }, [players])

  const topScorers = useMemo(() =>
    [...players].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3),
  [players])

  const topAssisters = useMemo(() =>
    [...players].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 3),
  [players])

  const topXG = useMemo(() =>
    [...players].sort((a, b) => b.stats.xG - a.stats.xG).slice(0, 3),
  [players])

  const filtered = useMemo(() => {
    let list = [...players]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q),
      )
    }
    if (posFilter !== 'All') list = list.filter((p) => p.position === posFilter)

    switch (sortBy) {
      case 'goals':        list.sort((a, b) => b.stats.goals - a.stats.goals); break
      case 'assists':      list.sort((a, b) => b.stats.assists - a.stats.assists); break
      case 'goalsPerGame': list.sort((a, b) => b.metrics.goalsPerGame - a.metrics.goalsPerGame); break
      case 'xG':           list.sort((a, b) => b.stats.xG - a.stats.xG); break
      case 'name':         list.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [players, search, posFilter, sortBy])

  /* ── Loading / Error ──────────────────────── */
  if (loading) return <><Header /><main className="min-h-screen bg-background flex items-center justify-center py-32"><LoadingSpinner /></main></>
  if (error) return <><Header /><main className="min-h-screen bg-background flex items-center justify-center py-32"><ErrorState message={error} /></main></>

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">

        {/* ═══════ HERO ═══════ */}
        <section className="relative border-b border-border/40 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Players</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {players.length} players · 2022 FIFA World Cup · 32 nations
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ SPOTLIGHT ═══════ */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <SpotlightCard
              icon={Trophy}
              title="Golden Boot"
              subtitle="Top Scorers"
              color="amber"
              players={topScorers}
              statKey="goals"
              statLabel="goals"
            />
            <SpotlightCard
              icon={Target}
              title="Playmaker"
              subtitle="Most Assists"
              color="cyan"
              players={topAssisters}
              statKey="assists"
              statLabel="assists"
            />
            <SpotlightCard
              icon={Zap}
              title="Threat Level"
              subtitle="Highest xG"
              color="green"
              players={topXG}
              statKey="xG"
              statLabel="xG"
              decimal
            />
          </div>
        </section>

        {/* ═══════ SEARCH + FILTERS ═══════ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4 pb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players or teams..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>

          {/* Position pills */}
          <div className="flex flex-wrap gap-2">
            {positions.map((pos) => {
              const active = posFilter === pos
              const c = pos !== 'All' ? POS_COLOR[pos] : null
              return (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    active
                      ? pos === 'All'
                        ? 'bg-green-500 text-slate-900'
                        : `${c?.bg} ${c?.text} ${c?.border} border`
                      : 'border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pos === 'All' ? 'All Positions' : formatPosition(pos)}
                </button>
              )
            })}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ArrowUpDown size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Sort</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'goals', label: 'Top Scorers' },
                { value: 'assists', label: 'Assists' },
                { value: 'goalsPerGame', label: 'Goals/Game' },
                { value: 'xG', label: 'Expected Goals' },
                { value: 'name', label: 'A–Z' },
              ] as { value: SortField; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    sortBy === opt.value
                      ? 'bg-blue-500 text-white'
                      : 'border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {players.length} players
          </p>
        </section>

        {/* ═══════ PLAYER GRID ═══════ */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((player, idx) => {
              const pc = POS_COLOR[player.position] ?? POS_COLOR.MF
              return (
                <Link
                  key={player.playerId}
                  href={`/players/${player.playerId}`}
                  className="group relative rounded-xl border border-border/40 bg-card overflow-hidden hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/5"
                >
                  {/* Rank badge */}
                  {idx < 3 && sortBy !== 'name' && (
                    <div className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${MEDAL[idx]}`}>
                      {idx + 1}
                    </div>
                  )}

                  {/* Top section */}
                  <div className="flex items-center gap-4 p-4">
                    <PlayerPhoto
                      playerName={player.name}
                      size={64}
                      rounded
                      className="border-2 border-border/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-foreground truncate group-hover:text-green-400 transition-colors">
                        {player.name}
                      </h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pc.bg} ${pc.text} border ${pc.border}`}>
                        {formatPosition(player.position)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <CountryFlag country={player.team} size={18} />
                        <span className="text-xs text-muted-foreground truncate">{player.team}</span>
                      </div>
                      {player.club && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                          {player.club}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="grid grid-cols-5 gap-px bg-border/10">
                    <StatPill label="Goals" value={player.stats.goals} highlight />
                    <StatPill label="Assists" value={player.stats.assists} />
                    <StatPill label="Mins" value={player.stats.minutes} />
                    <StatPill label="Games" value={player.stats.games} />
                    <StatPill label="xG" value={player.stats.xG.toFixed(1)} />
                  </div>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-semibold">No players match your filters</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or position filter</p>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function StatPill({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center py-3 bg-secondary/20">
      <span className={`text-base font-black tabular-nums ${highlight ? 'text-green-400' : 'text-foreground'}`}>{value}</span>
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  )
}

/* ── Spotlight Card ──────────────────────── */
const SPOT_COLORS: Record<string, { icon: string; badge: string; gradient: string; stat: string }> = {
  amber: { icon: 'text-amber-400',  badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20', gradient: 'from-amber-500/5', stat: 'text-amber-400' },
  cyan:  { icon: 'text-cyan-400',   badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',   gradient: 'from-cyan-500/5',  stat: 'text-cyan-400' },
  green: { icon: 'text-green-400',  badge: 'bg-green-500/15 text-green-400 border-green-500/20', gradient: 'from-green-500/5', stat: 'text-green-400' },
}

function SpotlightCard({
  icon: Icon,
  title,
  subtitle,
  color,
  players,
  statKey,
  statLabel,
  decimal = false,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>
  title: string
  subtitle: string
  color: string
  players: Player[]
  statKey: 'goals' | 'assists' | 'xG'
  statLabel: string
  decimal?: boolean
}) {
  const c = SPOT_COLORS[color] ?? SPOT_COLORS.green
  return (
    <div className={`sports-card p-5 bg-gradient-to-br ${c.gradient} to-transparent`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${c.icon}`} size={20} />
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{title}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {players.map((p, i) => {
          const val = statKey === 'xG' ? p.stats.xG : statKey === 'assists' ? p.stats.assists : p.stats.goals
          return (
            <Link key={p.playerId} href={`/players/${p.playerId}`} className="flex items-center gap-3 group">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${MEDAL[i]}`}>
                {i + 1}
              </div>
              <PlayerPhoto playerName={p.name} size={36} rounded className="border border-border/20 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-green-400 transition-colors">{p.name}</p>
                <div className="flex items-center gap-1">
                  <CountryFlag country={p.team} size={14} />
                  <span className="text-[10px] text-muted-foreground truncate">{p.team}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-lg font-black tabular-nums ${c.stat}`}>
                  {decimal ? val.toFixed(1) : val}
                </span>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{statLabel}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-green-400 shrink-0 transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
