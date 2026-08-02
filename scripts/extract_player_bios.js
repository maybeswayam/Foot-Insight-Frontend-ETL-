/**
 * Build 2021/22 FIFA card bios (value, wage, nationality, etc.) for archive players.
 *
 * Usage:
 *   node scripts/extract_player_bios.js
 *
 * Output:
 *   data/player_bios.json  keyed by exact player name from players.json
 */

const fs = require('fs')
const path = require('path')

const MANUAL_IDS = {
  'Lionel Messi': 158023,
  'Cristiano Ronaldo': 20801,
  Neymar: 190871,
  'Neymar Jr.': 190871,
  'Robert Lewandowski': 188545,
  'Erling Haaland': 239085,
  'Kylian Mbappe-Lottin': 231747,
  'Kylian Mbappé': 231747,
  'Mohamed Salah': 209331,
  'Kevin De Bruyne': 192985,
  'Harry Kane': 202126,
  'Son Heung-Min': 200104,
  'Vinícius Júnior': 238794,
  'Karim Benzema': 165153,
  'Luka Modrić': 177003,
  'Luka Modric': 177003,
  'Luis Suárez': 176580,
  'Andrés Iniesta': 41,
  'Martin Odegaard': 222665,
  'Bukayo Saka': 246669,
  'Phil Foden': 237692,
  'Bruno Fernandes': 212198,
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

function strip(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(name) {
  return strip(name).split(' ').filter(Boolean)
}

function surname(name) {
  const t = tokens(name)
  return t[t.length - 1] || ''
}

function firstInitial(name) {
  const t = tokens(name)
  return t[0] ? t[0][0] : ''
}

function parseEuro(raw) {
  const s = String(raw || '').trim()
  if (!s || s === '€0') return { display: s || null, euros: 0 }
  const m = s.match(/€\s*([\d.]+)\s*([KMB])?/i)
  if (!m) return { display: s, euros: 0 }
  let n = Number(m[1])
  const u = (m[2] || '').toUpperCase()
  if (u === 'K') n *= 1e3
  if (u === 'M') n *= 1e6
  if (u === 'B') n *= 1e9
  return { display: s, euros: Math.round(n) }
}

function scoreMatch(ourName, fifaName) {
  const ourSur = surname(ourName)
  const fifaTok = tokens(fifaName)
  const fifaSur = fifaTok[fifaTok.length - 1] || ''
  if (!ourSur || !fifaSur) return -1
  if (ourSur !== fifaSur && !ourSur.endsWith(fifaSur) && !fifaSur.endsWith(ourSur)) return -1

  let score = 10
  const oi = firstInitial(ourName)
  const fi = (fifaTok[0] || '').replace(/\./g, '')[0] || ''
  if (oi && fi && oi === fi) score += 25

  const ot = tokens(ourName)
  const overlap = ot.filter((t) => t.length > 2 && fifaTok.some((f) => f === t || f.includes(t) || t.includes(f)))
    .length
  score += overlap * 8
  if (!oi || oi !== fi) {
    if (overlap < 1) return -1
  }
  return score
}

async function loadFifa22() {
  const url =
    'https://raw.githubusercontent.com/guebin/DV2021/master/_notebooks/2021-10-25-FIFA22_official_data.csv'
  const text = await (await fetch(url)).text()
  const lines = text.split(/\r?\n/)
  const header = parseCsvLine(lines[0])
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue
    const cols = parseCsvLine(lines[i])
    const obj = Object.fromEntries(header.map((k, j) => [k, cols[j]]))
    rows.push({
      id: Number(obj.ID),
      name: String(obj.Name || '').trim(),
      age: Number(obj.Age) || null,
      nationality: String(obj.Nationality || '').trim(),
      overall: Number(obj.Overall) || null,
      potential: Number(obj.Potential) || null,
      club: String(obj.Club || '').trim(),
      valueRaw: String(obj.Value || '').trim(),
      wageRaw: String(obj.Wage || '').trim(),
      foot: String(obj['Preferred Foot'] || '').trim(),
      height: String(obj.Height || '').trim(),
      bestPosition: String(obj['Best Position'] || '').trim(),
      reputation: Number(obj['International Reputation']) || null,
    })
  }
  return rows
}

async function main() {
  const root = path.join(__dirname, '..')
  const players = JSON.parse(fs.readFileSync(path.join(root, 'data', 'players.json'), 'utf8'))
  const fifa = await loadFifa22()
  const byId = Object.fromEntries(fifa.map((r) => [r.id, r]))

  const names = [...new Set(players.map((p) => p.name))]
  console.log(`Matching bios for ${names.length} unique names…`)

  const bios = {}
  let matched = 0

  for (const name of names) {
    let row = null
    let source = 'auto'

    if (MANUAL_IDS[name] && byId[MANUAL_IDS[name]]) {
      row = byId[MANUAL_IDS[name]]
      source = 'manual'
    } else {
      let best = null
      let bestScore = 0
      for (const f of fifa) {
        const s = scoreMatch(name, f.name)
        if (s > bestScore) {
          bestScore = s
          best = f
        }
      }
      if (best && bestScore >= 35) row = best
    }

    if (!row) continue
    matched++
    const value = parseEuro(row.valueRaw)
    const wage = parseEuro(row.wageRaw)
    bios[name] = {
      sofifaId: row.id,
      fifaName: row.name,
      age: row.age,
      nationality: row.nationality,
      overall: row.overall,
      potential: row.potential,
      club: row.club,
      value: value.display,
      valueEuros: value.euros,
      wage: wage.display,
      wageEuros: wage.euros,
      preferredFoot: row.foot || null,
      height: row.height || null,
      bestPosition: row.bestPosition || null,
      internationalReputation: row.reputation,
      source,
      snapshot: 'FIFA 22 / 2021-22 season card',
    }
  }

  const out = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'FIFA22_official_data.csv (SoFIFA mirror)',
      note: 'Market value & wage are FIFA 22 card estimates for the 2021-22 season — not live Transfermarkt prices.',
      uniqueNames: names.length,
      matchedNames: matched,
    },
    bios,
  }

  const outPath = path.join(root, 'data', 'player_bios.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath} (${matched}/${names.length})`)
  console.log('Messi', bios['Lionel Messi'])
  console.log('Haaland', bios['Erling Haaland'])
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
