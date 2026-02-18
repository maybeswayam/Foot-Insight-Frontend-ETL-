import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a raw match result string for display */
export function formatResult(result: string): string {
  switch (result) {
    case 'home_win':
      return 'Home Win'
    case 'away_win':
      return 'Away Win'
    case 'draw':
      return 'Draw'
    default:
      return result
  }
}

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

/** Display age – return "N/A" when the value is 0 or missing */
export function formatAge(age: number | null | undefined): string {
  return age ? String(age) : 'N/A'
}
