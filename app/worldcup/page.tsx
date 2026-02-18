import { Header } from '@/components/Header'
import { loadMatches, getTeamLookup, loadPlayers, loadStandings } from '@/lib/dataLoader'
import { WorldCupPageClient } from '@/components/WorldCupPageClient'
import type { WCPlayer, WCStanding, WCMatch, TournamentStats } from '@/components/WorldCupPageClient'

export default async function WorldCupPage() {
  const [rawMatches, teamLookup, rawPlayers, rawStandings] = await Promise.all([
    loadMatches(),
    getTeamLookup(),
    loadPlayers(),
    loadStandings(),
  ])

  // Filter WC matches
  const wcRaw = rawMatches.filter((m) => m.competition === 'FIFA World Cup')

  // Map matches for client
  const wcMatches: WCMatch[] = wcRaw.map((m) => ({
    id: String(m.matchId),
    homeTeam: teamLookup[m.homeTeam.teamId] ?? `Team ${m.homeTeam.teamId}`,
    awayTeam: teamLookup[m.awayTeam.teamId] ?? `Team ${m.awayTeam.teamId}`,
    homeScore: m.homeTeam.goals,
    awayScore: m.awayTeam.goals,
    date: m.date,
    venue: m.venue ?? '',
    totalGoals: m.homeTeam.goals + m.awayTeam.goals,
  }))

  // WC players
  const wcTeamIds = new Set(
    wcRaw.flatMap((m) => [m.homeTeam.teamId, m.awayTeam.teamId])
  )
  const wcPlayers: WCPlayer[] = rawPlayers
    .filter((p) => wcTeamIds.has(p.teamId))
    .map((p) => ({
      name: p.name,
      team: p.team,
      position: p.position,
      goals: p.stats.goals,
      assists: p.stats.assists,
      xG: p.stats.xG,
      xA: p.stats.xA,
      minutes: p.stats.minutes,
      yellowCards: p.stats.yellowCards ?? 0,
      redCards: p.stats.redCards ?? 0,
      pensMade: p.stats.pensMade ?? 0,
      pensAtt: p.stats.pensAtt ?? 0,
      tackles: p.stats.tackles,
      interceptions: p.stats.interceptions,
      passAccuracy: p.stats.passAccuracy,
      age: p.age,
      club: p.club ?? null,
    }))

  // Standings
  const wcStandings: WCStanding[] = rawStandings.map((s) => ({
    teamName: s.teamName,
    group: s.group,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalDifference,
    points: s.points,
  }))

  // Tournament stats
  const totalGoals = wcRaw.reduce((sum, m) => sum + m.homeTeam.goals + m.awayTeam.goals, 0)
  const uniqueVenues = new Set(wcRaw.map((m) => m.venue).filter(Boolean))
  const totalYC = wcRaw.reduce((s, m) => s + (m.homeTeam.yellowCards ?? 0) + (m.awayTeam.yellowCards ?? 0), 0)
  const totalRC = wcRaw.reduce((s, m) => s + (m.homeTeam.redCards ?? 0) + (m.awayTeam.redCards ?? 0), 0)

  const tournamentStats: TournamentStats = {
    totalGoals,
    totalMatches: wcRaw.length,
    avgGoals: wcRaw.length > 0 ? totalGoals / wcRaw.length : 0,
    totalTeams: 32,
    venues: uniqueVenues.size,
    totalPlayers: wcPlayers.length,
    totalYellowCards: totalYC,
    totalRedCards: totalRC,
  }

  return (
    <>
      <Header />
      <WorldCupPageClient
        players={wcPlayers}
        standings={wcStandings}
        matches={wcMatches}
        stats={tournamentStats}
      />
    </>
  )
}
