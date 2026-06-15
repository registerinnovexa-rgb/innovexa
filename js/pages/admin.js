import { getState, toast, modal, closeModal, fmtDate } from '../app.js'
import { signOut } from '../auth.js'
import { getMembers, createMember, updateMember, deleteMember, approveMember, getEvents, createEvent, updateEvent, deleteEvent, getPosts, createPost, updatePost, deletePost, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getPayments, updatePayment, getDocuments, createDocument, updateDocument } from '../db.js'

const TABS = [
  { id: 'admin', label: 'Dashboard', icon: '📊' },
  { id: 'admin-members', label: 'Members', icon: '👥' },
  { id: 'admin-credentials', label: 'Credentials', icon: '🔑' },
  { id: 'admin-payments', label: 'Payments', icon: '💳' },
  { id: 'admin-documents', label: 'Documents', icon: '📜' },
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
      <a class="sidebar-brand" href="#admin"><img src="/logo-icon.png" alt=""><span>Innovexa Labs</span></a>
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
      <div class="page-footer">&copy; ${new Date().getFullYear()} Innovexa Labs. All rights reserved.</div>
    </div>
  </div>`

  document.getElementById('logout-btn').onclick = () => signOut()
  const panel = document.getElementById('panel')

  switch (tab) {
    case 'admin': await renderDashboard(panel); break
    case 'admin-members': await renderMembersTab(panel); break
    case 'admin-credentials': await renderCredentialsTab(panel); break
    case 'admin-payments': await renderPaymentsTab(panel); break
    case 'admin-documents': await renderDocumentsTab(panel); break
    case 'admin-events': await renderCrudTab(panel, 'events'); break
    case 'admin-posts': await renderCrudTab(panel, 'posts'); break
    case 'admin-announcements': await renderCrudTab(panel, 'announcements'); break
  }
}

function tabTitle(t) {
  const m = { admin:'Dashboard', 'admin-members':'Manage Members', 'admin-credentials':'Member Credentials', 'admin-payments': 'Payment Approvals', 'admin-documents': 'Document Requests', 'admin-events':'Manage Events', 'admin-posts':'Manage Posts', 'admin-announcements':'Manage Announcements' }
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

// ═══════════ CREDENTIALS ═══════════
async function renderCredentialsTab(el) {
  let members = []; try { members = await getMembers() } catch(e) {}
  const { supabase } = await import('../lib/supabase.js')

  const bulkSQL = `-- Run this in Supabase SQL Editor to set all passwords to 'invxlabs'
UPDATE auth.users SET encrypted_password = crypt('invxlabs', gen_salt('bf')) WHERE id IN (
  SELECT id FROM auth.users
);`

  el.innerHTML = `
  <!-- Bulk Reset Banner -->
  <div style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <div style="display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap;">
      <div style="font-size: 2rem;">🔐</div>
      <div style="flex: 1; min-width: 280px;">
        <div style="font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 4px;">Set All Passwords to <code style="background: rgba(0,0,0,0.06); padding: 2px 8px; border-radius: 4px; font-size: 0.9rem;">invxlabs</code></div>
        <div style="color: var(--text-muted); font-size: 0.83rem; margin-bottom: 12px;">Paste the SQL below into your Supabase SQL Editor (Dashboard → SQL Editor → New Query). This sets every member's password to <strong>invxlabs</strong>.</div>
        <div style="position: relative;">
          <pre id="bulk-sql" style="background: #1e1e2e; color: #cdd6f4; padding: 14px 16px; border-radius: 8px; font-size: 0.78rem; font-family: 'JetBrains Mono', monospace; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">${bulkSQL}</pre>
          <button id="copy-sql" class="btn btn-sm" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.1); color: #cdd6f4; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 4px 10px; font-size: 0.72rem;">Copy</button>
        </div>
        <a href="https://supabase.com/dashboard/project/ekqxnwnqbcbwuvrqyqqd/sql/new" target="_blank" class="btn btn-sm" style="margin-top: 10px; background: #6366f1; color: white; border: none; display: inline-flex;">Open Supabase SQL Editor ↗</a>
      </div>
    </div>
  </div>

  <!-- Members Credentials Table -->
  <div class="table-wrap">
    <div class="table-top">
      <h3>Member Login Credentials (${members.length})</h3>
      <span style="font-size: 0.78rem; color: var(--text-muted);">Default: invxlabs · Send reset email per member below</span>
    </div>
    <table>
      <thead><tr>
        <th>Ticket ID</th><th>Name</th><th>Login Email</th><th>Role</th><th>Action</th>
      </tr></thead>
      <tbody>
        ${members.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted)">No members found.</td></tr>' :
        members.map(m => `<tr>
          <td><span style="font-family:'JetBrains Mono',monospace; font-size:0.85rem; font-weight:700; background:rgba(99,102,241,0.1); color:#6366f1; padding:3px 10px; border-radius:20px;">${m.ticket_no || '—'}</span></td>
          <td><strong>${m.name || '—'}</strong></td>
          <td><span style="font-family:'JetBrains Mono',monospace; font-size:0.8rem;">${m.email || '—'}</span></td>
          <td><span class="badge badge-${m.role === 'admin' ? 'accent' : 'primary'}">${m.role}</span></td>
          <td class="table-actions">
            <button class="btn btn-sm btn-ghost send-reset" data-email="${m.email}" data-name="${m.name || 'Member'}" style="font-size:0.78rem;">📧 Send Reset Email</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`

  // Copy SQL
  document.getElementById('copy-sql').onclick = () => {
    navigator.clipboard.writeText(bulkSQL).then(() => toast('SQL copied!', 'success'))
  }

  // Send reset emails
  el.querySelectorAll('.send-reset').forEach(btn => {
    btn.onclick = async () => {
      const email = btn.dataset.email
      const name = btn.dataset.name
      if (!email) { toast('No email for this member.', 'error'); return }
      if (!confirm(`Send password reset email to ${name} (${email})?`)) return
      btn.disabled = true; btn.textContent = 'Sending...'
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/portal.html`
        })
        if (error) throw error
        toast(`Reset email sent to ${name}!`, 'success')
        btn.textContent = '✅ Sent'
      } catch(e) {
        toast(e.message, 'error')
        btn.disabled = false; btn.textContent = '📧 Send Reset Email'
      }
    }
  })
}

// ═══════════ PAYMENTS ═══════════
async function renderPaymentsTab(el) {
  let payments = []; try { payments = await getPayments() } catch(e) {}
  
  const pending = payments.filter(p => p.status === 'pending')
  const approved = payments.filter(p => p.status === 'confirmed')
  
  el.innerHTML = `
  <div class="stats" style="margin-bottom: 24px;">
    <div class="stat" style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2);"><div class="stat-icon" style="background: rgba(234,179,8,0.2); color: #facc15;">⏳</div><div><h3 style="color: #facc15;">${pending.length}</h3><p style="color: var(--text-muted);">Pending</p></div></div>
    <div class="stat" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2);"><div class="stat-icon" style="background: rgba(34,197,94,0.2); color: #4ade80;">✅</div><div><h3 style="color: #4ade80;">${approved.length}</h3><p style="color: var(--text-muted);">Approved</p></div></div>
  </div>
  <div class="table-wrap" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px;">
    <div class="table-top" style="border-bottom: 1px solid rgba(255,255,255,0.05);"><h3>Recent Payment Submissions</h3></div>
    <table>
      <thead><tr><th>Date</th><th>Member Name</th><th>Email</th><th>Proof</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${payments.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 30px; color: var(--text-muted);">No payments found.</td></tr>' : 
        payments.map(p => `<tr>
        <td>${fmtDate(p.created_at)}</td>
        <td><strong>${p.profiles?.name || 'Unknown'}</strong></td>
        <td>${p.profiles?.email || '—'}</td>
        <td><a href="${p.proof_url || '#'}" target="_blank" style="color: var(--accent); text-decoration: underline;">View Receipt</a></td>
        <td><span class="badge" style="background: ${p.status === 'pending' ? 'rgba(234,179,8,0.2); color: #facc15' : p.status === 'rejected' ? 'rgba(239,68,68,0.2); color: #f87171' : 'rgba(34,197,94,0.2); color: #4ade80'}">${p.status.toUpperCase()}</span></td>
        <td class="table-actions">
          ${p.status === 'pending' ? `
            <button class="btn btn-primary btn-sm act-approve" data-id="${p.id}" data-member="${p.member_id}" style="background: #22c55e; border:none;">Approve</button>
            <button class="btn btn-secondary btn-sm act-reject" data-id="${p.id}" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">Reject</button>
          ` : '—'}
        </td></tr>`).join('')}
      </tbody>
    </table>
  </div>`

  el.querySelectorAll('.act-approve').forEach(b => b.onclick = async () => {
    if (!confirm('Approve this payment? The member will be confirmed.')) return
    try { 
      b.disabled = true; b.textContent = '...'
      await updatePayment(b.dataset.id, { status: 'confirmed' })
      await approveMember(b.dataset.member)
      toast('Payment Approved and Member Confirmed!', 'success')
      await renderPaymentsTab(el) 
    } catch(e) { toast(e.message, 'error') }
  })
  
  el.querySelectorAll('.act-reject').forEach(b => b.onclick = async () => {
    if (!confirm('Reject this payment?')) return
    try { 
      b.disabled = true; b.textContent = '...'
      await updatePayment(b.dataset.id, { status: 'rejected' })
      toast('Payment Rejected.', 'success')
      await renderPaymentsTab(el) 
    } catch(e) { toast(e.message, 'error') }
  })
}

// ═══════════ DOCUMENTS (NOC requests) ═══════════
async function renderDocumentsTab(el) {
  let docs = []; try { docs = await getDocuments() } catch(e) {}
  
  const pending = docs.filter(d => d.status === 'pending')
  
  el.innerHTML = `
  <div class="stats" style="margin-bottom: 24px;">
    <div class="stat" style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2);"><div class="stat-icon" style="background: rgba(99,102,241,0.2); color: #818cf8;">🎓</div><div><h3 style="color: #818cf8;">${pending.length}</h3><p style="color: var(--text-muted);">Pending NOC Requests</p></div></div>
  </div>
  <div class="table-wrap" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px;">
    <div class="table-top" style="border-bottom: 1px solid rgba(255,255,255,0.05);"><h3>NOC / Permission Letter Requests</h3></div>
    <table>
      <thead><tr><th>Date</th><th>Member Name</th><th>Event Name</th><th>Dates</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${docs.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding: 30px; color: var(--text-muted);">No document requests found.</td></tr>' : 
        docs.map(d => `<tr>
        <td>${fmtDate(d.created_at)}</td>
        <td><strong>${d.profiles?.name || 'Unknown'}</strong><br><span style="font-size:0.75rem;color:var(--text-muted)">${d.profiles?.ticket_no || ''}</span></td>
        <td>${d.event_name || '—'}</td>
        <td>${d.start_date || '—'} ${d.end_date ? 'to ' + d.end_date : ''}</td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${d.note || ''}">${d.note || '—'}</td>
        <td><span class="badge" style="background: ${d.status === 'pending' ? 'rgba(234,179,8,0.2); color: #facc15' : d.status === 'rejected' ? 'rgba(239,68,68,0.2); color: #f87171' : 'rgba(34,197,94,0.2); color: #4ade80'}">${d.status.toUpperCase()}</span></td>
        <td class="table-actions">
          ${d.status === 'pending' ? `
            <button class="btn btn-primary btn-sm act-gen" data-id="${d.id}" style="background: #6366f1; border:none;">Generate PDF</button>
            <button class="btn btn-secondary btn-sm act-rej-doc" data-id="${d.id}" style="color: #ef4444; border-color: rgba(239,68,68,0.3);">Reject</button>
          ` : '—'}
        </td></tr>`).join('')}
      </tbody>
    </table>
  </div>`

  el.querySelectorAll('.act-gen').forEach(b => b.onclick = async () => {
    // In a full implementation, this would trigger jsPDF, create the file, and mark it generated.
    try { 
      b.disabled = true; b.textContent = '...'
      await updateDocument(b.dataset.id, { status: 'generated' })
      toast('NOC PDF Generated! (Simulated)', 'success')
      await renderDocumentsTab(el) 
    } catch(e) { toast(e.message, 'error') }
  })
  
  el.querySelectorAll('.act-rej-doc').forEach(b => b.onclick = async () => {
    if (!confirm('Reject this document request?')) return
    try { 
      b.disabled = true; b.textContent = '...'
      await updateDocument(b.dataset.id, { status: 'rejected' })
      toast('Request Rejected.', 'success')
      await renderDocumentsTab(el) 
    } catch(e) { toast(e.message, 'error') }
  })
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
