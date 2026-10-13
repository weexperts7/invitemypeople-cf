// POST /api/partners/logo — Cloudflare Pages Function. Cloudflare-native
// rewrite of api/_lib/partnerHandlers.js's uploadPartnerLogo() (formidable-
// based, Node-only — see functions/_lib/webUpload.js's header). Same
// validation, same `partner-logos` Supabase Storage bucket, same response
// shape, same lack of auth (called from the signup form before any partner
// account/session exists — see the original handler's own comment).
import { bridgeEnv } from '../../_lib/adapt.js'
import { readUploadedFile, uploadToSupabaseStorage, jsonResponse } from '../../_lib/webUpload.js'

const MAX_LOGO_BYTES = 4 * 1024 * 1024
const ALLOWED_LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const LOGO_BUCKET = 'partner-logos'

function extensionForMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

function randomLogoFilename(mime) {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${rand}.${extensionForMime(mime)}`
}

export async function onRequestPost(context) {
  bridgeEnv(context.env)

  const result = await readUploadedFile(context.request, 'logo', {
    maxBytes: MAX_LOGO_BYTES,
    allowedMimeTypes: ALLOWED_LOGO_MIME_TYPES,
  })
  if (!result.ok) return jsonResponse({ ok: false, error: result.error }, result.status)

  try {
    const filename = randomLogoFilename(result.mimetype)
    const url = await uploadToSupabaseStorage(LOGO_BUCKET, filename, result.buffer, result.mimetype)
    return jsonResponse({ ok: true, url })
  } catch (err) {
    console.error('[partners] logo upload failed:', err)
    return jsonResponse({ ok: false, error: 'could not upload logo' }, 500)
  }
}
