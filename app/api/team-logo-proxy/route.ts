import { NextRequest, NextResponse } from 'next/server'
import { imageService } from '@/lib/imageService'

/**
 * GET /api/team-logo-proxy?name=Barcelona
 *
 * Proxies the team badge image through our server so the browser never
 * directly loads from TheSportsDB (avoids hotlink-protection / CORS issues).
 * Returns the actual image bytes with aggressive cache headers.
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) {
    return new NextResponse('name param required', { status: 400 })
  }

  const logoUrl = await imageService.fetchTeamLogoByName(name)

  // If it's the inline SVG default, return it directly
  if (logoUrl.startsWith('data:')) {
    const base64 = logoUrl.split(',')[1]
    const svgContent = decodeURIComponent(logoUrl.split(',')[1] || '')
    // For data URIs, redirect isn't ideal — return a generic shield SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1a1a2e" width="100" height="100" rx="16"/><text x="50" y="54" text-anchor="middle" dy=".3em" font-size="36" fill="#22c55e">⚽</text></svg>`
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  }

  try {
    const imgResponse = await fetch(logoUrl, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
      },
    })

    if (!imgResponse.ok) {
      // Return fallback SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1a1a2e" width="100" height="100" rx="16"/><text x="50" y="54" text-anchor="middle" dy=".3em" font-size="36" fill="#22c55e">⚽</text></svg>`
      return new NextResponse(svg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
      })
    }

    const contentType = imgResponse.headers.get('content-type') || 'image/png'
    const buffer = await imgResponse.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=2592000, s-maxage=2592000', // 30 days
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#1a1a2e" width="100" height="100" rx="16"/><text x="50" y="54" text-anchor="middle" dy=".3em" font-size="36" fill="#22c55e">⚽</text></svg>`
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
    })
  }
}
