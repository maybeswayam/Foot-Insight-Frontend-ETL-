import { NextResponse } from 'next/server'
import {
  getTeamLookup,
  loadMatches,
  loadPlayerBios,
  loadPlayerCareers,
  loadPlayers,
  loadPlayerShots,
} from '@/lib/dataLoader'
import { attachLocalMatchIds, buildMatchJoinIndex } from '@/lib/shotMatchJoin'
import type {
  PlayerBio,
  PlayerCompetitionSlice,
  PlayerDetail,
  PlayerShotProfile,
} from '@/lib/types'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: playerId } = await params
  const [rawPlayers, careers, shotsMap, bios, rawMatches, teamLookup] = await Promise.all([
    loadPlayers(),
    loadPlayerCareers(),
    loadPlayerShots(),
    loadPlayerBios(),
    loadMatches(),
    getTeamLookup(),
  ])

  const raw = rawPlayers.find((p) => String(p.playerId) === playerId)
  if (!raw) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const sameName = rawPlayers.filter((p) => p.name === raw.name)
  const competitions: PlayerCompetitionSlice[] = sameName.map((p) => ({
    playerId: String(p.playerId),
    competition: p.competition || 'Unknown',
    team: p.team,
    club: p.club ?? null,
    position: p.position,
    goals: p.stats.goals,
    assists: p.stats.assists,
    games: p.stats.games,
    minutes: p.stats.minutes,
    shots: p.stats.shots,
    xG: p.stats.xG,
    xA: p.stats.xA,
    goalContributions: p.metrics.goalContributions,
    goalsP90: p.stats.goalsP90 ?? 0,
    assistsP90: p.stats.assistsP90 ?? 0,
  }))

  const understatId =
    raw.understatId ??
    sameName.find((p) => p.understatId != null)?.understatId

  const career =
    understatId != null ? careers[String(understatId)] ?? null : null

  let shotProfile: PlayerShotProfile | null = null
  if (understatId != null && shotsMap[String(understatId)]) {
    const s = shotsMap[String(understatId)]
    const matchIndex = buildMatchJoinIndex(rawMatches, teamLookup)
    shotProfile = {
      rank: s.rank,
      understatId: s.understatId,
      seasonStats: s.seasonStats,
      shotSummary: s.shotSummary,
      shots: attachLocalMatchIds(s.shots, matchIndex),
    }
  }

  const bio: PlayerBio | null = bios[raw.name]
    ? {
        sofifaId: bios[raw.name].sofifaId,
        fifaName: bios[raw.name].fifaName,
        age: bios[raw.name].age,
        nationality: bios[raw.name].nationality,
        overall: bios[raw.name].overall,
        potential: bios[raw.name].potential,
        club: bios[raw.name].club,
        value: bios[raw.name].value,
        valueEuros: bios[raw.name].valueEuros,
        wage: bios[raw.name].wage,
        wageEuros: bios[raw.name].wageEuros,
        preferredFoot: bios[raw.name].preferredFoot,
        height: bios[raw.name].height,
        bestPosition: bios[raw.name].bestPosition,
        internationalReputation: bios[raw.name].internationalReputation,
        snapshot: bios[raw.name].snapshot,
      }
    : null

  const player: PlayerDetail = {
    playerId: String(raw.playerId),
    name: raw.name,
    teamId: String(raw.teamId),
    team: raw.team,
    position: raw.position,
    age: raw.age || bio?.age || 0,
    club: raw.club ?? null,
    competition: raw.competition,
    understatId: raw.understatId,
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
    career,
    shotProfile,
    competitions,
    bio,
  }

  return NextResponse.json(player, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
