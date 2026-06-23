import { getSession, onAuthStateChange, signOut, getUserProfile } from './auth.js'
import { supabase } from './lib/supabase.js'

let user = null
let profile = null
let page = 'login'
let announceSub = null

export async function initApp() {
  const session = await getSession()
  if (session) {
    user = session.user
    try { profile = await getUserProfile(user.id) } catch (e) { console.warn('No profile') }
    setupAnnouncementListener()
  }

  onAuthStateChange(async (ev, session) => {
    if (ev === 'SIGNED_IN' && session) {
      user = session.user
      try { profile = await getUserProfile(user.id) } catch (e) {}
      setupAnnouncementListener()
      navigateTo(profile?.role === 'admin' ? 'admin' : 'portal')
    } else if (ev === 'SIGNED_OUT') {
      user = null; profile = null
      if (announceSub) { supabase.removeChannel(announceSub); announceSub = null }
      navigateTo('login')
    }
  })

  window.addEventListener('hashchange', route)
  route()
}

function setupAnnouncementListener() {
  if (announceSub) return
  announceSub = supabase
    .channel('rt-announcements')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, p => {
      toast(`📢 New: ${p.new.title}`, 'info')
    })
    .subscribe()
}

export function getState() { return { user, profile, page } }
export function navigateTo(p) { window.location.hash = p }

async function route() {
  const hash = window.location.hash.slice(1) || 'login'
  page = hash
  const app = document.getElementById('app')
  app.innerHTML = '<div class="loading"><div class="spinner"></div></div>'

  if (user && hash === 'login') { navigateTo(profile?.role === 'admin' ? 'admin' : 'portal'); return }

  try {
    switch (hash) {
      case 'login': {
        const { renderLogin } = await import('./pages/login.js')
        renderLogin(app); break
      }
      case 'portal': case 'portal-events': case 'portal-posts':
      case 'portal-announcements': case 'portal-chat': case 'portal-contact': {
        if (!user) { navigateTo('login'); return }
        const { renderPortal } = await import('./pages/portal.js')
        renderPortal(app, hash); break
      }
      case 'admin': case 'admin-members': case 'admin-events':
      case 'admin-posts': case 'admin-announcements': {
        if (!user) { navigateTo('login'); return }
        const { renderAdmin } = await import('./pages/admin.js')
        renderAdmin(app, hash); break
      }
      default: navigateTo('login')
    }
  } catch (err) {
    console.error(err)
    app.innerHTML = `<div class="empty"><h3>Something went wrong</h3><p>${err.message}</p></div>`
  }
}

// ── Shared UI ──
export function toast(msg, type = 'info') {
  let c = document.querySelector('.toast-container')
  if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c) }
  const t = document.createElement('div')
  t.className = `toast ${type}`
  t.textContent = msg
  c.appendChild(t)
  setTimeout(() => t.remove(), 4000)
}

export function modal(title, body, footer = '') {
  const o = document.createElement('div')
  o.className = 'modal-overlay'
  o.innerHTML = `<div class="modal">
    <div class="modal-header"><h3>${title}</h3><button class="btn btn-ghost btn-icon close-m">&times;</button></div>
    <div class="modal-body">${body}</div>
    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
  </div>`
  document.body.appendChild(o)
  o.querySelector('.close-m').onclick = () => o.remove()
  o.addEventListener('click', e => { if (e.target === o) o.remove() })
  return o
}

export function closeModal() { document.querySelector('.modal-overlay')?.remove() }

export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

document.addEventListener('DOMContentLoaded', initApp)
