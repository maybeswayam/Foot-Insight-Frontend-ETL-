import { Header } from '@/components/Header'
import { loadTeams, loadMatches, getTeamLookup } from '@/lib/dataLoader'
import TeamsPageClient from '@/components/TeamsPageClient'
import type { Match } from '@/lib/types'

const LEAGUE_ORDER = [
  'Premier League',
  'La Liga',
  'Bundesliga',
  'Serie A',
  'Ligue 1',
  'World Cup',
] as const

const LEAGUE_META: Record<string, { slug: string; emoji: string; color: string }> = {
  'Premier League':  { slug: 'premier-league', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: 'purple' },
  'La Liga':         { slug: 'la-liga',        emoji: '🇪🇸',  color: 'orange' },
  'Bundesliga':      { slug: 'bundesliga',     emoji: '🇩🇪',  color: 'red' },
  'Serie A':         { slug: 'serie-a',        emoji: '🇮🇹',  color: 'blue' },
  'Ligue 1':         { slug: 'ligue-1',        emoji: '🇫🇷',  color: 'sky' },
  'World Cup':       { slug: 'worldcup',       emoji: '🏆',   color: 'amber' },
}

export default async function TeamsPage() {
  const [rawTeams, rawMatches, teamLookup] = await Promise.all([
    loadTeams(),
    loadMatches(),
    getTeamLookup(),
  ])

  // Build typed matches
  const matches: Match[] = rawMatches.map((m) => ({
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

  // Compute per-team aggregated stats from matches
  const teamAgg: Record<string, {
    played: number; won: number; drawn: number; lost: number
    goalsFor: number; goalsAgainst: number; points: number
    cleanSheets: number
    form: ('W' | 'D' | 'L')[]
  }> = {}

  const ensure = (name: string) => {
    if (!teamAgg[name]) {
      teamAgg[name] = {
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
        cleanSheets: 0, form: [],
      }
    }
  }

  const sortedMatches = [...matches].sort((a, b) => a.date.localeCompare(b.date))

  for (const m of sortedMatches) {
    const hn = m.homeTeam.teamId
    const an = m.awayTeam.teamId
    ensure(hn); ensure(an)

    const h = teamAgg[hn]
    const a = teamAgg[an]

    h.played++; a.played++
    h.goalsFor += m.homeTeam.goals; h.goalsAgainst += m.awayTeam.goals
    a.goalsFor += m.awayTeam.goals; a.goalsAgainst += m.homeTeam.goals

    if (m.awayTeam.goals === 0) h.cleanSheets++
    if (m.homeTeam.goals === 0) a.cleanSheets++

    if (m.stats.result === 'home_win') {
      h.won++; h.points += 3; h.form.push('W')
      a.lost++; a.form.push('L')
    } else if (m.stats.result === 'away_win') {
      a.won++; a.points += 3; a.form.push('W')
      h.lost++; h.form.push('L')
    } else {
      h.drawn++; h.points += 1; h.form.push('D')
      a.drawn++; a.points += 1; a.form.push('D')
    }
  }

  // Build team list grouped by league
  const leagueGroups = LEAGUE_ORDER.map((comp) => {
    const leagueTeams = rawTeams
      .filter((t) => t.competition === comp)
      .map((t) => {
        const s = teamAgg[t.name]
        return {
          id: String(t.teamId),
          name: t.name,
          competition: t.competition,
          country: t.country ?? '',
          played: s?.played ?? 0,
          won: s?.won ?? 0,
          drawn: s?.drawn ?? 0,
          lost: s?.lost ?? 0,
          goalsFor: s?.goalsFor ?? 0,
          goalsAgainst: s?.goalsAgainst ?? 0,
          goalDifference: (s?.goalsFor ?? 0) - (s?.goalsAgainst ?? 0),
          points: s?.points ?? 0,
          cleanSheets: s?.cleanSheets ?? 0,
          form: (s?.form ?? []).slice(-5).reverse() as ('W' | 'D' | 'L')[],
        }
      })
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)

    const meta = LEAGUE_META[comp] ?? { slug: '', emoji: '⚽', color: 'green' }

    return {
      competition: comp,
      slug: meta.slug,
      emoji: meta.emoji,
      color: meta.color,
      teams: leagueTeams,
    }
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <TeamsPageClient leagueGroups={leagueGroups} />
      </main>
    </>
  )
}
