'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { CountryFlag } from '@/components/CountryFlag'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import { StarsOfEra } from '@/components/StarsOfEra'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type { Player } from '@/lib/types'
import { Search, Trophy, Target, Zap, ArrowUpDown } from 'lucide-react'

type SortField = 'goals' | 'assists' | 'goalsPerGame' | 'xG' | 'name'

/* ── Position colours ──────────────────────────── */
const POS_COLOR: Record<string, string> = {
  GK: 'bg-gold/10 text-gold border-gold/25',
  DF: 'bg-[#0096DC]/10 text-[#4BB8E8] border-[#0096DC]/25',
  MF: 'bg-pitch/10 text-pitch border-pitch/25',
  FW: 'bg-redcard/10 text-[#F07060] border-redcard/25',
}

const MEDAL = ['bg-gold text-black', 'bg-[#C0C0C0] text-black', 'bg-[#CD7F32] text-black']

const COMPETITIONS: { value: string; label: string; slug?: 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1' }[] = [
  { value: 'FIFA World Cup', label: 'World Cup' },
  { value: 'Premier League', label: 'Premier League', slug: 'premier-league' },
  { value: 'La Liga', label: 'La Liga', slug: 'la-liga' },
  { value: 'Bundesliga', label: 'Bundesliga', slug: 'bundesliga' },
  { value: 'Serie A', label: 'Serie A', slug: 'serie-a' },
  { value: 'Ligue 1', label: 'Ligue 1', slug: 'ligue-1' },
]

const compOf = (p: Player) => p.competition ?? 'FIFA World Cup'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [compFilter, setCompFilter] = useState('FIFA World Cup')
  const [posFilter, setPosFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<SortField>('goals')

  useEffect(() => {
    apiClient.getPlayers()
      .then(setPlayers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load players'))
      .finally(() => setLoading(false))
  }, [])

  /* ── Derived data ──────────────────────────── */
  const pool = useMemo(
    () => players.filter((p) => compOf(p) === compFilter),
    [players, compFilter],
  )

  const positions = useMemo(() => {
    const set = new Set(pool.map((p) => p.position))
    return ['All', ...Array.from(set).sort()]
  }, [pool])

  const topScorers = useMemo(() =>
    [...pool].sort((a, b) => b.stats.goals - a.stats.goals).slice(0, 3),
  [pool])

  const topAssisters = useMemo(() =>
    [...pool].sort((a, b) => b.stats.assists - a.stats.assists).slice(0, 3),
  [pool])

  const topXG = useMemo(() =>
    [...pool].sort((a, b) => b.stats.xG - a.stats.xG).slice(0, 3),
  [pool])

  const filtered = useMemo(() => {
    let list = [...pool]
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
  }, [pool, search, posFilter, sortBy])

  const isWorldCup = compFilter === 'FIFA World Cup'

  /* ── Loading / Error ──────────────────────── */
  if (loading) return <><Header /><main className="min-h-screen bg-ink flex items-center justify-center py-32"><LoadingSpinner /></main></>
  if (error) return <><Header /><main className="min-h-screen bg-ink flex items-center justify-center py-32"><ErrorState message={error} /></main></>

  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink overflow-x-hidden">

        {/* ═══════ HERO ═══════ */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16">
            <div className="section-tag">Player Database</div>
            <h1 className="font-display text-[clamp(48px,6vw,80px)] tracking-[1px] leading-[0.9] text-cream">
              EVERY PLAYER.
              <br />
              <span className="text-pitch">EVERY NUMBER.</span>
            </h1>
            <p className="text-sm text-faint mt-4">
              {players.length.toLocaleString()} player stat-lines · 2022 FIFA World Cup + Europe&apos;s top 5 leagues
            </p>
          </div>
        </section>

        {/* ═══════ COMPETITION TABS ═══════ */}
        <section className="border-b border-line bg-ink-2">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {COMPETITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => { setCompFilter(c.value); setPosFilter('All') }}
                  className={`shrink-0 flex items-center gap-2 min-h-[40px] px-4 py-2.5 border text-[11px] font-semibold tracking-[1.5px] uppercase transition-colors rounded-[2px] ${
                    compFilter === c.value
                      ? 'bg-pitch text-black border-pitch'
                      : 'border-line-strong text-fog hover:text-cream hover:border-line-strong'
                  }`}
                >
                  {c.slug ? <LeagueLogo league={c.slug} size={16} /> : <span>🏆</span>}
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ SPOTLIGHT ═══════ */}
        <section className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12">
          <div className="flex items-end justify-between gap-6 mb-8 border-b border-line pb-5">
            <div>
              <div className="section-tag">Spotlight</div>
              <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[1px] leading-none text-cream">
                {isWorldCup ? 'WORLD CUP LEADERS' : `${compFilter.toUpperCase()} LEADERS`}
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SpotlightCard icon={Trophy} title="Golden Boot" subtitle="Top Scorers" tone="gold" players={topScorers} statKey="goals" statLabel="goals" isWorldCup={isWorldCup} />
            <SpotlightCard icon={Target} title="Playmaker" subtitle="Most Assists" tone="sky" players={topAssisters} statKey="assists" statLabel="assists" isWorldCup={isWorldCup} />
            <SpotlightCard icon={Zap} title="Threat Level" subtitle="Highest xG" tone="pitch" players={topXG} statKey="xG" statLabel="xG" decimal isWorldCup={isWorldCup} />
          </div>
        </section>

        {/* ═══════ STARS OF THE ERA ═══════ */}
        <section className="bg-ink-2 border-t border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16">
            <StarsOfEra />
          </div>
        </section>

        {/* ═══════ SEARCH + FILTERS ═══════ */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 space-y-5">
            <div>
              <div className="section-tag">Browse</div>
              <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[1px] leading-none text-cream">
                THE FULL DATABASE
              </h2>
            </div>

            <div className="relative max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players or teams..."
                className="w-full pl-9 pr-4 py-2.5 rounded-[2px] border border-line-strong bg-surface text-sm text-cream placeholder:text-faint focus:outline-none focus:border-pitch/60 transition-colors"
              />
            </div>

            {/* Position pills */}
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => {
                const active = posFilter === pos
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosFilter(pos)}
                    className={`min-h-[40px] px-3 py-2 rounded-[2px] border text-[11px] font-semibold tracking-[1.5px] uppercase transition-colors ${
                      active
                        ? pos === 'All'
                          ? 'bg-pitch text-black border-pitch'
                          : (POS_COLOR[pos] ?? 'bg-pitch/10 text-pitch border-pitch/25')
                        : 'border-line text-fog hover:text-cream hover:border-line-strong'
                    }`}
                  >
                    {pos === 'All' ? 'All Positions' : formatPosition(pos)}
                  </button>
                )
              })}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-faint">
                <ArrowUpDown size={13} />
                <span className="text-[10px] font-semibold tracking-[1.5px] uppercase">Sort</span>
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
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    className={`min-h-[40px] px-3 py-2 rounded-[2px] border text-[11px] font-semibold tracking-[1.5px] uppercase transition-colors ${
                      sortBy === opt.value
                        ? 'bg-surface-3 text-cream border-line-strong'
                        : 'border-line text-fog hover:text-cream hover:border-line-strong'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-faint tracking-[0.5px] uppercase">
              Showing {filtered.length.toLocaleString()} of {pool.length.toLocaleString()} players · {compFilter}
            </p>

            {/* ═══════ PLAYER GRID ═══════ */}
            <div className="hairline-grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((player, idx) => (
                <Link
                  key={player.playerId}
                  href={`/players/${player.playerId}`}
                  className="group bg-surface hover:bg-surface-2 p-4 transition-colors relative"
                >
                  {/* Rank badge */}
                  {idx < 3 && sortBy !== 'name' && (
                    <span className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-[2px] flex items-center justify-center text-[11px] font-bold ${MEDAL[idx]}`}>
                      {idx + 1}
                    </span>
                  )}

                  {/* Top section */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[2px] border-2 border-line-strong bg-surface-2">
                      <PlayerPhoto playerName={player.name} size={52} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg tracking-[0.5px] text-cream truncate group-hover:text-pitch transition-colors leading-tight">
                        {player.name.toUpperCase()}
                      </h3>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-[1px] border text-[9px] font-bold tracking-[1px] uppercase ${POS_COLOR[player.position] ?? POS_COLOR.MF}`}>
                        {formatPosition(player.position)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isWorldCup ? (
                          <CountryFlag country={player.team} size={16} />
                        ) : (
                          <TeamLogo teamName={player.team} size={14} />
                        )}
                        <span className="text-[11px] text-fog truncate">{player.team}</span>
                      </div>
                      {player.club && player.club !== player.team && (
                        <p className="text-[10px] text-faint mt-0.5 truncate">{player.club}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats strip */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-line border border-line">
                    <StatCell label="G" value={player.stats.goals} tone="pitch" />
                    <StatCell label="A" value={player.stats.assists} tone="gold" />
                    <StatCell label="Mins" value={player.stats.minutes} className="hidden sm:block" />
                    <StatCell label="Games" value={player.stats.games} className="hidden sm:block" />
                    <StatCell label="xG" value={player.stats.xG.toFixed(1)} />
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 border border-line bg-surface">
                <Search className="h-10 w-10 text-faint mx-auto mb-4" />
                <p className="text-cream font-display text-2xl tracking-[1px]">NO PLAYERS FOUND</p>
                <p className="text-xs text-faint mt-1">Try adjusting your search or position filter</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function StatCell({
  label,
  value,
  tone,
  className = '',
}: {
  label: string
  value: number | string
  tone?: 'pitch' | 'gold'
  className?: string
}) {
  return (
    <div className={`bg-surface-2 py-2.5 text-center ${className}`}>
      <div className={`font-display text-base leading-none ${tone === 'pitch' ? 'text-pitch' : tone === 'gold' ? 'text-gold' : 'text-cream'}`}>
        {value}
      </div>
      <div className="text-[10px] text-faint uppercase tracking-[1px] mt-0.5">{label}</div>
    </div>
  )
}

/* ── Spotlight Card ──────────────────────── */
const SPOT_TONES: Record<string, { icon: string; stat: string }> = {
  gold:  { icon: 'text-gold',        stat: 'text-gold' },
  sky:   { icon: 'text-[#4BB8E8]',   stat: 'text-[#4BB8E8]' },
  pitch: { icon: 'text-pitch',       stat: 'text-pitch' },
}

function SpotlightCard({
  icon: Icon,
  title,
  subtitle,
  tone,
  players,
  statKey,
  statLabel,
  decimal = false,
  isWorldCup,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>
  title: string
  subtitle: string
  tone: string
  players: Player[]
  statKey: 'goals' | 'assists' | 'xG'
  statLabel: string
  decimal?: boolean
  isWorldCup: boolean
}) {
  const c = SPOT_TONES[tone] ?? SPOT_TONES.pitch
  return (
    <div className="bg-surface border border-line">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-line">
        <Icon className={`h-4 w-4 ${c.icon}`} size={16} />
        <div>
          <h3 className="font-display text-base tracking-[1px] text-cream leading-none">{title.toUpperCase()}</h3>
          <p className="text-[9px] text-faint uppercase tracking-[1.5px] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-line">
        {players.map((p, i) => {
          const val = statKey === 'xG' ? p.stats.xG : statKey === 'assists' ? p.stats.assists : p.stats.goals
          return (
            <Link key={p.playerId} href={`/players/${p.playerId}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2 transition-colors group">
              <span className={`w-5 h-5 rounded-[2px] flex items-center justify-center text-[10px] font-bold shrink-0 ${MEDAL[i]}`}>
                {i + 1}
              </span>
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-[2px] border border-line-strong bg-surface-2">
                <PlayerPhoto playerName={p.name} size={30} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-cream truncate group-hover:text-pitch transition-colors">{p.name}</p>
                <div className="flex items-center gap-1">
                  {isWorldCup ? (
                    <CountryFlag country={p.team} size={12} />
                  ) : (
                    <TeamLogo teamName={p.team} size={12} />
                  )}
                  <span className="text-[10px] text-faint truncate">{p.team}</span>
                </div>
              </div>
              <span className={`font-display text-2xl leading-none ${c.stat}`}>
                {decimal ? val.toFixed(1) : val}
              </span>
              <span className="text-[9px] text-faint uppercase tracking-[1px] w-10 text-right">{statLabel}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
