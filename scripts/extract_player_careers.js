/**
 * Build Big-5 career paths for every league player with an understatId.
 *
 * Usage:
 *   node scripts/extract_player_careers.js
 *
 * Output:
 *   data/player_careers.json
 */

const fs = require('fs')
const path = require('path')

const LEAGUE_META = {
  EPL: { label: 'Premier League', country: 'England' },
  'Premier League': { label: 'Premier League', country: 'England' },
  La_liga: { label: 'La Liga', country: 'Spain' },
  'La Liga': { label: 'La Liga', country: 'Spain' },
  Bundesliga: { label: 'Bundesliga', country: 'Germany' },
  Serie_A: { label: 'Serie A', country: 'Italy' },
  'Serie A': { label: 'Serie A', country: 'Italy' },
  Ligue_1: { label: 'Ligue 1', country: 'France' },
  'Ligue 1': { label: 'Ligue 1', country: 'France' },
  RFPL: { label: 'Russian Premier League', country: 'Russia' },
}

function parseCsvLine(line) {
  const cols = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQ = !inQ
      continue
    }
    if (ch === ',' && !inQ) {
      cols.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  cols.push(cur)
  return cols
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function seasonLabel(yearRaw, seasonRaw) {
  const y = Number(yearRaw)
  if (Number.isFinite(y) && y >= 2000) {
    const next = String(y + 1).slice(-2)
    return `${y}/${next}`
  }
  const s = String(seasonRaw || '').trim()
  if (/^\d{4}\/\d{2}$/.test(s)) return s
  if (/^\d{4}$/.test(s)) {
    const yy = Number(s)
    return `${yy}/${String(yy + 1).slice(-2)}`
  }
  return s || String(yearRaw)
}

function main() {
  const root = path.join(__dirname, '..')
  const playersPath = path.join(root, 'data', 'players.json')
  const shotsPath = path.join(root, 'data', 'player_shots.json')
  const csvPath = path.join(root, 'REf', 'understat_players_aggregated_2014_2024.csv')
  const outPath = path.join(root, 'data', 'player_careers.json')

  const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'))
  const shots = JSON.parse(fs.readFileSync(shotsPath, 'utf8'))

  const targetIds = new Set()
  const nameById = {}
  for (const p of players) {
    if (p.understatId == null) continue
    const id = String(p.understatId)
    targetIds.add(id)
    if (!nameById[id]) nameById[id] = p.name
  }
  for (const p of Object.values(shots.players || {})) {
    const id = String(p.understatId)
    targetIds.add(id)
    nameById[id] = p.name
  }

  console.log(`Career targets (understat ids): ${targetIds.size}`)

  const text = fs.readFileSync(csvPath, 'utf8')
  const lines = text.split(/\r?\n/)
  const header = parseCsvLine(lines[0])
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))

  /** @type {Record<string, any[]>} */
  const byId = {}

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const cols = parseCsvLine(line)
    const id = String(cols[idx.id] || '').trim()
    if (!targetIds.has(id)) continue

    const leagueRaw = String(cols[idx.league] || '').trim()
    const meta = LEAGUE_META[leagueRaw] || {
      label: leagueRaw.replace(/_/g, ' ') || 'Unknown',
      country: 'Unknown',
    }

    const year = num(cols[idx.year])
    const stop = {
      season: seasonLabel(cols[idx.year], cols[idx.season]),
      year,
      club: String(cols[idx.team_title] || '').trim(),
      league: meta.label,
      leagueCode: leagueRaw,
      country: meta.country,
      games: num(cols[idx.games]),
      minutes: num(cols[idx.time]),
      goals: num(cols[idx.goals]),
      assists: num(cols[idx.assists]),
      shots: num(cols[idx.shots]),
      xG: +num(cols[idx.xG]).toFixed(2),
      xA: +num(cols[idx.xA]).toFixed(2),
      npg: num(cols[idx.npg]),
      npxG: +num(cols[idx.npxG]).toFixed(2),
      keyPasses: num(cols[idx.key_passes]),
      yellowCards: num(cols[idx.yellow_cards]),
      redCards: num(cols[idx.red_cards]),
      primaryPosition: String(cols[idx.primary_position] || cols[idx.position] || '').trim(),
      xGBuildup: +num(cols[idx.xGBuildup]).toFixed(2),
      xGChain: +num(cols[idx.xGChain]).toFixed(2),
    }

    if (!byId[id]) byId[id] = []
    byId[id].push(stop)
  }

  const careers = {}
  let matched = 0

  for (const id of targetIds) {
    const stops = (byId[id] || []).slice().sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.club.localeCompare(b.club)
    })
    if (!stops.length) continue
    matched++

    const totals = stops.reduce(
      (acc, s) => {
        acc.games += s.games
        acc.minutes += s.minutes
        acc.goals += s.goals
        acc.assists += s.assists
        acc.shots += s.shots
        acc.xG += s.xG
        acc.xA += s.xA
        acc.npg += s.npg
        acc.npxG += s.npxG
        acc.keyPasses += s.keyPasses || 0
        acc.yellowCards += s.yellowCards || 0
        acc.redCards += s.redCards || 0
        acc.xGBuildup += s.xGBuildup || 0
        acc.xGChain += s.xGChain || 0
        return acc
      },
      {
        games: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        shots: 0,
        xG: 0,
        xA: 0,
        npg: 0,
        npxG: 0,
        keyPasses: 0,
        yellowCards: 0,
        redCards: 0,
        xGBuildup: 0,
        xGChain: 0,
      }
    )
    totals.xG = +totals.xG.toFixed(2)
    totals.xA = +totals.xA.toFixed(2)
    totals.npxG = +totals.npxG.toFixed(2)
    totals.xGBuildup = +totals.xGBuildup.toFixed(2)
    totals.xGChain = +totals.xGChain.toFixed(2)
    totals.goalContributions = totals.goals + totals.assists

    const clubs = []
    const clubSeen = new Set()
    for (const s of stops) {
      const key = `${s.club}|${s.country}`
      if (!clubSeen.has(key)) {
        clubSeen.add(key)
        clubs.push({ club: s.club, country: s.country, league: s.league })
      }
    }

    const countries = [...new Set(stops.map((s) => s.country).filter(Boolean))]
    const leagues = [...new Set(stops.map((s) => s.league).filter(Boolean))]

    const pathSegs = []
    for (const s of stops) {
      const last = pathSegs[pathSegs.length - 1]
      if (last && last.club === s.club && last.country === s.country) {
        last.toSeason = s.season
        last.toYear = s.year
        last.seasons += 1
        last.goals += s.goals
        last.assists += s.assists
        last.games += s.games
        last.minutes += s.minutes
      } else {
        pathSegs.push({
          club: s.club,
          country: s.country,
          league: s.league,
          fromSeason: s.season,
          toSeason: s.season,
          fromYear: s.year,
          toYear: s.year,
          seasons: 1,
          goals: s.goals,
          assists: s.assists,
          games: s.games,
          minutes: s.minutes,
        })
      }
    }

    careers[id] = {
      understatId: Number(id),
      name: nameById[id] || id,
      stops,
      path: pathSegs,
      clubs,
      countries,
      leagues,
      totals,
      firstSeason: stops[0].season,
      lastSeason: stops[stops.length - 1].season,
      seasonCount: stops.length,
    }
  }

  const out = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'REf/understat_players_aggregated_2014_2024.csv',
      scope: 'All players.json rows with understatId (+ top-100 shots ids)',
      note: 'Big 5 (+ RFPL) league seasons only via Understat — cups and non–Big 5 clubs omitted.',
      requestedPlayers: targetIds.size,
      matchedPlayers: matched,
    },
    careers,
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath}`)
  console.log(`Matched ${matched}/${targetIds.size}`)
}

main()
