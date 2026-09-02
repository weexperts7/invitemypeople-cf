// Shared validation for the admin-only Mahogany Seal caricature video
// upload (POST /api/admin/mahogany-video) — mirrors photoUpload.js's own
// shape/role, just for the isolated `mahogany-seal-videos` Storage bucket
// (see 0014_admin_mahogany_caricature_video.sql) instead of invite-photos.
// Reused client-side too (MahoganyVideoUploader.jsx, for the same pre-check
// before a file ever reaches the server) as well as by the local-dev
// Express route (server/index.js) and its Vercel Serverless counterpart
// (api/admin/mahogany-video.js).

// Generous relative to a photo (4MB), but a short caricature clip is still
// comfortably under this — matches the bucket's own file_size_limit in the
// migration above, and stays well under Vercel Functions' request-body
// ceiling either way.
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

function extensionForVideoMime(mime) {
  if (mime === 'video/webm') return 'webm'
  if (mime === 'video/quicktime') return 'mov'
  return 'mp4'
}

// Random, collision-safe filename — never trusts the browser's original
// filename, same reasoning as photoUpload.js's randomPhotoFilename().
export function randomVideoFilename(mime) {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${rand}.${extensionForVideoMime(mime)}`
}
