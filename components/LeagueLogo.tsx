'use client'

import { useState } from 'react'

interface LeagueLogoProps {
  league: 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1'
  size?: number
  className?: string
}

// Fallback gradient badges with league branding colors
const LEAGUE_FALLBACKS: Record<string, { 
  text: string
  color: string
  bg: string
  border: string 
}> = {
  'premier-league': { 
    text: 'PL', 
    color: 'text-white', 
    bg: 'bg-gradient-to-br from-purple-600 to-pink-500',
    border: 'border border-purple-400/30'
  },
  'la-liga': { 
    text: 'LL', 
    color: 'text-white', 
    bg: 'bg-gradient-to-br from-orange-500 to-red-500',
    border: 'border border-orange-400/30'
  },
  'bundesliga': { 
    text: 'BL', 
    color: 'text-white', 
    bg: 'bg-gradient-to-br from-red-600 to-black',
    border: 'border border-red-400/30'
  },
  'serie-a': { 
    text: 'SA', 
    color: 'text-white', 
    bg: 'bg-gradient-to-br from-blue-600 to-cyan-500',
    border: 'border border-blue-400/30'
  },
  'ligue-1': { 
    text: 'L1', 
    color: 'text-white', 
    bg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    border: 'border border-cyan-400/30'
  },
}

export function LeagueLogo({ league, size = 24, className = '' }: LeagueLogoProps) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    const fallback = LEAGUE_FALLBACKS[league]
    return (
      <span
        className={`${fallback.bg} ${fallback.color} ${fallback.border} px-2 py-0.5 rounded-md text-xs font-black inline-flex items-center justify-center shadow-sm ${className}`}
        style={{ minWidth: `${size}px`, height: `${size}px` }}
      >
        {fallback.text}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/league-logo?league=${league}`}
      alt={league}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
