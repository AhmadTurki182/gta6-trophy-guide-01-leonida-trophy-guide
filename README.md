# Leonida Trophy Guide — GTA 6 Platinum Tracker

[![make.fun](https://make.fun/api/competitions/gta6-trophy-guide-01/badge.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun leaderboard](https://make.fun/api/competitions/gta6-trophy-guide-01/leaderboard-badge.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun entry](https://make.fun/api/competitions/gta6-trophy-guide-01/entry-badge.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline, open-source guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. See the competition: https://make.fun/bounty/gta6-trophy-guide-01

## What it is

Every trophy is shown with its official PlayStation name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden until earned), plus a guide written in our own words that says what to do, where and how, and when it can be missed — with its sources cited beside it. Names, descriptions, grades, hidden flags and PSN counts follow the official list as published by Exophase and PSNProfiles, which agree on every name, description and grade. Where the official list does not pin down a place or a step, the guide says so instead of inventing one.

## Features

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) and shown as a count and a progress bar to the platinum.
- **Filters** — by kind (story, missable, collectibles, activities), by grade, by earned/remaining, plus full-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Export / import** — download your progress as a JSON file and import it back on any machine.
- **Roadmap to the platinum** — six stages in order: story playthrough, stranger strands, activities, collectibles, cleanup and grind, platinum. Stage progress is counted live from your checklist.
- **Missable trophies flagged** — 13 trophies that need a partner, a one-off moment or one specific place, listed on their own page and flagged in the checklist.
- **Offline** — static files only, no network requests, no cookies, no service worker, no Rockstar logo or official artwork.

## How to run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the `app/` folder with any static server and open `app/index.html`. Everything the app loads is a file inside `app/`.

## How to hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/dossier.json (schema makefun/dossier/v1, 4 screenshots)
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes the dossier with the kit's `vendor/makefun-frontend.ts`. It creates the output directory and clears only its children — it never deletes the output directory itself, because on the grader `/output` is a mount point that cannot be deleted.

## License

MIT — see `LICENSE`.
