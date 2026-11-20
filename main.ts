// Leonida Trophy Guide — the entry program (Node 22, standard library only).
// It copies app/ and screenshots/ from beside this file into OUT_DIR
// (process.env.MAKEFUN_OUTPUT_DIR, or /output on the grader) and writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
//
// The grader runs this twice and both runs must write the same bytes, so
// the copy is a plain recursive copy and the dossier is written exactly
// as buildDossier returns it.
//
// IMPORTANT: /output is a mount point on the grader, and the user the
// program runs as cannot delete it. So this program never removes
// OUT_DIR itself: it creates it, then removes only its children, one
// by one, before copying the fresh entry in. Deleting the directory
// itself would fail with EPERM and reject the whole entry.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const repoDir = resolve(here);

// Refuse to run if OUT_DIR is the repository itself: clearing it would
// delete the entry we are trying to hand in.
if (resolve(out) === repoDir) {
  throw new Error('MAKEFUN_OUTPUT_DIR must not be the repository directory');
}

// Create the output directory, then clear only its children.
mkdirSync(out, { recursive: true });
for (const child of readdirSync(out)) {
  rmSync(join(out, child), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories
// in app/ or 48 MiB of app files; a path over 1000 bytes).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// Read the dossier back and validate it before reporting success.
const back = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
if (back.schema !== 'makefun/dossier/v1') {
  throw new Error(`dossier schema is ${String(back.schema)}, expected makefun/dossier/v1`);
}
const images = Array.isArray(back.images) ? back.images : [];
if (images.length < 3 || images.length > 4) {
  throw new Error(`dossier holds ${images.length} screenshots, expected 3 or 4`);
}
if (typeof back.text !== 'string' || back.text.length === 0) {
  throw new Error('dossier text is empty');
}
// The copied screenshots must be exactly the ones the dossier lists:
// a stale file left in out/screenshots would make the two runs differ.
const copiedShots = readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.'));
if (copiedShots.length !== images.length) {
  throw new Error(`copied ${copiedShots.length} screenshots but the dossier lists ${images.length}`);
}
if (!existsSync(join(out, 'app', 'index.html'))) {
  throw new Error('out/app/index.html is missing after the copy');
}
console.log(`wrote ${join(out, 'dossier.json')} (${images.length} screenshots, schema ${back.schema})`);
