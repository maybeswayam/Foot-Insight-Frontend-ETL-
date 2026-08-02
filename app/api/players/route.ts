import { NextResponse } from 'next/server'
import { loadPlayers } from '@/lib/dataLoader'
import type { Player } from '@/lib/types'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

/**
 * Slim list payload — only fields the players browser needs.
 * Full stats live on /api/players/[id].
 */
export async function GET() {
  const rawPlayers = await loadPlayers()

  const players: Player[] = rawPlayers.map((p) => ({
    playerId: String(p.playerId),
    name: p.name,
    teamId: String(p.teamId),
    team: p.team,
    position: p.position,
    age: p.age,
    club: p.club ?? null,
    competition: p.competition,
    understatId: p.understatId,
    stats: {
      games: p.stats.games,
      goals: p.stats.goals,
      assists: p.stats.assists,
      shots: 0,
      shotsOnTarget: 0,
      minutes: p.stats.minutes,
      passesCompleted: 0,
      passesAttempted: 0,
      passAccuracy: 0,
      tackles: 0,
      interceptions: 0,
      touches: 0,
      xG: p.stats.xG,
      xA: p.stats.xA,
      yellowCards: 0,
      redCards: 0,
      gamesStarted: 0,
      goalsP90: 0,
      assistsP90: 0,
      xGP90: 0,
      xAP90: 0,
      pensMade: 0,
      pensAtt: 0,
    },
    metrics: {
      goalsPerGame: p.metrics.goalsPerGame,
      shotEfficiency: 0,
      goalContributions: p.metrics.goalContributions,
    },
  }))

  return NextResponse.json(players, {
    headers: { 'Cache-Control': CACHE },
  })
}
