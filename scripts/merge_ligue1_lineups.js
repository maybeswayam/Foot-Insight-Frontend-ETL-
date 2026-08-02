/**
 * Merge any leftover Ligue 1 lineups from _lineup_progress into match_lineups.json.
 * Usage: node scripts/merge_ligue1_lineups.js
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const progressPath = path.join(root, 'data', '_lineup_progress', 'ligue-1.json')
const outPath = path.join(root, 'data', 'match_lineups.json')

const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))
const lineups = JSON.parse(fs.readFileSync(outPath, 'utf8'))

const games = progress.games || {}
let added = 0
let skipped = 0

for (const [extId, game] of Object.entries(games)) {
  const mid = String(game.matchId ?? '')
  if (!mid) {
    skipped++
    continue
  }
  if (lineups.matches[mid]) {
    skipped++
    continue
  }
  lineups.matches[mid] = {
    matchId: game.matchId,
    externalMatchId: game.externalMatchId || extId,
    source: game.source || 'FBref',
    competition: game.competition || 'Ligue 1',
    season: game.season || '2022/23',
    date: game.date,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    playerCount: game.playerCount,
    starterCount: game.starterCount,
    players: game.players,
  }
  added++
}

if (!lineups.meta) lineups.meta = {}
if (!lineups.meta.competitions) lineups.meta.competitions = {}
lineups.meta.competitions['ligue-1'] = {
  status: added > 0 ? 'partial' : lineups.meta.competitions['ligue-1']?.status || 'missing',
  matched: Object.values(lineups.matches).filter((m) => m.competition === 'Ligue 1').length,
  note: 'Merged from _lineup_progress/ligue-1.json — full league scrape still incomplete.',
}
lineups.meta.updatedAt = new Date().toISOString()
lineups.meta.matchCount = Object.keys(lineups.matches).length

fs.writeFileSync(outPath, JSON.stringify(lineups, null, 2))
console.log(`Merged ${added} Ligue 1 lineups; skipped ${skipped}; total matches ${lineups.meta.matchCount}`)
