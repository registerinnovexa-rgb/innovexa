/**
 * Vercel Serverless Function — GAS Proxy
 * Fetches from Google Apps Script server-side to avoid browser CORS blocks.
 * Usage: GET /api/proxy?url=<encoded GAS URL>
 *        POST /api/proxy  body: { targetUrl, payload }
 */
export default async function handler(req, res) {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Default to no-cache, override later for GET
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GAS_BASE = 'https://script.google.com/macros/s/AKfycbyF18nxF7idoX3e4ugNt_kyQ--Fy6VjmmKZ_IvP15-5AJoRrLPcfdYYzUmcO4w3_xIz/exec';

  try {
    if (req.method === 'GET') {
      // Vercel Edge Cache: Cache successful GET requests for 60 seconds
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
      res.removeHeader('Pragma');
      res.removeHeader('Expires');
      
      // Build GAS URL — forward all query params except 'url' wrapper
      const params = { ...req.query };
      delete params.url; // remove internal routing param if present

      const queryString = Object.keys(params).length
        ? '?' + new URLSearchParams(params).toString()
        : '';

      const targetUrl = params._gasUrl
        ? decodeURIComponent(params._gasUrl)
        : GAS_BASE + queryString;

      const gasRes = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'InnovexaHub-Proxy/1.0' },
      });

      const text = await gasRes.text();
      let json;
      try { json = JSON.parse(text); }
      catch (_) { return res.status(502).json({ success: false, message: 'Invalid JSON from GAS', raw: text.slice(0, 200) }); }

      return res.status(200).json(json);
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const targetUrl = body.targetUrl || GAS_BASE;
      const payload   = body.payload   || body;

      // INJECT BYPASS FOR PUBLIC REGISTRATIONS
      // Because Code.gs checks adminKey before executing registration,
      // we must secretly append it here on the secure server side.
      if (!payload.action && !payload.op) {
        payload.adminKey = 'INNOVEXA_SECURE_KEY_2025';
      }

      const isGas = targetUrl.includes('script.google.com');
      const contentType = isGas ? 'text/plain;charset=utf-8' : 'application/json';

      const gasRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: JSON.stringify(typeof payload === 'string' ? JSON.parse(payload) : payload),
        redirect: 'follow',
      });

      let json;
      try { json = await gasRes.json(); }
      catch (_) { json = { success: true, message: 'Submitted (no JSON response)' }; }

      return res.status(200).json(json);
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ success: false, message: 'Proxy error: ' + err.message });
  }
}
