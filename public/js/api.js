/**
 * Innovexa Hub — Shared API Helper
 * Stale-While-Revalidate cache: returns localStorage data instantly,
 * then refreshes in background. Tab switches and reloads feel instant.
 */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4Hlin3j3YGZxIwOqyK4TBkqpcvkuvlQQ588d01OJGysIAUc--L2yknL9i58Qx4g4LyQ/exec';

// ── Cache layer ──────────────────────────────────────────────────
const _gc    = {};          // in-memory cache { url: { data, ts } }
const _gInfl = {};          // in-flight dedup { url: Promise }
const G_TTL  = 30000;       // 30s fresh window
const G_STALE = G_TTL * 10; // 5min stale window (show instantly, refresh bg)
const G_NS   = 'invx_gc_';  // localStorage namespace

function _gLoad(k) {
  try { const r = localStorage.getItem(G_NS+k); return r ? JSON.parse(r) : null; } catch(_) { return null; }
}
function _gSave(k, e) {
  try { localStorage.setItem(G_NS+k, JSON.stringify(e)); } catch(_) {}
}
async function _gFetch(gasUrl) {
  let proxyUrl;
  if (gasUrl && gasUrl.includes('?')) {
    const qIndex = gasUrl.indexOf('?');
    proxyUrl = '/api/proxy' + gasUrl.substring(qIndex);
  } else {
    proxyUrl = '/api/proxy?url=' + encodeURIComponent(gasUrl);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 40000);
  try {
    const r = await fetch(proxyUrl, { method: 'GET', signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    return await r.json();
  } catch (err) {
    clearTimeout(timer);
    // Fallback: direct fetch
    try {
      const r2 = await fetch(gasUrl, { method: 'GET', redirect: 'follow' });
      return await r2.json();
    } catch(e) { throw err; }
  }
}

// ── GET via server-side proxy with SWR cache ─────────────────────
async function gasGet(gasUrl, { forceRefresh = false } = {}) {
  const key = gasUrl.replace(/[&?]_t=\d+/g, ''); // strip timestamp for stable key
  const now = Date.now();

  // 1. Memory cache — instant
  if (!forceRefresh && _gc[key] && (now - _gc[key].ts) < G_TTL) {
    return _gc[key].data;
  }

  // 2. localStorage cache — instant + background refresh
  const stored = _gLoad(key);
  if (!forceRefresh && stored && (now - stored.ts) < G_STALE) {
    _gc[key] = stored;
    // Refresh in background silently
    if (!_gInfl[key]) {
      _gInfl[key] = _gFetch(gasUrl).then(data => {
        const e = { data, ts: Date.now() };
        _gc[key] = e; _gSave(key, e); delete _gInfl[key];
      }).catch(() => { delete _gInfl[key]; });
    }
    return stored.data;
  }

  // 3. Deduplicate concurrent requests for same URL
  if (_gInfl[key]) return _gInfl[key];

  _gInfl[key] = _gFetch(gasUrl).then(data => {
    const e = { data, ts: Date.now() };
    _gc[key] = e; _gSave(key, e); delete _gInfl[key]; return data;
  }).catch(err => { delete _gInfl[key]; throw err; });

  return _gInfl[key];
}

// Call after writes to bust cache for a URL pattern
function invalidateGasCache(urlPattern) {
  Object.keys(_gc).forEach(k => { if (k.includes(urlPattern)) delete _gc[k]; });
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(G_NS) && k.includes(urlPattern)) localStorage.removeItem(k);
    });
  } catch(_) {}
}

// ── POST direct or proxy ────────────────────────────────────────
async function gasPost(url, payload) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 40000);
  try {
    const r2 = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: url, payload }),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return await r2.json();
  } catch (err) {
    clearTimeout(timer);
    try {
      await fetch(url, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body:    JSON.stringify(payload),
      });
      return { success: true, message: 'Submitted successfully (no-cors)' };
    } catch (e) { throw err; }
  }
}

// Export for global use
window.gasGet = gasGet;
window.gasPost = gasPost;
window.invalidateGasCache = invalidateGasCache;
window.SCRIPT_URL = SCRIPT_URL;

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
