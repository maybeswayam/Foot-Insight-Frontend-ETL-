import Link from 'next/link'
import { Github, Linkedin } from 'lucide-react'

const socials = [
  {
    name: 'GitHub',
    href: 'https://github.com/maybeswayam',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/swayam-adhana-01b2b2293',
    icon: Linkedin,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-line-strong bg-ink">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] sm:text-sm text-fog text-center sm:text-left leading-none">
          <Link href="/" className="text-cream hover:text-pitch transition-colors">
            Foot<span className="text-pitch">-Insights</span>
          </Link>
          <span className="mx-2 text-faint">·</span>
          <span>Built by </span>
          <a
            href="https://www.linkedin.com/in/swayam-adhana-01b2b2293"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cream hover:text-pitch transition-colors"
          >
            Swayam Adhana
          </a>
        </p>

        <div className="flex items-center gap-5">
          {socials.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[40px] text-[13px] sm:text-sm text-fog hover:text-cream transition-colors"
            >
              <Icon size={15} strokeWidth={1.75} aria-hidden />
              <span>{name}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
