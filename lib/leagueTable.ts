import type { Match } from './types'

export interface LeagueTableRow {
  position: number
  teamId: string       // team name (used as display id)
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ('W' | 'D' | 'L')[]  // last 5 results, most recent first
}

/**
 * Build a league table from a list of matches belonging to a single competition.
 * Returns rows sorted by points → GD → GF (standard tiebreak).
 */
export function buildLeagueTable(matches: Match[]): LeagueTableRow[] {
  const teams: Record<string, {
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
    results: { date: string; result: 'W' | 'D' | 'L' }[]
  }> = {}

  const ensure = (id: string) => {
    if (!teams[id]) {
      teams[id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, results: [] }
    }
  }

  // Sort matches by date to build chronological form
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date))

  for (const m of sorted) {
    const home = m.homeTeam.teamId
    const away = m.awayTeam.teamId
    ensure(home)
    ensure(away)

    const h = teams[home]
    const a = teams[away]

    h.played++
    a.played++
    h.goalsFor += m.homeTeam.goals
    h.goalsAgainst += m.awayTeam.goals
    a.goalsFor += m.awayTeam.goals
    a.goalsAgainst += m.homeTeam.goals

    if (m.stats.result === 'home_win') {
      h.won++; h.points += 3; h.results.push({ date: m.date, result: 'W' })
      a.lost++; a.results.push({ date: m.date, result: 'L' })
    } else if (m.stats.result === 'away_win') {
      a.won++; a.points += 3; a.results.push({ date: m.date, result: 'W' })
      h.lost++; h.results.push({ date: m.date, result: 'L' })
    } else {
      h.drawn++; h.points += 1; h.results.push({ date: m.date, result: 'D' })
      a.drawn++; a.points += 1; a.results.push({ date: m.date, result: 'D' })
    }
  }

  const rows: LeagueTableRow[] = Object.entries(teams).map(([teamId, t]) => ({
    position: 0,
    teamId,
    played: t.played,
    won: t.won,
    drawn: t.drawn,
    lost: t.lost,
    goalsFor: t.goalsFor,
    goalsAgainst: t.goalsAgainst,
    goalDifference: t.goalsFor - t.goalsAgainst,
    points: t.points,
    form: t.results.slice(-5).reverse().map(r => r.result), // last 5, most recent first
  }))

  // Sort: points desc → GD desc → GF desc → alphabetical
  rows.sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.teamId.localeCompare(b.teamId)
  )

  rows.forEach((r, i) => { r.position = i + 1 })

  return rows
}
