// POST /api/invite { code } -> { usage } and an access cookie | { error }
import { redeemInvite } from './_lib/access.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }
  const { status, body } = await redeemInvite(req, res, (req.body || {}).code);
  return res.status(status).json(body);
}
