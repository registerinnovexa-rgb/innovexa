/**
 * Innovexa Hub — Shared API Helper
 * Uses /api/proxy (Vercel serverless) for GET requests to avoid CORS.
 * Uses no-cors direct POST for write operations.
 * Load as plain script: <script src="/js/api.js"></script>
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8PGXXPJTEzD8NpkBuC9uPkGxzo7KQWV8ITuIORyuCHwn5kY6l6_5-caz1Rji82ml1LA/exec';

// ── GET via server-side proxy ────────────────────────────────────
// Passes all query params through /api/proxy so the browser
// never directly touches GAS (avoids CORS block entirely).
async function gasGet(gasUrl) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);

  try {
    // Parse params from the GAS URL and forward them to our proxy
    const parsed  = new URL(gasUrl);
    const params  = new URLSearchParams(parsed.search);

    // Build proxy URL: /api/proxy?email=...  or  /api/proxy?action=count
    const proxyUrl = '/api/proxy?' + params.toString();

    const res  = await fetch(proxyUrl, { signal: ctrl.signal });
    clearTimeout(timer);
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (_) { throw new Error('Invalid response from server'); }

  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    // Fallback: direct fetch (works in development)
    try {
      const r2   = await fetch(gasUrl, { method: 'GET', redirect: 'follow' });
      const text = await r2.text();
      return JSON.parse(text);
    } catch (_) {
      throw err;
    }
  }
}

// ── POST direct (no-cors) ────────────────────────────────────────
async function gasPost(url, payload) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    await fetch(url, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify(payload),
      signal:  ctrl.signal,
    });
    clearTimeout(timer);
    return { success: true, message: 'Submitted successfully' };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  }
}

// ── Toast ────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = { success:'#10b981', error:'#ef4444', info:'#3b82f6' };
  const icons  = {
    success:'<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    error:  '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    info:   '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<span style="color:${colors[type]};flex-shrink:0">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.cssText += 'opacity:0;transform:translateX(20px);transition:all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
