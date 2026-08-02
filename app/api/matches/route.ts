import { NextResponse } from 'next/server'
import { loadMatches, getTeamLookup } from '@/lib/dataLoader'
import type { Match } from '@/lib/types'

/** Static archive — cache aggressively at the edge. */
const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

export async function GET() {
  const [rawMatches, teamLookup] = await Promise.all([
    loadMatches(),
    getTeamLookup(),
  ])

  // Intentionally skip match_lineups.json (~16MB). hasLineup is only
  // needed on match detail, which loads lineups for a single match.
  const matches: Match[] = rawMatches.map((m) => ({
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
  }))

  return NextResponse.json(matches, {
    headers: { 'Cache-Control': CACHE },
  })
}
