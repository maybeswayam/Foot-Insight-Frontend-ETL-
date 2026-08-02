'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorState } from '@/components/ErrorState'
import { TeamLogo } from '@/components/TeamLogo'
import { LeagueLogo } from '@/components/LeagueLogo'
import { StarsOfEra } from '@/components/StarsOfEra'
import { apiClient } from '@/lib/api'
import type { SummaryData, Match } from '@/lib/types'

/* ─────────────── helpers ─────────────── */

/** Animate a counter from 0 → target */
function AnimatedNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) ref.current = requestAnimationFrame(step)
    }
    ref.current = requestAnimationFrame(step)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

function SectionHeader({
  tag,
  title,
  sub,
  link,
}: {
  tag: string
  title: React.ReactNode
  sub?: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-8 sm:mb-12 border-b border-line pb-5">
      <div>
        <div className="section-tag">{tag}</div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="text-sm text-faint mt-1.5">{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className="section-link self-start sm:self-auto">
          {link.label} →
        </Link>
      )}
    </div>
  )
}

/* ─────────────── data ─────────────── */

const LEAGUE_SLUGS: Record<string, string> = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Bundesliga': 'bundesliga',
  'Serie A': 'serie-a',
  'Ligue 1': 'ligue-1',
}

const LEAGUE_ACCENT: Record<string, string> = {
  'Premier League': '#9B72FF',
  'La Liga': '#E8412C',
  'Bundesliga': '#00C853',
  'Serie A': '#4BB8E8',
  'Ligue 1': '#5599EE',
}

const COMP_BADGE: Record<string, string> = {
  'FIFA World Cup': 'border-gold/30 bg-gold/10 text-gold',
  'Premier League': 'border-[#6500FF]/25 bg-[#6500FF]/10 text-[#9B72FF]',
  'La Liga': 'border-redcard/25 bg-redcard/10 text-[#F07060]',
  'Bundesliga': 'border-pitch/25 bg-pitch/10 text-pitch',
  'Serie A': 'border-[#0096DC]/25 bg-[#0096DC]/10 text-[#4BB8E8]',
  'Ligue 1': 'border-[#0064DC]/25 bg-[#0064DC]/10 text-[#5599EE]',
}

const ICONIC_LABELS: Record<string, string> = {
  '1890': 'World Cup Final',
  '381': 'Manchester Derby',
  '341': 'Record PL Win',
  '556': 'Historic Rivalry',
  '1533': 'El Clásico',
  '1706': 'El Clásico',
  '88': 'Der Klassiker',
  '1108': 'Derby della Madonnina',
  '1828': 'World Cup Opener',
  '715': 'Ligue 1 Thriller',
}

const HIGHLIGHTS_BIG = [
  {
    tag: '🏆 Argentina wins it all',
    headline: "MESSI'S MASTERPIECE IN QATAR",
    body: 'Lionel Messi finally lifted the World Cup trophy at age 35, leading Argentina to their first title since 1986 — cementing his legacy as the greatest of all time.',
  },
  {
    tag: "⚡ Mbappé's 8-goal blitz",
    headline: 'THE PRINCE TAKES THE STAGE',
    body: 'Kylian Mbappé scored 8 goals in the 2022 World Cup including a hat-trick in the final — the most by any player in the tournament.',
  },
  {
    tag: '📈 Liverpool 9-0 Bournemouth',
    headline: 'A RECORD THAT MAY NEVER FALL',
    body: 'Liverpool equalled the biggest Premier League win in history, smashing Bournemouth 9-0 at Anfield on matchday 4 of the 2022–23 season.',
  },
  {
    tag: '🔥 Manchester Derby: 6-3',
    headline: 'CITY RUN RIOT AT THE ETIHAD',
    body: 'Erling Haaland scored a hat-trick as Manchester City obliterated Manchester United 6-3 at the Etihad — the biggest city derby seen in a decade.',
  },
]

const HIGHLIGHTS_SMALL = [
  {
    title: "Napoli's 33-year wait ends",
    body: 'Napoli claim their first Scudetto since the Maradona era (1989–90).',
  },
  {
    title: 'Liverpool 7-0 Man United',
    body: 'The biggest ever victory in this historic rivalry — Anfield erupted.',
  },
  {
    title: '10-goal Serie A thriller',
    body: 'Atalanta demolished Salernitana 8-2 in a jaw-dropping Serie A match.',
  },
  {
    title: 'Messi: 7 goals, 3 assists',
    body: "Messi's World Cup performance earned him the Golden Ball as tournament's best.",
  },
]

/* ─────────────── page ─────────────── */

export default function HomePage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [leagueStats, setLeagueStats] = useState<
    { competition: string; goals: number; matches: number; avgGoals: number }[]
  >([])
  const [iconicMatches, setIconicMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const summaryData = await apiClient.getSummary()
        setSummary(summaryData)
        setLeagueStats(summaryData.leagueStats ?? [])
        setIconicMatches(summaryData.iconicMatches ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink">
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner />
          </div>
        </main>
      </>
    )

  if (error)
    return (
      <>
        <Header />
        <main className="min-h-screen bg-ink">
          <div className="flex items-center justify-center py-32">
            <ErrorState message={error} />
          </div>
        </main>
      </>
    )

  const totalGoals = summary?.totalGoals ?? 0
  const wcFinal = iconicMatches.find((m) => m.matchId === '1890')
  const totalMatchesLabel = (summary?.totalMatches ?? 1890).toLocaleString()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-ink overflow-x-hidden">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative grid lg:grid-cols-2 overflow-hidden bg-ink lg:min-h-[92vh]">
          {/* Pitch lines background */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.04] pointer-events-none"
            viewBox="0 0 1200 700"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="80" y="60" width="1040" height="580" fill="none" stroke="white" strokeWidth="2" />
            <line x1="600" y1="60" x2="600" y2="640" stroke="white" strokeWidth="2" />
            <circle cx="600" cy="350" r="80" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="600" cy="350" r="4" fill="white" />
            <rect x="80" y="220" width="140" height="260" fill="none" stroke="white" strokeWidth="2" />
            <rect x="980" y="220" width="140" height="260" fill="none" stroke="white" strokeWidth="2" />
            <rect x="80" y="300" width="50" height="100" fill="none" stroke="white" strokeWidth="2" />
            <rect x="1070" y="300" width="50" height="100" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="220" cy="350" r="2" fill="white" />
            <circle cx="980" cy="350" r="2" fill="white" />
          </svg>

          {/* Left — headline */}
          <div className="relative z-10 flex flex-col justify-center px-6 lg:px-12 py-20 lg:py-0">
            <div className="flex items-center gap-3 mb-7">
              <span className="bg-pitch/10 border border-pitch/30 text-pitch text-[11px] font-semibold tracking-[2px] uppercase px-3.5 py-1.5 rounded-[2px]">
                Football Analytics
              </span>
              <div className="w-10 h-px bg-pitch-dim" />
              <span className="hidden sm:inline text-[11px] text-faint tracking-[1.5px] uppercase">
                2022–23 Season · Top 5 Leagues · World Cup
              </span>
            </div>

            <h1 className="font-display text-[clamp(52px,14vw,120px)] leading-[0.9] tracking-[2px] text-cream mb-2">
              FOOT
              <br />
              <span className="text-pitch">INSIGHTS</span>
            </h1>

            <p className="font-editorial italic text-lg text-fog mb-7 max-w-[420px]">
              Where every number tells a story
            </p>

            <p className="text-[15px] leading-[1.7] text-fog max-w-[420px] mb-10">
              Dive into <strong className="text-cream font-medium">{totalMatchesLabel} matches</strong>,{' '}
              <strong className="text-cream font-medium">
                {summary ? summary.totalPlayers.toLocaleString() : '680'} players
              </strong>
              , and <strong className="text-cream font-medium">6 competitions</strong> from the 2022–23
              season — including the 2022 FIFA World Cup in Qatar.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/worldcup"
                className="bg-pitch hover:bg-pitch-bright text-black text-[13px] font-semibold tracking-[1px] uppercase px-7 py-3.5 rounded-[2px] transition-colors"
              >
                ⚽ World Cup 2022
              </Link>
              <Link
                href="/teams"
                className="border border-line-strong text-cream hover:border-pitch hover:text-pitch text-[13px] font-medium tracking-[1px] uppercase px-7 py-3.5 rounded-[2px] transition-colors"
              >
                Browse Teams
              </Link>
              <Link
                href="/players"
                className="border border-line text-fog hover:text-cream text-[13px] tracking-[0.5px] uppercase px-7 py-3.5 rounded-[2px] transition-colors"
              >
                Player Database
              </Link>
            </div>
          </div>

          {/* Right — season data panel */}
          <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-12 pb-16 sm:pb-20 lg:py-16">
            <div className="bg-surface border border-line-strong rounded p-5 sm:p-8 w-full max-w-[420px]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-line gap-3">
                <span className="text-[11px] font-semibold tracking-[2px] uppercase text-faint">
                  Season at a Glance
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-pitch font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch animate-pulse" />
                  Live Data
                </span>
              </div>

              <div className="grid grid-cols-2 gap-px bg-line border border-line mb-6">
                <div className="bg-surface-2 px-3 sm:px-4 py-4 sm:py-5">
                  <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-faint mb-1.5">
                    Matches
                  </div>
                  <div className="font-display text-[32px] sm:text-[42px] leading-none text-cream">
                    <AnimatedNumber value={summary?.totalMatches ?? 1890} />
                  </div>
                  <div className="text-[11px] text-faint mt-1">across 6 competitions</div>
                </div>
                <div className="bg-surface-2 px-3 sm:px-4 py-4 sm:py-5">
                  <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-faint mb-1.5">
                    Goals Scored
                  </div>
                  <div className="font-display text-[32px] sm:text-[42px] leading-none text-pitch">
                    <AnimatedNumber value={totalGoals} />
                  </div>
                  <div className="text-[11px] text-faint mt-1">
                    {summary ? summary.averageGoalsPerMatch.toFixed(2) : '2.77'} per match
                  </div>
                </div>
                <div className="bg-surface-2 px-3 sm:px-4 py-4 sm:py-5">
                  <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-faint mb-1.5">
                    Teams
                  </div>
                  <div className="font-display text-[32px] sm:text-[42px] leading-none text-gold">
                    <AnimatedNumber value={summary?.totalTeams ?? 130} />
                  </div>
                  <div className="text-[11px] text-faint mt-1">clubs & national teams</div>
                </div>
                <div className="bg-surface-2 px-3 sm:px-4 py-4 sm:py-5">
                  <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-faint mb-1.5">
                    Players
                  </div>
                  <div className="font-display text-[32px] sm:text-[42px] leading-none text-cream">
                    <AnimatedNumber value={summary?.totalPlayers ?? 680} />
                  </div>
                  <div className="text-[11px] text-faint mt-1">World Cup squads</div>
                </div>
              </div>

              {wcFinal && (
                <Link
                  href={`/matches/${wcFinal.matchId}`}
                  className="block bg-surface-2 border border-line-strong rounded-[3px] p-4 hover:border-gold/40 transition-colors"
                >
                  <div className="text-[10px] font-semibold tracking-[2px] uppercase text-pitch mb-3">
                    ⭐ World Cup Final · Dec 18, 2022
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-sm font-medium text-cream truncate">
                      {wcFinal.homeTeam.teamId}
                    </span>
                    <span className="font-display text-[32px] leading-none text-cream px-4 mx-3 border-x border-line-strong text-center min-w-[80px]">
                      {wcFinal.homeTeam.goals} – {wcFinal.awayTeam.goals}
                    </span>
                    <span className="flex-1 text-sm font-medium text-cream text-right truncate">
                      {wcFinal.awayTeam.teamId}
                    </span>
                  </div>
                  <div className="text-[11px] text-faint mt-2 text-center">
                    Argentina won on penalties · Lusail Stadium, Qatar
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ ICONIC MATCHES ═══════════════ */}
        {iconicMatches.length > 0 && (
          <section className="bg-ink border-t border-line">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20">
              <SectionHeader
                tag="Iconic Matches"
                title="DERBIES, THRILLERS & RECORDS"
                sub="The defining matches of the 2022–23 season"
                link={{ href: '/worldcup', label: 'World Cup archive' }}
              />

              <div className="hairline-grid sm:grid-cols-2 xl:grid-cols-4">
                {iconicMatches.map((match) => {
                  const label = ICONIC_LABELS[match.matchId] || match.competition
                  const isHomeWin = match.stats.result === 'home_win'
                  const isAwayWin = match.stats.result === 'away_win'
                  const badgeClass = COMP_BADGE[match.competition] ?? COMP_BADGE['Bundesliga']

                  return (
                    <Link
                      key={match.matchId}
                      href={`/matches/${match.matchId}`}
                      className="group bg-surface hover:bg-surface-2 p-5 transition-colors"
                    >
                      <span
                        className={`inline-block text-[9px] font-bold tracking-[2px] uppercase px-2 py-1 rounded-[1px] border mb-3.5 ${badgeClass}`}
                      >
                        {label}
                      </span>

                      <div className="mb-3">
                        <div className="flex items-center justify-between py-1.5 border-b border-line">
                          <span className="flex items-center gap-2 min-w-0">
                            <TeamLogo teamName={match.homeTeam.teamId} size={18} />
                            <span className="text-[13px] font-medium text-cream truncate">
                              {match.homeTeam.teamId}
                            </span>
                          </span>
                          <span
                            className={`font-display text-[22px] leading-none min-w-[24px] text-right ${
                              isHomeWin ? 'text-pitch' : 'text-cream'
                            }`}
                          >
                            {match.homeTeam.goals}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="flex items-center gap-2 min-w-0">
                            <TeamLogo teamName={match.awayTeam.teamId} size={18} />
                            <span className="text-[13px] font-medium text-cream truncate">
                              {match.awayTeam.teamId}
                            </span>
                          </span>
                          <span
                            className={`font-display text-[22px] leading-none min-w-[24px] text-right ${
                              isAwayWin ? 'text-pitch' : 'text-cream'
                            }`}
                          >
                            {match.awayTeam.goals}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-pitch font-medium">
                          {match.stats.totalGoals} goals
                        </span>
                        <span className="text-[10px] text-faint">{match.competition}</span>
                      </div>
                    </Link>
                  )
                })}

                {/* filler cards */}
                <Link
                  href="/teams"
                  className="bg-surface hover:bg-surface-2 p-5 flex items-center justify-center transition-colors"
                >
                  <span className="text-[11px] text-faint text-center tracking-[1px] uppercase leading-relaxed">
                    Explore
                    <br />
                    all teams →
                  </span>
                </Link>
                <Link
                  href="/leagues/premier-league"
                  className="bg-surface hover:bg-surface-2 p-5 flex items-center justify-center transition-colors"
                >
                  <span className="text-[11px] text-faint text-center tracking-[1px] uppercase leading-relaxed">
                    Browse by
                    <br />
                    league →
                  </span>
                </Link>
              </div>

              <div className="bg-surface border border-line border-t-0 px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-xs text-faint tracking-[0.5px]">
                  Showing iconic matches from all 6 competitions
                </span>
                <Link
                  href="/worldcup"
                  className="text-xs font-semibold tracking-[1.5px] uppercase text-pitch self-start sm:self-auto"
                >
                  Open World Cup archive →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ STARS OF THE ERA ═══════════════ */}
        <section className="bg-ink-2 border-t border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20">
            <StarsOfEra />
          </div>
        </section>

        {/* ═══════════════ EXPLORE LEAGUES ═══════════════ */}
        <section className="bg-ink border-t border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20">
            <SectionHeader
              tag="League Tables"
              title={
                <>
                  EXPLORE ALL
                  <br />
                  COMPETITIONS
                </>
              }
              sub="Full standings, results, and stats for every top European league"
              link={{ href: '/standings', label: 'View all leagues' }}
            />

            <div className="hairline-grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mb-px">
              {Object.entries(LEAGUE_SLUGS).map(([name, slug], i) => {
                const stats = leagueStats.find((c) => c.competition === name)
                return (
                  <Link
                    key={slug}
                    href={`/leagues/${slug}`}
                    className={`group relative px-5 py-7 text-center transition-colors ${
                      i === 0 ? 'bg-surface-2' : 'bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center mb-2.5">
                      <LeagueLogo
                        league={slug as 'premier-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1'}
                        size={36}
                      />
                    </span>
                    <div className="font-display text-sm sm:text-base tracking-[1px] text-cream mb-1">
                      {name.toUpperCase()}
                    </div>
                    {stats && (
                      <div className="text-[11px] text-faint">
                        {stats.goals.toLocaleString()} goals · {stats.matches} games
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 left-0 h-0.5 w-full"
                      style={{ background: LEAGUE_ACCENT[name] }}
                    />
                  </Link>
                )
              })}
            </div>

            <Link
              href="/worldcup"
              className="group bg-surface hover:bg-surface-2 border border-line px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
            >
              <span className="bg-gold/10 border border-gold/30 rounded-[2px] px-5 py-3 font-display text-sm tracking-[2px] text-gold whitespace-nowrap w-fit">
                ⭐ FIFA WORLD CUP 2022
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-cream mb-0.5">
                  FIFA World Cup 2022 — Qatar
                </span>
                <span className="block text-xs text-faint">
                  64 matches · Argentina Champions · 172 goals scored
                </span>
              </span>
              <span className="bg-pitch group-hover:bg-pitch-bright text-black text-xs font-semibold tracking-[1px] uppercase px-5 py-2.5 rounded-[2px] transition-colors w-fit">
                View Bracket →
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════ SEASON HIGHLIGHTS ═══════════════ */}
        <section className="bg-ink-2 border-t border-line">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-20">
            <SectionHeader
              tag="Season Highlights & Records"
              title={
                <>
                  THE MOMENTS THAT MADE
                  <br />
                  2022–23 UNFORGETTABLE
                </>
              }
            />

            <div className="hairline-grid sm:grid-cols-2 xl:grid-cols-4 mb-px">
              {HIGHLIGHTS_BIG.map((h) => (
                <div key={h.headline} className="bg-surface hover:bg-surface-2 px-5 py-6 transition-colors">
                  <div className="text-[9px] font-bold tracking-[2px] uppercase text-pitch mb-2.5">
                    {h.tag}
                  </div>
                  <div className="font-display text-lg tracking-[0.5px] text-cream leading-[1.1] mb-2.5">
                    {h.headline}
                  </div>
                  <p className="text-xs leading-[1.6] text-fog">{h.body}</p>
                </div>
              ))}
            </div>

            <div className="hairline-grid sm:grid-cols-2 xl:grid-cols-4">
              {HIGHLIGHTS_SMALL.map((h) => (
                <div key={h.title} className="bg-surface hover:bg-surface-2 px-5 py-4 transition-colors">
                  <div className="text-[9px] text-faint tracking-[1.5px] uppercase mb-1.5">2022–23</div>
                  <div className="text-[13px] font-medium text-cream mb-1 leading-[1.3]">{h.title}</div>
                  <p className="text-[11px] text-faint leading-[1.5]">{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
