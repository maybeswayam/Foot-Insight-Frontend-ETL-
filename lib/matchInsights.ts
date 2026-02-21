import type { Match } from './types'

// ─── Match Narrative ───────────────────────────────────────────────
// Derives a short, human-readable label that tells the story of the
// match using ONLY existing stat fields (goals, shots, accuracy, cards).

export interface MatchInsight {
  /** Short descriptive label like "Clinical Away Win" */
  narrative: string
  /** Which factor most influenced the outcome */
  decidingFactor: 'efficiency' | 'volume' | 'discipline' | 'balanced'
  /** 0–100 indicating how much the dominant team controlled the match */
  dominance: number
  /** Which side dominated (or null for balanced) */
  dominantSide: 'home' | 'away' | null
  /** Tailwind color class for the narrative badge */
  narrativeColor: string
}

export function getMatchInsight(match: Match): MatchInsight {
  const h = match.homeTeam
  const a = match.awayTeam
  const { result, totalGoals } = match.stats

  const shotDiff = h.shots - a.shots
  const accuracyDiff = h.shotAccuracy - a.shotAccuracy
  const sotDiff = h.shotsOnTarget - a.shotsOnTarget
  const goalDiff = h.goals - a.goals

  // ── Dominance score (0–100) ──
  // Combines shot share, accuracy gap, and goal margin.
  const totalShots = h.shots + a.shots || 1
  const shotShare = h.shots / totalShots // 0–1, 0.5 = even
  const shotDeviation = Math.abs(shotShare - 0.5) * 2 // 0-1
  const accDeviation = Math.min(Math.abs(accuracyDiff) / 40, 1) // 40% gap → max
  const goalDeviation = Math.min(Math.abs(goalDiff) / 4, 1) // 4-goal gap → max
  const dominance = Math.round(
    (shotDeviation * 35 + accDeviation * 30 + goalDeviation * 35),
  )
  const dominantSide: 'home' | 'away' | null =
    dominance < 20 ? null : shotDiff + goalDiff * 3 > 0 ? 'home' : 'away'

  // ── Deciding factor ──
  const decidingFactor = getDecidingFactor(match)

  // ── Narrative label ──
  const narrative = buildNarrative(match, dominance, decidingFactor)

  // ── Color ──
  const narrativeColor =
    result === 'draw'
      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      : dominance >= 60
        ? 'text-green-400 bg-green-500/10 border-green-500/20'
        : 'text-blue-400 bg-blue-500/10 border-blue-500/20'

  return { narrative, decidingFactor, dominance, dominantSide, narrativeColor }
}

function getDecidingFactor(
  match: Match,
): MatchInsight['decidingFactor'] {
  const h = match.homeTeam
  const a = match.awayTeam

  const winnerShots =
    match.stats.result === 'home_win' ? h.shots : match.stats.result === 'away_win' ? a.shots : 0
  const loserShots =
    match.stats.result === 'home_win' ? a.shots : match.stats.result === 'away_win' ? h.shots : 0
  const winnerAcc =
    match.stats.result === 'home_win' ? h.shotAccuracy : match.stats.result === 'away_win' ? a.shotAccuracy : 0
  const loserAcc =
    match.stats.result === 'home_win' ? a.shotAccuracy : match.stats.result === 'away_win' ? h.shotAccuracy : 0

  if (match.stats.result === 'draw') return 'balanced'

  // Winner had fewer shots but better accuracy → efficiency
  if (winnerShots <= loserShots && winnerAcc > loserAcc) return 'efficiency'

  // Winner had significantly more shots → volume
  if (winnerShots > loserShots * 1.3) return 'volume'

  // Card difference mattered (winner had fewer cards)
  const winnerCards =
    (match.stats.result === 'home_win' ? (h.yellowCards ?? 0) : (a.yellowCards ?? 0)) +
    (match.stats.result === 'home_win' ? (h.redCards ?? 0) : (a.redCards ?? 0)) * 2
  const loserCards =
    (match.stats.result === 'home_win' ? (a.yellowCards ?? 0) : (h.yellowCards ?? 0)) +
    (match.stats.result === 'home_win' ? (a.redCards ?? 0) : (h.redCards ?? 0)) * 2
  if (loserCards > winnerCards + 2) return 'discipline'

  return 'balanced'
}

function buildNarrative(
  match: Match,
  dominance: number,
  factor: MatchInsight['decidingFactor'],
): string {
  const { result, totalGoals } = match.stats
  const isHighScoring = totalGoals >= 4
  const isLowScoring = totalGoals <= 1

  if (result === 'draw') {
    if (totalGoals === 0) return 'Goalless Stalemate'
    if (isHighScoring) return 'High-Scoring Draw'
    if (dominance >= 40) return 'Fortunate Draw'
    return 'Balanced Contest'
  }

  const sideLabel = result === 'home_win' ? 'Home' : 'Away'

  if (dominance >= 70) {
    if (isHighScoring) return `${sideLabel} Demolition`
    return `One-Sided ${sideLabel} Win`
  }

  if (dominance >= 45) {
    if (factor === 'efficiency') return `Clinical ${sideLabel} Win`
    if (factor === 'volume') return `Dominant ${sideLabel} Win`
    return `Comfortable ${sideLabel} Win`
  }

  if (factor === 'efficiency') return `Efficient ${sideLabel} Victory`
  if (isLowScoring) return 'Tight Battle'
  if (isHighScoring) return 'Goal Fest'
  return 'Closely Fought Win'
}

// ─── Deciding-factor label & icon (for cards) ──────────────────────

export function getFactorLabel(factor: MatchInsight['decidingFactor']): string {
  switch (factor) {
    case 'efficiency':
      return 'Shot Efficiency'
    case 'volume':
      return 'Shot Volume'
    case 'discipline':
      return 'Discipline'
    case 'balanced':
      return 'Balanced'
  }
}

export function getFactorIcon(factor: MatchInsight['decidingFactor']): string {
  switch (factor) {
    case 'efficiency':
      return '🎯'
    case 'volume':
      return '📊'
    case 'discipline':
      return '🟨'
    case 'balanced':
      return '⚖️'
  }
}
