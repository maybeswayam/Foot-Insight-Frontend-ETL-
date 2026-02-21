# Contributing

Guidelines for developing and contributing to Foot-Insights.

---

## Prerequisites

- **Node.js** 18+
- **pnpm** 10+ — install via `npm install -g pnpm` or see [pnpm.io](https://pnpm.io/installation)

---

## Setup

```bash
git clone https://github.com/your-username/foot-insights.git
cd foot-insights
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:3000` with Turbopack.

---

## Project Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `app/{route}/page.tsx` | `app/players/page.tsx` |
| API routes | `app/api/{route}/route.ts` | `app/api/matches/route.ts` |
| Client components | PascalCase `.tsx` | `TeamDetailClient.tsx` |
| Utility modules | camelCase `.ts` | `dataLoader.ts` |
| Hooks | `use-{name}.ts(x)` | `use-mobile.tsx` |
| shadcn/ui components | kebab-case `.tsx` in `components/ui/` | `dropdown-menu.tsx` |

### Component Patterns

**Page client components** — for pages with heavy interactivity (tabs, filters, local state), the page file delegates to a `*PageClient.tsx` component:

```
app/teams/page.tsx            → renders <TeamsPageClient />
components/TeamsPageClient.tsx → owns all client-side state
```

**Simple pages** — pages with straightforward rendering keep their logic in `page.tsx` directly (`/players`, `/matches`, `/accolades`).

**Data fetching** — always use `apiClient` from `lib/api.ts` on the client side. Never import `dataLoader.ts` into client components (it uses `fs`).

### Styling

- Use **Tailwind CSS** utility classes for all styling
- Use **shadcn/ui** components (`components/ui/`) as the foundation
- Reference design tokens via CSS variables: `bg-background`, `text-foreground`, `border-border`, etc.
- Position colours follow the standard mapping:

  ```
  GK → amber    DF → blue    MF → green    FW → red
  ```

### TypeScript

- All components and functions must be typed
- Shared interfaces live in `lib/types.ts` — add new types there
- `tsconfig.json` uses strict mode
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — build won't fail on type errors, but strive for zero errors locally

### Imports

- Use the `@/` path alias for all imports:
  ```typescript
  import { apiClient } from "@/lib/api";
  import { Card } from "@/components/ui/card";
  ```
- Group imports: React/Next → third-party → components → lib → types

---

## Adding a New Page

1. Create `app/{route}/page.tsx`
2. If the page needs complex client state, create `components/{Route}PageClient.tsx` with `'use client'`
3. Fetch data via `apiClient` methods — add new methods to `lib/api.ts` if needed
4. Add the route to the `Header` component navigation if it should appear in the nav bar

## Adding a New API Route

1. Create `app/api/{route}/route.ts`
2. Export an async `GET` function
3. Load data from `lib/dataLoader.ts` — add a new loader if new JSON data is required
4. Map raw data to typed interfaces
5. Return `NextResponse.json(data)`
6. Document the endpoint in `docs/API.md`

## Adding a shadcn/ui Component

```bash
pnpm dlx shadcn@latest add <component-name>
```

This installs the component source into `components/ui/`. The `components.json` file at the project root configures the shadcn CLI.

---

## Data Updates

The JSON datasets in `data/` are static and represent the 2022 season. To update them:

1. **Matches/teams** — update the source CSVs and re-run the ETL pipeline
2. **Player enrichment** — run `node scripts/enrich_players.js` (reads from source CSVs)
3. **Team logos** — run `node scripts/fetch_team_logos.js` (calls TheSportsDB API; rate-limited to 1 request per 2 seconds)

---

## Commit Messages

Use conventional commits:

```
feat: add league comparison chart
fix: correct World Cup routing in team detail
refactor: extract spotlight section from players page
docs: update API reference for accolades endpoint
style: align player card badges consistently
```

---

## Code Quality

```bash
pnpm lint          # ESLint
pnpm build         # Full production build (catches runtime errors)
```

Before pushing, ensure:

1. `pnpm lint` passes
2. `pnpm build` completes without runtime errors
3. All pages load correctly in the browser
4. No console errors in the browser dev tools
