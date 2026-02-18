'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { apiClient } from '@/lib/api'
import { formatResult } from '@/lib/utils'
import { getMatchInsight, getFactorLabel, getFactorIcon } from '@/lib/matchInsights'
import type { Match } from '@/lib/types'

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all')
  const [selectedResult, setSelectedResult] = useState<string>('all')
  const [competitions, setCompetitions] = useState<string[]>([])
  const [seasons, setSeasons] = useState<string[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('all')

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await apiClient.getMatches()
        setMatches(data)
        setFilteredMatches(data)

        const comps = Array.from(
          new Set(data.map((m) => m.competition))
        ).sort()
        setCompetitions(comps)

        // Normalize and extract unique seasons
        const szns = Array.from(
          new Set(data.map((m) => m.season.replace('2022-2023', '2022-23')))
        ).sort()
        setSeasons(szns)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  useEffect(() => {
    let result = matches
    if (selectedCompetition !== 'all') {
      result = result.filter((m) => m.competition === selectedCompetition)
    }
    if (selectedSeason !== 'all') {
      result = result.filter((m) => m.season.replace('2022-2023', '2022-23') === selectedSeason)
    }
    if (selectedResult !== 'all') {
      result = result.filter((m) => m.stats.result === selectedResult)
    }
    setFilteredMatches(result)
  }, [selectedCompetition, selectedSeason, selectedResult, matches])

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-black text-foreground">Matches</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {filteredMatches.length} of {matches.length} matches
              {selectedCompetition !== 'all' && <span className="text-green-400"> · {selectedCompetition}</span>}
              {selectedResult !== 'all' && <span className="text-green-400"> · {selectedResult === 'home_win' ? 'Home Wins' : selectedResult === 'away_win' ? 'Away Wins' : 'Draws'}</span>}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
          {/* Competition filter */}
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Competition</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCompetition('all')}
                className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                  selectedCompetition === 'all'
                    ? 'bg-green-500 text-slate-900'
                    : 'border border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Competitions
              </button>
              {competitions.map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompetition(comp)}
                  className={`px-4 py-2 rounded-lg font-bold uppercase text-xs transition-all ${
                    selectedCompetition === comp
                      ? 'bg-green-500 text-slate-900'
                      : 'border border-border/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {comp}
                </button>
              ))}
            </div>
          </div>

          {/* Season + Result row */}
          <div className="flex flex-wrap gap-6">
            {/* Season filter */}
            {seasons.length > 1 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Season</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSeason('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase text-xs transition-all ${
                      selectedSeason === 'all'
                        ? 'bg-green-500 text-slate-900'
                        : 'border border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All
                  </button>
                  {seasons.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-3 py-1.5 rounded-lg font-bold uppercase text-xs transition-all ${
                        selectedSeason === s
                          ? 'bg-green-500 text-slate-900'
                          : 'border border-border/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result filter */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Result</p>
              <div className="flex flex-wrap gap-2">
                {[{ key: 'all', label: 'All' }, { key: 'home_win', label: 'Home Win' }, { key: 'away_win', label: 'Away Win' }, { key: 'draw', label: 'Draw' }].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedResult(key)}
                    className={`px-3 py-1.5 rounded-lg font-bold uppercase text-xs transition-all ${
                      selectedResult === key
                        ? 'bg-green-500 text-slate-900'
                        : 'border border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Matches */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No matches found</p>
              </div>
            ) : (
              filteredMatches.map((match) => {
                const insight = getMatchInsight(match)
                const h = match.homeTeam
                const a = match.awayTeam
                const totalShots = h.shots + a.shots || 1

                return (
                  <Link
                    key={match.matchId}
                    href={`/matches/${match.matchId}`}
                    className="group block rounded-xl border border-border/40 bg-card hover:border-green-500/40 transition-all overflow-hidden"
                  >
                    {/* Top strip — competition, narrative, season, date */}
                    <div className="px-5 py-2.5 flex items-center justify-between border-b border-border/20 bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                          {match.competition}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${insight.narrativeColor}`}>
                          {insight.narrative}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/60 bg-secondary/40 px-2 py-0.5 rounded">
                          {match.season.replace('2022-2023', '2022-23')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {match.date}
                        </span>
                      </div>
                    </div>

                    {/* Main body */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* Home team */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <TeamLogo teamName={h.teamId} size={34} />
                          <div className="min-w-0">
                            <p className={`font-bold truncate text-sm ${
                              match.stats.result === 'home_win'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}>
                              {h.teamId}
                            </p>
                          </div>
                        </div>

                        {/* Score block */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-2xl font-black w-7 text-right ${
                            match.stats.result === 'home_win'
                              ? 'text-green-400'
                              : 'text-muted-foreground'
                          }`}>
                            {h.goals}
                          </span>
                          <span className="text-sm text-muted-foreground/50 font-light px-0.5">–</span>
                          <span className={`text-2xl font-black w-7 text-left ${
                            match.stats.result === 'away_win'
                              ? 'text-green-400'
                              : 'text-muted-foreground'
                          }`}>
                            {a.goals}
                          </span>
                        </div>

                        {/* Away team */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                          <div className="min-w-0">
                            <p className={`font-bold truncate text-sm text-right ${
                              match.stats.result === 'away_win'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}>
                              {a.teamId}
                            </p>
                          </div>
                          <TeamLogo teamName={a.teamId} size={34} />
                        </div>
                      </div>

                      {/* Dominance bar + quick stats */}
                      <div className="mt-3 space-y-2">
                        {/* Shot dominance bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-14 text-right tabular-nums">{h.shots} shots</span>
                          <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-secondary/30">
                            <div
                              className="bg-green-500/70 rounded-l-full"
                              style={{ width: `${(h.shots / totalShots) * 100}%` }}
                            />
                            <div
                              className="bg-cyan-500/70 rounded-r-full"
                              style={{ width: `${(a.shots / totalShots) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground w-14 tabular-nums">{a.shots} shots</span>
                        </div>

                        {/* Stat pills */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="tabular-nums">On target: {h.shotsOnTarget}–{a.shotsOnTarget}</span>
                            <span className="hidden sm:inline tabular-nums">Accuracy: {h.shotAccuracy}%–{a.shotAccuracy}%</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span>{getFactorIcon(insight.decidingFactor)}</span>
                            <span className="hidden sm:inline">{getFactorLabel(insight.decidingFactor)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </section>
      </main>
    </>
  )
}
