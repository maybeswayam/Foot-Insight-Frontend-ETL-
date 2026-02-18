import { NextResponse } from 'next/server'
import { loadStandings } from '@/lib/dataLoader'

export async function GET() {
  const standings = await loadStandings()
  return NextResponse.json(standings)
}
