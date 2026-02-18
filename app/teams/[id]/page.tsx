import { Header } from '@/components/Header'
import { loadTeams, loadPlayers, loadMatches, loadAdvancedStats, getTeamLookup } from '@/lib/dataLoader'
import { TeamDetailClient } from '@/components/TeamDetailClient'
import { buildLeagueTable } from '@/lib/leagueTable'
import type { Match } from '@/lib/types'

interface TeamDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { id } = await params
  const [rawTeams, rawPlayers, rawMatches, advancedStats, teamLookup] = await Promise.all([
    loadTeams(),
    loadPlayers(),
    loadMatches(),
    loadAdvancedStats(),
    getTeamLookup(),
  ])

  const rawTeam = rawTeams.find((t) => String(t.teamId) === id)

  if (!rawTeam) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-black text-foreground">Team not found</h1>
            <p className="text-muted-foreground mt-2">The team you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </main>
      </>
    )
  }

  // Build all typed matches
  const allMatches: Match[] = rawMatches.map((m) => ({
    matchId: String(m.matchId),
    competition: m.competition,
    season: m.season,
    date: m.date,
    time: m.time ?? '',
    homeTeam: { ...m.homeTeam, teamId: teamLookup[m.homeTeam.teamId] ?? String(m.homeTeam.teamId) },
    awayTeam: { ...m.awayTeam, teamId: teamLookup[m.awayTeam.teamId] ?? String(m.awayTeam.teamId) },
    stats: m.stats,
    venue: m.venue ?? '',
    referee: m.referee ?? '',
  }))

  // Filter matches for this team
  const teamMatches = allMatches
    .filter((m) => m.homeTeam.teamId === rawTeam.name || m.awayTeam.teamId === rawTeam.name)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Compute team aggregate stats
  let played = 0, won = 0, drawn = 0, lost = 0
  let goalsFor = 0, goalsAgainst = 0, cleanSheets = 0
  let totalShots = 0, totalSOT = 0, totalFouls = 0, totalCorners = 0
  let yellowCards = 0, redCards = 0
  let homeWins = 0, homePlayed = 0, awayWins = 0, awayPlayed = 0
  let totalXG = 0, totalXGA = 0

  for (const m of teamMatches) {
    played++
    const isHome = m.homeTeam.teamId === rawTeam.name
    const us = isHome ? m.homeTeam : m.awayTeam
    const them = isHome ? m.awayTeam : m.homeTeam

    goalsFor += us.goals
    goalsAgainst += them.goals
    totalShots += us.shots
    totalSOT += us.shotsOnTarget
    totalFouls += (us as any).fouls ?? 0
    totalCorners += (us as any).corners ?? 0
    yellowCards += (us as any).yellowCards ?? 0
    redCards += (us as any).redCards ?? 0

    if (them.goals === 0) cleanSheets++
    if (isHome) homePlayed++
    else awayPlayed++

    if ((isHome && m.stats.result === 'home_win') || (!isHome && m.stats.result === 'away_win')) {
      won++
      if (isHome) homeWins++; else awayWins++
    } else if (m.stats.result === 'draw') {
      drawn++
    } else {
      lost++
    }

    // Advanced stats (xG)
    const adv = advancedStats[m.matchId]
    if (adv) {
      totalXG += isHome ? adv.homeXG : adv.awayXG
      totalXGA += isHome ? adv.awayXG : adv.homeXG
    }
  }

  const teamStats = {
    played, won, drawn, lost,
    goalsFor, goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: won * 3 + drawn,
    cleanSheets,
    totalShots, totalSOT,
    shotAccuracy: totalShots > 0 ? Math.round((totalSOT / totalShots) * 100) : 0,
    yellowCards, redCards,
    totalFouls, totalCorners,
    homeWins, homePlayed,
    awayWins, awayPlayed,
    avgGoals: played > 0 ? (goalsFor / played).toFixed(2) : '0',
    winRate: played > 0 ? Math.round((won / played) * 100) : 0,
    xG: Number(totalXG.toFixed(1)),
    xGA: Number(totalXGA.toFixed(1)),
  }

  // Build form (last 5 matches, most recent first)
  const form: ('W' | 'D' | 'L')[] = teamMatches.slice(0, 5).map((m) => {
    const isHome = m.homeTeam.teamId === rawTeam.name
    if ((isHome && m.stats.result === 'home_win') || (!isHome && m.stats.result === 'away_win')) return 'W'
    if (m.stats.result === 'draw') return 'D'
    return 'L'
  })

  // Recent matches for display (last 10)
  const recentMatches = teamMatches.slice(0, 10).map((m) => {
    const isHome = m.homeTeam.teamId === rawTeam.name
    const result: 'W' | 'D' | 'L' =
      (isHome && m.stats.result === 'home_win') || (!isHome && m.stats.result === 'away_win') ? 'W'
        : m.stats.result === 'draw' ? 'D' : 'L'
    return {
      matchId: m.matchId,
      date: m.date,
      homeTeam: m.homeTeam.teamId,
      awayTeam: m.awayTeam.teamId,
      homeGoals: m.homeTeam.goals,
      awayGoals: m.awayTeam.goals,
      competition: m.competition,
      result,
      isHome,
    }
  })

  // Get players for this team (World Cup players are linked by teamId)
  const teamPlayers = rawPlayers
    .filter((p) => p.teamId === rawTeam.teamId)
    .map((p) => ({
      id: String(p.playerId),
      name: p.name,
      position: p.position,
      age: p.age,
      club: p.club ?? '',
      goals: p.stats.goals,
      assists: p.stats.assists,
      games: p.stats.games,
      minutes: p.stats.minutes,
      shots: p.stats.shots,
      shotsOnTarget: p.stats.shotsOnTarget,
      passAccuracy: p.stats.passAccuracy,
      tackles: p.stats.tackles,
      interceptions: p.stats.interceptions,
      yellowCards: p.stats.yellowCards ?? 0,
      redCards: p.stats.redCards ?? 0,
      xG: p.stats.xG,
      xA: p.stats.xA,
      gamesStarted: p.stats.gamesStarted ?? 0,
    }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.minutes - a.minutes)

  // Build league table position
  // Handle mismatch: teams.json uses "World Cup" but matches.json uses "FIFA World Cup"
  const matchCompetition = rawTeam.competition === 'World Cup' ? 'FIFA World Cup' : rawTeam.competition
  const leagueMatches = allMatches.filter((m) => m.competition === matchCompetition)
  const leagueTable = buildLeagueTable(leagueMatches)
  const leaguePosition = leagueTable.findIndex((r) => r.teamId === rawTeam.name) + 1

  // Find league slug
  const SLUG_MAP: Record<string, string> = {
    'Premier League': 'premier-league',
    'La Liga': 'la-liga',
    'Bundesliga': 'bundesliga',
    'Serie A': 'serie-a',
    'Ligue 1': 'ligue-1',
    'World Cup': 'worldcup',
  }

  const teamData = {
    id: String(rawTeam.teamId),
    name: rawTeam.name,
    competition: rawTeam.competition,
    country: rawTeam.country ?? '',
    type: rawTeam.type,
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <TeamDetailClient
          team={teamData}
          stats={teamStats}
          form={form}
          recentMatches={recentMatches}
          players={teamPlayers}
          leaguePosition={leaguePosition}
          leagueTeamCount={leagueTable.length}
          leagueSlug={SLUG_MAP[rawTeam.competition] ?? ''}
          leagueTable={leagueTable.slice(0, 6)}
        />
      </main>
    </>
  )
}
