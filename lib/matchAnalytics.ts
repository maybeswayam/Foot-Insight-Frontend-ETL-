import type { AdvancedMatchStats, LineupPlayer, TeamStats } from '@/lib/types'

export interface SideAnalytics {
  goals: number
  shots: number
  shotsOnTarget: number
  shotAccuracy: number
  conversion: number // goals / shots %
  sotConversion: number // goals / SoT %
  bigChancesProxy: number // SoT as share of shots already in accuracy; keep goals/SoT
  corners: number
  fouls: number
  yellowCards: number
  redCards: number
  shotsFaced: number
  sotFaced: number
  goalsConceded: number
  /** Rough “clean sheet pressure” — opponent SoT */
  defensiveLoad: number
}

export interface MatchAnalytics {
  home: SideAnalytics
  away: SideAnalytics
  shotShareHome: number
  shotShareAway: number
  moreClinical: 'home' | 'away' | 'even'
  moreVolume: 'home' | 'away' | 'even'
  xg?: {
    home: number
    away: number
    homeOverperf: number
    awayOverperf: number
    possessionHome: number
    possessionAway: number
  }
  nerdTake: string
}

function sideAnalytics(team: TeamStats, opp: TeamStats): SideAnalytics {
  const shots = team.shots || 0
  const sot = team.shotsOnTarget || 0
  const goals = team.goals || 0
  return {
    goals,
    shots,
    shotsOnTarget: sot,
    shotAccuracy: team.shotAccuracy || (shots ? (sot / shots) * 100 : 0),
    conversion: shots ? (goals / shots) * 100 : 0,
    sotConversion: sot ? (goals / sot) * 100 : 0,
    bigChancesProxy: sot,
    corners: team.corners ?? 0,
    fouls: team.fouls ?? 0,
    yellowCards: team.yellowCards ?? 0,
    redCards: team.redCards ?? 0,
    shotsFaced: opp.shots || 0,
    sotFaced: opp.shotsOnTarget || 0,
    goalsConceded: opp.goals || 0,
    defensiveLoad: opp.shotsOnTarget || 0,
  }
}

export function buildMatchAnalytics(
  home: TeamStats,
  away: TeamStats,
  homeName: string,
  awayName: string,
  advanced: AdvancedMatchStats | null
): MatchAnalytics {
  const h = sideAnalytics(home, away)
  const a = sideAnalytics(away, home)
  const totalShots = h.shots + a.shots || 1
  const shotShareHome = Math.round((h.shots / totalShots) * 100)
  const shotShareAway = 100 - shotShareHome

  const moreClinical =
    Math.abs(h.conversion - a.conversion) < 2
      ? 'even'
      : h.conversion > a.conversion
        ? 'home'
        : 'away'
  const moreVolume =
    Math.abs(h.shots - a.shots) <= 1
      ? 'even'
      : h.shots > a.shots
        ? 'home'
        : 'away'

  const xg = advanced
    ? {
        home: advanced.homeXG,
        away: advanced.awayXG,
        homeOverperf: h.goals - advanced.homeXG,
        awayOverperf: a.goals - advanced.awayXG,
        possessionHome: advanced.homePossession,
        possessionAway: advanced.awayPossession,
      }
    : undefined

  const nerdTake = writeNerdTake(homeName, awayName, h, a, moreClinical, moreVolume, xg)

  return {
    home: h,
    away: a,
    shotShareHome,
    shotShareAway,
    moreClinical,
    moreVolume,
    xg,
    nerdTake,
  }
}

function writeNerdTake(
  homeName: string,
  awayName: string,
  h: SideAnalytics,
  a: SideAnalytics,
  clinical: MatchAnalytics['moreClinical'],
  volume: MatchAnalytics['moreVolume'],
  xg?: MatchAnalytics['xg']
): string {
  const parts: string[] = []

  parts.push(
    `Shot share ${Math.round((h.shots / (h.shots + a.shots || 1)) * 100)}–${Math.round(
      (a.shots / (h.shots + a.shots || 1)) * 100
    )} (${h.shots}–${a.shots}).`
  )

  parts.push(
    `Conversion ${h.conversion.toFixed(0)}% vs ${a.conversion.toFixed(0)}% · SoT→goal ${h.sotConversion.toFixed(0)}% vs ${a.sotConversion.toFixed(0)}%.`
  )

  if (clinical === 'home' && volume !== 'home') {
    parts.push(`${homeName} were the more clinical side despite not dominating volume.`)
  } else if (clinical === 'away' && volume !== 'away') {
    parts.push(`${awayName} punched above their shot volume.`)
  } else if (volume === 'home' && clinical === 'home') {
    parts.push(`${homeName} controlled both volume and finishing.`)
  } else if (volume === 'away' && clinical === 'away') {
    parts.push(`${awayName} controlled both volume and finishing.`)
  }

  if (xg) {
    const homeSign = xg.homeOverperf >= 0 ? '+' : ''
    const awaySign = xg.awayOverperf >= 0 ? '+' : ''
    parts.push(
      `xG ${xg.home.toFixed(2)}–${xg.away.toFixed(2)} · finishing ${homeSign}${xg.homeOverperf.toFixed(2)} / ${awaySign}${xg.awayOverperf.toFixed(2)} vs expectation · possession ${xg.possessionHome}–${xg.possessionAway}.`
    )
  }

  if (h.corners + a.corners > 0) {
    parts.push(`Corners ${h.corners}–${a.corners}, fouls ${h.fouls}–${a.fouls}.`)
  }

  return parts.join(' ')
}

/** Infer a classic formation string from starter position codes. */
export function inferFormation(starters: LineupPlayer[]): string {
  const codes = starters.map((p) => normalizePosCode(p.position))
  const def = codes.filter((c) => c === 'LB' || c === 'CB' || c === 'RB').length
  const dm = codes.filter((c) => c === 'DM').length
  const cm = codes.filter((c) => c === 'CM').length
  const am = codes.filter((c) => c === 'AM').length
  const wideMid = codes.filter((c) => c === 'LM' || c === 'RM').length
  const wings = codes.filter((c) => c === 'LW' || c === 'RW').length
  const fw = codes.filter((c) => c === 'FW').length
  const att = wings + fw
  const midBand = dm + cm + am + wideMid

  // Prefer more specific shapes first
  if (def === 4 && dm >= 2 && (am + wings) >= 2 && fw === 1) return '4-2-3-1'
  if (def === 4 && dm >= 2 && fw === 2 && am + wings >= 2) return '4-2-2-2'
  if (def === 4 && dm === 1 && wideMid + cm >= 4 && fw === 1 && att <= 2) return '4-1-4-1'
  if (def === 4 && midBand === 4 && am >= 1 && fw === 1 && wings === 0) return '4-4-1-1'
  if (def === 4 && midBand === 3 && att === 3) return '4-3-3'
  if (def === 4 && dm >= 1 && cm + am + wideMid === 2 && att === 3) return '4-3-3'
  if (def === 4 && midBand === 4 && fw === 2) return '4-4-2'
  if (def === 4 && midBand === 5 && fw === 1) return '4-5-1'
  if (def === 3 && midBand === 4 && am >= 2 && fw === 1) return '3-4-2-1'
  if (def === 3 && midBand === 5 && fw === 2) return '3-5-2'
  if (def === 3 && midBand === 4 && att === 3) return '3-4-3'
  if (def === 5 && midBand === 3 && fw === 2) return '5-3-2'
  if (def === 5 && midBand === 4 && fw === 1) return '5-4-1'

  // Soft fallbacks by defender count
  if (def >= 5) return fw >= 2 ? '5-3-2' : '5-4-1'
  if (def === 3) return att >= 3 ? '3-4-3' : '3-5-2'
  if (att >= 3) return '4-3-3'
  if (fw >= 2) return '4-4-2'
  return '4-3-3'
}

export function normalizePosCode(raw: string | null | undefined): string {
  if (!raw) return 'UNK'
  const p = raw.trim().toLowerCase()

  if (/^(gk|g)$/.test(p)) return 'GK'
  if (/^(cb|lcb|rcb)$/.test(p)) return 'CB'
  if (/^(lb|lwb)$/.test(p)) return 'LB'
  if (/^(rb|rwb)$/.test(p)) return 'RB'
  if (/^(dm|cdm|defensive midfielder)$/.test(p)) return 'DM'
  if (/^(cm|lcm|rcm|central midfielder)$/.test(p)) return 'CM'
  if (/^(am|cam|attacking midfielder)$/.test(p)) return 'AM'
  if (/^(lm|left midfielder)$/.test(p)) return 'LM'
  if (/^(rm|right midfielder)$/.test(p)) return 'RM'
  if (/^(lw|left wing)$/.test(p)) return 'LW'
  if (/^(rw|right wing)$/.test(p)) return 'RW'
  if (/^(fw|st|cf|ss|striker|center forward|centre forward)$/.test(p)) return 'FW'

  if (p.includes('goalkeeper')) return 'GK'
  if (p.includes('left back') || p.includes('left wing back')) return 'LB'
  if (p.includes('right back') || p.includes('right wing back')) return 'RB'
  if (p.includes('center back') || p.includes('centre back')) return 'CB'
  if (p.includes('defensive mid')) return 'DM'
  if (p.includes('attacking mid')) return 'AM'
  if (p.includes('left center mid') || p.includes('right center mid') || p.includes('center mid'))
    return 'CM'
  if (p.includes('left mid')) return 'LM'
  if (p.includes('right mid')) return 'RM'
  if (p.includes('left wing')) return 'LW'
  if (p.includes('right wing')) return 'RW'
  if (p.includes('forward') || p.includes('striker')) return 'FW'
  return 'CM'
}
