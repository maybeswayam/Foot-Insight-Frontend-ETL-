import { NextRequest, NextResponse } from 'next/server'

const LEAGUE_LOGO_URLS: Record<string, string> = {
  'premier-league': 'https://p.turbosquid.com/ts-thumb/gK/jNfe0c/LI/premierleague00/jpg/1645469917/1920x1080/fit_q99/fb5fd61da1c8cd88bf8f6ae55e59b7e14e9c5f84/premierleague00.jpg',
  'la-liga': 'https://1000logos.net/wp-content/uploads/2018/08/La-Liga-Logo.png',
  'bundesliga': 'https://1000logos.net/wp-content/uploads/2018/05/Bundesliga-Logo.png',
  'serie-a': 'https://1000logos.net/wp-content/uploads/2022/08/Serie-A-Logo.png',
  'ligue-1': 'https://1000logos.net/wp-content/uploads/2018/03/Ligue-1-Logo.png',
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
