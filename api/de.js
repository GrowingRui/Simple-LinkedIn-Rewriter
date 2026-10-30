// GET /de (vercel.json rewrites it here): the home page with a German <head>, so search engines and
// link previews see a German page at its own URL. The body is translated by assets/i18n.js, which
// picks German from the path.
import { readFile } from 'node:fs/promises';

const SITE = 'https://simplelinkedinrewriter.vercel.app';
const TITLE = 'Kostenloser LinkedIn-Post-Rewriter | Simple LinkedIn Rewriter';
const DESCRIPTION = 'Füge einen groben LinkedIn-Entwurf ein und erhalte in Sekunden einen klaren, menschlichen Beitrag. Deine Stimme bleibt, die Floskeln fliegen raus.';
const OG_DESCRIPTION = 'Füge einen groben LinkedIn-Entwurf ein und erhalte in Sekunden einen klaren, menschlichen Beitrag. 5 kostenlose Umschreibungen pro Tag.';

let page;
async function germanHome() {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const swaps = [
    [/<html lang="en">/, '<html lang="de">'],
    [/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`],
    [/(<meta name="description" content=")[^"]*/, `$1${DESCRIPTION}`],
    [/(<link rel="canonical" href=")[^"]*/, `$1${SITE}/de`],
    [/(<meta property="og:title" content=")[^"]*/, `$1${TITLE}`],
    [/(<meta property="og:description" content=")[^"]*/, `$1${OG_DESCRIPTION}`],
    [/(<meta property="og:url" content=")[^"]*/, `$1${SITE}/de`],
    [/(<meta property="og:locale" content=")[^"]*/, '$1de_DE'],
  ];
  return swaps.reduce((s, [re, to]) => {
    if (!re.test(s)) throw new Error(`de page: ${re} not found in index.html`);
    return s.replace(re, to);
  }, html);
}

export default async function handler(req, res) {
  page ??= await germanHome();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.end(page);
}
