#!/usr/bin/env python3
"""Refresh the safe, normalized snapshots used by the fantasy page."""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from fantraxapi import FantraxException, League, NotLoggedIn
from requests import Session


LEAGUES = (
    {"id": "57fwz0glmsdsmwx1", "team": "The Bounce Passers", "private": False},
    {"id": "2qe3cztxmo7x0voa", "team": "Troy Bolton", "private": True},
    {"id": "jjv4bihwmouag1p7", "team": "The Bounce Passers", "private": False},
    {"id": "rzxjb17qmp0md8ac", "team": "The Bounce Passers", "private": True},
    {"id": "a1m0ij55molu2hi5", "team": "The Bounce Passers", "private": False},
)


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


def as_list(value) -> list:
    return list(value.values()) if isinstance(value, dict) else list(value)


def find_record(league: League, team_id: str) -> dict:
    try:
        standings = league.standings()
        record = next((item for item in as_list(standings.ranks) if item.team.id == team_id), None)
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
    # Empty active slots remain in Fantrax's row list. The slot boundary is more
    # reliable than a player's eligible position for separating the two groups.
    for index, row in enumerate(roster.rows):
        if row.player is None:
            continue
        group = "active" if index < roster.active_max else "bench"
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


def snapshot_for(config: dict, session: Session, attempted_at: str) -> dict:
    league = League(config["id"], session=session)
    team = league.team(config["team"])
    players = roster_rows(team)
    return {
        "league": {
            "id": config["id"],
            "name": league.name,
            "season": league.year,
            "teamCount": len(league.teams),
            "private": config["private"],
        },
        "team": {
            "id": team.id,
            "name": team.name,
            "record": find_record(league, team.id),
            "roster": players,
            "rosterCount": len(players),
        },
        "lastSuccessfulSync": attempted_at,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-root", type=Path, default=Path("data/fantasy"))
    args = parser.parse_args()

    snapshot_path = args.output_root / "leagues.json"
    status_path = args.output_root / "leagues-sync-status.json"
    previous = read_json(snapshot_path)
    previous_by_id = {
        item.get("league", {}).get("id"): item
        for item in previous.get("leagues", [])
        if item.get("league", {}).get("id")
    }

    # Carry the original private snapshot forward during the data-file migration.
    legacy = read_json(args.output_root / "private-league.json")
    legacy_id = legacy.get("league", {}).get("id")
    if legacy_id and legacy_id not in previous_by_id:
        legacy.setdefault("league", {})["private"] = True
        previous_by_id[legacy_id] = legacy

    attempted_at = utc_now()
    cookie = os.environ.get("FANTRAX_COOKIE", "").strip()
    if "\n" in cookie or "\r" in cookie:
        print("::error title=Invalid Fantrax cookie::The cookie secret must be a single-line Cookie header value.")
        return 2

    session = Session()
    if cookie:
        session.headers.update({"Cookie": cookie})

    snapshots = []
    statuses = {}
    failures = 0
    for config in LEAGUES:
        league_id = config["id"]
        try:
            snapshot = snapshot_for(config, session, attempted_at)
            snapshots.append(snapshot)
            statuses[league_id] = {"state": "current", "lastSuccessfulSync": attempted_at}
            print(f"Synced {snapshot['league']['name']} / {snapshot['team']['name']}: {snapshot['team']['rosterCount']} players")
        except NotLoggedIn:
            failures += 1
            if league_id in previous_by_id:
                snapshots.append(previous_by_id[league_id])
            statuses[league_id] = {
                "state": "authentication-required",
                "lastSuccessfulSync": previous_by_id.get(league_id, {}).get("lastSuccessfulSync"),
            }
            print(f"::error title=Fantrax login expired::{league_id} needs a fresh FANTRAX_COOKIE value.")
        except Exception as error:
            failures += 1
            if league_id in previous_by_id:
                snapshots.append(previous_by_id[league_id])
            statuses[league_id] = {
                "state": "failed",
                "lastSuccessfulSync": previous_by_id.get(league_id, {}).get("lastSuccessfulSync"),
            }
            print(f"::error title=Fantrax sync interrupted::{league_id}: {type(error).__name__}; the last snapshot was retained.")

    order = {config["id"]: index for index, config in enumerate(LEAGUES)}
    snapshots.sort(key=lambda item: order.get(item.get("league", {}).get("id"), 999))
    write_json(snapshot_path, {"leagues": snapshots, "schemaVersion": 2})
    write_json(status_path, {"lastAttempt": attempted_at, "leagues": statuses, "schemaVersion": 1})
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
