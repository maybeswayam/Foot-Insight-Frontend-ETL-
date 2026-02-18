import { imageService } from './imageService'

/**
 * Enriches teams with real logos from TheSportsDB API (batched to avoid rate-limits)
 */
export async function enrichTeamsData(teams: any[]) {
  const teamNames = teams.map((t) => t.name as string)
  const logoMap = await imageService.fetchTeamLogosBatch(teamNames)

  return teams.map((team) => ({
    ...team,
    logo: logoMap.get(team.name) || imageService.defaultTeamLogo,
  }))
}

/**
 * Enriches players with real photos from TheSportsDB API (batched)
 */
export async function enrichPlayersData(players: any[]) {
  const enrichedPlayers: any[] = []

  // Process in small batches
  const batchSize = 5
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = players.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (player) => {
        try {
          const photoUrl = await imageService.fetchPlayerPhotoByName(player.name)
          return { ...player, photo: photoUrl }
        } catch {
          return player
        }
      }),
    )
    enrichedPlayers.push(...results)
  }
  return enrichedPlayers
}
