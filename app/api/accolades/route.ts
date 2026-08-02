import { NextResponse } from 'next/server'
import { loadPlayers, loadMatches, getTeamLookup } from '@/lib/dataLoader'

export const dynamic = 'force-static'

interface PlayerAwardEntry {
  playerId: number
  name: string
  team: string
  teamId: string
  position: string
  value: number
  label: string
}

interface TeamAwardEntry {
  teamName: string
  value: number
  label: string
}

interface MatchHighlight {
  matchId: string
  homeTeam: string
  awayTeam: string
  homeTeamId: string
  awayTeamId: string
  homeGoals: number
  awayGoals: number
  totalGoals: number
  date: string
  venue: string | null
}

interface PlayerAwards {
  topScorers: PlayerAwardEntry[]
  topAssists: PlayerAwardEntry[]
  topXG: PlayerAwardEntry[]
  topXA: PlayerAwardEntry[]
  bestPassers: PlayerAwardEntry[]
  bestDefenders: PlayerAwardEntry[]
  mostMinutes: PlayerAwardEntry[]
}

interface LeagueAccolades {
  competition: string
  matchCount: number
  totalGoals: number
  avgGoalsPerMatch: number
  playerAwards: PlayerAwards
  topScoringTeams: TeamAwardEntry[]
  bestDefense: TeamAwardEntry[]
  mostWins: TeamAwardEntry[]
  highestScoringMatch: MatchHighlight | null
  biggestWin: MatchHighlight | null
}

type RawPlayerRow = Awaited<ReturnType<typeof loadPlayers>>[number]

/** Competition of a stats row — World Cup rows predate the competition field. */
const compOf = (p: RawPlayerRow) => p.competition ?? 'FIFA World Cup'

function buildPlayerAwards(players: RawPlayerRow[]): PlayerAwards {
  const mapPlayer = (
    p: RawPlayerRow,
    value: number,
    label: string,
  ): PlayerAwardEntry => ({
    playerId: p.playerId,
    name: p.name,
    team: p.team,
    teamId: String(p.teamId),
    position: p.position,
    value,
    label,
  })

  const withGames = players.filter((p) => p.stats.games > 0)

  const topScorers = [...withGames]
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 10)
    .map((p) => mapPlayer(p, p.stats.goals, 'goals'))

  const topAssists = [...withGames]
    .sort((a, b) => b.stats.assists - a.stats.assists)
    .slice(0, 10)
    .map((p) => mapPlayer(p, p.stats.assists, 'assists'))

  const topXG = [...withGames]
    .sort((a, b) => b.stats.xG - a.stats.xG)
    .slice(0, 10)
    .map((p) => mapPlayer(p, Math.round(p.stats.xG * 100) / 100, 'xG'))

  const topXA = [...withGames]
    .sort((a, b) => b.stats.xA - a.stats.xA)
    .slice(0, 10)
    .map((p) => mapPlayer(p, Math.round(p.stats.xA * 100) / 100, 'xA'))

  const bestPassers = [...withGames]
    .filter((p) => p.stats.passesAttempted >= 50)
    .sort((a, b) => b.stats.passAccuracy - a.stats.passAccuracy)
    .slice(0, 10)
    .map((p) =>
      mapPlayer(p, Math.round(p.stats.passAccuracy * 10) / 10, '% accuracy'),
    )

  const bestDefenders = [...withGames]
    .sort(
      (a, b) =>
        b.stats.tackles +
        b.stats.interceptions -
        (a.stats.tackles + a.stats.interceptions),
    )
    .slice(0, 10)
    .map((p) =>
      mapPlayer(
        p,
        p.stats.tackles + p.stats.interceptions,
        'tackles + interceptions',
      ),
    )

  const mostMinutes = [...withGames]
    .sort((a, b) => b.stats.minutes - a.stats.minutes)
    .slice(0, 10)
    .map((p) => mapPlayer(p, p.stats.minutes, 'minutes'))

  return { topScorers, topAssists, topXG, topXA, bestPassers, bestDefenders, mostMinutes }
}

export async function GET() {
  try {
    const [players, matches, teamLookup] = await Promise.all([
      loadPlayers(),
      loadMatches(),
      getTeamLookup(),
    ])

    // ─── World Cup Player Awards (WC rows only) ───
    const playerAwards = buildPlayerAwards(
      players.filter((p) => compOf(p) === 'FIFA World Cup'),
    )

    // ─── League-wise Accolades ───
    const competitions = [
      ...new Set(matches.map((m) => m.competition)),
    ].sort()

    const leagueAccolades: LeagueAccolades[] = competitions.map((comp) => {
      const leagueMatches = matches.filter((m) => m.competition === comp)
      const matchCount = leagueMatches.length
      const totalGoals = leagueMatches.reduce(
        (s, m) => s + m.homeTeam.goals + m.awayTeam.goals,
        0,
      )
      const avgGoalsPerMatch =
        matchCount > 0 ? Math.round((totalGoals / matchCount) * 100) / 100 : 0

      // Player leaderboards scoped to THIS competition
      const leaguePlayerAwards = buildPlayerAwards(
        players.filter((p) => compOf(p) === comp),
      )

      // Aggregate per team
      const teamStats: Record<
        string,
        {
          goals: number
          conceded: number
          wins: number
          played: number
        }
      > = {}

      const ensure = (name: string) => {
        if (!teamStats[name])
          teamStats[name] = { goals: 0, conceded: 0, wins: 0, played: 0 }
      }

      for (const m of leagueMatches) {
        const hn = teamLookup[m.homeTeam.teamId] ?? `Team ${m.homeTeam.teamId}`
        const an = teamLookup[m.awayTeam.teamId] ?? `Team ${m.awayTeam.teamId}`
        ensure(hn)
        ensure(an)
        teamStats[hn].goals += m.homeTeam.goals
        teamStats[hn].conceded += m.awayTeam.goals
        teamStats[hn].played++
        teamStats[an].goals += m.awayTeam.goals
        teamStats[an].conceded += m.homeTeam.goals
        teamStats[an].played++
        if (m.stats.result === 'home_win') teamStats[hn].wins++
        if (m.stats.result === 'away_win') teamStats[an].wins++
      }

      const entries = Object.entries(teamStats)

      const topScoringTeams: TeamAwardEntry[] = entries
        .sort((a, b) => b[1].goals - a[1].goals)
        .slice(0, 5)
        .map(([name, s]) => ({ teamName: name, value: s.goals, label: 'goals' }))

      const bestDefense: TeamAwardEntry[] = entries
        .sort((a, b) => a[1].conceded - b[1].conceded)
        .slice(0, 5)
        .map(([name, s]) => ({
          teamName: name,
          value: s.conceded,
          label: 'conceded',
        }))

      const mostWins: TeamAwardEntry[] = entries
        .sort((a, b) => b[1].wins - a[1].wins)
        .slice(0, 5)
        .map(([name, s]) => ({ teamName: name, value: s.wins, label: 'wins' }))

      const toHighlight = (m: (typeof leagueMatches)[0]): MatchHighlight => ({
        matchId: String(m.matchId),
        homeTeam: teamLookup[m.homeTeam.teamId] ?? `Team ${m.homeTeam.teamId}`,
        awayTeam: teamLookup[m.awayTeam.teamId] ?? `Team ${m.awayTeam.teamId}`,
        homeTeamId: String(m.homeTeam.teamId),
        awayTeamId: String(m.awayTeam.teamId),
        homeGoals: m.homeTeam.goals,
        awayGoals: m.awayTeam.goals,
        totalGoals: m.homeTeam.goals + m.awayTeam.goals,
        date: m.date,
        venue: m.venue,
      })

      // Highest scoring match
      const sorted = [...leagueMatches].sort(
        (a, b) =>
          b.homeTeam.goals +
          b.awayTeam.goals -
          (a.homeTeam.goals + a.awayTeam.goals),
      )
      const highestScoringMatch = sorted[0] ? toHighlight(sorted[0]) : null

      // Biggest win (largest goal difference)
      const sortedByDiff = [...leagueMatches].sort(
        (a, b) => b.stats.goalDifference - a.stats.goalDifference,
      )
      const biggestWin = sortedByDiff[0] ? toHighlight(sortedByDiff[0]) : null

      return {
        competition: comp,
        matchCount,
        totalGoals,
        avgGoalsPerMatch,
        playerAwards: leaguePlayerAwards,
        topScoringTeams,
        bestDefense,
        mostWins,
        highestScoringMatch,
        biggestWin,
      }
    })

    return NextResponse.json(
      { playerAwards, leagueAccolades, competitions },
      {
        headers: { 'Cache-Control': 'public, max-age=86400' },
      },
    )
  } catch (err) {
    console.error('Accolades API error:', err)
    return NextResponse.json(
      { error: 'Failed to compute accolades' },
      { status: 500 },
    )
  }
}
