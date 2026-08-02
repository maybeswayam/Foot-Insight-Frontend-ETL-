'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { apiClient } from '@/lib/api'
import { buildMatchAnalytics, inferFormation } from '@/lib/matchAnalytics'
import { getMatchInsight } from '@/lib/matchInsights'
import type { MatchDetail } from '@/lib/types'
import { ArrowLeft, MapPin, UserRound, Users } from 'lucide-react'

const MatchLineupPitch = dynamic(
  () => import('@/components/MatchLineupPitch').then((m) => m.MatchLineupPitch),
  { loading: () => <LoadingSpinner />, ssr: false },
)
const MatchStatCharts = dynamic(
  () => import('@/components/MatchStatCharts').then((m) => m.MatchStatCharts),
  { loading: () => <LoadingSpinner />, ssr: false },
)

const COMP_STYLE: Record<string, string> = {
  'FIFA World Cup': 'bg-gold/10 text-gold border-gold/25',
  'Premier League': 'bg-[#6500FF]/10 text-[#9B72FF] border-[#6500FF]/25',
  'La Liga': 'bg-redcard/10 text-[#F07060] border-redcard/25',
  Bundesliga: 'bg-pitch/10 text-pitch border-pitch/25',
  'Serie A': 'bg-[#0096DC]/10 text-[#4BB8E8] border-[#0096DC]/25',
  'Ligue 1': 'bg-[#0064DC]/10 text-[#5599EE] border-[#0064DC]/25',
}

interface MatchDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const [matchId, setMatchId] = useState('')
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'stats' | 'lineups'>('stats')

  useEffect(() => {
    params.then(({ id }) => setMatchId(id))
  }, [params])

  useEffect(() => {
    if (!matchId) return
    window.scrollTo(0, 0)
    setLoading(true)
    apiClient
      .getMatchDetail(matchId)
      .then(setMatch)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load match'))
      .finally(() => setLoading(false))
  }, [matchId])

  const analytics = useMemo(() => {
    if (!match) return null
    return buildMatchAnalytics(
      match.homeTeam,
      match.awayTeam,
      match.homeTeam.teamId,
      match.awayTeam.teamId,
      match.advancedStats
    )
  }, [match])

  const formations = useMemo(() => {
    if (!match?.lineup?.players?.length) return null
    const home = match.lineup.players.filter((p) => p.side === 'home' && p.isStarter)
    const away = match.lineup.players.filter((p) => p.side === 'away' && p.isStarter)
    return { home: inferFormation(home), away: inferFormation(away) }
  }, [match])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <LoadingSpinner />
        </main>
      </>
    )
  }

  if (error || !match || !analytics) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <ErrorState message={error || 'Match not found'} />
        </main>
      </>
    )
  }

  const insight = getMatchInsight(match)
  const h = match.homeTeam
  const a = match.awayTeam
  const hasLineup = Boolean(match.lineup?.players?.length)
  const resultLabel =
    match.stats.result === 'draw'
      ? 'Draw'
      : match.stats.result === 'home_win'
        ? `${h.teamId} win`
        : `${a.teamId} win`

  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink overflow-x-hidden">
        <section className="border-b border-line relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,200,83,0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(0,150,220,0.1), transparent 55%)',
            }}
          />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-display text-[120px] sm:text-[180px] leading-none text-surface-2 select-none pointer-events-none whitespace-nowrap">
            {h.goals}–{a.goals}
          </span>

          <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
            <Link
              href={
                match.competition === 'FIFA World Cup'
                  ? '/worldcup'
                  : match.competition === 'Premier League'
                    ? '/leagues/premier-league'
                    : match.competition === 'La Liga'
                      ? '/leagues/la-liga'
                      : match.competition === 'Bundesliga'
                        ? '/leagues/bundesliga'
                        : match.competition === 'Serie A'
                          ? '/leagues/serie-a'
                          : match.competition === 'Ligue 1'
                            ? '/leagues/ligue-1'
                            : '/'
              }
              className="inline-flex items-center gap-2 text-pitch hover:text-pitch-bright transition-colors mb-10 text-xs font-semibold tracking-[1.5px] uppercase"
            >
              <ArrowLeft size={14} />
              {match.competition === 'FIFA World Cup' ? 'Back to World Cup' : `Back to ${match.competition}`}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span
                className={`px-2.5 py-1 rounded-[2px] border text-[10px] font-bold tracking-[1px] uppercase ${
                  COMP_STYLE[match.competition] ?? 'bg-surface text-fog border-line'
                }`}
              >
                {match.competition}
              </span>
              <span className="px-2.5 py-1 rounded-[2px] border border-line text-[10px] font-bold tracking-[1px] uppercase text-faint">
                {match.season.replace('2022-2023', '2022-23')}
              </span>
              <span className="px-2.5 py-1 rounded-[2px] border border-pitch/30 bg-pitch/10 text-[10px] font-bold tracking-[1px] uppercase text-pitch">
                {insight.narrative}
              </span>
              {formations && (
                <>
                  <span className="px-2.5 py-1 rounded-[2px] border border-pitch/25 text-[10px] font-bold tracking-[1px] uppercase text-pitch">
                    {formations.home}
                  </span>
                  <span className="text-faint text-[10px]">vs</span>
                  <span className="px-2.5 py-1 rounded-[2px] border border-[#4BB8E8]/25 text-[10px] font-bold tracking-[1px] uppercase text-[#4BB8E8]">
                    {formations.away}
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
              <TeamHero
                name={h.teamId}
                href={h.id ? `/teams/${h.id}` : undefined}
                align="end"
                hoverClass="group-hover:text-pitch"
              />

              <div className="text-center px-2">
                <div className="font-display text-[clamp(52px,10vw,96px)] text-cream leading-none tracking-[2px]">
                  {h.goals}
                  <span className="text-faint mx-1">:</span>
                  {a.goals}
                </div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[2px] text-fog">
                  {resultLabel}
                </div>
                {match.advancedStats && (
                  <div className="mt-2 text-[10px] tabular-nums text-faint">
                    xG {match.advancedStats.homeXG.toFixed(2)}–{match.advancedStats.awayXG.toFixed(2)}
                  </div>
                )}
              </div>

              <TeamHero
                name={a.teamId}
                href={a.id ? `/teams/${a.id}` : undefined}
                align="start"
                hoverClass="group-hover:text-[#4BB8E8]"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fog">
              <span>
                {match.date}
                {match.time ? ` · ${match.time.slice(0, 5)}` : ''}
              </span>
              {match.venue && match.venue !== 'TBD' && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} className="text-faint" />
                  {match.venue}
                </span>
              )}
              {match.referee && match.referee !== 'Unknown' && (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={12} className="text-faint" />
                  {match.referee}
                </span>
              )}
              {hasLineup && (
                <span className="inline-flex items-center gap-1.5 text-pitch">
                  <Users size={12} />
                  Lineups
                </span>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-line max-w-3xl mx-auto">
              <Kpi label="Shot share" value={`${analytics.shotShareHome}–${analytics.shotShareAway}`} />
              <Kpi
                label="Conversion %"
                value={`${analytics.home.conversion.toFixed(0)}–${analytics.away.conversion.toFixed(0)}`}
              />
              <Kpi label="SoT" value={`${h.shotsOnTarget}–${a.shotsOnTarget}`} />
              <Kpi label="Corners" value={`${h.corners ?? 0}–${a.corners ?? 0}`} />
            </div>
          </div>
        </section>

        <div className="border-b border-line sticky top-[60px] z-30 bg-[rgba(10,10,10,0.92)] backdrop-blur-[16px]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
            {(
              [
                { key: 'stats' as const, label: 'Match lab' },
                { key: 'lineups' as const, label: 'Lineups & shape', disabled: !hasLineup },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                disabled={'disabled' in t && t.disabled}
                onClick={() => setTab(t.key)}
                className={`relative shrink-0 min-h-[44px] px-1 py-3 text-xs font-semibold tracking-[1.5px] uppercase transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  tab === t.key ? 'text-pitch' : 'text-fog hover:text-cream'
                }`}
              >
                {t.label}
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-pitch" />}
              </button>
            ))}
          </div>
        </div>

        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          {tab === 'stats' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-10">
                <div className="section-tag">Match lab</div>
                <h2 className="section-title mt-2">THE NUMBERS</h2>
                <p className="mt-3 max-w-3xl text-sm text-fog leading-relaxed">
                  {insight.narrative}
                  {insight.dominantSide
                    ? ` · ${insight.dominance}% control lean to ${
                        insight.dominantSide === 'home' ? h.teamId : a.teamId
                      }`
                    : ' · evenly contested on volume/accuracy'}
                  . Deciding factor: {insight.decidingFactor.replace(/_/g, ' ')}.
                </p>
              </div>

              <MatchStatCharts
                home={h}
                away={a}
                homeName={h.teamId}
                awayName={a.teamId}
                advanced={match.advancedStats}
              />
            </div>
          )}

          {tab === 'lineups' && hasLineup && match.lineup && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <div className="section-tag">Shape & personnel</div>
                <h2 className="section-title mt-2">LINEUPS</h2>
                <p className="mt-2 text-sm text-fog">
                  Inferred {formations?.home} vs {formations?.away}
                  {' · '}
                  {match.lineup.starterCount} starters · source {match.lineup.source}
                </p>
              </div>
              <MatchLineupPitch
                players={match.lineup.players}
                homeName={h.teamId}
                awayName={a.teamId}
              />
            </div>
          )}

          {tab === 'lineups' && !hasLineup && (
            <div className="border border-line-strong bg-ink-2 p-10 text-center">
              <Users className="mx-auto text-faint mb-3" size={28} />
              <p className="font-display text-xl text-cream tracking-[1px]">LINEUPS UNAVAILABLE</p>
              <p className="mt-2 text-sm text-fog max-w-md mx-auto">
                This match is not in the lineup archive yet (Ligue 1 coverage is still incomplete).
              </p>
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-2/90 px-3 py-3 text-center backdrop-blur-sm">
      <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{label}</div>
      <div className="mt-0.5 font-display text-xl text-cream tracking-[1px] tabular-nums">{value}</div>
    </div>
  )
}

function TeamHero({
  name,
  href,
  align,
  hoverClass,
}: {
  name: string
  href?: string
  align: 'start' | 'end'
  hoverClass: string
}) {
  const className = `flex flex-col items-center ${
    align === 'end' ? 'sm:items-end' : 'sm:items-start'
  } gap-3 group text-center ${align === 'end' ? 'sm:text-right' : 'sm:text-left'}`

  const inner = (
    <>
      <TeamLogo teamName={name} size={64} />
      <h1
        className={`font-display text-[clamp(22px,4vw,40px)] text-cream leading-[0.95] tracking-[1px] transition-colors ${hoverClass}`}
      >
        {name.toUpperCase()}
      </h1>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}
