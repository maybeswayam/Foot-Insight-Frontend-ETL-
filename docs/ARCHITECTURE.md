# Architecture

Technical architecture of the Foot-Insights football analytics dashboard.

---

## High-Level Overview

```
┌──────────────────────────────────────────────────┐
│                   Browser                        │
│                                                  │
│  Next.js Client Components                       │
│  (React 19 + Tailwind + shadcn/ui)               │
│         │                                        │
│         ▼                                        │
│  lib/api.ts  ──  apiClient.getMatches()          │
│         │         apiClient.getPlayers()  …      │
│         ▼                                        │
│  fetch("/api/…")                                 │
└──────────┬───────────────────────────────────────┘
           │  HTTP GET
           ▼
┌──────────────────────────────────────────────────┐
│               Next.js Server                     │
│                                                  │
│  app/api/*/route.ts                              │
│         │                                        │
│         ▼                                        │
│  lib/dataLoader.ts  ─── reads data/*.json        │
│  lib/leagueTable.ts ─── computes standings       │
│  lib/matchInsights.ts ─ generates narratives     │
│  lib/imageService.ts ── logo/photo lookups       │
│         │                                        │
│         ▼                                        │
│  data/matches.json   (1 890 matches)             │
│  data/players.json   (680 players)               │
│  data/teams.json     (130 teams)                 │
│  data/standings.json                             │
│  data/match_advanced.json                        │
│  data/team_logos.json                            │
└──────────────────────────────────────────────────┘
```

---

## Data Flow

### Request Lifecycle

1. **Client component** mounts → calls `apiClient.getMatches()` (or similar)
2. `apiClient` calls `fetch("/api/matches")` using `NEXT_PUBLIC_API_BASE` (defaults to relative)
3. **API route** (`app/api/matches/route.ts`) calls `dataLoader.loadMatches()`
4. `dataLoader` reads `data/matches.json`, caches it in-memory, and returns raw data
5. The route handler maps raw data to typed interfaces (`Match[]`) and returns JSON
6. Client component renders the data with React

### Data Loading & Caching

`lib/dataLoader.ts` implements a simple in-memory module-level cache:

```typescript
let cachedMatches: RawMatch[] | null = null;

export async function loadMatches(): Promise<RawMatch[]> {
  if (!cachedMatches) {
    const raw = await fs.readFile("data/matches.json", "utf-8");
    cachedMatches = JSON.parse(raw);
  }
  return cachedMatches;
}
```

Each dataset (matches, players, teams, standings, advanced stats) follows this pattern. The cache lives for the lifetime of the server process — no TTL, no invalidation. This is by design since the dataset is a static 2022 season archive.

### Image Pipeline

```
TeamLogo component
    │
    ├─ src="/api/team-logo-proxy?name=…"
    │       │
    │       ▼
    │  team-logo-proxy route.ts
    │       │
    │       ├─ imageService.fetchTeamLogoByName(name)
    │       │   └─ instant lookup from data/team_logos.json (pre-fetched)
    │       │
    │       └─ fetch(logoUrl)  ──► TheSportsDB CDN
    │           return image bytes (30-day cache header)
    │
PlayerPhoto component
    │
    ├─ fetches /api/player-photo?name=…
    │       │
    │       ▼
    │  player-photo route.ts
    │       └─ imageService.fetchPlayerPhotoByName(name)
    │           └─ live TheSportsDB API call (24h in-memory cache, 5s timeout)
    │
CountryFlag component
    └─ <img src="https://flagcdn.com/…"> (direct, no proxy)
```

Team logos use a **two-step proxy**: the client requests an image from the Next.js server, which fetches from TheSportsDB CDN and streams it back. This avoids CORS issues and hotlink restrictions.

---

## Component Architecture

### Page → Client Component Pattern

Most pages follow this pattern:

```
app/[route]/page.tsx         (server component or 'use client')
    └─ fetches data via apiClient
    └─ renders a *PageClient component (if complex)

components/*PageClient.tsx   (heavy client component)
    └─ manages local state (tabs, filters, search)
    └─ renders shadcn/ui primitives
```

**Page client components:**

| Component | Page | Responsibility |
|-----------|------|----------------|
| `TeamsPageClient` | `/teams` | League-grouped team cards, search |
| `TeamDetailClient` | `/teams/:id` | Form, squad, stats tabs |
| `LeaguePageClient` | `/leagues/:slug` | League table, results, top performers |
| `WorldCupPageClient` | `/worldcup` | Group tables + knockout bracket |

Simpler pages (`/matches`, `/players`, `/standings`, `/accolades`) keep their logic inline within `page.tsx`.

### Shared Components

| Component | Props | Description |
|-----------|-------|-------------|
| `Header` | — | Global navigation bar with competition links, leagues dropdown |
| `TeamLogo` | `teamName`, `size?` | Team badge image with SVG fallback |
| `PlayerPhoto` | `playerName`, `size?` | Player headshot via TheSportsDB |
| `CountryFlag` | `country`, `size?` | Country flag image from flagcdn |
| `MatchCard` | `match` | Compact match result card with insight label |
| `KnockoutBracket` | `matches` | SVG-based World Cup bracket |
| `StatBar` | `label`, `value`, `max`, `color?` | Animated horizontal stat bar |
| `LoadingSpinner` | — | Centered loading indicator |
| `ErrorState` | `message?`, `onRetry?` | Error display with retry button |

### UI Foundation

The project uses **48 shadcn/ui components** in `components/ui/`. These are installed (not imported from a package) and can be customised directly. Key components used:

- `Card`, `Tabs`, `Badge`, `Button`, `Table` — primary layout
- `Select`, `Input` — form controls / filters
- `Separator`, `ScrollArea` — layout utilities
- `Skeleton` — loading states

---

## Design System

### Theme

Dark mode is the default (`<html class="dark">`). The colour system uses CSS custom properties defined in `app/globals.css` and consumed by Tailwind via `tailwind.config.ts`:

```
--background    → Page background
--foreground    → Default text
--card          → Card surfaces
--primary       → Accent / brand (green #1a7d4e)
--muted         → Subdued elements
--border        → Borders & dividers
--chart-1…5    → Recharts series colours
```

### Position Colour System

Player positions are colour-coded throughout the app:

| Position | Colour | Tailwind Class |
|----------|--------|---------------|
| GK | Amber | `bg-amber-500/20 text-amber-400` |
| DF | Blue | `bg-blue-500/20 text-blue-400` |
| MF | Green | `bg-green-500/20 text-green-400` |
| FW | Red | `bg-red-500/20 text-red-400` |

### Fonts

**Inter** (Google Fonts) — used globally via `next/font/google`.

---

## Type System

Core interfaces are defined in `lib/types.ts`:

| Interface | Key Fields |
|-----------|-----------|
| `Player` | id, name, team, position, goals, assists, xG, xA, appearances, minutesPlayed, per90 stats |
| `Match` | id, competition, homeTeam, awayTeam, homeGoals, awayGoals, date, round |
| `MatchDetail` | extends Match + xG, possession, passAccuracy, shots, fouls |
| `Team` | id, name, competition, stats (W/D/L/GF/GA), squad |
| `TeamStanding` | group, team, played, won, drawn, lost, GF, GA, GD, points |
| `LeagueTableRow` | position, teamId, played, won, drawn, lost, GF, GA, GD, points, form |
| `SummaryData` | totalMatches, totalTeams, totalPlayers, competitions, avgGoals |
| `AccoladesData` | playerAwards, leagueAwards |

---

## Key Design Decisions

1. **Static JSON over a database** — The dataset is a fixed 2022-season archive. JSON files are fast, zero-dependency, and deploy anywhere without a database.

2. **Image proxy routes** — Team logos and player photos are proxied through Next.js API routes to avoid CORS restrictions from TheSportsDB and to enable aggressive caching headers.

3. **In-memory caching** — `dataLoader.ts` caches parsed JSON in module-level variables. No TTL needed since data doesn't change.

4. **Client-side fetching** — Pages use `useEffect` + `apiClient` rather than React Server Components for data fetching. This keeps the architecture simple and consistent.

5. **Competition name divergence** — `teams.json` uses `"World Cup"` while `matches.json` uses `"FIFA World Cup"`. Routing logic uses `leagueSlug` matching rather than competition name comparison to handle this.

6. **shadcn/ui installed, not imported** — UI components live in `components/ui/` as source files, giving full customisation control.
