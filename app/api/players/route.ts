import { NextResponse } from 'next/server'
import { loadPlayers } from '@/lib/dataLoader'
import type { Player } from '@/lib/types'

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
    stats: {
      games: p.stats.games,
      goals: p.stats.goals,
      assists: p.stats.assists,
      shots: p.stats.shots,
      shotsOnTarget: p.stats.shotsOnTarget,
      minutes: p.stats.minutes,
      passesCompleted: p.stats.passesCompleted,
      passesAttempted: p.stats.passesAttempted,
      passAccuracy: p.stats.passAccuracy,
      tackles: p.stats.tackles,
      interceptions: p.stats.interceptions,
      touches: p.stats.touches,
      xG: p.stats.xG,
      xA: p.stats.xA,
      yellowCards: p.stats.yellowCards ?? 0,
      redCards: p.stats.redCards ?? 0,
      gamesStarted: p.stats.gamesStarted ?? 0,
      goalsP90: p.stats.goalsP90 ?? 0,
      assistsP90: p.stats.assistsP90 ?? 0,
      xGP90: p.stats.xGP90 ?? 0,
      xAP90: p.stats.xAP90 ?? 0,
      pensMade: p.stats.pensMade ?? 0,
      pensAtt: p.stats.pensAtt ?? 0,
    },
    metrics: {
      goalsPerGame: p.metrics.goalsPerGame,
      shotEfficiency: p.metrics.shotEfficiency,
      goalContributions: p.metrics.goalContributions,
    },
  }))

  return NextResponse.json(players)
}
