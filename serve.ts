/* Static server for the Leonida Trophy Guide.
   Serves app/ at its root on http://localhost:8080 by default, so the
   guide can be tried in desktop Chrome exactly as the finalist review
   will serve it. Node standard library only; no dependencies. */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const PORT = Number(process.env.PORT ?? 8080);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safePath(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const joined = normalize(join(APP_DIR, decoded === '/' ? 'index.html' : decoded));
  if (joined !== APP_DIR && !joined.startsWith(APP_DIR + sep)) return null;
  return joined;
}

const server = createServer(async (req, res) => {
  try {
    const path = safePath(req.url ?? '/');
    if (path === null) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Bad path');
      return;
    }
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': MIME_TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Leonida Trophy Guide at http://localhost:${PORT}/ (serving app/)`);
});
