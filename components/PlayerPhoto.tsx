'use client'

import { useState } from 'react'

const DEFAULT_PHOTO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"%3E%3Crect fill="%231a1a2e" width="120" height="120" rx="16"/%3E%3Ccircle cx="60" cy="42" r="18" fill="%2322c55e" opacity="0.3"/%3E%3Cpath d="M 35 75 Q 35 60 60 60 Q 85 60 85 75 L 85 100 L 35 100 Z" fill="%2322c55e" opacity="0.2"/%3E%3C/svg%3E'

interface PlayerPhotoProps {
  playerName: string
  size?: number
  className?: string
  /** If true, renders a rounded (circular) photo. Otherwise rounded-xl. */
  rounded?: boolean
}

/**
 * Player face via our proxy (same pattern as TeamLogo).
 * Server fetches SoFIFA / TheSportsDB so the browser never hotlinks those CDNs.
 */
export function PlayerPhoto({
  playerName,
  size = 48,
  className = '',
  rounded = false,
}: PlayerPhotoProps) {
  const [erroredName, setErroredName] = useState<string | null>(null)

  const roundedClass = rounded ? 'rounded-full' : 'rounded-xl'
  const failed = erroredName === playerName
  const src = failed
    ? DEFAULT_PHOTO
    : `/api/player-photo-proxy?name=${encodeURIComponent(playerName)}&v=era22`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={playerName}
      src={src}
      alt={playerName}
      width={size}
      height={size}
      className={`${roundedClass} object-cover bg-white/5 flex-shrink-0 ${className}`}
      onError={() => setErroredName(playerName)}
    />
  )
}
