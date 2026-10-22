// Plans, daily free usage and invite codes.
// Invited access is a signed token the page keeps in sessionStorage and sends as the
// X-Access-Token header, so it can't be forged and ends when the tab is closed.
// Free usage is counted in Upstash Redis when it's connected; otherwise in a signed
// cookie, which works with no setup but resets if the visitor clears cookies.
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

export const FREE_DAILY_LIMIT = 5;
const IP_DAILY_LIMIT = FREE_DAILY_LIMIT * 4; // headroom for offices and schools sharing one IP
const INVITE_ATTEMPTS_PER_HOUR = 10;
const YEAR = 60 * 60 * 24 * 365, TWO_DAYS = 60 * 60 * 48;
const ACCESS_TTL_MS = 12 * 60 * 60 * 1000; // a tab left open still drops back to free after this

// ---------- signing ----------
// Falls back to a key derived from existing secrets, so SESSION_SECRET is optional.
// Changing INVITE_CODE therefore also signs out everyone who used the old code.
const secret = () => process.env.SESSION_SECRET || createHash('sha256')
  .update(`slr:${process.env.INVITE_CODE}:${process.env.GROQ_API_KEY}:${process.env.GEMINI_API_KEY}`).digest('hex');
const mac = v => createHmac('sha256', secret()).update(v).digest('base64url');
const sign = v => `${v}.${mac(v)}`;
function unsign(s) {
  const i = s?.lastIndexOf('.') ?? -1;
  if (i < 1) return null;
  const v = s.slice(0, i), a = Buffer.from(s.slice(i + 1)), b = Buffer.from(mac(v));
  return a.length === b.length && timingSafeEqual(a, b) ? v : null;
}
const sameText = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

// ---------- cookies ----------
function readCookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map(c => {
    const i = c.indexOf('=');
    try { return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]; } catch { return [c.slice(0, i), '']; }
  }));
}
function setCookie(res, name, value, maxAge) {
  const c = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${process.env.VERCEL ? '; Secure' : ''}`;
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(prev ? [].concat(prev) : []), c]);
}

// ---------- Redis (Upstash REST; Vercel's integration sets the KV_* names) ----------
const redisUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
async function redis(commands) {
  const r = await fetch(`${redisUrl()}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken()}` },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).map(x => x.result);
}

// ---------- visitor ----------
const today = () => new Date().toISOString().slice(0, 10);
const nextMidnightUTC = () => { const d = new Date(); d.setUTCHours(24, 0, 0, 0); return d.toISOString(); };
const clientIp = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
function visitorId(req, res) {
  let id = readCookies(req).slr_vid;
  if (!/^[0-9a-f-]{36}$/.test(id || '')) { id = randomUUID(); setCookie(res, 'slr_vid', id, YEAR); }
  return id;
}
const usageKeys = (req, res) => [`use:${today()}:v:${visitorId(req, res)}`, `use:${today()}:ip:${clientIp(req)}`];

function getPlan(req, res) {
  // Invited access used to be a year-long cookie; expire any left over from that version.
  if (readCookies(req).slr_access) setCookie(res, 'slr_access', '', 0);
  const [plan, expires] = (unsign(String(req.headers['x-access-token'] || '')) || '').split(':');
  return (plan === 'invited' || plan === 'pro') && +expires > Date.now() ? plan : 'free';
}

async function freeRemaining(req, res) {
  if (redisUrl()) {
    try {
      const [mine, ip] = await redis(usageKeys(req, res).map(k => ['GET', k]));
      return +ip >= IP_DAILY_LIMIT ? 0 : Math.max(0, FREE_DAILY_LIMIT - (+mine || 0));
    } catch (err) { console.error(err.message); }
  }
  const [day, count] = (unsign(readCookies(req).slr_use) || '').split(':');
  return Math.max(0, FREE_DAILY_LIMIT - (day === today() ? +count || 0 : 0));
}

// ---------- public API ----------

// { plan: 'free' | 'invited' | 'pro', limit, remaining, resetsAt } — limit/remaining are null when unlimited.
export async function getAccess(req, res) {
  const plan = getPlan(req, res);
  if (plan !== 'free') return { plan, limit: null, remaining: null, resetsAt: null };
  return { plan, limit: FREE_DAILY_LIMIT, remaining: await freeRemaining(req, res), resetsAt: nextMidnightUTC() };
}

// Count one successful rewrite against a free visitor's daily allowance.
export async function recordUse(req, res, access) {
  if (access.plan !== 'free') return access;
  const remaining = Math.max(0, access.remaining - 1);
  if (redisUrl()) {
    try {
      await redis(usageKeys(req, res).flatMap(k => [['INCR', k], ['EXPIRE', k, TWO_DAYS]]));
      return { ...access, remaining };
    } catch (err) { console.error(err.message); }
  }
  setCookie(res, 'slr_use', sign(`${today()}:${FREE_DAILY_LIMIT - remaining}`), TWO_DAYS);
  return { ...access, remaining };
}

// -> { status, body }. On success the body carries the signed access token for the page to keep.
export async function redeemInvite(req, res, code) {
  const expected = process.env.INVITE_CODE;
  if (!expected) {
    console.error('INVITE_CODE is not set.');
    return { status: 503, body: { error: "Invite codes aren't available right now. Try again later." } };
  }
  if (redisUrl()) {
    try {
      const key = `invite:${clientIp(req)}`;
      const [attempts] = await redis([['INCR', key], ['EXPIRE', key, 3600, 'NX']]);
      if (attempts > INVITE_ATTEMPTS_PER_HOUR) return { status: 429, body: { error: 'Too many attempts. Try again in an hour.' } };
    } catch (err) { console.error(err.message); }
  }
  const given = String(code ?? '').replace(/\s+/g, '');
  if (!given) return { status: 400, body: { error: 'Enter your invite code.' } };
  if (!sameText(given, expected.trim())) return { status: 400, body: { error: "That invite code isn't valid. Check it and try again." } };

  return {
    status: 200,
    body: {
      token: sign(`invited:${Date.now() + ACCESS_TTL_MS}`),
      usage: { plan: 'invited', limit: null, remaining: null, resetsAt: null },
    },
  };
}
