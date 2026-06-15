/**
 * Innovexa Labs — Shared API Helper
 * Routes all Google Apps Script requests through /api/proxy
 * to avoid browser CORS issues in production.
 */

// ── GAS Endpoint URLs ──────────────────────────────────────────
const SCRIPT_URL          = 'https://script.google.com/macros/s/AKfycbz8aEk5lKTRVab_3qmt5FQcCAgeDimQaAKJNbJJgQdK56h5ccucKpY_r40jokfHFxuDtQ/exec';
const EVENT_SCRIPT_URL    = SCRIPT_URL;
const EVENT_REG_SCRIPT_URL = SCRIPT_URL; // alias — all routes through single Code.gs now

// ── GET helper ─────────────────────────────────────────────────
async function gasGet(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch('/api/proxy?url=' + encodeURIComponent(url), { signal: ctrl.signal });
    const data = await r.json();
    if (data && data.error && typeof data.error === 'string' && data.error.includes('Non-JSON')) throw new Error(data.error);
    clearTimeout(timer);
    return data;
  } catch (e) {
    clearTimeout(timer);
    // Fallback: direct fetch (may work if GAS allows CORS)
    try {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), 10000);
      const r2 = await fetch(url, { redirect: 'follow', signal: ctrl2.signal });
      clearTimeout(t2);
      const text = await r2.text();
      const m = text.match(/\{[\s\S]*\}/);
      return JSON.parse(m ? m[0] : text);
    } catch (e2) {
      throw new Error('GAS fetch failed: ' + e.message);
    }
  }
}

// ── POST helper ────────────────────────────────────────────────
async function gasPost(url, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch('/api/proxy?url=' + encodeURIComponent(url), {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    const data = await r.json();
    clearTimeout(timer);
    return data;
  } catch (e) {
    clearTimeout(timer);
    // Fallback: fire-and-forget via no-cors (can't read response)
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
      return { success: true, message: 'Submitted (no-cors fallback)' };
    } catch (e2) {
      throw new Error('GAS POST failed: ' + e.message);
    }
  }
}

// Export for global use (non-module scripts)
window.gasGet = gasGet;
window.gasPost = gasPost;
window.SCRIPT_URL = SCRIPT_URL;
window.EVENT_SCRIPT_URL = EVENT_SCRIPT_URL;
window.EVENT_REG_SCRIPT_URL = EVENT_REG_SCRIPT_URL;
