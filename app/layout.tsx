import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Football Analytics | 2022 Season Archive',
    template: '%s | Football Analytics'
  },
  description: 'Premium football analytics platform featuring 2022 season data, World Cup coverage, player statistics, and award winners. Real-time data visualization and advanced match analytics.',
  keywords: ['football', 'analytics', 'soccer', '2022 season', 'world cup', 'player stats', 'match analysis'],
  authors: [{ name: 'Football Analytics Team' }],
  creator: 'v0.app',
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://football-analytics.app',
    title: 'Football Analytics | 2022 Season Archive',
    description: 'Premium football analytics platform with World Cup coverage and player statistics',
    siteName: 'Football Analytics',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a7d4e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased bg-background text-foreground`}>{children}</body>
    </html>
  )
}
