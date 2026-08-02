/**
 * Replace Wikimedia match-stills in player_photos_era.json with clean FIFA 22 faces.
 * Run: node scripts/patch_era_legend_faces.js
 */
const fs = require('fs')
const path = require('path')

const FACE_SIZE = 240

const LEGEND_IDS = {
  'Lionel Messi': 158023,
  'L. Messi': 158023,
  'Cristiano Ronaldo': 20801,
  'C. Ronaldo': 20801,
  Neymar: 190871,
  'Neymar Jr.': 190871,
  'Neymar Jr': 190871,
  'Robert Lewandowski': 188545,
  'R. Lewandowski': 188545,
  'Luis Suárez': 176580,
  'Luis Suarez': 176580,
  'L. Suárez': 176580,
  'Andrés Iniesta': 41,
  'Andres Iniesta': 41,
  'A. Iniesta': 41,
}

function sofifaFaceUrl(id, size = FACE_SIZE) {
  const padded = String(id).padStart(6, '0')
  return `https://cdn.sofifa.net/players/${padded.slice(0, 3)}/${padded.slice(3)}/22_${size}.png`
}

async function main() {
  const file = path.join(__dirname, '..', 'data', 'player_photos_era.json')
  const era = JSON.parse(fs.readFileSync(file, 'utf8'))

  let patched = 0
  let wikiRemoved = 0

  // Force legend faces
  for (const [name, id] of Object.entries(LEGEND_IDS)) {
    const url = sofifaFaceUrl(id)
    era.photos[name] = url
    patched++
  }

  // Any remaining Wikimedia URLs are match screenshots — drop them so static cutouts win
  for (const [name, url] of Object.entries(era.photos)) {
    if (/wikimedia|wikipedia/i.test(String(url))) {
      delete era.photos[name]
      wikiRemoved++
      console.log('removed wiki', name)
    }
  }

  // Re-apply legends after wiki purge
  for (const [name, id] of Object.entries(LEGEND_IDS)) {
    era.photos[name] = sofifaFaceUrl(id)
  }

  era.meta = {
    ...era.meta,
    patchedAt: new Date().toISOString(),
    faceSize: FACE_SIZE,
    note:
      'SoFIFA FIFA 22 face cutouts only (no Wikimedia match stills). Preferred for 2021-22 archive look.',
    playerCount: Object.keys(era.photos).length,
  }

  fs.writeFileSync(file, JSON.stringify(era, null, 2))
  console.log(`Patched ${patched} legend keys; removed ${wikiRemoved} wiki URLs`)
  console.log(`Wrote ${file} (${era.meta.playerCount} keys)`)

  // Sanity HEAD checks
  for (const name of ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr.', 'Robert Lewandowski']) {
    const url = era.photos[name]
    const res = await fetch(url, { method: 'HEAD' })
    console.log(res.status, name, url)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
