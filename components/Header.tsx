'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { LeagueLogo } from '@/components/LeagueLogo'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'World Cup 2022', href: '/worldcup' },
  { name: 'Teams', href: '/teams' },
  { name: 'Players', href: '/players' },
  { name: 'Accolades', href: '/accolades' },
]

const leagues = [
  { name: 'Premier League', href: '/leagues/premier-league', slug: 'premier-league' as const },
  { name: 'La Liga', href: '/leagues/la-liga', slug: 'la-liga' as const },
  { name: 'Bundesliga', href: '/leagues/bundesliga', slug: 'bundesliga' as const },
  { name: 'Serie A', href: '/leagues/serie-a', slug: 'serie-a' as const },
  { name: 'Ligue 1', href: '/leagues/ligue-1', slug: 'ligue-1' as const },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [leagueDropdownOpen, setLeagueDropdownOpen] = useState(false)
  const [mobileLeagueOpen, setMobileLeagueOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isLeagueActive = pathname.startsWith('/leagues')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLeagueDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setLeagueDropdownOpen(false)
    setMobileMenuOpen(false)
    setMobileLeagueOpen(false)
  }, [pathname])

  const linkClass = (active: boolean) =>
    `text-xs font-medium tracking-[1.5px] uppercase transition-colors ${
      active ? 'text-pitch' : 'text-fog hover:text-pitch'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-line-strong bg-[rgba(10,10,10,0.92)] backdrop-blur-[16px]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="flex h-[60px] items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 font-display text-[22px] tracking-[1px] text-cream leading-none">
            Foot<span className="text-pitch">-Insights</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-auto">
            {navigation.slice(0, 2).map((item) => (
              <Link key={item.name} href={item.href} className={linkClass(isActive(item.href))}>
                {item.name}
              </Link>
            ))}

            {/* Leagues Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`flex items-center gap-1 ${linkClass(isLeagueActive)}`}
              >
                Leagues
                <ChevronDown size={12} className={`transition-transform ${leagueDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {leagueDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 rounded-[2px] border border-line-strong bg-surface shadow-2xl shadow-black/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {leagues.map((league) => (
                    <Link
                      key={league.href}
                      href={league.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-[1px] uppercase transition-colors ${
                        isActive(league.href)
                          ? 'text-pitch bg-pitch/5'
                          : 'text-fog hover:text-cream hover:bg-surface-2'
                      }`}
                    >
                      <LeagueLogo league={league.slug} size={18} />
                      {league.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navigation.slice(2).map((item) => (
              <Link key={item.name} href={item.href} className={linkClass(isActive(item.href))}>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Season badge */}
          <span className="hidden lg:inline-block bg-pitch text-black text-[10px] font-semibold tracking-[1px] uppercase px-2.5 py-1 rounded-[2px]">
            2022–23 Season
          </span>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-fog hover:text-cream transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-line py-4 md:hidden animate-slide-up">
            <div className="flex flex-col gap-4">
              {navigation.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={linkClass(isActive(item.href))}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Leagues Accordion */}
              <button
                onClick={() => setMobileLeagueOpen(!mobileLeagueOpen)}
                className={`flex items-center gap-1 ${linkClass(isLeagueActive)}`}
              >
                Leagues
                <ChevronDown size={12} className={`transition-transform ${mobileLeagueOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileLeagueOpen && (
                <div className="ml-3 flex flex-col gap-3 border-l border-line-strong pl-4">
                  {leagues.map((league) => (
                    <Link
                      key={league.href}
                      href={league.href}
                      className={`flex items-center gap-2.5 ${linkClass(isActive(league.href))}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LeagueLogo league={league.slug} size={16} />
                      {league.name}
                    </Link>
                  ))}
                </div>
              )}

              {navigation.slice(2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={linkClass(isActive(item.href))}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
