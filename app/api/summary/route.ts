import { NextResponse } from 'next/server'
import { loadMatches, loadPlayers, loadTeams, getTeamLookup } from '@/lib/dataLoader'
import type { Match, SummaryData } from '@/lib/types'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

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

export interface HomeSummary extends SummaryData {
  totalGoals: number
  leagueStats: {
    competition: string
    goals: number
    matches: number
    avgGoals: number
  }[]
  iconicMatches: Match[]
}

export async function GET() {
  const [matches, players, teams, teamLookup] = await Promise.all([
    loadMatches(),
    loadPlayers(),
    loadTeams(),
    getTeamLookup(),
  ])

  const competitions = Array.from(new Set(matches.map((m) => m.competition))).sort()
  const totalGoals = matches.reduce((sum, m) => sum + m.stats.totalGoals, 0)

  const compStats: Record<string, { goals: number; count: number }> = {}
  for (const m of matches) {
    const c = m.competition
    if (!compStats[c]) compStats[c] = { goals: 0, count: 0 }
    compStats[c].goals += m.stats.totalGoals
    compStats[c].count += 1
  }

  const leagueStats = Object.entries(compStats)
    .map(([competition, s]) => ({
      competition,
      goals: s.goals,
      matches: s.count,
      avgGoals: Math.round((s.goals / s.count) * 100) / 100,
    }))
    .sort((a, b) => b.goals - a.goals)

  const byId = new Map(matches.map((m) => [String(m.matchId), m]))

  const iconicMatches: Match[] = ICONIC_MATCH_IDS.flatMap((id) => {
    const m = byId.get(id)
    if (!m) return []
    return [
      {
        matchId: String(m.matchId),
        competition: m.competition,
        season: m.season,
        date: m.date,
        time: m.time ?? '',
        homeTeam: {
          teamId: teamLookup[m.homeTeam.teamId] ?? `Team ${m.homeTeam.teamId}`,
          id: String(m.homeTeam.teamId),
          goals: m.homeTeam.goals,
          shots: m.homeTeam.shots,
          shotsOnTarget: m.homeTeam.shotsOnTarget,
          shotAccuracy: m.homeTeam.shotAccuracy,
          fouls: m.homeTeam.fouls,
          corners: m.homeTeam.corners,
          yellowCards: m.homeTeam.yellowCards,
          redCards: m.homeTeam.redCards,
        },
        awayTeam: {
          teamId: teamLookup[m.awayTeam.teamId] ?? `Team ${m.awayTeam.teamId}`,
          id: String(m.awayTeam.teamId),
          goals: m.awayTeam.goals,
          shots: m.awayTeam.shots,
          shotsOnTarget: m.awayTeam.shotsOnTarget,
          shotAccuracy: m.awayTeam.shotAccuracy,
          fouls: m.awayTeam.fouls,
          corners: m.awayTeam.corners,
          yellowCards: m.awayTeam.yellowCards ?? 0,
          redCards: m.awayTeam.redCards ?? 0,
        },
        stats: m.stats,
        venue: m.venue || '',
        referee: m.referee || '',
      },
    ]
  })

  const body: HomeSummary = {
    totalMatches: matches.length,
    totalTeams: teams.length,
    totalPlayers: players.length,
    competitions,
    averageGoalsPerMatch: Math.round((totalGoals / matches.length) * 100) / 100,
    totalGoals,
    leagueStats,
    iconicMatches,
  }

  return NextResponse.json(body, {
    headers: { 'Cache-Control': CACHE },
  })
}
