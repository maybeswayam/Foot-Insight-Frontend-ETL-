"""
Run remaining lineup competitions sequentially (resumable).

Usage:
  python scripts/run_lineups_queue.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROGRESS = ROOT / "data" / "_lineup_progress"

ORDER = [
    "premier-league",
    "la-liga",
    "bundesliga",
    "serie-a",
    "ligue-1",
    # world-cup already complete via StatsBomb; keep last as safety re-run
]


def expected_count(slug: str) -> int:
    return {
        "premier-league": 380,
        "la-liga": 380,
        "bundesliga": 306,
        "serie-a": 380,
        "ligue-1": 380,
        "world-cup": 64,
    }.get(slug, 0)


def is_done(slug: str) -> bool:
    path = PROGRESS / f"{slug}.json"
    if not path.exists():
        return False
    import json

    data = json.loads(path.read_text(encoding="utf-8"))
    games = data.get("games", {})
    need = expected_count(slug)
    # Allow a small miss budget for blocked pages
    return need > 0 and len(games) >= max(1, int(need * 0.95))


def main():
    for slug in ORDER:
        if is_done(slug):
            print(f"SKIP {slug} (already complete)")
            continue
        print(f"\n>>>> START {slug}")
        result = subprocess.run(
            [sys.executable, "-u", str(ROOT / "scripts" / "fetch_match_lineups.py"),
             "--competition", slug],
            cwd=str(ROOT),
        )
        if result.returncode != 0:
            print(f"WARN {slug} exited with {result.returncode}")
        else:
            print(f"DONE {slug}")

    # Final merge of everything present
    subprocess.run(
        [sys.executable, "-u", str(ROOT / "scripts" / "fetch_match_lineups.py"),
         "--competition", "merge-only"],
        cwd=str(ROOT),
        check=False,
    )


if __name__ == "__main__":
    main()
