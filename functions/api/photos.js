// POST /api/photos — Cloudflare Pages Function. Cloudflare-native rewrite of
// api/photos.js (formidable-based, Node-only — see functions/_lib/
// webUpload.js's header for why). Same validation, same `invite-photos`
// Supabase Storage bucket, same response shape — only the multipart parsing
// changed, from formidable to the Fetch API's native request.formData().
import { bridgeEnv } from '../_lib/adapt.js'
import { readUploadedFile, uploadToSupabaseStorage, jsonResponse } from '../_lib/webUpload.js'
import { MAX_PHOTO_BYTES, ALLOWED_MIME_TYPES, randomPhotoFilename } from '../_lib/shared.js'

export async function onRequestPost(context) {
  bridgeEnv(context.env)

  const result = await readUploadedFile(context.request, 'photo', {
    maxBytes: MAX_PHOTO_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  })
  if (!result.ok) return jsonResponse({ ok: false, error: result.error }, result.status)

  try {
    const filename = randomPhotoFilename(result.mimetype)
    const url = await uploadToSupabaseStorage('invite-photos', filename, result.buffer, result.mimetype)
    return jsonResponse({ ok: true, url })
  } catch (err) {
    console.error('[photos] upload failed:', err)
    return jsonResponse({ ok: false, error: 'could not upload photo' }, 500)
  }
}
