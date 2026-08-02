'use client'

import Link from 'next/link'
import { CountryFlag } from '@/components/CountryFlag'
import { TeamLogo } from '@/components/TeamLogo'
import { datasetTeamName, resolveTeamHref } from '@/lib/teamResolve'
import type { PlayerCareer } from '@/lib/types'

interface PlayerCareerPathProps {
  career: PlayerCareer
}

export function PlayerCareerPath({ career }: PlayerCareerPathProps) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {career.countries.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-2 rounded-[2px] border border-line-strong bg-ink-2 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[1px] text-fog"
          >
            <CountryFlag country={c} size={14} />
            {c}
          </span>
        ))}
        <span className="inline-flex items-center rounded-[2px] border border-line px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[1px] text-faint">
          {career.clubs.length} clubs · {career.leagues.length} leagues · {career.firstSeason}–{career.lastSeason}
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-min items-stretch gap-0">
          {career.path.map((seg, i) => {
            const href = resolveTeamHref(seg.club)
            const logoName = datasetTeamName(seg.club) || seg.club
            const card = (
              <div
                className="w-[160px] sm:w-[180px] border border-line-strong bg-ink-2 p-4 animate-slide-up hover:bg-surface transition-colors h-full"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="mb-3 flex justify-center">
                  <TeamLogo teamName={logoName} size={40} />
                </div>
                <div className="text-center font-display text-lg leading-none tracking-[1px] text-cream group-hover:text-pitch">
                  {seg.club.toUpperCase()}
                </div>
                <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-fog">
                  <CountryFlag country={seg.country} size={12} />
                  {seg.country}
                </div>
                <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-[1px] text-faint">
                  {seg.fromSeason === seg.toSeason
                    ? seg.fromSeason
                    : `${seg.fromSeason}–${seg.toSeason}`}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-px bg-line text-center">
                  <div className="bg-ink-2 px-1 py-1.5">
                    <div className="text-[8px] uppercase tracking-[1px] text-faint">G</div>
                    <div className="font-display text-base text-pitch tabular-nums">{seg.goals}</div>
                  </div>
                  <div className="bg-ink-2 px-1 py-1.5">
                    <div className="text-[8px] uppercase tracking-[1px] text-faint">A</div>
                    <div className="font-display text-base text-gold tabular-nums">{seg.assists}</div>
                  </div>
                </div>
              </div>
            )

            return (
              <div key={`${seg.club}-${seg.fromYear}`} className="flex items-stretch">
                {href ? (
                  <Link href={href} className="group block">
                    {card}
                  </Link>
                ) : (
                  card
                )}
                {i < career.path.length - 1 && (
                  <div className="flex w-8 shrink-0 items-center justify-center text-pitch sm:w-10">
                    <span className="font-display text-xl leading-none">→</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-faint">
        Path shows Big 5 league stops via Understat (plus RFPL when present). Cups and clubs outside
        those leagues are not included — so this is a league career map, not a full transfer history.
        Click a club card to open that team&apos;s page when it&apos;s in the 2022 archive.
      </p>
    </div>
  )
}
