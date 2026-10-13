// POST /api/admin/mahogany-video — Cloudflare Pages Function. Cloudflare-
// native rewrite of api/_lib/adminMahoganyVideo.js (formidable-based,
// Node-only — see functions/_lib/webUpload.js's header). Same validation,
// same `mahogany-seal-videos` Supabase Storage bucket, same response shape,
// same admin-only gate.
import { bridgeEnv } from '../../_lib/adapt.js'
import { readUploadedFile, uploadToSupabaseStorage, jsonResponse } from '../../_lib/webUpload.js'
import { requireBearerAdmin } from '../../_lib/webAuth.js'
import { MAX_VIDEO_BYTES, ALLOWED_VIDEO_MIME_TYPES, randomVideoFilename } from '../../_lib/shared.js'

const VIDEO_BUCKET = 'mahogany-seal-videos'

export async function onRequestPost(context) {
  bridgeEnv(context.env)

  const admin = await requireBearerAdmin(context.request)
  if (!admin) return jsonResponse({ ok: false, error: 'not authorized' }, 403)

  const result = await readUploadedFile(context.request, 'video', {
    maxBytes: MAX_VIDEO_BYTES,
    allowedMimeTypes: ALLOWED_VIDEO_MIME_TYPES,
    mimeErrorMessage: 'only MP4, WebM, or MOV videos are allowed',
  })
  if (!result.ok) return jsonResponse({ ok: false, error: result.error }, result.status)

  try {
    const filename = randomVideoFilename(result.mimetype)
    const url = await uploadToSupabaseStorage(VIDEO_BUCKET, filename, result.buffer, result.mimetype)
    console.log(`[admin] ${admin.email} uploaded a Mahogany Seal caricature video (${filename})`)
    return jsonResponse({ ok: true, url })
  } catch (err) {
    console.error('[admin] mahogany video upload failed:', err)
    return jsonResponse({ ok: false, error: 'could not upload video' }, 500)
  }
}
