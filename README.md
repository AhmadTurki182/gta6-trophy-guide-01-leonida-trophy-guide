# Leonida Trophy Guide — Grand Theft Auto VI

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01/)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01/).

## What it is

- **All 55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden) with their official names, descriptions and grades as PlayStation publishes them.
- **A guide to every trophy in our own words**, each citing its sources beside it (Exophase / PSNProfiles for the list, GTABase, Output Lag and others for the steps). Where the exact steps of a trophy are not confirmed yet, the guide says so instead of guessing.
- **A roadmap to the platinum** in four stages — story, side content, the 100% checklist, clean-up — built from the official descriptions (chapters, missions, collectibles and counts).
- **Missable flags**: Positive Mental Attitude is the one confirmed missable trophy (a Chapter 1 meditation with Lucia that disappears after that chapter), with a callout at the top of the roadmap.
- **A tracker**: a checklist whose progress is saved in the browser (localStorage), exportable to a file and importable back; filters by kind (story, missable, collectibles, activities, online); and a spoiler setting that hides the names and descriptions of story trophies until they are earned.

## Facts that shape the roadmap

- One playthrough is enough: no difficulty trophies, no online trophies, no New Game Plus.
- There is no mission replay — keep a manual save at the start of every chapter and one more before the final mission.
- Cheats switch trophies off, so leave them alone on a trophy run.
- About 200 hours to the platinum, most of it after the credits on the 100% checklist (A Long Road).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The app is static files under `app/` with no build step and works with the network off: every script, stylesheet and data file it loads is a file under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there with `buildDossier` from `vendor/makefun-frontend.ts`.

## Sources

- Trophy list (names, descriptions, grades): Exophase, cross-checked with PSNProfiles and TrueAchievements (via Planet GTA 6).
- Guides and roadmap details: GTABase, Output Lag, KeenGamer, PowerPyx, Push Square.

This is an unofficial fan project, not affiliated with Rockstar Games. It uses no Rockstar logo, artwork, box art or game screenshots.

## License

MIT — see [LICENSE](LICENSE).
