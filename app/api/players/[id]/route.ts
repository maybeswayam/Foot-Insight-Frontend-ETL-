import { NextResponse } from 'next/server'
import { loadPlayers } from '@/lib/dataLoader'
import type { Player } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params
  const rawPlayers = await loadPlayers()

  const raw = rawPlayers.find((p) => String(p.playerId) === playerId)
  if (!raw) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const player: Player = {
    playerId: String(raw.playerId),
    name: raw.name,
    teamId: String(raw.teamId),
    team: raw.team,
    position: raw.position,
    age: raw.age,
    club: raw.club ?? null,
    stats: {
      games: raw.stats.games,
      goals: raw.stats.goals,
      assists: raw.stats.assists,
      shots: raw.stats.shots,
      shotsOnTarget: raw.stats.shotsOnTarget,
      minutes: raw.stats.minutes,
      passesCompleted: raw.stats.passesCompleted,
      passesAttempted: raw.stats.passesAttempted,
      passAccuracy: raw.stats.passAccuracy,
      tackles: raw.stats.tackles,
      interceptions: raw.stats.interceptions,
      touches: raw.stats.touches,
      xG: raw.stats.xG,
      xA: raw.stats.xA,
      yellowCards: raw.stats.yellowCards ?? 0,
      redCards: raw.stats.redCards ?? 0,
      gamesStarted: raw.stats.gamesStarted ?? 0,
      goalsP90: raw.stats.goalsP90 ?? 0,
      assistsP90: raw.stats.assistsP90 ?? 0,
      xGP90: raw.stats.xGP90 ?? 0,
      xAP90: raw.stats.xAP90 ?? 0,
      pensMade: raw.stats.pensMade ?? 0,
      pensAtt: raw.stats.pensAtt ?? 0,
    },
    metrics: {
      goalsPerGame: raw.metrics.goalsPerGame,
      shotEfficiency: raw.metrics.shotEfficiency,
      goalContributions: raw.metrics.goalContributions,
    },
  }

  return NextResponse.json(player)
}
