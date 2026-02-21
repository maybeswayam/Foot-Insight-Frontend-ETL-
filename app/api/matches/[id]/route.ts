import { NextResponse } from 'next/server'
import { loadMatches, loadAdvancedStats, getTeamLookup } from '@/lib/dataLoader'
import type { MatchDetail } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params

  const [rawMatches, advancedMap, teamLookup] = await Promise.all([
    loadMatches(),
    loadAdvancedStats(),
    getTeamLookup(),
  ])

  const raw = rawMatches.find((m) => String(m.matchId) === matchId)
  if (!raw) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const advanced = advancedMap[matchId] ?? null

  const matchDetail: MatchDetail = {
    matchId: String(raw.matchId),
    competition: raw.competition,
    season: raw.season,
    date: raw.date,
    time: raw.time ?? '',
    homeTeam: {
      teamId: teamLookup[raw.homeTeam.teamId] ?? `Team ${raw.homeTeam.teamId}`,
      goals: raw.homeTeam.goals,
      shots: raw.homeTeam.shots,
      shotsOnTarget: raw.homeTeam.shotsOnTarget,
      shotAccuracy: raw.homeTeam.shotAccuracy,
      yellowCards: raw.homeTeam.yellowCards,
      redCards: raw.homeTeam.redCards,
    },
    awayTeam: {
      teamId: teamLookup[raw.awayTeam.teamId] ?? `Team ${raw.awayTeam.teamId}`,
      goals: raw.awayTeam.goals,
      shots: raw.awayTeam.shots,
      shotsOnTarget: raw.awayTeam.shotsOnTarget,
      shotAccuracy: raw.awayTeam.shotAccuracy,
    },
    stats: raw.stats,
    venue: raw.venue ?? 'TBD',
    referee: raw.referee ?? 'Unknown',
    advancedStats: advanced,
  }

  return NextResponse.json(matchDetail)
}
