import { NextRequest, NextResponse } from 'next/server'
import { imageService } from '@/lib/imageService'

/**
 * GET /api/player-photo?name=Lionel+Messi
 * Returns { name, photo } – proxies TheSportsDB with in-memory caching.
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json({ error: 'name param required' }, { status: 400 })
  }

  const photo = await imageService.fetchPlayerPhotoByName(name)
  return NextResponse.json(
    { name, photo },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    },
  )
}
