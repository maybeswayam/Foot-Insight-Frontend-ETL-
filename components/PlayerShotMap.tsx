'use client'

import { useMemo } from 'react'
import type { PlayerShotEvent } from '@/lib/types'

interface PlayerShotMapProps {
  shots: PlayerShotEvent[]
}

const RESULT_COLOR: Record<string, string> = {
  Goal: '#00C853',
  SavedShot: '#4BB8E8',
  BlockedShot: '#9A9690',
  MissedShots: '#5C5855',
  ShotOnPost: '#F5C842',
}

/**
 * Understat coords: x 0→1 own goal to opponent goal, y 0→1 across width.
 * Goal at top of SVG.
 */
export function PlayerShotMap({ shots }: PlayerShotMapProps) {
  const plotted = useMemo(
    () =>
      shots.map((s, i) => {
        const px = s.y * 100
        const py = (1 - s.x) * 100
        return {
          key: String(s.id ?? i),
          px,
          py,
          r: Math.max(2.2, Math.min(5.5, 1.8 + s.xG * 8)),
          color: RESULT_COLOR[s.result] || '#9A9690',
          result: s.result,
          xG: s.xG,
          minute: s.minute,
        }
      }),
    [shots]
  )

  return (
    <div className="border border-line-strong bg-ink-2 p-5">
      <div className="section-tag mb-1">Pitch</div>
      <h3 className="font-display text-xl tracking-[1px] text-cream mb-1">SHOT MAP</h3>
      <p className="mb-4 text-[11px] leading-relaxed text-faint">
        {shots.length} Understat shot events · 2022/23 · dot size = xG · goal at top
      </p>

      <div className="mx-auto max-w-md">
        <svg viewBox="0 0 100 100" className="w-full aspect-[2/3] rounded-[2px] bg-[#0d1f12]">
          <rect x="0" y="0" width="100" height="100" fill="#0d1f12" />
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.4"
          />
          <rect
            x="20"
            y="2"
            width="60"
            height="28"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.35"
          />
          <rect
            x="35"
            y="2"
            width="30"
            height="10"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.35"
          />
          <rect
            x="42"
            y="0.5"
            width="16"
            height="1.5"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="0.4"
          />
          <path
            d="M 30 30 Q 50 40 70 30"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.35"
          />
          <line
            x1="2"
            y1="98"
            x2="98"
            y2="98"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />

          {plotted.map((p) => (
            <circle
              key={p.key}
              cx={p.px}
              cy={p.py}
              r={p.r * 0.55}
              fill={p.color}
              fillOpacity={0.85}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="0.25"
            >
              <title>
                {p.result} · xG {p.xG.toFixed(2)} · {p.minute}&apos;
              </title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3 text-[10px] font-bold uppercase tracking-[1px] text-fog">
        {Object.entries(RESULT_COLOR).map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label.replace(/([a-z])([A-Z])/g, '$1 $2')}
          </span>
        ))}
      </div>
    </div>
  )
}
