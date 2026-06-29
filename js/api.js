/**
 * Innovexa Hub — Shared API Helper
 * Direct fetch to Google Apps Script with CORS workaround.
 * Load as a plain script (NOT type="module"):
 *   <script src="/js/api.js"></script>
 */

// ── Backend URL ─────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8PGXXPJTEzD8NpkBuC9uPkGxzo7KQWV8ITuIORyuCHwn5kY6l6_5-caz1Rji82ml1LA/exec';

// ── GET helper ──────────────────────────────────────────────────
/**
 * Performs a GET request directly to Google Apps Script.
 * GAS returns JSON with redirect:follow to handle the 302.
 */
async function gasGet(url) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res  = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    clearTimeout(timer);
    const text = await res.text();
    try { return JSON.parse(text); }
    catch (_) { throw new Error('Non-JSON response from server'); }
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  }
}

// ── POST helper ─────────────────────────────────────────────────
/**
 * POST to GAS using no-cors (GAS doesn't send CORS headers on POST).
 * Response is always opaque — returns synthetic success.
 */
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

// ── Toast helper ────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };
  const icons  = {
    success: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    error:   '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    info:    '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
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

// ── HTML escape ─────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
