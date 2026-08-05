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

function extensionForMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

// Random, collision-safe filename — never trusts the browser's original
// filename (path traversal, weird characters, guessability).
export function randomPhotoFilename(mime) {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${rand}.${extensionForMime(mime)}`
}
