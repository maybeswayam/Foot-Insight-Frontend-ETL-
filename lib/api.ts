import type {
  SummaryData,
  Match,
  MatchDetail,
  Player,
  PlayerDetail,
  TeamStanding,
  LeagueTableRow,
  AccoladesData,
} from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  // Prefer network over sticky browser caches. Archive JSON used to be fetched with
  // force-cache, which could forever serve pre-enrichment /api/summary payloads
  // (missing totalGoals / iconicMatches, stale player counts) on Vercel.
  const response = await fetch(url, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const apiClient = {
  // Dashboard
  getSummary: () => fetchAPI<SummaryData>('/api/summary'),

  // Matches
  getMatches: () => fetchAPI<Match[]>('/api/matches'),
  getMatchDetail: (matchId: string) =>
    fetchAPI<MatchDetail>(`/api/matches/${matchId}`),

  // Players
  getPlayers: () => fetchAPI<Player[]>('/api/players'),
  getPlayerDetail: (playerId: string) =>
    fetchAPI<PlayerDetail>(`/api/players/${playerId}`),

  // Standings
  getStandings: () => fetchAPI<TeamStanding[]>('/api/standings'),

  // League Tables (computed from match results)
  getLeagueTables: () => fetchAPI<Record<string, LeagueTableRow[]>>('/api/league-table'),

  // Accolades
  getAccolades: () => fetchAPI<AccoladesData>('/api/accolades'),
}
