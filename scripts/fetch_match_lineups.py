"""
Fetch match lineups league-by-league and merge into data/match_lineups.json.

Sources:
  - Big 5 leagues 2022/23 → FBref via soccerdata (Selenium; rate-limited, resumable)
  - FIFA World Cup 2022 → StatsBomb open data (fast JSON)

Usage:
  python scripts/fetch_match_lineups.py --competition world-cup
  python scripts/fetch_match_lineups.py --competition premier-league
  python scripts/fetch_match_lineups.py --competition la-liga
  python scripts/fetch_match_lineups.py --competition bundesliga
  python scripts/fetch_match_lineups.py --competition serie-a
  python scripts/fetch_match_lineups.py --competition ligue-1
  python scripts/fetch_match_lineups.py --competition all
"""

from __future__ import annotations

import argparse
import json
import re
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATCHES_PATH = ROOT / "data" / "matches.json"
TEAMS_PATH = ROOT / "data" / "teams.json"
OUTPUT_PATH = ROOT / "data" / "match_lineups.json"
PROGRESS_DIR = ROOT / "data" / "_lineup_progress"

COMPETITION_CONFIG = {
    "premier-league": {
        "ours": "Premier League",
        "fbref": "ENG-Premier League",
        "season": "22-23",
        "source": "fbref",
    },
    "la-liga": {
        "ours": "La Liga",
        "fbref": "ESP-La Liga",
        "season": "22-23",
        "source": "fbref",
    },
    "bundesliga": {
        "ours": "Bundesliga",
        "fbref": "GER-Bundesliga",
        "season": "23-24",  # matches.json Bundesliga dates are 2023-08 → 2024-05
        "source": "fbref",
    },
    "serie-a": {
        "ours": "Serie A",
        "fbref": "ITA-Serie A",
        "season": "22-23",
        "source": "fbref",
    },
    "ligue-1": {
        "ours": "Ligue 1",
        "fbref": "FRA-Ligue 1",
        "season": "22-23",
        "source": "fbref",
    },
    "world-cup": {
        "ours": "FIFA World Cup",
        "source": "statsbomb",
        "competition_id": 43,
        "season_id": 106,
    },
}

# External name → our teams.json name
TEAM_ALIASES = {
    # Clubs
    "Manchester City": "Man City",
    "Manchester United": "Man United",
    "Manchester Utd": "Man United",
    "Newcastle United": "Newcastle",
    "Nottingham Forest": "Nott'm Forest",
    "Nott'm Forest": "Nott'm Forest",
    "Nottingham": "Nott'm Forest",
    "Wolverhampton Wanderers": "Wolves",
    "Tottenham Hotspur": "Tottenham",
    "West Ham United": "West Ham",
    "Brighton & Hove Albion": "Brighton",
    "Brighton and Hove Albion": "Brighton",
    "Leicester City": "Leicester",
    "Leeds United": "Leeds",
    "Atlético Madrid": "Ath Madrid",
    "Atletico Madrid": "Ath Madrid",
    "Athletic Club": "Ath Bilbao",
    "Athletic Bilbao": "Ath Bilbao",
    "Real Betis": "Betis",
    "Real Sociedad": "Sociedad",
    "Celta Vigo": "Celta",
    "Rayo Vallecano": "Vallecano",
    "Espanyol": "Espanol",
    "Real Valladolid": "Valladolid",
    "Inter Milan": "Inter",
    "Internazionale": "Inter",
    "AC Milan": "Milan",
    "Hellas Verona": "Verona",
    "Bayer Leverkusen": "Leverkusen",
    "Borussia Dortmund": "Dortmund",
    "Borussia Mönchengladbach": "M'gladbach",
    "Monchengladbach": "M'gladbach",
    "Eintracht Frankfurt": "Ein Frankfurt",
    "Frankfurt": "Ein Frankfurt",
    "Borussia Mönchengladbach": "M'gladbach",
    "Monchengladbach": "M'gladbach",
    "Gladbach": "M'gladbach",
    "FC Köln": "FC Koln",
    "Köln": "FC Koln",
    "Koln": "FC Koln",
    "Cologne": "FC Koln",
    "1. FC Köln": "FC Koln",
    "1. FC Koln": "FC Koln",
    "Mainz 05": "Mainz",
    "VfB Stuttgart": "Stuttgart",
    "VfL Wolfsburg": "Wolfsburg",
    "VfL Bochum": "Bochum",
    "Heidenheim": "Heidenheim",
    "1. FC Heidenheim": "Heidenheim",
    "Darmstadt 98": "Darmstadt",
    "Darmstadt": "Darmstadt",
    "RB Leipzig": "RB Leipzig",
    "Paris Saint-Germain": "Paris SG",
    "Paris Saint Germain": "Paris SG",
    "PSG": "Paris SG",
    "Clermont Foot": "Clermont",
    # Nations (StatsBomb / misc)
    "Iran": "IR Iran",
    "South Korea": "Korea Republic",
    "Korea Republic": "Korea Republic",
    "United States": "United States",
    "USA": "United States",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def strip_accents(value: str) -> str:
    return "".join(
        c
        for c in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(c)
    )


def normalize_name(value: str) -> str:
    value = TEAM_ALIASES.get(value, value)
    value = strip_accents(value).lower()
    value = value.replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    value = re.sub(r"\b(fc|cf|afc)\b", "", value).strip()
    value = re.sub(r"\s+", " ", value)
    return value


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def build_team_lookups(teams: list[dict]):
    by_id = {int(t["teamId"]): t["name"] for t in teams}
    by_norm = {normalize_name(t["name"]): t["name"] for t in teams}
    for alias, ours in TEAM_ALIASES.items():
        if ours in by_id.values() or ours in {t["name"] for t in teams}:
            by_norm[normalize_name(alias)] = ours
    return by_id, by_norm


def resolve_team(name: str, by_norm: dict[str, str]) -> str | None:
    return by_norm.get(normalize_name(name))


def our_matches_index(matches: list[dict], teams_by_id: dict[int, str], competition: str):
    """date|home|away → local matchId"""
    index = {}
    for m in matches:
        if m["competition"] != competition:
            continue
        home = teams_by_id.get(int(m["homeTeam"]["teamId"]))
        away = teams_by_id.get(int(m["awayTeam"]["teamId"]))
        if not home or not away:
            continue
        key = f"{m['date']}|{normalize_name(home)}|{normalize_name(away)}"
        index[key] = int(m["matchId"])
    return index


def player_from_fbref_row(row: dict) -> dict:
    return {
        "name": str(row.get("player") or ""),
        "jerseyNumber": None
        if row.get("jersey_number") in (None, "")
        else int(float(row["jersey_number"]))
        if str(row.get("jersey_number")).replace(".", "", 1).isdigit()
        else None,
        "position": str(row.get("position") or "") or None,
        "isStarter": bool(row.get("is_starter")),
        "minutesPlayed": None
        if row.get("minutes_played") in (None, "")
        else int(float(row["minutes_played"]))
        if str(row.get("minutes_played")).replace(".", "", 1).isdigit()
        else None,
    }


def fetch_fbref_competition(slug: str, cfg: dict, matches: list[dict], teams: list[dict]):
    import soccerdata as sd
    import pandas as pd

    teams_by_id, by_norm = build_team_lookups(teams)
    local_index = our_matches_index(matches, teams_by_id, cfg["ours"])
    progress_path = PROGRESS_DIR / f"{slug}.json"
    progress = load_json(progress_path, {"games": {}})

    print(f"\n=== FBref {cfg['ours']} ({cfg['fbref']} {cfg['season']}) ===")
    fbref = sd.FBref(leagues=cfg["fbref"], seasons=cfg["season"])
    schedule = fbref.read_schedule().reset_index()
    print(f"Schedule rows: {len(schedule)}")

    linked = 0
    failed = []

    for i, row in schedule.iterrows():
        game_id = str(row.get("game_id") or "")
        if not game_id or game_id == "nan":
            # fallback from match_report URL
            report = str(row.get("match_report") or "")
            m = re.search(r"/matches/([a-f0-9]+)/", report)
            game_id = m.group(1) if m else ""
        if not game_id:
            continue

        date = str(row["date"])[:10]
        home_raw = str(row["home_team"])
        away_raw = str(row["away_team"])
        home = resolve_team(home_raw, by_norm)
        away = resolve_team(away_raw, by_norm)
        local_id = None
        if home and away:
            local_id = local_index.get(
                f"{date}|{normalize_name(home)}|{normalize_name(away)}"
            )

        cached = progress["games"].get(game_id)
        if cached and cached.get("players"):
            if local_id is not None:
                cached["matchId"] = local_id
                linked += 1
            progress["games"][game_id] = cached
            continue

        print(
            f"[{i+1}/{len(schedule)}] {date} {home_raw} vs {away_raw} ({game_id})".encode(
                "ascii", "replace"
            ).decode("ascii"),
            flush=True,
        )
        try:
            lineup_df = fbref.read_lineup(match_id=game_id).reset_index()
            players = []
            for _, prow in lineup_df.iterrows():
                team_raw = str(prow.get("team") or "")
                team_resolved = resolve_team(team_raw, by_norm) or team_raw
                side = (
                    "home"
                    if normalize_name(team_raw) == normalize_name(home_raw)
                    else "away"
                    if normalize_name(team_raw) == normalize_name(away_raw)
                    else None
                )
                p = player_from_fbref_row(prow.to_dict())
                p["team"] = team_resolved
                p["side"] = side
                players.append(p)

            starters = sum(1 for p in players if p["isStarter"])
            record = {
                "matchId": local_id,
                "externalMatchId": game_id,
                "source": "FBref",
                "competition": cfg["ours"],
                "season": "2022/23",
                "date": date,
                "homeTeam": home or home_raw,
                "awayTeam": away or away_raw,
                "homeTeamRaw": home_raw,
                "awayTeamRaw": away_raw,
                "playerCount": len(players),
                "starterCount": starters,
                "players": players,
                "fetchedAt": now_iso(),
            }
            progress["games"][game_id] = record
            if local_id is not None:
                linked += 1
            save_json(progress_path, progress)
            time.sleep(4.0)
        except Exception as exc:
            failed.append({"gameId": game_id, "error": str(exc)})
            print(
                f"  FAILED: {str(exc).encode('ascii', 'replace').decode('ascii')}",
                flush=True,
            )
            # Cool down harder on CAPTCHA / IP blocks before continuing
            time.sleep(20 if "CAPTCHA" in str(exc) or "timeout" in str(exc).lower() else 5)

    save_json(progress_path, progress)
    print(
        f"Done {cfg['ours']}: games={len(progress['games'])} linked={linked} failed={len(failed)}"
    )
    return progress, failed


def is_starter_from_positions(positions) -> bool:
    if not isinstance(positions, list):
        return False
    for pos in positions:
        if not isinstance(pos, dict):
            continue
        if pos.get("start_reason") == "Starting XI":
            return True
        if str(pos.get("from") or "") in ("00:00", "0:00", "00:00:00"):
            return True
    return False


def first_position(positions) -> str | None:
    if not isinstance(positions, list) or not positions:
        return None
    pos = positions[0]
    if isinstance(pos, dict):
        return pos.get("position")
    return None


def fetch_world_cup(matches: list[dict], teams: list[dict]):
    from statsbombpy import sb

    cfg = COMPETITION_CONFIG["world-cup"]
    teams_by_id, by_norm = build_team_lookups(teams)
    local_index = our_matches_index(matches, teams_by_id, cfg["ours"])
    progress_path = PROGRESS_DIR / "world-cup.json"
    progress = {"games": {}}

    print("\n=== StatsBomb FIFA World Cup 2022 ===")
    sb_matches = sb.matches(
        competition_id=cfg["competition_id"], season_id=cfg["season_id"]
    )
    print(f"StatsBomb matches: {len(sb_matches)}")

    linked = 0
    failed = []

    for _, row in sb_matches.iterrows():
        mid = int(row["match_id"])
        date = str(row["match_date"])[:10]
        home_raw = str(row["home_team"])
        away_raw = str(row["away_team"])
        home = resolve_team(home_raw, by_norm)
        away = resolve_team(away_raw, by_norm)
        local_id = None
        if home and away:
            local_id = local_index.get(
                f"{date}|{normalize_name(home)}|{normalize_name(away)}"
            )

        try:
            lineups = sb.lineups(match_id=mid)
            players = []
            for team_name, df in lineups.items():
                team_resolved = resolve_team(team_name, by_norm) or team_name
                side = (
                    "home"
                    if normalize_name(team_name) == normalize_name(home_raw)
                    else "away"
                    if normalize_name(team_name) == normalize_name(away_raw)
                    else None
                )
                for _, prow in df.iterrows():
                    positions = prow.get("positions")
                    if hasattr(positions, "tolist"):
                        positions = positions.tolist()
                    players.append(
                        {
                            "name": str(prow.get("player_name") or ""),
                            "nickname": prow.get("player_nickname")
                            if pd_notna(prow.get("player_nickname"))
                            else None,
                            "jerseyNumber": int(prow["jersey_number"])
                            if pd_notna(prow.get("jersey_number"))
                            else None,
                            "position": first_position(positions),
                            "isStarter": is_starter_from_positions(positions),
                            "minutesPlayed": None,
                            "team": team_resolved,
                            "side": side,
                            "statsbombPlayerId": int(prow["player_id"])
                            if pd_notna(prow.get("player_id"))
                            else None,
                        }
                    )

            starters = sum(1 for p in players if p["isStarter"])
            record = {
                "matchId": local_id,
                "externalMatchId": str(mid),
                "source": "StatsBomb",
                "competition": cfg["ours"],
                "season": "2022",
                "date": date,
                "homeTeam": home or home_raw,
                "awayTeam": away or away_raw,
                "homeTeamRaw": home_raw,
                "awayTeamRaw": away_raw,
                "playerCount": len(players),
                "starterCount": starters,
                "players": players,
                "fetchedAt": now_iso(),
            }
            progress["games"][str(mid)] = record
            if local_id is not None:
                linked += 1
            msg = (
                f"[{len(progress['games'])}/{len(sb_matches)}] {date} "
                f"{home_raw} vs {away_raw} -> local={local_id} starters={starters}"
            )
            print(msg.encode("ascii", "replace").decode("ascii"))
        except Exception as exc:
            failed.append({"matchId": mid, "error": str(exc)})
            print(f"FAILED {mid}: {str(exc).encode('ascii', 'replace').decode('ascii')}")

    save_json(progress_path, progress)
    print(f"Done World Cup: games={len(progress['games'])} linked={linked} failed={len(failed)}")
    return progress, failed


def pd_notna(value) -> bool:
    try:
        import pandas as pd

        return value is not None and not (isinstance(value, float) and pd.isna(value))
    except Exception:
        return value is not None and value == value


def relink_progress(slug: str, matches: list[dict], teams: list[dict]) -> None:
    """Re-resolve local matchIds after alias fixes."""
    path = PROGRESS_DIR / f"{slug}.json"
    if not path.exists():
        return
    cfg = COMPETITION_CONFIG[slug]
    teams_by_id, by_norm = build_team_lookups(teams)
    local_index = our_matches_index(matches, teams_by_id, cfg["ours"])
    progress = load_json(path, {"games": {}})
    linked = 0
    for game in progress.get("games", {}).values():
        home = resolve_team(game.get("homeTeamRaw") or game.get("homeTeam") or "", by_norm)
        away = resolve_team(game.get("awayTeamRaw") or game.get("awayTeam") or "", by_norm)
        if home:
            game["homeTeam"] = home
        if away:
            game["awayTeam"] = away
        if home and away and game.get("date"):
            local_id = local_index.get(
                f"{str(game['date'])[:10]}|{normalize_name(home)}|{normalize_name(away)}"
            )
            game["matchId"] = local_id
            if local_id is not None:
                linked += 1
    save_json(path, progress)
    print(f"Relinked {slug}: {linked}/{len(progress.get('games', {}))}")


def merge_into_output(competitions: list[str]):
    matches = load_json(MATCHES_PATH, [])
    teams = load_json(TEAMS_PATH, [])
    for slug in competitions:
        if slug in COMPETITION_CONFIG:
            relink_progress(slug, matches, teams)

    existing = load_json(OUTPUT_PATH, {"meta": {}, "matches": {}})
    matches_out = existing.get("matches", {})
    coverage = {}

    for slug in competitions:
        path = PROGRESS_DIR / f"{slug}.json"
        if not path.exists():
            coverage[slug] = {"status": "missing"}
            continue
        progress = load_json(path, {"games": {}})
        linked = 0
        for game in progress.get("games", {}).values():
            local_id = game.get("matchId")
            if local_id is None:
                # keep under external key for unmatched
                key = f"ext:{game.get('source')}:{game.get('externalMatchId')}"
                matches_out[key] = game
            else:
                matches_out[str(local_id)] = game
                linked += 1
        coverage[slug] = {
            "gamesFetched": len(progress.get("games", {})),
            "linkedToLocalMatchId": linked,
        }

    payload = {
        "meta": {
            "generatedAt": now_iso(),
            "sources": {
                "leagues": "FBref via soccerdata",
                "worldCup": "StatsBomb open data",
            },
            "season": "2022/23 (+ World Cup 2022)",
            "coverage": coverage,
            "matchCount": len(matches_out),
            "notes": [
                "Players include starters and bench where available.",
                "matchId is the local Foot-Insights match id when join succeeded.",
                "Join key: date + home/away team names with alias normalization.",
            ],
        },
        "matches": matches_out,
    }
    save_json(OUTPUT_PATH, payload)
    print(f"\nWrote {OUTPUT_PATH} ({len(matches_out)} matches)")
    return payload


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--competition",
        required=True,
        choices=[*COMPETITION_CONFIG.keys(), "all", "merge-only"],
    )
    args = parser.parse_args()

    matches = load_json(MATCHES_PATH, [])
    teams = load_json(TEAMS_PATH, [])
    PROGRESS_DIR.mkdir(parents=True, exist_ok=True)

    if args.competition == "merge-only":
        merge_into_output(list(COMPETITION_CONFIG.keys()))
        return

    selected = (
        list(COMPETITION_CONFIG.keys())
        if args.competition == "all"
        else [args.competition]
    )

    # Prefer World Cup first when running all (fast)
    if args.competition == "all":
        selected = ["world-cup"] + [s for s in selected if s != "world-cup"]

    all_failed = {}
    for slug in selected:
        cfg = COMPETITION_CONFIG[slug]
        if cfg["source"] == "statsbomb":
            _, failed = fetch_world_cup(matches, teams)
        else:
            _, failed = fetch_fbref_competition(slug, cfg, matches, teams)
        all_failed[slug] = failed

    merge_into_output(list(COMPETITION_CONFIG.keys()))
    print("\nFailures summary:")
    for slug, failed in all_failed.items():
        print(f"  {slug}: {len(failed)}")


if __name__ == "__main__":
    main()
