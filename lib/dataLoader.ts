import { promises as fs } from 'fs'
import path from 'path'

// Cache loaded data in memory (per-process, works for dev and production)
const cache: Record<string, unknown> = {}

async function loadJSON<T>(filename: string): Promise<T> {
  if (cache[filename]) return cache[filename] as T
  const filePath = path.join(process.cwd(), 'data', filename)
  const raw = await fs.readFile(filePath, 'utf-8')
  const data = JSON.parse(raw) as T
  cache[filename] = data
  return data
}

// Raw data shapes from ETL JSON exports

export interface RawTeam {
  teamId: number
  name: string
  type: string
  country: string | null
  competition: string
}

export interface RawTeamStats {
  teamId: number
  goals: number
  shots: number
  shotsOnTarget: number
  shotAccuracy: number
  fouls: number
  corners: number
  yellowCards: number
  redCards: number
}

export interface RawMatch {
  matchId: number
  competition: string
  season: string
  date: string
  time: string | null
  homeTeam: RawTeamStats
  awayTeam: RawTeamStats
  stats: {
    goalDifference: number
    totalGoals: number
    result: 'home_win' | 'away_win' | 'draw'
  }
  venue: string | null
  referee: string | null
}

export interface RawAdvancedStats {
  homeXG: number
  awayXG: number
  homePossession: number
  awayPossession: number
  homePassAccuracy: number
  awayPassAccuracy: number
  possessionDelta: number
  xgDifference: number
}

export interface RawPlayer {
  playerId: number
  name: string
  teamId: number
  team: string
  position: string
  age: number
  club?: string | null
  competition?: string
  understatId?: number
  stats: {
    minutes: number
    games: number
    goals: number
    assists: number
    shots: number
    shotsOnTarget: number
    passesCompleted: number
    passesAttempted: number
    passAccuracy: number
    tackles: number
    interceptions: number
    touches: number
    xG: number
    xA: number
    yellowCards?: number
    redCards?: number
    gamesStarted?: number
    goalsP90?: number
    assistsP90?: number
    xGP90?: number
    xAP90?: number
    pensMade?: number
    pensAtt?: number
  }
  metrics: {
    goalsPerGame: number
    shotEfficiency: number
    goalContributions: number
  }
}

export interface RawStanding {
  teamId: string
  teamName: string
  group: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

// Data loaders
export async function loadMatches(): Promise<RawMatch[]> {
  return loadJSON<RawMatch[]>('matches.json')
}

export async function loadAdvancedStats(): Promise<Record<string, RawAdvancedStats>> {
  return loadJSON<Record<string, RawAdvancedStats>>('match_advanced.json')
}

export interface RawLineupPlayer {
  name: string
  jerseyNumber: number | null
  position: string | null
  isStarter: boolean
  minutesPlayed: number | null
  team: string
  side: 'home' | 'away' | null
  nickname?: string | null
}

export interface RawMatchLineup {
  matchId: number | null
  externalMatchId?: string
  source: string
  competition: string
  date: string
  homeTeam: string
  awayTeam: string
  playerCount: number
  starterCount: number
  players: RawLineupPlayer[]
}

export interface RawMatchLineupsFile {
  meta: Record<string, unknown>
  matches: Record<string, RawMatchLineup>
}

export async function loadMatchLineups(): Promise<Record<string, RawMatchLineup>> {
  try {
    const data = await loadJSON<RawMatchLineupsFile>('match_lineups.json')
    return data.matches ?? {}
  } catch {
    return {}
  }
}

export async function loadPlayers(): Promise<RawPlayer[]> {
  return loadJSON<RawPlayer[]>('players.json')
}

export interface RawPlayerCareersFile {
  meta: Record<string, unknown>
  careers: Record<string, import('./types').PlayerCareer>
}

export async function loadPlayerCareers(): Promise<
  Record<string, import('./types').PlayerCareer>
> {
  try {
    const data = await loadJSON<RawPlayerCareersFile>('player_careers.json')
    return data.careers ?? {}
  } catch {
    return {}
  }
}

export interface RawPlayerShotsFile {
  meta: Record<string, unknown>
  players: Record<string, import('./types').PlayerShotProfile & {
    playerId?: string
    name?: string
    team?: string
    competition?: string
    position?: string
  }>
}

export async function loadPlayerShots(): Promise<RawPlayerShotsFile['players']> {
  try {
    const data = await loadJSON<RawPlayerShotsFile>('player_shots.json')
    return data.players ?? {}
  } catch {
    return {}
  }
}

export interface RawPlayerBiosFile {
  meta: Record<string, unknown>
  bios: Record<string, import('./types').PlayerBio>
}

export async function loadPlayerBios(): Promise<Record<string, import('./types').PlayerBio>> {
  try {
    const data = await loadJSON<RawPlayerBiosFile>('player_bios.json')
    return data.bios ?? {}
  } catch {
    return {}
  }
}

export async function loadStandings(): Promise<RawStanding[]> {
  return loadJSON<RawStanding[]>('standings.json')
}

export async function loadTeams(): Promise<RawTeam[]> {
  return loadJSON<RawTeam[]>('teams.json')
}

// Build a team ID → name lookup
let teamLookupCache: Record<number, string> | null = null

export async function getTeamLookup(): Promise<Record<number, string>> {
  if (teamLookupCache) return teamLookupCache
  const teams = await loadTeams()
  teamLookupCache = {}
  for (const t of teams) {
    teamLookupCache[t.teamId] = t.name
  }
  return teamLookupCache
}
