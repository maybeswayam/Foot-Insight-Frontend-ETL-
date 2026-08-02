/**
 * Cache 2022/23 Understat shot events for the top 100 league players.
 *
 * Players are ranked by season goal contributions (goals + assists), then
 * goals, xG, and minutes. Existing cached players are reused unless
 * --refresh is passed.
 *
 * Usage:
 *   node scripts/fetch_understat_shots.js
 *   node scripts/fetch_understat_shots.js --refresh
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PLAYERS_PATH = path.join(ROOT, 'data', 'players.json')
const OUTPUT_PATH = path.join(ROOT, 'data', 'player_shots.json')

const TARGET_SEASON = '2022'
const DISPLAY_SEASON = '2022/23'
const PLAYER_LIMIT = 100
const REQUEST_DELAY_MS = 250
const MAX_ATTEMPTS = 3
const REFRESH = process.argv.includes('--refresh')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function aggregateLeaguePlayers(players) {
  const byUnderstatId = new Map()

  for (const player of players) {
    if (
      player.competition === 'FIFA World Cup' ||
      player.understatId == null
    ) {
      continue
    }

    const id = Number(player.understatId)
    const current = byUnderstatId.get(id)

    if (!current) {
      byUnderstatId.set(id, {
        understatId: id,
        playerId: String(player.playerId),
        name: player.name,
        team: player.team,
        competition: player.competition,
        position: player.position,
        stats: {
          games: number(player.stats.games),
          minutes: number(player.stats.minutes),
          goals: number(player.stats.goals),
          assists: number(player.stats.assists),
          shots: number(player.stats.shots),
          xG: number(player.stats.xG),
          xA: number(player.stats.xA),
        },
      })
      continue
    }

    // Transferred players have one record per club. Aggregate their season
    // totals while keeping the club with the most minutes as the display club.
    if (number(player.stats.minutes) > current.stats.minutes) {
      current.playerId = String(player.playerId)
      current.team = player.team
      current.competition = player.competition
      current.position = player.position
    }

    current.stats.games += number(player.stats.games)
    current.stats.minutes += number(player.stats.minutes)
    current.stats.goals += number(player.stats.goals)
    current.stats.assists += number(player.stats.assists)
    current.stats.shots += number(player.stats.shots)
    current.stats.xG += number(player.stats.xG)
    current.stats.xA += number(player.stats.xA)
  }

  return [...byUnderstatId.values()]
    .sort(
      (a, b) =>
        b.stats.goals +
          b.stats.assists -
          (a.stats.goals + a.stats.assists) ||
        b.stats.goals - a.stats.goals ||
        b.stats.xG - a.stats.xG ||
        b.stats.minutes - a.stats.minutes ||
        a.name.localeCompare(b.name),
    )
    .slice(0, PLAYER_LIMIT)
}

async function fetchPlayerData(understatId) {
  const endpoint = `https://understat.com/getPlayerData/${understatId}`

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: `https://understat.com/player/${understatId}`,
          'User-Agent':
            'Mozilla/5.0 (compatible; FootInsightsDataArchive/1.0)',
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: AbortSignal.timeout(30_000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      if (!Array.isArray(data.shots)) {
        throw new Error('Response did not contain a shots array')
      }
      return data
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error
      await sleep(750 * attempt)
    }
  }

  throw new Error('Request failed')
}

function normalizeShot(shot) {
  return {
    id: String(shot.id),
    matchId: String(shot.match_id),
    minute: number(shot.minute),
    x: number(shot.X),
    y: number(shot.Y),
    xG: number(shot.xG),
    result: shot.result,
    situation: shot.situation,
    shotType: shot.shotType,
    lastAction: shot.lastAction,
    assistedBy: shot.player_assisted || null,
    side: shot.h_a,
    homeTeam: shot.h_team,
    awayTeam: shot.a_team,
    homeGoals: number(shot.h_goals),
    awayGoals: number(shot.a_goals),
    date: shot.date,
  }
}

function summarizeShots(shots) {
  const byResult = {}
  const byShotType = {}
  const bySituation = {}
  let goals = 0
  let totalXG = 0

  for (const shot of shots) {
    byResult[shot.result] = (byResult[shot.result] || 0) + 1
    byShotType[shot.shotType] = (byShotType[shot.shotType] || 0) + 1
    bySituation[shot.situation] =
      (bySituation[shot.situation] || 0) + 1
    if (shot.result === 'Goal') goals++
    totalXG += shot.xG
  }

  return {
    shots: shots.length,
    goals,
    totalXG: Math.round(totalXG * 100) / 100,
    byResult,
    byShotType,
    bySituation,
  }
}

function readCache() {
  if (REFRESH || !fs.existsSync(OUTPUT_PATH)) return {}

  try {
    const cached = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    if (cached?.meta?.understatSeason !== TARGET_SEASON) return {}
    return cached.players || {}
  } catch {
    return {}
  }
}

function validatePlayerShots(player, shots) {
  if (shots.length === 0) {
    throw new Error(`${player.name}: no shots found for ${DISPLAY_SEASON}`)
  }

  for (const shot of shots) {
    if (
      !Number.isFinite(shot.x) ||
      !Number.isFinite(shot.y) ||
      shot.x < 0 ||
      shot.x > 1 ||
      shot.y < 0 ||
      shot.y > 1
    ) {
      throw new Error(`${player.name}: invalid coordinates on shot ${shot.id}`)
    }
  }
}

async function main() {
  const players = JSON.parse(fs.readFileSync(PLAYERS_PATH, 'utf8'))
  const selected = aggregateLeaguePlayers(players)
  const cache = readCache()
  const outputPlayers = {}
  const failures = []
  let cacheHits = 0

  console.log(
    `Preparing ${DISPLAY_SEASON} shots for ${selected.length} players`,
  )

  for (let index = 0; index < selected.length; index++) {
    const player = selected[index]
    const key = String(player.understatId)
    const cached = cache[key]

    if (cached?.shots?.length) {
      outputPlayers[key] = { ...cached, rank: index + 1 }
      cacheHits++
      console.log(
        `[${index + 1}/${selected.length}] ${player.name}: cached (${cached.shots.length} shots)`,
      )
      continue
    }

    try {
      const data = await fetchPlayerData(player.understatId)
      const shots = data.shots
        .filter((shot) => String(shot.season) === TARGET_SEASON)
        .map(normalizeShot)

      validatePlayerShots(player, shots)

      outputPlayers[key] = {
        rank: index + 1,
        playerId: player.playerId,
        understatId: player.understatId,
        name: player.name,
        team: player.team,
        competition: player.competition,
        position: player.position,
        seasonStats: {
          ...player.stats,
          xG: Math.round(player.stats.xG * 100) / 100,
          xA: Math.round(player.stats.xA * 100) / 100,
          goalContributions: player.stats.goals + player.stats.assists,
        },
        shotSummary: summarizeShots(shots),
        shots,
      }

      console.log(
        `[${index + 1}/${selected.length}] ${player.name}: ${shots.length} shots`,
      )
    } catch (error) {
      failures.push({
        understatId: player.understatId,
        name: player.name,
        error: error instanceof Error ? error.message : String(error),
      })
      console.error(
        `[${index + 1}/${selected.length}] ${player.name}: FAILED`,
      )
    }

    await sleep(REQUEST_DELAY_MS)
  }

  const records = Object.values(outputPlayers)
  const totalShots = records.reduce(
    (sum, player) => sum + player.shotSummary.shots,
    0,
  )
  const totalGoals = records.reduce(
    (sum, player) => sum + player.shotSummary.goals,
    0,
  )

  const result = {
    meta: {
      source: 'Understat',
      sourceEndpoint: 'https://understat.com/getPlayerData/{understatId}',
      season: DISPLAY_SEASON,
      understatSeason: TARGET_SEASON,
      selection: {
        limit: PLAYER_LIMIT,
        rankedBy: 'goalContributions, goals, xG, minutes',
        competitions: [
          'Premier League',
          'La Liga',
          'Bundesliga',
          'Serie A',
          'Ligue 1',
        ],
      },
      generatedAt: new Date().toISOString(),
      coverage: {
        requestedPlayers: selected.length,
        playersWithShots: records.length,
        failedPlayers: failures.length,
        cacheHits,
        totalShots,
        totalGoals,
      },
      coordinateSystem: {
        x: 'Normalized 0–1 from own goal toward opponent goal',
        y: 'Normalized 0–1 across pitch width',
        goalmouthEndLocationAvailable: false,
      },
      limitations: [
        'Understat provides shot origin coordinates, not exact goalmouth end coordinates.',
        'The top 100 selection is based on goal contributions in the local 2022/23 aggregate dataset.',
      ],
      failures,
    },
    players: outputPlayers,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2))

  console.log('\n=== Shot data summary ===')
  console.log(`Players with shots: ${records.length}/${selected.length}`)
  console.log(`Total shot events:  ${totalShots}`)
  console.log(`Total goals:        ${totalGoals}`)
  console.log(`Cache hits:         ${cacheHits}`)
  console.log(`Failures:           ${failures.length}`)
  console.log(`Output:             ${OUTPUT_PATH}`)

  if (failures.length > 0 || records.length !== PLAYER_LIMIT) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
