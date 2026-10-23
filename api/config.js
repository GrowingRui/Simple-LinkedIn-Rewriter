// GET /api/config -> what the page needs to offer sign-in. The Supabase URL and publishable
// (anon) key are public by design; access is enforced by Supabase and by our own API checks.
import { authEnabled, supabaseKey, supabaseUrl } from './_lib/auth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json(authEnabled()
    ? { auth: { url: supabaseUrl(), key: supabaseKey() } }
    : { auth: null });
}
