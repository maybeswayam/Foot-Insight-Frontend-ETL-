'use client'

import { useEffect, useState } from 'react'

/**
 * Global in-memory player photo cache — same pattern as TeamLogo.
 */
const photoCache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

const DEFAULT_PHOTO =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"%3E%3Crect fill="%231a1a2e" width="120" height="120" rx="16"/%3E%3Ccircle cx="60" cy="42" r="18" fill="%2322c55e" opacity="0.3"/%3E%3Cpath d="M 35 75 Q 35 60 60 60 Q 85 60 85 75 L 85 100 L 35 100 Z" fill="%2322c55e" opacity="0.2"/%3E%3C/svg%3E'

async function fetchPhoto(playerName: string): Promise<string> {
  if (photoCache.has(playerName)) return photoCache.get(playerName)!
  if (inflight.has(playerName)) return inflight.get(playerName)!

  const promise = (async () => {
    try {
      const res = await fetch(
        `/api/player-photo?name=${encodeURIComponent(playerName)}`,
      )
      if (!res.ok) return DEFAULT_PHOTO
      const data = await res.json()
      const url = data.photo || DEFAULT_PHOTO
      photoCache.set(playerName, url)
      return url
    } catch {
      return DEFAULT_PHOTO
    } finally {
      inflight.delete(playerName)
    }
  })()

  inflight.set(playerName, promise)
  return promise
}

interface PlayerPhotoProps {
  playerName: string
  size?: number
  className?: string
  /** If true, renders a rounded (circular) photo. Otherwise rounded-xl. */
  rounded?: boolean
}

export function PlayerPhoto({
  playerName,
  size = 48,
  className = '',
  rounded = false,
}: PlayerPhotoProps) {
  const [src, setSrc] = useState<string>(photoCache.get(playerName) || '')

  useEffect(() => {
    let cancelled = false
    if (!src) {
      fetchPhoto(playerName).then((url) => {
        if (!cancelled) setSrc(url)
      })
    }
    return () => {
      cancelled = true
    }
  }, [playerName, src])

  const roundedClass = rounded ? 'rounded-full' : 'rounded-xl'

  if (!src) {
    return (
      <div
        className={`${roundedClass} bg-secondary/40 animate-pulse flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={playerName}
      width={size}
      height={size}
      className={`${roundedClass} object-cover bg-white/5 flex-shrink-0 ${className}`}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src = DEFAULT_PHOTO
      }}
    />
  )
}
