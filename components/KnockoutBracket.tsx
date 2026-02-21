'use client'

import Link from 'next/link'
import { CountryFlag } from '@/components/CountryFlag'

/* ─────────────── 2022 FIFA World Cup Knockout Data ─────────────── */

interface KnockoutMatch {
  id: number
  /** Match ID linking to /matches/:matchId */
  matchId: number
  date: string
  venue: string
  home: string
  away: string
  homeScore: number
  awayScore: number
  /** Extra-time score (90-min score if match went to ET, else null) */
  homeScoreET?: number
  awayScoreET?: number
  /** Penalty shootout score (null if no shootout) */
  homePens?: number
  awayPens?: number
  winner: string
}

interface KnockoutRound {
  name: string
  matches: KnockoutMatch[]
}

const KNOCKOUT_ROUNDS: KnockoutRound[] = [
  {
    name: 'Round of 16',
    matches: [
      { id: 1, matchId: 1875, date: 'Dec 3', venue: 'Khalifa International Stadium', home: 'Netherlands', away: 'United States', homeScore: 3, awayScore: 1, winner: 'Netherlands' },
      { id: 2, matchId: 1876, date: 'Dec 3', venue: 'Ahmad Bin Ali Stadium', home: 'Argentina', away: 'Australia', homeScore: 2, awayScore: 1, winner: 'Argentina' },
      { id: 3, matchId: 1879, date: 'Dec 5', venue: 'Al Janoub Stadium', home: 'Japan', away: 'Croatia', homeScore: 1, awayScore: 1, homeScoreET: 1, awayScoreET: 1, homePens: 1, awayPens: 3, winner: 'Croatia' },
      { id: 4, matchId: 1880, date: 'Dec 5', venue: 'Stadium 974', home: 'Brazil', away: 'Korea Republic', homeScore: 4, awayScore: 1, winner: 'Brazil' },
      { id: 5, matchId: 1881, date: 'Dec 6', venue: 'Education City Stadium', home: 'Morocco', away: 'Spain', homeScore: 0, awayScore: 0, homeScoreET: 0, awayScoreET: 0, homePens: 3, awayPens: 0, winner: 'Morocco' },
      { id: 6, matchId: 1882, date: 'Dec 6', venue: 'Lusail Iconic Stadium', home: 'Portugal', away: 'Switzerland', homeScore: 6, awayScore: 1, winner: 'Portugal' },
      { id: 7, matchId: 1878, date: 'Dec 4', venue: 'Al Bayt Stadium', home: 'England', away: 'Senegal', homeScore: 3, awayScore: 0, winner: 'England' },
      { id: 8, matchId: 1877, date: 'Dec 4', venue: 'Al Thumama Stadium', home: 'France', away: 'Poland', homeScore: 3, awayScore: 1, winner: 'France' },
    ],
  },
  {
    name: 'Quarter-finals',
    matches: [
      { id: 9, matchId: 1883, date: 'Dec 9', venue: 'Education City Stadium', home: 'Croatia', away: 'Brazil', homeScore: 1, awayScore: 1, homeScoreET: 1, awayScoreET: 1, homePens: 4, awayPens: 2, winner: 'Croatia' },
      { id: 10, matchId: 1884, date: 'Dec 9', venue: 'Lusail Iconic Stadium', home: 'Netherlands', away: 'Argentina', homeScore: 2, awayScore: 2, homeScoreET: 2, awayScoreET: 2, homePens: 3, awayPens: 4, winner: 'Argentina' },
      { id: 11, matchId: 1885, date: 'Dec 10', venue: 'Al Thumama Stadium', home: 'Morocco', away: 'Portugal', homeScore: 1, awayScore: 0, winner: 'Morocco' },
      { id: 12, matchId: 1886, date: 'Dec 10', venue: 'Al Bayt Stadium', home: 'England', away: 'France', homeScore: 1, awayScore: 2, winner: 'France' },
    ],
  },
  {
    name: 'Semi-finals',
    matches: [
      { id: 13, matchId: 1887, date: 'Dec 13', venue: 'Lusail Iconic Stadium', home: 'Argentina', away: 'Croatia', homeScore: 3, awayScore: 0, winner: 'Argentina' },
      { id: 14, matchId: 1888, date: 'Dec 14', venue: 'Al Bayt Stadium', home: 'France', away: 'Morocco', homeScore: 2, awayScore: 0, winner: 'France' },
    ],
  },
  {
    name: 'Third Place',
    matches: [
      { id: 15, matchId: 1889, date: 'Dec 17', venue: 'Khalifa International Stadium', home: 'Croatia', away: 'Morocco', homeScore: 2, awayScore: 1, winner: 'Croatia' },
    ],
  },
  {
    name: 'Final',
    matches: [
      { id: 16, matchId: 1890, date: 'Dec 18', venue: 'Lusail Iconic Stadium', home: 'Argentina', away: 'France', homeScore: 3, awayScore: 3, homeScoreET: 3, awayScoreET: 3, homePens: 4, awayPens: 2, winner: 'Argentina' },
    ],
  },
]

/* ─────────────── Components ─────────────── */

function ScoreDisplay({ match, side }: { match: KnockoutMatch; side: 'home' | 'away' }) {
  const score = side === 'home' ? match.homeScore : match.awayScore
  const pens = side === 'home' ? match.homePens : match.awayPens
  const team = side === 'home' ? match.home : match.away
  const isWinner = match.winner === team
  const hasPens = match.homePens !== undefined
  const hasET = match.homeScoreET !== undefined

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-sm tabular-nums font-bold ${isWinner ? 'text-foreground' : 'text-muted-foreground'}`}>
        {score}
      </span>
      {hasPens && (
        <span className="text-[10px] tabular-nums text-muted-foreground/70">
          ({pens})
        </span>
      )}
      {hasET && !hasPens && (
        <span className="text-[10px] text-muted-foreground/60">aet</span>
      )}
    </div>
  )
}

function MatchCard({ match }: { match: KnockoutMatch }) {
  const hasPens = match.homePens !== undefined

  return (
    <Link href={`/matches/${match.matchId}`} className="block">
    <div className="group relative w-full rounded-xl border border-border/30 bg-card/80 backdrop-blur-sm overflow-hidden hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/5 cursor-pointer">
      {/* Date header */}
      <div className="px-3 py-1.5 bg-secondary/30 border-b border-border/20 flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {match.date}
        </span>
        {hasPens && (
          <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider">Penalties</span>
        )}
      </div>

      {/* Teams */}
      <div className="px-3 py-2 space-y-1">
        {/* Home team */}
        <div className={`flex items-center justify-between gap-2 ${match.winner === match.home ? '' : 'opacity-50'}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CountryFlag country={match.home} size={20} />
            <span className={`text-xs truncate ${match.winner === match.home ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
              {match.home}
            </span>
          </div>
          <ScoreDisplay match={match} side="home" />
        </div>

        {/* Away team */}
        <div className={`flex items-center justify-between gap-2 ${match.winner === match.away ? '' : 'opacity-50'}`}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CountryFlag country={match.away} size={20} />
            <span className={`text-xs truncate ${match.winner === match.away ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
              {match.away}
            </span>
          </div>
          <ScoreDisplay match={match} side="away" />
        </div>
      </div>
    </div>
    </Link>
  )
}

export function KnockoutBracket() {
  const r16 = KNOCKOUT_ROUNDS[0].matches
  const qf = KNOCKOUT_ROUNDS[1].matches
  const sf = KNOCKOUT_ROUNDS[2].matches
  const thirdPlace = KNOCKOUT_ROUNDS[3].matches[0]
  const final = KNOCKOUT_ROUNDS[4].matches[0]

  // Split bracket into top half and bottom half
  // Top half: R16 matches 1-4 → QF 1-2 → SF 1 → Final
  // Bottom half: R16 matches 5-8 → QF 3-4 → SF 2 → Final
  const topR16 = r16.slice(0, 4)
  const bottomR16 = r16.slice(4, 8)
  const topQF = qf.slice(0, 2)
  const bottomQF = qf.slice(2, 4)
  const topSF = sf[0]
  const bottomSF = sf[1]

  return (
    <div className="space-y-8">
      {/* ─── Desktop Bracket Layout ─── */}
      <div className="hidden lg:block">
        <DesktopBracket
          topR16={topR16}
          bottomR16={bottomR16}
          topQF={topQF}
          bottomQF={bottomQF}
          topSF={topSF}
          bottomSF={bottomSF}
          final={final}
          thirdPlace={thirdPlace}
        />
      </div>

      {/* ─── Mobile / Tablet: Round-by-round scroll ─── */}
      <div className="lg:hidden space-y-10">
        {KNOCKOUT_ROUNDS.map((round) => (
          <div key={round.name}>
            <h3 className="text-base font-black text-foreground mb-4 flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-green-500" />
              {round.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {round.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Champion Banner ─── */}
      <div className="relative rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
        <div className="relative px-6 py-8 flex flex-col items-center gap-4 text-center">
          <div className="text-amber-400 text-3xl">🏆</div>
          <div>
            <p className="text-[10px] font-bold text-amber-400/70 uppercase tracking-[0.2em] mb-1">
              2022 FIFA World Cup Champion
            </p>
            <div className="flex items-center gap-3 justify-center">
              <CountryFlag country="Argentina" size={36} />
              <h2 className="text-3xl font-black text-foreground">Argentina</h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Argentina defeated France 4-2 on penalties after a thrilling 3-3 draw in the final at Lusail Iconic Stadium
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Desktop Bracket (large screens) ─── */

interface DesktopBracketProps {
  topR16: KnockoutMatch[]
  bottomR16: KnockoutMatch[]
  topQF: KnockoutMatch[]
  bottomQF: KnockoutMatch[]
  topSF: KnockoutMatch
  bottomSF: KnockoutMatch
  final: KnockoutMatch
  thirdPlace: KnockoutMatch
}

function DesktopBracket({ topR16, bottomR16, topQF, bottomQF, topSF, bottomSF, final, thirdPlace }: DesktopBracketProps) {
  return (
    <div className="relative">
      {/* Round labels */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 mb-4">
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Round of 16</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quarter-finals</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Semi-finals</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Semi-finals</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quarter-finals</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Round of 16</span>
        </div>
      </div>

      {/* Bracket with matches */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 items-center">
        {/* LEFT R16: 4 matches stacked */}
        <div className="space-y-3">
          {topR16.map((m) => (
            <BracketMatchCard key={m.id} match={m} />
          ))}
        </div>

        {/* LEFT QF: 2 matches centered */}
        <div className="space-y-3 flex flex-col justify-around h-full">
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <BracketMatchCard match={topQF[0]} />
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <BracketMatchCard match={topQF[1]} />
            </div>
          </div>
        </div>

        {/* LEFT SF */}
        <div className="flex items-center justify-center h-full">
          <div className="w-full">
            <BracketMatchCard match={topSF} />
          </div>
        </div>

        {/* RIGHT SF */}
        <div className="flex items-center justify-center h-full">
          <div className="w-full">
            <BracketMatchCard match={bottomSF} />
          </div>
        </div>

        {/* RIGHT QF: 2 matches centered */}
        <div className="space-y-3 flex flex-col justify-around h-full">
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <BracketMatchCard match={bottomQF[0]} />
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <BracketMatchCard match={bottomQF[1]} />
            </div>
          </div>
        </div>

        {/* RIGHT R16: 4 matches stacked */}
        <div className="space-y-3">
          {bottomR16.map((m) => (
            <BracketMatchCard key={m.id} match={m} />
          ))}
        </div>
      </div>

      {/* Final & Third Place centered below */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🏆 Final</span>
          </div>
          <FinalMatchCard match={final} />
        </div>
        <div className="w-full max-w-xs">
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">3rd Place</span>
          </div>
          <BracketMatchCard match={thirdPlace} />
        </div>
      </div>
    </div>
  )
}

/* ─── Compact Bracket Match Card ─── */

function BracketMatchCard({ match }: { match: KnockoutMatch }) {
  const hasPens = match.homePens !== undefined

  return (
    <Link href={`/matches/${match.matchId}`} className="block">
    <div className="rounded-lg border border-border/30 bg-card/80 overflow-hidden hover:border-green-500/40 transition-all cursor-pointer">
      {/* Row for home */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 ${match.winner === match.home ? '' : 'opacity-50'}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <CountryFlag country={match.home} size={16} />
          <span className={`text-[11px] truncate ${match.winner === match.home ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
            {match.home}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs tabular-nums ${match.winner === match.home ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
            {match.homeScore}
          </span>
          {hasPens && (
            <span className="text-[9px] tabular-nums text-muted-foreground/60">({match.homePens})</span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/20" />

      {/* Row for away */}
      <div className={`flex items-center justify-between px-2.5 py-1.5 ${match.winner === match.away ? '' : 'opacity-50'}`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <CountryFlag country={match.away} size={16} />
          <span className={`text-[11px] truncate ${match.winner === match.away ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
            {match.away}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs tabular-nums ${match.winner === match.away ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
            {match.awayScore}
          </span>
          {hasPens && (
            <span className="text-[9px] tabular-nums text-muted-foreground/60">({match.awayPens})</span>
          )}
        </div>
      </div>

      {/* Date footer */}
      <div className="border-t border-border/10 px-2.5 py-1 bg-secondary/20">
        <span className="text-[9px] text-muted-foreground/60">{match.date} · {match.venue}</span>
      </div>
    </div>
    </Link>
  )
}

/* ─── Final Match Card (special styling) ─── */

function FinalMatchCard({ match }: { match: KnockoutMatch }) {
  const hasPens = match.homePens !== undefined

  return (
    <Link href={`/matches/${match.matchId}`} className="block">
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-card/80 overflow-hidden shadow-lg shadow-amber-500/5 hover:border-amber-500/50 transition-all cursor-pointer">
      {/* Home */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${match.winner === match.home ? '' : 'opacity-50'}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CountryFlag country={match.home} size={24} />
          <span className={`text-sm truncate ${match.winner === match.home ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
            {match.home}
          </span>
          {match.winner === match.home && (
            <span className="text-amber-400 text-sm">🏆</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-base tabular-nums ${match.winner === match.home ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
            {match.homeScore}
          </span>
          {hasPens && (
            <span className="text-[10px] tabular-nums text-amber-400/70 font-bold">({match.homePens})</span>
          )}
        </div>
      </div>

      <div className="border-t border-amber-500/10" />

      {/* Away */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${match.winner === match.away ? '' : 'opacity-50'}`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CountryFlag country={match.away} size={24} />
          <span className={`text-sm truncate ${match.winner === match.away ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
            {match.away}
          </span>
          {match.winner === match.away && (
            <span className="text-amber-400 text-sm">🏆</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-base tabular-nums ${match.winner === match.away ? 'font-black text-foreground' : 'text-muted-foreground'}`}>
            {match.awayScore}
          </span>
          {hasPens && (
            <span className="text-[10px] tabular-nums text-amber-400/70 font-bold">({match.awayPens})</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-amber-500/10 px-4 py-1.5 bg-amber-500/5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{match.date} · {match.venue}</span>
        {hasPens && (
          <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-wider">After Penalties</span>
        )}
      </div>
    </div>
    </Link>
  )
}
