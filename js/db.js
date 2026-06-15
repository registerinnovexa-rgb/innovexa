import { supabase } from './lib/supabase.js'

// ═══════════ PROFILES ═══════════
export const getMembers = async () => {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error; return data || []
}
export const getMember = async (id) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) throw error; return data
}
export const createMember = async (m) => {
  const { data: auth, error: ae } = await supabase.auth.signUp({
    email: m.email, password: m.password || 'Welcome@123',
    options: { data: { name: m.name } }
  })
  if (ae) throw ae
  const { data, error } = await supabase.from('profiles').upsert({
    id: auth.user.id, name: m.name, email: m.email,
    phone_number: m.phone_number, ticket_no: m.ticket_no,
    date_of_joining: m.date_of_joining || new Date().toISOString().split('T')[0],
    role: m.role || 'member'
  }).select()
  if (error) throw error; return data
}
export const updateMember = async (id, u) => {
  const { data, error } = await supabase.from('profiles').update(u).eq('id', id).select()
  if (error) throw error; return data
}
export const deleteMember = async (id) => {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}
export const approveMember = async (id) => {
  const { data: member, error: mErr } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (mErr) throw mErr
  
  let ticket_no = member.ticket_no
  if (!ticket_no || ticket_no.toUpperCase() === 'PENDING') {
    const { data: allMembers } = await supabase.from('profiles').select('ticket_no')
    let maxNum = 0
    if (allMembers) {
      allMembers.forEach(m => {
        if (m.ticket_no && m.ticket_no.toUpperCase().startsWith('INVX-')) {
          const num = parseInt(m.ticket_no.split('-')[1])
          if (!isNaN(num) && num > maxNum) maxNum = num
        }
      })
    }
    ticket_no = `INVX-${String(maxNum + 1).padStart(2, '0')}`
  }

  const { error } = await supabase.from('profiles').update({ role: 'member', ticket_no }).eq('id', id)
  if (error) throw error
}

// ═══════════ EVENTS ═══════════
export const getEvents = async () => {
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })
  if (error) throw error; return data || []
}
export const createEvent = async (e) => {
  const { data, error } = await supabase.from('events').insert(e).select()
  if (error) throw error; return data
}
export const updateEvent = async (id, u) => {
  const { data, error } = await supabase.from('events').update(u).eq('id', id).select()
  if (error) throw error; return data
}
export const deleteEvent = async (id) => {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

// ═══════════ POSTS ═══════════
export const getPosts = async () => {
  const { data, error } = await supabase.from('posts').select('*, profiles(name)').order('created_at', { ascending: false })
  if (error) throw error; return data || []
}
export const createPost = async (p) => {
  const { data, error } = await supabase.from('posts').insert(p).select()
  if (error) throw error; return data
}
export const updatePost = async (id, u) => {
  const { data, error } = await supabase.from('posts').update(u).eq('id', id).select()
  if (error) throw error; return data
}
export const deletePost = async (id) => {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

// ═══════════ ANNOUNCEMENTS ═══════════
export const getAnnouncements = async () => {
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
  if (error) throw error; return data || []
}
export const createAnnouncement = async (a) => {
  const { data, error } = await supabase.from('announcements').insert(a).select()
  if (error) throw error; return data
}
export const updateAnnouncement = async (id, u) => {
  const { data, error } = await supabase.from('announcements').update(u).eq('id', id).select()
  if (error) throw error; return data
}
export const deleteAnnouncement = async (id) => {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}

// ═══════════ MESSAGES ═══════════
export const getMessages = async (limit = 50) => {
  const { data, error } = await supabase.from('messages')
    .select('*, profiles(name, role)').order('created_at', { ascending: false }).limit(limit)
  if (error) throw error; return (data || []).reverse()
}
export const sendMessage = async (content, senderId) => {
  const { data, error } = await supabase.from('messages').insert({ content, sender_id: senderId }).select()
  if (error) throw error; return data[0]
}

// ═══════════ PAYMENTS ═══════════
export const getPayments = async () => {
  const { data, error } = await supabase.from('payments').select('*, profiles(name, email, ticket_no)').order('created_at', { ascending: false })
  if (error) throw error; return data || []
}
export const updatePayment = async (id, updates) => {
  const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select()
  if (error) throw error; return data
}

// ═══════════ DOCUMENTS ═══════════
export const getDocuments = async () => {
  const { data, error } = await supabase.from('documents').select('*, profiles(name, ticket_no)').order('created_at', { ascending: false })
  if (error) throw error; return data || []
}
export const createDocument = async (doc) => {
  const { data, error } = await supabase.from('documents').insert(doc).select()
  if (error) throw error; return data
}
export const updateDocument = async (id, updates) => {
  const { data, error } = await supabase.from('documents').update(updates).eq('id', id).select()
  if (error) throw error; return data
}
