[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AhmadTurki182/gta6-trophy-guide-01-leonida-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI · 55 PS5 Trophies

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

Every trophy is shown with its official name, description and grade, plus a guide written in our own words that cites its sources — what to do, where and how, and when it can be missed. The guide gives a roadmap to the platinum (story chapters, side stories, open-world cleanup, 100% completion), flags the one truly missable trophy, and tracks your progress: a checklist saved in the browser, export to a file and import back, filters by kind (story, missable, collectibles, activities, online), and a spoiler setting that hides story trophies until they are earned.

## Run it

Static files, no build step, works with the network off:

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `app/index.html` — the guide page
- `app/style.css` — the look (deep Leonida night, neon pink and teal; system fonts only)
- `app/app.js` — bootstrap and controls
- `app/ui.js` — rendering: roadmap, checklist, filters, progress
- `app/state.js` — progress saved in localStorage, plus export / import
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, our own guide and its cited sources, kind, missable flag, count and roadmap stage
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — four real renders of the app

## Sources

Official names, descriptions and grades are as PlayStation publishes them, via the trophy trackers Exophase and PSNProfiles. Guide facts come from the guides named beside each trophy: OutputLag, HowToVideoGame, CryptoGames and GTA Vice City Hub. Every guide is written in our own words — a source is cited, never copied.

This is an unofficial, fan-made guide. Not affiliated with Rockstar Games or Sony Interactive Entertainment. No Rockstar logo, artwork, box art or game screenshot is used anywhere.

## License

MIT — see [LICENSE](LICENSE).
