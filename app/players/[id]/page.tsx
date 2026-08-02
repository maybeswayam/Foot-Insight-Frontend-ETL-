'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { PlayerPhoto } from '@/components/PlayerPhoto'
import { CountryFlag } from '@/components/CountryFlag'
import { TeamLink } from '@/components/TeamLink'
import { apiClient } from '@/lib/api'
import { formatPosition } from '@/lib/utils'
import type { PlayerDetail } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

const PlayerCareerPath = dynamic(
  () => import('@/components/PlayerCareerPath').then((m) => m.PlayerCareerPath),
  { ssr: false },
)
const CareerCharts = dynamic(
  () => import('@/components/PlayerStatCharts').then((m) => m.CareerCharts),
  { ssr: false },
)
const SeasonHighlights = dynamic(
  () => import('@/components/PlayerStatCharts').then((m) => m.SeasonHighlights),
  { ssr: false },
)
const ShotBreakdownCharts = dynamic(
  () => import('@/components/PlayerStatCharts').then((m) => m.ShotBreakdownCharts),
  { ssr: false },
)
const PlayerShotMap = dynamic(
  () => import('@/components/PlayerShotMap').then((m) => m.PlayerShotMap),
  { ssr: false },
)
const PlayerNumbersLab = dynamic(
  () => import('@/components/PlayerNumbersLab').then((m) => m.PlayerNumbersLab),
  { ssr: false },
)

const POS_STYLE: Record<string, string> = {
  GK: 'bg-gold/10 text-gold border-gold/25',
  DF: 'bg-[#0096DC]/10 text-[#4BB8E8] border-[#0096DC]/25',
  MF: 'bg-pitch/10 text-pitch border-pitch/25',
  FW: 'bg-redcard/10 text-[#F07060] border-redcard/25',
}

const COMP_STYLE: Record<string, string> = {
  'FIFA World Cup': 'bg-gold/10 text-gold border-gold/25',
  'Premier League': 'bg-[#6500FF]/10 text-[#9B72FF] border-[#6500FF]/25',
  'La Liga': 'bg-redcard/10 text-[#F07060] border-redcard/25',
  Bundesliga: 'bg-pitch/10 text-pitch border-pitch/25',
  'Serie A': 'bg-[#0096DC]/10 text-[#4BB8E8] border-[#0096DC]/25',
  'Ligue 1': 'bg-[#0064DC]/10 text-[#5599EE] border-[#0064DC]/25',
}

type TabKey = 'season' | 'career' | 'shots' | 'numbers'

interface PlayerDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const [playerId, setPlayerId] = useState('')
  const [player, setPlayer] = useState<PlayerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('numbers')

  useEffect(() => {
    params.then(({ id }) => setPlayerId(id))
  }, [params])

  useEffect(() => {
    if (!playerId) return
    window.scrollTo(0, 0)
    setLoading(true)
    setError(null)
    apiClient
      .getPlayerDetail(playerId)
      .then((p) => {
        setPlayer(p)
        setTab('numbers')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load player'))
      .finally(() => setLoading(false))
  }, [playerId])

  const isWC = player?.competition === 'FIFA World Cup'
  const hasEventStats = useMemo(() => {
    if (!player) return false
    const s = player.stats
    return (
      s.shotsOnTarget > 0 ||
      s.passesAttempted > 0 ||
      s.tackles > 0 ||
      s.interceptions > 0 ||
      s.touches > 0 ||
      s.gamesStarted > 0
    )
  }, [player])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <LoadingSpinner />
        </main>
      </>
    )
  }

  if (error || !player) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink flex items-center justify-center py-32">
          <ErrorState message={error || 'Player not found'} />
        </main>
      </>
    )
  }

  const surname = player.name.split(' ').slice(-1)[0] || player.name
  const clubOrTeam = player.club && player.club !== player.team ? player.club : player.team
  const hasCareer = Boolean(player.career?.stops?.length)
  const hasShots = Boolean(player.shotProfile?.shots?.length)

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: 'season', label: isWC ? 'Tournament' : 'Season', show: true },
    { key: 'numbers', label: 'All-time & value', show: true },
    { key: 'career', label: 'Career path', show: hasCareer },
    { key: 'shots', label: 'Shots', show: hasShots },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink overflow-x-hidden">
        {/* Hero */}
        <section className="border-b border-line relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 20% 0%, rgba(0,200,83,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(245,200,66,0.08), transparent 50%)',
            }}
          />
          <span className="absolute -bottom-8 right-4 sm:right-12 font-display text-[120px] sm:text-[180px] leading-none text-surface-2 select-none pointer-events-none">
            {surname.toUpperCase()}
          </span>

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 py-10">
            <Link
              href="/players"
              className="inline-flex items-center gap-2 text-pitch hover:text-pitch-bright transition-colors mb-10 text-xs font-semibold tracking-[1.5px] uppercase"
            >
              <ArrowLeft size={14} />
              Back to Players
            </Link>

            <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start animate-slide-up">
              <div className="h-36 w-36 sm:h-44 sm:w-44 shrink-0 overflow-hidden rounded-[2px] border-2 border-line-strong bg-surface-2">
                <PlayerPhoto playerName={player.name} size={176} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {player.competition && (
                    <span
                      className={`px-2.5 py-1 rounded-[2px] border text-[10px] font-bold tracking-[1px] uppercase ${
                        COMP_STYLE[player.competition] ?? 'bg-surface text-fog border-line'
                      }`}
                    >
                      {player.competition}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-[2px] border text-[10px] font-bold tracking-[1px] uppercase ${
                      POS_STYLE[player.position] ?? 'bg-surface text-fog border-line'
                    }`}
                  >
                    {formatPosition(player.position)}
                  </span>
                  {player.shotProfile && (
                    <span className="px-2.5 py-1 rounded-[2px] border border-pitch/30 bg-pitch/10 text-[10px] font-bold tracking-[1px] uppercase text-pitch">
                      Top 100 · #{player.shotProfile.rank}
                    </span>
                  )}
                  {player.bio?.value && (
                    <span className="px-2.5 py-1 rounded-[2px] border border-gold/30 bg-gold/10 text-[10px] font-bold tracking-[1px] uppercase text-gold">
                      FIFA22 {player.bio.value}
                    </span>
                  )}
                  {(player.age > 0 || player.bio?.age) && (
                    <span className="px-2.5 py-1 rounded-[2px] border border-line text-[10px] font-bold tracking-[1px] uppercase text-faint">
                      Age {player.age || player.bio?.age}
                    </span>
                  )}
                  {player.bio?.nationality && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border border-line text-[10px] font-bold tracking-[1px] uppercase text-faint">
                      <CountryFlag country={player.bio.nationality} size={12} />
                      {player.bio.nationality}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-[clamp(44px,8vw,80px)] leading-[0.9] tracking-[1px] text-cream mb-3">
                  {player.name.toUpperCase()}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-fog mb-8">
                  {isWC ? (
                    <Link
                      href={`/teams/${player.teamId}`}
                      className="inline-flex items-center gap-2 text-cream hover:text-pitch transition-colors"
                    >
                      <CountryFlag country={player.team} size={18} />
                      {player.team}
                    </Link>
                  ) : (
                    <TeamLink
                      teamName={clubOrTeam}
                      size={22}
                      showName
                      nameClassName="text-cream hover:text-pitch transition-colors"
                    />
                  )}
                  {player.club && player.club !== player.team && (
                    <>
                      <span className="text-faint">·</span>
                      <TeamLink
                        teamName={player.club}
                        size={18}
                        showName
                        nameClassName="text-fog hover:text-pitch transition-colors"
                      />
                    </>
                  )}
                  {hasCareer && player.career && (
                    <>
                      <span className="text-faint">·</span>
                      <span className="text-[12px]">
                        {player.career.countries.join(' → ')}
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line max-w-2xl">
                  <Kpi label="Goals" value={String(player.stats.goals)} accent="text-pitch" />
                  <Kpi label="Assists" value={String(player.stats.assists)} accent="text-gold" />
                  <Kpi label="xG" value={player.stats.xG.toFixed(1)} accent="text-[#4BB8E8]" />
                  <Kpi label="Minutes" value={String(player.stats.minutes)} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-line sticky top-[60px] z-30 bg-[rgba(10,10,10,0.92)] backdrop-blur-[16px]">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative shrink-0 min-h-[44px] px-1 py-3 text-xs font-semibold tracking-[1.5px] uppercase transition-colors ${
                    tab === t.key ? 'text-pitch' : 'text-fog hover:text-cream'
                  }`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-pitch" />}
                </button>
              ))}
          </div>
        </div>

        <section className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          {tab === 'season' && (
            <div className="animate-slide-up">
              <div className="mb-10">
                <div className="section-tag">{isWC ? 'Tournament lab' : 'Season lab'}</div>
                <h2 className="section-title mt-2">
                  {isWC ? 'WORLD CUP PROFILE' : '2022/23 PROFILE'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-fog leading-relaxed">
                  {isWC
                    ? 'Tournament stats from the 2022 World Cup archive.'
                    : 'Single-season Understat row for this competition. Career path and shot maps appear for Top 100 scorers when available.'}
                </p>
              </div>

              <SeasonHighlights player={player} />

              {hasEventStats && (
                <div className="mt-10">
                  <div className="section-tag mb-3">Event sheet</div>
                  <h3 className="font-display text-2xl tracking-[1px] text-cream mb-4">
                    TOUCHES · PASSING · DEFENDING
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
                    <StatCell label="Shots on target" value={player.stats.shotsOnTarget} />
                    <StatCell label="Pass accuracy" value={`${player.stats.passAccuracy.toFixed(0)}%`} />
                    <StatCell label="Passes completed" value={player.stats.passesCompleted} />
                    <StatCell label="Touches" value={player.stats.touches} />
                    <StatCell label="Tackles" value={player.stats.tackles} />
                    <StatCell label="Interceptions" value={player.stats.interceptions} />
                    <StatCell label="Starts" value={player.stats.gamesStarted} />
                    <StatCell
                      label="Pens"
                      value={`${player.stats.pensMade}/${player.stats.pensAtt}`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'career' && player.career && (
            <div className="animate-slide-up space-y-12">
              <div>
                <div className="section-tag">Leagues & countries played</div>
                <h2 className="section-title mt-2">THE PATH</h2>
                <p className="mt-3 max-w-2xl text-sm text-fog leading-relaxed">
                  Club-by-club movement across Big 5 leagues — where this player earned their minutes,
                  not a passport nationality map.
                </p>
              </div>
              <PlayerCareerPath career={player.career} />
              <CareerCharts career={player.career} />
            </div>
          )}

          {tab === 'shots' && player.shotProfile && (
            <div className="animate-slide-up space-y-10">
              <div>
                <div className="section-tag">Finishing lab</div>
                <h2 className="section-title mt-2">SHOT ARCHIVE</h2>
                <p className="mt-3 max-w-2xl text-sm text-fog leading-relaxed">
                  Every Understat shot event from the 2022/23 Big 5 season for this player.
                </p>
              </div>
              <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8 items-start">
                <PlayerShotMap shots={player.shotProfile.shots} />
                <ShotBreakdownCharts profile={player.shotProfile} />
              </div>
            </div>
          )}

          {tab === 'numbers' && (
            <div className="animate-slide-up">
              <PlayerNumbersLab player={player} />
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  )
}

function Kpi({
  label,
  value,
  accent = 'text-cream',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="bg-ink-2/90 px-3 py-3 text-center backdrop-blur-sm">
      <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{label}</div>
      <div className={`mt-0.5 font-display text-2xl tracking-[1px] tabular-nums ${accent}`}>{value}</div>
    </div>
  )
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-ink-2 px-4 py-3">
      <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-faint">{label}</div>
      <div className="mt-1 font-display text-xl text-cream tabular-nums tracking-[1px]">{value}</div>
    </div>
  )
}
