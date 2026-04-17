'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { CountryFlag } from '@/components/CountryFlag'
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

const LEAGUE_GRADIENT_FROM: Record<string, string> = {
  'Premier League': 'from-purple-600',
  'La Liga': 'from-orange-500',
  'Bundesliga': 'from-red-600',
  'Serie A': 'from-blue-600',
  'Ligue 1': 'from-cyan-500',
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

/* ─────── Stars of the ERA ─────── */
const STARS_OF_ERA = [
  {
    playerId: 389,
    name: 'Lionel Messi',
    nickname: 'La Pulga',
    country: '🇦🇷',
    nationality: 'Argentina',
    position: 'Forward',
    clubs: 'Barcelona · PSG · Inter Miami',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    accent: 'text-sky-400',
    borderAccent: 'border-sky-500/30 hover:border-sky-400/50',
    signature: '8× Ballon d\'Or',
    stats: [
      { label: 'Career Goals', value: '838+' },
      { label: 'Career Assists', value: '374+' },
      { label: 'Ballon d\'Or', value: '8' },
      { label: 'Champions League', value: '4' },
    ],
    fact: 'Most goals in a calendar year — 91 in 2012. 672 goals for Barcelona alone. World Cup winner 2022.',
  },
  {
    playerId: 135,
    name: 'Cristiano Ronaldo',
    nickname: 'CR7',
    country: '🇵🇹',
    nationality: 'Portugal',
    position: 'Forward',
    clubs: 'Man United · Real Madrid · Juventus',
    gradient: 'from-red-500 via-red-600 to-rose-800',
    accent: 'text-red-400',
    borderAccent: 'border-red-500/30 hover:border-red-400/50',
    signature: '5× Ballon d\'Or',
    stats: [
      { label: 'Career Goals', value: '900+' },
      { label: 'Intl Goals', value: '130+' },
      { label: 'Champions League', value: '5' },
      { label: 'UCL Goals', value: '140' },
    ],
    fact: 'All-time top international scorer. Most Champions League goals in history. Scored in 5 different World Cups.',
  },
  {
    playerId: 483,
    name: 'Neymar Jr.',
    nickname: 'O Jogo Bonito',
    country: '🇧🇷',
    nationality: 'Brazil',
    position: 'Forward',
    clubs: 'Santos · Barcelona · PSG',
    gradient: 'from-yellow-400 via-green-500 to-green-700',
    accent: 'text-yellow-400',
    borderAccent: 'border-yellow-500/30 hover:border-yellow-400/50',
    signature: 'The best dribbler of our generation',
    stats: [
      { label: 'Career Goals', value: '439+' },
      { label: 'Career Assists', value: '278+' },
      { label: 'Brazil Goals', value: '79' },
      { label: 'Trophies', value: '30+' },
    ],
    fact: 'Part of the legendary MSN trio at Barcelona (2014-17). Olympic Gold medalist. 2nd highest scorer in Brazil history.',
  },
  {
    playerId: 547,
    name: 'Robert Lewandowski',
    nickname: 'Lewy',
    country: '🇵🇱',
    nationality: 'Poland',
    position: 'Forward',
    clubs: 'Dortmund · Bayern Munich · Barcelona',
    gradient: 'from-red-600 via-red-500 to-yellow-500',
    accent: 'text-red-400',
    borderAccent: 'border-red-500/30 hover:border-red-400/50',
    signature: 'FIFA Best Men\'s Player',
    stats: [
      { label: 'Career Goals', value: '655+' },
      { label: 'Bayern Goals', value: '344' },
      { label: 'Bundesliga Titles', value: '10' },
      { label: 'UCL Goals', value: '100+' },
    ],
    fact: 'Scored 41 Bundesliga goals in a single season (2020-21), surpassing Gerd Müller\'s 49-year-old record. FIFA Best Men\'s Player 2020 & 2021.',
  },
  {
    playerId: 397,
    name: 'Luis Suárez',
    nickname: 'El Pistolero',
    country: '🇺🇾',
    nationality: 'Uruguay',
    position: 'Forward',
    clubs: 'Ajax · Liverpool · Barcelona · Atlético',
    gradient: 'from-sky-400 via-sky-500 to-sky-700',
    accent: 'text-sky-400',
    borderAccent: 'border-sky-500/30 hover:border-sky-400/50',
    signature: 'European Golden Shoe',
    stats: [
      { label: 'Career Goals', value: '540+' },
      { label: 'Barcelona Goals', value: '198' },
      { label: 'Liverpool Goals', value: '82' },
      { label: 'La Liga Titles', value: '1' },
    ],
    fact: 'Part of the MSN trio scoring 364 goals in 3 seasons. Won the PL Golden Boot at Liverpool with 31 goals in 2013-14.',
  },
  {
    playerId: null,
    name: 'Andrés Iniesta',
    nickname: 'Don Andrés',
    country: '🇪🇸',
    nationality: 'Spain',
    position: 'Midfielder',
    clubs: 'Barcelona · Vissel Kobe',
    gradient: 'from-red-500 via-yellow-500 to-red-600',
    accent: 'text-yellow-400',
    borderAccent: 'border-yellow-500/30 hover:border-yellow-400/50',
    signature: 'World Cup Final Goal',
    stats: [
      { label: 'Barcelona Apps', value: '674' },
      { label: 'Champions League', value: '4' },
      { label: 'La Liga Titles', value: '9' },
      { label: 'Spain Caps', value: '131' },
    ],
    fact: 'Scored Spain\'s winning goal in the 2010 World Cup Final. Named Best Player at Euro 2012. Tiki-taka personified.',
  },
]

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
  const [leagueStats, setLeagueStats] = useState<
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

        // League stats
        const compStats: Record<string, { goals: number; count: number }> = {}
        matchesData.forEach((match) => {
          const c = match.competition
          if (!compStats[c]) compStats[c] = { goals: 0, count: 0 }
          compStats[c].goals += match.stats.totalGoals
          compStats[c].count += 1
        })

        setLeagueStats(
          Object.entries(compStats)
            .map(([competition, s]) => ({
              competition,
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
        <section className="relative overflow-hidden border-b border-border/30 min-h-[700px]">
          {/* Football field background pattern */}
          <div className="absolute inset-0 bg-background" />
          {/* Center circle and field lines - visible enough but still subtle */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 700">
            {/* Center circle */}
            <circle cx="500" cy="350" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Center spot */}
            <circle cx="500" cy="350" r="6" fill="currentColor" />
            {/* Halfway line */}
            <line x1="500" y1="0" x2="500" y2="700" stroke="currentColor" strokeWidth="1.5" />
            {/* Field outline */}
            <rect x="50" y="30" width="900" height="640" fill="none" stroke="currentColor" strokeWidth="2" />
            {/* Left penalty area */}
            <rect x="50" y="130" width="180" height="440" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Left goal area */}
            <rect x="50" y="240" width="90" height="220" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Right penalty area */}
            <rect x="770" y="130" width="180" height="440" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Right goal area */}
            <rect x="860" y="240" width="90" height="220" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
              {/* LEFT: Hero Content */}
              <div className="space-y-5">
                {/* Season badge */}
                <div className="space-y-2">
                  <div className="inline-flex items-center border border-green-500/70 px-3 py-1.5 rounded-sm bg-transparent">
                    <span className="text-[11px] font-bold text-green-500 uppercase tracking-widest">
                      Football Analytics
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 uppercase tracking-wider">
                    <div className="w-6 h-px bg-muted-foreground/30" />
                    <span>2022–23 Season · Top 5 Leagues · World Cup</span>
                  </div>
                </div>

                {/* Main heading */}
                <h1 className="text-6xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
                  <div>Foot</div>
                  <div className="text-[#00FF00]">Insights</div>
                </h1>
                
                {/* Subtitle */}
                <p className="text-sm text-muted-foreground/70 italic font-normal">
                  Where every number tells a story
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
                  Dive into <span className="text-foreground font-semibold">1,890 matches</span>, <span className="text-foreground font-semibold">680 players</span>, and <span className="text-foreground font-semibold">6 competitions</span> from the 2022-23 season — including the 2022 FIFA World Cup in Qatar.
                </p>

                {/* CTA buttons */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href="/worldcup"
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-black px-5 py-2.5 text-xs font-bold rounded-sm transition-colors"
                  >
                    ⚽ World Cup 2022
                  </Link>
                  <Link
                    href="/matches"
                    className="inline-flex items-center justify-center border border-muted-foreground/30 hover:border-muted-foreground/50 bg-transparent text-foreground hover:text-foreground px-5 py-2.5 text-xs font-semibold rounded-sm transition-all"
                  >
                    Browse All Matches
                  </Link>
                  <Link
                    href="/players"
                    className="inline-flex items-center justify-center border border-muted-foreground/20 hover:border-muted-foreground/40 bg-transparent text-muted-foreground hover:text-foreground px-5 py-2.5 text-xs font-semibold rounded-sm transition-all"
                  >
                    Player Database
                  </Link>
                </div>
              </div>

              {/* RIGHT: Season At A Glance Panel */}
              {summary && (
                <div className="hidden lg:block">
                  <div className="border border-muted-foreground/30 bg-card/50 backdrop-blur-sm rounded-lg p-8 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-muted-foreground/20">
                      <h3 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Season At A Glance
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[10px] font-semibold text-green-500">Live Data</span>
                      </div>
                    </div>

                    {/* Stats Grid with borders */}
                    <div className="border border-muted-foreground/20 rounded-sm">
                      <div className="grid grid-cols-2 gap-0">
                        {/* Matches */}
                        <div className="border-r border-b border-muted-foreground/20 p-4 space-y-1.5">
                          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                            Matches
                          </p>
                          <p className="text-3xl font-black text-foreground">
                            <AnimatedNumber value={summary.totalMatches} />
                          </p>
                          <p className="text-[8px] text-muted-foreground/50">
                            across 6 competitions
                          </p>
                        </div>

                        {/* Goals Scored */}
                        <div className="border-b border-muted-foreground/20 p-4 space-y-1.5">
                          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                            Goals Scored
                          </p>
                          <p className="text-3xl font-black text-green-500">
                            <AnimatedNumber value={totalGoals} />
                          </p>
                          <p className="text-[8px] text-muted-foreground/50">
                            {summary.averageGoalsPerMatch.toFixed(2)} per match
                          </p>
                        </div>

                        {/* Teams */}
                        <div className="border-r border-muted-foreground/20 p-4 space-y-1.5">
                          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                            Teams
                          </p>
                          <p className="text-3xl font-black text-yellow-500">
                            <AnimatedNumber value={summary.totalTeams} />
                          </p>
                          <p className="text-[8px] text-muted-foreground/50">
                            clubs & national teams
                          </p>
                        </div>

                        {/* Players */}
                        <div className="p-4 space-y-1.5">
                          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-semibold">
                            Players
                          </p>
                          <p className="text-3xl font-black text-foreground">
                            <AnimatedNumber value={summary.totalPlayers} />
                          </p>
                          <p className="text-[8px] text-muted-foreground/50">
                            World Cup squads
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Featured Match */}
                    {iconicMatches[0] && (
                      <div className="border border-muted-foreground/20 rounded-sm p-4 space-y-3">
                        <div className="flex items-center gap-2 pb-3 border-b border-muted-foreground/20">
                          <span className="text-xs">⭐</span>
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                            World Cup Final · Dec 18, 2022
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-muted-foreground/80 mb-2">
                              AR {iconicMatches[0].homeTeam.teamId}
                            </div>
                          </div>
                          <div className="text-4xl font-black text-foreground">
                            {iconicMatches[0].homeTeam.goals}
                          </div>
                          <div className="px-2 text-muted-foreground/60 font-bold">-</div>
                          <div className="text-4xl font-black text-foreground">
                            {iconicMatches[0].awayTeam.goals}
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-xs font-semibold text-muted-foreground/80">
                              {iconicMatches[0].awayTeam.teamId} FR
                            </div>
                          </div>
                        </div>
                        <p className="text-[8px] text-muted-foreground/50 text-center pt-2">
                          Argentina won on penalties · Lusail Stadium, Qatar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

        {/* ═══════════════ STARS OF THE ERA ═══════════════ */}
        <section className="border-t border-border/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-2 mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                Stars of the ERA
              </h2>
              <p className="text-muted-foreground">
                The legends who defined modern football — jaw-dropping career stats.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STARS_OF_ERA.map((star) => {
                const CardContent = (
                  <>
                    {/* gradient accent top */}
                    <div
                      className={`h-2 bg-gradient-to-r ${star.gradient}`}
                    />

                    <div className="p-5 space-y-4">
                      {/* Header with photo */}
                      <div className="flex items-start gap-4">
                        <PlayerPhoto
                          playerName={star.name}
                          size={72}
                          rounded
                          className="border-2 border-border/30 shrink-0 shadow-lg"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="text-lg font-black text-foreground group-hover:text-green-400 transition-colors leading-tight">
                            {star.name}
                          </h3>
                          <p className="text-xs text-muted-foreground italic">
                            &quot;{star.nickname}&quot; · {star.position}
                          </p>
                          <div className="flex items-center gap-2">
                            <CountryFlag country={star.nationality} size={20} />
                            <span className="text-xs text-muted-foreground">{star.nationality}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground tracking-wide">
                            {star.clubs}
                          </p>
                        </div>
                      </div>

                      {/* Signature badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-border/40 ${star.accent}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {star.signature}
                        </span>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {star.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="text-center rounded-xl bg-white/[0.03] border border-border/20 py-2.5"
                          >
                            <p className={`text-lg font-black ${star.accent}`}>
                              {stat.value}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Fun fact */}
                      <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                        💡 {star.fact}
                      </p>
                    </div>
                  </>
                )

                return star.playerId ? (
                  <Link
                    key={star.name}
                    href={`/players/${star.playerId}`}
                    className={`group relative rounded-2xl border ${star.borderAccent} bg-card/80 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer`}
                  >
                    {CardContent}
                  </Link>
                ) : (
                  <div
                    key={star.name}
                    className={`group relative rounded-2xl border ${star.borderAccent} bg-card/80 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg`}
                  >
                    {CardContent}
                  </div>
                )
              })}
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
                const leagueChart = leagueStats.find(
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

        {/* ═══════════════ SEASON HIGHLIGHTS ═══════════════ */}
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
