// API Response Types based on endpoint specifications

export interface SummaryData {
  totalMatches: number
  totalTeams: number
  totalPlayers: number
  competitions: string[]
  averageGoalsPerMatch: number
}

export interface TeamStats {
  teamId: string
  goals: number
  shots: number
  shotsOnTarget: number
  shotAccuracy: number
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

export interface MatchDetail extends Match {
  advancedStats: AdvancedMatchStats | null
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
  stats: PlayerStats
  metrics: PlayerMetrics
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
  homeTeam: string
  awayTeam: string
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
