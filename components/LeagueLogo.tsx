'use client'

import { useState } from 'react'

interface LeagueLogoProps {
  league: 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1'
  size?: number
  className?: string
}

// High-quality league logos from a reliable CDN
const LEAGUE_LOGOS: Record<string, string> = {
  'premier-league': 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
  'la-liga': 'https://upload.wikimedia.org/wikipedia/commons/1/13/LaLiga_EA_Sports_2023_Vertical_Logo.svg',
  'bundesliga': 'https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg',
  'serie-a': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Serie_A_logo_2022.svg',
  'ligue-1': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue_1_Logo.svg',
}

// Fallback colored badges if images fail to load
const LEAGUE_FALLBACKS: Record<string, { logo: string; color: string; bg: string }> = {
  'premier-league': { logo: 'PL', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  'la-liga': { logo: 'LL', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  'bundesliga': { logo: 'BL', color: 'text-red-400', bg: 'bg-red-500/20' },
  'serie-a': { logo: 'SA', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'ligue-1': { logo: 'L1', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
}

export function LeagueLogo({ league, size = 24, className = '' }: LeagueLogoProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    const fallback = LEAGUE_FALLBACKS[league]
    return (
      <span
        className={`${fallback.bg} ${fallback.color} px-2 py-0.5 rounded text-xs font-black inline-flex items-center justify-center ${className}`}
        style={{ minWidth: `${size}px`, height: `${size}px` }}
      >
        {fallback.logo}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LEAGUE_LOGOS[league]}
      alt={league}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
