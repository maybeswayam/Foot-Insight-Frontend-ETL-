import { buildPlayerNameVariants, resolvePlayerLookupName } from '@/lib/playerNames'
import { normalizeTeamName } from '@/lib/teamNames'

export interface PlayerIndexEntry {
  playerId: string
  name: string
  team: string
  club: string | null
  competition?: string
}

/**
 * Build an in-memory name → candidates index for lineup / photo linking.
 */
export function buildPlayerIdIndex(players: PlayerIndexEntry[]): Map<string, PlayerIndexEntry[]> {
  const index = new Map<string, PlayerIndexEntry[]>()

  const push = (key: string, entry: PlayerIndexEntry) => {
    const k = key.trim().toLowerCase()
    if (!k) return
    const list = index.get(k) || []
    if (!list.some((e) => e.playerId === entry.playerId)) list.push(entry)
    index.set(k, list)
  }

  for (const p of players) {
    for (const v of buildPlayerNameVariants(p.name)) {
      push(v, p)
    }
  }

  return index
}

/**
 * Resolve a lineup / display name to a Foot-Insights playerId.
 * Prefers candidates whose team/club matches when provided.
 */
export function resolvePlayerId(
  index: Map<string, PlayerIndexEntry[]>,
  name: string,
  opts?: { nickname?: string | null; team?: string | null }
): string | null {
  const lookup = resolvePlayerLookupName(name, opts?.nickname)
  const variants = buildPlayerNameVariants(name, opts?.nickname)
  if (lookup && !variants.includes(lookup)) variants.unshift(lookup)

  let candidates: PlayerIndexEntry[] = []
  for (const v of variants) {
    const hit = index.get(v.trim().toLowerCase())
    if (hit?.length) {
      candidates = hit
      break
    }
  }
  if (!candidates.length) return null

  const teamKey = normalizeTeamName(opts?.team || '')
  if (teamKey) {
    const teamHit = candidates.find((c) => {
      const t = normalizeTeamName(c.team)
      const club = normalizeTeamName(c.club || '')
      return t === teamKey || club === teamKey
    })
    if (teamHit) return teamHit.playerId
  }

  // Prefer league row over WC when multiple exact names
  const league = candidates.find((c) => c.competition && c.competition !== 'FIFA World Cup')
  return (league || candidates[0]).playerId
}
