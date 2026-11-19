// Leonida Trophy Guide — entry program (Node 22, standard library only).
//
// What it hands in: this repository's app/ (the offline guide and tracker) and
// screenshots/ (four real renders of it), copied to /output, plus the dossier
// the judge reads, written by the kit's vendored library. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The dossier must be byte for byte what buildDossier writes, so this program
// never edits the files it copies and never writes dossier.json by hand.
// vendor/makefun-frontend.ts stays exactly as the kit shipped it.
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate allows at most 4 screenshots: refuse early with a clear message
// rather than handing in an entry the scorer would reject outright.
const shots = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((f) => !f.startsWith('.'))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Same caps the scorer enforces: 4 screenshots at most 256 KiB each, app/ at
// most 993 files and directories and 48 MiB, and the dossier text at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
