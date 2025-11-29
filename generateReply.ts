import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const message = req.body?.message || 'Salut, j’adore ton contenu !';
  const tone = req.body?.tone || 'gentil et professionnel';
  const prompt = `Réponds à ce message TikTok : "${message}" avec un ton ${tone}`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  res.status(200).json(data);
}
