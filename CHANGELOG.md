# Changelog

All notable changes to the Foot-Insights project.

---

## [1.0.0] — 2025-06-01

### Features

- **Dashboard** — KPI cards (matches, teams, players, avg goals), goals-by-competition bar chart, recent matches with insight labels
- **Matches** — Browse 1 890 matches with search, competition & result filters; detail pages with xG, possession, pass accuracy, lineups
- **Players** — Player grid with spotlight rankings (Golden Boot, Playmaker, Threat Level); detail pages with Overview & Full Stats tabs, attribute bars, per-90 metrics
- **Teams** — Teams grouped by league with search; detail pages with form streak, league position, squad roster, attacking/defensive stats tabs
- **Standings** — World Cup group stage standings tables
- **World Cup** — Hub page with group tables and interactive knockout bracket
- **Accolades** — Season awards (top scorers, assists, xG, xA leaders) and per-league records (top scoring team, best defense, biggest win)
- **League pages** — Dedicated pages for Premier League, La Liga, Bundesliga, Serie A, Ligue 1 with league tables, recent results, and top performers
- **Navigation** — Global header with competition links and leagues dropdown
- **Image system** — Team logos (TheSportsDB, proxied), player photos (TheSportsDB, live), country flags (flagcdn)
- **Match insights** — Auto-generated narrative labels and dominance scores for every match
- **Dark mode** — Default dark theme with shadcn/ui design system

### Technical

- Next.js 16.1 with App Router and Turbopack
- React 19, TypeScript 5.7, Tailwind CSS 3.4
- 48 shadcn/ui base components
- 9 REST API routes (GET-only, JSON data)
- In-memory data caching for static JSON datasets
- Image proxy routes for CORS-safe logo/photo delivery
- ETL scripts for player enrichment and logo fetching

### Data

- 1 890 matches across 6 competitions (2022 season)
- 680 players (World Cup squads)
- 130 teams
- Advanced match stats (xG, possession, pass accuracy) for all matches
- Pre-fetched team badge URLs
