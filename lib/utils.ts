/** Format helpers shared across the app. */

/** Map short position codes to full names */
const POSITION_MAP: Record<string, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward',
}

export function formatPosition(code: string): string {
  return POSITION_MAP[code] ?? code
}
