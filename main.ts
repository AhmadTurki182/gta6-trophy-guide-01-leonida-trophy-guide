/* Leonida Trophy Guide — entrypoint.
   Copies app/ and screenshots/ from this repository into the output
   directory and writes dossier.json there with buildDossier from
   vendor/makefun-frontend.ts, exactly as the gate rebuilds it.
   It then reads the dossier back and checks it parses, carries the
   right schema and holds 3 or 4 screenshots, so a broken hand-in
   fails loudly here instead of at the gate.
   Node 22 standard library only; no install, no network. */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)));
const OUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

if (OUT_DIR === REPO_DIR) {
  throw new Error('Refusing to use the repository itself as the output directory.');
}

function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function requireDir(path: string, label: string): void {
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    throw new Error(`Missing ${label} directory: ${path}`);
  }
}

requireDir(join(REPO_DIR, 'app'), 'app');
requireDir(join(REPO_DIR, 'screenshots'), 'screenshots');

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
cpSync(join(REPO_DIR, 'app'), join(OUT_DIR, 'app'), { recursive: true });
cpSync(join(REPO_DIR, 'screenshots'), join(OUT_DIR, 'screenshots'), { recursive: true });

const dossier = buildDossier(OUT_DIR, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

const dossierPath = join(OUT_DIR, 'dossier.json');
writeFileSync(dossierPath, dossier);

const written = JSON.parse(readFileSync(dossierPath, 'utf8')) as {
  schema?: unknown;
  images?: unknown[];
  text?: unknown;
};
if (written.schema !== 'makefun/dossier/v1') {
  throw new Error(`dossier.json has unexpected schema: ${String(written.schema)}`);
}
if (!Array.isArray(written.images) || written.images.length < 3 || written.images.length > 4) {
  throw new Error(`dossier.json holds ${Array.isArray(written.images) ? written.images.length : 0} screenshots, expected 3 or 4`);
}
if (typeof written.text !== 'string' || written.text.length === 0) {
  throw new Error('dossier.json holds no text');
}

console.log(`Copied ${countFiles(join(OUT_DIR, 'app'))} app files and ${written.images.length} screenshots.`);
console.log(`Wrote ${dossierPath} (${dossier.length} bytes, schema makefun/dossier/v1).`);
