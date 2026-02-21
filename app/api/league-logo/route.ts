import { NextRequest, NextResponse } from 'next/server'

const LEAGUE_LOGO_URLS: Record<string, string> = {
  'premier-league': 'https://resources.premierleague.com/premierleague/badges/rb/t3.svg',
  'la-liga': 'https://assets.laliga.com/assets/logos/laliga-v/laliga-v-300x300.png',
  'bundesliga': 'https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg',
  'serie-a': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Serie_A_logo_2022.png',
  'ligue-1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ligue_1_Logo.svg/1200px-Ligue_1_Logo.svg.png',
}

/**
 * Proxy endpoint for league logos to avoid hotlinking and CORS issues
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const league = searchParams.get('league')

  if (!league || !LEAGUE_LOGO_URLS[league]) {
    return NextResponse.json({ error: 'Invalid league' }, { status: 400 })
  }

  try {
    const logoUrl = LEAGUE_LOGO_URLS[league]
    const response = await fetch(logoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'force-cache',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('League logo fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
  }
}
