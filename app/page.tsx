'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { apiClient } from '@/lib/api'
import { formatResult } from '@/lib/utils'
import { getMatchInsight, getFactorIcon } from '@/lib/matchInsights'
import type { SummaryData, Match } from '@/lib/types'

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [chartData, setChartData] = useState<{ competition: string; goals: number }[]>([])
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

        // Process matches for competition chart
        const competitionGoals: Record<string, number> = {}
        matchesData.forEach((match) => {
          const totalGoals = match.stats.totalGoals
          competitionGoals[match.competition] =
            (competitionGoals[match.competition] || 0) + totalGoals
        })

        const chartData = Object.entries(competitionGoals)
          .map(([competition, goals]) => ({
            competition,
            goals,
          }))
          .sort((a, b) => b.goals - a.goals)

        setChartData(chartData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
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

  const recentMatches = matches.slice(0, 3)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-background to-background" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                  Live Analytics
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground">
                Football
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-400">
                  Analytics
                </span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Real-time match statistics, advanced analytics, and player performance tracking.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/matches"
                  className="rounded-xl bg-gradient-to-r from-green-500 to-green-400 px-8 py-4 text-sm font-bold text-slate-900 transition-all hover:shadow-lg hover:shadow-green-500/40 hover:scale-105 active:scale-95"
                >
                  View Matches
                </Link>
                <Link
                  href="/standings"
                  className="rounded-xl border-2 border-green-500/30 bg-transparent px-8 py-4 text-sm font-bold text-primary transition-all hover:border-green-500/50 hover:bg-green-500/5"
                >
                  World Cup Standings
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        {summary && (
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="mt-2 text-3xl font-black text-green-400">
                  {summary.totalMatches}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Teams</p>
                <p className="mt-2 text-3xl font-black text-green-400">
                  {summary.totalTeams}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Players</p>
                <p className="mt-2 text-3xl font-black text-green-400">
                  {summary.totalPlayers}
                </p>
              </div>
              <div className="rounded-lg border border-border/40 bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Goals/Match
                </p>
                <p className="mt-2 text-3xl font-black text-green-400">
                  {summary.averageGoalsPerMatch.toFixed(2)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Goals Per Competition Chart */}
        {chartData.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border/40">
            <h2 className="text-2xl font-black text-foreground mb-8">
              Total Goals by Competition
            </h2>
            <div className="rounded-lg border border-border/40 bg-card p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="competition"
                    stroke="rgba(255,255,255,0.7)"
                  />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20, 20, 30, 0.95)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="goals" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Featured Matches Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border/40">
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-foreground">
                Recent Matches
              </h2>
              <p className="text-lg text-muted-foreground">
                Latest results and upcoming fixtures
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recentMatches.map((match) => {
                const insight = getMatchInsight(match)
                const isHomeWin = match.stats.result === 'home_win'
                const isAwayWin = match.stats.result === 'away_win'

                return (
                  <Link
                    key={match.matchId}
                    href={`/matches/${match.matchId}`}
                    className="group rounded-xl border border-border/40 bg-card overflow-hidden hover:border-green-500/40 hover:bg-card/50 transition-all"
                  >
                    {/* Header strip with narrative */}
                    <div className="bg-gradient-to-r from-green-500/15 to-transparent px-5 py-2 flex items-center justify-between border-b border-border/20">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                          {match.competition}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${insight.narrativeColor}`}>
                          {insight.narrative}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {match.date}
                      </span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Home */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <TeamLogo teamName={match.homeTeam.teamId} size={32} />
                          <span className={`font-bold truncate text-sm ${
                            isHomeWin ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {match.homeTeam.teamId}
                          </span>
                        </div>
                        <span className={`text-2xl font-black ${
                          isHomeWin ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {match.homeTeam.goals}
                        </span>
                      </div>

                      {/* Away */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <TeamLogo teamName={match.awayTeam.teamId} size={32} />
                          <span className={`font-bold truncate text-sm ${
                            isAwayWin ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {match.awayTeam.teamId}
                          </span>
                        </div>
                        <span className={`text-2xl font-black ${
                          isAwayWin ? 'text-green-400' : 'text-muted-foreground'
                        }`}>
                          {match.awayTeam.goals}
                        </span>
                      </div>

                      {/* Footer: result + factor + dominance */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/10">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                          match.stats.result === 'draw'
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-green-500/15 text-green-400'
                        }`}>
                          {formatResult(match.stats.result)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" title={`Deciding factor: ${insight.decidingFactor}`}>
                            {getFactorIcon(insight.decidingFactor)}
                          </span>
                          <span className="text-[10px] font-bold text-green-400 tabular-nums">
                            {insight.dominance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 text-green-400 font-bold hover:text-green-400/80 transition-colors uppercase tracking-wide text-sm"
              >
                View All Matches →
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="border-y border-border/40 bg-secondary/20">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Matches', href: '/matches', icon: '⚽', desc: 'All matches' },
                { title: 'Players', href: '/players', icon: '👤', desc: 'Top performers' },
                { title: 'Standings', href: '/standings', icon: '📊', desc: 'Group standings' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-lg border border-border/40 bg-card p-6 hover:border-green-500/40 transition-all text-center"
                >
                  <span className="text-3xl">{link.icon}</span>
                  <h3 className="mt-3 font-black text-foreground group-hover:text-green-400 transition-colors text-lg uppercase tracking-wide">
                    {link.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground font-medium">
                    {link.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
