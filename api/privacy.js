export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Politique de Confidentialité - WaveUp</title></head><body><h1>Politique de Confidentialité</h1><p>WaveUp respecte ta vie privée.</p></body></html>';
  res.status(200).send(html);
}
