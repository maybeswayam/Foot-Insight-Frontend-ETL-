// API Response Types based on endpoint specifications

export interface SummaryData {
  totalMatches: number
  totalTeams: number
  totalPlayers: number
  competitions: string[]
  averageGoalsPerMatch: number
  /** Present on /api/summary — avoids a full /api/matches round-trip on the homepage. */
  totalGoals?: number
  leagueStats?: {
    competition: string
    goals: number
    matches: number
    avgGoals: number
  }[]
  iconicMatches?: Match[]
}

export interface TeamStats {
  /** Display name (historical field name in this API). */
  teamId: string
  /** Numeric team id for /teams/[id] links when available. */
  id?: string
  goals: number
  shots: number
  shotsOnTarget: number
  shotAccuracy: number
  fouls?: number
  corners?: number
  yellowCards?: number
  redCards?: number
}

export interface Match {
  matchId: string
  competition: string
  season: string
  date: string
  time: string
  homeTeam: TeamStats & { teamId: string }
  awayTeam: TeamStats & { teamId: string }
  stats: {
    goalDifference: number
    totalGoals: number
    result: 'home_win' | 'away_win' | 'draw'
  }
  venue: string
  referee: string
  hasLineup?: boolean
}

export interface AdvancedMatchStats {
  homeXG: number
  awayXG: number
  homePossession: number
  awayPossession: number
  homePassAccuracy: number
  awayPassAccuracy: number
  possessionDelta: number
  xgDifference: number
}

export interface LineupPlayer {
  name: string
  jerseyNumber: number | null
  position: string | null
  isStarter: boolean
  minutesPlayed: number | null
  team: string
  side: 'home' | 'away' | null
  nickname?: string | null
  /** Resolved server-side so the pitch UI never downloads the full players list. */
  playerId?: string | null
}

export interface MatchLineup {
  matchId: number | null
  source: string
  competition: string
  date: string
  homeTeam: string
  awayTeam: string
  playerCount: number
  starterCount: number
  players: LineupPlayer[]
}

export interface MatchDetail extends Match {
  advancedStats: AdvancedMatchStats | null
  lineup: MatchLineup | null
}

export interface PlayerStats {
  games: number
  goals: number
  assists: number
  shots: number
  shotsOnTarget: number
  minutes: number
  passesCompleted: number
  passesAttempted: number
  passAccuracy: number
  tackles: number
  interceptions: number
  touches: number
  xG: number
  xA: number
  // Enriched fields
  yellowCards: number
  redCards: number
  gamesStarted: number
  goalsP90: number
  assistsP90: number
  xGP90: number
  xAP90: number
  pensMade: number
  pensAtt: number
}

export interface PlayerMetrics {
  goalsPerGame: number
  shotEfficiency: number
  goalContributions: number
}

export interface Player {
  playerId: string
  name: string
  teamId: string
  team: string
  club: string | null
  position: string
  age: number
  /** Competition this stats row belongs to (league season or FIFA World Cup). */
  competition?: string
  /** Understat source id for league players (absent on World Cup rows). */
  understatId?: number
  stats: PlayerStats
  metrics: PlayerMetrics
}

export interface PlayerCareerStop {
  season: string
  year: number
  club: string
  league: string
  leagueCode?: string
  country: string
  games: number
  minutes: number
  goals: number
  assists: number
  shots: number
  xG: number
  xA: number
  npg: number
  npxG: number
  keyPasses?: number
  yellowCards?: number
  redCards?: number
  primaryPosition?: string
  xGBuildup?: number
  xGChain?: number
}

export interface PlayerCareerPathSegment {
  club: string
  country: string
  league: string
  fromSeason: string
  toSeason: string
  fromYear: number
  toYear: number
  seasons: number
  goals: number
  assists: number
  games: number
  minutes: number
}

export interface PlayerCareerTotals {
  games: number
  minutes: number
  goals: number
  assists: number
  shots: number
  xG: number
  xA: number
  npg: number
  npxG: number
  goalContributions: number
  keyPasses?: number
  yellowCards?: number
  redCards?: number
  xGBuildup?: number
  xGChain?: number
}

export interface PlayerCareer {
  understatId: number
  name: string
  stops: PlayerCareerStop[]
  path: PlayerCareerPathSegment[]
  clubs: { club: string; country: string; league: string }[]
  countries: string[]
  leagues: string[]
  totals: PlayerCareerTotals
  firstSeason: string
  lastSeason: string
  seasonCount: number
}

export interface PlayerShotEvent {
  id?: string | number
  matchId?: string | number
  /** Local Foot-Insights match id when date+teams join succeeds. */
  localMatchId?: string | null
  minute: number
  x: number
  y: number
  xG: number
  result: string
  situation?: string
  shotType?: string
  lastAction?: string
  assistedBy?: string | null
  side?: string
  homeTeam?: string
  awayTeam?: string
  homeGoals?: number
  awayGoals?: number
  date?: string
}

export interface PlayerShotProfile {
  rank: number
  understatId: number
  seasonStats: {
    games: number
    minutes: number
    goals: number
    assists: number
    shots: number
    xG: number
    xA: number
    goalContributions: number
  }
  shotSummary: {
    shots: number
    goals: number
    totalXG: number
    byResult: Record<string, number>
    byShotType: Record<string, number>
    bySituation: Record<string, number>
  }
  shots: PlayerShotEvent[]
}

/** Full player detail payload (season row + career / competitions / bio). */
export interface PlayerCompetitionSlice {
  playerId: string
  competition: string
  team: string
  club: string | null
  position: string
  goals: number
  assists: number
  games: number
  minutes: number
  shots: number
  xG: number
  xA: number
  goalContributions: number
  goalsP90: number
  assistsP90: number
}

export interface PlayerBio {
  sofifaId: number
  fifaName: string
  age: number | null
  nationality: string
  overall: number | null
  potential: number | null
  club: string
  value: string | null
  valueEuros: number
  wage: string | null
  wageEuros: number
  preferredFoot: string | null
  height: string | null
  bestPosition: string | null
  internationalReputation: number | null
  snapshot: string
}

export interface PlayerDetail extends Player {
  career: PlayerCareer | null
  shotProfile: PlayerShotProfile | null
  /** Same exact name across competitions in this archive (WC + leagues). */
  competitions: PlayerCompetitionSlice[]
  /** FIFA 22 card snapshot (value / wage / nationality). */
  bio: PlayerBio | null
}

export interface TeamStanding {
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

export interface LeagueTableRow {
  position: number
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ('W' | 'D' | 'L')[]
}

// Accolades

export interface PlayerAwardEntry {
  playerId: number
  name: string
  team: string
  teamId: string
  position: string
  value: number
  label: string
}

export interface TeamAwardEntry {
  teamName: string
  value: number
  label: string
}

export interface MatchHighlight {
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

export interface LeagueAccolades {
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

export interface PlayerAwards {
  topScorers: PlayerAwardEntry[]
  topAssists: PlayerAwardEntry[]
  topXG: PlayerAwardEntry[]
  topXA: PlayerAwardEntry[]
  bestPassers: PlayerAwardEntry[]
  bestDefenders: PlayerAwardEntry[]
  mostMinutes: PlayerAwardEntry[]
}

export interface AccoladesData {
  playerAwards: PlayerAwards
  leagueAccolades: LeagueAccolades[]
  competitions: string[]
}
