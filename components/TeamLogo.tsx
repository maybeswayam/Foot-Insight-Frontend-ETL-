'use client'

import { useState } from 'react'

const DEFAULT_LOGO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%231a1a2e" width="100" height="100" rx="16"/%3E%3Ctext x="50" y="54" text-anchor="middle" dy=".3em" font-size="36" fill="%2322c55e"%3E⚽%3C/text%3E%3C/svg%3E'

interface TeamLogoProps {
  teamName: string
  size?: number
  className?: string
}

/**
 * Displays a team logo by pointing to our proxy API route.
 * The proxy fetches the image server-side (no hotlinking issues).
 */
export function TeamLogo({ teamName, size = 40, className = '' }: TeamLogoProps) {
  const [errored, setErrored] = useState(false)

  const src = errored
    ? DEFAULT_LOGO
    : `/api/team-logo-proxy?name=${encodeURIComponent(teamName)}`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={teamName}
      width={size}
      height={size}
      className={`rounded-xl object-contain bg-white/5 flex-shrink-0 ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
