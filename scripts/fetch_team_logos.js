/**
 * Pre-fetch all team logos from TheSportsDB and save to a static JSON map.
 * Run: node scripts/fetch_team_logos.js
 * 
 * Uses 2-second delays between requests to avoid rate limiting.
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '123';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Name mapping: dataset abbreviated names → TheSportsDB search names
const NAME_MAP = {
  // La Liga
  'Ath Madrid': 'Atletico Madrid',
  'Ath Bilbao': 'Athletic Bilbao',
  'Celta': 'Celta Vigo',
  'Espanol': 'Espanyol',
  'Vallecano': 'Rayo Vallecano',
  'Sociedad': 'Real Sociedad',
  'Betis': 'Real Betis',
  // Serie A
  'Inter': 'Inter Milan',
  'Verona': 'Hellas Verona',
  // Ligue 1
  'Clermont': 'Clermont Foot',
  // Bundesliga
  "M'gladbach": 'Borussia Monchengladbach',
  'Leverkusen': 'Bayer Leverkusen',
  'Heidenheim': '1. FC Heidenheim',
  'Ein Frankfurt': 'Eintracht Frankfurt',
  // Premier League
  'Nott\'m Forest': 'Nottingham Forest',
  'Man United': 'Manchester United',
  'Man City': 'Manchester City',
  'Wolves': 'Wolverhampton Wanderers',
  'Leeds': 'Leeds United',
  'Newcastle': 'Newcastle United',
  'Brighton': 'Brighton and Hove Albion',
  'West Ham': 'West Ham United',
  // World Cup national teams
  'IR Iran': 'Iran',
  'Korea Republic': 'South Korea',
  'United States': 'USA',
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchLogo(searchName) {
  try {
    const url = `${BASE}/searchteams.php?t=${encodeURIComponent(searchName)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (r.status === 429) return { status: 'rate_limited' };
    if (!r.ok) return { status: 'error', code: r.status };
    const data = await r.json();
    if (data.teams && data.teams.length > 0) {
      return { status: 'ok', logo: data.teams[0].strBadge, apiName: data.teams[0].strTeam };
    }
    return { status: 'not_found' };
  } catch (e) {
    return { status: 'error', msg: e.message };
  }
}

async function main() {
  const teamsFile = path.join(__dirname, '..', 'data', 'teams.json');
  const teams = JSON.parse(fs.readFileSync(teamsFile, 'utf8'));
  const allNames = [...new Set(teams.map(t => t.name))].sort();

  console.log(`Fetching logos for ${allNames.length} teams...`);
  console.log('Using 2-second delays to avoid rate limiting.\n');

  const logoMap = {};
  let success = 0, failed = 0, rateLimited = 0;

  for (let i = 0; i < allNames.length; i++) {
    const dataName = allNames[i];
    const searchName = NAME_MAP[dataName] || dataName;
    
    process.stdout.write(`[${i + 1}/${allNames.length}] ${dataName}`);
    if (searchName !== dataName) process.stdout.write(` → ${searchName}`);
    
    const result = await fetchLogo(searchName);
    
    if (result.status === 'ok' && result.logo) {
      logoMap[dataName] = result.logo;
      console.log(` ✅ ${result.apiName}`);
      success++;
    } else if (result.status === 'rate_limited') {
      console.log(' ⏳ RATE LIMITED - waiting 30s...');
      rateLimited++;
      await delay(30000);
      // Retry
      const retry = await fetchLogo(searchName);
      if (retry.status === 'ok' && retry.logo) {
        logoMap[dataName] = retry.logo;
        console.log(`  ✅ Retry OK: ${retry.apiName}`);
        success++;
      } else {
        console.log(`  ❌ Retry failed: ${retry.status}`);
        failed++;
      }
    } else {
      console.log(` ❌ ${result.status}`);
      failed++;
    }
    
    // Rate limiting: 2 seconds between requests
    if (i < allNames.length - 1) {
      await delay(2000);
    }
  }

  // Save the logo map
  const outPath = path.join(__dirname, '..', 'data', 'team_logos.json');
  fs.writeFileSync(outPath, JSON.stringify(logoMap, null, 2));

  console.log(`\n✅ Done! ${success} logos saved, ${failed} failed, ${rateLimited} rate limited`);
  console.log(`Saved to: ${outPath}`);
}

main();
