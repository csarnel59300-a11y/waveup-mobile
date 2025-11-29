export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Conditions d\'Utilisation - WaveUp</title></head><body><h1>Conditions d\'Utilisation</h1><p>Conditions d\'utilisation de WaveUp.</p></body></html>';
  res.status(200).send(html);
}
