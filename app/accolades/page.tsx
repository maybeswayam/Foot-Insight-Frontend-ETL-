'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type {
  AccoladesData,
  PlayerAwardEntry,
  TeamAwardEntry,
  LeagueAccolades,
  MatchHighlight,
} from '@/lib/types'
import {
  Trophy,
  Target,
  Footprints,
  Shield,
  Crosshair,
  Timer,
  Flame,
  Zap,
  Medal,
} from 'lucide-react'

type Tab = 'world-cup' | string // competition name for league tabs

const LEAGUE_SHORT: Record<string, string> = {
  'FIFA World Cup': 'World Cup',
  'Premier League': 'Premier League',
  'La Liga': 'La Liga',
  'Serie A': 'Serie A',
  Bundesliga: 'Bundesliga',
  'Ligue 1': 'Ligue 1',
}

const LEAGUE_EMOJI: Record<string, string> = {
  'FIFA World Cup': '🏆',
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸',
  'Serie A': '🇮🇹',
  Bundesliga: '🇩🇪',
  'Ligue 1': '🇫🇷',
}

const LEAGUE_SLUG: Record<string, 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1' | undefined> = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  Bundesliga: 'bundesliga',
  'Serie A': 'serie-a',
  'Ligue 1': 'ligue-1',
}

const PLAYER_AWARD_CONFIG = [
  {
    key: 'topScorers' as const,
    title: 'Golden Boot',
    subtitle: 'Top Goal Scorers',
    icon: Trophy,
    accentColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    key: 'topAssists' as const,
    title: 'Playmaker Award',
    subtitle: 'Most Assists',
    icon: Target,
    accentColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    key: 'topXG' as const,
    title: 'Expected Goals Leader',
    subtitle: 'Highest xG',
    icon: Flame,
    accentColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    key: 'topXA' as const,
    title: 'Creative Force',
    subtitle: 'Highest Expected Assists',
    icon: Zap,
    accentColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
  },
  {
    key: 'bestPassers' as const,
    title: 'Passing Master',
    subtitle: 'Best Pass Accuracy (50+ attempts)',
    icon: Crosshair,
    accentColor: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
  },
  {
    key: 'bestDefenders' as const,
    title: 'Defensive Wall',
    subtitle: 'Most Tackles + Interceptions',
    icon: Shield,
    accentColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'mostMinutes' as const,
    title: 'Iron Man',
    subtitle: 'Most Minutes Played',
    icon: Timer,
    accentColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
]

export default function AccoladesPage() {
  const [data, setData] = useState<AccoladesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('world-cup')

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

  const activeLeague = useMemo(() => {
    if (!data || activeTab === 'world-cup') return null
    return data.leagueAccolades.find((l) => l.competition === activeTab) ?? null
  }, [data, activeTab])

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

  if (error || !data)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="flex items-center justify-center py-32">
            <ErrorState message={error ?? 'No data'} />
          </div>
        </main>
      </>
    )

  const tabs: { value: Tab; label: string; emoji: string; slug?: 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1' }[] = [
    { value: 'world-cup', label: 'World Cup', emoji: '🏆' },
    ...data.leagueAccolades
      .filter((l) => l.competition !== 'FIFA World Cup')
      .map((l) => ({
        value: l.competition as Tab,
        label: LEAGUE_SHORT[l.competition] ?? l.competition,
        emoji: LEAGUE_EMOJI[l.competition] ?? '⚽',
        slug: LEAGUE_SLUG[l.competition],
      })),
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border/40 bg-gradient-to-br from-yellow-500/5 via-transparent to-green-500/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={36} className="text-yellow-400" />
              <h1 className="text-5xl font-black text-foreground">Accolades</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Season awards & records across 6 competitions · 2022–23
            </p>
          </div>
        </section>

        {/* Competition tabs */}
        <section className="border-b border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-1.5 ${
                    activeTab === t.value
                      ? 'bg-green-500 text-slate-900'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {t.slug ? (
                    <LeagueLogo league={t.slug} size={18} />
                  ) : (
                    <span>{t.emoji}</span>
                  )}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          {activeTab === 'world-cup' ? (
            <WorldCupAwards playerAwards={data.playerAwards} />
          ) : activeLeague ? (
            <LeagueAwards league={activeLeague} />
          ) : null}
        </div>
      </main>
    </>
  )
}

/* ══════════════════════════════════════════════
   World Cup Player Awards
   ══════════════════════════════════════════════ */

function WorldCupAwards({ playerAwards }: { playerAwards: AccoladesData['playerAwards'] }) {
  const previewColumns = [
    { title: 'Top scorers', entries: playerAwards.topScorers.slice(0, 3), accentColor: 'bg-green-500', key: 'topScorers' },
    { title: 'Top assists', entries: playerAwards.topAssists.slice(0, 3), accentColor: 'bg-cyan-500', key: 'topAssists' },
    { title: 'Top xG', entries: playerAwards.topXG.slice(0, 3), accentColor: 'bg-orange-500', key: 'topXG' },
  ]

  return (
    <div className="space-y-12 pt-10">
      {/* Compact Top-3 preview (FotMob-style) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {previewColumns.map((col) => (
          <div
            key={col.key}
            className="rounded-xl border border-border/40 bg-card overflow-hidden"
          >
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-sm font-black text-foreground">{col.title}</h3>
            </div>
            <div className="space-y-1 px-3 pb-2">
              {col.entries.map((p) => (
                <Link
                  key={p.playerId}
                  href={`/players/${p.playerId}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/30 transition-colors group"
                >
                  <PlayerPhoto
                    playerName={p.name}
                    size={36}
                    rounded
                    className="border border-border/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-green-400 transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <TeamLogo teamName={p.team} size={12} />
                      <span className="text-[11px] text-muted-foreground truncate">
                        {p.team}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${col.accentColor} text-white text-xs font-black w-9 h-9 rounded-full flex items-center justify-center tabular-nums shrink-0`}
                  >
                    {p.value}
                  </span>
                </Link>
              ))}
            </div>
            <div className="border-t border-border/20 px-5 py-3 text-center">
              <button
                onClick={() => {
                  const el = document.getElementById(`award-${col.key}`)
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                All
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hero winners row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLAYER_AWARD_CONFIG.slice(0, 3).map((cfg) => {
          const entries = playerAwards[cfg.key]
          const winner = entries[0]
          if (!winner) return null
          return (
            <div
              key={cfg.key}
              className={`rounded-xl border ${cfg.borderColor} ${cfg.bgColor} p-6 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <cfg.icon size={20} className={cfg.accentColor} />
                  <h3 className="text-lg font-black text-foreground">
                    {cfg.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {cfg.subtitle}
                  </p>
                </div>
                <Medal size={28} className={`${cfg.accentColor} opacity-20`} />
              </div>
              <div className="flex items-center gap-4 mt-5">
                <PlayerPhoto
                  playerName={winner.name}
                  size={56}
                  rounded
                  className="border-2 border-border/20"
                />
                <div>
                  <Link
                    href={`/players/${winner.playerId}`}
                    className={`font-black text-foreground hover:${cfg.accentColor} transition-colors`}
                  >
                    {winner.name}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TeamLogo teamName={winner.team} size={14} />
                    <span className="text-xs text-muted-foreground">
                      {winner.team}
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className={`text-3xl font-black tabular-nums ${cfg.accentColor}`}>
                    {winner.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    {winner.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* All award categories with full leaderboards */}
      {PLAYER_AWARD_CONFIG.map((cfg) => {
        const entries = playerAwards[cfg.key]
        if (!entries.length) return null
        return (
          <section key={cfg.key} id={`award-${cfg.key}`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-8 h-8 rounded-lg ${cfg.bgColor} flex items-center justify-center`}
              >
                <cfg.icon size={16} className={cfg.accentColor} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">
                  {cfg.title}
                </h2>
                <p className="text-xs text-muted-foreground">{cfg.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2">
              {entries.map((p, idx) => (
                <Link
                  key={p.playerId}
                  href={`/players/${p.playerId}`}
                  className="group flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5 transition-all"
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0
                        ? 'bg-yellow-500 text-yellow-950'
                        : idx === 1
                          ? 'bg-gray-300 text-gray-800'
                          : idx === 2
                            ? 'bg-orange-400 text-orange-950'
                            : 'bg-secondary/50 text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Photo */}
                  <PlayerPhoto
                    playerName={p.name}
                    size={40}
                    rounded
                    className="border border-border/20"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate group-hover:text-green-400 transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-400/80">
                        {formatPosition(p.position)}
                      </span>
                      <span className="text-muted-foreground text-[10px]">·</span>
                      <TeamLogo teamName={p.team} size={12} />
                      <span className="text-xs text-muted-foreground truncate">
                        {p.team}
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-black tabular-nums ${cfg.accentColor}`}>
                      {p.value}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                      {p.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════
   League Awards (Team-level)
   ══════════════════════════════════════════════ */

function LeagueAwards({ league }: { league: LeagueAccolades }) {
  const teamPreview = [
    { title: 'Top scorers', entries: league.topScoringTeams.slice(0, 3), accentColor: 'bg-green-500' },
    { title: 'Best defense', entries: league.bestDefense.slice(0, 3), accentColor: 'bg-blue-500' },
    { title: 'Most wins', entries: league.mostWins.slice(0, 3), accentColor: 'bg-yellow-500' },
  ]

  return (
    <div className="space-y-10 pt-10">
      {/* Compact Top-3 team preview (FotMob-style) */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {teamPreview.map((col) => (
          <div
            key={col.title}
            className="rounded-xl border border-border/40 bg-card overflow-hidden"
          >
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-sm font-black text-foreground">{col.title}</h3>
            </div>
            <div className="space-y-1 px-3 pb-2">
              {col.entries.map((t) => (
                <div
                  key={t.teamName}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                >
                  <TeamLogo teamName={t.teamName} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {t.teamName}
                    </p>
                  </div>
                  <span
                    className={`${col.accentColor} text-white text-xs font-black w-9 h-9 rounded-full flex items-center justify-center tabular-nums shrink-0`}
                  >
                    {t.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border/20 px-5 py-3 text-center">
              <span className="text-xs font-bold text-muted-foreground">All</span>
            </div>
          </div>
        ))}
      </div>

      {/* League summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryTile
          label="Matches"
          value={league.matchCount}
          icon={Footprints}
        />
        <SummaryTile label="Total Goals" value={league.totalGoals} icon={Flame} />
        <SummaryTile
          label="Avg Goals/Match"
          value={league.avgGoalsPerMatch}
          icon={Zap}
        />
      </div>

      {/* Match highlights */}
      <div className="grid gap-4 sm:grid-cols-2">
        {league.highestScoringMatch && (
          <MatchHighlightCard
            title="Highest Scoring Match"
            match={league.highestScoringMatch}
            accent="text-yellow-400"
          />
        )}
        {league.biggestWin && (
          <MatchHighlightCard
            title="Biggest Win"
            match={league.biggestWin}
            accent="text-orange-400"
          />
        )}
      </div>

      {/* Team leaderboards */}
      <div className="grid gap-8 lg:grid-cols-3">
        <TeamLeaderboard
          title="Most Goals Scored"
          subtitle="Best attack"
          entries={league.topScoringTeams}
          icon={Target}
          accentColor="text-green-400"
        />
        <TeamLeaderboard
          title="Best Defense"
          subtitle="Fewest goals conceded"
          entries={league.bestDefense}
          icon={Shield}
          accentColor="text-blue-400"
        />
        <TeamLeaderboard
          title="Most Wins"
          subtitle="Dominant force"
          entries={league.mostWins}
          icon={Trophy}
          accentColor="text-yellow-400"
        />
      </div>
    </div>
  )
}

/* ── Sub-components ───────────────────────────── */

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-green-400" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground tabular-nums">
          {value}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function MatchHighlightCard({
  title,
  match,
  accent,
}: {
  title: string
  match: MatchHighlight
  accent: string
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-6 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TeamLogo teamName={match.homeTeam} size={24} />
          <span className="text-sm font-bold text-foreground truncate">
            {match.homeTeam}
          </span>
        </div>
        <div className="flex items-center gap-2 px-4">
          <span className={`text-2xl font-black tabular-nums ${accent}`}>
            {match.homeGoals}
          </span>
          <span className="text-xs text-muted-foreground">–</span>
          <span className={`text-2xl font-black tabular-nums ${accent}`}>
            {match.awayGoals}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground truncate text-right">
            {match.awayTeam}
          </span>
          <TeamLogo teamName={match.awayTeam} size={24} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        {match.venue && <span>{match.venue}</span>}
      </div>
    </div>
  )
}

function TeamLeaderboard({
  title,
  subtitle,
  entries,
  icon: Icon,
  accentColor,
}: {
  title: string
  subtitle: string
  entries: TeamAwardEntry[]
  icon: React.ComponentType<{ size?: number; className?: string }>
  accentColor: string
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="p-5 border-b border-border/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary/40 flex items-center justify-center">
          <Icon size={16} className={accentColor} />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-border/20">
        {entries.map((e, idx) => (
          <div
            key={e.teamName}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                idx === 0
                  ? 'bg-yellow-500 text-yellow-950'
                  : idx === 1
                    ? 'bg-gray-300 text-gray-800'
                    : idx === 2
                      ? 'bg-orange-400 text-orange-950'
                      : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {idx + 1}
            </div>
            <TeamLogo teamName={e.teamName} size={20} />
            <span className="flex-1 text-sm font-semibold text-foreground truncate">
              {e.teamName}
            </span>
            <span className={`text-lg font-black tabular-nums ${accentColor}`}>
              {e.value}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest w-14 text-right">
              {e.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
