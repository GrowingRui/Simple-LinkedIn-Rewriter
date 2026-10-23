// DELETE /api/account -> deletes the signed-in user's account -> { deleted: true } | { error }
// The caller proves who they are with their Supabase access token; the deletion itself needs the
// server-only SUPABASE_SECRET_KEY, which never reaches the browser.
import { forgetAccount } from './_lib/access.js';
import { deleteAuthUser, getUser, supabaseSecretKey } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Use DELETE.' });
  }
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in again, then delete your account.' });
  if (!supabaseSecretKey()) {
    console.error('SUPABASE_SECRET_KEY is not set.');
    return res.status(503).json({ error: "Deleting accounts isn't available right now. Email xiarui091@gmail.com and we'll delete it for you." });
  }
  if (!(await deleteAuthUser(user.id))) {
    return res.status(502).json({ error: "Couldn't delete the account. Try again in a minute." });
  }
  await forgetAccount(user);
  return res.status(200).json({ deleted: true });
}
