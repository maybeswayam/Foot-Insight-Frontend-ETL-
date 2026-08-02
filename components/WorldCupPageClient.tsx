'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Trophy, Target, Shirt, Award, TrendingUp, MapPin, Calendar, Users, Zap, Shield, Star, ChevronRight,
} from 'lucide-react'
import { CountryFlag } from '@/components/CountryFlag'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import MessiCollage from '@/components/MessiCollage'
import { resolveTeamHref } from '@/lib/teamResolve'

const KnockoutBracket = dynamic(
  () => import('@/components/KnockoutBracket').then((m) => m.KnockoutBracket),
  { ssr: false },
)

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
  teamId: string
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
    .filter((s) => s.group === group)
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
}

function teamHref(name: string, teamId?: string) {
  if (teamId) return `/teams/${teamId}`
  return resolveTeamHref(name)
}

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const AWARDS = {
  goldenBoot: { name: 'Kylian Mbappé', team: 'France', detail: '8 Goals', icon: '👟' },
  goldenBall: { name: 'Lionel Messi', team: 'Argentina', detail: 'Best Player', icon: '⚽' },
  goldenGlove: { name: 'Emiliano Martínez', team: 'Argentina', detail: 'Best Goalkeeper', icon: '🧤' },
  youngPlayer: { name: 'Enzo Fernández', team: 'Argentina', detail: 'Best Young Player', icon: '🌟' },
} as const

/* ────────── Component ────────── */

export function WorldCupPageClient({ players, standings, matches, stats }: Props) {
  const [activeGroup, setActiveGroup] = useState('A')

  const topScorers = [...players].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 10)
  const topAssisters = [...players].sort((a, b) => b.assists - a.assists || b.goals - a.goals).slice(0, 10)
  const topXG = [...players].sort((a, b) => b.xG - a.xG).slice(0, 5)
  const highScoringMatches = [...matches].sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 6)

  const argentinaHref = teamHref('Argentina')
  const franceHref = teamHref('France')
  const croatiaHref = teamHref('Croatia')
  const finalHref = '/matches/1890'

  return (
    <main className="min-h-screen bg-ink">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 20% 0%, rgba(201,162,39,0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(0,200,83,0.08), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-12deg, transparent, transparent 28px, #fff 28px, #fff 29px)',
          }}
        />
        <span className="absolute -right-4 top-8 font-display text-[140px] sm:text-[220px] leading-none text-surface-2 select-none pointer-events-none tracking-tight">
          22
        </span>

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            {/* Left — existing hero content */}
            <div>
              <p className="text-[11px] font-semibold tracking-[3px] uppercase text-gold mb-4 animate-slide-up">
                FIFA World Cup · Qatar 2022
              </p>

              <h1 className="font-display text-[clamp(42px,8vw,88px)] leading-[0.92] tracking-[1px] text-cream max-w-3xl mb-6 animate-slide-up">
                <span className="text-[#75AADB]">ARGENTINA</span>{' '}
                <span className="text-gold">ARE</span>
                <br />
                CHAMPIONS
              </h1>

              <p className="text-[15px] text-fog max-w-md mb-10 leading-relaxed animate-slide-up">
                Messi’s third World Cup final ends in glory — 3–3 after extra time, Argentina 4–2 on penalties at Lusail.
              </p>

              <div className="group inline-flex items-stretch border border-line-strong bg-surface/80 backdrop-blur-sm animate-slide-up">
                <div className="flex items-center gap-4 sm:gap-8 px-5 sm:px-8 py-5">
                  {argentinaHref ? (
                    <Link href={argentinaHref} className="text-center space-y-2 hover:opacity-80 transition-opacity">
                      <CountryFlag country="Argentina" size={44} />
                      <p className="text-xs font-bold text-cream">Argentina</p>
                      <p className="text-[10px] text-gold font-semibold uppercase tracking-wider">Champions</p>
                    </Link>
                  ) : (
                    <div className="text-center space-y-2">
                      <CountryFlag country="Argentina" size={44} />
                      <p className="text-xs font-bold text-cream">Argentina</p>
                    </div>
                  )}

                  <Link href={finalHref} className="text-center px-2 hover:opacity-90 transition-opacity">
                    <p className="font-display text-[36px] sm:text-[48px] leading-none text-cream tabular-nums">
                      3 – 3
                    </p>
                    <p className="text-[10px] text-faint mt-1 uppercase tracking-wider">AET</p>
                    <p className="mt-2 text-[11px] font-bold text-gold bg-gold/10 px-2.5 py-1 inline-block">
                      PEN 4 – 2
                    </p>
                  </Link>

                  {franceHref ? (
                    <Link href={franceHref} className="text-center space-y-2 hover:opacity-80 transition-opacity">
                      <CountryFlag country="France" size={44} />
                      <p className="text-xs font-bold text-cream">France</p>
                      <p className="text-[10px] text-faint uppercase tracking-wider">Runner-up</p>
                    </Link>
                  ) : (
                    <div className="text-center space-y-2">
                      <CountryFlag country="France" size={44} />
                      <p className="text-xs font-bold text-cream">France</p>
                    </div>
                  )}
                </div>
                <Link
                  href={finalHref}
                  className="hidden sm:flex flex-col justify-center border-l border-line px-5 text-[11px] text-faint gap-1.5 min-w-[160px] hover:bg-surface-2 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-pitch" /> Dec 18, 2022
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-pitch" /> Lusail Stadium
                  </span>
                  <span className="text-pitch font-semibold uppercase tracking-wider mt-1">
                    Open final →
                  </span>
                </Link>
              </div>

              <div className="flex flex-wrap items-end gap-3 sm:gap-5 mt-10 animate-slide-up">
                {[
                  { place: '3rd', name: 'Croatia', href: croatiaHref, tone: 'text-amber-600 border-amber-700/30 bg-amber-900/10' },
                  { place: '1st', name: 'Argentina', href: argentinaHref, tone: 'text-gold border-gold/40 bg-gold/10 -translate-y-2' },
                  { place: '2nd', name: 'France', href: franceHref, tone: 'text-fog border-line bg-surface' },
                ].map((p) => {
                  const inner = (
                    <div className={`border px-4 py-3 w-[100px] sm:w-[120px] text-center ${p.tone}`}>
                      <CountryFlag country={p.name} size={p.place === '1st' ? 32 : 24} />
                      <p className="text-xs font-bold text-cream mt-1.5">{p.name}</p>
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">{p.place}</p>
                    </div>
                  )
                  return p.href ? (
                    <Link key={p.place} href={p.href} className="hover:opacity-90 transition-opacity">
                      {inner}
                    </Link>
                  ) : (
                    <div key={p.place}>{inner}</div>
                  )
                })}
              </div>
            </div>

            {/* Right — Messi collage */}
            <div className="mt-14 lg:mt-0 flex justify-center lg:block">
              <MessiCollage />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ KNOCKOUT ═══════════ */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex items-center gap-3 mb-10">
            <Award className="h-6 w-6 text-gold" />
            <h2 className="font-display text-3xl sm:text-4xl tracking-[1px] text-cream">KNOCKOUT STAGE</h2>
          </div>
          <KnockoutBracket />
        </div>
      </section>

      {/* ═══════════ GROUP STAGE ═══════════ */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex items-center gap-3 mb-8">
            <Users className="h-5 w-5 text-pitch" />
            <h2 className="font-display text-3xl sm:text-4xl tracking-[1px] text-cream">GROUP STAGE</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGroup(g)}
                className={`px-4 py-2 text-sm font-bold transition-all border ${
                  activeGroup === g
                    ? 'bg-pitch/15 text-pitch border-pitch/40'
                    : 'bg-surface text-faint border-line hover:text-cream hover:border-line-strong'
                }`}
              >
                Group {g}
              </button>
            ))}
          </div>

          <div className="border border-line bg-surface overflow-hidden">
            <div className="bg-surface-2 px-4 py-3">
              <p className="text-xs font-bold text-cream uppercase tracking-[2px]">Group {activeGroup}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-faint uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">Team</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">P</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">W</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">D</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">L</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider hidden sm:table-cell">GF</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider hidden sm:table-cell">GA</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">GD</th>
                    <th className="text-center px-2 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupTeams(standings, activeGroup).map((team, idx) => {
                    const qualified = idx < 2
                    const href = teamHref(team.teamName, team.teamId)
                    return (
                      <tr
                        key={team.teamName}
                        className={`transition-colors ${qualified ? 'hover:bg-pitch/5' : 'hover:bg-surface-2'}`}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              qualified ? 'bg-pitch/20 text-pitch' : 'bg-surface-2 text-faint'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {href ? (
                            <Link href={href} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                              <CountryFlag country={team.teamName} size={24} />
                              <span className={`font-bold ${qualified ? 'text-cream' : 'text-fog'}`}>{team.teamName}</span>
                              {qualified && (
                                <span className="text-[9px] font-bold text-pitch bg-pitch/10 px-1.5 py-0.5 hidden sm:inline">
                                  Q
                                </span>
                              )}
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">
                              <CountryFlag country={team.teamName} size={24} />
                              <span className="font-bold text-fog">{team.teamName}</span>
                            </div>
                          )}
                        </td>
                        <td className="text-center px-2 py-3 text-faint">{team.played}</td>
                        <td className="text-center px-2 py-3 font-bold text-cream">{team.won}</td>
                        <td className="text-center px-2 py-3 text-faint">{team.drawn}</td>
                        <td className="text-center px-2 py-3 text-faint">{team.lost}</td>
                        <td className="text-center px-2 py-3 text-faint hidden sm:table-cell">{team.goalsFor}</td>
                        <td className="text-center px-2 py-3 text-faint hidden sm:table-cell">{team.goalsAgainst}</td>
                        <td className="text-center px-2 py-3">
                          <span
                            className={`font-bold ${
                              team.goalDifference > 0
                                ? 'text-pitch'
                                : team.goalDifference < 0
                                  ? 'text-redcard'
                                  : 'text-faint'
                            }`}
                          >
                            {team.goalDifference > 0 ? '+' : ''}
                            {team.goalDifference}
                          </span>
                        </td>
                        <td className="text-center px-2 py-3">
                          <span className="text-lg font-black text-cream">{team.points}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-surface-2">
              <div className="flex items-center gap-2 text-[10px] text-faint">
                <span className="inline-block w-2 h-2 rounded-full bg-pitch/50" />
                <span>Qualified for knockout stage</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 mt-8 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map((g) => {
              const teams = getGroupTeams(standings, g)
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroup(g)}
                  className={`border p-4 text-left transition-all hover:border-pitch/40 ${
                    activeGroup === g ? 'border-pitch/40 bg-pitch/5' : 'border-line bg-surface'
                  }`}
                >
                  <p className="text-[10px] font-bold text-faint uppercase tracking-[2px] mb-3">Group {g}</p>
                  <div className="space-y-1.5">
                    {teams.map((t, i) => {
                      const href = teamHref(t.teamName, t.teamId)
                      const row = (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CountryFlag country={t.teamName} size={16} />
                            <span className={`text-xs truncate ${i < 2 ? 'font-bold text-cream' : 'text-faint'}`}>
                              {t.teamName}
                            </span>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${i < 2 ? 'text-pitch' : 'text-faint'}`}>
                            {t.points}
                          </span>
                        </div>
                      )
                      return href ? (
                        <Link
                          key={t.teamName}
                          href={href}
                          onClick={(e) => e.stopPropagation()}
                          className="block hover:opacity-80"
                        >
                          {row}
                        </Link>
                      ) : (
                        <div key={t.teamName}>{row}</div>
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ TOURNAMENT STATS ═══════════ */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: stats.totalGoals, label: 'Goals Scored', icon: Target, color: 'text-pitch' },
            { value: stats.totalMatches, label: 'Matches Played', icon: Calendar, color: 'text-[#4BB8E8]' },
            { value: stats.totalTeams, label: 'Nations', icon: Users, color: 'text-gold' },
            { value: stats.avgGoals.toFixed(2), label: 'Goals per Match', icon: TrendingUp, color: 'text-pitch' },
            { value: stats.venues, label: 'Stadiums', icon: MapPin, color: 'text-orange-400' },
            { value: stats.totalPlayers, label: 'Players', icon: Shirt, color: 'text-cyan-400' },
            { value: stats.totalYellowCards, label: 'Yellow Cards', icon: Zap, color: 'text-amber-400' },
            { value: stats.totalRedCards, label: 'Red Cards', icon: Shield, color: 'text-redcard' },
          ].map((s) => (
            <div key={s.label} className="border border-line bg-surface p-5 text-center space-y-2 hover:border-line-strong transition-colors">
              <s.icon className={`h-5 w-5 mx-auto ${s.color} opacity-70`} />
              <p className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-faint uppercase tracking-wider font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ AWARDS ═══════════ */}
      <section className="border-y border-line bg-ink-2">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-display text-3xl tracking-[1px] text-cream">TOURNAMENT AWARDS</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(AWARDS).map(([key, award]) => {
              const href = teamHref(award.team)
              return (
                <div key={key} className="border border-line bg-surface p-6 space-y-4 hover:border-gold/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <PlayerPhoto playerName={award.name} size={56} rounded />
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2 py-1">
                      {key === 'goldenBoot'
                        ? 'Golden Boot'
                        : key === 'goldenBall'
                          ? 'Golden Ball'
                          : key === 'goldenGlove'
                            ? 'Golden Glove'
                            : 'Young Player'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {href ? (
                        <Link href={href} className="hover:opacity-80">
                          <CountryFlag country={award.team} size={18} />
                        </Link>
                      ) : (
                        <CountryFlag country={award.team} size={18} />
                      )}
                      <h3 className="text-lg font-black text-cream">{award.name}</h3>
                    </div>
                    {href ? (
                      <Link href={href} className="text-sm text-fog hover:text-pitch transition-colors">
                        {award.team}
                      </Link>
                    ) : (
                      <p className="text-sm text-fog">{award.team}</p>
                    )}
                  </div>
                  <div className="bg-gold/10 px-3 py-2">
                    <p className="text-sm font-bold text-gold">{award.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ TOP SCORERS ═══════════ */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="flex items-center gap-3 mb-8">
          <Target className="h-5 w-5 text-pitch" />
          <h2 className="font-display text-3xl tracking-[1px] text-cream">TOP SCORERS</h2>
        </div>

        <div className="border border-line bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">Player</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">G</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-faint uppercase tracking-wider">A</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-faint uppercase tracking-wider hidden sm:table-cell">xG</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-faint uppercase tracking-wider hidden md:table-cell">Mins</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-faint uppercase tracking-wider hidden md:table-cell">Pens</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((p, idx) => {
                  const tHref = teamHref(p.team)
                  return (
                    <tr key={p.name} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-black ${
                            idx === 0 ? 'text-gold' : idx === 1 ? 'text-fog' : idx === 2 ? 'text-amber-600' : 'text-faint'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link href={`/players/${p.playerId}`} className="shrink-0 hover:opacity-90">
                            <PlayerPhoto playerName={p.name} size={40} rounded />
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/players/${p.playerId}`} className="font-bold text-cream hover:text-pitch transition-colors">
                              {p.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {tHref ? (
                                <Link href={tHref} className="hover:opacity-80">
                                  <CountryFlag country={p.team} size={14} />
                                </Link>
                              ) : (
                                <CountryFlag country={p.team} size={14} />
                              )}
                              {tHref ? (
                                <Link href={tHref} className="text-[11px] text-faint hover:text-pitch">
                                  {p.team} · {p.position}
                                </Link>
                              ) : (
                                <p className="text-[11px] text-faint">
                                  {p.team} · {p.position}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className="text-lg font-black text-pitch">{p.goals}</span>
                      </td>
                      <td className="text-center px-3 py-3 font-bold text-cream">{p.assists}</td>
                      <td className="text-center px-3 py-3 text-faint hidden sm:table-cell">{p.xG.toFixed(1)}</td>
                      <td className="text-center px-3 py-3 text-faint hidden md:table-cell">{p.minutes}</td>
                      <td className="text-center px-3 py-3 text-faint hidden md:table-cell">
                        {p.pensMade}/{p.pensAtt}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════ ASSISTS ═══════════ */}
      <section className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="h-5 w-5 text-[#4BB8E8]" />
            <h2 className="font-display text-3xl tracking-[1px] text-cream">TOP ASSIST PROVIDERS</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {topAssisters.map((p, idx) => (
              <Link key={p.name} href={`/players/${p.playerId}`}>
                <div className="border border-line bg-surface p-4 flex items-center gap-3 hover:border-[#4BB8E8]/40 transition-colors h-full">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      idx === 0
                        ? 'bg-gold/20 text-gold'
                        : idx === 1
                          ? 'bg-surface-2 text-fog'
                          : idx === 2
                            ? 'bg-amber-600/20 text-amber-600'
                            : 'bg-surface-2 text-faint'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <PlayerPhoto playerName={p.name} size={36} rounded />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-cream truncate">{p.name}</p>
                    <p className="text-[10px] text-faint flex items-center gap-1">
                      <CountryFlag country={p.team} size={12} />
                      {p.team}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#4BB8E8]">{p.assists}</p>
                    <p className="text-[10px] text-faint">{p.goals}G</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HIGH SCORING MATCHES ═══════════ */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
        <div className="flex items-center gap-3 mb-8">
          <Star className="h-5 w-5 text-orange-400" />
          <h2 className="font-display text-3xl tracking-[1px] text-cream">HIGHEST SCORING MATCHES</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {highScoringMatches.map((m) => {
            const homeHref = teamHref(m.homeTeam)
            const awayHref = teamHref(m.awayTeam)
            return (
              <div key={m.id} className="border border-line bg-surface p-5 space-y-4 hover:border-orange-400/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-faint">
                    <Calendar className="h-3 w-3" />
                    <span>{m.date}</span>
                  </div>
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5">
                    {m.totalGoals} Goals
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  {homeHref ? (
                    <Link href={homeHref} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80">
                      <CountryFlag country={m.homeTeam} size={24} />
                      <span className="text-sm font-bold text-cream truncate">{m.homeTeam}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <CountryFlag country={m.homeTeam} size={24} />
                      <span className="text-sm font-bold text-cream truncate">{m.homeTeam}</span>
                    </div>
                  )}
                  <Link
                    href={`/matches/${m.id}`}
                    className="text-xl font-black text-cream tabular-nums shrink-0 hover:text-pitch transition-colors px-1"
                  >
                    {m.homeScore} - {m.awayScore}
                  </Link>
                  {awayHref ? (
                    <Link href={awayHref} className="flex items-center gap-2 flex-1 min-w-0 justify-end hover:opacity-80">
                      <span className="text-sm font-bold text-cream truncate">{m.awayTeam}</span>
                      <CountryFlag country={m.awayTeam} size={24} />
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-bold text-cream truncate">{m.awayTeam}</span>
                      <CountryFlag country={m.awayTeam} size={24} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-faint min-w-0">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </div>
                  <Link href={`/matches/${m.id}`} className="text-[10px] font-semibold text-pitch uppercase tracking-wider shrink-0">
                    Match →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════ xG ═══════════ */}
      <section className="border-t border-line bg-ink-2">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-3xl tracking-[1px] text-cream">xG LEADERS</h2>
            <span className="text-xs text-faint">(Expected Goals)</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {topXG.map((p) => {
              const diff = p.goals - p.xG
              return (
                <Link key={p.name} href={`/players/${p.playerId}`}>
                  <div className="border border-line bg-surface p-5 space-y-3 hover:border-cyan-500/30 transition-colors h-full">
                    <div className="flex items-center gap-2.5">
                      <PlayerPhoto playerName={p.name} size={40} rounded />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-cream truncate">{p.name}</p>
                        <p className="text-[10px] text-faint flex items-center gap-1">
                          <CountryFlag country={p.team} size={12} />
                          {p.team}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-lg font-black text-pitch">{p.goals}</p>
                        <p className="text-[9px] text-faint uppercase">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-cyan-400">{p.xG.toFixed(1)}</p>
                        <p className="text-[9px] text-faint uppercase">xG</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-black ${diff >= 0 ? 'text-pitch' : 'text-redcard'}`}>
                          {diff > 0 ? '+' : ''}
                          {diff.toFixed(1)}
                        </p>
                        <p className="text-[9px] text-faint uppercase">Diff</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ EXPLORE ═══════════ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-14">
          <h3 className="font-display text-2xl tracking-[1px] text-cream mb-6">EXPLORE MORE</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: '/teams', label: 'Teams', desc: 'National sides and club pages from the archive', icon: Users },
              { href: '/players', label: 'Player Database', desc: 'Explore 680+ player profiles and stats', icon: Shirt },
              { href: '/standings', label: 'League Tables', desc: 'Full group and league standings', icon: Trophy },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="border border-line bg-surface hover:border-pitch/40 p-6 flex items-center gap-4 h-full transition-colors">
                  <link.icon className="h-8 w-8 text-pitch shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-cream">{link.label}</p>
                    <p className="text-xs text-faint">{link.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-faint shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
