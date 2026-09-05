async function apiGet(action, params = {}) {
  const url = new URL('/api/backend', window.location.origin);
  url.searchParams.append('action', action);
  for(const k in params) url.searchParams.append(k, params[k]);
  const res = await fetch(url);
  return await res.json();
}
async function apiWrite(action, payload) {
  const res = await fetch('/api/backend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });
  return await res.json();
}
