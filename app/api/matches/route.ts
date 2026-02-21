import { NextResponse } from 'next/server'
import { loadMatches, getTeamLookup } from '@/lib/dataLoader'
import type { Match } from '@/lib/types'

export async function GET() {
  const [rawMatches, teamLookup] = await Promise.all([
    loadMatches(),
    getTeamLookup(),
  ])

  const matches: Match[] = rawMatches.map((m) => ({
    matchId: String(m.matchId),
    competition: m.competition,
    season: m.season,
    date: m.date,
    time: m.time ?? '',
    homeTeam: {
      teamId: teamLookup[m.homeTeam.teamId] ?? `Team ${m.homeTeam.teamId}`,
      goals: m.homeTeam.goals,
      shots: m.homeTeam.shots,
      shotsOnTarget: m.homeTeam.shotsOnTarget,
      shotAccuracy: m.homeTeam.shotAccuracy,
      yellowCards: m.homeTeam.yellowCards,
      redCards: m.homeTeam.redCards,
    },
    awayTeam: {
      teamId: teamLookup[m.awayTeam.teamId] ?? `Team ${m.awayTeam.teamId}`,
      goals: m.awayTeam.goals,
      shots: m.awayTeam.shots,
      shotsOnTarget: m.awayTeam.shotsOnTarget,
      shotAccuracy: m.awayTeam.shotAccuracy,
      yellowCards: m.awayTeam.yellowCards ?? 0,
      redCards: m.awayTeam.redCards ?? 0,
    },
    stats: m.stats,
    venue: m.venue || '',
    referee: m.referee || '',
  }))

  return NextResponse.json(matches)
}
