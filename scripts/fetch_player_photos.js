/**
 * Pre-fetch all player photos from TheSportsDB and save to a static JSON map.
 * 
 * USAGE:
 *   node scripts/fetch_player_photos.js
 * 
 * OUTPUT:
 *   Saves to data/player_photos.json (~612 entries)
 *   Expected success rate: ~85-90% (some obscure players not in TheSportsDB)
 *   Takes ~10 minutes due to rate limiting (30s pauses every ~30 requests)
 *
 * NAME MATCHING LOGIC (mirrors lib/imageService.ts):
 *   1. Original name (e.g., "Neymar Jr.")
 *   2. Stripped Jr./Sr./III/II/IV suffix (e.g., "Neymar")
 *   3. Accent-removed variant (e.g., "Alvaro Morata" for "Álvaro Morata")
 *   4. First name only for shortened derived names
 *
 * RATE LIMITING:
 *   - 500ms delay between requests
 *   - Auto-detects HTTP 429 and pauses 30s before retrying
 *   - TheSportsDB free tier allows ~30 requests before limiting
 */

const fs = require('fs');
const path = require('path');

const API_KEY = '123';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── Build name variants (mirrors imageService logic) ─────────────── */
function buildNameVariants(playerName) {
  const variants = [playerName];

  // Strip Jr./Sr./III/II/IV suffixes
  const stripped = playerName
    .replace(/\s+(Jr\.?|Sr\.?|III|II|IV)$/i, '')
    .trim();
  if (stripped !== playerName) variants.push(stripped);

  const parts = stripped.split(/\s+/);

  // Accent-removed variant (only when multi-word name)
  if (parts.length >= 2) {
    const noAccent = stripped.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (noAccent !== stripped) variants.push(noAccent);
  }

  // First name only (for single-word derived names)
  if (parts.length === 1 || stripped !== playerName) {
    if (parts.length >= 2) variants.push(parts[0]);
  }

  // Also always try accent-removed of original (even single word)
  const noAccentOrig = playerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (noAccentOrig !== playerName && !variants.includes(noAccentOrig)) {
    variants.push(noAccentOrig);
  }

  return variants;
}

/* ── Fetch a single player photo from TheSportsDB ─────────────────── */
async function fetchPhoto(searchName) {
  try {
    const url = `${BASE}/searchplayers.php?p=${encodeURIComponent(searchName)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (r.status === 429) return { status: 'rate_limited' };
    if (!r.ok) return { status: 'error', code: r.status };
    const data = await r.json();
    if (data.player && data.player.length > 0) {
      const photo = data.player[0].strCutout || data.player[0].strThumb;
      if (photo) return { status: 'ok', photo, apiName: data.player[0].strPlayer };
    }
    return { status: 'not_found' };
  } catch (e) {
    return { status: 'error', msg: e.message };
  }
}

/* ── Main ──────────────────────────────────────────────────────────── */
async function main() {
  const playersFile = path.join(__dirname, '..', 'data', 'players.json');
  const players = JSON.parse(fs.readFileSync(playersFile, 'utf8'));

  // Unique player names
  const allNames = [...new Set(players.map((p) => p.name))].sort();
  console.log(`Fetching photos for ${allNames.length} players...`);
  console.log('Using 500 ms delays between requests.\n');

  // Also add Stars-of-the-ERA names that might not be in the WC dataset
  const extraNames = [
    'Lionel Messi',
    'Cristiano Ronaldo',
    'Neymar',
    'Robert Lewandowski',
    'Andrés Iniesta',
    'Luis Suárez',
    'Luka Modrić',
    'Kylian Mbappé',
    'Erling Haaland',
    'Mohamed Salah',
    'Karim Benzema',
    'Kevin De Bruyne',
    'Virgil van Dijk',
  ];
  for (const n of extraNames) {
    if (!allNames.includes(n)) allNames.push(n);
  }

  const photoMap = {};
  let success = 0,
    failed = 0,
    rateLimited = 0;

  for (let i = 0; i < allNames.length; i++) {
    const dataName = allNames[i];
    const variants = buildNameVariants(dataName);

    process.stdout.write(`[${i + 1}/${allNames.length}] ${dataName}`);

    let found = false;
    for (const variant of variants) {
      if (variant !== dataName) process.stdout.write(` → trying "${variant}"`);
      const result = await fetchPhoto(variant);

      if (result.status === 'ok' && result.photo) {
        photoMap[dataName] = result.photo;
        console.log(` ✅ ${result.apiName}`);
        success++;
        found = true;
        break;
      } else if (result.status === 'rate_limited') {
        console.log(' ⏳ RATE LIMITED - waiting 30s...');
        rateLimited++;
        await delay(30000);
        // Retry this variant
        const retry = await fetchPhoto(variant);
        if (retry.status === 'ok' && retry.photo) {
          photoMap[dataName] = retry.photo;
          console.log(`  ✅ Retry OK: ${retry.apiName}`);
          success++;
          found = true;
          break;
        }
      }
      // Next variant
      await delay(300);
    }

    if (!found) {
      console.log(` ❌ not found`);
      failed++;
    }

    // Rate limiting between players
    if (i < allNames.length - 1) {
      await delay(500);
    }
  }

  // Save the photo map
  const outPath = path.join(__dirname, '..', 'data', 'player_photos.json');
  fs.writeFileSync(outPath, JSON.stringify(photoMap, null, 2));

  console.log(
    `\n✅ Done! ${success} photos saved, ${failed} failed, ${rateLimited} rate limited`,
  );
  console.log(`Saved to: ${outPath}`);
}

main();
