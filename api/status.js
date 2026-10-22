// GET /api/status -> { plan, limit, remaining, resetsAt }
import { getAccess } from './_lib/access.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(await getAccess(req, res));
}
