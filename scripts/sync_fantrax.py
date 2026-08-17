#!/usr/bin/env python3
"""Refresh the public, normalized snapshot for a private Fantrax league."""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from fantraxapi import FantraxException, League, NotLoggedIn


LEAGUE_ID = "2qe3cztxmo7x0voa"
TEAM_NAME = "Troy Bolton"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(f"{path.suffix}.tmp")
    temporary_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary_path.replace(path)


def find_record(league: League, team_id: str) -> dict:
    try:
        standings = league.standings()
        record = next((item for item in standings.ranks.values() if item.team.id == team_id), None)
    except (FantraxException, KeyError, TypeError, ValueError):
        record = None

    if record is None:
        return {"wins": None, "losses": None, "ties": None, "rank": None}

    games_played = record.win + record.loss + record.tie
    return {
        "wins": record.win,
        "losses": record.loss,
        "ties": record.tie,
        "rank": record.rank if games_played else None,
    }


def roster_rows(team) -> list[dict]:
    roster = team.roster()
    rows = []
    for row in roster.rows:
        if row.player is None:
            continue
        position_name = row.position.name.lower()
        group = "bench" if any(word in position_name for word in ("reserve", "bench", "injured")) else "active"
        rows.append(
            {
                "group": group,
                "name": row.player.name,
                "nbaTeam": row.player.team_short_name,
                "position": row.position.short_name,
                "status": {
                    "dayToDay": row.player.day_to_day,
                    "injuredReserve": row.player.injured_reserve,
                    "out": row.player.out,
                    "suspended": row.player.suspended,
                },
            }
        )
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=Path("data/fantasy"))
    args = parser.parse_args()

    snapshot_path = args.output_root / "private-league.json"
    status_path = args.output_root / "sync-status.json"
    previous_snapshot = read_json(snapshot_path)
    attempted_at = utc_now()
    cookie = os.environ.get("FANTRAX_COOKIE", "").strip()

    if not cookie:
        write_json(
            status_path,
            {
                "lastAttempt": attempted_at,
                "lastSuccessfulSync": previous_snapshot.get("lastSuccessfulSync"),
                "state": "authentication-required",
            },
        )
        print("::error title=Fantrax login required::The FANTRAX_COOKIE repository secret is missing.")
        return 2

    if "\n" in cookie or "\r" in cookie:
        write_json(
            status_path,
            {
                "lastAttempt": attempted_at,
                "lastSuccessfulSync": previous_snapshot.get("lastSuccessfulSync"),
                "state": "authentication-required",
            },
        )
        print("::error title=Invalid Fantrax cookie::The cookie secret must be a single-line Cookie header value.")
        return 2

    try:
        # Supplying the browser's Cookie header avoids persisting or printing it.
        from requests import Session

        session = Session()
        session.headers.update({"Cookie": cookie})
        league = League(LEAGUE_ID, session=session)
        team = league.team(TEAM_NAME)
        players = roster_rows(team)
        record = find_record(league, team.id)
    except NotLoggedIn:
        write_json(
            status_path,
            {
                "lastAttempt": attempted_at,
                "lastSuccessfulSync": previous_snapshot.get("lastSuccessfulSync"),
                "state": "authentication-required",
            },
        )
        print("::error title=Fantrax login expired::Replace the FANTRAX_COOKIE repository secret with a fresh Cookie header value.")
        return 2
    except FantraxException as error:
        write_json(
            status_path,
            {
                "lastAttempt": attempted_at,
                "lastSuccessfulSync": previous_snapshot.get("lastSuccessfulSync"),
                "state": "failed",
            },
        )
        print(f"::error title=Fantrax sync failed::{type(error).__name__}; the last successful snapshot was retained.")
        return 1
    except Exception as error:
        write_json(
            status_path,
            {
                "lastAttempt": attempted_at,
                "lastSuccessfulSync": previous_snapshot.get("lastSuccessfulSync"),
                "state": "failed",
            },
        )
        print(f"::error title=Fantrax sync interrupted::{type(error).__name__}; the last successful snapshot was retained.")
        return 1

    snapshot = {
        "league": {
            "id": LEAGUE_ID,
            "name": league.name,
            "season": league.year,
            "teamCount": len(league.teams),
        },
        "team": {
            "id": team.id,
            "name": team.name,
            "record": record,
            "roster": players,
            "rosterCount": len(players),
        },
        "lastSuccessfulSync": attempted_at,
        "schemaVersion": 1,
    }
    write_json(snapshot_path, snapshot)
    write_json(
        status_path,
        {
            "lastAttempt": attempted_at,
            "lastSuccessfulSync": attempted_at,
            "state": "current",
        },
    )
    print(f"Synced {team.name}: {len(players)} players")
    return 0


if __name__ == "__main__":
    sys.exit(main())
