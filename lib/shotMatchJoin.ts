import type { RawMatch } from '@/lib/dataLoader'
import { normalizeTeamName } from '@/lib/teamNames'
import type { PlayerShotEvent } from '@/lib/types'

/** Build date|home|away → local matchId index (home/away order-insensitive). */
export function buildMatchJoinIndex(
  matches: RawMatch[],
  teamLookup: Record<number, string>
): Map<string, string> {
  const index = new Map<string, string>()

  for (const m of matches) {
    const date = String(m.date || '').slice(0, 10)
    const home = normalizeTeamName(teamLookup[m.homeTeam.teamId] || '')
    const away = normalizeTeamName(teamLookup[m.awayTeam.teamId] || '')
    if (!date || !home || !away) continue
    const id = String(m.matchId)
    index.set(`${date}|${home}|${away}`, id)
    index.set(`${date}|${away}|${home}`, id)
  }

  return index
}

export function attachLocalMatchIds(
  shots: PlayerShotEvent[],
  matchIndex: Map<string, string>
): PlayerShotEvent[] {
  return shots.map((s) => {
    const date = String(s.date || '').slice(0, 10)
    const home = normalizeTeamName(s.homeTeam || '')
    const away = normalizeTeamName(s.awayTeam || '')
    const localMatchId =
      date && home && away ? matchIndex.get(`${date}|${home}|${away}`) ?? null : null
    return { ...s, localMatchId }
  })
}
