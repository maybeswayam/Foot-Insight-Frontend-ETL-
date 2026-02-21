'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { CountryFlag } from '@/components/CountryFlag'
import { KnockoutBracket } from '@/components/KnockoutBracket'
import { apiClient } from '@/lib/api'
import type { TeamStanding, LeagueTableRow } from '@/lib/types'

type Tab = 'league' | 'worldcup'
type WCSubTab = 'groups' | 'knockout'

const LEAGUE_ORDER = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1']

export default function StandingsPage() {
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [leagueTables, setLeagueTables] = useState<Record<string, LeagueTableRow[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('league')
  const [wcSubTab, setWcSubTab] = useState<WCSubTab>('groups')
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [standingsData, tablesData] = await Promise.all([
          apiClient.getStandings(),
          apiClient.getLeagueTables(),
        ])
        setStandings(standingsData)
        setLeagueTables(tablesData)

        // Default selections
        const firstLeague = LEAGUE_ORDER.find((l) => tablesData[l]) ?? Object.keys(tablesData)[0] ?? ''
        setSelectedLeague(firstLeague)

        const groups = Array.from(new Set(standingsData.map((s) => s.group))).sort()
        if (groups.length > 0) setSelectedGroup(groups[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load standings')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  const leagueNames = LEAGUE_ORDER.filter((l) => leagueTables[l])
  const wcGroups = Array.from(new Set(standings.map((s) => s.group))).sort()
  const currentTable = leagueTables[selectedLeague] ?? []
  const currentGroupStandings = standings
    .filter((s) => s.group === selectedGroup)
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-black text-foreground">Standings</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              2022-23 Season · League Tables & World Cup Groups
            </p>
          </div>
        </section>

        {/* Tab toggle */}
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex gap-2 border-b border-border/20 pb-4">
            <button
              onClick={() => setActiveTab('league')}
              className={`px-5 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wide transition-all ${
                activeTab === 'league'
                  ? 'bg-green-500 text-slate-900'
                  : 'border border-border/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              League Tables
            </button>
            <button
              onClick={() => setActiveTab('worldcup')}
              className={`px-5 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wide transition-all ${
                activeTab === 'worldcup'
                  ? 'bg-green-500 text-slate-900'
                  : 'border border-border/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              World Cup Groups
            </button>
          </div>
        </section>

        {/* ─── League Tables ─── */}
        {activeTab === 'league' && (
          <>
            {/* League selector */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {leagueNames.map((league) => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                      selectedLeague === league
                        ? 'bg-green-500 text-slate-900'
                        : 'border border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {league}
                  </button>
                ))}
              </div>
            </section>

            {/* League table */}
            <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
              {currentTable.length > 0 ? (
                <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                  {/* Header row */}
                  <div className="hidden md:grid grid-cols-[40px_minmax(0,1fr)_repeat(7,minmax(0,56px))_minmax(0,200px)] items-center gap-1 px-4 py-3 bg-secondary/30 border-b border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="text-center">#</div>
                    <div className="pl-2">Team</div>
                    <div className="text-center">PL</div>
                    <div className="text-center">W</div>
                    <div className="text-center">D</div>
                    <div className="text-center">L</div>
                    <div className="text-center">+/-</div>
                    <div className="text-center">GD</div>
                    <div className="text-center">PTS</div>
                    <div className="text-center">Form</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-border/10">
                    {currentTable.map((row) => (
                      <LeagueRow key={row.teamId} row={row} totalTeams={currentTable.length} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No standings data available</div>
              )}
            </section>
          </>
        )}

        {/* ─── World Cup ─── */}
        {activeTab === 'worldcup' && (
          <>
            {/* Sub-tab selector: Groups / Knockout */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setWcSubTab('groups')}
                  className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    wcSubTab === 'groups'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Group Stage
                </button>
                <button
                  onClick={() => setWcSubTab('knockout')}
                  className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    wcSubTab === 'knockout'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Knockout Stage
                </button>
              </div>

              {/* Groups sub-tab */}
              {wcSubTab === 'groups' && (
                <>
                  {/* Group selector */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {wcGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => setSelectedGroup(group)}
                        className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                          selectedGroup === group
                            ? 'bg-green-500 text-slate-900'
                            : 'border border-border/40 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Group {group}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Group standings table (when groups sub-tab active) */}
            {wcSubTab === 'groups' && (
              <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
              {currentGroupStandings.length > 0 ? (
                <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-[40px_minmax(0,1fr)_repeat(7,minmax(0,56px))] items-center gap-1 px-4 py-3 bg-secondary/30 border-b border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="text-center">#</div>
                    <div className="pl-2">Team</div>
                    <div className="text-center">PL</div>
                    <div className="text-center">W</div>
                    <div className="text-center">D</div>
                    <div className="text-center">L</div>
                    <div className="text-center">+/-</div>
                    <div className="text-center">GD</div>
                    <div className="text-center">PTS</div>
                  </div>

                  <div className="divide-y divide-border/10">
                    {currentGroupStandings.map((team, idx) => {
                      const pos = idx + 1
                      // Top 2 qualify
                      const barColor = pos <= 2 ? 'bg-green-500' : 'bg-red-500/60'

                      return (
                        <div
                          key={team.teamId}
                          className="relative grid grid-cols-2 md:grid-cols-[40px_minmax(0,1fr)_repeat(7,minmax(0,56px))] items-center gap-1 px-4 py-3 hover:bg-secondary/10 transition-colors"
                        >
                          {/* Position indicator bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barColor}`} />

                          {/* Position */}
                          <div className="hidden md:flex justify-center">
                            <span className="text-sm font-black text-foreground">{pos}</span>
                          </div>

                          {/* Team */}
                          <div className="flex items-center gap-2.5 pl-1 min-w-0">
                            <span className="md:hidden text-sm font-black text-muted-foreground w-5">{pos}</span>
                            <CountryFlag country={team.teamName} size={22} />
                            <span className="text-sm font-bold text-foreground truncate">{team.teamName}</span>
                          </div>

                          {/* Mobile: points only */}
                          <div className="md:hidden flex items-center justify-end">
                            <span className="font-black text-green-400 text-lg">{team.points}</span>
                          </div>

                          {/* Desktop columns */}
                          <div className="hidden md:flex justify-center text-sm text-foreground">{team.played}</div>
                          <div className="hidden md:flex justify-center text-sm font-bold text-green-400">{team.won}</div>
                          <div className="hidden md:flex justify-center text-sm font-bold text-muted-foreground">{team.drawn}</div>
                          <div className="hidden md:flex justify-center text-sm font-bold text-red-400">{team.lost}</div>
                          <div className="hidden md:flex justify-center text-sm text-muted-foreground tabular-nums">
                            {team.goalsFor}-{team.goalsAgainst}
                          </div>
                          <div className={`hidden md:flex justify-center text-sm font-bold tabular-nums ${
                            team.goalDifference > 0 ? 'text-green-400' : team.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'
                          }`}>
                            {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                          </div>
                          <div className="hidden md:flex justify-center">
                            <span className="font-black text-foreground text-base">{team.points}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No standings data available</div>
              )}

              {/* Legend */}
              <div className="flex gap-6 mt-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                  <span>Qualified for Round of 16</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-red-500/60" />
                  <span>Eliminated</span>
                </div>
              </div>
            </section>
            )}

            {/* Knockout bracket (when knockout sub-tab active) */}
            {wcSubTab === 'knockout' && (
              <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <KnockoutBracket />
              </section>
            )}
          </>
        )}
      </main>
    </>
  )
}

/* ────────── League Table Row Component ────────── */

function LeagueRow({ row, totalTeams }: { row: LeagueTableRow; totalTeams: number }) {
  // Position indicator colors (like the screenshot)
  // Top 4: Champions League (blue), 5-6: Europa (orange), Bottom 3: Relegation (red)
  let barColor = 'bg-transparent'
  if (row.position <= 4) barColor = 'bg-blue-500'
  else if (row.position <= 6) barColor = 'bg-orange-500'
  else if (row.position > totalTeams - 3) barColor = 'bg-red-500'

  return (
    <div className="relative grid grid-cols-2 md:grid-cols-[40px_minmax(0,1fr)_repeat(7,minmax(0,56px))_minmax(0,200px)] items-center gap-1 px-4 py-3 hover:bg-secondary/10 transition-colors group">
      {/* Position indicator bar (left edge) */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${barColor}`} />

      {/* Position */}
      <div className="hidden md:flex justify-center">
        <span className="text-sm font-black text-foreground">{row.position}</span>
      </div>

      {/* Team name + logo */}
      <div className="flex items-center gap-2.5 pl-1 min-w-0">
        <span className="md:hidden text-sm font-black text-muted-foreground w-5">{row.position}</span>
        <TeamLogo teamName={row.teamId} size={24} />
        <span className="text-sm font-bold text-foreground truncate">{row.teamId}</span>
      </div>

      {/* Mobile: just points */}
      <div className="md:hidden flex items-center justify-end gap-3">
        <div className="flex gap-0.5">
          {row.form.map((r, i) => (
            <FormBadge key={i} result={r} />
          ))}
        </div>
        <span className="font-black text-green-400 text-lg w-8 text-right">{row.points}</span>
      </div>

      {/* Desktop columns */}
      <div className="hidden md:flex justify-center text-sm text-foreground tabular-nums">{row.played}</div>
      <div className="hidden md:flex justify-center text-sm font-bold text-green-400 tabular-nums">{row.won}</div>
      <div className="hidden md:flex justify-center text-sm font-bold text-muted-foreground tabular-nums">{row.drawn}</div>
      <div className="hidden md:flex justify-center text-sm font-bold text-red-400 tabular-nums">{row.lost}</div>
      <div className="hidden md:flex justify-center text-sm text-muted-foreground tabular-nums">
        {row.goalsFor}-{row.goalsAgainst}
      </div>
      <div className={`hidden md:flex justify-center text-sm font-bold tabular-nums ${
        row.goalDifference > 0 ? 'text-green-400' : row.goalDifference < 0 ? 'text-red-400' : 'text-muted-foreground'
      }`}>
        {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
      </div>
      <div className="hidden md:flex justify-center">
        <span className="font-black text-foreground text-base tabular-nums">{row.points}</span>
      </div>

      {/* Form badges (desktop) */}
      <div className="hidden md:flex justify-center gap-1">
        {row.form.map((r, i) => (
          <FormBadge key={i} result={r} />
        ))}
      </div>
    </div>
  )
}

function FormBadge({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = {
    W: 'bg-green-500 text-white',
    D: 'bg-gray-500 text-white',
    L: 'bg-red-500 text-white',
  }

  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-black ${colors[result]}`}>
      {result}
    </span>
  )
}
