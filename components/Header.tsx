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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLeagueDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setLeagueDropdownOpen(false)
    setMobileMenuOpen(false)
    setMobileLeagueOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-black text-foreground hidden sm:inline">
              FOOT<span className="text-green-500">INSIGHTS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 ml-auto items-center">
            {navigation.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive(item.href)
                    ? 'text-green-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Leagues Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLeagueDropdownOpen(!leagueDropdownOpen)}
                className={`text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  isLeagueActive
                    ? 'text-green-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Leagues
                <ChevronDown size={12} className={`transition-transform ${leagueDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {leagueDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {leagues.map((league) => (
                    <Link
                      key={league.href}
                      href={league.href}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
                        isActive(league.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <LeagueLogo league={league.slug} size={20} />
                      {league.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navigation.slice(2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive(item.href)
                    ? 'text-green-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Season Badge */}
            <Link
              href="/"
              className="ml-auto bg-green-500 hover:bg-green-600 text-black px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors"
            >
              2022-23 Season
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-border/40 py-3 md:hidden animate-slide-up">
            <div className="flex flex-col gap-1">
              {navigation.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10 border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Leagues Accordion */}
              <button
                onClick={() => setMobileLeagueOpen(!mobileLeagueOpen)}
                className={`flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ${
                  isLeagueActive
                    ? 'text-primary bg-primary/10 border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Leagues
                <ChevronDown size={14} className={`transition-transform ${mobileLeagueOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileLeagueOpen && (
                <div className="ml-4 flex flex-col gap-1 border-l-2 border-border/40 pl-3">
                  {leagues.map((league) => (
                    <Link
                      key={league.href}
                      href={league.href}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                        isActive(league.href)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LeagueLogo league={league.slug} size={18} />
                      {league.name}
                    </Link>
                  ))}
                </div>
              )}

              {navigation.slice(2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-lg transition-all ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10 border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
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
