# API Reference

All endpoints are **GET-only** and return JSON. No authentication is required.

Base URL: `http://localhost:3000/api` (dev) or whatever `NEXT_PUBLIC_API_BASE` is set to.

---

## Summary

### `GET /api/summary`

Dashboard KPI data.

**Response:**

```json
{
  "totalMatches": 1890,
  "totalTeams": 130,
  "totalPlayers": 680,
  "competitions": ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "FIFA World Cup"],
  "avgGoalsPerMatch": 2.73
}
```

---

## Matches

### `GET /api/matches`

Returns all matches with resolved team names.

**Response:** `Match[]`

```json
[
  {
    "id": 1,
    "competition": "Premier League",
    "homeTeam": "Arsenal",
    "awayTeam": "Crystal Palace",
    "homeTeamId": 1,
    "awayTeamId": 2,
    "homeGoals": 2,
    "awayGoals": 0,
    "date": "2022-08-05",
    "round": "1"
  }
]
```

### `GET /api/matches/:id`

Returns a single match with advanced stats (when available).

**Response:** `MatchDetail`

```json
{
  "id": 1,
  "competition": "Premier League",
  "homeTeam": "Arsenal",
  "awayTeam": "Crystal Palace",
  "homeGoals": 2,
  "awayGoals": 0,
  "date": "2022-08-05",
  "round": "1",
  "homeXG": 1.84,
  "awayXG": 0.67,
  "homePossession": 58,
  "awayPossession": 42,
  "homePassAccuracy": 87,
  "awayPassAccuracy": 74,
  "homeShots": 15,
  "awayShots": 8,
  "homeShotsOnTarget": 6,
  "awayShotsOnTarget": 2,
  "homeFouls": 11,
  "awayFouls": 14,
  "homeCorners": 7,
  "awayCorners": 3,
  "homeYellowCards": 1,
  "awayYellowCards": 3,
  "homeRedCards": 0,
  "awayRedCards": 0
}
```

**Errors:**

| Status | Body |
|--------|------|
| 404 | `{ "error": "Match not found" }` |

---

## Players

### `GET /api/players`

Returns all players with stats.

**Response:** `Player[]`

```json
[
  {
    "id": 378,
    "name": "Kylian Mbappé",
    "team": "France",
    "position": "FW",
    "competition": "FIFA World Cup",
    "appearances": 7,
    "goals": 8,
    "assists": 2,
    "minutesPlayed": 596,
    "xG": 5.2,
    "xA": 1.8,
    "shotsTotal": 28,
    "shotsOnTarget": 14,
    "passesCompleted": 142,
    "passesAttempted": 178,
    "tackles": 3,
    "interceptions": 1,
    "yellowCards": 1,
    "redCards": 0,
    "gamesStarted": 7,
    "goalContributions": 10,
    "goalsPerMatch": 1.14,
    "assistsPerMatch": 0.29,
    "xGPerMatch": 0.74,
    "minutesPerGoal": 74.5,
    "goalsPer90": 1.21,
    "assistsPer90": 0.30,
    "xGPer90": 0.79,
    "xAPer90": 0.27,
    "shotsPer90": 4.23,
    "tacklesPer90": 0.45,
    "interceptionsPer90": 0.15,
    "passCompletionRate": 79.8
  }
]
```

### `GET /api/players/:id`

Returns a single player by numeric ID.

**Response:** `Player` (same shape as above)

**Errors:**

| Status | Body |
|--------|------|
| 404 | `{ "error": "Player not found" }` |

---

## Standings

### `GET /api/standings`

Returns World Cup group standings.

**Response:** `TeamStanding[]`

```json
[
  {
    "group": "A",
    "team": "Netherlands",
    "played": 3,
    "won": 2,
    "drawn": 1,
    "lost": 0,
    "goalsFor": 5,
    "goalsAgainst": 1,
    "goalDifference": 4,
    "points": 7
  }
]
```

---

## League Table

### `GET /api/league-table`

Computes league standings from match results for the 5 European leagues.

**Response:** `Record<string, LeagueTableRow[]>`

```json
{
  "Premier League": [
    {
      "position": 1,
      "teamId": 12,
      "teamName": "Man City",
      "played": 38,
      "won": 28,
      "drawn": 5,
      "lost": 5,
      "goalsFor": 94,
      "goalsAgainst": 33,
      "goalDifference": 61,
      "points": 89,
      "form": ["W", "W", "D", "W", "W"]
    }
  ],
  "La Liga": [],
  "Bundesliga": [],
  "Serie A": [],
  "Ligue 1": []
}
```

---

## Accolades

### `GET /api/accolades`

Computes season awards across all competitions.

**Response:** `AccoladesData`

```json
{
  "playerAwards": {
    "topScorers": [{ "id": 378, "name": "Kylian Mbappé", "value": 8 }],
    "topAssists": [],
    "topXG": [],
    "topXA": [],
    "topPassers": [],
    "topDefenders": [],
    "mostMinutes": []
  },
  "leagueAwards": {
    "Premier League": {
      "topScoring": { "team": "Man City", "value": 94 },
      "bestDefense": { "team": "Newcastle", "value": 33 },
      "mostWins": { "team": "Man City", "value": 28 },
      "highestScoringMatch": {},
      "biggestWin": {}
    }
  }
}
```

This endpoint is **force-static** — computed once at build time.

---

## Images

### `GET /api/team-logo?name=:teamName`

Returns a JSON object with the team's logo URL.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Team name (e.g., `Arsenal`, `Man City`) |

**Response:**

```json
{
  "name": "Arsenal",
  "logo": "https://www.thesportsdb.com/images/media/team/badge/…"
}
```

**Cache:** 24-hour `Cache-Control` header.

### `GET /api/team-logo-proxy?name=:teamName`

Proxies the actual badge image bytes (avoids CORS issues). Returns `image/*` content type.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Team name |

**Response:** Image binary data with `Cache-Control: public, max-age=2592000` (30 days).

**Fallback:** Returns an inline SVG placeholder if the logo cannot be fetched.

### `GET /api/player-photo?name=:playerName`

Returns a JSON object with the player's photo URL from TheSportsDB.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Player name (e.g., `Kylian Mbappé`) |

**Response:**

```json
{
  "name": "Kylian Mbappé",
  "photo": "https://www.thesportsdb.com/images/media/player/thumb/…"
}
```

**Cache:** 24-hour in-memory cache + `Cache-Control` header.

---

## Error Handling

All endpoints return standard HTTP error responses:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 404 | Resource not found |
| 500 | Internal server error |

Error responses follow the shape:

```json
{
  "error": "Descriptive error message"
}
```
