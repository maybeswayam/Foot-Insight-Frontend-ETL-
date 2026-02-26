'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { apiClient } from '@/lib/api'
import type { SummaryData, Match } from '@/lib/types'

/* ─────────────── helpers ─────────────── */

/** Animate a counter from 0 → target */
function AnimatedNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

const LEAGUE_COLORS: Record<string, string> = {
  'Premier League': '#3b1f8f',
  'La Liga': '#ea580c',
  'Bundesliga': '#dc2626',
  'Serie A': '#2563eb',
  'Ligue 1': '#0ea5e9',
  'FIFA World Cup': '#d97706',
}

const LEAGUE_GRADIENT_FROM: Record<string, string> = {
  'Premier League': 'from-purple-600',
  'La Liga': 'from-orange-500',
  'Bundesliga': 'from-red-600',
  'Serie A': 'from-blue-600',
  'Ligue 1': 'from-cyan-500',
  'FIFA World Cup': 'from-amber-500',
}

const LEAGUE_SLUGS: Record<string, string> = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Bundesliga': 'bundesliga',
  'Serie A': 'serie-a',
  'Ligue 1': 'ligue-1',
}

/* ─────── Iconic / rivalry matches to feature ─────── */
const ICONIC_MATCH_IDS = [
  '1890', // WC Final: Argentina vs France
  '381',  // Man City 6-3 Man United
  '341',  // Liverpool 9-0 Bournemouth
  '556',  // Liverpool 7-0 Man United
  '1533', // El Clasico: Real Madrid 3-1 Barcelona
  '1706', // El Clasico: Barcelona 2-1 Real Madrid
  '88',   // Der Klassiker: Dortmund 0-4 Bayern
  '1108', // Derby della Madonnina: Milan 3-2 Inter
  '1828', // WC: England 6-2 IR Iran
  '715',  // PSG 7-1 Lille
]

const ICONIC_LABELS: Record<string, string> = {
  '1890': '🏆 World Cup Final',
  '381': '🔥 Manchester Derby',
  '341': '💥 Record PL Win',
  '556': '🔴 Historic Rivalry',
  '1533': '⚡ El Clásico',
  '1706': '⚡ El Clásico',
  '88': '🇩🇪 Der Klassiker',
  '1108': '🇮🇹 Derby della Madonnina',
  '1828': '🌍 World Cup Opener',
  '715': '🇫🇷 Ligue 1 Thriller',
}

/* Cool facts from 2022-23 season / 2022 World Cup data */
const COOL_FACTS = [
  {
    icon: '🏆',
    title: 'Argentina wins it all',
    text: 'Lionel Messi finally lifted the World Cup trophy at age 35, leading Argentina to their first title since 1986 in what many call the greatest final ever played.',
    color: 'from-sky-400 to-blue-600',
  },
  {
    icon: '⚡',
    title: "Mbappé's 8-goal blitz",
    text: 'Kylian Mbappé scored 8 goals in the 2022 World Cup — including a hat-trick in the final — the most goals by any player in the tournament.',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    icon: '🔴',
    title: 'Liverpool 9-0 Bournemouth',
    text: 'Liverpool equalled the biggest Premier League win in history, smashing Bournemouth 9-0 at Anfield on matchday 4 of the 2022-23 season.',
    color: 'from-red-500 to-red-700',
  },
  {
    icon: '🔵',
    title: 'Manchester Derby: 6-3',
    text: 'Erling Haaland scored a hat-trick as Manchester City obliterated Manchester United 6-3 at the Etihad — the biggest derby win in over a decade.',
    color: 'from-sky-500 to-blue-700',
  },
  {
    icon: '🇮🇹',
    title: "Napoli's 33-year wait ends",
    text: 'Napoli won Serie A for the first time since the Maradona era (1989-90), clinching the title in dominant fashion during the 2022-23 season.',
    color: 'from-cyan-400 to-blue-600',
  },
  {
    icon: '💀',
    title: 'Liverpool 7-0 Man United',
    text: "In one of the most humiliating results in the rivalry's history, Liverpool hammered Manchester United 7-0 at Anfield in March 2023.",
    color: 'from-red-600 to-rose-800',
  },
  {
    icon: '🇮🇹',
    title: '10-goal Serie A thriller',
    text: 'Atalanta demolished Salernitana 8-2 in a jaw-dropping Serie A match — 10 goals in a single game, the most in the 2022-23 season across all top leagues.',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    icon: '🌟',
    title: 'Messi: 7 goals + 3 assists',
    text: "Leo Messi scored 7 goals and provided 3 assists in Qatar — winning the Golden Ball as the tournament's best player and cementing his GOAT legacy.",
    color: 'from-amber-400 to-orange-600',
  },
]

/* ─────────────── page ─────────────── */

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [chartData, setChartData] = useState<
    { competition: string; goals: number; matches: number; avgGoals: number }[]
  >([])
  const [iconicMatches, setIconicMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryData, matchesData] = await Promise.all([
          apiClient.getSummary(),
          apiClient.getMatches(),
        ])

        setSummary(summaryData)
        setMatches(matchesData)

        // Chart data by competition
        const compStats: Record<string, { goals: number; count: number }> = {}
        matchesData.forEach((match) => {
          const c = match.competition
          if (!compStats[c]) compStats[c] = { goals: 0, count: 0 }
          compStats[c].goals += match.stats.totalGoals
          compStats[c].count += 1
        })

        setChartData(
          Object.entries(compStats)
            .map(([competition, s]) => ({
              competition: competition.replace('FIFA ', ''),
              goals: s.goals,
              matches: s.count,
              avgGoals: Math.round((s.goals / s.count) * 100) / 100,
            }))
            .sort((a, b) => b.goals - a.goals),
        )

        // Iconic matches
        const iconic = ICONIC_MATCH_IDS.map((id) =>
          matchesData.find((m) => m.matchId === id),
        ).filter(Boolean) as Match[]
        setIconicMatches(iconic)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  /* ── loading / error ── */
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

  /* ── derived stats ── */
  const totalGoals = matches.reduce((s, m) => s + m.stats.totalGoals, 0)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background overflow-x-hidden">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden border-b border-border/30">
          {/* layered gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/15 via-background to-emerald-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
          {/* subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Season badge */}
              <div className="inline-flex items-center gap-3 rounded-full border border-green-500/20 bg-green-500/5 backdrop-blur-sm px-5 py-2.5 shadow-lg shadow-green-500/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-bold text-green-400 uppercase tracking-[0.2em]">
                  2022-23 Season · Top 5 Leagues + World Cup
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">
                Foot
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500">
                  Insight
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Dive into{' '}
                <span className="text-green-400 font-semibold">1,890 matches</span>,{' '}
                <span className="text-green-400 font-semibold">680 players</span>, and{' '}
                <span className="text-green-400 font-semibold">6 competitions</span> from
                the 2022-23 season — including the 2022 FIFA World Cup in Qatar.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <Link
                  href="/worldcup"
                  className="group relative rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    🏆 World Cup 2022
                  </span>
                </Link>
                <Link
                  href="/matches"
                  className="rounded-xl border-2 border-green-500/30 bg-green-500/5 backdrop-blur-sm px-8 py-4 text-sm font-bold text-green-400 transition-all hover:border-green-500/50 hover:bg-green-500/10 hover:scale-105 active:scale-95"
                >
                  Browse All Matches
                </Link>
                <Link
                  href="/players"
                  className="rounded-xl border-2 border-border/40 bg-card/30 backdrop-blur-sm px-8 py-4 text-sm font-bold text-muted-foreground transition-all hover:border-green-500/30 hover:text-green-400 hover:scale-105 active:scale-95"
                >
                  Player Database
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ KPI CARDS ═══════════════ */}
        {summary && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {/* Total Matches */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 overflow-hidden hover:border-green-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10 text-green-400 text-lg">
                    ⚽
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Matches</p>
                </div>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  <AnimatedNumber value={summary.totalMatches} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">across 6 competitions</p>
              </div>

              {/* Total Goals */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 overflow-hidden hover:border-amber-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 text-lg">
                    🎯
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Goals Scored</p>
                </div>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                  <AnimatedNumber value={totalGoals} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.averageGoalsPerMatch.toFixed(2)} per match
                </p>
              </div>

              {/* Teams */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 overflow-hidden hover:border-blue-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 text-lg">
                    🏟️
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Teams</p>
                </div>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  <AnimatedNumber value={summary.totalTeams} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">clubs & national teams</p>
              </div>

              {/* Players */}
              <div className="group relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6 overflow-hidden hover:border-purple-500/30 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 text-lg">
                    👤
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Players</p>
                </div>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300">
                  <AnimatedNumber value={summary.totalPlayers} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  World Cup squads tracked
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ ICONIC MATCHES ═══════════════ */}
        {iconicMatches.length > 0 && (
          <section className="border-t border-border/30">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Iconic Matches
                </h2>
                <p className="text-muted-foreground">
                  The derbies, thrillers, and record-breakers that defined the 2022-23
                  season.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {iconicMatches.map((match) => {
                  const label = ICONIC_LABELS[match.matchId] || match.competition
                  const isHomeWin = match.stats.result === 'home_win'
                  const isAwayWin = match.stats.result === 'away_win'
                  const isDraw = match.stats.result === 'draw'

                  return (
                    <Link
                      key={match.matchId}
                      href={`/matches/${match.matchId}`}
                      className="group relative rounded-2xl border border-border/40 bg-card/80 overflow-hidden hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5 transition-all"
                    >
                      {/* top label strip */}
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-b border-border/20 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                          {label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {match.date}
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Home */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <TeamLogo teamName={match.homeTeam.teamId} size={28} />
                            <span
                              className={`font-bold text-sm truncate ${
                                isHomeWin
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {match.homeTeam.teamId}
                            </span>
                          </div>
                          <span
                            className={`text-xl font-black tabular-nums ${
                              isHomeWin ? 'text-green-400' : 'text-muted-foreground'
                            }`}
                          >
                            {match.homeTeam.goals}
                          </span>
                        </div>

                        {/* Away */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <TeamLogo teamName={match.awayTeam.teamId} size={28} />
                            <span
                              className={`font-bold text-sm truncate ${
                                isAwayWin
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {match.awayTeam.teamId}
                            </span>
                          </div>
                          <span
                            className={`text-xl font-black tabular-nums ${
                              isAwayWin ? 'text-green-400' : 'text-muted-foreground'
                            }`}
                          >
                            {match.awayTeam.goals}
                          </span>
                        </div>

                        {/* footer */}
                        <div className="pt-2 border-t border-border/10 flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              isDraw
                                ? 'bg-yellow-500/15 text-yellow-400'
                                : 'bg-green-500/15 text-green-400'
                            }`}
                          >
                            {match.stats.totalGoals} goals
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {match.competition}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="text-center pt-8">
                <Link
                  href="/matches"
                  className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-green-300 transition-colors uppercase tracking-wide text-sm group"
                >
                  Explore All 1,890 Matches
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ GOALS BY COMPETITION ═══════════════ */}
        {chartData.length > 0 && (
          <section className="border-t border-border/30 bg-card/30">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                  Goals by Competition
                </h2>
                <p className="text-muted-foreground">
                  Total goals scored across every league and tournament in the dataset.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-5">
                {/* Main bar chart */}
                <div className="lg:col-span-3 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm p-6">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={chartData} barCategoryGap="20%">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="competition"
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 15, 25, 0.95)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                        }}
                        labelStyle={{
                          color: '#fff',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                        formatter={(value: number) => [
                          `${value.toLocaleString()} goals`,
                          '',
                        ]}
                      />
                      <Bar dataKey="goals" radius={[10, 10, 0, 0]}>
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.competition}
                            fill={
                              LEAGUE_COLORS[entry.competition] ||
                              LEAGUE_COLORS['FIFA World Cup'] ||
                              '#22c55e'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Side stats */}
                <div className="lg:col-span-2 space-y-4">
                  {chartData.map((entry) => {
                    const color =
                      LEAGUE_COLORS[entry.competition] || '#22c55e'
                    return (
                      <div
                        key={entry.competition}
                        className="rounded-xl border border-border/40 bg-card/60 p-4 flex items-center justify-between gap-4 hover:border-green-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">
                              {entry.competition}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.matches} matches
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-foreground tabular-nums">
                            {entry.goals.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {entry.avgGoals} avg/match
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ COOL FACTS & RECORDS ═══════════════ */}
        <section className="border-t border-border/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Season Highlights & Records
              </h2>
              <p className="text-muted-foreground">
                The moments that made the 2022-23 season unforgettable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {COOL_FACTS.map((fact, i) => (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-border/40 bg-card/80 p-5 overflow-hidden hover:border-green-500/30 transition-all hover:-translate-y-1"
                >
                  {/* gradient accent top */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${fact.color}`}
                  />
                  <div className="space-y-3">
                    <span className="text-2xl">{fact.icon}</span>
                    <h3 className="text-base font-black text-foreground leading-tight">
                      {fact.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {fact.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ EXPLORE LEAGUES ═══════════════ */}
        <section className="border-t border-border/30 bg-card/20">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Explore League Tables
              </h2>
              <p className="text-muted-foreground">
                Full standings, results, and stats for every top European league.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Object.entries(LEAGUE_SLUGS).map(([name, slug]) => {
                const leagueChart = chartData.find(
                  (c) => c.competition === name,
                )
                return (
                  <Link
                    key={slug}
                    href={`/leagues/${slug}`}
                    className="group relative rounded-2xl border border-border/40 bg-card/80 p-6 overflow-hidden hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5 transition-all hover:-translate-y-1 text-center"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${LEAGUE_GRADIENT_FROM[name]} to-transparent`}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <LeagueLogo
                        league={
                          slug as
                            | 'premier-league'
                            | 'la-liga'
                            | 'bundesliga'
                            | 'serie-a'
                            | 'ligue-1'
                        }
                        size={48}
                      />
                      <div>
                        <h3 className="font-black text-foreground group-hover:text-green-400 transition-colors text-sm">
                          {name}
                        </h3>
                        {leagueChart && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {leagueChart.goals.toLocaleString()} goals ·{' '}
                            {leagueChart.matches} games
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* World Cup link */}
            <div className="mt-6 flex justify-center">
              <Link
                href="/worldcup"
                className="group rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-amber-600/5 backdrop-blur-sm px-8 py-5 flex items-center gap-4 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all hover:-translate-y-1"
              >
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="font-black text-foreground group-hover:text-amber-400 transition-colors text-base">
                    FIFA World Cup 2022
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    64 matches · Qatar · Argentina champions
                  </p>
                </div>
                <span className="text-amber-400/60 group-hover:text-amber-400 transition-colors ml-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ STAR PLAYERS ═══════════════ */}
        <section className="border-t border-border/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                World Cup Stars
              </h2>
              <p className="text-muted-foreground">
                The standout performers from Qatar 2022.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Kylian Mbappé',
                  team: 'France',
                  goals: 8,
                  assists: 2,
                  xG: 5.2,
                  title: '🥇 Golden Boot',
                  gradient: 'from-blue-600 to-blue-800',
                  accent: 'text-blue-400',
                  playerId: 378,
                },
                {
                  name: 'Lionel Messi',
                  team: 'Argentina',
                  goals: 7,
                  assists: 3,
                  xG: 6.6,
                  title: '🏆 Golden Ball',
                  gradient: 'from-sky-500 to-blue-700',
                  accent: 'text-sky-400',
                  playerId: 389,
                },
                {
                  name: 'Olivier Giroud',
                  team: 'France',
                  goals: 4,
                  assists: 0,
                  xG: 3.4,
                  title: "🇫🇷 France's All-Time Top Scorer",
                  gradient: 'from-blue-500 to-indigo-700',
                  accent: 'text-indigo-400',
                  playerId: 503,
                },
                {
                  name: 'Julián Álvarez',
                  team: 'Argentina',
                  goals: 4,
                  assists: 0,
                  xG: 2.6,
                  title: '🇦🇷 Young Gun',
                  gradient: 'from-sky-400 to-cyan-600',
                  accent: 'text-cyan-400',
                  playerId: 331,
                },
                {
                  name: 'Bukayo Saka',
                  team: 'England',
                  goals: 3,
                  assists: 0,
                  xG: 0.6,
                  title: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Clinical Finisher',
                  gradient: 'from-red-500 to-red-700',
                  accent: 'text-red-400',
                  playerId: 110,
                },
                {
                  name: 'Cody Gakpo',
                  team: 'Netherlands',
                  goals: 3,
                  assists: 0,
                  xG: 0.3,
                  title: '🇳🇱 Breakout Star',
                  gradient: 'from-orange-500 to-orange-700',
                  accent: 'text-orange-400',
                  playerId: 130,
                },
              ].map((player) => (
                <Link
                  key={player.name}
                  href={`/players/${player.playerId}`}
                  className="group relative rounded-2xl border border-border/40 bg-card/80 overflow-hidden hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/5 transition-all hover:-translate-y-1"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${player.gradient}`}
                  />
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-foreground text-lg group-hover:text-green-400 transition-colors">
                          {player.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {player.team}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-border/40 ${player.accent}`}
                      >
                        {player.title}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center rounded-xl bg-green-500/5 border border-green-500/10 py-2.5">
                        <p className="text-xl font-black text-green-400">
                          {player.goals}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Goals
                        </p>
                      </div>
                      <div className="text-center rounded-xl bg-blue-500/5 border border-blue-500/10 py-2.5">
                        <p className="text-xl font-black text-blue-400">
                          {player.assists}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          Assists
                        </p>
                      </div>
                      <div className="text-center rounded-xl bg-amber-500/5 border border-amber-500/10 py-2.5">
                        <p className="text-xl font-black text-amber-400">
                          {player.xG}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          xG
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center pt-8">
              <Link
                href="/players"
                className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-green-300 transition-colors uppercase tracking-wide text-sm group"
              >
                View Full Player Database
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="border-t border-border/30 bg-card/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Foot<span className="text-green-400">Insight</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  2022-23 Season Analytics · Built with Next.js
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/matches"
                  className="text-xs text-muted-foreground hover:text-green-400 transition-colors font-medium"
                >
                  Matches
                </Link>
                <Link
                  href="/players"
                  className="text-xs text-muted-foreground hover:text-green-400 transition-colors font-medium"
                >
                  Players
                </Link>
                <Link
                  href="/standings"
                  className="text-xs text-muted-foreground hover:text-green-400 transition-colors font-medium"
                >
                  Standings
                </Link>
                <Link
                  href="/worldcup"
                  className="text-xs text-muted-foreground hover:text-green-400 transition-colors font-medium"
                >
                  World Cup
                </Link>
                <Link
                  href="/accolades"
                  className="text-xs text-muted-foreground hover:text-green-400 transition-colors font-medium"
                >
                  Accolades
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
