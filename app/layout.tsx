import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Foot-Insights | Football Analytics Platform (World Cup & Top Leagues)',
    template: '%s | Foot-Insights'
  },
  description: 'Football analytics platform covering the 2022 World Cup and Europe\'s top leagues with match insights, player stats, team analytics, and interactive dashboards.',
  keywords: ['football', 'analytics', 'soccer', '2022 season', 'world cup', 'player stats', 'match analysis', 'foot-insights'],
  authors: [{ name: 'Foot-Insights Team' }],
  creator: 'Foot-Insights',
  generator: 'Next.js',
  icons: {
    icon: '/logos/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://foot-insights.vercel.app',
    title: 'Foot-Insights | Football Analytics Platform',
    description: 'Football analytics covering the 2022 World Cup and Europe\'s top leagues with match insights, player stats, and interactive dashboards.',
    siteName: 'Foot-Insights',
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
