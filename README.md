# Foot-Insights

A data-driven football analytics dashboard built with **Next.js 16**, backed by a custom ETL pipeline that transforms multi-source football datasets into an analytics-ready API.

The platform covers the **2022 FIFA World Cup** and **Europe's top 5 leagues**, enabling exploration of matches, players, teams, league tables, and tournament insights at real-world scale.

Browse **1 890 matches**, **680 players**, and **130 teams** across **6 competitions**, with match-level comparisons, efficiency metrics, player leaderboards, team overviews, league tables, and a complete World Cup group + knockout view.

> **Note on advanced analytics**
>
> Advanced metrics such as expected goals (xG), possession, and pass accuracy are available **only for World Cup matches**, as most public league datasets do not provide these fields.  
> League matches intentionally fall back to base and derived statistics to avoid misleading or fabricated analytics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Language | TypeScript 5.7 |
| UI | Tailwind CSS 3.4 + shadcn/ui |
| Charts | Recharts 2.15 |
| Icons | Lucide React |
| Package Manager | pnpm 10 |
| Runtime | React 19, Node.js 18+ |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/your-username/foot-insights.git
cd foot-insights

# 2. Install dependencies
pnpm install

# 3. (Optional) Create .env.local — not required for local dev
cp .env.example .env.local

# 4. Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
foot-insights/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Inter font, dark mode)
│   ├── page.tsx                # Dashboard — KPIs, goals chart, recent matches
│   ├── globals.css             # Tailwind + shadcn CSS variables
│   ├── matches/
│   │   ├── page.tsx            # Match listing with filters & insights
│   │   └── [id]/page.tsx       # Match detail — lineups, xG, stats
│   ├── players/
│   │   ├── page.tsx            # Player grid + spotlight rankings
│   │   └── [id]/page.tsx       # Player detail — tabs, attributes, per-90
│   ├── teams/
│   │   ├── page.tsx            # Teams grouped by league
│   │   └── [id]/page.tsx       # Team detail — form, squad, stats tabs
│   ├── standings/page.tsx      # World Cup group standings
│   ├── worldcup/page.tsx       # World Cup hub + knockout bracket
│   ├── accolades/page.tsx      # Season awards & per-league records
│   ├── leagues/
│   │   └── [slug]/page.tsx     # League page — table, results, top stats
│   └── api/                    # REST API routes (GET only)
│       ├── summary/            # Dashboard KPIs
│       ├── matches/            # Match list + [id] detail
│       ├── players/            # Player list + [id] detail
│       ├── standings/          # World Cup group standings
│       ├── accolades/          # Awards computation
│       ├── league-table/       # League table builder
│       ├── team-logo/          # Team logo URL lookup
│       ├── team-logo-proxy/    # Badge image proxy (CORS bypass)
│       └── player-photo/       # Player photo proxy
├── components/
│   ├── Header.tsx              # Global nav with leagues dropdown
│   ├── TeamLogo.tsx            # Team badge with fallback SVG
│   ├── PlayerPhoto.tsx         # Player headshot via TheSportsDB
│   ├── CountryFlag.tsx         # Country flag via flagcdn
│   ├── MatchCard.tsx           # Match result card with insights
│   ├── KnockoutBracket.tsx     # World Cup bracket visualisation
│   ├── TeamDetailClient.tsx    # Team detail page — form, squad, stats
│   ├── LeaguePageClient.tsx    # League page — table, results, stats
│   ├── TeamsPageClient.tsx     # Teams listing grouped by competition
│   ├── WorldCupPageClient.tsx  # World Cup hub — groups + bracket
│   ├── StatBar.tsx             # Animated stat bar
│   ├── TeamBadge.tsx           # Badge helper
│   ├── FilterBar.tsx           # Generic filter controls
│   ├── ErrorState.tsx          # Error boundary UI
│   ├── LoadingSpinner.tsx      # Loading indicator
│   ├── theme-provider.tsx      # Dark/light theme
│   └── ui/                     # 48 shadcn/ui base components
├── lib/
│   ├── api.ts                  # Client-side API wrapper (apiClient)
│   ├── dataLoader.ts           # Server-side JSON loader with caching
│   ├── types.ts                # TypeScript interfaces (Player, Match, Team…)
│   ├── leagueTable.ts          # League table computation
│   ├── matchInsights.ts        # Match narrative generator
│   ├── imageService.ts         # Logo/photo lookup + caching
│   ├── enrichData.ts           # Data enrichment helpers
│   └── utils.ts                # Shared utilities (cn, formatPosition)
├── hooks/
│   ├── use-mobile.tsx          # Responsive breakpoint hook
│   └── use-toast.ts            # Toast notification hook
├── data/                       # Static JSON datasets
│   ├── matches.json            # 1 890 matches
│   ├── match_advanced.json     # xG, possession, pass accuracy
│   ├── players.json            # 680 players (World Cup squads)
│   ├── teams.json              # 130 teams across 6 competitions
│   ├── standings.json          # World Cup group standings
│   └── team_logos.json         # Pre-fetched team badge URLs
├── scripts/
│   ├── enrich_players.js       # Enrich player data from source CSVs
│   └── fetch_team_logos.js     # Fetch badge URLs from TheSportsDB
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md         # Technical architecture & data flow
│   ├── API.md                  # API routes reference
│   ├── CONTRIBUTING.md         # Dev workflow & coding standards
│   └── DEPLOYMENT.md           # Production deployment guide
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json             # shadcn/ui config
├── package.json
├── .env.example
└── .gitignore
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — KPIs, goals-by-competition chart, recent matches |
| `/matches` | All 1 890 matches with search, competition & result filters |
| `/matches/:id` | Match detail — score, lineups, xG comparison, advanced stats |
| `/players` | Player grid with spotlight rankings (Golden Boot, Playmaker, Threat Level) |
| `/players/:id` | Player profile — Overview & Full Stats tabs, attributes radar, per-90 metrics |
| `/teams` | Teams grouped by league with search |
| `/teams/:id` | Team detail — form streak, league position, squad, attacking/defensive stats |
| `/standings` | World Cup group standings tables |
| `/worldcup` | World Cup hub — group stage + interactive knockout bracket |
| `/accolades` | Season awards — top scorers, assists, xG leaders; per-league records |
| `/leagues/:slug` | League page — full table, recent results, top scorers/assists |

Supported league slugs: `premier-league`, `la-liga`, `bundesliga`, `serie-a`, `ligue-1`.

---

## Data Sources

All data lives in `data/` as static JSON files, loaded server-side via `lib/dataLoader.ts` with in-memory caching.

- **Match data** — sourced from football-data.co.uk CSVs (5 European leagues) + FIFA World Cup records
- **Player data** — World Cup squad rosters enriched with club info, per-90 rates, and penalty data via `scripts/enrich_players.js`
- **Team logos** — pre-fetched from TheSportsDB and cached in `data/team_logos.json`; served through an image proxy to avoid CORS issues
- **Player photos** — fetched live from TheSportsDB API with 24-hour server-side caching
- **Country flags** — served from flagcdn.com (no API key required)

All datasets are pre-processed offline via a Python ETL pipeline and exported as static JSON.  
The frontend API layer acts as a thin adapter, reshaping normalized data into UI-friendly responses.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE` | No | `""` (relative) | API base URL override |

See [.env.example](.env.example) for the template.

---

## Scripts

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

**Data scripts** (run manually when updating datasets):

```bash
node scripts/enrich_players.js     # Enrich player JSON from source CSVs
node scripts/fetch_team_logos.js   # Re-fetch team badge URLs from TheSportsDB
```

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — technical design, data flow, component hierarchy
- [API Reference](docs/API.md) — all REST endpoints with parameters and responses
- [Contributing](docs/CONTRIBUTING.md) — development workflow and coding standards
- [Deployment](docs/DEPLOYMENT.md) — production deployment guide

---

## License

MIT (for demonstration and portfolio use).
