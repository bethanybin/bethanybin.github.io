# Adding a golf round

Run the internal helper from the website directory:

```sh
python3 scripts/add_golf_round.py
```

It prompts for the course, date, image, and optional round information. To enter every hole at the same time:

```sh
python3 scripts/add_golf_round.py --interactive-scorecard
```

A round can also be added in one command:

```sh
python3 scripts/add_golf_round.py \
  --course "Los Lagos GC" \
  --date 2026-09-13 \
  --image "/path/to/course-photo.jpg"
```

The command updates `data/golf/rounds.json`, copies the image into `assets/golf/`, and regenerates `golf-data.js`. The HTML does not need to be edited.

For handicap tracking, 18-hole rounds are converted to estimated Score Differentials automatically when rating and slope are present. For a 9-hole round, pass the official differential returned by the handicap service with `--differential`; the current World Handicap System uses an expected-score value that cannot be reconstructed from the scorecard alone.

For a complete scorecard, pass `--scorecard /path/to/scorecard.json`. The file should contain 9 or 18 rows in this shape:

```json
[
  {
    "par": 4,
    "yardage": 388,
    "handicap": 3,
    "score": 5
  }
]
```
