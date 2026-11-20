# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy guide and progress tracker for Grand Theft Auto VI on PlayStation 5, built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it covers

All 55 official PlayStation trophies — 1 Platinum, 2 Gold, 6 Silver and 46 Bronze, including the 28 hidden ones — each with its official name, description and grade, plus an original guide written for this project: what to do, where to do it, when it can be missed, and how much of a grind it is (for example, 42 Shooting Range challenges for The Shootist, 250 stunts for Cunning Stunts, 100 vehicles for Whip It Good).

## Features

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in your browser (localStorage) and survives reloads.
- **Progress bar and grade counts** — see your overall percentage plus Platinum / Gold / Silver / Bronze totals at a glance.
- **Filters and search** — filter by story, missable, collectibles, activities, earned, or not earned; filter by grade; search by name or description.
- **Missable flags** — the six missable trophies (Hot Together, Retail Therapy, Gunslinger, Catch Me If You Can, Sneakthief, Ten Pin) are flagged so you grab them while their moments are available.
- **Spoiler setting** — turn on spoiler protection and story trophy descriptions and guides stay hidden until you earn them.
- **Roadmap to the platinum** — a four-stage plan: story playthrough, side content, collectibles and grinds, then cleanup and 100% completion.
- **Export and import** — download your progress as JSON and import it on another device.
- **Fully offline** — no network requests at runtime, no cookies, no service worker, no third-party code.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or open `app/index.html` directly in a browser (the trophy list loads from `app/data/trophies.json`, so serving it over HTTP is the reliable way).

To build the submission dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
