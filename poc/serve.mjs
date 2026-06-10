// Zero-dependency static server for the PoC demo.
//   npm run poc:serve   ->   http://localhost:5050/demo/
// (ES modules can't be loaded over file://, hence a tiny HTTP server.)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 5050;

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path === '/') path = '/demo/';
  if (path.endsWith('/')) path += 'index.html';

  // keep requests inside ROOT
  const filePath = normalize(join(ROOT, path));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': TYPES[extname(filePath)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => {
  console.log(`animikro PoC → http://localhost:${PORT}/demo/`);
});
