import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { loadMatches, getTeamLookup } from '@/lib/dataLoader'
import { buildLeagueTable } from '@/lib/leagueTable'
import { LeaguePageClient } from '@/components/LeaguePageClient'
import type { LeagueMatchDisplay, LeagueStats, LeagueTeamStats } from '@/components/LeaguePageClient'
import type { Match } from '@/lib/types'

/* ── slug → competition name mapping ── */
const SLUG_MAP: Record<string, string> = {
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'bundesliga': 'Bundesliga',
  'serie-a': 'Serie A',
  'ligue-1': 'Ligue 1',
}

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((slug) => ({ slug }))
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const competition = SLUG_MAP[slug]
  if (!competition) notFound()

  const [rawMatches, teamLookup] = await Promise.all([
    loadMatches(),
    getTeamLookup(),
  ])

  // Convert raw matches to typed matches for this competition
  const compRaw = rawMatches.filter((m) => m.competition === competition)
  if (compRaw.length === 0) notFound()

  const typedMatches: Match[] = compRaw.map((m) => ({
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
      yellowCards: m.homeTeam.yellowCards ?? 0,
      redCards: m.homeTeam.redCards ?? 0,
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

  // Build league table
  const table = buildLeagueTable(typedMatches)

  // Match display list
  const matches: LeagueMatchDisplay[] = typedMatches.map((m) => ({
    id: m.matchId,
    homeTeam: m.homeTeam.teamId,
    awayTeam: m.awayTeam.teamId,
    homeScore: m.homeTeam.goals,
    awayScore: m.awayTeam.goals,
    date: m.date,
    venue: m.venue,
    totalGoals: m.stats.totalGoals,
    result: m.stats.result,
  }))

  // Compute team-level aggregations
  const teamAgg: Record<string, { gf: number; ga: number; wins: number; draws: number; losses: number; shots: number; sot: number; yc: number; rc: number }> = {}
  for (const m of typedMatches) {
    const hId = m.homeTeam.teamId
    const aId = m.awayTeam.teamId
    if (!teamAgg[hId]) teamAgg[hId] = { gf: 0, ga: 0, wins: 0, draws: 0, losses: 0, shots: 0, sot: 0, yc: 0, rc: 0 }
    if (!teamAgg[aId]) teamAgg[aId] = { gf: 0, ga: 0, wins: 0, draws: 0, losses: 0, shots: 0, sot: 0, yc: 0, rc: 0 }

    teamAgg[hId].gf += m.homeTeam.goals
    teamAgg[hId].ga += m.awayTeam.goals
    teamAgg[hId].shots += m.homeTeam.shots
    teamAgg[hId].sot += m.homeTeam.shotsOnTarget
    teamAgg[hId].yc += m.homeTeam.yellowCards ?? 0
    teamAgg[hId].rc += m.homeTeam.redCards ?? 0

    teamAgg[aId].gf += m.awayTeam.goals
    teamAgg[aId].ga += m.homeTeam.goals
    teamAgg[aId].shots += m.awayTeam.shots
    teamAgg[aId].sot += m.awayTeam.shotsOnTarget
    teamAgg[aId].yc += m.awayTeam.yellowCards ?? 0
    teamAgg[aId].rc += m.awayTeam.redCards ?? 0

    if (m.stats.result === 'home_win') {
      teamAgg[hId].wins++
      teamAgg[aId].losses++
    } else if (m.stats.result === 'away_win') {
      teamAgg[aId].wins++
      teamAgg[hId].losses++
    } else {
      teamAgg[hId].draws++
      teamAgg[aId].draws++
    }
  }

  // Top scoring teams, best defense, etc.
  const teamStats: LeagueTeamStats[] = Object.entries(teamAgg)
    .map(([name, s]) => ({
      name,
      goalsFor: s.gf,
      goalsAgainst: s.ga,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      shots: s.shots,
      shotsOnTarget: s.sot,
      yellowCards: s.yc,
      redCards: s.rc,
    }))
    .sort((a, b) => b.goalsFor - a.goalsFor)

  // Tournament stats
  const totalGoals = typedMatches.reduce((s, m) => s + m.stats.totalGoals, 0)
  const totalYC = typedMatches.reduce((s, m) => s + (m.homeTeam.yellowCards ?? 0) + (m.awayTeam.yellowCards ?? 0), 0)
  const totalRC = typedMatches.reduce((s, m) => s + (m.homeTeam.redCards ?? 0) + (m.awayTeam.redCards ?? 0), 0)
  const totalShots = typedMatches.reduce((s, m) => s + m.homeTeam.shots + m.awayTeam.shots, 0)
  const homeWins = typedMatches.filter((m) => m.stats.result === 'home_win').length
  const awayWins = typedMatches.filter((m) => m.stats.result === 'away_win').length
  const draws = typedMatches.filter((m) => m.stats.result === 'draw').length

  const leagueStats: LeagueStats = {
    totalGoals,
    totalMatches: typedMatches.length,
    avgGoals: typedMatches.length > 0 ? totalGoals / typedMatches.length : 0,
    totalTeams: Object.keys(teamAgg).length,
    totalYellowCards: totalYC,
    totalRedCards: totalRC,
    totalShots,
    homeWins,
    awayWins,
    draws,
    season: compRaw[0]?.season ?? '2022-23',
  }

  return (
    <>
      <Header />
      <LeaguePageClient
        slug={slug}
        competition={competition}
        table={table}
        matches={matches}
        teamStats={teamStats}
        stats={leagueStats}
      />
    </>
  )
}
