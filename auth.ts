import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  const clientId = process.env.TIKTOK_CLIENT_ID;
  const url = `https://www.tiktok.com/v2/auth/authorize?client_key=${clientId}&response_type=code&scope=user.info.basic&redirect_uri=${redirectUri}`;
  res.redirect(url);
}
