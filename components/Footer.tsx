import Link from 'next/link'

const footerLinks = [
  { name: 'Players', href: '/players' },
  { name: 'Teams', href: '/teams' },
  { name: 'Standings', href: '/standings' },
  { name: 'World Cup', href: '/worldcup' },
  { name: 'Accolades', href: '/accolades' },
]

export function Footer() {
  return (
    <footer className="border-t border-line-strong bg-ink">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="font-display text-lg tracking-[1px] text-cream leading-none">
          Foot<span className="text-pitch">-Insights</span>
        </Link>
        <p className="text-xs text-faint order-last md:order-none">
          2022–23 Season Analytics · Built with Next.js
        </p>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs text-faint uppercase tracking-[1px] hover:text-pitch transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
