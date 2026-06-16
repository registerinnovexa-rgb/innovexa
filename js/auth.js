import { pb } from './lib/pocketbase.js'

export async function signIn(email, password) {
  const authData = await pb.collection('members').authWithPassword(email, password)
  return authData
}

export async function signOut() {
  pb.authStore.clear()
}

export async function getSession() {
  if (pb.authStore.isValid) {
    return { user: pb.authStore.model }
  }
  try {
    pb.authStore.loadFromCookie(document.cookie || '')
  } catch {}
  return pb.authStore.isValid ? { user: pb.authStore.model } : null
}

export async function getUserProfile(id) {
  try {
    return await pb.collection('members').getOne(id)
  } catch {
    // If not authenticated, try without auth
    return await pb.collection('members').getOne(id)
  }
}

export function onAuthStateChange(cb) {
  pb.authStore.onChange((token, model) => {
    if (model) {
      cb('SIGNED_IN', { user: model })
    } else {
      cb('SIGNED_OUT', null)
    }
  }, true)
}
