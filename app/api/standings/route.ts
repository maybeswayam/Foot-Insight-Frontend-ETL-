import { NextResponse } from 'next/server'
import { loadStandings } from '@/lib/dataLoader'

const CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400'

export async function GET() {
  const standings = await loadStandings()
  return NextResponse.json(standings, {
    headers: { 'Cache-Control': CACHE },
  })
}
