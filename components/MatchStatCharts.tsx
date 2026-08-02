'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { buildMatchAnalytics } from '@/lib/matchAnalytics'
import type { AdvancedMatchStats, TeamStats } from '@/lib/types'

const HOME = '#00C853'
const AWAY = '#4BB8E8'
const GRID = 'rgba(255,255,255,0.08)'
const MUTED = '#9A9690'

interface MatchStatChartsProps {
  home: TeamStats
  away: TeamStats
  homeName: string
  awayName: string
  advanced: AdvancedMatchStats | null
}

export function MatchStatCharts({
  home,
  away,
  homeName,
  awayName,
  advanced,
}: MatchStatChartsProps) {
  const analytics = buildMatchAnalytics(home, away, homeName, awayName, advanced)
  const { home: H, away: A, xg } = analytics

  const barRows = [
    { label: 'Goals', home: H.goals, away: A.goals },
    ...(xg
      ? [{ label: 'xG', home: xg.home, away: xg.away }]
      : []),
    { label: 'Shots', home: H.shots, away: A.shots },
    { label: 'On target', home: H.shotsOnTarget, away: A.shotsOnTarget },
    { label: 'Conv %', home: +H.conversion.toFixed(1), away: +A.conversion.toFixed(1) },
    { label: 'SoT %', home: +H.shotAccuracy.toFixed(1), away: +A.shotAccuracy.toFixed(1) },
    { label: 'Corners', home: H.corners, away: A.corners },
    { label: 'Fouls', home: H.fouls, away: A.fouls },
    { label: 'Yellows', home: H.yellowCards, away: A.yellowCards },
    { label: 'Reds', home: H.redCards, away: A.redCards },
  ]

  const radarData = [
    {
      metric: 'Volume',
      home: scale(H.shots, Math.max(H.shots, A.shots, 1)),
      away: scale(A.shots, Math.max(H.shots, A.shots, 1)),
      homeRaw: H.shots,
      awayRaw: A.shots,
    },
    {
      metric: 'SoT',
      home: scale(H.shotsOnTarget, Math.max(H.shotsOnTarget, A.shotsOnTarget, 1)),
      away: scale(A.shotsOnTarget, Math.max(H.shotsOnTarget, A.shotsOnTarget, 1)),
      homeRaw: H.shotsOnTarget,
      awayRaw: A.shotsOnTarget,
    },
    {
      metric: 'Clinical',
      home: Math.min(H.conversion * 2.2, 100),
      away: Math.min(A.conversion * 2.2, 100),
      homeRaw: `${H.conversion.toFixed(0)}%`,
      awayRaw: `${A.conversion.toFixed(0)}%`,
    },
    {
      metric: 'Set pieces',
      home: scale(H.corners, Math.max(H.corners, A.corners, 1)),
      away: scale(A.corners, Math.max(H.corners, A.corners, 1)),
      homeRaw: H.corners,
      awayRaw: A.corners,
    },
    {
      metric: 'Aggression',
      home: scale(H.fouls + H.yellowCards * 2, Math.max(H.fouls + H.yellowCards * 2, A.fouls + A.yellowCards * 2, 1)),
      away: scale(A.fouls + A.yellowCards * 2, Math.max(H.fouls + H.yellowCards * 2, A.fouls + A.yellowCards * 2, 1)),
      homeRaw: `${H.fouls}F / ${H.yellowCards}Y`,
      awayRaw: `${A.fouls}F / ${A.yellowCards}Y`,
    },
  ]

  const shareHome = xg ? xg.possessionHome : analytics.shotShareHome
  const shareAway = xg ? xg.possessionAway : analytics.shotShareAway
  const shareLabel = xg ? 'Possession' : 'Shot share'

  return (
    <div className="space-y-8">
      {/* Nerd take */}
      <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
        <div className="section-tag mb-2">Analyst note</div>
        <p className="text-sm text-fog leading-relaxed max-w-4xl">{analytics.nerdTake}</p>
      </div>

      {/* Efficiency strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
        <EffTile
          label={`${homeName} conversion`}
          value={`${H.conversion.toFixed(1)}%`}
          sub={`${H.goals}/${H.shots} shots`}
          accent="pitch"
        />
        <EffTile
          label={`${awayName} conversion`}
          value={`${A.conversion.toFixed(1)}%`}
          sub={`${A.goals}/${A.shots} shots`}
          accent="sky"
        />
        <EffTile
          label={`${homeName} SoT → goal`}
          value={`${H.sotConversion.toFixed(0)}%`}
          sub={`${H.goals}/${H.shotsOnTarget} on target`}
          accent="pitch"
        />
        <EffTile
          label={`${awayName} SoT → goal`}
          value={`${A.sotConversion.toFixed(0)}%`}
          sub={`${A.goals}/${A.shotsOnTarget} on target`}
          accent="sky"
        />
      </div>

      {/* Shot funnel + share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ShareGauge
          label={shareLabel}
          home={shareHome}
          away={shareAway}
          homeName={homeName}
          awayName={awayName}
          note={
            xg
              ? undefined
              : 'Possession missing in league feed — shot share as territorial proxy'
          }
        />

        <div className="lg:col-span-2 border border-line-strong bg-ink-2 p-5">
          <div className="section-tag mb-1">Chance chain</div>
          <h3 className="font-display text-2xl text-cream tracking-[1px] mb-5">SHOT FUNNEL</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Funnel
              name={homeName}
              shots={H.shots}
              sot={H.shotsOnTarget}
              goals={H.goals}
              accent="pitch"
            />
            <Funnel
              name={awayName}
              shots={A.shots}
              sot={A.shotsOnTarget}
              goals={A.goals}
              accent="sky"
            />
          </div>
          <p className="mt-4 text-[10px] text-faint uppercase tracking-[1px]">
            Shots → on target → goals · the squeeze tells you where chance quality died
          </p>
        </div>
      </div>

      {xg && (
        <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
          <div className="section-tag mb-1">Expected goals</div>
          <h3 className="font-display text-2xl text-cream tracking-[1px] mb-5">
            xG vs REALITY
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line mb-5">
            <EffTile label={`${homeName} xG`} value={xg.home.toFixed(2)} sub={`${H.goals} scored`} accent="pitch" />
            <EffTile label={`${awayName} xG`} value={xg.away.toFixed(2)} sub={`${A.goals} scored`} accent="sky" />
            <EffTile
              label={`${homeName} finish Δ`}
              value={`${xg.homeOverperf >= 0 ? '+' : ''}${xg.homeOverperf.toFixed(2)}`}
              sub={xg.homeOverperf >= 0.3 ? 'clinical / hot' : xg.homeOverperf <= -0.3 ? 'cold finishing' : 'on expectation'}
              accent="pitch"
            />
            <EffTile
              label={`${awayName} finish Δ`}
              value={`${xg.awayOverperf >= 0 ? '+' : ''}${xg.awayOverperf.toFixed(2)}`}
              sub={xg.awayOverperf >= 0.3 ? 'clinical / hot' : xg.awayOverperf <= -0.3 ? 'cold finishing' : 'on expectation'}
              accent="sky"
            />
          </div>
          <CompareBar label="xG" home={xg.home} away={xg.away} homeName={homeName} awayName={awayName} />
          <div className="mt-4 grid grid-cols-2 gap-px bg-line border border-line">
            <EffTile
              label="xG gap"
              value={`${(xg.home - xg.away >= 0 ? '+' : '')}${(xg.home - xg.away).toFixed(2)}`}
              sub={`${homeName} − ${awayName}`}
              accent="pitch"
            />
            <EffTile
              label="Poss. gap"
              value={`${xg.possessionHome - xg.possessionAway >= 0 ? '+' : ''}${xg.possessionHome - xg.possessionAway}`}
              sub={`${xg.possessionHome}–${xg.possessionAway}%`}
              accent="sky"
            />
          </div>
          <p className="mt-3 text-[10px] text-faint">
            WC advanced sheet: pass accuracy not available in this archive (stored as zeros — omitted on purpose).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-line-strong bg-ink-2 p-5">
          <div className="section-tag mb-1">Head to head</div>
          <h3 className="font-display text-2xl text-cream tracking-[1px] mb-6">MATCH STATS</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barRows} layout="vertical" margin={{ left: 8, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis type="number" stroke={MUTED} tick={{ fill: MUTED, fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={64}
                  stroke={MUTED}
                  tick={{ fill: '#9A9690', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#F0EDE6', fontWeight: 600 }}
                />
                <Bar dataKey="home" name={homeName} fill={HOME} radius={[0, 1, 1, 0]} barSize={7} />
                <Bar dataKey="away" name={awayName} fill={AWAY} radius={[0, 1, 1, 0]} barSize={7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] uppercase tracking-[1px]">
            <span className="flex items-center gap-1.5 text-fog">
              <i className="h-2 w-2 rounded-full bg-pitch" /> {homeName}
            </span>
            <span className="flex items-center gap-1.5 text-fog">
              <i className="h-2 w-2 rounded-full bg-[#4BB8E8]" /> {awayName}
            </span>
          </div>
        </div>

        <div className="border border-line-strong bg-ink-2 p-5">
          <div className="section-tag mb-1">Style fingerprint</div>
          <h3 className="font-display text-2xl text-cream tracking-[1px] mb-6">PERFORMANCE RADAR</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke={GRID} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9A9690', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#F0EDE6', fontWeight: 600 }}
                  formatter={(value, name, item) => {
                    const payload = item?.payload as {
                      homeRaw?: string | number
                      awayRaw?: string | number
                    }
                    const raw = name === homeName ? payload?.homeRaw : payload?.awayRaw
                    return [raw ?? value, String(name)]
                  }}
                />
                <Radar name={homeName} dataKey="home" stroke={HOME} fill={HOME} fillOpacity={0.2} strokeWidth={2} />
                <Radar name={awayName} dataKey="away" stroke={AWAY} fill={AWAY} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Defensive load */}
      <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
        <div className="section-tag mb-1">Without a saves feed</div>
        <h3 className="font-display text-2xl text-cream tracking-[1px] mb-2">DEFENSIVE PRESSURE</h3>
        <p className="text-xs text-faint mb-5 max-w-2xl">
          Keeper saves aren&apos;t in this archive — opponent shots / SoT are the best proxy for how much
          each back line was asked to survive.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line">
          <EffTile label={`${homeName} faced`} value={String(H.shotsFaced)} sub={`${H.sotFaced} on target`} accent="pitch" />
          <EffTile label={`${awayName} faced`} value={String(A.shotsFaced)} sub={`${A.sotFaced} on target`} accent="sky" />
          <EffTile label={`${homeName} conceded`} value={String(H.goalsConceded)} sub="goals against" accent="pitch" />
          <EffTile label={`${awayName} conceded`} value={String(A.goalsConceded)} sub="goals against" accent="sky" />
        </div>
      </div>

      <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
        <div className="section-tag mb-1">Breakdown</div>
        <h3 className="font-display text-2xl text-cream tracking-[1px] mb-6">STAT COMPARISON</h3>
        <div className="space-y-4">
          {barRows.map((row) => (
            <CompareBar
              key={row.label}
              label={row.label}
              home={row.home}
              away={row.away}
              homeName={homeName}
              awayName={awayName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function scale(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, (value / max) * 100)
}

function EffTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent: 'pitch' | 'sky'
}) {
  return (
    <div className="bg-ink-2 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint">{label}</div>
      <div
        className={`mt-1 font-display text-3xl tracking-[1px] ${
          accent === 'pitch' ? 'text-pitch' : 'text-[#4BB8E8]'
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[10px] text-faint">{sub}</div>}
    </div>
  )
}

function Funnel({
  name,
  shots,
  sot,
  goals,
  accent,
}: {
  name: string
  shots: number
  sot: number
  goals: number
  accent: 'pitch' | 'sky'
}) {
  const max = Math.max(shots, 1)
  const color = accent === 'pitch' ? 'bg-pitch' : 'bg-[#4BB8E8]'
  const steps = [
    { label: 'Shots', n: shots },
    { label: 'On target', n: sot },
    { label: 'Goals', n: goals },
  ]
  return (
    <div>
      <div
        className={`text-[10px] font-bold uppercase tracking-[1.5px] mb-3 ${
          accent === 'pitch' ? 'text-pitch' : 'text-[#4BB8E8]'
        }`}
      >
        {name}
      </div>
      <div className="space-y-2.5">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-[10px] uppercase tracking-[1px] text-fog mb-1">
              <span>{s.label}</span>
              <span className="tabular-nums text-cream">{s.n}</span>
            </div>
            <div className="h-2 rounded-[1px] bg-surface-3 overflow-hidden">
              <div
                className={`h-full ${color} transition-all duration-700`}
                style={{ width: `${(s.n / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShareGauge({
  label,
  home,
  away,
  homeName,
  awayName,
  note,
}: {
  label: string
  home: number
  away: number
  homeName: string
  awayName: string
  note?: string
}) {
  const r = 54
  const c = 2 * Math.PI * r
  const homeLen = (home / 100) * c

  return (
    <div className="border border-line-strong bg-ink-2 p-5 flex flex-col items-center justify-center">
      <div className="section-tag mb-3">{label}</div>
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={HOME}
            strokeWidth="10"
            strokeDasharray={`${homeLen} ${c - homeLen}`}
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={AWAY}
            strokeWidth="10"
            strokeDasharray={`${c - homeLen} ${homeLen}`}
            strokeDashoffset={-homeLen}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl text-cream leading-none">
            {home}
            <span className="text-faint text-lg">–</span>
            {away}
          </span>
          <span className="text-[9px] uppercase tracking-[1px] text-faint mt-1">%</span>
        </div>
      </div>
      <div className="mt-4 flex w-full justify-between gap-2 text-[10px] uppercase tracking-[1px]">
        <span className="text-pitch truncate">{homeName}</span>
        <span className="text-[#4BB8E8] truncate text-right">{awayName}</span>
      </div>
      {note && <p className="mt-3 text-center text-[10px] text-faint leading-relaxed">{note}</p>}
    </div>
  )
}

function CompareBar({
  label,
  home,
  away,
  homeName,
  awayName,
}: {
  label: string
  home: number
  away: number
  homeName: string
  awayName: string
}) {
  const total = home + away || 1
  const homePct = (home / total) * 100
  const awayPct = (away / total) * 100

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-pitch tabular-nums" title={homeName}>
          {formatVal(home)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint">{label}</span>
        <span className="font-semibold text-[#4BB8E8] tabular-nums" title={awayName}>
          {formatVal(away)}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-[1px] bg-surface-3">
        <div className="h-full bg-pitch transition-all duration-700" style={{ width: `${homePct}%` }} />
        <div className="h-full bg-[#4BB8E8] transition-all duration-700" style={{ width: `${awayPct}%` }} />
      </div>
    </div>
  )
}

function formatVal(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
