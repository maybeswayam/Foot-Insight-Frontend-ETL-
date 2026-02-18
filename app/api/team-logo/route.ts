import { NextRequest, NextResponse } from 'next/server'
import { imageService } from '@/lib/imageService'

/**
 * GET /api/team-logo?name=Bayern+Munich
 * Returns { name, logo } – proxies TheSportsDB with in-memory caching.
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json({ error: 'name param required' }, { status: 400 })
  }

  const logo = await imageService.fetchTeamLogoByName(name)
  return NextResponse.json(
    { name, logo },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    },
  )
}
