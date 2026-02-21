'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Trophy, Target, Calendar, Users, TrendingUp, MapPin,
  Shield, Star, ChevronRight, Zap, BarChart3, Home, Plane,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import { TeamLogo } from '@/components/TeamLogo'

/* ────────── Types ────────── */

export interface LeagueMatchDisplay {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  venue: string
  totalGoals: number
  result: 'home_win' | 'away_win' | 'draw'
}

export interface LeagueTeamStats {
  name: string
  goalsFor: number
  goalsAgainst: number
  wins: number
  draws: number
  losses: number
  shots: number
  shotsOnTarget: number
  yellowCards: number
  redCards: number
}

export interface LeagueStats {
  totalGoals: number
  totalMatches: number
  avgGoals: number
  totalTeams: number
  totalYellowCards: number
  totalRedCards: number
  totalShots: number
  homeWins: number
  awayWins: number
  draws: number
  season: string
}

export interface LeagueTableRow {
  position: number
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ('W' | 'D' | 'L')[]
}

interface Props {
  slug: string
  competition: string
  table: LeagueTableRow[]
  matches: LeagueMatchDisplay[]
  teamStats: LeagueTeamStats[]
  stats: LeagueStats
}

/* ────────── League Theme Config ────────── */

interface LeagueTheme {
  primary: string        // main accent color class (text)
  primaryBg: string      // bg for badges/highlights
  primaryBorder: string  // border accent
  gradient: string       // hero gradient
  secondaryAccent: string
  logo: string           // league logo emoji or symbol
  tagline: string
  country: string
}

const LEAGUE_THEMES: Record<string, LeagueTheme> = {
  'premier-league': {
    primary: 'text-purple-400',
    primaryBg: 'bg-purple-500/20',
    primaryBorder: 'border-purple-500/40',
    gradient: 'from-purple-600/20 via-purple-500/5 to-background',
    secondaryAccent: 'text-cyan-400',
    logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    tagline: 'The most competitive league in the world',
    country: 'England',
  },
  'la-liga': {
    primary: 'text-orange-400',
    primaryBg: 'bg-orange-500/20',
    primaryBorder: 'border-orange-500/40',
    gradient: 'from-orange-600/20 via-red-500/5 to-background',
    secondaryAccent: 'text-red-400',
    logo: '🇪🇸',
    tagline: 'Home of tiki-taka and El Clásico',
    country: 'Spain',
  },
  'bundesliga': {
    primary: 'text-red-400',
    primaryBg: 'bg-red-500/20',
    primaryBorder: 'border-red-500/40',
    gradient: 'from-red-600/20 via-red-500/5 to-background',
    secondaryAccent: 'text-yellow-400',
    logo: '🇩🇪',
    tagline: 'Highest attendance & fastest league in Europe',
    country: 'Germany',
  },
  'serie-a': {
    primary: 'text-blue-400',
    primaryBg: 'bg-blue-500/20',
    primaryBorder: 'border-blue-500/40',
    gradient: 'from-blue-600/20 via-green-500/5 to-background',
    secondaryAccent: 'text-green-400',
    logo: '🇮🇹',
    tagline: 'The tactical masterclass of Italian football',
    country: 'Italy',
  },
  'ligue-1': {
    primary: 'text-sky-400',
    primaryBg: 'bg-sky-500/20',
    primaryBorder: 'border-sky-500/40',
    gradient: 'from-sky-600/20 via-blue-500/5 to-background',
    secondaryAccent: 'text-blue-300',
    logo: '🇫🇷',
    tagline: 'Le Championnat — Flair, pace and skill',
    country: 'France',
  },
}

/* ────────── Zone logic for table coloring ────────── */

function getZoneInfo(position: number, totalTeams: number, slug: string) {
  // Champions League: top 4 (top 3 for Bundesliga/Ligue 1 since 18/20 teams)
  const clSpots = slug === 'bundesliga' ? 4 : 4
  // Europa League
  const elSpot = clSpots + 1
  // Conference League  
  const confSpot = elSpot + 1
  // Relegation
  const relStart = totalTeams - 2

  if (position <= clSpots) return { zone: 'cl', color: 'bg-blue-500/20', border: 'border-l-blue-500', label: 'Champions League' }
  if (position === elSpot) return { zone: 'el', color: 'bg-orange-500/10', border: 'border-l-orange-500', label: 'Europa League' }
  if (position === confSpot) return { zone: 'conf', color: 'bg-green-500/10', border: 'border-l-green-500', label: 'Conference League' }
  if (position >= relStart) return { zone: 'rel', color: 'bg-red-500/10', border: 'border-l-red-500', label: 'Relegation' }
  return { zone: 'mid', color: '', border: 'border-l-transparent', label: '' }
}

/* ────────── Component ────────── */

export function LeaguePageClient({ slug, competition, table, matches, teamStats, stats }: Props) {
  const theme = LEAGUE_THEMES[slug] ?? LEAGUE_THEMES['premier-league']

  const topScoringTeams = [...teamStats].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 5)
  const bestDefense = [...teamStats].sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 5)
  const highScoringMatches = [...matches].sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 6)
  const recentMatches = [...matches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  // Champion
  const champion = table[0]

  // Home/away win %
  const homeWinPct = stats.totalMatches > 0 ? ((stats.homeWins / stats.totalMatches) * 100).toFixed(1) : '0'
  const awayWinPct = stats.totalMatches > 0 ? ((stats.awayWins / stats.totalMatches) * 100).toFixed(1) : '0'
  const drawPct = stats.totalMatches > 0 ? ((stats.draws / stats.totalMatches) * 100).toFixed(1) : '0'

  return (
    <main className="min-h-screen bg-background">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            {/* Left: League info */}
            <div className="text-center lg:text-left space-y-4 flex-1">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="text-5xl">{theme.logo}</span>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.primary}`}>
                    {stats.season} Season
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black text-foreground">{competition}</h1>
                </div>
              </div>
              <p className="text-base text-muted-foreground max-w-lg">{theme.tagline}</p>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                {[
                  { v: stats.totalMatches, l: 'Matches' },
                  { v: stats.totalGoals, l: 'Goals' },
                  { v: stats.totalTeams, l: 'Teams' },
                  { v: stats.avgGoals.toFixed(2), l: 'Avg/Game' },
                ].map(s => (
                  <div key={s.l} className={`${theme.primaryBg} rounded-lg px-3 py-2 text-center`}>
                    <p className={`text-lg font-black ${theme.primary}`}>{s.v}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Champion card */}
            {champion && (
              <div className={`sports-card ${theme.primaryBorder} border-2 p-6 text-center space-y-3 w-64`}>
                <Trophy className={`h-8 w-8 mx-auto ${theme.primary}`} />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Champions</p>
                <div className="flex justify-center">
                  <TeamLogo teamName={champion.teamId} size={56} />
                </div>
                <p className="text-xl font-black text-foreground">{champion.teamId}</p>
                <div className="flex justify-center gap-4 text-xs">
                  <span className={`font-bold ${theme.primary}`}>{champion.points} pts</span>
                  <span className="text-muted-foreground">{champion.won}W {champion.drawn}D {champion.lost}L</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {champion.goalsFor} GF · {champion.goalsAgainst} GA · {champion.goalDifference > 0 ? '+' : ''}{champion.goalDifference} GD
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ═══════════ SEASON STATS ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { value: stats.totalGoals, label: 'Goals', icon: Target, color: theme.primary },
            { value: stats.totalMatches, label: 'Matches', icon: Calendar, color: 'text-blue-400' },
            { value: stats.totalTeams, label: 'Teams', icon: Users, color: 'text-purple-400' },
            { value: stats.avgGoals.toFixed(2), label: 'Goals/Game', icon: TrendingUp, color: 'text-yellow-400' },
            { value: stats.totalShots, label: 'Shots', icon: Zap, color: 'text-orange-400' },
            { value: stats.totalYellowCards, label: 'Yellow Cards', icon: Shield, color: 'text-amber-400' },
            { value: stats.totalRedCards, label: 'Red Cards', icon: Shield, color: 'text-red-400' },
            { value: `${homeWinPct}%`, label: 'Home Win %', icon: Home, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="sports-card p-4 text-center space-y-1.5">
              <s.icon className={`h-4 w-4 mx-auto ${s.color} opacity-60`} />
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Result distribution bar */}
        <div className="mt-6 sports-card p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Result Distribution</p>
          <div className="flex rounded-full overflow-hidden h-5">
            <div className="bg-green-500/70 flex items-center justify-center" style={{ width: `${homeWinPct}%` }}>
              <span className="text-[9px] font-bold text-white">{homeWinPct}%</span>
            </div>
            <div className="bg-zinc-500/50 flex items-center justify-center" style={{ width: `${drawPct}%` }}>
              <span className="text-[9px] font-bold text-white">{drawPct}%</span>
            </div>
            <div className="bg-blue-500/70 flex items-center justify-center" style={{ width: `${awayWinPct}%` }}>
              <span className="text-[9px] font-bold text-white">{awayWinPct}%</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Home className="h-3 w-3 text-green-400" /> Home Wins ({stats.homeWins})</span>
            <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-zinc-400" /> Draws ({stats.draws})</span>
            <span className="flex items-center gap-1"><Plane className="h-3 w-3 text-blue-400" /> Away Wins ({stats.awayWins})</span>
          </div>
        </div>
      </section>


      {/* ═══════════ LEAGUE TABLE ═══════════ */}
      <section className={`border-y border-border/40`}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className={`h-6 w-6 ${theme.primary}`} />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">League Table</h2>
          </div>

          <div className="sports-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-secondary/30">
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Club</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PL</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">W</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">D</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">L</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GF</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GA</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">GD</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pts</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => {
                    const zone = getZoneInfo(row.position, table.length, slug)
                    return (
                      <tr key={row.teamId} className={`border-b border-border/10 hover:bg-secondary/20 transition-colors border-l-2 ${zone.border}`}>
                        <td className="text-center px-2 py-2.5">
                          <span className={`text-xs font-black ${row.position === 1 ? theme.primary : 'text-muted-foreground'}`}>
                            {row.position}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <TeamLogo teamName={row.teamId} size={24} />
                            <span className="font-bold text-foreground text-xs sm:text-sm">{row.teamId}</span>
                            {row.position === 1 && <Trophy className={`h-3.5 w-3.5 ${theme.primary} hidden sm:block`} />}
                          </div>
                        </td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground text-xs">{row.played}</td>
                        <td className="text-center px-2 py-2.5 font-bold text-foreground text-xs">{row.won}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground text-xs">{row.drawn}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground text-xs">{row.lost}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground text-xs hidden sm:table-cell">{row.goalsFor}</td>
                        <td className="text-center px-2 py-2.5 text-muted-foreground text-xs hidden sm:table-cell">{row.goalsAgainst}</td>
                        <td className="text-center px-2 py-2.5 text-xs">
                          <span className={`font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                          </span>
                        </td>
                        <td className="text-center px-2 py-2.5">
                          <span className="text-base font-black text-foreground">{row.points}</span>
                        </td>
                        <td className="text-center px-2 py-2.5 hidden md:table-cell">
                          <div className="flex gap-0.5 justify-center">
                            {row.form.map((r, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center ${
                                  r === 'W' ? 'bg-green-500/20 text-green-400' :
                                  r === 'D' ? 'bg-zinc-500/20 text-zinc-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Zone legend */}
            <div className="px-4 py-3 border-t border-border/20 bg-secondary/10 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" /> Champions League</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500/30" /> Europa League</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/30" /> Conference League</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/30" /> Relegation</span>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════ TOP SCORING TEAMS ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Attack */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Target className={`h-5 w-5 ${theme.primary}`} />
              <h3 className="text-lg font-black text-foreground">Top Scoring Teams</h3>
            </div>
            <div className="space-y-2">
              {topScoringTeams.map((t, idx) => (
                <div key={t.name} className="sports-card p-3.5 flex items-center gap-3 hover:border-primary/20 transition-colors">
                  <span className={`text-xs font-black w-5 text-center ${idx === 0 ? theme.primary : 'text-muted-foreground'}`}>{idx + 1}</span>
                  <TeamLogo teamName={t.name} size={22} />
                  <span className="flex-1 text-sm font-bold text-foreground truncate">{t.name}</span>
                  <div className="text-right">
                    <span className={`text-lg font-black ${theme.primary}`}>{t.goalsFor}</span>
                    <p className="text-[9px] text-muted-foreground">goals</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Defense */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Shield className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-black text-foreground">Best Defense</h3>
            </div>
            <div className="space-y-2">
              {bestDefense.map((t, idx) => (
                <div key={t.name} className="sports-card p-3.5 flex items-center gap-3 hover:border-primary/20 transition-colors">
                  <span className={`text-xs font-black w-5 text-center ${idx === 0 ? 'text-green-400' : 'text-muted-foreground'}`}>{idx + 1}</span>
                  <TeamLogo teamName={t.name} size={22} />
                  <span className="flex-1 text-sm font-bold text-foreground truncate">{t.name}</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-green-400">{t.goalsAgainst}</span>
                    <p className="text-[9px] text-muted-foreground">conceded</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════ HIGHEST SCORING MATCHES ═══════════ */}
      <section className="border-t border-border/40 bg-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Star className={`h-5 w-5 ${theme.primary}`} />
            <h3 className="text-lg font-black text-foreground">Highest Scoring Matches</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highScoringMatches.map((m) => (
              <Link key={m.id} href={`/matches/${m.id}`}>
                <div className={`sports-card sports-card-hover p-4 space-y-3 h-full`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{m.date}
                    </span>
                    <span className={`text-[10px] font-black ${theme.primary} ${theme.primaryBg} px-2 py-0.5 rounded-full`}>
                      {m.totalGoals} Goals
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <TeamLogo teamName={m.homeTeam} size={22} />
                      <span className="text-xs font-bold text-foreground truncate">{m.homeTeam}</span>
                    </div>
                    <span className="text-lg font-black text-foreground tabular-nums shrink-0">
                      {m.homeScore} - {m.awayScore}
                    </span>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-xs font-bold text-foreground truncate">{m.awayTeam}</span>
                      <TeamLogo teamName={m.awayTeam} size={22} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════ RECENT RESULTS ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className={`h-5 w-5 ${theme.secondaryAccent}`} />
          <h3 className="text-lg font-black text-foreground">Recent Results</h3>
        </div>

        <div className="space-y-2">
          {recentMatches.map((m) => (
            <Link key={m.id} href={`/matches/${m.id}`}>
              <div className="sports-card sports-card-hover px-4 py-3 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">{m.date}</span>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <span className="text-xs font-bold text-foreground truncate text-right">{m.homeTeam}</span>
                  <TeamLogo teamName={m.homeTeam} size={18} />
                </div>

                <div className={`text-sm font-black tabular-nums px-2 py-0.5 rounded ${
                  m.result === 'home_win' ? 'text-green-400' :
                  m.result === 'away_win' ? 'text-blue-400' :
                  'text-zinc-400'
                }`}>
                  {m.homeScore} - {m.awayScore}
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <TeamLogo teamName={m.awayTeam} size={18} />
                  <span className="text-xs font-bold text-foreground truncate">{m.awayTeam}</span>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ═══════════ EXPLORE MORE ═══════════ */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h3 className="text-lg font-black text-foreground mb-4">Explore Other Leagues</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { slug: 'premier-league', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
              { slug: 'la-liga', name: 'La Liga', emoji: '🇪🇸' },
              { slug: 'bundesliga', name: 'Bundesliga', emoji: '🇩🇪' },
              { slug: 'serie-a', name: 'Serie A', emoji: '🇮🇹' },
              { slug: 'ligue-1', name: 'Ligue 1', emoji: '🇫🇷' },
            ]
              .filter(l => l.slug !== slug)
              .map(l => (
                <Link key={l.slug} href={`/leagues/${l.slug}`}>
                  <div className="sports-card sports-card-hover p-4 flex items-center gap-3 h-full">
                    <span className="text-2xl">{l.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{l.name}</p>
                      <p className="text-[10px] text-muted-foreground">View standings & stats</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  )
}
