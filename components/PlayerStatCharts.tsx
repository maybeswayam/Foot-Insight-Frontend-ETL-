'use client'

import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Player, PlayerCareer, PlayerShotProfile } from '@/lib/types'

const PITCH = '#00C853'
const SKY = '#4BB8E8'
const GOLD = '#F5C842'
const PURPLE = '#9B72FF'
const GRID = 'rgba(255,255,255,0.08)'
const MUTED = '#5C5855'

const tipStyle = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 2,
  fontSize: 12,
}

interface SeasonHighlightsProps {
  player: Player
}

export function SeasonHighlights({ player }: SeasonHighlightsProps) {
  const s = player.stats
  const xgDelta = s.goals - s.xG
  const ga90 = s.minutes > 0 ? ((s.goals + s.assists) * 90) / s.minutes : 0

  const tiles = [
    { label: 'Goals', value: String(s.goals), tone: 'text-pitch' },
    { label: 'Assists', value: String(s.assists), tone: 'text-gold' },
    {
      label: 'xG Δ',
      value: `${xgDelta >= 0 ? '+' : ''}${xgDelta.toFixed(1)}`,
      tone: xgDelta >= 0 ? 'text-pitch' : 'text-redcard',
    },
    { label: 'G+A', value: String(s.goals + s.assists), tone: 'text-cream' },
    { label: 'G+A/90', value: ga90.toFixed(2), tone: 'text-[#4BB8E8]' },
    {
      label: 'Shot eff %',
      value: player.metrics.shotEfficiency > 0 ? player.metrics.shotEfficiency.toFixed(1) : '—',
      tone: 'text-fog',
    },
  ]

  const outputRows = [
    { label: 'Goals', value: s.goals, fill: PITCH },
    { label: 'Assists', value: s.assists, fill: GOLD },
    { label: 'xG', value: +s.xG.toFixed(2), fill: SKY },
    { label: 'xA', value: +s.xA.toFixed(2), fill: '#9B72FF' },
  ]

  const p90 = [
    { label: 'G/90', value: s.goalsP90 },
    { label: 'A/90', value: s.assistsP90 },
    { label: 'xG/90', value: s.xGP90 },
    { label: 'xA/90', value: s.xAP90 },
  ].filter((r) => r.value > 0)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line">
        {tiles.map((t, i) => (
          <div
            key={t.label}
            className="bg-ink-2 px-4 py-4 animate-slide-up"
            style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
          >
            <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{t.label}</div>
            <div className={`mt-1 font-display text-3xl tracking-[1px] tabular-nums ${t.tone}`}>
              {t.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          tag="Output"
          title="GOALS · ASSISTS · xG"
          note="Season row for this competition. xGΔ above is goals minus xG (finishing luck / clinical edge)."
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outputRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {outputRows.map((r) => (
                    <Cell key={r.label} fill={r.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {p90.length > 0 && (
          <ChartCard tag="Rate" title="PER 90" note="Rate stats normalize for minutes — useful when apps differ.">
            <div className="space-y-4 py-2">
              {p90.map((r) => {
                const max = Math.max(...p90.map((x) => x.value), 0.01)
                const pct = Math.min((r.value / max) * 100, 100)
                return (
                  <div key={r.label}>
                    <div className="mb-1.5 flex justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-[1px] text-fog">{r.label}</span>
                      <span className="tabular-nums text-cream">{r.value.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 overflow-hidden rounded-[1px]">
                      <div
                        className="h-full bg-pitch transition-[width] duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}

interface CareerChartsProps {
  career: PlayerCareer
}

export function CareerCharts({ career }: CareerChartsProps) {
  const bySeason = career.stops.map((s) => ({
    season: s.season.replace(/^20/, ''),
    full: s.season,
    club: s.club,
    goals: s.goals,
    npg: s.npg,
    assists: s.assists,
    xG: s.xG,
    npxG: s.npxG,
    xA: s.xA,
    keyPasses: s.keyPasses || 0,
    xGBuildup: s.xGBuildup || 0,
    xGChain: s.xGChain || 0,
    games: s.games,
  }))

  const t = career.totals
  const pensProxy = Math.max(0, t.goals - t.npg)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-line border border-line">
        {[
          { label: 'Career G', value: t.goals, tone: 'text-pitch' },
          { label: 'NPG', value: t.npg, tone: 'text-cream' },
          { label: 'Pens*', value: pensProxy, tone: 'text-gold' },
          { label: 'Assists', value: t.assists, tone: 'text-gold' },
          { label: 'Key passes', value: t.keyPasses ?? 0, tone: 'text-[#4BB8E8]' },
          { label: 'xG chain', value: (t.xGChain ?? 0).toFixed(0), tone: 'text-[#4BB8E8]' },
          { label: 'Apps', value: t.games, tone: 'text-fog' },
          { label: 'Cards', value: `${t.yellowCards ?? 0}/${t.redCards ?? 0}`, tone: 'text-fog' },
        ].map((x) => (
          <div key={x.label} className="bg-ink-2 px-3 py-4">
            <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{x.label}</div>
            <div className={`mt-1 font-display text-2xl tracking-[1px] tabular-nums ${x.tone}`}>{x.value}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-faint -mt-4">
        *Pens ≈ goals − non-penalty goals. xG chain = involvement in sequences ending in a shot.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard tag="Career" title="GOALS & ASSISTS BY SEASON" note="Each bar is one Big 5 league season row.">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySeason} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={tipStyle}
                  formatter={(v, name) => [v, name === 'goals' ? 'Goals' : 'Assists']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload
                    return row ? `${row.full} · ${row.club}` : ''
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
                <Bar dataKey="goals" name="Goals" stackId="ga" fill={PITCH} />
                <Bar dataKey="assists" name="Assists" stackId="ga" fill={GOLD} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard tag="Finishing" title="NPG VS npxG" note="Open-play finishing honesty — non-penalty goals vs non-penalty xG.">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={bySeason} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis dataKey="season" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={tipStyle}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload
                    return row ? `${row.full} · ${row.club}` : ''
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
                <Bar dataKey="npg" name="NPG" fill={PITCH} radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="npxG" name="npxG" stroke={SKY} strokeWidth={2} dot={{ r: 3, fill: SKY }} />
                <Line type="monotone" dataKey="keyPasses" name="Key passes" stroke={GOLD} strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard
        tag="Chance involvement"
        title="xG BUILDUP · xG CHAIN"
        note="Buildup = xG created without the shot/assist touch. Chain = full sequence involvement including shot/assist."
      >
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySeason} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="season" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
              <Bar dataKey="xGBuildup" name="xGBuildup" fill={PURPLE} radius={[2, 2, 0, 0]} />
              <Bar dataKey="xGChain" name="xGChain" fill={SKY} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}

interface ShotBreakdownProps {
  profile: PlayerShotProfile
}

export function ShotBreakdownCharts({ profile }: ShotBreakdownProps) {
  const sum = profile.shotSummary
  const season = profile.seasonStats
  const toRows = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([label, value]) => ({ label: label.replace(/([a-z])([A-Z])/g, '$1 $2'), value }))
      .sort((a, b) => b.value - a.value)

  const resultRows = toRows(sum.byResult)
  const situationRows = toRows(sum.bySituation)
  const typeRows = toRows(sum.byShotType)
  const xgDelta = sum.goals - sum.totalXG

  // Assist / last-action networks from raw shot events
  const assistLeaders = topCounts(
    profile.shots.map((s) => s.assistedBy).filter((x): x is string => Boolean(x && String(x).trim())),
    6
  )
  const lastActions = topCounts(
    profile.shots.map((s) => s.lastAction).filter((x): x is string => Boolean(x && String(x).trim())),
    6
  )
  const homeShots = profile.shots.filter((s) => s.side === 'h' || s.side === 'home').length
  const awayShots = profile.shots.filter((s) => s.side === 'a' || s.side === 'away').length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
        {[
          { label: 'Shots', value: sum.shots },
          { label: 'Goals', value: sum.goals },
          { label: 'Shot xG', value: sum.totalXG.toFixed(1) },
          {
            label: 'Finish Δ',
            value: `${xgDelta >= 0 ? '+' : ''}${xgDelta.toFixed(1)}`,
          },
        ].map((t) => (
          <div key={t.label} className="bg-ink-2 px-4 py-4">
            <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{t.label}</div>
            <div className="mt-1 font-display text-3xl tracking-[1px] tabular-nums text-cream">{t.value}</div>
          </div>
        ))}
      </div>

      {season && (
        <div className="border border-line-strong bg-ink-2 p-5">
          <div className="section-tag mb-1">Season sheet</div>
          <h3 className="font-display text-xl tracking-[1px] text-cream mb-3">2022/23 UNDERSTAT ROW</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-line border border-line">
            {[
              { label: 'Apps', value: season.games },
              { label: 'Mins', value: season.minutes },
              { label: 'G', value: season.goals },
              { label: 'A', value: season.assists },
              { label: 'Shots', value: season.shots },
              { label: 'xG', value: season.xG.toFixed(1) },
              { label: 'xA', value: season.xA.toFixed(1) },
              { label: 'G+A', value: season.goalContributions },
            ].map((t) => (
              <div key={t.label} className="bg-ink px-3 py-3">
                <div className="text-[8px] font-bold uppercase tracking-[1px] text-faint">{t.label}</div>
                <div className="font-display text-xl text-cream tabular-nums">{t.value}</div>
              </div>
            ))}
          </div>
          {(homeShots > 0 || awayShots > 0) && (
            <p className="mt-3 text-[11px] text-faint">
              Shot sides in sample: {homeShots} as home · {awayShots} as away
              {profile.rank != null ? ` · Top 100 rank #${profile.rank}` : ''}
            </p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <MiniBars title="BY RESULT" rows={resultRows} color={PITCH} />
        <MiniBars title="BY SITUATION" rows={situationRows} color={SKY} />
        <MiniBars title="BY SHOT TYPE" rows={typeRows} color={GOLD} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard
          tag="Supply"
          title="WHO SET THEM UP"
          note="AssistedBy on Understat shot events — the passer into the shot, not always the formal assist."
        >
          {assistLeaders.length ? (
            <RankList rows={assistLeaders} accent={GOLD} />
          ) : (
            <p className="text-sm text-fog py-6 text-center">No assist tags in this shot set.</p>
          )}
        </ChartCard>
        <ChartCard
          tag="Pattern"
          title="LAST ACTION BEFORE SHOT"
          note="What happened immediately before the shot (cross, through ball, rebound…)."
        >
          {lastActions.length ? (
            <RankList rows={lastActions} accent={SKY} />
          ) : (
            <p className="text-sm text-fog py-6 text-center">No last-action tags.</p>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function topCounts(values: string[], limit: number) {
  const map = new Map<string, number>()
  for (const v of values) {
    const k = String(v).trim()
    if (!k) continue
    map.set(k, (map.get(k) || 0) + 1)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function RankList({
  rows,
  accent,
}: {
  rows: { label: string; value: number }[]
  accent: string
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-[12px]">
            <span className="text-cream truncate">
              <span className="text-faint mr-2 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              {r.label}
            </span>
            <span className="tabular-nums text-fog shrink-0">{r.value}</span>
          </div>
          <div className="h-1 bg-surface-3 overflow-hidden rounded-[1px]">
            <div className="h-full" style={{ width: `${(r.value / max) * 100}%`, background: accent }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function MiniBars({
  title,
  rows,
  color,
}: {
  title: string
  rows: { label: string; value: number }[]
  color: string
}) {
  return (
    <ChartCard tag="Mix" title={title}>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={88}
              tick={{ fill: MUTED, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="value" fill={color} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

function ChartCard({
  tag,
  title,
  note,
  children,
}: {
  tag: string
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="border border-line-strong bg-ink-2 p-5">
      <div className="section-tag mb-1">{tag}</div>
      <h3 className={`font-display text-xl tracking-[1px] text-cream ${note ? 'mb-1' : 'mb-4'}`}>{title}</h3>
      {note && <p className="mb-4 text-[11px] leading-relaxed text-faint">{note}</p>}
      {children}
    </div>
  )
}
