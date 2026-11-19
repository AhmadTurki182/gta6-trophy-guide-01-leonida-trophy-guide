# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) bounty on make.fun.

## What it is

- **Every trophy, official and complete:** all 55 names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 27 visible, 28 hidden), each with a guide written in our own words that names its source beside it.
- **A tracker:** tick trophies off and the checklist is saved in the browser (localStorage), with export to a JSON file and import back.
- **Filters by kind:** grade, story / side strands / activities / collectibles / exploration / money, visible vs hidden, earned vs not yet, missable only, plus search.
- **Spoiler-free mode:** hides the names and descriptions of story trophies until they are earned.
- **A roadmap to the platinum:** five stages, built from the official descriptions — save discipline, the one missable trophy (Positive Mental Attitude, Chapter 1), the story, the stranger strands, then cleanup to 100% (~200 hours).
- **Missable flags:** Positive Mental Attitude and Strangers & Freaks (Yago's timed race in Chapter 3).

## Honesty note

Rockstar, Sony and Microsoft have not published the trophy list themselves. The names, descriptions and grades come from the trackers Exophase and PSNProfiles, as reported on 18 November 2026, which the competition kit treats as the official list. All 55 trophies are single-player; there are no online trophies. Xbox has the same 55 achievements for 1,000 Gamerscore.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at run time: `app/` is plain static files.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
