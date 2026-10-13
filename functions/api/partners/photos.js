// POST /api/partners/photos — Cloudflare Pages Function. Cloudflare-native
// rewrite of api/_lib/partnerHandlers.js's uploadPartnerInvitePhoto()
// (formidable-based, Node-only — see functions/_lib/webUpload.js's
// header). Same validation, same `partner-invite-photos` Supabase Storage
// bucket, same response shape — unlike logo.js, this one IS authenticated
// (only ever called from the logged-in dashboard's client-invite builder).
import { bridgeEnv } from '../../_lib/adapt.js'
import { readUploadedFile, uploadToSupabaseStorage, jsonResponse } from '../../_lib/webUpload.js'
import { requireBearerUser } from '../../_lib/webAuth.js'
import { MAX_PHOTO_BYTES, ALLOWED_MIME_TYPES, randomPhotoFilename } from '../../_lib/shared.js'

const INVITE_PHOTO_BUCKET = 'partner-invite-photos'

export async function onRequestPost(context) {
  bridgeEnv(context.env)

  const user = await requireBearerUser(context.request)
  if (!user) return jsonResponse({ ok: false, error: 'sign in required' }, 401)

  const result = await readUploadedFile(context.request, 'photo', {
    maxBytes: MAX_PHOTO_BYTES,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
  })
  if (!result.ok) return jsonResponse({ ok: false, error: result.error }, result.status)

  try {
    const filename = randomPhotoFilename(result.mimetype)
    const url = await uploadToSupabaseStorage(INVITE_PHOTO_BUCKET, filename, result.buffer, result.mimetype)
    return jsonResponse({ ok: true, url })
  } catch (err) {
    console.error('[partners] invite photo upload failed:', err)
    return jsonResponse({ ok: false, error: 'could not upload photo' }, 500)
  }
}
