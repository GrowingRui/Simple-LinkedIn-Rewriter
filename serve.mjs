import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = process.env.PORT || 3000;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

// Local API keys live in .env.local (gitignored); on Vercel they are project env vars.
try { process.loadEnvFile(join(root, '.env.local')); } catch {}

// Run api/*.js handlers locally with the small subset of Vercel's req/res helpers they use.
async function runApi(name, req, res) {
  const { default: handler } = await import(`./api/${name}.js`);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
  await handler(req, res);
}

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const api = path.match(/^\/api\/([\w-]+)$/);
    if (api) { await runApi(api[1], req, res); return; }
    let file = normalize(join(root, path));
    if (!file.startsWith(normalize(root))) { res.writeHead(403).end(); return; }
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
