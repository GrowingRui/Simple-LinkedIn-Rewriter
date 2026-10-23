// POST /api/invite { code } -> { usage, saved: 'account' | 'tab', token? } | { error }
// DELETE /api/invite -> drops invited access saved on the signed-in account -> { usage }
import { getAccess, leaveInvite, redeemInvite } from './_lib/access.js';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    await leaveInvite(req, res);
    return res.status(200).json({ usage: await getAccess(req, res) });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, DELETE');
    return res.status(405).json({ error: 'Use POST.' });
  }
  const { status, body } = await redeemInvite(req, res, (req.body || {}).code);
  return res.status(status).json(body);
}
