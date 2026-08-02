import type { LineupPlayer } from '@/lib/types'
import { normalizePosCode } from '@/lib/matchAnalytics'

export type PosCode =
  | 'GK'
  | 'LB'
  | 'CB'
  | 'RB'
  | 'DM'
  | 'CM'
  | 'AM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'FW'
  | 'UNK'

export interface FormationSlot {
  /** Preferred position codes, ordered by preference */
  roles: PosCode[]
  /**
   * Classic vertical pitch coords (GK at bottom):
   * depth 0 = own goal, 100 = opposition box
   * lane 0 = left touchline, 100 = right
   */
  depth: number
  lane: number
  id: string
}

/** Horizontal pitch coords for home (left half) / away (right half). */
export interface PitchPoint {
  x: number
  y: number
}

/**
 * Formation templates mirroring classic tactical diagrams
 * (4-3-3, 4-4-2, 4-2-3-1, …) with clear line separation.
 */
export const FORMATION_SLOTS: Record<string, FormationSlot[]> = {
  '4-3-3': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'dm', roles: ['DM', 'CM'], depth: 38, lane: 50 },
    { id: 'lcm', roles: ['CM', 'LM', 'AM'], depth: 48, lane: 28 },
    { id: 'rcm', roles: ['CM', 'RM', 'AM'], depth: 48, lane: 72 },
    { id: 'lw', roles: ['LW', 'LM', 'AM'], depth: 72, lane: 14 },
    { id: 'st', roles: ['FW'], depth: 78, lane: 50 },
    { id: 'rw', roles: ['RW', 'RM', 'AM'], depth: 72, lane: 86 },
  ],
  '4-4-2': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'lm', roles: ['LM', 'LW'], depth: 48, lane: 12 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 46, lane: 36 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 46, lane: 64 },
    { id: 'rm', roles: ['RM', 'RW'], depth: 48, lane: 88 },
    { id: 'lst', roles: ['FW', 'AM'], depth: 76, lane: 36 },
    { id: 'rst', roles: ['FW', 'AM'], depth: 76, lane: 64 },
  ],
  '4-2-3-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'ldm', roles: ['DM', 'CM'], depth: 36, lane: 36 },
    { id: 'rdm', roles: ['DM', 'CM'], depth: 36, lane: 64 },
    { id: 'lam', roles: ['LW', 'LM', 'AM'], depth: 58, lane: 16 },
    { id: 'cam', roles: ['AM', 'CM'], depth: 60, lane: 50 },
    { id: 'ram', roles: ['RW', 'RM', 'AM'], depth: 58, lane: 84 },
    { id: 'st', roles: ['FW'], depth: 80, lane: 50 },
  ],
  '4-1-4-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'dm', roles: ['DM', 'CM'], depth: 34, lane: 50 },
    { id: 'lm', roles: ['LM', 'LW'], depth: 54, lane: 12 },
    { id: 'lcm', roles: ['CM', 'AM'], depth: 52, lane: 36 },
    { id: 'rcm', roles: ['CM', 'AM'], depth: 52, lane: 64 },
    { id: 'rm', roles: ['RM', 'RW'], depth: 54, lane: 88 },
    { id: 'st', roles: ['FW'], depth: 80, lane: 50 },
  ],
  '4-5-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'lm', roles: ['LM', 'LW'], depth: 48, lane: 10 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 46, lane: 30 },
    { id: 'cm', roles: ['CM', 'DM', 'AM'], depth: 44, lane: 50 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 46, lane: 70 },
    { id: 'rm', roles: ['RM', 'RW'], depth: 48, lane: 90 },
    { id: 'st', roles: ['FW', 'AM'], depth: 78, lane: 50 },
  ],
  '4-4-1-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'lm', roles: ['LM', 'LW'], depth: 46, lane: 12 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 44, lane: 36 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 44, lane: 64 },
    { id: 'rm', roles: ['RM', 'RW'], depth: 46, lane: 88 },
    { id: 'ss', roles: ['AM', 'FW'], depth: 64, lane: 50 },
    { id: 'st', roles: ['FW'], depth: 82, lane: 50 },
  ],
  '3-5-2': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lcb', roles: ['CB', 'LB'], depth: 20, lane: 28 },
    { id: 'cb', roles: ['CB'], depth: 18, lane: 50 },
    { id: 'rcb', roles: ['CB', 'RB'], depth: 20, lane: 72 },
    { id: 'lwb', roles: ['LB', 'LM', 'LW'], depth: 42, lane: 8 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 44, lane: 34 },
    { id: 'cm', roles: ['CM', 'DM', 'AM'], depth: 42, lane: 50 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 44, lane: 66 },
    { id: 'rwb', roles: ['RB', 'RM', 'RW'], depth: 42, lane: 92 },
    { id: 'lst', roles: ['FW', 'AM'], depth: 76, lane: 36 },
    { id: 'rst', roles: ['FW', 'AM'], depth: 76, lane: 64 },
  ],
  '3-4-3': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lcb', roles: ['CB', 'LB'], depth: 20, lane: 28 },
    { id: 'cb', roles: ['CB'], depth: 18, lane: 50 },
    { id: 'rcb', roles: ['CB', 'RB'], depth: 20, lane: 72 },
    { id: 'lm', roles: ['LM', 'LB', 'LW'], depth: 46, lane: 12 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 44, lane: 38 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 44, lane: 62 },
    { id: 'rm', roles: ['RM', 'RB', 'RW'], depth: 46, lane: 88 },
    { id: 'lw', roles: ['LW', 'LM', 'AM'], depth: 72, lane: 18 },
    { id: 'st', roles: ['FW'], depth: 78, lane: 50 },
    { id: 'rw', roles: ['RW', 'RM', 'AM'], depth: 72, lane: 82 },
  ],
  '5-3-2': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lwb', roles: ['LB', 'LM'], depth: 28, lane: 8 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 28 },
    { id: 'cb', roles: ['CB'], depth: 18, lane: 50 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 72 },
    { id: 'rwb', roles: ['RB', 'RM'], depth: 28, lane: 92 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 48, lane: 28 },
    { id: 'cm', roles: ['CM', 'DM', 'AM'], depth: 46, lane: 50 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 48, lane: 72 },
    { id: 'lst', roles: ['FW', 'AM'], depth: 76, lane: 36 },
    { id: 'rst', roles: ['FW', 'AM'], depth: 76, lane: 64 },
  ],
  '5-4-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lwb', roles: ['LB', 'LM'], depth: 28, lane: 8 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 28 },
    { id: 'cb', roles: ['CB'], depth: 18, lane: 50 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 72 },
    { id: 'rwb', roles: ['RB', 'RM'], depth: 28, lane: 92 },
    { id: 'lm', roles: ['LM', 'LW'], depth: 50, lane: 18 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 48, lane: 38 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 48, lane: 62 },
    { id: 'rm', roles: ['RM', 'RW'], depth: 50, lane: 82 },
    { id: 'st', roles: ['FW', 'AM'], depth: 78, lane: 50 },
  ],
  '3-4-2-1': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lcb', roles: ['CB', 'LB'], depth: 20, lane: 28 },
    { id: 'cb', roles: ['CB'], depth: 18, lane: 50 },
    { id: 'rcb', roles: ['CB', 'RB'], depth: 20, lane: 72 },
    { id: 'lm', roles: ['LM', 'LB', 'LW'], depth: 44, lane: 12 },
    { id: 'lcm', roles: ['CM', 'DM'], depth: 42, lane: 38 },
    { id: 'rcm', roles: ['CM', 'DM'], depth: 42, lane: 62 },
    { id: 'rm', roles: ['RM', 'RB', 'RW'], depth: 44, lane: 88 },
    { id: 'lam', roles: ['AM', 'LW', 'FW'], depth: 64, lane: 34 },
    { id: 'ram', roles: ['AM', 'RW', 'FW'], depth: 64, lane: 66 },
    { id: 'st', roles: ['FW'], depth: 82, lane: 50 },
  ],
  '4-2-2-2': [
    { id: 'gk', roles: ['GK'], depth: 6, lane: 50 },
    { id: 'lb', roles: ['LB'], depth: 22, lane: 12 },
    { id: 'lcb', roles: ['CB'], depth: 20, lane: 34 },
    { id: 'rcb', roles: ['CB'], depth: 20, lane: 66 },
    { id: 'rb', roles: ['RB'], depth: 22, lane: 88 },
    { id: 'ldm', roles: ['DM', 'CM'], depth: 38, lane: 36 },
    { id: 'rdm', roles: ['DM', 'CM'], depth: 38, lane: 64 },
    { id: 'lam', roles: ['AM', 'LW', 'LM'], depth: 58, lane: 28 },
    { id: 'ram', roles: ['AM', 'RW', 'RM'], depth: 58, lane: 72 },
    { id: 'lst', roles: ['FW'], depth: 78, lane: 36 },
    { id: 'rst', roles: ['FW'], depth: 78, lane: 64 },
  ],
}

const FALLBACK_SLOTS: FormationSlot[] = FORMATION_SLOTS['4-3-3']

export function getFormationSlots(formation: string): FormationSlot[] {
  return FORMATION_SLOTS[formation] ?? FALLBACK_SLOTS
}

/** Finer side bias for CBs / CMs from long position labels. */
export function sideBias(raw: string | null | undefined): number {
  if (!raw) return 50
  const p = raw.toLowerCase()
  if (p.includes('left')) return 25
  if (p.includes('right')) return 75
  return 50
}

function roleScore(code: PosCode, slot: FormationSlot): number {
  const idx = slot.roles.indexOf(code)
  if (idx === -1) return -1
  return 100 - idx * 12
}

/**
 * Assign each starter to a formation slot (greedy best role fit),
 * then map classic vertical slots → horizontal pitch coords.
 */
export function placeFormation(
  starters: LineupPlayer[],
  formation: string,
  side: 'home' | 'away'
): { player: LineupPlayer; posCode: PosCode; x: number; y: number; slotId: string }[] {
  const slots = getFormationSlots(formation).map((s) => ({ ...s }))
  const pool = starters.map((player) => ({
    player,
    code: normalizePosCode(player.position) as PosCode,
    bias: sideBias(player.position),
  }))

  type Assign = {
    player: LineupPlayer
    code: PosCode
    slot: FormationSlot
  }
  const assigned: Assign[] = []
  const usedPlayers = new Set<LineupPlayer>()
  const usedSlots = new Set<string>()

  // Build scored pairs
  const pairs: { playerIdx: number; slotIdx: number; score: number }[] = []
  pool.forEach((p, playerIdx) => {
    slots.forEach((slot, slotIdx) => {
      let score = roleScore(p.code, slot)
      if (score < 0) {
        // Soft fallback so everyone still places
        score = 5
      }
      // Prefer left-biased players for left-lane slots
      const laneFit = 20 - Math.abs(p.bias - slot.lane) / 5
      score += laneFit
      pairs.push({ playerIdx, slotIdx, score })
    })
  })

  pairs.sort((a, b) => b.score - a.score)

  for (const pair of pairs) {
    const p = pool[pair.playerIdx]
    const slot = slots[pair.slotIdx]
    if (usedPlayers.has(p.player) || usedSlots.has(slot.id)) continue
    usedPlayers.add(p.player)
    usedSlots.add(slot.id)
    assigned.push({ player: p.player, code: p.code, slot })
    if (assigned.length === Math.min(pool.length, slots.length)) break
  }

  // Any leftover players → leftover slots by lane bias
  const leftoverPlayers = pool.filter((p) => !usedPlayers.has(p.player))
  const leftoverSlots = slots.filter((s) => !usedSlots.has(s.id))
  leftoverPlayers
    .sort((a, b) => a.bias - b.bias)
    .forEach((p, i) => {
      const slot = leftoverSlots[i]
      if (!slot) return
      assigned.push({ player: p.player, code: p.code, slot })
    })

  return assigned.map(({ player, code, slot }) => {
    const point = toHorizontal(slot.depth, slot.lane, side)
    return {
      player,
      posCode: code,
      slotId: slot.id,
      x: point.x,
      y: point.y,
    }
  })
}

/** Convert vertical diagram coords → horizontal home/away pitch. */
export function toHorizontal(depth: number, lane: number, side: 'home' | 'away'): PitchPoint {
  // Home: GK left, attack toward center. Lane → vertical axis.
  const xHome = 4 + (depth / 100) * 44
  const yHome = lane
  if (side === 'home') return { x: xHome, y: yHome }
  return { x: 100 - xHome, y: 100 - yHome }
}
