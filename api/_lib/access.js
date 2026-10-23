// Plans, daily free usage and invite codes.
// Signing in is optional. For signed-in users, usage and invited access live on their account (in
// Redis, keyed by Supabase user id) so they follow them across devices; invited access then lasts
// until they sign out or switch back to free. Anonymous visitors keep the tab-only invited pass: a
// signed token the page keeps in sessionStorage and sends as X-Access-Token, so it can't be forged
// and ends when the tab is closed.
// Free usage is counted in Upstash Redis when it's connected; otherwise in a signed cookie, which
// works with no setup but resets if the visitor clears cookies.
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { getUser } from './auth.js';

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
// Stored on an account when it redeems a code; changing INVITE_CODE makes old ones stop matching.
const inviteStamp = () => mac(`invite:${process.env.INVITE_CODE || ''}`);

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
// [this browser, this account (if signed in), this IP]. A signed-in user is charged on both the
// account and the browser, so signing in can't hand out a second set of free rewrites on one device.
const usageKeys = (req, res, user) => [
  `use:${today()}:v:${visitorId(req, res)}`,
  user ? `use:${today()}:u:${user.id}` : null,
  `use:${today()}:ip:${clientIp(req)}`,
].filter(Boolean);
const invitedKey = user => `acct:${user.id}:invited`;

async function getPlan(req, res, user) {
  // Invited access used to be a year-long cookie; expire any left over from that version.
  if (readCookies(req).slr_access) setCookie(res, 'slr_access', '', 0);
  if (user && redisUrl()) {
    try {
      const [stamp] = await redis([['GET', invitedKey(user)]]);
      if (stamp && stamp === inviteStamp()) return 'invited';
    } catch (err) { console.error(err.message); }
  }
  const [plan, expires] = (unsign(String(req.headers['x-access-token'] || '')) || '').split(':');
  return (plan === 'invited' || plan === 'pro') && +expires > Date.now() ? plan : 'free';
}

async function freeRemaining(req, res, user) {
  if (redisUrl()) {
    try {
      const counts = (await redis(usageKeys(req, res, user).map(k => ['GET', k]))).map(n => +n || 0);
      const ip = counts.pop();
      return ip >= IP_DAILY_LIMIT ? 0 : Math.max(0, FREE_DAILY_LIMIT - Math.max(...counts));
    } catch (err) { console.error(err.message); }
  }
  const [day, count] = (unsign(readCookies(req).slr_use) || '').split(':');
  return Math.max(0, FREE_DAILY_LIMIT - (day === today() ? +count || 0 : 0));
}

const accountOf = user => (user ? { email: user.email } : null);

// ---------- public API ----------

// { plan: 'free' | 'invited' | 'pro', limit, remaining, resetsAt, account } — limit/remaining are
// null when unlimited; account is { email } when signed in, otherwise null.
export async function getAccess(req, res) {
  const user = await getUser(req);
  const plan = await getPlan(req, res, user);
  const base = { plan, account: accountOf(user) };
  Object.defineProperty(base, 'user', { value: user }); // for recordUse; not sent to the browser
  if (plan !== 'free') return Object.assign(base, { limit: null, remaining: null, resetsAt: null });
  return Object.assign(base, { limit: FREE_DAILY_LIMIT, remaining: await freeRemaining(req, res, user), resetsAt: nextMidnightUTC() });
}

// Count one successful rewrite against a free visitor's daily allowance.
export async function recordUse(req, res, access) {
  if (access.plan !== 'free') return access;
  const used = { ...access, remaining: Math.max(0, access.remaining - 1) };
  if (redisUrl()) {
    try {
      await redis(usageKeys(req, res, access.user).flatMap(k => [['INCR', k], ['EXPIRE', k, TWO_DAYS]]));
      return used;
    } catch (err) { console.error(err.message); }
  }
  setCookie(res, 'slr_use', sign(`${today()}:${FREE_DAILY_LIMIT - used.remaining}`), TWO_DAYS);
  return used;
}

// -> { status, body }. Signed in: invited access is saved on the account (until sign-out or
// "Switch to free plan"). Anonymous, or no database: the body carries a tab-only signed token.
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

  const user = await getUser(req);
  const usage = { plan: 'invited', limit: null, remaining: null, resetsAt: null, account: accountOf(user) };
  if (user && redisUrl()) {
    try {
      await redis([['SET', invitedKey(user), inviteStamp()]]);
      return { status: 200, body: { saved: 'account', usage } };
    } catch (err) { console.error(err.message); }
  }
  return { status: 200, body: { saved: 'tab', token: sign(`invited:${Date.now() + ACCESS_TTL_MS}`), usage } };
}

// "Switch to free plan" and signing out: drop invited access saved on the account.
// (A tab-only pass is simply forgotten by the page.)
export async function leaveInvite(req, res) {
  const user = await getUser(req);
  if (user && redisUrl()) {
    try { await redis([['DEL', invitedKey(user)]]); } catch (err) { console.error(err.message); }
  }
}
