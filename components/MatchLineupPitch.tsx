'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { placeFormation } from '@/lib/formations'
import { inferFormation, normalizePosCode } from '@/lib/matchAnalytics'
import { playerShortLabel, resolvePlayerLookupName } from '@/lib/playerNames'
import type { LineupPlayer } from '@/lib/types'

type Side = 'home' | 'away'

interface PlacedPlayer {
  player: LineupPlayer
  x: number
  y: number
  side: Side
  posCode: string
}

function placeSide(players: LineupPlayer[], side: Side): PlacedPlayer[] {
  const starters = players.filter((p) => p.isStarter)
  const formation = inferFormation(starters)
  return placeFormation(starters, formation, side).map((p) => ({
    player: p.player,
    x: p.x,
    y: p.y,
    side,
    posCode: p.posCode,
  }))
}

function photoName(player: LineupPlayer): string {
  return resolvePlayerLookupName(player.name, player.nickname)
}

function labelName(player: LineupPlayer): string {
  return playerShortLabel(player.name, player.nickname)
}

const LINE_RANK: Record<string, number> = {
  GK: 0,
  LB: 1,
  CB: 2,
  RB: 3,
  DM: 4,
  LM: 5,
  CM: 6,
  RM: 7,
  AM: 8,
  LW: 9,
  FW: 10,
  RW: 11,
  UNK: 12,
}

function sortXi(players: LineupPlayer[]): LineupPlayer[] {
  return [...players].sort((a, b) => {
    const ca = normalizePosCode(a.position)
    const cb = normalizePosCode(b.position)
    if ((LINE_RANK[ca] ?? 12) !== (LINE_RANK[cb] ?? 12)) {
      return (LINE_RANK[ca] ?? 12) - (LINE_RANK[cb] ?? 12)
    }
    return (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99)
  })
}

interface MatchLineupPitchProps {
  players: LineupPlayer[]
  homeName: string
  awayName: string
}

export function MatchLineupPitch({ players, homeName, awayName }: MatchLineupPitchProps) {
  const resolveId = useMemo(
    () => (player: LineupPlayer) => player.playerId ?? null,
    [],
  )

  const homeStarters = players.filter((p) => p.side === 'home' && p.isStarter)
  const awayStarters = players.filter((p) => p.side === 'away' && p.isStarter)
  const homeForm = inferFormation(homeStarters)
  const awayForm = inferFormation(awayStarters)

  const home = placeSide(
    players.filter((p) => p.side === 'home'),
    'home'
  )
  const away = placeSide(
    players.filter((p) => p.side === 'away'),
    'away'
  )
  const all = [...home, ...away]

  const homeBench = players.filter((p) => p.side === 'home' && !p.isStarter)
  const awayBench = players.filter((p) => p.side === 'away' && !p.isStarter)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-pitch">{homeName}</span>
          <span className="rounded-[2px] border border-pitch/40 bg-pitch/10 px-2 py-0.5 font-display text-lg tracking-[1px] text-pitch">
            {homeForm}
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint">Formation map</span>
        <div className="flex items-center gap-2">
          <span className="rounded-[2px] border border-[#4BB8E8]/40 bg-[#0096DC]/10 px-2 py-0.5 font-display text-lg tracking-[1px] text-[#4BB8E8]">
            {awayForm}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#4BB8E8]">{awayName}</span>
        </div>
      </div>

      <div className="relative mx-auto w-full aspect-[16/9] sm:aspect-[2/1] rounded-[2px] overflow-hidden border border-line-strong bg-[#0d3d1f]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(90deg, #0d3d1f 0%, #0d3d1f 12.5%, #0f4a24 12.5%, #0f4a24 25%)',
          }}
        />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-pitch/[0.04] pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#0096DC]/[0.05] pointer-events-none" />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect x="1.5" y="2" width="97" height="96" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.35" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.28)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="0.55" fill="rgba(255,255,255,0.4)" />
          <rect x="1.5" y="22" width="14" height="56" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
          <rect x="84.5" y="22" width="14" height="56" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.3" />
          <rect x="1.5" y="35" width="6" height="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.25" />
          <rect x="92.5" y="35" width="6" height="30" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.25" />
        </svg>

        {all.map(({ player, x, y, side, posCode }) => {
          const id = resolveId(player)
          const inner = (
            <>
              <div className="relative">
                <div
                  className={`h-9 w-9 sm:h-11 sm:w-11 overflow-hidden rounded-full border-2 bg-ink shadow-lg shadow-black/40 ${
                    side === 'home' ? 'border-pitch' : 'border-[#4BB8E8]'
                  }`}
                >
                  <PlayerPhoto
                    playerName={photoName(player)}
                    size={44}
                    rounded
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[8px] font-bold leading-none ${
                    side === 'home' ? 'bg-pitch text-ink' : 'bg-[#0096DC] text-cream'
                  }`}
                >
                  {player.jerseyNumber ?? '·'}
                </span>
              </div>
              <span className="mt-1 max-w-[64px] sm:max-w-[78px] truncate rounded-[1px] bg-ink/75 px-1 py-px text-center text-[7px] sm:text-[8px] font-semibold uppercase tracking-wide text-cream backdrop-blur-sm group-hover:text-pitch">
                {labelName(player)}
              </span>
              <span className="text-[6px] sm:text-[7px] uppercase tracking-wide text-white/50">{posCode}</span>
            </>
          )

          const className =
            'absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group'
          const style = { left: `${x}%`, top: `${y}%` }
          const title = `${player.name} · ${player.position || posCode}${
            player.minutesPlayed != null ? ` · ${player.minutesPlayed}'` : ''
          }`

          return id ? (
            <Link
              key={`${side}-${player.jerseyNumber}-${player.name}`}
              href={`/players/${id}`}
              className={className}
              style={style}
              title={title}
            >
              {inner}
            </Link>
          ) : (
            <div
              key={`${side}-${player.jerseyNumber}-${player.name}`}
              className={className}
              style={style}
              title={title}
            >
              {inner}
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] text-faint uppercase tracking-[1.5px]">
        Click a player to open their profile · {homeForm} / {awayForm} · home left · away right
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
        <XiSheet title={`${homeName} XI · ${homeForm}`} players={sortXi(homeStarters)} accent="pitch" resolveId={resolveId} />
        <XiSheet title={`${awayName} XI · ${awayForm}`} players={sortXi(awayStarters)} accent="sky" resolveId={resolveId} />
      </div>

      {(homeBench.length > 0 || awayBench.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
          <BenchList title={`${homeName} bench`} players={homeBench} accent="pitch" resolveId={resolveId} />
          <BenchList title={`${awayName} bench`} players={awayBench} accent="sky" resolveId={resolveId} />
        </div>
      )}
    </div>
  )
}

function XiSheet({
  title,
  players,
  accent,
  resolveId,
}: {
  title: string
  players: LineupPlayer[]
  accent: 'pitch' | 'sky'
  resolveId: (p: LineupPlayer) => string | null
}) {
  return (
    <div className="bg-ink-2 p-5">
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint mb-3">{title}</div>
      <ul className="space-y-1">
        {players.map((p) => {
          const id = resolveId(p)
          const row = (
            <>
              <div
                className={`h-8 w-8 shrink-0 overflow-hidden rounded-full border ${
                  accent === 'pitch' ? 'border-pitch/50' : 'border-[#4BB8E8]/50'
                }`}
              >
                <PlayerPhoto playerName={photoName(p)} size={32} rounded className="h-full w-full object-cover" />
              </div>
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  accent === 'pitch' ? 'bg-pitch/15 text-pitch' : 'bg-[#0096DC]/15 text-[#4BB8E8]'
                }`}
              >
                {p.jerseyNumber ?? '–'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-cream truncate group-hover:text-pitch transition-colors">
                  {p.nickname?.trim() || p.name}
                </div>
                <div className="text-[10px] text-faint truncate">
                  {p.position || normalizePosCode(p.position)}
                  {p.minutesPlayed != null ? ` · ${p.minutesPlayed}'` : ''}
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide text-fog tabular-nums">
                {p.minutesPlayed != null ? `${p.minutesPlayed}'` : normalizePosCode(p.position)}
              </span>
            </>
          )
          return (
            <li key={`xi-${p.side}-${p.jerseyNumber}-${p.name}`}>
              {id ? (
                <Link href={`/players/${id}`} className="flex items-center gap-2.5 text-xs py-1.5 px-1 rounded-[1px] hover:bg-surface group">
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 text-xs py-1.5 px-1">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function BenchList({
  title,
  players,
  accent,
  resolveId,
}: {
  title: string
  players: LineupPlayer[]
  accent: 'pitch' | 'sky'
  resolveId: (p: LineupPlayer) => string | null
}) {
  return (
    <div className="bg-ink-2 p-5">
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint mb-3">{title}</div>
      <ul className="space-y-1">
        {players.length === 0 && <li className="text-xs text-faint">No bench data</li>}
        {players.map((p) => {
          const id = resolveId(p)
          const row = (
            <>
              <div
                className={`h-8 w-8 shrink-0 overflow-hidden rounded-full border ${
                  accent === 'pitch' ? 'border-pitch/40' : 'border-[#4BB8E8]/40'
                }`}
              >
                <PlayerPhoto playerName={photoName(p)} size={32} rounded className="h-full w-full object-cover" />
              </div>
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  accent === 'pitch' ? 'bg-pitch/15 text-pitch' : 'bg-[#0096DC]/15 text-[#4BB8E8]'
                }`}
              >
                {p.jerseyNumber ?? '–'}
              </span>
              <span className="text-cream truncate group-hover:text-pitch transition-colors">
                {p.nickname?.trim() || p.name}
              </span>
              {p.minutesPlayed != null && (
                <span className="text-[10px] tabular-nums text-fog">{p.minutesPlayed}&apos;</span>
              )}
              {p.position && (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-faint">
                  {normalizePosCode(p.position)}
                </span>
              )}
            </>
          )
          return (
            <li key={`${p.side}-${p.jerseyNumber}-${p.name}`}>
              {id ? (
                <Link href={`/players/${id}`} className="flex items-center gap-2.5 text-xs text-fog py-1.5 px-1 rounded-[1px] hover:bg-surface group">
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-fog py-1.5 px-1">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
