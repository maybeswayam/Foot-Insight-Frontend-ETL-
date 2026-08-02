'use client'

import Link from 'next/link'
import { TeamLogo } from '@/components/TeamLogo'
import { datasetTeamName, resolveTeamHref } from '@/lib/teamResolve'

interface TeamLinkProps {
  teamName: string
  size?: number
  className?: string
  /** Show team name text next to logo */
  showName?: boolean
  nameClassName?: string
}

/**
 * Team logo that links to /teams/[id] when the club/nation is in the archive.
 */
export function TeamLink({
  teamName,
  size = 40,
  className = '',
  showName = false,
  nameClassName = 'text-cream hover:text-pitch transition-colors',
}: TeamLinkProps) {
  const dataset = datasetTeamName(teamName)
  const href = resolveTeamHref(teamName)
  const logo = (
    <TeamLogo teamName={dataset || teamName} size={size} className={className} />
  )

  if (!href) {
    return showName ? (
      <span className="inline-flex items-center gap-2">
        {logo}
        <span className={nameClassName}>{teamName}</span>
      </span>
    ) : (
      logo
    )
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 group ${showName ? '' : ''}`}
      title={`View ${dataset || teamName}`}
    >
      {logo}
      {showName && <span className={nameClassName}>{teamName}</span>}
    </Link>
  )
}
