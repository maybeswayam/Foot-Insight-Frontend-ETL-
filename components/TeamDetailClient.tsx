'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Trophy, Target, Shield, Users, ChevronRight,
  Calendar, TrendingUp, Star, Crosshair, BarChart3, Shirt,
  Timer, AlertTriangle, Zap, Home, Plane
} from 'lucide-react'
import { TeamLogo } from '@/components/TeamLogo'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import type { LeagueTableRow } from '@/lib/leagueTable'

/* ────────── Types ────────── */

interface TeamInfo {
  id: string
  name: string
  competition: string
  country: string
  type: string
}

interface TeamStats {
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; goalDifference: number; points: number
  cleanSheets: number
  totalShots: number; totalSOT: number; shotAccuracy: number
  yellowCards: number; redCards: number
  totalFouls: number; totalCorners: number
  homeWins: number; homePlayed: number
  awayWins: number; awayPlayed: number
  avgGoals: string; winRate: number
  xG: number; xGA: number
}

interface RecentMatch {
  matchId: string
  date: string
  homeTeam: string
  awayTeam: string
  homeGoals: number
  awayGoals: number
  competition: string
  result: 'W' | 'D' | 'L'
  isHome: boolean
}

interface PlayerInfo {
  id: string
  name: string
  position: string
  age: number
  club: string
  goals: number
  assists: number
  games: number
  minutes: number
  shots: number
  shotsOnTarget: number
  passAccuracy: number
  tackles: number
  interceptions: number
  yellowCards: number
  redCards: number
  xG: number
  xA: number
  gamesStarted: number
}

interface Props {
  team: TeamInfo
  stats: TeamStats
  form: ('W' | 'D' | 'L')[]
  recentMatches: RecentMatch[]
  players: PlayerInfo[]
  leaguePosition: number
  leagueTeamCount: number
  leagueSlug: string
  leagueTable: LeagueTableRow[]
}

/* ────────── Helpers ────────── */

const POSITION_ORDER: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 }
const POSITION_LABEL: Record<string, string> = {
  GK: 'Goalkeepers', DF: 'Defenders', MF: 'Midfielders', FW: 'Forwards',
}
const POSITION_COLOR: Record<string, string> = {
  GK: 'text-amber-400', DF: 'text-blue-400', MF: 'text-green-400', FW: 'text-red-400',
}
const POSITION_BG: Record<string, string> = {
  GK: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  DF: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MF: 'bg-green-500/20 text-green-300 border-green-500/30',
  FW: 'bg-red-500/20 text-red-300 border-red-500/30',
}

function FormBadge({ result, size = 'md' }: { result: 'W' | 'D' | 'L'; size?: 'sm' | 'md' | 'lg' }) {
  const cls = result === 'W'
    ? 'bg-green-500 text-white'
    : result === 'D'
      ? 'bg-yellow-500 text-black'
      : 'bg-red-500 text-white'
  const sizeMap = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  }
  return (
    <span className={`inline-flex items-center justify-center rounded font-black ${cls} ${sizeMap[size]}`}>
      {result}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string
}) {
  return (
    <div className="sports-card p-4 text-center space-y-1">
      <Icon className="h-4 w-4 mx-auto text-green-400" />
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

type Tab = 'overview' | 'squad' | 'stats'

/* ────────── Component ────────── */

export function TeamDetailClient({
  team, stats, form, recentMatches, players,
  leaguePosition, leagueTeamCount, leagueSlug, leagueTable,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'squad', label: 'Squad', icon: Users },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
  ]

  // Group players by position
  const playersByPosition = players.reduce((acc, p) => {
    const pos = p.position || 'FW'
    if (!acc[pos]) acc[pos] = []
    acc[pos].push(p)
    return acc
  }, {} as Record<string, PlayerInfo[]>)

  const positionKeys = Object.keys(playersByPosition).sort(
    (a, b) => (POSITION_ORDER[a] ?? 9) - (POSITION_ORDER[b] ?? 9)
  )

  // Top scorers (top 5 with goals > 0)
  const topScorers = [...players].filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5)

  // Top assisters
  const topAssists = [...players].filter((p) => p.assists > 0).sort((a, b) => b.assists - a.assists).slice(0, 5)

  // Most minutes
  const mostMinutes = [...players].sort((a, b) => b.minutes - a.minutes).slice(0, 5)

  // Result distribution
  const homeWinPct = stats.homePlayed > 0 ? (stats.homeWins / stats.homePlayed * 100).toFixed(1) : '0'
  const awayWinPct = stats.awayPlayed > 0 ? (stats.awayWins / stats.awayPlayed * 100).toFixed(1) : '0'

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border/40 bg-gradient-to-b from-green-500/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            href="/teams"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            All Teams
          </Link>

          {/* Team Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <TeamLogo teamName={team.name} size={88} className="rounded-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">{team.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {team.country && (
                  <span className="text-sm font-bold text-muted-foreground">{team.country}</span>
                )}
                <Link
                  href={leagueSlug === 'worldcup' ? '/worldcup' : leagueSlug ? `/leagues/${leagueSlug}` : '/teams'}
                  className="inline-flex items-center gap-1 text-sm font-bold text-green-400 hover:text-green-300 transition-colors"
                >
                  {team.competition}
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-4 mt-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-bold text-foreground">{stats.points} pts</span>
                  <span className="text-xs text-muted-foreground">({stats.won}W {stats.drawn}D {stats.lost}L)</span>
                </div>
                {leaguePosition > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-bold text-foreground">
                      {leaguePosition === 1 ? '1st' : leaguePosition === 2 ? '2nd' : leaguePosition === 3 ? '3rd' : `${leaguePosition}th`}
                    </span>
                    <span className="text-xs text-muted-foreground">of {leagueTeamCount}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-foreground">{stats.goalsFor} goals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {form.map((r, i) => <FormBadge key={i} result={r} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
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

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ═══════ OVERVIEW TAB ═══════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Row: Form + League Position + Season Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Team Form */}
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  Team Form
                </h3>
                <div className="space-y-3">
                  {recentMatches.slice(0, 5).map((m, i) => {
                    const opponent = m.isHome ? m.awayTeam : m.homeTeam
                    const score = m.isHome ? `${m.homeGoals} - ${m.awayGoals}` : `${m.awayGoals} - ${m.homeGoals}`
                    return (
                      <Link key={i} href={`/matches/${m.matchId}`} className="flex items-center gap-3 group">
                        <FormBadge result={m.result} size="sm" />
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          m.result === 'W' ? 'bg-green-500/20 text-green-300' :
                          m.result === 'D' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>{score}</span>
                        <TeamLogo teamName={opponent} size={20} />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground truncate transition-colors">{opponent}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* League Position */}
              <div className="sports-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-400" />
                    {team.competition}
                  </h3>
                  {leagueSlug && (
                    <Link href={leagueSlug === 'worldcup' ? '/worldcup' : `/leagues/${leagueSlug}`} className="text-[10px] font-bold text-green-400 hover:underline flex items-center gap-0.5">
                      Full Table <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground text-[10px] uppercase">
                        <th className="text-left py-1 pr-2">#</th>
                        <th className="text-left py-1">Team</th>
                        <th className="text-center py-1">PL</th>
                        <th className="text-center py-1">GD</th>
                        <th className="text-center py-1 font-black">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leagueTable.map((row) => {
                        const isUs = row.teamId === team.name
                        return (
                          <tr key={row.teamId} className={`border-t border-border/20 ${isUs ? 'bg-green-500/10' : ''}`}>
                            <td className={`py-1.5 pr-2 font-bold ${isUs ? 'text-green-400' : 'text-muted-foreground'}`}>{row.position}</td>
                            <td className="py-1.5">
                              <div className="flex items-center gap-2">
                                <TeamLogo teamName={row.teamId} size={16} />
                                <span className={`font-bold truncate ${isUs ? 'text-green-400' : 'text-foreground'}`}>{row.teamId}</span>
                              </div>
                            </td>
                            <td className="text-center py-1.5 text-muted-foreground">{row.played}</td>
                            <td className={`text-center py-1.5 font-bold ${row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                              {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
                            </td>
                            <td className={`text-center py-1.5 font-black ${isUs ? 'text-green-400' : 'text-foreground'}`}>{row.points}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Season Stats Quick */}
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  Season Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Goals Scored', val: stats.goalsFor, max: Math.max(stats.goalsFor, stats.goalsAgainst, 1), color: 'bg-green-500' },
                    { label: 'Goals Conceded', val: stats.goalsAgainst, max: Math.max(stats.goalsFor, stats.goalsAgainst, 1), color: 'bg-red-500' },
                    { label: 'Clean Sheets', val: stats.cleanSheets, max: stats.played || 1, color: 'bg-blue-500' },
                    { label: 'Win Rate', val: stats.winRate, max: 100, color: 'bg-amber-500', suffix: '%' },
                    { label: 'Shot Accuracy', val: stats.shotAccuracy, max: 100, color: 'bg-purple-500', suffix: '%' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className="text-muted-foreground uppercase">{item.label}</span>
                        <span className="text-foreground">{item.val}{item.suffix ?? ''}</span>
                      </div>
                      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
              <StatCard icon={Calendar} label="Played" value={stats.played} />
              <StatCard icon={Trophy} label="Won" value={stats.won} />
              <StatCard icon={Target} label="Goals" value={stats.goalsFor} />
              <StatCard icon={Shield} label="Clean Sheets" value={stats.cleanSheets} />
              <StatCard icon={Crosshair} label="Shots" value={stats.totalShots} sub={`${stats.totalSOT} on target`} />
              <StatCard icon={AlertTriangle} label="Yellow Cards" value={stats.yellowCards} />
              <StatCard icon={Home} label="Home Win %" value={`${homeWinPct}%`} />
              <StatCard icon={Plane} label="Away Win %" value={`${awayWinPct}%`} />
            </div>

            {/* Top Scorers & Assists + Recent */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Top Scorers */}
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-400" />
                  Top Scorers
                </h3>
                {topScorers.length > 0 ? (
                  <div className="space-y-3">
                    {topScorers.map((p, i) => (
                      <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 group">
                        <span className="text-xs font-black text-muted-foreground w-4">{i + 1}</span>
                        <PlayerPhoto playerName={p.name} size={32} rounded />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary truncate transition-colors">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.position} · {p.games} games</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-green-400">⚽ {p.goals}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No scorers data available</p>
                )}
              </div>

              {/* Top Assists */}
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-400" />
                  Top Assists
                </h3>
                {topAssists.length > 0 ? (
                  <div className="space-y-3">
                    {topAssists.map((p, i) => (
                      <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 group">
                        <span className="text-xs font-black text-muted-foreground w-4">{i + 1}</span>
                        <PlayerPhoto playerName={p.name} size={32} rounded />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary truncate transition-colors">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.position} · {p.games} games</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-blue-400">🅰️ {p.assists}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No assists data available</p>
                )}
              </div>

              {/* Recent Results */}
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  Recent Results
                </h3>
                <div className="space-y-2">
                  {recentMatches.slice(0, 7).map((m, i) => (
                    <Link key={i} href={`/matches/${m.matchId}`} className="flex items-center gap-2 group text-xs">
                      <span className="text-[10px] text-muted-foreground w-16 flex-shrink-0">{m.date.slice(5)}</span>
                      <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                        <span className={`font-bold truncate ${m.isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{m.homeTeam}</span>
                        <TeamLogo teamName={m.homeTeam} size={16} />
                      </div>
                      <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                        m.result === 'W' ? 'bg-green-500/20 text-green-300' :
                        m.result === 'D' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>{m.homeGoals}-{m.awayGoals}</span>
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <TeamLogo teamName={m.awayTeam} size={16} />
                        <span className={`font-bold truncate ${!m.isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{m.awayTeam}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Starting XI visualization */}
            {players.length > 0 && (
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Shirt className="h-4 w-4 text-green-400" />
                  Key Players (Most Minutes)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {mostMinutes.slice(0, 12).map((p, i) => (
                    <Link key={p.id} href={`/players/${p.id}`} className="group">
                      <div className="flex flex-col items-center text-center space-y-2 p-3 rounded-xl hover:bg-secondary/30 transition-all">
                        <div className="relative">
                          <PlayerPhoto playerName={p.name} size={56} rounded />
                          <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded border ${POSITION_BG[p.position] ?? POSITION_BG.FW}`}>
                            {p.position}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground group-hover:text-primary truncate transition-colors max-w-[100px]">{p.name.split(' ').pop()}</p>
                          <p className="text-[10px] text-muted-foreground">{p.minutes}&apos;</p>
                          {(p.goals > 0 || p.assists > 0) && (
                            <p className="text-[10px] font-bold">
                              {p.goals > 0 && <span className="text-green-400">⚽{p.goals}</span>}
                              {p.goals > 0 && p.assists > 0 && ' '}
                              {p.assists > 0 && <span className="text-blue-400">🅰️{p.assists}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ SQUAD TAB ═══════ */}
        {activeTab === 'squad' && (
          <div className="space-y-8">
            {positionKeys.map((pos) => {
              const posPlayers = playersByPosition[pos] ?? []
              return (
                <div key={pos}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-sm font-black uppercase tracking-wider ${POSITION_COLOR[pos] ?? 'text-foreground'}`}>
                      {POSITION_LABEL[pos] ?? pos}
                    </span>
                    <span className="text-xs text-muted-foreground font-bold">({posPlayers.length})</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {posPlayers.map((p) => (
                      <Link key={p.id} href={`/players/${p.id}`}>
                        <div className="sports-card sports-card-hover group p-4 flex items-start gap-4">
                          <div className="flex-shrink-0 relative">
                            <PlayerPhoto playerName={p.name} size={52} rounded />
                            <span className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded border ${POSITION_BG[p.position] ?? POSITION_BG.FW}`}>
                              {p.position}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-foreground group-hover:text-primary truncate transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Age {p.age} {p.club ? `· ${p.club}` : ''}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px]">
                              <span className="font-bold"><span className="text-muted-foreground">Apps:</span> <span className="text-foreground">{p.games}</span></span>
                              <span className="font-bold"><span className="text-muted-foreground">Mins:</span> <span className="text-foreground">{p.minutes}</span></span>
                              {p.goals > 0 && <span className="font-bold text-green-400">⚽ {p.goals}</span>}
                              {p.assists > 0 && <span className="font-bold text-blue-400">🅰️ {p.assists}</span>}
                              {p.yellowCards > 0 && <span className="font-bold text-yellow-400">🟨 {p.yellowCards}</span>}
                              {p.redCards > 0 && <span className="font-bold text-red-400">🟥 {p.redCards}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}

            {players.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground font-bold">No player data available for this team</p>
                <p className="text-xs text-muted-foreground mt-1">Player data is only available for FIFA World Cup 2022 teams</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════ STATS TAB ═══════ */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            {/* Main Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sports-card p-5 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Record</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">{stats.won}-{stats.drawn}-{stats.lost}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stats.played} matches played</p>
                <div className="flex gap-1 mt-2">
                  {form.map((r, i) => <FormBadge key={i} result={r} size="md" />)}
                </div>
              </div>

              <div className="sports-card p-5 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Goals</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-green-400">{stats.goalsFor}</span>
                  <span className="text-lg font-bold text-muted-foreground">scored</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-red-400">{stats.goalsAgainst}</span>
                  <span className="text-lg font-bold text-muted-foreground">conceded</span>
                </div>
                <p className={`text-sm font-black ${stats.goalDifference > 0 ? 'text-green-400' : stats.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference} GD
                </p>
              </div>

              <div className="sports-card p-5 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Shooting</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">{stats.totalShots}</span>
                  <span className="text-lg font-bold text-muted-foreground">shots</span>
                </div>
                <p className="text-xs text-muted-foreground">{stats.totalSOT} on target ({stats.shotAccuracy}%)</p>
                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.shotAccuracy}%` }}
                  />
                </div>
              </div>

              <div className="sports-card p-5 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Discipline</p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-black text-yellow-400">{stats.yellowCards}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">Yellow</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-black text-red-400">{stats.redCards}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">Red</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stats.totalFouls} fouls · {stats.totalCorners} corners</p>
              </div>
            </div>

            {/* Home vs Away */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Home className="h-4 w-4 text-green-400" />
                  Home Record
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{stats.homeWins}</p>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{stats.homePlayed}</p>
                    <p className="text-[10px] text-muted-foreground">Played</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-400">{homeWinPct}%</p>
                    <p className="text-[10px] text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </div>

              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-400" />
                  Away Record
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{stats.awayWins}</p>
                    <p className="text-[10px] text-muted-foreground">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{stats.awayPlayed}</p>
                    <p className="text-[10px] text-muted-foreground">Played</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-blue-400">{awayWinPct}%</p>
                    <p className="text-[10px] text-muted-foreground">Win Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* xG section (if available) */}
            {stats.xG > 0 && (
              <div className="sports-card p-5 space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  Expected Goals (xG)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-400">{stats.xG}</p>
                    <p className="text-[10px] text-muted-foreground">xG</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-foreground">{stats.goalsFor}</p>
                    <p className="text-[10px] text-muted-foreground">Actual Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-red-400">{stats.xGA}</p>
                    <p className="text-[10px] text-muted-foreground">xGA</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-black ${stats.goalsFor > stats.xG ? 'text-green-400' : 'text-red-400'}`}>
                      {(stats.goalsFor - stats.xG).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Goals vs xG</p>
                  </div>
                </div>
              </div>
            )}

            {/* All Results Table */}
            <div className="sports-card p-5 space-y-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-400" />
                All Results
              </h3>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {recentMatches.map((m, i) => (
                  <Link key={i} href={`/matches/${m.matchId}`} className="flex items-center gap-2 group text-xs py-1.5 px-2 rounded-lg hover:bg-secondary/30 transition-all">
                    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0">{m.date}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      m.competition === 'FIFA World Cup' ? 'bg-amber-500/20 text-amber-300' : 'bg-secondary text-muted-foreground'
                    }`}>{m.competition.replace('FIFA ', '')}</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                      <span className={`font-bold truncate ${m.isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{m.homeTeam}</span>
                      <TeamLogo teamName={m.homeTeam} size={16} />
                    </div>
                    <span className={`font-black px-2 py-0.5 rounded text-[10px] flex-shrink-0 ${
                      m.result === 'W' ? 'bg-green-500/20 text-green-300' :
                      m.result === 'D' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>{m.homeGoals} - {m.awayGoals}</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <TeamLogo teamName={m.awayTeam} size={16} />
                      <span className={`font-bold truncate ${!m.isHome ? 'text-foreground' : 'text-muted-foreground'}`}>{m.awayTeam}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
