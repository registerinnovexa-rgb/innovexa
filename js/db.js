import { pb, members, events, posts, announcements, payments, documents, messages } from './lib/pocketbase.js'

// ═══════════ PROFILES (members) ═══════════
export const getMembers = async () => {
  const data = await members.getAll()
  return data
}
export const getMember = async (id) => {
  return await members.getOne(id)
}
export const createMember = async (m) => {
  const authData = await members.createWithAuth({
    email: m.email,
    password: m.password || 'Welcome@123',
    passwordConfirm: m.password || 'Welcome@123',
    name: m.name,
    phone: m.phone,
    ticket_no: m.ticket_no,
    date_of_joining: m.date_of_joining || new Date().toISOString().split('T')[0],
    role: m.role || 'member',
    verified: true
  })
  return authData
}
export const updateMember = async (id, u) => {
  return await members.update(id, u)
}
export const deleteMember = async (id) => {
  return await members.delete(id)
}
export const approveMember = async (id) => {
  const { approveMember: approve } = await import('./lib/pocketbase.js')
  return await approve(id)
}

// ═══════════ EVENTS ═══════════
export const getEvents = async () => {
  return await events.getAll()
}
export const createEvent = async (e) => {
  return await events.create(e)
}
export const updateEvent = async (id, u) => {
  return await events.update(id, u)
}
export const deleteEvent = async (id) => {
  return await events.delete(id)
}

// ═══════════ POSTS ═══════════
export const getPosts = async () => {
  return await posts.getAll()
}
export const createPost = async (p) => {
  return await posts.create(p)
}
export const updatePost = async (id, u) => {
  return await posts.update(id, u)
}
export const deletePost = async (id) => {
  return await posts.delete(id)
}

// ═══════════ ANNOUNCEMENTS ═══════════
export const getAnnouncements = async () => {
  return await announcements.getAll()
}
export const createAnnouncement = async (a) => {
  return await announcements.create(a)
}
export const updateAnnouncement = async (id, u) => {
  return await announcements.update(id, u)
}
export const deleteAnnouncement = async (id) => {
  return await announcements.delete(id)
}

// ═══════════ MESSAGES ═══════════
export const getMessages = async (limit = 50) => {
  const { items } = await messages.getAll(limit)
  return (items || []).reverse()
}
export const sendMessage = async (content, senderId) => {
  return await messages.send(content, senderId)
}

// ═══════════ PAYMENTS ═══════════
export const getPayments = async () => {
  return await payments.getAll()
}
export const updatePayment = async (id, updates) => {
  return await payments.update(id, updates)
}

// ═══════════ DOCUMENTS ═══════════
export const getDocuments = async () => {
  return await documents.getAll()
}
export const createDocument = async (doc) => {
  return await documents.create(doc)
}
export const updateDocument = async (id, updates) => {
  return await documents.update(id, updates)
}
