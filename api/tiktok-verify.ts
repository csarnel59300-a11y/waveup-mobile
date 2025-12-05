import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('tiktok-developers-site-verification=g4JvP1aihrNPrCeKlOXg6cCWy18UJGXI');
}
