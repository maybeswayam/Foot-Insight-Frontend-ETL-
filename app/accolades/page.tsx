'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import { CountryFlag } from '@/components/CountryFlag'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type {
  AccoladesData,
  PlayerAwardEntry,
  MatchHighlight,
  PlayerAwards,
} from '@/lib/types'
import {
  Trophy,
  Target,
  Shield,
  Crosshair,
  Timer,
  Flame,
  Zap,
} from 'lucide-react'

const LEAGUE_SLUG: Record<string, 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1' | undefined> = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  Bundesliga: 'bundesliga',
  'Serie A': 'serie-a',
  'Ligue 1': 'ligue-1',
}

const COMPETITION_ORDER = [
  'FIFA World Cup',
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
]

const MEDAL = ['bg-gold text-black', 'bg-[#C0C0C0] text-black', 'bg-[#CD7F32] text-black']

interface AwardCfg {
  key: keyof PlayerAwards
  title: string
  subtitle: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  tone: string
}

const PLAYER_AWARD_CONFIG: AwardCfg[] = [
  { key: 'topScorers',    title: 'Golden Boot',           subtitle: 'Top Goal Scorers',                    icon: Trophy,    tone: 'text-gold' },
  { key: 'topAssists',    title: 'Playmaker Award',       subtitle: 'Most Assists',                        icon: Target,    tone: 'text-[#4BB8E8]' },
  { key: 'topXG',         title: 'Expected Goals Leader', subtitle: 'Highest xG',                          icon: Flame,     tone: 'text-pitch' },
  { key: 'topXA',         title: 'Creative Force',        subtitle: 'Highest Expected Assists',            icon: Zap,       tone: 'text-[#9B72FF]' },
  { key: 'bestPassers',   title: 'Passing Master',        subtitle: 'Best Pass Accuracy (50+ attempts)',   icon: Crosshair, tone: 'text-[#5599EE]' },
  { key: 'bestDefenders', title: 'Defensive Wall',        subtitle: 'Most Tackles + Interceptions',        icon: Shield,    tone: 'text-[#F07060]' },
  { key: 'mostMinutes',   title: 'Iron Man',              subtitle: 'Most Minutes Played',                 icon: Timer,     tone: 'text-cream' },
]

export default function AccoladesPage() {
  const [data, setData] = useState<AccoladesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('FIFA World Cup')

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiClient.getAccolades()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accolades')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tabs = useMemo(() => {
    if (!data) return []
    const present = new Set(data.leagueAccolades.map((l) => l.competition))
    return COMPETITION_ORDER.filter((c) => present.has(c) || c === 'FIFA World Cup')
  }, [data])

  const leagueData = useMemo(() => {
    if (!data) return null
    return data.leagueAccolades.find((l) => l.competition === activeTab) ?? null
  }, [data, activeTab])

  const playerAwards: PlayerAwards | null = useMemo(() => {
    if (!data) return null
    if (activeTab === 'FIFA World Cup') return data.playerAwards
    return leagueData?.playerAwards ?? null
  }, [data, activeTab, leagueData])

  const isWorldCup = activeTab === 'FIFA World Cup'

  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <LoadingSpinner />
        </main>
      </>
    )

  if (error || !data)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <ErrorState message={error ?? 'No data'} />
        </main>
      </>
    )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink overflow-x-hidden">
        {/* ═══════ HERO ═══════ */}
        <section className="border-b border-line relative overflow-hidden">
          <span className="absolute -bottom-10 right-0 font-display text-[160px] sm:text-[220px] leading-none text-surface-2 select-none pointer-events-none">
            2022–23
          </span>
          <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-16">
            <div className="section-tag">Season Awards & Records</div>
            <h1 className="font-display text-[clamp(48px,6vw,84px)] tracking-[1px] leading-[0.9] text-cream">
              THE <span className="text-gold">ACCOLADES</span>
            </h1>
            <p className="font-editorial italic text-base text-fog mt-3">
              The best outputs from every competition — player by player
            </p>
          </div>
        </section>

        {/* ═══════ COMPETITION TABS ═══════ */}
        <section className="border-b border-line bg-ink-2 sticky top-[60px] z-40">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
              {tabs.map((comp) => {
                const slug = LEAGUE_SLUG[comp]
                const active = activeTab === comp
                return (
                  <button
                    key={comp}
                    onClick={() => setActiveTab(comp)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 border text-[11px] font-semibold tracking-[1.5px] uppercase transition-colors rounded-[2px] ${
                      active
                        ? 'bg-pitch text-black border-pitch'
                        : 'border-line-strong text-fog hover:text-cream bg-ink'
                    }`}
                  >
                    {slug ? <LeagueLogo league={slug} size={16} /> : <span>🏆</span>}
                    {comp === 'FIFA World Cup' ? 'World Cup' : comp}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 pb-20">
          {playerAwards && (
            <>
              {/* ═══════ AWARD WINNERS — HERO ROW ═══════ */}
              <section className="py-12">
                <div className="flex items-end justify-between gap-6 mb-8 border-b border-line pb-5">
                  <div>
                    <div className="section-tag">{isWorldCup ? 'World Cup 2022 · Qatar' : `${activeTab} · 2022–23`}</div>
                    <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[1px] leading-none text-cream">
                      THE WINNERS
                    </h2>
                  </div>
                </div>

                <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-line border border-line">
                  {PLAYER_AWARD_CONFIG.slice(0, 3).map((cfg) => {
                    const winner = playerAwards[cfg.key][0]
                    if (!winner) return null
                    return (
                      <div key={`${activeTab}-${cfg.key}`} className="bg-surface p-6 relative overflow-hidden">
                        <div className="flex items-start justify-between mb-5">
                          <div>
                            <cfg.icon size={16} className={`${cfg.tone} mb-2`} />
                            <h3 className="font-display text-xl tracking-[1px] text-cream leading-none">
                              {cfg.title.toUpperCase()}
                            </h3>
                            <p className="text-[10px] text-faint uppercase tracking-[1.5px] mt-1">{cfg.subtitle}</p>
                          </div>
                          <span className={`font-display text-5xl leading-none ${cfg.tone}`}>
                            {winner.value}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 pt-4 border-t border-line">
                          <Link href={`/players/${winner.playerId}`} className="h-14 w-14 shrink-0 overflow-hidden rounded-[2px] border-2 border-line-strong bg-surface-2 block">
                            <PlayerPhoto key={`${activeTab}-${winner.playerId}`} playerName={winner.name} size={52} />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              href={`/players/${winner.playerId}`}
                              className="font-display text-lg tracking-[0.5px] text-cream hover:text-pitch transition-colors leading-tight block truncate"
                            >
                              {winner.name.toUpperCase()}
                            </Link>
                            <Link
                              href={`/teams/${winner.teamId}`}
                              className="flex items-center gap-1.5 text-[11px] text-faint hover:text-pitch transition-colors mt-0.5"
                            >
                              <TeamBadge team={winner.team} teamId={winner.teamId} isWorldCup={isWorldCup} />
                              {winner.team}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* ═══════ FULL LEADERBOARDS ═══════ */}
              <section>
                <div className="flex items-end justify-between gap-6 mb-8 border-b border-line pb-5">
                  <div>
                    <div className="section-tag">Leaderboards</div>
                    <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[1px] leading-none text-cream">
                      EVERY CATEGORY · TOP 10
                    </h2>
                  </div>
                </div>

                <div className="grid gap-px lg:grid-cols-2 bg-line border border-line">
                  {PLAYER_AWARD_CONFIG.map((cfg) => {
                    const entries = playerAwards[cfg.key]
                    if (!entries.length) return null
                    return (
                      <div key={cfg.key} className="bg-surface">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
                          <div className="w-8 h-8 rounded-[2px] bg-surface-2 border border-line-strong flex items-center justify-center shrink-0">
                            <cfg.icon size={14} className={cfg.tone} />
                          </div>
                          <div>
                            <h3 className="font-display text-base tracking-[1px] text-cream leading-none">
                              {cfg.title.toUpperCase()}
                            </h3>
                            <p className="text-[9px] text-faint uppercase tracking-[1.5px] mt-0.5">{cfg.subtitle}</p>
                          </div>
                        </div>
                        <div className="divide-y divide-line">
                          {entries.map((p, idx) => (
                            <AwardRow
                              key={`${activeTab}-${cfg.key}-${p.playerId}`}
                              entry={p}
                              rank={idx}
                              tone={cfg.tone}
                              isWorldCup={isWorldCup}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            </>
          )}

          {/* ═══════ COMPETITION RECORDS ═══════ */}
          {leagueData && (
            <section className="pt-16">
              <div className="flex items-end justify-between gap-6 mb-8 border-b border-line pb-5">
                <div>
                  <div className="section-tag">Competition Records</div>
                  <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[1px] leading-none text-cream">
                    {isWorldCup ? 'TOURNAMENT NUMBERS' : 'SEASON NUMBERS'}
                  </h2>
                </div>
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-3 gap-px bg-line border border-line mb-px">
                <SummaryCell label="Matches" value={leagueData.matchCount} />
                <SummaryCell label="Total Goals" value={leagueData.totalGoals} tone="pitch" />
                <SummaryCell label="Avg Goals / Match" value={leagueData.avgGoalsPerMatch} tone="gold" />
              </div>

              {/* Match highlights */}
              <div className="grid gap-px sm:grid-cols-2 bg-line border border-line">
                {leagueData.highestScoringMatch && (
                  <MatchHighlightCard
                    title="Highest Scoring Match"
                    match={leagueData.highestScoringMatch}
                    isWorldCup={isWorldCup}
                  />
                )}
                {leagueData.biggestWin && (
                  <MatchHighlightCard
                    title="Biggest Win"
                    match={leagueData.biggestWin}
                    isWorldCup={isWorldCup}
                  />
                )}
              </div>
            </section>
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}

/* ══════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════ */

/** Flag for national teams, crest for clubs */
function TeamBadge({ team, teamId, isWorldCup }: { team: string; teamId: string; isWorldCup: boolean }) {
  if (isWorldCup) return <CountryFlag country={team} size={14} />
  return <TeamLogo teamName={team} size={14} />
}

function AwardRow({
  entry,
  rank,
  tone,
  isWorldCup,
}: {
  entry: PlayerAwardEntry
  rank: number
  tone: string
  isWorldCup: boolean
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2 transition-colors">
      <span
        className={`w-6 h-6 rounded-[2px] flex items-center justify-center text-[11px] font-bold shrink-0 ${
          rank < 3 ? MEDAL[rank] : 'bg-surface-3 text-fog'
        }`}
      >
        {rank + 1}
      </span>

      <Link href={`/players/${entry.playerId}`} className="h-9 w-9 shrink-0 overflow-hidden rounded-[2px] border border-line-strong bg-surface-2 block">
        <PlayerPhoto playerName={entry.name} size={34} />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/players/${entry.playerId}`}
          className="text-[13px] font-medium text-cream hover:text-pitch transition-colors block truncate"
        >
          {entry.name}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[1px] text-pitch/70">
            {formatPosition(entry.position)}
          </span>
          <span className="text-faint text-[9px]">·</span>
          <Link
            href={`/teams/${entry.teamId}`}
            className="flex items-center gap-1 text-[10px] text-faint hover:text-pitch transition-colors truncate"
          >
            <TeamBadge team={entry.team} teamId={entry.teamId} isWorldCup={isWorldCup} />
            {entry.team}
          </Link>
        </div>
      </div>

      <div className="text-right shrink-0">
        <span className={`font-display text-2xl leading-none ${tone}`}>{entry.value}</span>
        <p className="text-[8px] text-faint uppercase tracking-[1px] mt-0.5">{entry.label}</p>
      </div>
    </div>
  )
}

function SummaryCell({ label, value, tone }: { label: string; value: number; tone?: 'pitch' | 'gold' }) {
  return (
    <div className="bg-surface px-5 py-6 text-center">
      <div className={`font-display text-4xl leading-none ${tone === 'pitch' ? 'text-pitch' : tone === 'gold' ? 'text-gold' : 'text-cream'}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-[9px] font-semibold uppercase tracking-[1.5px] text-faint mt-1.5">{label}</div>
    </div>
  )
}

function MatchHighlightCard({
  title,
  match,
  isWorldCup,
}: {
  title: string
  match: MatchHighlight
  isWorldCup: boolean
}) {
  return (
    <div className="bg-surface p-6">
      <h3 className="text-[10px] font-semibold tracking-[2px] uppercase text-pitch mb-5">
        {title}
      </h3>
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/teams/${match.homeTeamId}`}
          className="flex-1 flex items-center gap-2 min-w-0 group"
        >
          {isWorldCup ? (
            <CountryFlag country={match.homeTeam} size={20} />
          ) : (
            <TeamLogo teamName={match.homeTeam} size={20} />
          )}
          <span className="text-[13px] font-medium text-cream truncate group-hover:text-pitch transition-colors">
            {match.homeTeam}
          </span>
        </Link>

        <Link
          href={`/matches/${match.matchId}`}
          className="font-display text-3xl leading-none text-cream px-4 mx-1 border-x border-line-strong hover:text-pitch transition-colors shrink-0"
        >
          {match.homeGoals} – {match.awayGoals}
        </Link>

        <Link
          href={`/teams/${match.awayTeamId}`}
          className="flex-1 flex items-center justify-end gap-2 min-w-0 group"
        >
          <span className="text-[13px] font-medium text-cream truncate text-right group-hover:text-pitch transition-colors">
            {match.awayTeam}
          </span>
          {isWorldCup ? (
            <CountryFlag country={match.awayTeam} size={20} />
          ) : (
            <TeamLogo teamName={match.awayTeam} size={20} />
          )}
        </Link>
      </div>
      <div className="flex items-center justify-between text-[10px] text-faint mt-4">
        <span>
          {new Date(match.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
        {match.venue && <span className="truncate ml-3">{match.venue}</span>}
      </div>
    </div>
  )
}
