/**
 * Build era-accurate (FIFA 22 / ~2021–22) face URLs for the top-100 shot-map players.
 *
 * Source: public FIFA 22 SoFIFA face CDN (season version "22").
 * Mapping: FIFA 22 official player CSV (name + sofifa id).
 *
 * Usage:
 *   node scripts/fetch_era_player_photos.js
 *
 * Output:
 *   data/player_photos_era.json
 */

const fs = require('fs')
const path = require('path')

// Inline name helpers (keep script runnable without TS compile)

function tokenize(name) {
  return String(name).trim().replace(/\s+/g, ' ').split(' ').filter(Boolean)
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function surnameOf(name) {
  const parts = tokenize(name)
  if (!parts.length) return ''
  const particles = new Set(['di', 'de', 'da', 'do', 'dos', 'van', 'von', 'la', 'le', 'mc', 'mac', 'ben', 'el', 'al'])
  for (let i = parts.length - 2; i >= 1; i--) {
    if (particles.has(parts[i].toLowerCase().replace(/\./g, ''))) {
      return `${parts[i]} ${parts[i + 1]}`
    }
  }
  if (parts.length >= 3) return parts[parts.length - 2]
  return parts[parts.length - 1]
}

function firstInitial(name) {
  const parts = tokenize(name)
  return parts[0] ? parts[0][0].toLowerCase() : ''
}

function sofifaFaceUrl(id, size = 120) {
  const padded = String(id).padStart(6, '0')
  const a = padded.slice(0, 3)
  const b = padded.slice(3)
  // FIFA 22 pack = 2021/22 season look
  return `https://cdn.sofifa.net/players/${a}/${b}/22_${size}.png`
}

const CLUB_ALIASES = {
  'Man City': 'Manchester City',
  'Man United': 'Manchester United',
  'Paris SG': 'Paris Saint-Germain',
  'Ath Madrid': 'Atlético de Madrid',
  'Ath Bilbao': 'Athletic Club',
  Inter: 'Inter',
  'Ein Frankfurt': 'Eintracht Frankfurt',
  Vallecano: 'Rayo Vallecano',
  "Nott'm Forest": 'Nottingham Forest',
  Wolves: 'Wolverhampton Wanderers',
  Newcastle: 'Newcastle United',
  Brighton: 'Brighton',
  'West Ham': 'West Ham',
  Leverkusen: 'Bayer 04 Leverkusen',
  "M'gladbach": 'Mönchengladbach',
  Celta: 'Celta',
  Betis: 'Betis',
  Sociedad: 'Real Sociedad',
  Lille: 'Lille',
  Reims: 'Reims',
  Lorient: 'Lorient',
  Villarreal: 'Villarreal',
  Arsenal: 'Arsenal',
  'Real Madrid': 'Real Madrid',
  Napoli: 'Napoli',
}

/** Hard overrides when auto-match fails or collides (FIFA 22 sofifa ids). */
const MANUAL_IDS = {
  'Lionel Messi': 158023,
  'Cristiano Ronaldo': 20801,
  'Son Heung-Min': 200104,
  Neymar: 190871,
  'Neymar Jr.': 190871,
  'Neymar Jr': 190871,
  'Robert Lewandowski': 188545,
  'Martin Odegaard': 222665,
  'Martin Ødegaard': 222665,
  'Vinícius Júnior': 238794,
  'Vinicius Junior': 238794,
  'Álvaro Morata': 201153,
  'Alvaro Morata': 201153,
  'Rémy Cabella': 193476,
  'Remy Cabella': 193476,
  'Khvicha Kvaratskhelia': 247635,
  'Nicolas Jackson': 259197,
  'Kylian Mbappe-Lottin': 231747,
  'Kylian Mbappé': 231747,
  'Luis Suárez': 176580,
  'Luis Suarez': 176580,
  'Andrés Iniesta': 41,
  'Andres Iniesta': 41,
  'M&#039;Bala Nzola': 240452,
  "M'Bala Nzola": 240452,
}

/**
 * Skip FIFA22 auto-match (wrong collision risk / not in game yet).
 * Leave unmatched — TheSportsDB cutouts are better than Wikimedia match stills.
 */
const SKIP_AUTO = new Set([
  'Folarin Balogun',
  'Dango Ouattara',
  'Isi Palazón',
  'Gabriel Veiga',
])

const FACE_SIZE = 240

async function loadFifa22() {
  const url =
    'https://raw.githubusercontent.com/guebin/DV2021/master/_notebooks/2021-10-25-FIFA22_official_data.csv'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FIFA22 CSV fetch failed: ${res.status}`)
  const text = await res.text()
  const lines = text.split(/\r?\n/)
  const header = lines[0].split(',')
  const idIdx = header.indexOf('ID')
  const nameIdx = header.indexOf('Name')
  const clubIdx = header.indexOf('Club')
  const overallIdx = header.indexOf('Overall')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    // naive CSV split is ok for this file's simple quoting patterns we need
    const cols = []
    let cur = ''
    let inQ = false
    for (let c = 0; c < line.length; c++) {
      const ch = line[c]
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
    if (!cols[idIdx] || !cols[nameIdx]) continue
    rows.push({
      id: cols[idIdx],
      name: cols[nameIdx].trim(),
      club: (cols[clubIdx] || '').trim(),
      overall: Number(cols[overallIdx] || 0),
    })
  }
  return rows
}

function scoreMatch(ourName, ourClub, fifa) {
  const ourSur = stripAccents(surnameOf(ourName)).replace(/-/g, ' ')
  const fifaTok = tokenize(fifa.name)
  const fifaSur = stripAccents(fifaTok[fifaTok.length - 1] || '').replace(/-/g, ' ')
  if (!ourSur || !fifaSur) return -1

  const surnameOk =
    ourSur === fifaSur ||
    ourSur.endsWith(fifaSur) ||
    fifaSur.endsWith(ourSur) ||
    stripAccents(tokenize(ourName).slice(-1)[0] || '') === fifaSur

  if (!surnameOk) return -1

  let score = 10 + fifa.overall / 100
  const ourInit = firstInitial(ourName)
  const fifaInit = (fifaTok[0] || '').replace(/\./g, '')[0]?.toLowerCase() || ''
  const initialOk = ourInit && fifaInit && ourInit === fifaInit
  if (initialOk) score += 25

  const ourTokens = tokenize(ourName).map((t) => stripAccents(t.replace(/-/g, '')))
  const fifaTokens = fifaTok.map((t) => stripAccents(t.replace(/\./g, '').replace(/-/g, '')))
  const overlap = ourTokens.filter((t) => t.length > 2 && fifaTokens.some((f) => f === t || f.includes(t) || t.includes(f))).length
  score += overlap * 8

  let clubOk = false
  if (ourClub) {
    const want = stripAccents(CLUB_ALIASES[ourClub] || ourClub)
    const have = stripAccents(fifa.club)
    if (want && have && (have.includes(want) || want.includes(have))) {
      score += 18
      clubOk = true
    }
  }

  // Guard: same surname but wrong person (e.g. Son → Shin Hyung Min)
  if (!initialOk && !clubOk && overlap < 1) return -1

  return score
}

async function main() {
  const root = path.join(__dirname, '..')
  const shots = JSON.parse(fs.readFileSync(path.join(root, 'data', 'player_shots.json'), 'utf8'))
  const top = Object.values(shots.players || {})
  console.log(`Matching ${top.length} top players to FIFA 22 faces…`)

  const fifa = await loadFifa22()
  console.log(`FIFA 22 rows: ${fifa.length}`)

  const eraMap = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'SoFIFA CDN face pack version 22 (FIFA 22 / 2021-22 season look)',
      dataset: 'FIFA22_official_data.csv (guebin/DV2021 mirror)',
      note: 'Preferred for Foot-Insights 2022 archive aesthetic; falls back to live TheSportsDB if missing.',
      playerCount: 0,
    },
    photos: {},
  }

  let matched = 0
  const misses = []

  for (const p of top) {
    const name = p.name
    let best = null
    let bestScore = 0
    let source = 'auto'

    if (SKIP_AUTO.has(name)) {
      misses.push({ name, team: p.team, bestScore: 0, best: 'skip-auto' })
      continue
    }

    if (MANUAL_IDS[name]) {
      best = { id: MANUAL_IDS[name], name: `manual:${name}`, overall: 0, club: p.team || '' }
      bestScore = 99
      source = 'manual'
    } else {
      for (const row of fifa) {
        const s = scoreMatch(name, p.team, row)
        if (s > bestScore) {
          bestScore = s
          best = row
        }
      }
    }

    // Require a solid match — weak hits are wrong too often. Miss → TheSportsDB cutout fallback in app.
    if (!best || bestScore < 40) {
      misses.push({ name, team: p.team, bestScore, best: best?.name })
      continue
    }

    const url = sofifaFaceUrl(best.id, FACE_SIZE)
    const keys = new Set([name, preferredCommonNameSafe(name)])
    if (!String(best.name).startsWith('manual:')) keys.add(best.name)
    for (const k of keys) {
      if (k) eraMap.photos[k] = url
    }
    matched++
    console.log(
      `✅ ${name} → ${best.name} (#${best.id}) [${bestScore.toFixed(1)}]${source === 'manual' ? ' [manual]' : ''}`
    )
  }

  eraMap.meta.playerCount = Object.keys(eraMap.photos).length
  eraMap.meta.matchedPlayers = matched
  eraMap.meta.misses = misses

  const out = path.join(root, 'data', 'player_photos_era.json')
  fs.writeFileSync(out, JSON.stringify(eraMap, null, 2))
  console.log(`\nWrote ${out}`)
  console.log(`Matched ${matched}/${top.length}; keys ${eraMap.meta.playerCount}`)
  if (misses.length) {
    console.log('Misses:')
    for (const m of misses) console.log(' -', m.name, m.team, m.bestScore, m.best)
  }
}

function preferredCommonNameSafe(fullName) {
  const parts = tokenize(fullName)
  if (parts.length <= 2) return parts.join(' ')
  return `${parts[0]} ${surnameOf(fullName)}`
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
