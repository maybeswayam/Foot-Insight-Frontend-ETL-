'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CountryFlag } from '@/components/CountryFlag'
import { TeamLink } from '@/components/TeamLink'
import { TeamLogo } from '@/components/TeamLogo'
import type { PlayerDetail } from '@/lib/types'

const PITCH = '#00C853'
const SKY = '#4BB8E8'
const GOLD = '#F5C842'
const PURPLE = '#9B72FF'
const GRID = 'rgba(255,255,255,0.08)'
const MUTED = '#9A9690'

const COMP_COLORS: Record<string, string> = {
  'FIFA World Cup': GOLD,
  'Premier League': PURPLE,
  'La Liga': '#F07060',
  Bundesliga: PITCH,
  'Serie A': SKY,
  'Ligue 1': '#5599EE',
}

const tipStyle = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 2,
  fontSize: 12,
}
const tipLabelStyle = { color: '#F0EDE6', fontWeight: 600 }

/** Pie tooltips don't inherit series colors — render explicitly like the bar charts. */
function ClubShareTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload?: { name?: string; goals?: number; assists?: number; value?: number } }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  if (!p?.name) return null
  return (
    <div
      style={{
        ...tipStyle,
        padding: '8px 12px',
        lineHeight: 1.55,
      }}
    >
      <div style={{ color: '#F0EDE6', fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
      <div style={{ color: PITCH }}>Goals : {p.goals ?? 0}</div>
      <div style={{ color: GOLD }}>Assists : {p.assists ?? 0}</div>
      <div style={{ color: SKY }}>G+A : {p.value ?? 0}</div>
    </div>
  )
}

interface PlayerNumbersLabProps {
  player: PlayerDetail
}

export function PlayerNumbersLab({ player }: PlayerNumbersLabProps) {
  const career = player.career
  const comps = player.competitions || []
  const bio = player.bio

  const allTimeRows = career
    ? career.stops.map((s) => ({
        season: s.season.replace(/^20/, ''),
        full: s.season,
        club: s.club,
        goals: s.goals,
        assists: s.assists,
        xG: s.xG,
        xA: s.xA,
        ga: s.goals + s.assists,
        minutes: s.minutes,
      }))
    : []

  const clubPie =
    career?.path.map((p) => ({
      name: p.club,
      value: p.goals + p.assists,
      goals: p.goals,
      assists: p.assists,
    })) || []

  const compBars = comps.map((c) => ({
    name: shortComp(c.competition),
    full: c.competition,
    goals: c.goals,
    assists: c.assists,
    xG: +c.xG.toFixed(1),
    games: c.games,
    ga: c.goalContributions,
    fill: COMP_COLORS[c.competition] || PITCH,
  }))

  const archiveTotals = comps.reduce(
    (acc, c) => {
      acc.goals += c.goals
      acc.assists += c.assists
      acc.games += c.games
      acc.minutes += c.minutes
      acc.xG += c.xG
      acc.xA += c.xA
      return acc
    },
    { goals: 0, assists: 0, games: 0, minutes: 0, xG: 0, xA: 0 }
  )

  return (
    <div className="space-y-14">
      {/* ── Career & value ── */}
      <section>
        <div className="mb-6">
          <div className="section-tag">Profile card</div>
          <h2 className="section-title mt-2">CAREER & VALUE</h2>
          <p className="mt-2 max-w-2xl text-sm text-fog">
            FIFA 22 season card snapshot (2021–22 look) plus Big 5 league path where we have Understat history.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
            {bio ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint mb-1">
                      {bio.snapshot}
                    </div>
                    <div className="font-display text-3xl text-cream tracking-[1px]">
                      OVR {bio.overall}
                      {bio.potential != null && bio.potential !== bio.overall && (
                        <span className="text-fog text-xl"> / POT {bio.potential}</span>
                      )}
                    </div>
                    {bio.nationality && (
                      <div className="mt-2 inline-flex items-center gap-2 text-sm text-fog">
                        <CountryFlag country={bio.nationality} size={16} />
                        {bio.nationality}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-faint">Market value</div>
                    <div className="font-display text-4xl text-pitch tracking-[1px]">{bio.value || '—'}</div>
                    <div className="mt-1 text-[11px] text-fog">Wage {bio.wage || '—'}/w</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line">
                  <InfoCell label="Age" value={bio.age != null ? String(bio.age) : '—'} />
                  <InfoCell label="Foot" value={bio.preferredFoot || '—'} />
                  <InfoCell label="Height" value={bio.height || '—'} />
                  <InfoCell label="Best pos" value={bio.bestPosition || '—'} />
                </div>
                {(bio.internationalReputation != null || bio.sofifaId) && (
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-fog">
                    {bio.internationalReputation != null && (
                      <span>
                        Int&apos;l rep{' '}
                        <span className="text-gold tracking-[2px]">
                          {'★'.repeat(Math.min(5, Math.max(1, bio.internationalReputation)))}
                          {'☆'.repeat(Math.max(0, 5 - Math.min(5, bio.internationalReputation)))}
                        </span>
                      </span>
                    )}
                    {bio.valueEuros > 0 && (
                      <span className="tabular-nums">Card value ≈ €{(bio.valueEuros / 1e6).toFixed(1)}M</span>
                    )}
                    {bio.wageEuros > 0 && (
                      <span className="tabular-nums">Wage ≈ €{Math.round(bio.wageEuros / 1000)}K/w</span>
                    )}
                    {bio.fifaName && <span>FIFA card: {bio.fifaName}</span>}
                  </div>
                )}
                <p className="mt-4 text-[11px] leading-relaxed text-faint">
                  Value/wage are FIFA 22 card estimates for the 2021–22 season — not live Transfermarkt
                  quotes. Club on the card is the FIFA 22 club, which may differ from the 2022/23 row.
                </p>
              </>
            ) : (
              <p className="text-sm text-fog">No FIFA 22 card matched for this player.</p>
            )}
          </div>

          <div className="border border-line-strong bg-ink-2 p-5 sm:p-6">
            <div className="section-tag mb-2">Path summary</div>
            {career ? (
              <>
                <div className="font-display text-2xl text-cream tracking-[1px] mb-3">
                  {career.firstSeason} → {career.lastSeason}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {career.countries.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-[2px] border border-line px-2 py-1 text-[10px] font-bold uppercase tracking-[1px] text-fog"
                    >
                      <CountryFlag country={c} size={12} />
                      {c}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  {career.path.map((seg) => (
                    <div key={`${seg.club}-${seg.fromYear}`} className="flex items-center gap-3 text-sm">
                      <TeamLink teamName={seg.club} size={22} showName nameClassName="text-cream hover:text-pitch truncate" />
                      <div className="min-w-0 flex-1 text-[10px] text-faint uppercase tracking-[1px]">
                        {seg.fromSeason === seg.toSeason
                          ? seg.fromSeason
                          : `${seg.fromSeason}–${seg.toSeason}`}{' '}
                        · {seg.country}
                      </div>
                      <div className="tabular-nums text-pitch text-sm font-semibold shrink-0">
                        {seg.goals}G
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-px bg-line border border-line">
                  <InfoCell label="Clubs" value={String(career.clubs.length)} />
                  <InfoCell label="Seasons" value={String(career.seasonCount)} />
                  <InfoCell label="G+A" value={String(career.totals.goalContributions)} />
                </div>
              </>
            ) : (
              <p className="text-sm text-fog">
                No multi-year Big 5 history for this profile (common for World Cup–only rows). Check the
                tournament split below for archive competitions.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── All-time ── */}
      <section>
        <div className="mb-6">
          <div className="section-tag">All-time · Big 5</div>
          <h2 className="section-title mt-2">CAREER PRODUCTION</h2>
          <p className="mt-2 max-w-2xl text-sm text-fog">
            Understat league seasons only (2014–2024 window). Cups and non–Big 5 clubs are excluded.
          </p>
        </div>

        {career ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-line border border-line mb-8">
              {[
                { label: 'Goals', value: career.totals.goals, tone: 'text-pitch' },
                { label: 'Assists', value: career.totals.assists, tone: 'text-gold' },
                { label: 'G+A', value: career.totals.goalContributions, tone: 'text-cream' },
                { label: 'NPG', value: career.totals.npg, tone: 'text-cream' },
                { label: 'Key passes', value: career.totals.keyPasses ?? 0, tone: 'text-[#4BB8E8]' },
                {
                  label: 'xG chain',
                  value: (career.totals.xGChain ?? 0).toFixed(0),
                  tone: 'text-[#4BB8E8]',
                },
              ].map((t) => (
                <div key={t.label} className="bg-ink-2 px-4 py-4">
                  <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{t.label}</div>
                  <div className={`mt-1 font-display text-3xl tracking-[1px] tabular-nums ${t.tone}`}>
                    {t.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <ChartCard tag="Trend" title="G+A BY SEASON">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={allTimeRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="season" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip
                        contentStyle={tipStyle}
                  labelStyle={tipLabelStyle}
                        labelFormatter={(_, p) => {
                          const row = p?.[0]?.payload
                          return row ? `${row.full} · ${row.club}` : ''
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#F0EDE6' }} />
                      <Bar dataKey="goals" name="Goals" stackId="a" fill={PITCH} />
                      <Bar dataKey="assists" name="Assists" stackId="a" fill={GOLD} radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="xG" name="xG" stroke={SKY} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard tag="Share" title="G+A BY CLUB">
                <div className="h-[280px]">
                  {clubPie.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clubPie}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={92}
                          paddingAngle={2}
                        >
                          {clubPie.map((e, i) => (
                            <Cell
                              key={e.name}
                              fill={[PITCH, SKY, GOLD, PURPLE, '#F07060', '#5599EE'][i % 6]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<ClubShareTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#F0EDE6' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyNote text="Single-club career in this window." />
                  )}
                </div>
              </ChartCard>
            </div>
          </>
        ) : (
          <div className="border border-line-strong bg-ink-2 p-8 text-center text-sm text-fog">
            All-time Big 5 chart needs an Understat career link. World Cup–only profiles show tournament
            numbers in the competition section below.
          </div>
        )}
      </section>

      {/* ── By competition (archive) ── */}
      <section>
        <div className="mb-6">
          <div className="section-tag">This archive</div>
          <h2 className="section-title mt-2">BY COMPETITION</h2>
          <p className="mt-2 max-w-2xl text-sm text-fog">
            2022 season / World Cup rows in Foot-Insights for this exact player name
            {comps.length > 1 ? ` — ${comps.length} competitions linked.` : '.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line mb-8">
          {[
            { label: 'Archive G', value: archiveTotals.goals },
            { label: 'Archive A', value: archiveTotals.assists },
            { label: 'Archive apps', value: archiveTotals.games },
            { label: 'Comps', value: comps.length },
          ].map((t) => (
            <div key={t.label} className="bg-ink-2 px-4 py-4">
              <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{t.label}</div>
              <div className="mt-1 font-display text-3xl tracking-[1px] tabular-nums text-cream">{t.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <ChartCard tag="Compare" title="GOALS · ASSISTS · xG">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compBars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={tipStyle}
                  labelStyle={tipLabelStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#F0EDE6' }} />
                  <Bar dataKey="goals" name="Goals" fill={PITCH} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="assists" name="Assists" fill={GOLD} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="xG" name="xG" fill={SKY} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard tag="Rate" title="G+A PER COMPETITION">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compBars} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fill: MUTED, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tipStyle}
                  labelStyle={tipLabelStyle} />
                  <Bar dataKey="ga" name="G+A" radius={[0, 2, 2, 0]}>
                    {compBars.map((r) => (
                      <Cell key={r.full} fill={r.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {comps.map((c) => (
            <Link
              key={c.playerId}
              href={`/players/${c.playerId}`}
              className={`border border-line-strong bg-ink-2 p-5 transition-colors hover:bg-surface ${
                c.playerId === player.playerId ? 'ring-1 ring-pitch/40' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="text-[10px] font-bold uppercase tracking-[1px] px-2 py-1 rounded-[2px] border"
                  style={{
                    color: COMP_COLORS[c.competition] || '#F0EDE6',
                    borderColor: `${COMP_COLORS[c.competition] || '#F0EDE6'}40`,
                    background: `${COMP_COLORS[c.competition] || '#F0EDE6'}14`,
                  }}
                >
                  {c.competition}
                </span>
                {c.playerId === player.playerId && (
                  <span className="text-[9px] font-bold uppercase tracking-[1px] text-pitch">Viewing</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-fog">
                <TeamLogo teamName={c.club || c.team} size={20} />
                <span>
                  {c.team}
                  {c.club && c.club !== c.team ? ` · ${c.club}` : ''}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <MiniStat label="G" value={c.goals} />
                <MiniStat label="A" value={c.assists} />
                <MiniStat label="Apps" value={c.games} />
                <MiniStat label="xG" value={c.xG.toFixed(1)} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function shortComp(name: string) {
  if (name === 'FIFA World Cup') return 'WC'
  if (name === 'Premier League') return 'PL'
  if (name === 'Bundesliga') return 'BL'
  if (name === 'Serie A') return 'SA'
  if (name === 'Ligue 1') return 'L1'
  if (name === 'La Liga') return 'LL'
  return name.slice(0, 6)
}

function ChartCard({
  tag,
  title,
  children,
}: {
  tag: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="border border-line-strong bg-ink-2 p-5">
      <div className="section-tag mb-1">{tag}</div>
      <h3 className="font-display text-xl tracking-[1px] text-cream mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink px-3 py-3">
      <div className="text-[8px] font-bold uppercase tracking-[1.5px] text-faint">{label}</div>
      <div className="mt-0.5 font-display text-lg text-cream tracking-[1px]">{value}</div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-ink px-1 py-2 rounded-[2px]">
      <div className="text-[8px] font-bold uppercase tracking-[1px] text-faint">{label}</div>
      <div className="font-display text-lg text-cream tabular-nums">{value}</div>
    </div>
  )
}

function EmptyNote({ text }: { text: string }) {
  return <div className="flex h-full items-center justify-center text-sm text-fog">{text}</div>
}
