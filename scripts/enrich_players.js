/**
 * Enrich players.json with club info, cards, starts data from source CSVs.
 */
const fs = require('fs');
const path = require('path');

const PLAYER_DATA_DIR = path.join(__dirname, '..', '..', 'Foot-insights', '2022 world cup', 'player data');
const PLAYERS_JSON = path.join(__dirname, '..', 'data', 'players.json');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r$/, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim().replace(/\r$/, '') || '';
    });
    rows.push(row);
  }
  return rows;
}

function normalizeName(name) {
  return name.normalize('NFC').toLowerCase().trim();
}

// Load source CSVs
const statsCSV = parseCSV(path.join(PLAYER_DATA_DIR, 'player_stats.csv'));

// Build lookup by normalized name
const statsMap = {};
statsCSV.forEach(row => {
  statsMap[normalizeName(row.player)] = row;
});

// Load current players.json
const players = JSON.parse(fs.readFileSync(PLAYERS_JSON, 'utf8'));

let enriched = 0;
players.forEach(player => {
  const key = normalizeName(player.name);
  const stats = statsMap[key];
  if (!stats) return;

  enriched++;

  // Add club info
  player.club = stats.club || null;
  
  // Add cards
  player.stats.yellowCards = parseInt(stats.cards_yellow) || 0;
  player.stats.redCards = parseInt(stats.cards_red) || 0;
  
  // Add starts
  player.stats.gamesStarted = parseInt(stats.games_starts) || 0;
  
  // Add per90 rates
  player.stats.goalsP90 = parseFloat(stats.goals_per90) || 0;
  player.stats.assistsP90 = parseFloat(stats.assists_per90) || 0;
  player.stats.xGP90 = parseFloat(stats.xg_per90) || 0;
  player.stats.xAP90 = parseFloat(stats.xg_assist_per90) || 0;
  
  // Fix penalties data
  player.stats.pensMade = parseInt(stats.pens_made) || 0;
  player.stats.pensAtt = parseInt(stats.pens_att) || 0;
});

fs.writeFileSync(PLAYERS_JSON, JSON.stringify(players, null, 2));
console.log(`Enriched ${enriched}/${players.length} players with club, cards, starts, per90 data`);

// Verify
const mbappe = players.find(p => p.name.includes('Mbapp'));
console.log('\nMbappe:', JSON.stringify({
  club: mbappe.club,
  yellowCards: mbappe.stats.yellowCards,
  redCards: mbappe.stats.redCards,
  gamesStarted: mbappe.stats.gamesStarted,
  goalsP90: mbappe.stats.goalsP90,
  pensMade: mbappe.stats.pensMade,
  pensAtt: mbappe.stats.pensAtt,
}, null, 2));
