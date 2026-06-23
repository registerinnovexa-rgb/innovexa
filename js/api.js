/**
 * Innovexa Hub — Shared API Helper
 * Routes all Google Apps Script requests through /api/proxy
 * to avoid browser CORS issues in production.
 */

// ── GAS Endpoint URLs ──────────────────────────────────────────
const SCRIPT_URL           = 'https://script.google.com/macros/s/AKfycbw8PGXXPJTEzD8NpkBuC9uPkGxzo7KQWV8ITuIORyuCHwn5kY6l6_5-caz1Rji82ml1LA/exec';
const EVENT_SCRIPT_URL     = SCRIPT_URL;
const EVENT_REG_SCRIPT_URL = SCRIPT_URL;

// ── GET helper ──────────────────────────────────────────────────
async function gasGet(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
    const r = await fetch(proxyUrl, { signal: ctrl.signal });
    clearTimeout(timer);
    return await r.json();
  } catch (err) {
    clearTimeout(timer);
    // Fallback: direct fetch (for dev / non-proxied environments)
    try {
      const r2 = await fetch(url, { method: 'GET', redirect: 'follow' });
      const text = await r2.text();
      return JSON.parse(text);
    } catch (e) {
      throw err;
    }
  }
}

// ── POST helper ─────────────────────────────────────────────────
async function gasPost(url, payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    // Try proxy first
    const proxyUrl = '/api/proxy';
    const r = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: url, payload }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return await r.json();
  } catch (err) {
    clearTimeout(timer);
    // Fallback: direct no-cors POST (data goes through, response is opaque)
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      return { success: true, message: 'Submitted (no-cors fallback)' };
    } catch (e) {
      throw err;
    }
  }
}
