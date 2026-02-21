'use client'

import { useState } from 'react'

/**
 * Map of country names (as they appear in our dataset) → ISO 3166-1 alpha-2 codes.
 * Used to look up flag images on flagcdn.com.
 */
const COUNTRY_CODE_MAP: Record<string, string> = {
  // World Cup 2022 teams
  'Argentina': 'ar',
  'Australia': 'au',
  'Belgium': 'be',
  'Brazil': 'br',
  'Cameroon': 'cm',
  'Canada': 'ca',
  'Costa Rica': 'cr',
  'Croatia': 'hr',
  'Denmark': 'dk',
  'Ecuador': 'ec',
  'England': 'gb-eng',
  'France': 'fr',
  'Germany': 'de',
  'Ghana': 'gh',
  'IR Iran': 'ir',
  'Iran': 'ir',
  'Japan': 'jp',
  'Korea Republic': 'kr',
  'South Korea': 'kr',
  'Mexico': 'mx',
  'Morocco': 'ma',
  'Netherlands': 'nl',
  'Poland': 'pl',
  'Portugal': 'pt',
  'Qatar': 'qa',
  'Saudi Arabia': 'sa',
  'Senegal': 'sn',
  'Serbia': 'rs',
  'Spain': 'es',
  'Switzerland': 'ch',
  'Tunisia': 'tn',
  'United States': 'us',
  'USA': 'us',
  'Uruguay': 'uy',
  'Wales': 'gb-wls',

  // Additional countries (club leagues)
  'Albania': 'al',
  'Algeria': 'dz',
  'Austria': 'at',
  'Bosnia and Herzegovina': 'ba',
  'Chile': 'cl',
  'China': 'cn',
  'Colombia': 'co',
  'Czech Republic': 'cz',
  'Egypt': 'eg',
  'Finland': 'fi',
  'Greece': 'gr',
  'Hungary': 'hu',
  'Iceland': 'is',
  'India': 'in',
  'Ireland': 'ie',
  'Israel': 'il',
  'Italy': 'it',
  'Ivory Coast': 'ci',
  'Jamaica': 'jm',
  'Mali': 'ml',
  'Nigeria': 'ng',
  'North Macedonia': 'mk',
  'Norway': 'no',
  'Paraguay': 'py',
  'Peru': 'pe',
  'Romania': 'ro',
  'Russia': 'ru',
  'Scotland': 'gb-sct',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'South Africa': 'za',
  'Sweden': 'se',
  'Turkey': 'tr',
  'Ukraine': 'ua',
  'Venezuela': 've',
}

interface CountryFlagProps {
  country: string
  size?: number
  className?: string
}

/**
 * Renders a country flag image using flagcdn.com.
 * Falls back to a placeholder if country code is unknown.
 */
export function CountryFlag({ country, size = 24, className = '' }: CountryFlagProps) {
  const [errored, setErrored] = useState(false)
  const code = COUNTRY_CODE_MAP[country]

  if (!code || errored) {
    // Fallback: globe emoji placeholder
    return (
      <span
        className={`inline-flex items-center justify-center text-center flex-shrink-0 ${className}`}
        style={{ width: size, height: Math.round(size * 0.75), fontSize: size * 0.6 }}
        title={country}
      >
        🌍
      </span>
    )
  }

  // flagcdn.com serves flags by ISO code, width-based sizing
  const width = Math.max(size, 20)
  const flagUrl = `https://flagcdn.com/w${width >= 80 ? 160 : 80}/${code}.png`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl}
      alt={`${country} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      className={`object-cover rounded-sm flex-shrink-0 ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
