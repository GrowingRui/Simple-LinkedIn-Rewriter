// Usage: node screenshot.mjs <url> [label] [width] [height]
// Uses the locally installed Chrome in headless mode (no Puppeteer needed).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [url = 'http://localhost:3000', label, width = '1440', height = '900'] = process.argv.slice(2);
const chromes = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
];
const chrome = chromes.find(existsSync);
if (!chrome) throw new Error('No Chrome/Edge found');

const dir = join(fileURLToPath(new URL('.', import.meta.url)), 'temporary screenshots');
mkdirSync(dir, { recursive: true });
const n = readdirSync(dir).reduce((max, f) => Math.max(max, +(f.match(/^screenshot-(\d+)/)?.[1] ?? 0)), 0) + 1;
const out = join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

execFileSync(chrome, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--window-size=${width},${height}`, '--virtual-time-budget=4000', `--screenshot=${out}`, url,
], { stdio: 'ignore' });
console.log(out);
