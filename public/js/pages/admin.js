import { getState, toast, modal, closeModal, fmtDate } from '../app.js'
import { signOut } from '../auth.js'
import { getMembers, createMember, updateMember, deleteMember, getEvents, createEvent, updateEvent, deleteEvent, getPosts, createPost, updatePost, deletePost, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../db.js'

const TABS = [
  { id: 'admin', label: 'Dashboard', icon: '📊' },
  { id: 'admin-members', label: 'Members', icon: '👥' },
  { id: 'admin-events', label: 'Events', icon: '📅' },
  { id: 'admin-posts', label: 'Posts', icon: '📝' },
  { id: 'admin-announcements', label: 'Announcements', icon: '📢' },
]

export async function renderAdmin(app, tab = 'admin') {
  const { user, profile: prof } = getState()
  const p = prof || {}
  const init = (p.name || '?')[0].toUpperCase()

  app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <a class="sidebar-brand" href="#admin"><img src="/assets/logo.png" alt=""><span>Innovexa Hub</span></a>
      <div class="sidebar-section-label">Admin Panel</div>
      <ul class="sidebar-nav">
        ${TABS.map(t => `<li><a href="#${t.id}" class="${tab === t.id ? 'active' : ''}"><span class="nav-icon">${t.icon}</span>${t.label}</a></li>`).join('')}
        <li class="sidebar-divider"></li>
        <li><a href="#portal"><span class="nav-icon">👤</span>My Profile</a></li>
      </ul>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${init}</div>
          <div><div class="sidebar-user-name">${p.name || 'Admin'}</div><div class="sidebar-user-role">Admin</div></div>
        </div>
        <button class="btn btn-secondary btn-sm" style="width:100%" id="logout-btn">Logout</button>
      </div>
    </aside>
    <div class="main">
      <div class="topbar">
        <div style="font-weight:600;color:var(--primary-darker)">${tabTitle(tab)}</div>
        <div class="topbar-right"><div class="avatar avatar-sm">${init}</div>${p.name || 'Admin'}</div>
      </div>
      <div class="content" id="panel"></div>
      <div class="page-footer">&copy; ${new Date().getFullYear()} Innovexa Hub. All rights reserved.</div>
    </div>
  </div>`

  document.getElementById('logout-btn').onclick = () => signOut()
  const panel = document.getElementById('panel')

  switch (tab) {
    case 'admin': await renderDashboard(panel); break
    case 'admin-members': await renderMembersTab(panel); break
    case 'admin-events': await renderCrudTab(panel, 'events'); break
    case 'admin-posts': await renderCrudTab(panel, 'posts'); break
    case 'admin-announcements': await renderCrudTab(panel, 'announcements'); break
  }
}

function tabTitle(t) {
  const m = { admin:'Dashboard', 'admin-members':'Manage Members', 'admin-events':'Manage Events', 'admin-posts':'Manage Posts', 'admin-announcements':'Manage Announcements' }
  return m[t] || ''
}

// ═══════════ DASHBOARD ═══════════
async function renderDashboard(el) {
  let members=[], events=[], posts=[], announcements=[]
  try { [members, events, posts, announcements] = await Promise.all([getMembers(), getEvents(), getPosts(), getAnnouncements()]) } catch(e) {}
  el.innerHTML = `
  <div class="stats">
    <div class="stat"><div class="stat-icon members">👥</div><div><h3>${members.length}</h3><p>Members</p></div></div>
    <div class="stat"><div class="stat-icon events">📅</div><div><h3>${events.length}</h3><p>Events</p></div></div>
    <div class="stat"><div class="stat-icon posts">📝</div><div><h3>${posts.length}</h3><p>Posts</p></div></div>
    <div class="stat"><div class="stat-icon announcements">📢</div><div><h3>${announcements.length}</h3><p>Announcements</p></div></div>
  </div>
  <div class="grid">
    <div class="card"><div class="card-head"><div class="card-icon">📢</div><div><div class="card-title">Recent Announcements</div></div></div>
    <div class="card-body">${announcements.slice(0,3).map(a => `<div style="margin-bottom:8px"><strong>${a.title}</strong><br><span style="font-size:0.78rem;color:var(--text-muted)">${fmtDate(a.created_at)}</span></div>`).join('') || 'None'}</div></div>
    <div class="card"><div class="card-head"><div class="card-icon">📅</div><div><div class="card-title">Upcoming Events</div></div></div>
    <div class="card-body">${events.slice(0,3).map(e => `<div style="margin-bottom:8px"><strong>${e.title}</strong><br><span style="font-size:0.78rem;color:var(--text-muted)">${fmtDate(e.event_date)}</span></div>`).join('') || 'None'}</div></div>
  </div>`
}

// ═══════════ MEMBERS ═══════════
async function renderMembersTab(el) {
  let members = []; try { members = await getMembers() } catch(e) {}
  el.innerHTML = `
  <div class="table-wrap">
    <div class="table-top"><h3>Members (${members.length})</h3><button class="btn btn-primary btn-sm" id="add-member">+ Add Member</button></div>
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Ticket No</th><th>Joined</th><th>Role</th><th></th></tr></thead>
      <tbody>${members.map(m => `<tr>
        <td><strong>${m.name || '—'}</strong></td><td>${m.email || '—'}</td><td>${m.phone_number || '—'}</td>
        <td>${m.ticket_no || '—'}</td><td>${fmtDate(m.date_of_joining)}</td><td><span class="badge badge-${m.role==='admin'?'accent':'primary'}">${m.role}</span></td>
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm edit-m" data-id="${m.id}">Edit</button>
          <button class="btn btn-ghost btn-sm del-m" data-id="${m.id}" style="color:var(--error)">Del</button>
        </td></tr>`).join('')}</tbody>
    </table>
  </div>`

  document.getElementById('add-member')?.addEventListener('click', () => showMemberModal())
  el.querySelectorAll('.edit-m').forEach(b => b.onclick = () => showMemberModal(members.find(m => m.id === b.dataset.id)))
  el.querySelectorAll('.del-m').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this member?')) return
    try { await deleteMember(b.dataset.id); toast('Deleted', 'success'); renderMembersTab(el) } catch(e) { toast(e.message, 'error') }
  })
}

function showMemberModal(m = null) {
  const isEdit = !!m
  const body = `
    <div class="form-group"><label>Name</label><input id="m-name" value="${m?.name || ''}"></div>
    <div class="form-group"><label>Email</label><input type="email" id="m-email" value="${m?.email || ''}" ${isEdit?'disabled':''}></div>
    ${!isEdit ? '<div class="form-group"><label>Password</label><input id="m-pass" placeholder="Welcome@123"></div>' : ''}
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input id="m-phone" value="${m?.phone_number || ''}"></div>
      <div class="form-group"><label>Ticket No</label><input id="m-ticket" value="${m?.ticket_no || ''}"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Date of Joining</label><input type="date" id="m-doj" value="${m?.date_of_joining || ''}"></div>
      <div class="form-group"><label>Role</label><select id="m-role"><option value="member" ${m?.role==='member'?'selected':''}>Member</option><option value="admin" ${m?.role==='admin'?'selected':''}>Admin</option></select></div>
    </div>`
  const footer = `<button class="btn btn-secondary close-m">Cancel</button><button class="btn btn-primary" id="save-member">${isEdit ? 'Update' : 'Create'}</button>`
  const o = modal(isEdit ? 'Edit Member' : 'Add Member', body, footer)

  o.querySelector('#save-member').onclick = async () => {
    const data = {
      name: o.querySelector('#m-name').value,
      phone_number: o.querySelector('#m-phone').value,
      ticket_no: o.querySelector('#m-ticket').value,
      date_of_joining: o.querySelector('#m-doj').value,
      role: o.querySelector('#m-role').value,
    }
    try {
      if (isEdit) { await updateMember(m.id, data) }
      else { await createMember({ ...data, email: o.querySelector('#m-email').value, password: o.querySelector('#m-pass')?.value }) }
      toast(isEdit ? 'Updated!' : 'Created!', 'success')
      closeModal()
      const panel = document.getElementById('panel')
      await renderMembersTab(panel)
    } catch(e) { toast(e.message, 'error') }
  }
}

// ═══════════ GENERIC CRUD (Events / Posts / Announcements) ═══════════
async function renderCrudTab(el, type) {
  const cfg = {
    events: { get: getEvents, create: createEvent, update: updateEvent, del: deleteEvent, cols: ['title','event_date','location'], fields: [{k:'title',l:'Title',t:'text'},{k:'description',l:'Description',t:'textarea'},{k:'event_date',l:'Date',t:'datetime-local'},{k:'location',l:'Location',t:'text'}] },
    posts: { get: getPosts, create: createPost, update: updatePost, del: deletePost, cols: ['title','created_at'], fields: [{k:'title',l:'Title',t:'text'},{k:'content',l:'Content',t:'textarea'}] },
    announcements: { get: getAnnouncements, create: createAnnouncement, update: updateAnnouncement, del: deleteAnnouncement, cols: ['title','created_at'], fields: [{k:'title',l:'Title',t:'text'},{k:'content',l:'Content',t:'textarea'}] },
  }
  const c = cfg[type]
  let items = []; try { items = await c.get() } catch(e) {}
  const label = type.charAt(0).toUpperCase() + type.slice(1)

  el.innerHTML = `
  <div class="table-wrap">
    <div class="table-top"><h3>${label} (${items.length})</h3><button class="btn btn-primary btn-sm" id="add-item">+ Add</button></div>
    <table>
      <thead><tr>${c.cols.map(col => `<th>${col.replace('_',' ')}</th>`).join('')}<th></th></tr></thead>
      <tbody>${items.map(item => `<tr>
        ${c.cols.map(col => `<td>${col.includes('date') || col.includes('created') ? fmtDate(item[col]) : (item[col] || '—')}</td>`).join('')}
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm edit-i" data-id="${item.id}">Edit</button>
          <button class="btn btn-ghost btn-sm del-i" data-id="${item.id}" style="color:var(--error)">Del</button>
        </td></tr>`).join('')}</tbody>
    </table>
  </div>`

  document.getElementById('add-item')?.addEventListener('click', () => showCrudModal(c, type, el))
  el.querySelectorAll('.edit-i').forEach(b => b.onclick = () => showCrudModal(c, type, el, items.find(i => i.id === b.dataset.id)))
  el.querySelectorAll('.del-i').forEach(b => b.onclick = async () => {
    if (!confirm('Delete?')) return
    try { await c.del(b.dataset.id); toast('Deleted', 'success'); renderCrudTab(el, type) } catch(e) { toast(e.message, 'error') }
  })
}

function showCrudModal(c, type, el, item = null) {
  const isEdit = !!item
  const body = c.fields.map(f => {
    const val = item?.[f.k] || ''
    if (f.t === 'textarea') return `<div class="form-group"><label>${f.l}</label><textarea id="f-${f.k}">${val}</textarea></div>`
    return `<div class="form-group"><label>${f.l}</label><input type="${f.t}" id="f-${f.k}" value="${val}"></div>`
  }).join('')
  const footer = `<button class="btn btn-secondary close-m">Cancel</button><button class="btn btn-primary" id="save-item">${isEdit ? 'Update' : 'Create'}</button>`
  const o = modal(isEdit ? `Edit ${type}` : `Add ${type}`, body, footer)

  o.querySelector('#save-item').onclick = async () => {
    const data = {}
    c.fields.forEach(f => { data[f.k] = o.querySelector(`#f-${f.k}`).value })
    try {
      if (isEdit) await c.update(item.id, data); else await c.create(data)
      toast(isEdit ? 'Updated!' : 'Created!', 'success')
      closeModal(); renderCrudTab(el, type)
    } catch(e) { toast(e.message, 'error') }
  }
}
