import { getState, toast, navigateTo, fmtDate, fmtTime } from '../app.js'
import { signOut } from '../auth.js'
import { getEvents, getAnnouncements, getPosts, getMessages, sendMessage } from '../db.js'
import { getFileUrl } from '../lib/pocketbase.js'

const TABS = [
  { id: 'portal', label: 'Profile', icon: '👤' },
  { id: 'portal-events', label: 'Events', icon: '📅' },
  { id: 'portal-posts', label: 'Posts', icon: '📝' },
  { id: 'portal-announcements', label: 'Announcements', icon: '📢' },
  { id: 'portal-documents', label: 'Documents', icon: '📜' },
  { id: 'portal-chat', label: 'Chat', icon: '💬' },
  { id: 'portal-contact', label: 'Contact', icon: '📞' },
]

export async function renderPortal(app, tab = 'portal') {
  const { user, profile: prof } = getState()
  const p = prof || {}
  const init = (p.name || user?.email || '?')[0].toUpperCase()
  const isAdmin = p.role === 'admin'

  app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <a class="sidebar-brand" href="#portal"><img src="/logo-icon.png" alt=""><span>Innovexa Labs</span></a>
      <ul class="sidebar-nav">
        ${TABS.map(t => `<li><a href="#${t.id}" class="${tab === t.id ? 'active' : ''}"><span class="nav-icon">${t.icon}</span>${t.label}</a></li>`).join('')}
        ${isAdmin ? `<li class="sidebar-divider"></li><li><a href="#admin"><span class="nav-icon">⚙️</span>Admin Panel</a></li>` : ''}
      </ul>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${init}</div>
          <div><div class="sidebar-user-name">${p.name || 'Member'}</div><div class="sidebar-user-role">${p.role || 'member'}</div></div>
        </div>
        <button class="btn btn-secondary btn-sm" style="width:100%" id="logout-btn">Logout</button>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <div style="font-weight:600;color:var(--primary-darker)">${tabTitle(tab)}</div>
        <div class="topbar-right"><div class="avatar avatar-sm">${init}</div>${p.name || user?.email}</div>
      </div>
      <div class="content" id="panel"></div>
      <div class="page-footer">&copy; ${new Date().getFullYear()} Innovexa Labs. All rights reserved.</div>
    </div>
  </div>`

  document.getElementById('logout-btn').onclick = () => signOut()

  const panel = document.getElementById('panel')
  switch (tab) {
    case 'portal': renderProfile(panel, p, user); break
    case 'portal-events': await renderEvents(panel); break
    case 'portal-posts': await renderPosts(panel); break
    case 'portal-announcements': await renderAnnouncements(panel); break
    case 'portal-documents': renderDocuments(panel, p); break
    case 'portal-chat': await renderChat(panel, user, p); break
    case 'portal-contact': renderContact(panel); break
  }
}

function tabTitle(t) {
  const map = { portal:'My Profile', 'portal-events':'Events', 'portal-posts':'Posts', 'portal-announcements':'Announcements', 'portal-documents':'My Documents', 'portal-chat':'Community Chat', 'portal-contact':'Contact' }
  return map[t] || ''
}

// ═══════════ PROFILE ═══════════
function renderProfile(el, p, u) {
  const init = (p.name || '?')[0].toUpperCase()
  el.innerHTML = `
  <div class="profile-card">
    <div class="profile-banner"><div class="profile-avatar">${init}</div></div>
    <div class="profile-body">
      <h2>${p.name || 'Member'}</h2><span class="badge badge-primary">${p.role || 'member'}</span>
      <div class="profile-grid">
        <div class="profile-field"><label>Email</label><span>${p.email || u?.email || '—'}</span></div>
        <div class="profile-field"><label>Phone</label><span>${p.phone_number || '—'}</span></div>
        <div class="profile-field"><label>Ticket No</label><span>${p.ticket_no || '—'}</span></div>
        <div class="profile-field"><label>Date of Joining</label><span>${fmtDate(p.date_of_joining)}</span></div>
      </div>
    </div>
  </div>`
}

// ═══════════ EVENTS ═══════════
async function renderEvents(el) {
  let items = []; try { items = await getEvents() } catch(e) {}
  el.innerHTML = items.length === 0
    ? '<div class="empty"><h3>No events yet</h3><p>Check back for upcoming events!</p></div>'
    : `<div class="grid">${items.map(e => `
      <div class="card">${e.image ? `<img src="${getFileUrl(e, e.image)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px 8px 0 0;">` : ''}<div class="card-head"><div class="card-icon">📅</div><div><div class="card-title">${e.title}</div><div class="card-meta">${fmtDate(e.event_date)}${e.location ? ` · 📍 ${e.location}` : ''}</div></div></div>
      <div class="card-body">${e.description || ''}</div></div>`).join('')}</div>`
}

// ═══════════ POSTS ═══════════
async function renderPosts(el) {
  let items = []; try { items = await getPosts() } catch(e) {}
  el.innerHTML = items.length === 0
    ? '<div class="empty"><h3>No posts yet</h3><p>Community posts will appear here.</p></div>'
    : `<div class="grid">${items.map(p => `
      <div class="card">${p.image ? `<img src="${getFileUrl(p, p.image)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px 8px 0 0;">` : ''}<div class="card-head"><div class="card-icon">📝</div><div><div class="card-title">${p.title}</div><div class="card-meta">${p.expand?.author?.name || 'Anonymous'} · ${fmtDate(p.created)}</div></div></div>
      <div class="card-body">${p.content || ''}</div></div>`).join('')}</div>`
}

// ═══════════ ANNOUNCEMENTS ═══════════
async function renderAnnouncements(el) {
  let items = []; try { items = await getAnnouncements() } catch(e) {}
  el.innerHTML = items.length === 0
    ? '<div class="empty"><h3>No announcements</h3><p>Stay tuned for updates!</p></div>'
    : `<div class="grid">${items.map(a => `
      <div class="card">${a.image ? `<img src="${getFileUrl(a, a.image)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px 8px 0 0;">` : ''}<div class="card-head"><div class="card-icon">📢</div><div><div class="card-title">${a.title}</div><div class="card-meta">${fmtDate(a.created)}</div></div></div>
      <div class="card-body">${a.content || ''}</div></div>`).join('')}</div>`
}

// ═══════════ CHAT ═══════════
async function renderChat(el, currentUser, prof) {
  el.innerHTML = `
  <div class="chat-box">
    <div class="chat-feed" id="chat-feed"><div class="spinner"></div></div>
    <form class="chat-bar" id="chat-form">
      <input type="text" id="chat-in" placeholder="Type a message..." required autocomplete="off">
      <button type="submit" class="btn btn-primary">Send</button>
    </form>
  </div>`

  const feed = document.getElementById('chat-feed')

  const addMsg = (m) => {
    const me = m.sender === currentUser.id
    const name = m.expand?.sender?.name || m.sender_name || 'Member'
    const adminBadge = m.expand?.sender?.role === 'admin' ? '<span class="chat-admin-badge">Admin</span>' : ''
    const atBottom = feed.scrollHeight - feed.clientHeight <= feed.scrollTop + 60
    const d = document.createElement('div')
    d.className = `chat-msg ${me ? 'me' : 'other'}`
    d.innerHTML = `${!me ? `<div class="chat-sender">${name} ${adminBadge}</div>` : ''}
      <div class="chat-bubble">${m.content}</div>
      <div class="chat-ts">${fmtTime(m.created)}</div>`
    feed.appendChild(d)
    if (atBottom || me) feed.scrollTop = feed.scrollHeight
  }

  try {
    const msgs = await getMessages(50)
    feed.innerHTML = ''
    if (msgs.length === 0) { feed.innerHTML = '<div class="empty">No messages yet. Start the conversation!</div>' }
    else { msgs.forEach(addMsg); feed.scrollTop = feed.scrollHeight }
  } catch (e) { feed.innerHTML = '<div class="empty">Could not load messages</div>' }

  document.getElementById('chat-form').onsubmit = async (e) => {
    e.preventDefault()
    const inp = document.getElementById('chat-in')
    const txt = inp.value.trim(); if (!txt) return
    inp.disabled = true
    try { await sendMessage(txt, currentUser.id); inp.value = '' }
    catch (err) { toast('Send failed', 'error') }
    finally { inp.disabled = false; inp.focus() }
  }
}

// ═══════════ CONTACT ═══════════
function renderContact(el) {
  el.innerHTML = `
  <div class="contact-card">
    <div class="contact-header">Get in Touch</div>
    <div class="contact-body">
      <div class="contact-row"><span class="contact-label">📧 Email ID:</span><span class="contact-value">contact@innovexahub.com</span></div>
      <div class="contact-row"><span class="contact-label">📞 Contact Number:</span><span class="contact-value">+91 98765 43210</span></div>
      <div class="contact-row"><span class="contact-label">📍 Address:</span><span class="contact-value">Innovexa Labs, Tech Park</span></div>
    </div>
  </div>`
}

// ═══════════ DOCUMENTS (NOC) ═══════════
function renderDocuments(el, p) {
  el.innerHTML = `
  <div class="card" style="max-width: 600px; margin: 0 auto; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
    <div class="card-head" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
      <div class="card-icon" style="background: rgba(99, 102, 241, 0.2); color: #818cf8;">🎓</div>
      <div>
        <div class="card-title" style="font-size: 1.25rem; font-weight: 700;">Permission Letter (NOC)</div>
        <div class="card-meta" style="color: var(--text-muted); font-size: 0.85rem;">Generate an official letter for your professor.</div>
      </div>
    </div>
    <div class="card-body" style="padding-top: 20px;">
      <form id="noc-form">
        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-muted);">Event Name</label>
          <input type="text" id="noc-event" class="form-control" placeholder="e.g. National Hackathon 2026" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; padding: 10px;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div class="form-group">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-muted);">Start Date</label>
            <input type="date" id="noc-start" class="form-control" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; padding: 10px;">
          </div>
          <div class="form-group">
            <label style="display: block; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-muted);">End Date</label>
            <input type="date" id="noc-end" class="form-control" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; padding: 10px;">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 24px;">
          <label style="display: block; font-size: 0.85rem; margin-bottom: 6px; color: var(--text-muted);">Reason / Note to Professor</label>
          <textarea id="noc-note" class="form-control" placeholder="Optional. e.g. Requesting permission for early leave." style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; padding: 10px; min-height: 80px; resize: vertical;"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 600; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #a855f7); border: none;">Generate NOC</button>
      </form>
    </div>
  </div>`

  document.getElementById('noc-form').onsubmit = async (e) => {
    e.preventDefault()
    const btn = e.target.querySelector('button')
    btn.disabled = true; btn.textContent = 'Generating...'
    
    // In a real scenario, this would use jspdf to create the document and download it,
    // or send a request to the DB to create a document request for the admin.
    import('../db.js').then(async ({ createDocument }) => {
      try {
        await createDocument({
          member: p.id,
          type: 'noc',
          status: 'pending',
          event_name: document.getElementById('noc-event').value,
          start_date: document.getElementById('noc-start').value,
          end_date: document.getElementById('noc-end').value || null,
          note: document.getElementById('noc-note').value
        })
        toast('NOC Request submitted to Admin.', 'success')
        e.target.reset()
      } catch (err) {
        toast('Failed to submit NOC request.', 'error')
      } finally {
        btn.disabled = false; btn.textContent = 'Generate NOC'
      }
    })
  }
}

