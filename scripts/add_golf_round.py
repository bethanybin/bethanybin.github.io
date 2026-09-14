#!/usr/bin/env python3
"""Add or update a golf round without editing the website HTML."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROUNDS_PATH = ROOT / "data" / "golf" / "rounds.json"
JAVASCRIPT_PATH = ROOT / "golf-data.js"
IMAGE_DIRECTORY = ROOT / "assets" / "golf"
WEB_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}


def optional_prompt(label: str, current: str | None = None) -> str:
    suffix = f" [{current}]" if current else ""
    response = input(f"{label}{suffix}: ").strip()
    return response or (current or "")


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "round"


def optional_number(value: str | int | float | None, number_type):
    if value in (None, ""):
        return None
    return number_type(value)


def read_rounds() -> list[dict]:
    try:
        payload = json.loads(ROUNDS_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return []
    if not isinstance(payload, list):
        raise ValueError(f"{ROUNDS_PATH} must contain a JSON array")
    return payload


def validate_date(value: str) -> str:
    return date.fromisoformat(value).isoformat()


def validate_scorecard(payload, holes: int) -> list[dict]:
    rows = payload.get("holeData", payload) if isinstance(payload, dict) else payload
    if not isinstance(rows, list) or len(rows) != holes:
        raise ValueError(f"scorecard must contain exactly {holes} hole rows")

    normalized = []
    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            raise ValueError(f"hole {index} must be a JSON object")
        par = int(row["par"])
        score = int(row["score"])
        yardage = optional_number(row.get("yardage"), int)
        handicap = optional_number(row.get("handicap"), int)
        if par not in range(3, 7):
            raise ValueError(f"hole {index}: par must be between 3 and 6")
        if score not in range(1, 21):
            raise ValueError(f"hole {index}: score must be between 1 and 20")
        if yardage is not None and yardage not in range(30, 701):
            raise ValueError(f"hole {index}: yardage must be between 30 and 700")
        if handicap is not None and handicap not in range(1, 19):
            raise ValueError(f"hole {index}: handicap must be between 1 and 18")
        normalized.append(
            {
                "hole": index,
                "par": par,
                "yardage": yardage,
                "handicap": handicap,
                "score": score,
            }
        )
    return normalized


def interactive_scorecard(holes: int) -> list[dict]:
    rows = []
    print("\nEnter the par, yardage, handicap, and score for each hole.")
    for hole in range(1, holes + 1):
        print(f"\nHole {hole}")
        par = int(optional_prompt("  Par"))
        yardage = optional_number(optional_prompt("  Yardage (optional)"), int)
        handicap = optional_number(optional_prompt("  Handicap (optional)"), int)
        score = int(optional_prompt("  Score"))
        rows.append(
            {
                "par": par,
                "yardage": yardage,
                "handicap": handicap,
                "score": score,
            }
        )
    return validate_scorecard(rows, holes)


def prepare_image(source_value: str, identifier: str, dry_run: bool) -> str:
    if not source_value:
        return "assets/golf/course-banner.jpg"
    source = Path(source_value).expanduser().resolve()
    if not source.is_file():
        raise ValueError(f"image does not exist: {source}")
    if source.suffix.lower() not in WEB_IMAGE_SUFFIXES:
        raise ValueError("image must be JPG, PNG, WebP, AVIF, or GIF; convert HEIC/RAW files first")
    destination = IMAGE_DIRECTORY / f"{identifier}{source.suffix.lower()}"
    if not dry_run:
        IMAGE_DIRECTORY.mkdir(parents=True, exist_ok=True)
        if source != destination.resolve():
            shutil.copy2(source, destination)
    return destination.relative_to(ROOT).as_posix()


def write_data(rounds: list[dict]) -> None:
    ROUNDS_PATH.parent.mkdir(parents=True, exist_ok=True)
    ROUNDS_PATH.write_text(json.dumps(rounds, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    javascript = "// Generated from data/golf/rounds.json by scripts/add_golf_round.py.\n"
    javascript += f"window.GOLF_ROUNDS = {json.dumps(rounds, indent=2, ensure_ascii=False)};\n"
    JAVASCRIPT_PATH.write_text(javascript, encoding="utf-8")


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(
        description="Add a round to the golf page. Omit course/date to use the interactive prompts."
    )
    command.add_argument("--course")
    command.add_argument("--date", dest="played_on", help="YYYY-MM-DD")
    command.add_argument("--image", help="local JPG, PNG, WebP, AVIF, or GIF")
    command.add_argument("--location", default="")
    command.add_argument("--tees", default="")
    command.add_argument("--yardage", type=int)
    command.add_argument("--rating", type=float)
    command.add_argument("--slope", type=int)
    command.add_argument("--holes", type=int, choices=(9, 18), default=18)
    command.add_argument("--notes", default="")
    command.add_argument("--differential", type=float, help="official posted Score Differential, especially for a 9-hole round")
    command.add_argument("--adjusted-gross-score", type=float, help="handicap-adjusted 18-hole gross score")
    command.add_argument("--pcc", type=float, default=0, help="Playing Conditions Calculation adjustment")
    command.add_argument("--scorecard", type=Path, help="JSON array containing one object per hole")
    command.add_argument("--interactive-scorecard", action="store_true")
    command.add_argument("--replace", action="store_true", help="replace a round with the same course and date")
    command.add_argument("--dry-run", action="store_true", help="validate and preview without changing files")
    return command


def main() -> int:
    args = parser().parse_args()
    interactive = not args.course or not args.played_on
    course = args.course or optional_prompt("Course name")
    played_on = validate_date(args.played_on or optional_prompt("Date played (YYYY-MM-DD)"))
    holes = args.holes

    location = args.location
    tees = args.tees
    yardage = args.yardage
    rating = args.rating
    slope = args.slope
    notes = args.notes
    image_source = args.image or ""
    if interactive:
        image_source = image_source or optional_prompt("Image path (optional)")
        location = location or optional_prompt("Location (optional)")
        tees = tees or optional_prompt("Tees (optional)")
        yardage = yardage or optional_number(optional_prompt("Yardage (optional)"), int)
        rating = rating or optional_number(optional_prompt("Course rating (optional)"), float)
        slope = slope or optional_number(optional_prompt("Slope (optional)"), int)
        notes = notes or optional_prompt("Notes (optional)")

    identifier = f"{slugify(course)}-{played_on}"
    image = prepare_image(image_source, identifier, args.dry_run)
    hole_data = []
    if args.scorecard:
        hole_data = validate_scorecard(json.loads(args.scorecard.read_text(encoding="utf-8")), holes)
    elif args.interactive_scorecard:
        hole_data = interactive_scorecard(holes)

    new_round = {
        "id": identifier,
        "course": course.strip(),
        "date": played_on,
        "image": image,
        "location": location.strip(),
        "tees": tees.strip(),
        "yardage": yardage,
        "rating": rating,
        "slope": slope,
        "holes": holes,
        "notes": notes.strip(),
        "differential": args.differential,
        "adjustedGrossScore": args.adjusted_gross_score,
        "pcc": args.pcc,
        "holeData": hole_data,
    }
    rounds = read_rounds()
    matches = [
        index
        for index, item in enumerate(rounds)
        if item.get("date") == played_on and str(item.get("course", "")).casefold() == course.strip().casefold()
    ]
    if matches and not args.replace:
        raise ValueError(f"{course} on {played_on} already exists; use --replace to update it")
    if matches:
        new_round["id"] = rounds[matches[0]].get("id", identifier)
        rounds = [item for index, item in enumerate(rounds) if index not in matches]
    rounds.append(new_round)
    rounds.sort(key=lambda item: item.get("date", ""), reverse=True)

    if args.dry_run:
        print(json.dumps(new_round, indent=2, ensure_ascii=False))
        return 0
    write_data(rounds)
    print(f"Added {course} — {played_on}. The golf page will render it automatically.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, json.JSONDecodeError) as error:
        print(f"error: {error}", file=sys.stderr)
        sys.exit(2)
