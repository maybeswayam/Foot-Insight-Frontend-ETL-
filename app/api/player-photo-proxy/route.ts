import { NextRequest, NextResponse } from 'next/server'
import { imageService } from '@/lib/imageService'

/**
 * GET /api/player-photo-proxy?name=Lionel+Messi
 *
 * Proxies the player face through our server so the browser never
 * hotlinks SoFIFA / TheSportsDB (those CDNs often block direct <img> loads).
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) {
    return new NextResponse('name param required', { status: 400 })
  }

  const photoUrl = await imageService.fetchPlayerPhotoByName(name)

  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect fill="#1a1a2e" width="120" height="120" rx="16"/><circle cx="60" cy="42" r="18" fill="#22c55e" opacity="0.3"/><path d="M 35 75 Q 35 60 60 60 Q 85 60 85 75 L 85 100 L 35 100 Z" fill="#22c55e" opacity="0.2"/></svg>`

  if (!photoUrl || photoUrl.startsWith('data:')) {
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  try {
    const imgResponse = await fetch(photoUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'https://sofifa.com/',
      },
    })

    if (!imgResponse.ok) {
      return new NextResponse(fallbackSvg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=600' },
      })
    }

    const contentType = imgResponse.headers.get('content-type') || 'image/png'
    if (!contentType.startsWith('image/')) {
      return new NextResponse(fallbackSvg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=600' },
      })
    }

    const buffer = await imgResponse.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new NextResponse(fallbackSvg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=600' },
    })
  }
}
