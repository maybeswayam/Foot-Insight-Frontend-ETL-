/**
 * Normalize lineup / StatsBomb legal names for display + photo lookup.
 * Handles dual surnames (Messi Cuccittini), particles (Di María), and nicknames.
 */

const SURNAME_PARTICLES = new Set([
  'di',
  'de',
  'da',
  'do',
  'dos',
  'das',
  'del',
  'della',
  'van',
  'von',
  'la',
  'le',
  'el',
  'mc',
  'mac',
  'st',
  'san',
  'santa',
  'al',
  'bin',
  'ibn',
])

function tokenize(name: string): string[] {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
}

function isParticle(token: string): boolean {
  return SURNAME_PARTICLES.has(token.toLowerCase().replace(/\./g, ''))
}

/** Extract the surname people actually use (Di María, Messi, De Paul). */
export function extractSurname(name: string): string {
  const parts = tokenize(name)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]

  // … Di María Hernández → Di María
  for (let i = parts.length - 2; i >= 1; i--) {
    if (isParticle(parts[i]) && i + 1 < parts.length) {
      return `${parts[i]} ${parts[i + 1]}`
    }
  }

  // Mac Allister (particle glued as separate token)
  if (parts.length >= 2 && isParticle(parts[parts.length - 2])) {
    return parts.slice(-2).join(' ')
  }

  // Dual surname lists (Spanish): prefer paternal = second-to-last when 3+ tokens
  // "Lionel Andrés Messi Cuccittini" → Messi
  // "Nahuel Molina Lucero" → Molina
  if (parts.length >= 3) {
    return parts[parts.length - 2]
  }

  return parts[parts.length - 1]
}

/**
 * Best single string to query photo APIs / static maps with.
 * Prefer StatsBomb nickname when present ("Lionel Messi").
 */
export function resolvePlayerLookupName(
  name: string,
  nickname?: string | null
): string {
  if (nickname && nickname.trim()) return nickname.trim()
  return preferredCommonName(name)
}

/** First name + common surname guess when no nickname exists. */
export function preferredCommonName(fullName: string): string {
  const parts = tokenize(fullName)
  if (parts.length <= 2) return parts.join(' ')

  // Ángel … Di María … → Ángel Di María
  for (let i = 1; i < parts.length - 1; i++) {
    if (isParticle(parts[i])) {
      return `${parts[0]} ${parts[i]} ${parts[i + 1]}`
    }
  }

  // Lionel Andrés Messi Cuccittini → Lionel Messi
  return `${parts[0]} ${parts[parts.length - 2]}`
}

/** Pitch / list label under the photo. */
export function playerShortLabel(
  name: string,
  nickname?: string | null
): string {
  const source = nickname?.trim() || name
  return extractSurname(source)
}

/**
 * Ordered unique variants for TheSportsDB / static photo map lookup.
 */
export function buildPlayerNameVariants(
  playerName: string,
  nickname?: string | null
): string[] {
  const variants: string[] = []
  const push = (v?: string | null) => {
    const t = v?.trim()
    if (t && !variants.includes(t)) variants.push(t)
  }

  push(nickname)
  push(playerName)

  const stripped = playerName.replace(/\s+(Jr\.?|Sr\.?|III|II|IV)$/i, '').trim()
  push(stripped)

  const parts = tokenize(stripped)
  if (parts.length >= 2) {
    push(preferredCommonName(stripped))
    push(`${parts[0]} ${parts[parts.length - 1]}`) // first + last (Theo Hernández)
    push(`${parts[0]} ${parts[parts.length - 2]}`) // first + penultimate (Lionel Messi)
    push(parts.slice(-2).join(' ')) // Messi Cuccittini / Di María
    push(extractSurname(stripped))
  }

  // Accent-stripped copies of everything so far
  const base = [...variants]
  for (const v of base) {
    const noAccent = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    push(noAccent)
  }

  return variants
}
