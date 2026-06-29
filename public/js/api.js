/**
 * Innovexa Hub — Shared API Helper
 * Provides SCRIPT_URL constant and gasGet/gasPost helpers
 * used by all pages to communicate with the Google Apps Script backend.
 *
 * Load as a plain script (NOT type="module"):
 *   <script src="/js/api.js"></script>
 */

// ── Backend URL ─────────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8PGXXPJTEzD8NpkBuC9uPkGxzo7KQWV8ITuIORyuCHwn5kY6l6_5-caz1Rji82ml1LA/exec';

// ── GET helper ──────────────────────────────────────────────────
/**
 * Performs a GET request to a Google Apps Script URL.
 * Tries the Vercel proxy first (/api/proxy) to avoid CORS issues,
 * then falls back to a direct fetch with redirect:follow.
 * @param {string} url - Full URL including query params
 * @returns {Promise<object>} Parsed JSON response
 */
async function gasGet(url) {
  const TIMEOUT_MS = 18000;

  // Helper: fetch with timeout
  const fetchWithTimeout = (fetchUrl, opts = {}) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    return fetch(fetchUrl, { ...opts, signal: ctrl.signal })
      .finally(() => clearTimeout(timer));
  };

  // 1. Try Vercel proxy (avoids CORS in production)
  try {
    const proxyUrl = '/api/proxy?url=' + encodeURIComponent(url);
    const res = await fetchWithTimeout(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.__proxy_error) return data;
    }
  } catch (_) { /* fall through to direct */ }

  // 2. Direct fetch fallback (works in dev, CORS-allowed origins)
  const res = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' });
  const text = await res.text();
  try { return JSON.parse(text); } catch (_) { throw new Error('Non-JSON response: ' + text.slice(0, 100)); }
}

// ── POST helper ─────────────────────────────────────────────────
/**
 * Performs a POST request to a Google Apps Script URL.
 * Uses no-cors mode (GAS doesn't send CORS headers on POST),
 * so the response is always opaque — we return a synthetic success.
 * For real response, use gasGet with action params on doGet.
 * @param {string} url - Script URL
 * @param {object} payload - Data to POST as JSON
 * @returns {Promise<{success:boolean, message:string}>}
 */
async function gasPost(url, payload) {
  const TIMEOUT_MS = 25000;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
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
/**
 * Show a toast notification.
 * Requires #toast-container in the DOM.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>',
    error:   '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    info:    '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  };
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' };

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<span style="color:${colors[type]};flex-shrink:0">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Sanitize ────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
