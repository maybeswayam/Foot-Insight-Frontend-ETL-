# Foot-Insights — Project Overview

A data-driven football analytics dashboard for the **2022 season archive**, covering the **FIFA World Cup** and **Europe's top 5 leagues**. Built with Next.js over a custom ETL pipeline that exports multi-source football datasets as analytics-ready static JSON.

Browse **1,890 matches**, **680 players**, and **130 teams** across **6 competitions**, with match-level comparisons, efficiency metrics, player leaderboards, team overviews, league tables, and a complete World Cup group + knockout view.

> **Note on advanced analytics**
>
> Advanced metrics such as expected goals (xG), possession, and pass accuracy are available **only for World Cup matches**. Most public league datasets do not provide these fields. League matches intentionally fall back to base and derived statistics to avoid misleading or fabricated analytics.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1 (App Router, Turbopack) |
| Language | TypeScript 5.7 |
| UI | React 19 · Tailwind CSS 3.4 · shadcn/ui |
| Charts | Recharts 2.15 |
| Icons | Lucide React |
| Package Manager | pnpm 10 |
| Runtime | Node.js 18+ |

---

## High-Level Architecture

```
Browser
  └─ Next.js Client Components (React 19 + Tailwind + shadcn/ui)
       └─ lib/api.ts  →  fetch("/api/…")
            └─ app/api/*/route.ts
                 ├─ lib/dataLoader.ts      → data/*.json (in-memory cache)
                 ├─ lib/leagueTable.ts     → standings computation
                 ├─ lib/matchInsights.ts   → match narratives
                 └─ lib/imageService.ts    → logo / photo lookups
```

### Design decisions

1. **Static JSON over a database** — Fixed 2022-season archive; zero DB dependency; deploys anywhere.
2. **Image proxy routes** — Team logos and player photos proxied through Next.js to avoid CORS / hotlink issues and enable caching headers.
3. **In-memory caching** — `dataLoader.ts` caches parsed JSON for the process lifetime (no TTL; data does not change).
4. **Client-side fetching** — Pages use `useEffect` + `apiClient` for a consistent, simple data pattern.
5. **Competition name divergence** — `teams.json` uses `"World Cup"` while `matches.json` uses `"FIFA World Cup"`. Routing uses `leagueSlug` matching rather than raw name comparison.
6. **shadcn/ui as source** — UI primitives live in `components/ui/` as editable source files.

---

## Project Structure

```
foot-insights/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Inter font, dark mode)
│   ├── page.tsx                # Dashboard — KPIs, charts, iconic matches
│   ├── globals.css             # Tailwind + design tokens
│   ├── matches/
│   ├── players/
│   ├── teams/
│   ├── standings/
│   ├── worldcup/
│   ├── accolades/
│   ├── leagues/[slug]/
│   └── api/                    # REST API routes (GET only)
├── components/                 # Domain + shared UI
│   └── ui/                     # ~48 shadcn/ui primitives
├── lib/                        # Types, data loading, API client, insights
├── hooks/
├── data/                       # Static JSON datasets
├── scripts/                    # Offline enrichment / image fetch scripts
├── docs/                       # Architecture, API, contributing, deployment
├── public/logos/               # Favicon + league logo assets
└── …
```

---

## Data Layer

All datasets live in `data/` and are loaded server-side via `lib/dataLoader.ts`.

| File | Records | Purpose |
|------|---------|---------|
| `matches.json` | 1,890 | League + World Cup results and base match stats |
| `match_advanced.json` | 64 (WC only) | xG, possession, pass accuracy |
| `players.json` | 680 | World Cup squad rosters + tournament stats |
| `teams.json` | 130 | Clubs and national teams across 6 competitions |
| `standings.json` | 32 | World Cup group standings (A–H) |
| `team_logos.json` | 130 | Pre-fetched team badge URLs |
| `player_photos.json` | 612 | Pre-fetched player headshot URLs |

### Matches by competition

| Competition | Matches |
|-------------|---------|
| Premier League | 380 |
| La Liga | 380 |
| Serie A | 380 |
| Ligue 1 | 380 |
| Bundesliga | 306 |
| FIFA World Cup | 64 |

### Teams by competition

| Competition | Teams |
|-------------|-------|
| Premier League | 20 |
| La Liga | 20 |
| Serie A | 20 |
| Ligue 1 | 20 |
| Bundesliga | 18 |
| World Cup | 32 |

### Sources

- **Match data** — football-data.co.uk CSVs (5 European leagues) + FIFA World Cup records
- **Player data** — World Cup squads enriched via `scripts/enrich_players.js` (club, per-90, penalties)
- **Team logos** — TheSportsDB, cached in `team_logos.json`; served via image proxy
- **Player photos** — TheSportsDB cutouts, cached in `player_photos.json` with live API fallback
- **Country flags** — flagcdn.com (no API key)

Offline ETL (Python) produces the JSON exports. The Next.js API layer is a thin adapter that reshapes normalized data for the UI.

---

## Player Stats

Players in this archive are **World Cup 2022 squad members only** (32 national teams). Positions break down roughly as: DF 228 · MF 226 · FW 185 · GK 41. Top tournament scorer in the dataset: **Kylian Mbappé (8)**.

### Core identity

| Field | Description |
|-------|-------------|
| `playerId` | Unique id |
| `name` | Display name |
| `teamId` / `team` | National team |
| `club` | Club affiliation (enriched) |
| `position` | `GK` · `DF` · `MF` · `FW` |
| `age` | Age at tournament |

### `stats` object

| Field | Description |
|-------|-------------|
| `games` | Appearances |
| `gamesStarted` | Starts |
| `minutes` | Minutes played |
| `goals` / `assists` | Scoring contribution |
| `shots` / `shotsOnTarget` | Shooting volume |
| `passesCompleted` / `passesAttempted` / `passAccuracy` | Passing |
| `tackles` / `interceptions` / `touches` | Involvement & defending |
| `xG` / `xA` | Expected goals / assists |
| `goalsP90` / `assistsP90` / `xGP90` / `xAP90` | Per-90 rates |
| `yellowCards` / `redCards` | Discipline |
| `pensMade` / `pensAtt` | Penalties |

### `metrics` object

| Field | Description |
|-------|-------------|
| `goalsPerGame` | Goals ÷ games |
| `shotEfficiency` | Derived finishing efficiency |
| `goalContributions` | Goals + assists |

Player detail UI also derives **trait bars** (Finishing, Creativity, Passing, Defending) from raw stats for a radar-style overview.

---

## Match Stats

### Base match shape

Each match includes competition, season, date/time, venue, referee, home/away team blocks, and aggregate `stats` (`goalDifference`, `totalGoals`, `result`).

Per-team base fields:

- `goals`, `shots`, `shotsOnTarget`, `shotAccuracy`
- `fouls`, `corners`, `yellowCards`, `redCards`

### Advanced stats (World Cup only)

| Field | Description |
|-------|-------------|
| `homeXG` / `awayXG` | Expected goals |
| `homePossession` / `awayPossession` | Possession % |
| `homePassAccuracy` / `awayPassAccuracy` | Pass accuracy % |
| `possessionDelta` / `xgDifference` | Derived deltas |

### Match insights

`lib/matchInsights.ts` builds short narratives from base stats only (e.g. “Clinical Away Win”), plus:

- **decidingFactor** — `efficiency` | `volume` | `discipline` | `balanced`
- **dominance** — 0–100 control score
- **dominantSide** — `home` | `away` | `null`
- Color-coded badge classes for cards

---

## Faces, Logos & Imagery

### Player photos (`PlayerPhoto`)

Pipeline:

1. Client requests `/api/player-photo?name=…`
2. Server checks runtime cache → `data/player_photos.json`
3. On miss: TheSportsDB `searchplayers.php` with name variants (suffix strip, accent removal)
4. Prefers `strCutout`, then `strThumb`
5. Fallback: dark SVG silhouette with green silhouette accents (`#1a1a2e` / green)

Client-side: in-memory cache, inflight dedupe, concurrency limit of **4**. Misses cache briefly (5 min) so retries can succeed; hits cache **24 hours** server-side.

Regenerate map:

```bash
node scripts/fetch_player_photos.js
```

### Team logos (`TeamLogo`)

1. Client loads `/api/team-logo-proxy?name=…`
2. Instant lookup from `data/team_logos.json` (all 130 teams)
3. Proxy streams image bytes (avoids CORS / hotlinking)
4. Fallback: dark rounded SVG with ball emoji

Regenerate map:

```bash
node scripts/fetch_team_logos.js
```

Name normalization (`TEAM_NAME_MAP` in `imageService.ts`) maps abbreviated dataset names (e.g. `Man United`, `Ath Madrid`, `M'gladbach`) to TheSportsDB-friendly names for photo fallbacks.

### Other assets

| Asset | Source |
|-------|--------|
| Country flags | `flagcdn.com` via `CountryFlag` |
| League logos | `public/logos/` (`premier-league.png`, etc.; some may still be placeholders) |
| Favicon / brand mark | `public/logos/favicon.ico` |

---

## Design Language

### Theme

Dark mode is the **default** (`<html class="dark">`). Tokens live in `app/globals.css` and are wired through Tailwind in `tailwind.config.ts`.

| Token | Role | Dark value (approx.) |
|-------|------|----------------------|
| `--background` | Page canvas | Near-black green hue `hsl(120 15% 5%)` |
| `--foreground` | Primary text | Near-white |
| `--card` | Surfaces | Slightly lifted green-tinted |
| `--primary` | Brand / accent | Field green `hsl(120 70% 45%)` ≈ `#1a7d4e` |
| `--muted` | Subdued UI | Soft green-gray |
| `--border` | Dividers | Low-contrast green border |
| `--chart-1…5` | Recharts series | Green-scale accents |
| `--radius` | Corners | `0.75rem` (dark) |

Theme color / viewport: `#1a7d4e`, `colorScheme: dark`.

Light theme tokens exist but the product experience is designed around the **football-field dark theme**.

### Typography

| Font | Use |
|------|-----|
| **Inter** | Global UI (`next/font/google` + CSS fallback) |
| **Space Mono** | `code` / monospace accents |

Nav labels often use **uppercase**, **bold**, wide tracking.

### Position colour system

Used consistently on player grids, badges, and detail pages:

| Position | Style |
|----------|--------|
| GK | Amber — `bg-amber-500/15` · `text-amber-400` |
| DF | Blue — `bg-blue-500/15` · `text-blue-400` |
| MF | Green — `bg-green-500/15` · `text-green-400` |
| FW | Red — `bg-red-500/15` · `text-red-400` |

### League accent colours (home / marketing)

| League | Gradient accent |
|--------|-----------------|
| Premier League | Purple |
| La Liga | Orange |
| Bundesliga | Red |
| Serie A | Blue |
| Ligue 1 | Cyan |

### UI patterns & utilities

Defined in `globals.css`:

- **`sports-card` / `sports-card-hover`** — rounded-2xl cards, soft border, blur, green hover glow
- **`stat-badge`** — primary-tinted pill for metrics
- **`score-large`** — oversized primary score typography
- **Status pills** — scheduled (blue) / finished (green)
- **Motion** — `animate-slide-up`, `animate-slide-in`, `animate-pulse-subtle`
- Sticky header with backdrop blur
- Large scoreboards, medal styling on leaderboards, form streaks (W/D/L)

### Editorial / marketing layers

Not pure dataset UI — curated presentation content:

- **Stars of the ERA** — career highlight cards (Messi, Ronaldo, Neymar, Lewandowski, Suárez, Iniesta, …) with gradients and signature stats
- **Iconic matches** — hand-picked rivalry / historic fixtures featured on the dashboard (WC Final, El Clásico, Der Klassiker, etc.)

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard — KPIs, goals-by-competition, iconic matches, stars |
| `/matches` | All matches with search, competition & result filters |
| `/matches/:id` | Score, lineups, xG comparison (when available), advanced stats |
| `/players` | Grid + spotlight rankings (Golden Boot, Playmaker, Threat Level) |
| `/players/:id` | Overview & Full Stats tabs, attribute bars, per-90 metrics |
| `/teams` | Teams grouped by league with search |
| `/teams/:id` | Form streak, league position, squad, attacking/defensive stats |
| `/standings` | World Cup group standings |
| `/worldcup` | World Cup hub — groups + interactive knockout bracket |
| `/accolades` | Season awards and per-league records |
| `/leagues/:slug` | Full table, recent results, top scorers/assists |

Supported league slugs: `premier-league`, `la-liga`, `bundesliga`, `serie-a`, `ligue-1`.

### Navigation

Header links: Home · World Cup 2022 · Leagues (dropdown) · Teams · Players · Accolades.

---

## Key Components

| Component | Role |
|-----------|------|
| `Header` | Global nav + leagues dropdown + mobile menu |
| `TeamLogo` | Badge via logo proxy + SVG fallback |
| `PlayerPhoto` | Headshot via photo API + silhouette fallback |
| `CountryFlag` | Flag from flagcdn |
| `MatchCard` | Result card with insight narrative |
| `KnockoutBracket` | World Cup bracket visualisation |
| `StatBar` | Animated horizontal stat bar |
| `LeagueLogo` | Competition mark from `public/logos/` |
| `*PageClient` | Heavy interactive pages (Teams, Team detail, League, World Cup) |
| `LoadingSpinner` / `ErrorState` | Async UI states |
| `components/ui/*` | shadcn primitives (Card, Tabs, Badge, Table, Select, …) |

---

## API Surface (GET only)

No authentication. Base: relative `/api` (override with `NEXT_PUBLIC_API_BASE`).

| Endpoint | Purpose |
|----------|---------|
| `/api/summary` | Dashboard KPIs |
| `/api/matches` · `/api/matches/[id]` | Match list + detail |
| `/api/players` · `/api/players/[id]` | Player list + detail |
| `/api/standings` | World Cup groups |
| `/api/accolades` | Awards computation |
| `/api/league-table` | League table builder |
| `/api/team-logo` · `/api/team-logo-proxy` | Logo URL / image proxy |
| `/api/league-logo` | League logo helper |
| `/api/player-photo` | Player photo lookup |

Full request/response shapes: [API.md](./API.md).

---

## Scripts

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint

# Data maintenance (manual)
node scripts/enrich_players.js      # Enrich players from source CSVs
node scripts/fetch_team_logos.js    # Refresh team badge URL map
node scripts/fetch_player_photos.js # Refresh player photo URL map
```

---

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE` | No | `""` (relative) | API base URL override |

---

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — technical design & data flow
- [API.md](./API.md) — endpoint reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) — workflow & standards
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment

---

## License

MIT (demonstration and portfolio use).
