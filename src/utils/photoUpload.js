// Shared validation for the Invitation Builder's photo uploads
// (POST /api/photos). MAX_PHOTOS/ALLOWED_MIME_TYPES are plain constants —
// reused client-side too (PhotoUploader.jsx, for the same limits/pre-check
// before a file ever reaches the server) as well as by the local-dev
// Express route (server/index.js) and its Vercel Serverless counterpart
// (api/photos.js). randomPhotoFilename() specifically is only ever called
// server-side.

// Comfortably under Vercel's ~4.5MB serverless function body limit.
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024
export const MAX_PHOTOS = 6
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Helper text for builder/SinglePhotoUploader.jsx, shared by every form that
// shows one (CreateInvitePage.jsx, PartnerCreateInvitePage.jsx,
// AdminCreateInvitePage.jsx).
export const PORTRAIT_HINT = 'Head and shoulders works best. Max 4MB.'
export const VENUE_PHOTO_HINT = "Shown on this event's card instead of the illustration. Max 4MB."

function extensionForMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

// Browser-side POST to /api/photos (or a partner override) — resolves to the
// file's public URL, throws with the server's own message on failure.
export async function uploadPhoto(file, { endpoint = '/api/photos', token } = {}) {
  const formData = new FormData()
  formData.append('photo', file)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })
  const result = await res.json().catch(() => null)
  if (!res.ok || !result?.ok) throw new Error(result?.error || 'Upload failed')
  return result.url
}

// Random, collision-safe filename — never trusts the browser's original
// filename (path traversal, weird characters, guessability).
export function randomPhotoFilename(mime) {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${rand}.${extensionForMime(mime)}`
}
