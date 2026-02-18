# Deployment

How to deploy Foot-Insights to production.

---

## Vercel (Recommended)

The project is a standard Next.js app and deploys to Vercel with zero configuration.

### One-Click Deploy

1. Push the repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repository
4. Vercel auto-detects Next.js — no build settings needed
5. Click **Deploy**

### Environment Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_BASE` | Leave empty (Vercel handles relative URLs) | No |

### Build Settings

Vercel will use these defaults (no overrides needed):

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `pnpm install` |

> **Note:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `images.unoptimized: true`, so the build will succeed even with type warnings and will serve images without Next.js optimisation.

---

## Self-Hosted (Node.js)

### Build

```bash
pnpm install
pnpm build
```

### Run

```bash
pnpm start
```

The server starts on port 3000 by default. Override with the `PORT` environment variable:

```bash
PORT=8080 pnpm start
```

### Process Manager (PM2)

```bash
npm install -g pm2

pnpm build
pm2 start node -- node_modules/.bin/next start -p 3000
pm2 save
pm2 startup
```

---

## Docker

### Dockerfile

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Important:** The `data/` directory must be copied into the container since the app reads JSON files at runtime.

### Build & Run

```bash
docker build -t foot-insights .
docker run -p 3000:3000 foot-insights
```

---

## Static Export (Not Supported)

The app uses API routes (`app/api/`) and dynamic server-side data loading, so `next export` / `output: 'export'` is **not supported**. A Node.js runtime is required.

---

## Data Considerations

- The `data/` folder contains ~15 MB of JSON files. These are read at runtime by API routes.
- Team logos are proxied from TheSportsDB through `/api/team-logo-proxy` — no external API keys are needed, but TheSportsDB rate limits may apply under heavy traffic.
- Player photos are fetched live from TheSportsDB with 24-hour in-memory caching. In a multi-instance deployment (e.g., Vercel serverless), each instance maintains its own cache.

---

## Health Check

After deployment, verify these endpoints return 200:

```bash
curl https://your-domain.com/api/summary
curl https://your-domain.com/api/matches
curl https://your-domain.com/api/players
```

And confirm key pages render:

- `/` — Dashboard
- `/matches` — Match listing
- `/players` — Player grid
- `/worldcup` — World Cup hub
- `/leagues/premier-league` — League page
