/**
 * Extract 2022–23 Big 5 league player stats from Understat CSV
 * and merge with existing World Cup players into data/players.json.
 *
 * Usage: node scripts/extract_understat_players.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const CSV_PATH = path.join(ROOT, 'REf', 'understat_players_aggregated_2014_2024.csv')
const TEAMS_PATH = path.join(ROOT, 'data', 'teams.json')
const PLAYERS_PATH = path.join(ROOT, 'data', 'players.json')
const UNMATCHED_PATH = path.join(__dirname, 'unmatched_clubs.txt')

const BIG5 = new Set(['EPL', 'La_Liga', 'Bundesliga', 'Serie_A', 'Ligue_1'])
const TARGET_YEAR = '2022'
const PLAYER_ID_OFFSET = 10000

const LEAGUE_TO_COMPETITION = {
  EPL: 'Premier League',
  La_Liga: 'La Liga',
  Bundesliga: 'Bundesliga',
  Serie_A: 'Serie A',
  Ligue_1: 'Ligue 1',
}

const POSITION_MAP = {
  GK: 'GK',
  D: 'DF',
  M: 'MF',
  F: 'FW',
  S: 'FW',
}

/** Understat team_title → our teams.json name */
const CLUB_ALIASES = {
  'AC Milan': 'Milan',
  'Athletic Club': 'Ath Bilbao',
  'Atletico Madrid': 'Ath Madrid',
  'Bayer Leverkusen': 'Leverkusen',
  'Borussia Dortmund': 'Dortmund',
  'Borussia M.Gladbach': "M'gladbach",
  'Celta Vigo': 'Celta',
  'Clermont Foot': 'Clermont',
  'Eintracht Frankfurt': 'Ein Frankfurt',
  Espanyol: 'Espanol',
  'FC Cologne': 'FC Koln',
  'Mainz 05': 'Mainz',
  'Manchester City': 'Man City',
  'Manchester United': 'Man United',
  'Newcastle United': 'Newcastle',
  'Nottingham Forest': "Nott'm Forest",
  'Paris Saint Germain': 'Paris SG',
  'RasenBallsport Leipzig': 'RB Leipzig',
  'Rayo Vallecano': 'Vallecano',
  'Real Betis': 'Betis',
  'Real Sociedad': 'Sociedad',
  'Real Valladolid': 'Valladolid',
  'VfB Stuttgart': 'Stuttgart',
  'Wolverhampton Wanderers': 'Wolves',
  // Identity aliases (same spelling)
  Ajaccio: 'Ajaccio',
  Almeria: 'Almeria',
  Angers: 'Angers',
  Arsenal: 'Arsenal',
  'Aston Villa': 'Aston Villa',
  Atalanta: 'Atalanta',
  Augsburg: 'Augsburg',
  Auxerre: 'Auxerre',
  Barcelona: 'Barcelona',
  'Bayern Munich': 'Bayern Munich',
  Bochum: 'Bochum',
  Bologna: 'Bologna',
  Bournemouth: 'Bournemouth',
  Brentford: 'Brentford',
  Brest: 'Brest',
  Brighton: 'Brighton',
  Cadiz: 'Cadiz',
  Chelsea: 'Chelsea',
  Cremonese: 'Cremonese',
  'Crystal Palace': 'Crystal Palace',
  Elche: 'Elche',
  Empoli: 'Empoli',
  Everton: 'Everton',
  Fiorentina: 'Fiorentina',
  Freiburg: 'Freiburg',
  Fulham: 'Fulham',
  Getafe: 'Getafe',
  Girona: 'Girona',
  Hoffenheim: 'Hoffenheim',
  Inter: 'Inter',
  Juventus: 'Juventus',
  Lazio: 'Lazio',
  Lecce: 'Lecce',
  Leeds: 'Leeds',
  Leicester: 'Leicester',
  Lens: 'Lens',
  Lille: 'Lille',
  Liverpool: 'Liverpool',
  Lorient: 'Lorient',
  Lyon: 'Lyon',
  Mallorca: 'Mallorca',
  Marseille: 'Marseille',
  Monaco: 'Monaco',
  Montpellier: 'Montpellier',
  Monza: 'Monza',
  Nantes: 'Nantes',
  Napoli: 'Napoli',
  Nice: 'Nice',
  Osasuna: 'Osasuna',
  'Real Madrid': 'Real Madrid',
  Reims: 'Reims',
  Rennes: 'Rennes',
  Roma: 'Roma',
  Salernitana: 'Salernitana',
  Sampdoria: 'Sampdoria',
  Sassuolo: 'Sassuolo',
  Sevilla: 'Sevilla',
  Southampton: 'Southampton',
  Spezia: 'Spezia',
  Strasbourg: 'Strasbourg',
  Torino: 'Torino',
  Tottenham: 'Tottenham',
  Toulouse: 'Toulouse',
  Troyes: 'Troyes',
  Udinese: 'Udinese',
  'Union Berlin': 'Union Berlin',
  Valencia: 'Valencia',
  Verona: 'Verona',
  Villarreal: 'Villarreal',
  'Werder Bremen': 'Werder Bremen',
  'West Ham': 'West Ham',
  Wolfsburg: 'Wolfsburg',
}

function parseCSV(content) {
  const rows = []
  let i = 0
  const len = content.length

  function readField() {
    if (content[i] === '"') {
      i++
      let field = ''
      while (i < len) {
        if (content[i] === '"') {
          i++
          if (content[i] === '"') {
            field += '"'
            i++
          } else break
        } else {
          field += content[i++]
        }
      }
      if (content[i] === ',') i++
      return field
    }
    let field = ''
    while (i < len && content[i] !== ',' && content[i] !== '\n' && content[i] !== '\r') {
      field += content[i++]
    }
    if (content[i] === ',') i++
    return field
  }

  function readRow() {
    if (i >= len) return null
    if (content[i] === '\r') i++
    if (content[i] === '\n') i++
    if (i >= len) return null
    const row = []
    while (i < len && content[i] !== '\n' && content[i] !== '\r') {
      row.push(readField())
    }
    return row
  }

  const header = readRow()
  if (!header) return []
  let row
  while ((row = readRow())) {
    if (row.length === 1 && row[0] === '') continue
    const obj = {}
    header.forEach((h, idx) => {
      obj[h] = row[idx] ?? ''
    })
    rows.push(obj)
  }
  return rows
}

function num(v, decimals = null) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  if (decimals == null) return n
  return Math.round(n * 10 ** decimals) / 10 ** decimals
}

function per90(value, minutes) {
  if (!minutes) return 0
  return num((value * 90) / minutes, 2)
}

function mapPosition(primary) {
  return POSITION_MAP[primary] || 'MF'
}

function buildTeamLookup(teams) {
  const byName = new Map()
  for (const t of teams) {
    if (t.competition === 'World Cup') continue
    byName.set(t.name, t)
  }
  return byName
}

function resolveClub(teamTitle, teamByName) {
  const mappedName = CLUB_ALIASES[teamTitle] || teamTitle
  return teamByName.get(mappedName) || null
}

/**
 * Expand a CSV row into one or more club-specific rows.
 * - Prefer clean single-club titles.
 * - Skip comma-joined titles (dirty aggregates); separate multi-club
 *   rows for the same player id are kept individually.
 */
function expandClubRows(row) {
  const title = (row.team_title || '').trim()
  if (!title) return []
  if (title.includes(',')) {
    return [] // skip dirty comma-joined aggregates
  }
  return [{ ...row, team_title: title }]
}

function toLeaguePlayer(row, team, competition, playerId) {
  const games = num(row.games)
  const minutes = num(row.time)
  const goals = num(row.goals)
  const assists = num(row.assists)
  const shots = num(row.shots)
  const xG = num(row.xG, 2)
  const xA = num(row.xA, 2)

  return {
    playerId,
    name: row.player_name,
    teamId: team.teamId,
    team: team.name,
    club: team.name,
    position: mapPosition(row.primary_position),
    age: 0,
    competition,
    understatId: num(row.id),
    stats: {
      minutes,
      games,
      goals,
      assists,
      shots,
      shotsOnTarget: 0,
      passesCompleted: 0,
      passesAttempted: 0,
      passAccuracy: 0,
      tackles: 0,
      interceptions: 0,
      touches: 0,
      xG,
      xA,
      yellowCards: num(row.yellow_cards),
      redCards: num(row.red_cards),
      gamesStarted: 0,
      goalsP90: per90(goals, minutes),
      assistsP90: per90(assists, minutes),
      xGP90: per90(xG, minutes),
      xAP90: per90(xA, minutes),
      pensMade: 0,
      pensAtt: 0,
    },
    metrics: {
      goalsPerGame: games ? num(goals / games, 3) : 0,
      shotEfficiency: shots ? num(goals / shots, 3) : 0,
      goalContributions: goals + assists,
    },
  }
}

function isWorldCupPlayer(p) {
  if (p.competition === 'FIFA World Cup') return true
  if (p.understatId != null) return false
  const id = Number(p.playerId)
  return Number.isFinite(id) && id < PLAYER_ID_OFFSET
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found:', CSV_PATH)
    process.exit(1)
  }

  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8')
  const allRows = parseCSV(csvRaw)
  const teams = JSON.parse(fs.readFileSync(TEAMS_PATH, 'utf8'))
  const existingPlayers = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'))
  const teamByName = buildTeamLookup(teams)

  let filtered = 0
  let skippedCombo = 0
  let skippedMinutes = 0
  let unmatchedRows = 0
  const unmatchedCounts = new Map()
  const expanded = []

  for (const row of allRows) {
    if (row.year !== TARGET_YEAR) continue
    if (!BIG5.has(row.league)) continue
    filtered++

    const clubRows = expandClubRows(row)
    if (clubRows.length === 0) {
      skippedCombo++
      continue
    }

    for (const clubRow of clubRows) {
      if (num(clubRow.time) <= 0) {
        skippedMinutes++
        continue
      }

      const team = resolveClub(clubRow.team_title, teamByName)
      if (!team) {
        unmatchedRows++
        unmatchedCounts.set(
          clubRow.team_title,
          (unmatchedCounts.get(clubRow.team_title) || 0) + 1,
        )
        continue
      }

      expanded.push({
        row: clubRow,
        team,
        competition: LEAGUE_TO_COMPETITION[clubRow.league],
      })
    }
  }

  // Assign playerIds: 10000 + understatId when unique;
  // for multi-club same understatId, offset by 500000 * index
  const byUnderstat = new Map()
  for (const item of expanded) {
    const id = num(item.row.id)
    if (!byUnderstat.has(id)) byUnderstat.set(id, [])
    byUnderstat.get(id).push(item)
  }

  let multiClubPlayers = 0
  const leaguePlayers = []

  for (const [understatId, items] of byUnderstat) {
    // Prefer most minutes first for stable primary id
    items.sort((a, b) => num(b.row.time) - num(a.row.time))
    if (items.length > 1) multiClubPlayers++

    items.forEach((item, index) => {
      const playerId = PLAYER_ID_OFFSET + understatId + index * 500000
      leaguePlayers.push(
        toLeaguePlayer(item.row, item.team, item.competition, playerId),
      )
    })
  }

  const wcPlayers = existingPlayers
    .filter(isWorldCupPlayer)
    .map((p) => ({
      ...p,
      competition: p.competition || 'FIFA World Cup',
      club: p.club ?? null,
    }))

  const merged = [...wcPlayers, ...leaguePlayers]
  fs.writeFileSync(PLAYERS_PATH, JSON.stringify(merged, null, 2))

  const unmatchedLines = [...unmatchedCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => `${count}\t${name}`)
  fs.writeFileSync(
    UNMATCHED_PATH,
    unmatchedLines.length
      ? unmatchedLines.join('\n') + '\n'
      : '(none)\n',
  )

  // Spot-checks
  const haaland = leaguePlayers.find((p) => /haaland/i.test(p.name))
  const mbappe = leaguePlayers.find((p) => /mbapp/i.test(p.name))

  console.log('=== Understat extraction summary ===')
  console.log(`CSV rows total:              ${allRows.length}`)
  console.log(`Filtered (2022 Big 5):       ${filtered}`)
  console.log(`Skipped comma-joined clubs:  ${skippedCombo}`)
  console.log(`Skipped zero minutes:        ${skippedMinutes}`)
  console.log(`Unmatched club rows:         ${unmatchedRows}`)
  console.log(`Multi-club understat ids:    ${multiClubPlayers}`)
  console.log(`League players written:      ${leaguePlayers.length}`)
  console.log(`WC players kept:             ${wcPlayers.length}`)
  console.log(`Total players.json:          ${merged.length}`)
  console.log(`Unmatched club log:          ${UNMATCHED_PATH}`)
  if (haaland) {
    console.log(
      `Spot-check Haaland: ${haaland.name} | ${haaland.team} | G${haaland.stats.goals} A${haaland.stats.assists} xG${haaland.stats.xG}`,
    )
  } else {
    console.log('Spot-check Haaland: NOT FOUND')
  }
  if (mbappe) {
    console.log(
      `Spot-check Mbappe:  ${mbappe.name} | ${mbappe.team} | G${mbappe.stats.goals} A${mbappe.stats.assists} xG${mbappe.stats.xG}`,
    )
  } else {
    console.log('Spot-check Mbappe: NOT FOUND')
  }
}

main()
