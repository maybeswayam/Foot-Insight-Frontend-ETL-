import { NextResponse } from 'next/server'
import {
  loadMatches,
  loadAdvancedStats,
  loadMatchLineups,
  loadPlayers,
  getTeamLookup,
} from '@/lib/dataLoader'
import { buildPlayerIdIndex, resolvePlayerId } from '@/lib/playerLookup'
import type { MatchDetail, MatchLineup } from '@/lib/types'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

let matchById: Map<string, Awaited<ReturnType<typeof loadMatches>>[number]> | null = null
let playerIndex: ReturnType<typeof buildPlayerIdIndex> | null = null

async function getMatchById(id: string) {
  if (!matchById) {
    const matches = await loadMatches()
    matchById = new Map(matches.map((m) => [String(m.matchId), m]))
  }
  return matchById.get(id)
}

async function getPlayerIndex() {
  if (playerIndex) return playerIndex
  const players = await loadPlayers()
  playerIndex = buildPlayerIdIndex(
    players.map((p) => ({
      playerId: String(p.playerId),
      name: p.name,
      team: p.team,
      club: p.club ?? null,
      competition: p.competition,
    })),
  )
  return playerIndex
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params

  const [raw, advancedMap, teamLookup, lineups, index] = await Promise.all([
    getMatchById(matchId),
    loadAdvancedStats(),
    getTeamLookup(),
    loadMatchLineups(),
    getPlayerIndex(),
  ])

  if (!raw) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const advanced = advancedMap[matchId] ?? null
  const rawLineup = lineups[matchId]
  const lineup: MatchLineup | null = rawLineup
    ? {
        matchId: rawLineup.matchId,
        source: rawLineup.source,
        competition: rawLineup.competition,
        date: rawLineup.date,
        homeTeam: rawLineup.homeTeam,
        awayTeam: rawLineup.awayTeam,
        playerCount: rawLineup.playerCount,
        starterCount: rawLineup.starterCount,
        players: rawLineup.players.map((p) => ({
          name: p.name,
          jerseyNumber: p.jerseyNumber,
          position: p.position,
          isStarter: p.isStarter,
          minutesPlayed: p.minutesPlayed,
          team: p.team,
          side: p.side,
          nickname: p.nickname ?? null,
          playerId: resolvePlayerId(index, p.name, {
            nickname: p.nickname,
            team: p.team,
          }),
        })),
      }
    : null

  const matchDetail: MatchDetail = {
    matchId: String(raw.matchId),
    competition: raw.competition,
    season: raw.season,
    date: raw.date,
    time: raw.time ?? '',
    homeTeam: {
      teamId: teamLookup[raw.homeTeam.teamId] ?? `Team ${raw.homeTeam.teamId}`,
      id: String(raw.homeTeam.teamId),
      goals: raw.homeTeam.goals,
      shots: raw.homeTeam.shots,
      shotsOnTarget: raw.homeTeam.shotsOnTarget,
      shotAccuracy: raw.homeTeam.shotAccuracy,
      fouls: raw.homeTeam.fouls,
      corners: raw.homeTeam.corners,
      yellowCards: raw.homeTeam.yellowCards,
      redCards: raw.homeTeam.redCards,
    },
    awayTeam: {
      teamId: teamLookup[raw.awayTeam.teamId] ?? `Team ${raw.awayTeam.teamId}`,
      id: String(raw.awayTeam.teamId),
      goals: raw.awayTeam.goals,
      shots: raw.awayTeam.shots,
      shotsOnTarget: raw.awayTeam.shotsOnTarget,
      shotAccuracy: raw.awayTeam.shotAccuracy,
      fouls: raw.awayTeam.fouls,
      corners: raw.awayTeam.corners,
      yellowCards: raw.awayTeam.yellowCards,
      redCards: raw.awayTeam.redCards,
    },
    stats: raw.stats,
    venue: raw.venue ?? 'TBD',
    referee: raw.referee ?? 'Unknown',
    advancedStats: advanced,
    lineup,
    hasLineup: Boolean(lineup?.players?.length),
  }

  return NextResponse.json(matchDetail, {
    headers: { 'Cache-Control': CACHE },
  })
}
