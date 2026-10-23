// Who is signed in? Reads the Supabase access token the page sends as "Authorization: Bearer ...".
// Tokens are verified locally against the project's published signing keys (JWKS), so most requests
// need no call to Supabase. Projects still on the legacy shared-secret (HS256) tokens fall back to
// asking Supabase directly. Signing in is optional: no token means an anonymous visitor.
import { createPublicKey, verify } from 'node:crypto';

export const supabaseUrl = () => (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
export const supabaseKey = () => process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const authEnabled = () => Boolean(supabaseUrl() && supabaseKey());

const b64json = s => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

let jwks = null, jwksAt = 0;
async function signingKeys() {
  if (!jwks || Date.now() - jwksAt > 60 * 60 * 1000) {
    try {
      const r = await fetch(`${supabaseUrl()}/auth/v1/.well-known/jwks.json`, { signal: AbortSignal.timeout(3000) });
      jwks = r.ok ? (await r.json()).keys || [] : [];
    } catch { jwks = jwks || []; }
    jwksAt = Date.now();
  }
  return jwks;
}

// Legacy-token fallback, cached briefly so one page load doesn't ask Supabase several times.
const remembered = new Map();
async function askSupabase(token) {
  const hit = remembered.get(token);
  if (hit && hit.until > Date.now()) return hit.user;
  const r = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: { apikey: supabaseKey(), Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(4000),
  });
  const user = r.ok ? await r.json() : null;
  if (remembered.size > 500) remembered.clear();
  remembered.set(token, { user, until: Date.now() + 60 * 1000 });
  return user;
}

// -> { id, email } for a valid signed-in user, otherwise null.
export async function getUser(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !authEnabled()) return null;
  try {
    const [h, p, sig] = token.split('.');
    if (!sig) return null;
    const header = b64json(h), claims = b64json(p);
    if (claims.role !== 'authenticated' || !claims.sub) return null;
    if (claims.iss !== `${supabaseUrl()}/auth/v1`) return null;
    if (!(claims.exp * 1000 > Date.now())) return null;

    if (header.alg === 'ES256' || header.alg === 'RS256') {
      const jwk = (await signingKeys()).find(k => k.kid === header.kid);
      if (!jwk) return null;
      const key = header.alg === 'ES256'
        ? { key: createPublicKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }
        : createPublicKey({ key: jwk, format: 'jwk' });
      const ok = verify('sha256', Buffer.from(`${h}.${p}`), key, Buffer.from(sig, 'base64url'));
      return ok ? { id: claims.sub, email: claims.email || '' } : null;
    }

    const user = await askSupabase(token); // HS256: only Supabase can check the signature
    return user?.id === claims.sub ? { id: user.id, email: user.email || '' } : null;
  } catch (err) {
    console.error('auth:', err.message);
    return null;
  }
}
