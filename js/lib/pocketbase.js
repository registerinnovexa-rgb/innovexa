import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://localhost:8090')

export async function registerMember(data) {
  const record = await pb.collection('members').create({
    email: data.email,
    name: data.fullName,
    phone: data.phone,
    year: data.year,
    branch: data.branch,
    skill_level: data.skillLevel,
    dob: data.dob,
    interests: data.interests,
    directory_opt_in: data.directoryOptIn,
    role: 'pending',
    date_of_joining: new Date().toISOString().split('T')[0]
  })

  if (data.photoFile) {
    const formData = new FormData()
    formData.append('avatar', data.photoFile)
    await pb.collection('members').update(record.id, formData)
  }

  return record
}

export async function requestMagicLink(email) {
  return pb.collection('members').requestPasswordReset(email)
}

export async function login(email, password) {
  return pb.collection('members').authWithPassword(email, password)
}

export function getAuth() {
  return pb.authStore.model
}

export function isAuthenticated() {
  return pb.authStore.isValid
}

export function logout() {
  pb.authStore.clear()
}

export function getFileUrl(record, filename) {
  return pb.files.getURL(record, filename)
}

export const payments = {
  create: (data) => pb.collection('payments').create(data),
  update: (id, data) => pb.collection('payments').update(id, data),
  getByMember: (memberId) => pb.collection('payments').getFullList({
    filter: `member = "${memberId}"`,
    sort: '-created'
  }),
  getAll: () => pb.collection('payments').getFullList({
    sort: '-created',
    expand: 'member'
  })
}

export const documents = {
  create: (data) => pb.collection('documents').create(data),
  update: (id, data) => pb.collection('documents').update(id, data),
  getByMember: (memberId) => pb.collection('documents').getFullList({
    filter: `member = "${memberId}"`,
    sort: '-created'
  }),
  getAll: () => pb.collection('documents').getFullList({
    sort: '-created',
    expand: 'member'
  })
}

export async function approveMember(memberId) {
  const allMembers = await pb.collection('members').getFullList()
  let maxNum = 0
  allMembers.forEach(m => {
    if (m.ticket_no?.startsWith('INVX-')) {
      const num = parseInt(m.ticket_no.split('-')[1])
      if (!isNaN(num) && num > maxNum) maxNum = num
    }
  })
  const ticket_no = `INVX-${String(maxNum + 1).padStart(2, '0')}`
  return pb.collection('members').update(memberId, { role: 'member', ticket_no })
}

// ═══════════ MEMBERS ═══════════
export const members = {
  getAll: () => pb.collection('members').getFullList({ sort: '-created' }),
  getOne: (id) => pb.collection('members').getOne(id),
  update: (id, data) => pb.collection('members').update(id, data),
  delete: (id) => pb.collection('members').delete(id),
  createWithAuth: (data) => pb.collection('members').create(data),
}

// ═══════════ EVENTS ═══════════
export const events = {
  getAll: () => pb.collection('events').getFullList({ sort: 'event_date' }),
  create: (data) => pb.collection('events').create(data),
  update: (id, data) => pb.collection('events').update(id, data),
  delete: (id) => pb.collection('events').delete(id),
}

// ═══════════ POSTS ═══════════
export const posts = {
  getAll: () => pb.collection('posts').getFullList({ sort: '-created', expand: 'author' }),
  create: (data) => pb.collection('posts').create(data),
  update: (id, data) => pb.collection('posts').update(id, data),
  delete: (id) => pb.collection('posts').delete(id),
}

// ═══════════ ANNOUNCEMENTS ═══════════
export const announcements = {
  getAll: () => pb.collection('announcements').getFullList({ sort: '-created' }),
  create: (data) => pb.collection('announcements').create(data),
  update: (id, data) => pb.collection('announcements').update(id, data),
  delete: (id) => pb.collection('announcements').delete(id),
}

// ═══════════ MESSAGES (history only, no realtime) ═══════════
export const messages = {
  getAll: (limit = 50) => pb.collection('messages').getList(1, limit, { sort: '-created', expand: 'sender' }),
  send: (content, senderId) => pb.collection('messages').create({ content, sender: senderId }),
}