import { NextResponse } from 'next/server'
import { loadMatches, loadPlayers, loadTeams } from '@/lib/dataLoader'

export async function GET() {
  const [matches, players, teams] = await Promise.all([
    loadMatches(),
    loadPlayers(),
    loadTeams(),
  ])

  const competitions = Array.from(new Set(matches.map((m) => m.competition))).sort()
  const totalGoals = matches.reduce((sum, m) => sum + m.stats.totalGoals, 0)

  return NextResponse.json({
    totalMatches: matches.length,
    totalTeams: teams.length,
    totalPlayers: players.length,
    competitions,
    averageGoalsPerMatch: Math.round((totalGoals / matches.length) * 100) / 100,
  })
}
