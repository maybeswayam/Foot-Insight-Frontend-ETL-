'use client'

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { CountryFlag } from '@/components/CountryFlag'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type { Player } from '@/lib/types'
import {
  ArrowLeft,
  Target,
  Footprints,
  Shield,
  Crosshair,
  BarChart3,
  User,
  Zap,
  Trophy,
  Clock,
  TrendingUp,
} from 'lucide-react'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

/* ── Position colours ──────────────────── */
const POS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  GK: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
  DF: { bg: 'bg-blue-500/15',  text: 'text-blue-400',  border: 'border-blue-500/25' },
  MF: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/25' },
  FW: { bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/25' },
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const [playerId, setPlayerId] = useState('')
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview')

  useEffect(() => { params.then(({ id }) => setPlayerId(id)) }, [params])

  useEffect(() => {
    if (!playerId) return
    apiClient.getPlayerDetail(playerId)
      .then(setPlayer)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load player'))
      .finally(() => setLoading(false))
  }, [playerId])

  /* ── Trait bars ───────────────────────── */
  const traits = useMemo(() => {
    if (!player) return []
    const s = player.stats
    return [
      { label: 'Finishing',  value: Math.min((s.goals / 8) * 100, 100), raw: s.goals,                                icon: Target },
      { label: 'Creativity', value: Math.min((s.assists / 4) * 100, 100), raw: s.assists,                             icon: Footprints },
      { label: 'Passing',    value: Math.min(s.passAccuracy, 100), raw: `${s.passAccuracy.toFixed(0)}%`,               icon: Crosshair },
      { label: 'Defending',  value: Math.min(((s.tackles + s.interceptions) / 30) * 100, 100), raw: s.tackles + s.interceptions, icon: Shield },
    ]
  }, [player])

  if (loading) return <><Header /><main className="min-h-screen bg-background flex items-center justify-center py-32"><LoadingSpinner /></main></>
  if (error) return <><Header /><main className="min-h-screen bg-background flex items-center justify-center py-32"><ErrorState message={error} /></main></>
  if (!player) return <><Header /><main className="min-h-screen bg-background flex items-center justify-center py-32"><ErrorState message="Player not found" /></main></>

  const s = player.stats
  const m = player.metrics
  const ps = POS_STYLE[player.position] ?? POS_STYLE.MF

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: User },
    { key: 'stats' as const, label: 'Full Stats', icon: BarChart3 },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">

        {/* ═══════ HERO ═══════ */}
        <section className="relative border-b border-border/40 bg-gradient-to-br from-green-500/5 via-transparent to-cyan-500/5 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/players"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors mb-8 font-bold uppercase tracking-wide text-sm"
            >
              <ArrowLeft size={18} />
              Back to Players
            </Link>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              <PlayerPhoto
                playerName={player.name}
                size={140}
                className="border-4 border-green-500/20 shadow-2xl shadow-green-500/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl sm:text-5xl font-black text-foreground leading-tight tracking-tight">
                  {player.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${ps.bg} ${ps.text} border ${ps.border}`}>
                    {formatPosition(player.position)}
                  </span>
                  <div className="flex items-center gap-2">
                    <CountryFlag country={player.team} size={22} />
                    <span className="text-sm font-semibold text-muted-foreground">{player.team}</span>
                  </div>
                  {player.club && (
                    <span className="text-xs text-muted-foreground/60 border border-border/30 px-2 py-0.5 rounded">
                      {player.club}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/60">Age {player.age}</span>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <QuickStat icon={Trophy} label="Goals" value={s.goals} accent />
                  <QuickStat icon={Target} label="Assists" value={s.assists} />
                  <QuickStat icon={Zap} label="Games" value={s.games} />
                  <QuickStat icon={Clock} label="Minutes" value={s.minutes} />
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mt-8 border-b border-border/40 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CONTENT ═══════ */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">

              {/* Season Highlights — 4 big stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <HighlightCard
                  label="Goals"
                  value={s.goals}
                  sub={`${m.goalsPerGame.toFixed(2)} per game`}
                  color="green"
                />
                <HighlightCard
                  label="Assists"
                  value={s.assists}
                  sub={`${s.assistsP90.toFixed(2)} per 90`}
                  color="cyan"
                />
                <HighlightCard
                  label="xG"
                  value={s.xG.toFixed(1)}
                  sub={s.goals > s.xG ? `+${(s.goals - s.xG).toFixed(1)} overperformance` : `${(s.xG - s.goals).toFixed(1)} underperformance`}
                  color="emerald"
                />
                <HighlightCard
                  label="Contributions"
                  value={m.goalContributions}
                  sub={`${s.goals}G + ${s.assists}A`}
                  color="amber"
                />
              </div>

              {/* Player Attributes + Per-90 Metrics side-by-side */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Player Attributes */}
                <div className="sports-card p-6">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Player Attributes
                  </h3>
                  <div className="space-y-5">
                    {traits.map((t) => (
                      <div key={t.label} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <t.icon size={16} className="text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t.label}</span>
                            <span className="text-sm font-black text-foreground tabular-nums">{t.raw}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                              style={{ width: `${t.value}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-90 Metrics */}
                <div className="sports-card p-6">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    Per 90 Minutes
                  </h3>
                  <div className="space-y-4">
                    <Per90Row label="Goals" value={s.goalsP90} maxRef={1.5} color="green" />
                    <Per90Row label="Assists" value={s.assistsP90} maxRef={1.0} color="cyan" />
                    <Per90Row label="xG" value={s.xGP90} maxRef={1.0} color="emerald" />
                    <Per90Row label="xA" value={s.xAP90} maxRef={0.8} color="teal" />
                  </div>

                  {/* Efficiency callout */}
                  <div className="mt-6 pt-5 border-t border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shot Efficiency</span>
                      <span className="text-lg font-black text-foreground tabular-nums">{m.shotEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
                        style={{ width: `${Math.min(m.shotEfficiency, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {s.shotsOnTarget} on target from {s.shots} shots
                    </p>
                  </div>
                </div>
              </div>

              {/* Contribution Breakdown */}
              <div className="sports-card p-6">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
                  <Zap className="h-4 w-4 text-green-400" />
                  Output Breakdown
                </h3>
                <div className="space-y-4">
                  <ContribBar label="Goals" value={s.goals} max={8} color="from-green-500 to-emerald-400" textColor="text-green-400" />
                  <ContribBar label="Assists" value={s.assists} max={4} color="from-cyan-500 to-blue-400" textColor="text-cyan-400" />
                  <ContribBar label="Expected Goals (xG)" value={Number(s.xG.toFixed(2))} max={8} color="from-emerald-500 to-teal-400" textColor="text-emerald-400" />
                  <ContribBar label="Expected Assists (xA)" value={Number(s.xA.toFixed(2))} max={4} color="from-teal-500 to-cyan-400" textColor="text-teal-400" />
                </div>
              </div>
            </div>
          )}

          {/* ─── FULL STATS TAB ─── */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">

                {/* Attack */}
                <div className="sports-card overflow-hidden">
                  <div className="px-5 py-4 bg-green-500/5 border-b border-border/20">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-400" />
                      Attack
                    </h3>
                  </div>
                  <div className="divide-y divide-border/10">
                    <StatRow label="Goals" value={s.goals} highlight />
                    <StatRow label="Assists" value={s.assists} />
                    <StatRow label="Goal Contributions" value={m.goalContributions} highlight />
                    <StatRow label="Goals per Game" value={m.goalsPerGame.toFixed(2)} />
                    <StatRow label="Shots" value={s.shots} />
                    <StatRow label="Shots on Target" value={s.shotsOnTarget} />
                    <StatRow label="Shot Accuracy" value={`${m.shotEfficiency.toFixed(1)}%`} />
                    <StatRow label="xG" value={s.xG.toFixed(2)} />
                    <StatRow label="xA" value={s.xA.toFixed(2)} />
                  </div>
                </div>

                {/* Passing */}
                <div className="sports-card overflow-hidden">
                  <div className="px-5 py-4 bg-blue-500/5 border-b border-border/20">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Crosshair className="h-4 w-4 text-blue-400" />
                      Passing
                    </h3>
                  </div>
                  <div className="divide-y divide-border/10">
                    <StatRow label="Passes Completed" value={s.passesCompleted} />
                    <StatRow label="Passes Attempted" value={s.passesAttempted} />
                    <StatRow label="Pass Accuracy" value={`${s.passAccuracy.toFixed(1)}%`} highlight />
                    <StatRow label="Touches" value={s.touches} />
                  </div>
                </div>

                {/* Defensive */}
                <div className="sports-card overflow-hidden">
                  <div className="px-5 py-4 bg-indigo-500/5 border-b border-border/20">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-400" />
                      Defensive
                    </h3>
                  </div>
                  <div className="divide-y divide-border/10">
                    <StatRow label="Tackles" value={s.tackles} />
                    <StatRow label="Interceptions" value={s.interceptions} />
                    <StatRow label="Defensive Actions" value={s.tackles + s.interceptions} highlight />
                  </div>
                </div>

                {/* Discipline & Misc */}
                <div className="sports-card overflow-hidden">
                  <div className="px-5 py-4 bg-amber-500/5 border-b border-border/20">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-amber-400" />
                      Discipline &amp; Penalties
                    </h3>
                  </div>
                  <div className="divide-y divide-border/10">
                    <StatRow label="Yellow Cards" value={s.yellowCards} warn={s.yellowCards > 0} />
                    <StatRow label="Red Cards" value={s.redCards} danger={s.redCards > 0} />
                    <StatRow label="Penalties Scored" value={s.pensMade} />
                    <StatRow label="Penalties Attempted" value={s.pensAtt} />
                    {s.pensAtt > 0 && (
                      <StatRow label="Penalty Conversion" value={`${((s.pensMade / s.pensAtt) * 100).toFixed(0)}%`} highlight />
                    )}
                  </div>
                </div>
              </div>

              {/* Appearances */}
              <div className="sports-card overflow-hidden">
                <div className="px-5 py-4 bg-cyan-500/5 border-b border-border/20">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    Appearances
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/10">
                  <div className="p-5 text-center">
                    <p className="text-3xl font-black text-foreground tabular-nums">{s.games}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Games</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-3xl font-black text-foreground tabular-nums">{s.gamesStarted}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Started</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-3xl font-black text-foreground tabular-nums">{s.games - s.gamesStarted}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Sub Appearances</p>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-3xl font-black text-green-400 tabular-nums">{s.minutes}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Minutes</p>
                  </div>
                </div>
              </div>

              {/* Per 90 table */}
              <div className="sports-card overflow-hidden">
                <div className="px-5 py-4 bg-purple-500/5 border-b border-border/20">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    Per 90 Minutes
                  </h3>
                </div>
                <div className="divide-y divide-border/10">
                  <StatRow label="Goals / 90" value={s.goalsP90.toFixed(2)} />
                  <StatRow label="Assists / 90" value={s.assistsP90.toFixed(2)} />
                  <StatRow label="xG / 90" value={s.xGP90.toFixed(2)} />
                  <StatRow label="xA / 90" value={s.xAP90.toFixed(2)} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function QuickStat({ icon: Icon, label, value, accent = false }: {
  icon: React.ComponentType<{ className?: string; size?: number }>
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${accent ? 'text-green-400' : 'text-muted-foreground'}`} size={16} />
      <div>
        <p className={`text-2xl font-black tabular-nums ${accent ? 'text-green-400' : 'text-foreground'}`}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

/* ── Highlight Card ──────────────────────── */
const HL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  green:   { bg: 'from-green-500/10',   text: 'text-green-400',   border: 'border-green-500/20' },
  cyan:    { bg: 'from-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  emerald: { bg: 'from-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber:   { bg: 'from-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
}

function HighlightCard({ label, value, sub, color }: {
  label: string
  value: number | string
  sub: string
  color: string
}) {
  const c = HL_COLORS[color] ?? HL_COLORS.green
  return (
    <div className={`rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} to-transparent p-5`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-3xl font-black tabular-nums mt-1 ${c.text}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </div>
  )
}

/* ── Per-90 Row ──────────────────────── */
const P90_COLORS: Record<string, string> = {
  green: 'from-green-500 to-emerald-400',
  cyan:  'from-cyan-500 to-blue-400',
  emerald:'from-emerald-500 to-teal-400',
  teal:  'from-teal-500 to-cyan-400',
}

function Per90Row({ label, value, maxRef, color }: {
  label: string
  value: number
  maxRef: number
  color: string
}) {
  const pct = Math.min((value / maxRef) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-black text-foreground tabular-nums">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${P90_COLORS[color] ?? P90_COLORS.green} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ── Contribution Bar ──────────────── */
function ContribBar({ label, value, max, color, textColor }: {
  label: string
  value: number
  max: number
  color: string
  textColor: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
        <span className={`font-black tabular-nums ${textColor}`}>{value}</span>
      </div>
      <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ── Stat Row ──────────────────────── */
function StatRow({ label, value, highlight = false, warn = false, danger = false }: {
  label: string
  value: number | string
  highlight?: boolean
  warn?: boolean
  danger?: boolean
}) {
  let textClass = 'text-foreground'
  if (highlight) textClass = 'text-green-400'
  if (warn) textClass = 'text-yellow-400'
  if (danger) textClass = 'text-red-400'

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-black tabular-nums ${textClass}`}>{value}</span>
    </div>
  )
}
