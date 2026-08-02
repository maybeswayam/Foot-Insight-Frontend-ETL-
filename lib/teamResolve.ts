import teams from '@/data/teams.json'
import { normalizeTeamName } from '@/lib/teamNames'

type RawTeam = { teamId: number; name: string }

const TEAM_BY_NAME: Record<string, number> = {}
for (const t of teams as RawTeam[]) {
  TEAM_BY_NAME[t.name] = t.teamId
}

/** Resolve a club/nation string to `/teams/{id}` when it exists in the archive. */
export function resolveTeamHref(raw: string | null | undefined): string | null {
  const key = normalizeTeamName(raw || '')
  if (!key) return null
  const id = TEAM_BY_NAME[key]
  return id != null ? `/teams/${id}` : null
}

export function datasetTeamName(raw: string | null | undefined): string {
  return normalizeTeamName(raw || '') || String(raw || '')
}
