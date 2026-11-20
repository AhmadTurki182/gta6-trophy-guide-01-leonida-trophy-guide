// Leonida Trophy Guide — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is app/: plain static files a browser opens at app/index.html
// (a script, CSS and a JSON trophy list, no build step), fully offline — it loads
// nothing over the network. This program hands it in: it copies app/ and
// screenshots/ from beside this file into OUT_DIR and writes dossier.json there,
// the summary the judge reads, using the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be
// byte for byte what its own copy writes.
//
// THE FIX that matters: OUT_DIR is a mount point on the grader, and the user
// the grader runs as cannot delete it. So this program never removes OUT_DIR
// itself. It creates the directory if needed, then deletes only its CHILDREN
// (every entry readdirSync finds), one rmSync per child. Clearing the children
// is enough to guarantee a clean output; removing the directory itself is
// what failed the previous round with EPERM.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

if (out === resolve(here)) {
  throw new Error('refusing to use the repository directory as the output directory');
}

// Create the output directory (a no-op when it already exists, including when
// it is a mount point), then clear only its children — never the directory.
mkdirSync(out, { recursive: true });
for (const child of readdirSync(out)) {
  rmSync(join(out, child), { recursive: true, force: true });
}

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files; app paths capped at 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// Read the dossier back and validate it before declaring success: the schema
// must be makefun/dossier/v1, there must be 3 or 4 screenshots, and the text
// summary must not be empty. Anything else is a failed run, not a handoff.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
if (dossier.schema !== 'makefun/dossier/v1') {
  throw new Error(`unexpected dossier schema: ${String(dossier.schema)}`);
}
const shotCount = Array.isArray(dossier.images) ? dossier.images.length : 0;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`expected 3-4 screenshots, dossier has ${shotCount}`);
}
if (typeof dossier.cover !== 'number' || dossier.cover < 0 || dossier.cover >= shotCount) {
  throw new Error(`dossier cover index out of range: ${String(dossier.cover)}`);
}
if (typeof dossier.text !== 'string' || dossier.text.length === 0) {
  throw new Error('dossier text is empty');
}
console.log(`dossier ok: schema ${dossier.schema}, ${shotCount} screenshots, ${dossier.text.length} text bytes`);
