// Vercel Serverless Function — api/proxy (source file)
// Uses native fetch (Node 18+) — handles GAS redirects automatically

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawUrl = req.query.url || req.query.target;
  if (!rawUrl) return res.status(400).json({ error: 'Missing ?url= parameter' });

  const targetUrl = decodeURIComponent(rawUrl);
  if (!targetUrl.startsWith('https://script.google.com/macros/')) {
    return res.status(403).json({ error: 'Only Google Apps Script URLs allowed' });
  }

  try {
    const isPost = req.method === 'POST';
    const opts = {
      method:   isPost ? 'POST' : 'GET',
      redirect: 'follow',
      headers:  { 'Content-Type': 'text/plain', 'Accept': 'application/json, text/plain, */*' },
    };

    if (isPost) {
      opts.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const gasRes = await fetch(targetUrl, opts);
    const text   = await gasRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        data = JSON.parse(m[0]);
      } else {
        return res.status(502).json({ error: 'GAS returned non-JSON', raw: text.slice(0, 300) });
      }
    }

    res.setHeader('Cache-Control', isPost ? 'no-store' : 's-maxage=15, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
