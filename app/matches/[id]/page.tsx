'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { apiClient } from '@/lib/api'
import { formatResult } from '@/lib/utils'
import { getMatchInsight, getFactorLabel, getFactorIcon } from '@/lib/matchInsights'
import type { MatchDetail } from '@/lib/types'
import { ArrowLeft, Info } from 'lucide-react'

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const [matchId, setMatchId] = useState<string>('')
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params
      setMatchId(id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!matchId) return

    const loadMatch = async () => {
      try {
        const data = await apiClient.getMatchDetail(matchId)
        setMatch(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load match')
      } finally {
        setLoading(false)
      }
    }

    loadMatch()
  }, [matchId])

  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner />
          </div>
        </main>
      </>
    )

  if (error)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="flex items-center justify-center py-32">
            <ErrorState message={error} />
          </div>
        </main>
      </>
    )

  if (!match)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="flex items-center justify-center py-32">
            <ErrorState message="Match not found" />
          </div>
        </main>
      </>
    )

  const hasAdvancedStats = match.advancedStats !== null
  const insight = getMatchInsight(match)
  const h = match.homeTeam
  const a = match.awayTeam

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* ── Hero / Score Header ── */}
        <section className="border-b border-border/40 bg-gradient-to-b from-secondary/30 to-background">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-400/80 transition-colors mb-8 font-bold uppercase tracking-wide text-xs"
            >
              <ArrowLeft size={16} />
              Back to Matches
            </Link>

            {/* Competition & meta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                  {match.competition}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${insight.narrativeColor}`}>
                  {insight.narrative}
                </span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{match.date} {match.time && `· ${match.time}`}</p>
                {match.venue && <p>{match.venue}</p>}
              </div>
            </div>

            {/* Score display */}
            <div className="flex items-center justify-between gap-4 sm:gap-8">
              {/* Home */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Home</p>
                <div className="flex items-center gap-3">
                  <TeamLogo teamName={h.teamId} size={48} />
                  <p className={`text-xl sm:text-2xl font-black truncate ${
                    match.stats.result === 'home_win' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {h.teamId}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-center">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className={`text-5xl sm:text-6xl font-black ${
                    match.stats.result === 'home_win' ? 'text-green-400' : 'text-muted-foreground'
                  }`}>
                    {h.goals}
                  </span>
                  <span className="text-2xl text-muted-foreground/40 font-light">–</span>
                  <span className={`text-5xl sm:text-6xl font-black ${
                    match.stats.result === 'away_win' ? 'text-green-400' : 'text-muted-foreground'
                  }`}>
                    {a.goals}
                  </span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  match.stats.result === 'draw'
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'bg-green-500/15 text-green-400'
                }`}>
                  {formatResult(match.stats.result)}
                </span>
              </div>

              {/* Away */}
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Away</p>
                <div className="flex items-center gap-3 justify-end">
                  <p className={`text-xl sm:text-2xl font-black truncate ${
                    match.stats.result === 'away_win' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {a.teamId}
                  </p>
                  <TeamLogo teamName={a.teamId} size={48} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Match Story (Insight Card) ── */}
        <section className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border/40 bg-card p-5 flex items-start gap-4">
            <div className="text-2xl mt-0.5">{getFactorIcon(insight.decidingFactor)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground mb-1">
                Match Decided By: {getFactorLabel(insight.decidingFactor)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.decidingFactor === 'efficiency' && (
                  <>The winning side converted chances at a higher rate despite having fewer or equal shots — clinical finishing was the difference.</>
                )}
                {insight.decidingFactor === 'volume' && (
                  <>The winning side created significantly more chances, dominating shot attempts and putting the opposition under constant pressure.</>
                )}
                {insight.decidingFactor === 'discipline' && (
                  <>The losing side picked up more bookings, which may have disrupted their rhythm and given the opposition an advantage.</>
                )}
                {insight.decidingFactor === 'balanced' && (
                  <>Both sides were evenly matched across key metrics — there was no single dominant factor in this result.</>
                )}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Dominance</p>
              <p className="text-2xl font-black text-green-400">{insight.dominance}<span className="text-sm text-muted-foreground">%</span></p>
            </div>
          </div>
        </section>

        {/* ── Base Stats — Head-to-Head Bars ── */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-wide">
            Match Statistics
          </h2>

          <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3 border-b border-border/20 bg-secondary/20">
              <div className="flex items-center gap-2">
                <TeamLogo teamName={h.teamId} size={20} />
                <span className="text-xs font-bold text-foreground truncate">{h.teamId}</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest px-4">vs</span>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs font-bold text-foreground truncate">{a.teamId}</span>
                <TeamLogo teamName={a.teamId} size={20} />
              </div>
            </div>

            {/* Stat rows */}
            <div className="divide-y divide-border/10">
              <HeadToHeadRow label="Goals" home={h.goals} away={a.goals} />
              <HeadToHeadRow label="Total Shots" home={h.shots} away={a.shots} />
              <HeadToHeadRow label="Shots on Target" home={h.shotsOnTarget} away={a.shotsOnTarget} />
              <HeadToHeadRow label="Shot Accuracy" home={h.shotAccuracy} away={a.shotAccuracy} suffix="%" />
              {(h.yellowCards !== undefined || a.yellowCards !== undefined) && (
                <HeadToHeadRow label="Yellow Cards" home={h.yellowCards ?? 0} away={a.yellowCards ?? 0} invertHighlight />
              )}
              {(h.redCards !== undefined || a.redCards !== undefined) && (h.redCards! + a.redCards!) > 0 && (
                <HeadToHeadRow label="Red Cards" home={h.redCards ?? 0} away={a.redCards ?? 0} invertHighlight />
              )}
            </div>
          </div>

          {/* Shot efficiency comparison */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <EfficiencyCard
              team={h.teamId}
              shots={h.shots}
              onTarget={h.shotsOnTarget}
              goals={h.goals}
              color="green"
            />
            <EfficiencyCard
              team={a.teamId}
              shots={a.shots}
              onTarget={a.shotsOnTarget}
              goals={a.goals}
              color="cyan"
            />
          </div>
        </section>

        {/* ── Advanced Stats (World Cup only) ── */}
        {hasAdvancedStats && match.advancedStats && (
          <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-black text-foreground uppercase tracking-wide">
                Advanced Match Analytics
              </h2>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                World Cup
              </span>
            </div>

            <div className="space-y-4">
              {/* xG Comparison */}
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground">Expected Goals (xG)</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">
                  Measures the quality of chances created. Higher xG means better scoring opportunities, regardless of the actual result.
                </p>

                <div className="space-y-3">
                  <XGBar
                    team={h.teamId}
                    xg={match.advancedStats.homeXG}
                    goals={h.goals}
                    color="green"
                    maxXG={Math.max(match.advancedStats.homeXG, match.advancedStats.awayXG, 2)}
                  />
                  <XGBar
                    team={a.teamId}
                    xg={match.advancedStats.awayXG}
                    goals={a.goals}
                    color="cyan"
                    maxXG={Math.max(match.advancedStats.homeXG, match.advancedStats.awayXG, 2)}
                  />
                </div>

                {/* xG verdict */}
                <div className="mt-4 pt-3 border-t border-border/20">
                  <p className="text-[11px] text-muted-foreground">
                    {(() => {
                      const xgDiff = match.advancedStats!.homeXG - match.advancedStats!.awayXG
                      const goalDiff = h.goals - a.goals
                      if (Math.abs(xgDiff) < 0.3) return 'Both sides created chances of similar quality.'
                      const xgWinner = xgDiff > 0 ? h.teamId : a.teamId
                      const actualWinner = goalDiff > 0 ? h.teamId : goalDiff < 0 ? a.teamId : null
                      if (xgWinner === actualWinner) return `${xgWinner} deserved the win based on chance quality.`
                      if (!actualWinner) return `${xgWinner} created better chances but couldn't find a winner.`
                      return `${xgWinner} created better chances but ${actualWinner} was more clinical.`
                    })()}
                  </p>
                </div>
              </div>

              {/* Possession */}
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-1">Ball Possession</h3>
                <p className="text-[11px] text-muted-foreground mb-4">
                  Share of time each team controlled the ball. Higher possession doesn't always mean dominance — it depends on what's done with it.
                </p>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-green-400 w-14 text-right tabular-nums">
                    {match.advancedStats.homePossession}%
                  </span>
                  <div className="flex-1 flex h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 rounded-l-full"
                      style={{ width: `${match.advancedStats.homePossession}%` }}
                    />
                    <div
                      className="bg-cyan-500 rounded-r-full"
                      style={{ width: `${match.advancedStats.awayPossession}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-cyan-400 w-14 tabular-nums">
                    {match.advancedStats.awayPossession}%
                  </span>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>{h.teamId}</span>
                  <span>{a.teamId}</span>
                </div>
              </div>

              {/* Pass Accuracy */}
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-1">Pass Accuracy</h3>
                <p className="text-[11px] text-muted-foreground mb-4">
                  Percentage of successful passes. Higher accuracy indicates better ball retention and composure under pressure.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <PassAccuracyRing
                    team={h.teamId}
                    accuracy={match.advancedStats.homePassAccuracy}
                    color="green"
                  />
                  <PassAccuracyRing
                    team={a.teamId}
                    accuracy={match.advancedStats.awayPassAccuracy}
                    color="cyan"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* No Advanced Stats — intentional messaging */}
        {!hasAdvancedStats && (
          <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border/30 bg-secondary/10 p-6 flex items-start gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2.5 flex-shrink-0">
                <Info size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Advanced Analytics</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Advanced match analytics — including Expected Goals (xG), possession, and pass accuracy — are available for FIFA World Cup matches only.
                  League matches include base statistics such as shots, accuracy, and cards.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Referee info if present */}
        {match.referee && (
          <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="text-xs text-muted-foreground text-center">
              Referee: {match.referee}
            </div>
          </section>
        )}
      </main>
    </>
  )
}

/* ────────────────────── Sub-components ────────────────────── */

/** Head-to-head stat row with opposing fill bars */
function HeadToHeadRow({
  label,
  home,
  away,
  suffix = '',
  invertHighlight = false,
}: {
  label: string
  home: number
  away: number
  suffix?: string
  invertHighlight?: boolean
}) {
  const total = home + away || 1
  const homeRatio = (home / total) * 100
  // For cards, lower is better
  const homeWins = invertHighlight ? home < away : home > away
  const awayWins = invertHighlight ? away < home : away > home
  const tied = home === away

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-3 group hover:bg-secondary/10 transition-colors">
      {/* Home value + bar */}
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold tabular-nums w-12 ${
          homeWins && !tied ? 'text-green-400' : 'text-muted-foreground'
        }`}>
          {home}{suffix}
        </span>
        <div className="flex-1 flex justify-end">
          <div className="h-2 rounded-full bg-secondary/30 w-full overflow-hidden flex justify-end">
            <div
              className={`h-full rounded-full ${homeWins && !tied ? 'bg-green-500' : 'bg-green-500/30'}`}
              style={{ width: `${homeRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Label */}
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 text-center w-28">
        {label}
      </span>

      {/* Away value + bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-secondary/30 w-full overflow-hidden">
            <div
              className={`h-full rounded-full ${awayWins && !tied ? 'bg-cyan-500' : 'bg-cyan-500/30'}`}
              style={{ width: `${100 - homeRatio}%` }}
            />
          </div>
        </div>
        <span className={`text-sm font-bold tabular-nums w-12 text-right ${
          awayWins && !tied ? 'text-cyan-400' : 'text-muted-foreground'
        }`}>
          {away}{suffix}
        </span>
      </div>
    </div>
  )
}

/** Shot efficiency funnel: shots → on target → goals */
function EfficiencyCard({
  team,
  shots,
  onTarget,
  goals,
  color,
}: {
  team: string
  shots: number
  onTarget: number
  goals: number
  color: 'green' | 'cyan'
}) {
  const onTargetPct = shots ? Math.round((onTarget / shots) * 100) : 0
  const conversionPct = onTarget ? Math.round((goals / onTarget) * 100) : 0
  const accent = color === 'green' ? 'text-green-400' : 'text-cyan-400'
  const bg = color === 'green' ? 'bg-green-500' : 'bg-cyan-500'

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TeamLogo teamName={team} size={18} />
        <span className="text-xs font-bold text-foreground truncate">{team}</span>
      </div>
      <div className="space-y-2">
        <FunnelRow label="Shots" value={shots} pct={100} bg={bg} accent={accent} />
        <FunnelRow label="On Target" value={onTarget} pct={onTargetPct} bg={bg} accent={accent} />
        <FunnelRow label="Goals" value={goals} pct={shots ? Math.round((goals / shots) * 100) : 0} bg={bg} accent={accent} />
      </div>
      <div className="mt-3 pt-3 border-t border-border/20 flex justify-between text-[10px] text-muted-foreground">
        <span>Accuracy: {onTargetPct}%</span>
        <span>Conversion: {conversionPct}%</span>
      </div>
    </div>
  )
}

function FunnelRow({
  label,
  value,
  pct,
  bg,
  accent,
}: {
  label: string
  value: number
  pct: number
  bg: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-16 text-right">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary/30 overflow-hidden">
        <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums w-6 ${accent}`}>{value}</span>
    </div>
  )
}

/** xG bar with actual goals overlay marker */
function XGBar({
  team,
  xg,
  goals,
  color,
  maxXG,
}: {
  team: string
  xg: number
  goals: number
  color: 'green' | 'cyan'
  maxXG: number
}) {
  const accent = color === 'green' ? 'text-green-400' : 'text-cyan-400'
  const bg = color === 'green' ? 'bg-green-500' : 'bg-cyan-500'
  const bgFaded = color === 'green' ? 'bg-green-500/25' : 'bg-cyan-500/25'
  const scale = maxXG > 0 ? maxXG * 1.3 : 4
  const xgPct = Math.min((xg / scale) * 100, 100)
  const goalPct = Math.min((goals / scale) * 100, 100)
  const overperformed = goals > xg

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-28 sm:w-36 min-w-0">
        <TeamLogo teamName={team} size={18} />
        <span className="text-xs font-bold text-foreground truncate">{team}</span>
      </div>
      <div className="flex-1 relative h-5">
        {/* xG bar background */}
        <div className={`absolute inset-y-0 left-0 rounded-full ${bgFaded}`} style={{ width: `${xgPct}%` }} />
        {/* Goal marker */}
        {goals > 0 && (
          <div
            className={`absolute top-0 bottom-0 w-0.5 ${bg}`}
            style={{ left: `${goalPct}%` }}
            title={`Actual goals: ${goals}`}
          />
        )}
        {/* xG value */}
        <div className="absolute inset-0 flex items-center pl-2">
          <span className={`text-[10px] font-bold ${accent}`}>{xg.toFixed(2)} xG</span>
        </div>
      </div>
      <div className="text-right w-16 flex-shrink-0">
        <span className={`text-sm font-black ${accent}`}>{goals}</span>
        <span className="text-[10px] text-muted-foreground ml-0.5">goals</span>
        {overperformed && <p className="text-[9px] text-green-400">▲ Over</p>}
        {!overperformed && goals < xg && <p className="text-[9px] text-red-400">▼ Under</p>}
      </div>
    </div>
  )
}

/** Pass accuracy display with circular indicator */
function PassAccuracyRing({
  team,
  accuracy,
  color,
}: {
  team: string
  accuracy: number
  color: 'green' | 'cyan'
}) {
  const accent = color === 'green' ? 'text-green-400' : 'text-cyan-400'
  const stroke = color === 'green' ? '#22c55e' : '#06b6d4'
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (accuracy / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative">
        <svg width="88" height="88" className="-rotate-90">
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-secondary/30"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-black ${accent}`}>{accuracy}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <TeamLogo teamName={team} size={16} />
        <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{team}</span>
      </div>
    </div>
  )
}
