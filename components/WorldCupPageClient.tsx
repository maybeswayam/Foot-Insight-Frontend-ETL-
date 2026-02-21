'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, Target, Shirt, Award, TrendingUp, MapPin, Calendar, Users, Zap, Shield, Star, ChevronRight } from 'lucide-react'
import { CountryFlag } from '@/components/CountryFlag'
import { KnockoutBracket } from '@/components/KnockoutBracket'

/* ────────── Types from server ────────── */

export interface WCPlayer {
  playerId: number
  name: string
  team: string
  position: string
  goals: number
  assists: number
  xG: number
  xA: number
  minutes: number
  yellowCards: number
  redCards: number
  pensMade: number
  pensAtt: number
  tackles: number
  interceptions: number
  passAccuracy: number
  age: number
  club: string | null
}

export interface WCStanding {
  teamName: string
  group: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface WCMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  venue: string
  totalGoals: number
}

export interface TournamentStats {
  totalGoals: number
  totalMatches: number
  avgGoals: number
  totalTeams: number
  venues: number
  totalPlayers: number
  totalYellowCards: number
  totalRedCards: number
}

interface Props {
  players: WCPlayer[]
  standings: WCStanding[]
  matches: WCMatch[]
  stats: TournamentStats
}

/* ────────── Helpers ────────── */

function getGroupTeams(standings: WCStanding[], group: string) {
  return standings
    .filter(s => s.group === group)
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

/* ────────── Official 2022 WC Awards ────────── */

const AWARDS = {
  goldenBoot: { name: 'Kylian Mbappé', team: 'France', detail: '8 Goals', icon: '👟' },
  goldenBall: { name: 'Lionel Messi', team: 'Argentina', detail: 'Best Player', icon: '⚽' },
  goldenGlove: { name: 'Emiliano Martínez', team: 'Argentina', detail: 'Best Goalkeeper', icon: '🧤' },
  youngPlayer: { name: 'Enzo Fernández', team: 'Argentina', detail: 'Best Young Player', icon: '🌟' },
}

/* ────────── Component ────────── */

export function WorldCupPageClient({ players, standings, matches, stats }: Props) {
  const [activeGroup, setActiveGroup] = useState('A')

  const topScorers = [...players].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 10)
  const topAssisters = [...players].sort((a, b) => b.assists - a.assists || b.goals - a.goals).slice(0, 10)
  const topXG = [...players].sort((a, b) => b.xG - a.xG).slice(0, 5)
  const highScoringMatches = [...matches].sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 6)

  return (
    <main className="min-h-screen bg-background">

      {/* ═══════════ HERO: Champion Banner ═══════════ */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-green-500/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Trophy */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="text-7xl md:text-9xl animate-pulse">🏆</div>
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black px-2 py-0.5 rounded-full">
                  2022
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-yellow-400 uppercase tracking-[0.3em]">FIFA World Cup Qatar 2022</p>
              <h1 className="text-4xl md:text-6xl font-black text-foreground">Argentina Are Champions</h1>
            </div>

            {/* Final Score */}
            <div className="inline-flex items-center gap-4 sm:gap-8 bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl px-6 sm:px-10 py-6">
              <div className="text-center space-y-2">
                <CountryFlag country="Argentina" size={48} />
                <p className="text-sm font-bold text-foreground">Argentina</p>
                <p className="text-xs text-yellow-400 font-bold">Champions</p>
              </div>

              <div className="text-center space-y-1">
                <p className="text-3xl sm:text-5xl font-black text-foreground tabular-nums">3 - 3</p>
                <p className="text-xs text-muted-foreground">After Extra Time</p>
                <div className="bg-yellow-500/20 rounded-full px-3 py-1">
                  <p className="text-xs font-black text-yellow-400">PEN 4 - 2</p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <CountryFlag country="France" size={48} />
                <p className="text-sm font-bold text-foreground">France</p>
                <p className="text-xs text-muted-foreground">Runner-up</p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>December 18, 2022</span>
              <span className="mx-2">•</span>
              <MapPin className="h-3 w-3" />
              <span>Lusail Iconic Stadium</span>
            </div>

            {/* Podium */}
            <div className="flex justify-center items-end gap-4 sm:gap-6 pt-4">
              {/* 3rd place */}
              <div className="text-center space-y-2">
                <div className="bg-amber-700/20 border border-amber-700/30 rounded-xl px-4 py-3 w-24 sm:w-28">
                  <CountryFlag country="Croatia" size={28} />
                  <p className="text-xs font-bold text-foreground mt-1">Croatia</p>
                  <p className="text-[10px] text-amber-600">3rd Place</p>
                </div>
              </div>
              {/* 1st place */}
              <div className="text-center space-y-2 -mt-4">
                <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-4 py-4 w-28 sm:w-32 shadow-lg shadow-yellow-500/10">
                  <CountryFlag country="Argentina" size={36} />
                  <p className="text-sm font-black text-foreground mt-1">Argentina</p>
                  <p className="text-[10px] text-yellow-400 font-bold">🥇 Champions</p>
                </div>
              </div>
              {/* 2nd place */}
              <div className="text-center space-y-2">
                <div className="bg-zinc-400/10 border border-zinc-400/20 rounded-xl px-4 py-3 w-24 sm:w-28">
                  <CountryFlag country="France" size={28} />
                  <p className="text-xs font-bold text-foreground mt-1">France</p>
                  <p className="text-[10px] text-zinc-400">Runner-up</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════ TOURNAMENT STATS ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: stats.totalGoals, label: 'Goals Scored', icon: Target, color: 'text-green-400' },
            { value: stats.totalMatches, label: 'Matches Played', icon: Calendar, color: 'text-blue-400' },
            { value: stats.totalTeams, label: 'Nations', icon: Users, color: 'text-purple-400' },
            { value: stats.avgGoals.toFixed(2), label: 'Goals per Match', icon: TrendingUp, color: 'text-yellow-400' },
            { value: stats.venues, label: 'Stadiums', icon: MapPin, color: 'text-orange-400' },
            { value: stats.totalPlayers, label: 'Players', icon: Shirt, color: 'text-cyan-400' },
            { value: stats.totalYellowCards, label: 'Yellow Cards', icon: Zap, color: 'text-amber-400' },
            { value: stats.totalRedCards, label: 'Red Cards', icon: Shield, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="sports-card p-5 text-center space-y-2 group hover:border-primary/30 transition-all">
              <s.icon className={`h-5 w-5 mx-auto ${s.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ═══════════ OFFICIAL AWARDS ═══════════ */}
      <section className="border-y border-border/40 bg-gradient-to-b from-yellow-500/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Tournament Awards</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(AWARDS).map(([key, award]) => (
              <div key={key} className="sports-card p-6 space-y-4 hover:border-yellow-500/30 transition-colors group">
                <div className="flex items-start justify-between">
                  <span className="text-4xl">{award.icon}</span>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider bg-yellow-500/10 px-2 py-1 rounded-full">
                    {key === 'goldenBoot' ? 'Golden Boot' :
                     key === 'goldenBall' ? 'Golden Ball' :
                     key === 'goldenGlove' ? 'Golden Glove' : 'Young Player'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CountryFlag country={award.team} size={20} />
                    <h3 className="text-lg font-black text-foreground group-hover:text-yellow-400 transition-colors">{award.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{award.team}</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg px-3 py-2">
                  <p className="text-sm font-bold text-yellow-400">{award.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════ TOP SCORERS TABLE ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Target className="h-6 w-6 text-green-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Top Scorers</h2>
        </div>

        <div className="sports-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/30">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Player</th>
                  <th className="text-center px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="hidden sm:inline">Goals</span>
                    <span className="sm:hidden">G</span>
                  </th>
                  <th className="text-center px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="hidden sm:inline">Assists</span>
                    <span className="sm:hidden">A</span>
                  </th>
                  <th className="text-center px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">xG</th>
                  <th className="text-center px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Mins</th>
                  <th className="text-center px-3 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Pens</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((p, idx) => (
                  <tr key={p.name} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/players/${p.playerId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <CountryFlag country={p.team} size={22} />
                        <div>
                          <p className="font-bold text-foreground hover:text-green-400 transition-colors">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.team} • {p.position}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="text-lg font-black text-green-400">{p.goals}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="font-bold text-foreground">{p.assists}</span>
                    </td>
                    <td className="text-center px-3 py-3 hidden sm:table-cell">
                      <span className="text-muted-foreground">{p.xG.toFixed(1)}</span>
                    </td>
                    <td className="text-center px-3 py-3 hidden md:table-cell">
                      <span className="text-muted-foreground">{p.minutes}</span>
                    </td>
                    <td className="text-center px-3 py-3 hidden md:table-cell">
                      <span className="text-muted-foreground">{p.pensMade}/{p.pensAtt}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* ═══════════ TOP ASSIST PROVIDERS ═══════════ */}
      <section className="border-t border-border/40 bg-secondary/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Top Assist Providers</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topAssisters.map((p, idx) => (
              <Link key={p.name} href={`/players/${p.playerId}`}>
                <div className="sports-card p-4 flex items-center gap-3 hover:border-blue-500/30 transition-colors cursor-pointer">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    idx === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                    idx === 2 ? 'bg-amber-600/20 text-amber-600' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <CountryFlag country={p.team} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate hover:text-blue-400 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.team}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-blue-400">{p.assists}</p>
                    <p className="text-[10px] text-muted-foreground">{p.goals}G</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════ GROUP STAGE ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Group Stage</h2>
        </div>

        {/* Group selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {GROUPS.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeGroup === g
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-secondary/30 text-muted-foreground border border-border/40 hover:text-foreground hover:border-border'
              }`}
            >
              Group {g}
            </button>
          ))}
        </div>

        {/* Active group table */}
        <div className="sports-card overflow-hidden">
          <div className="bg-secondary/30 px-4 py-3 border-b border-border/40">
            <p className="text-sm font-black text-foreground uppercase tracking-wider">Group {activeGroup}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-10">#</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Team</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">P</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">W</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">D</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">L</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GF</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">GA</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">GD</th>
                  <th className="text-center px-2 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pts</th>
                </tr>
              </thead>
              <tbody>
                {getGroupTeams(standings, activeGroup).map((team, idx) => {
                  const qualified = idx < 2
                  return (
                    <tr key={team.teamName} className={`border-b border-border/20 transition-colors ${qualified ? 'hover:bg-green-500/5' : 'hover:bg-secondary/20'}`}>
                      <td className="px-4 py-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          qualified ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CountryFlag country={team.teamName} size={24} />
                          <span className={`font-bold ${qualified ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {team.teamName}
                          </span>
                          {qualified && (
                            <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded hidden sm:inline">
                              Q
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center px-2 py-3 text-muted-foreground">{team.played}</td>
                      <td className="text-center px-2 py-3 font-bold text-foreground">{team.won}</td>
                      <td className="text-center px-2 py-3 text-muted-foreground">{team.drawn}</td>
                      <td className="text-center px-2 py-3 text-muted-foreground">{team.lost}</td>
                      <td className="text-center px-2 py-3 text-muted-foreground hidden sm:table-cell">{team.goalsFor}</td>
                      <td className="text-center px-2 py-3 text-muted-foreground hidden sm:table-cell">{team.goalsAgainst}</td>
                      <td className="text-center px-2 py-3">
                        <span className={`font-bold ${team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </span>
                      </td>
                      <td className="text-center px-2 py-3">
                        <span className="text-lg font-black text-foreground">{team.points}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-border/20 bg-secondary/10">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500/40" />
              <span>Qualified for knockout stage</span>
            </div>
          </div>
        </div>

        {/* All groups mini view */}
        <div className="grid gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map(g => {
            const teams = getGroupTeams(standings, g)
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`sports-card p-4 text-left transition-all hover:border-primary/30 ${
                  activeGroup === g ? 'border-green-500/40 bg-green-500/5' : ''
                }`}
              >
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Group {g}</p>
                <div className="space-y-1.5">
                  {teams.map((t, i) => (
                    <div key={t.teamName} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CountryFlag country={t.teamName} size={16} />
                        <span className={`text-xs truncate ${i < 2 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {t.teamName}
                        </span>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${i < 2 ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {t.points}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>


      {/* ═══════════ KNOCKOUT BRACKET ═══════════ */}
      <section className="border-t border-border/40 bg-gradient-to-b from-secondary/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Award className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">Knockout Stage</h2>
          </div>
          <KnockoutBracket />
        </div>
      </section>


      {/* ═══════════ HIGHEST SCORING MATCHES ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Star className="h-6 w-6 text-orange-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-foreground">Highest Scoring Matches</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highScoringMatches.map((m, idx) => (
            <Link key={m.id} href={`/matches/${m.id}`}>
              <div className="sports-card sports-card-hover p-5 space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{m.date}</span>
                  </div>
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                    {m.totalGoals} Goals
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CountryFlag country={m.homeTeam} size={24} />
                    <span className="text-sm font-bold text-foreground truncate">{m.homeTeam}</span>
                  </div>
                  <span className="text-xl font-black text-foreground tabular-nums shrink-0">
                    {m.homeScore} - {m.awayScore}
                  </span>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm font-bold text-foreground truncate">{m.awayTeam}</span>
                    <CountryFlag country={m.awayTeam} size={24} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{m.venue}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ═══════════ xG OVERPERFORMERS ═══════════ */}
      <section className="border-t border-border/40 bg-secondary/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">xG Leaders</h2>
            <span className="text-xs text-muted-foreground">(Expected Goals)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topXG.map((p, idx) => {
              const diff = p.goals - p.xG
              return (
                <Link key={p.name} href={`/players/${p.playerId}`}>
                  <div className="sports-card p-5 space-y-3 hover:border-cyan-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CountryFlag country={p.team} size={20} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate hover:text-cyan-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.team}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-lg font-black text-green-400">{p.goals}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-cyan-400">{p.xG.toFixed(1)}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">xG</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-black ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </p>
                        <p className="text-[9px] text-muted-foreground uppercase">Diff</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>


      {/* ═══════════ EXPLORE MORE ═══════════ */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h3 className="text-xl font-black text-foreground mb-6">Explore More</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/matches', label: 'All Matches', desc: 'Browse every match result and stat', icon: Calendar },
              { href: '/players', label: 'Player Database', desc: 'Explore 680+ player profiles and stats', icon: Users },
              { href: '/standings', label: 'League Tables', desc: 'Full group and league standings', icon: Trophy },
            ].map(link => (
              <Link key={link.href} href={link.href}>
                <div className="sports-card sports-card-hover p-6 flex items-center gap-4 h-full">
                  <link.icon className="h-8 w-8 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
