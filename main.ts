// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
//
// The guide is plain static files in app/ (index.html, style.css, ES modules,
// and data/trophies.json), so there is no build step. This program copies
// app/ and screenshots/ from beside this file into the output directory and
// writes dossier.json there with the vendored make.fun library, which is
// what the judge reads. vendor/makefun-frontend.ts is the kit's copy and
// must stay exactly as shipped: the scorer rebuilds the dossier with its
// own copy and compares the two byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// --- Pre-flight validation (fails fast, before any file is copied) --------
//
// The gate refuses an entry whose trophies.json does not name all 55
// official trophies with a guide, or whose screenshots/app break the caps.
// Check both here so a bad hand-in never reaches the scorer silently.

// 1. Trophy data: exactly 55 trophies, each with its required fields.
const REQUIRED_TROPHY_FIELDS = ['name', 'description', 'grade', 'guide'];
const trophiesDoc = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8'));
const trophyList = Array.isArray(trophiesDoc) ? trophiesDoc : trophiesDoc.trophies;
if (!Array.isArray(trophyList)) {
  throw new Error('app/data/trophies.json must be an object with a "trophies" array (or that array alone)');
}
if (trophyList.length !== 55) {
  throw new Error(`app/data/trophies.json must hold 55 trophies, found ${trophyList.length}`);
}
for (const [index, trophy] of trophyList.entries()) {
  for (const field of REQUIRED_TROPHY_FIELDS) {
    if (typeof trophy?.[field] !== 'string' || !trophy[field].trim()) {
      throw new Error(`app/data/trophies.json trophy #${index + 1} is missing a non-blank "${field}"`);
    }
  }
}
const trophyNames = new Set(trophyList.map((t) => t.name));
if (trophyNames.size !== trophyList.length) {
  throw new Error('app/data/trophies.json has duplicate trophy names');
}

// 2. Scorer caps: 3-4 screenshots at most 256 KiB each; app/ at most 993
// files/directories and 48 MiB in all.
const shotsDir = join(here, 'screenshots');
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.'))
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
}
for (const name of shotFiles) {
  const bytes = statSync(join(shotsDir, name)).size;
  if (bytes > 262144) {
    throw new Error(`screenshots/${name} is ${bytes} bytes, over the 256 KiB cap`);
  }
}
let appEntries = 0;
let appBytes = 0;
const walkApp = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    appEntries += 1;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkApp(path);
    else appBytes += statSync(path).size;
  }
};
walkApp(join(here, 'app'));
if (appEntries > 993) {
  throw new Error(`app/ has ${appEntries} files/directories, over the 993 cap`);
}
if (appBytes > 50331648) {
  throw new Error(`app/ is ${appBytes} bytes, over the 48 MiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
// Drop any screenshots a previous run left in the output directory first:
// without this, a re-run after deleting a screenshot would still hand in
// the stale file. (The validation above already guarantees 3-4 fresh ones.)
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
// app files, counted beside /output's own 1000-entry cap).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

// The gate caps dossier.json at 1.5 MiB; refuse a hand-in over it here with
// a clear message instead of letting the scorer reject it silently.
const dossierBytes = statSync(join(out, 'dossier.json')).size;
if (dossierBytes > 1572864) {
  throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB cap`);
}

// One-line hand-in summary, so a run's result is visible at a glance.
const shotBytes = shotFiles.reduce((sum, name) => sum + statSync(join(shotsDir, name)).size, 0);
console.log(
  `Leonida Trophy Guide handed in: ${appEntries} app entries, ${appBytes} bytes; ` +
    `${shotFiles.length} screenshots, ${shotBytes} bytes; ` +
    `dossier.json ${dossierBytes} bytes; ${trophyList.length} trophies validated.`,
);
