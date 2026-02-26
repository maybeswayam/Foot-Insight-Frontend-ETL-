'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Trophy, Shield, Target, ChevronRight, Star } from 'lucide-react'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'

/* ────────── Types ────────── */

export interface TeamSummary {
  id: string
  name: string
  competition: string
  country: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  cleanSheets: number
  form: ('W' | 'D' | 'L')[]
}

export interface LeagueGroup {
  competition: string
  slug: string
  emoji: string
  color: string
  teams: TeamSummary[]
}

interface Props {
  leagueGroups: LeagueGroup[]
}

/* ────────── Theming ────────── */

const COLOR_MAP: Record<string, {
  gradient: string; border: string; text: string; badge: string
  bgAccent: string; ring: string
}> = {
  purple: {
    gradient: 'from-purple-500/20 via-purple-900/10 to-transparent',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-300',
    bgAccent: 'bg-purple-500/10',
    ring: 'ring-purple-500/40',
  },
  orange: {
    gradient: 'from-orange-500/20 via-orange-900/10 to-transparent',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300',
    bgAccent: 'bg-orange-500/10',
    ring: 'ring-orange-500/40',
  },
  red: {
    gradient: 'from-red-500/20 via-red-900/10 to-transparent',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300',
    bgAccent: 'bg-red-500/10',
    ring: 'ring-red-500/40',
  },
  blue: {
    gradient: 'from-blue-500/20 via-blue-900/10 to-transparent',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
    bgAccent: 'bg-blue-500/10',
    ring: 'ring-blue-500/40',
  },
  sky: {
    gradient: 'from-sky-500/20 via-sky-900/10 to-transparent',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300',
    bgAccent: 'bg-sky-500/10',
    ring: 'ring-sky-500/40',
  },
  amber: {
    gradient: 'from-amber-500/20 via-amber-900/10 to-transparent',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    bgAccent: 'bg-amber-500/10',
    ring: 'ring-amber-500/40',
  },
  green: {
    gradient: 'from-green-500/20 via-green-900/10 to-transparent',
    border: 'border-green-500/30',
    text: 'text-green-400',
    badge: 'bg-green-500/20 text-green-300',
    bgAccent: 'bg-green-500/10',
    ring: 'ring-green-500/40',
  },
}

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const cls = result === 'W'
    ? 'bg-green-500 text-white'
    : result === 'D'
      ? 'bg-yellow-500 text-black'
      : 'bg-red-500 text-white'
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-black ${cls}`}>
      {result}
    </span>
  )
}

/* ────────── Component ────────── */

export default function TeamsPageClient({ leagueGroups }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return leagueGroups
    const q = search.toLowerCase()
    return leagueGroups
      .map((g) => ({
        ...g,
        teams: g.teams.filter(
          (t) => t.name.toLowerCase().includes(q) || t.competition.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.teams.length > 0)
  }, [leagueGroups, search])

  const totalTeams = filtered.reduce((s, g) => s + g.teams.length, 0)

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border/40 bg-gradient-to-b from-green-500/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-400" />
                <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Teams</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {totalTeams} teams across {filtered.length} competitions
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-secondary/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* League Sections */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {filtered.map((group) => {
          const theme = COLOR_MAP[group.color] ?? COLOR_MAP.green
          const champion = group.teams[0]

          return (
            <section key={group.competition}>
              {/* League Header */}
              <div className={`rounded-t-2xl border ${theme.border} bg-gradient-to-r ${theme.gradient} p-5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {group.slug && group.slug !== 'worldcup' ? (
                      <LeagueLogo league={group.slug as any} size={28} />
                    ) : (
                      <span className="text-2xl">{group.emoji}</span>
                    )}
                    <div>
                      <h2 className="text-xl font-black text-foreground tracking-tight">{group.competition}</h2>
                      <p className="text-xs text-muted-foreground font-bold">
                        {group.teams.length} teams · 2022-23 Season
                      </p>
                    </div>
                  </div>
                  {group.slug && (
                    <Link
                      href={group.slug === 'worldcup' ? '/worldcup' : `/leagues/${group.slug}`}
                      className={`flex items-center gap-1 text-xs font-bold ${theme.text} hover:underline`}
                    >
                      View League <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Teams Grid */}
              <div className={`rounded-b-2xl border border-t-0 ${theme.border} bg-card/50 p-4 sm:p-6`}>
                {/* Champion Highlight */}
                {champion && (
                  <Link href={`/teams/${champion.id}`} className="block mb-6">
                    <div className={`sports-card ${theme.border} border p-4 sm:p-5 flex items-center gap-4 group hover:${theme.bgAccent} transition-all cursor-pointer`}>
                      <div className="flex-shrink-0 relative">
                        <TeamLogo teamName={champion.name} size={52} />
                        <Trophy className={`absolute -top-2 -right-2 h-5 w-5 ${theme.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${theme.text}`}>Champions</p>
                          <Star className={`h-3 w-3 ${theme.text}`} />
                        </div>
                        <h3 className="text-lg font-black text-foreground group-hover:text-primary truncate transition-colors">
                          {champion.name}
                        </h3>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className={`text-lg font-black ${theme.text}`}>{champion.points}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">PTS</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{champion.won}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">WON</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{champion.goalsFor}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">GF</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-foreground">{champion.goalDifference > 0 ? '+' : ''}{champion.goalDifference}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">GD</p>
                        </div>
                        <div className="flex gap-0.5">
                          {champion.form.map((r, i) => <FormBadge key={i} result={r} />)}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                )}

                {/* Rest of teams */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.teams.slice(1).map((team, idx) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <div className="sports-card sports-card-hover group h-full p-4 flex items-center gap-3">
                        <div className="flex-shrink-0 relative">
                          <TeamLogo teamName={team.name} size={36} />
                          <span className="absolute -top-1 -left-1 bg-secondary/80 text-[9px] font-black text-muted-foreground rounded-full w-4 h-4 flex items-center justify-center border border-border/40">
                            {idx + 2}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-foreground group-hover:text-primary truncate transition-colors">
                            {team.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-bold ${theme.text}`}>{team.points} pts</span>
                            <span className="text-[10px] text-muted-foreground">
                              {team.won}W {team.drawn}D {team.lost}L
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">
                          {team.form.slice(0, 3).map((r, i) => <FormBadge key={i} result={r} />)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground font-bold">No teams match &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
