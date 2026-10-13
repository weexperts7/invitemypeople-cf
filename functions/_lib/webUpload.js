// Web-native replacement for formidable in the 4 file-upload routes
// (api/photos.js, api/_lib/partnerHandlers.js's uploadPartnerLogo/
// uploadPartnerInvitePhoto, api/_lib/adminMahoganyVideo.js). formidable
// parses multipart bodies off a Node IncomingMessage's raw socket stream,
// which doesn't exist on Cloudflare Workers — there's no Node net/http
// underneath a Pages Function. The Fetch API's `Request.formData()` does
// the exact same job natively on Workers (and is actually less code), so
// these 4 routes get a small Cloudflare-native rewrite instead of reusing
// their Node-only originals — everything else about them (validation
// rules, bucket names, public-URL shape, response JSON) stays identical.
import { getSupabase } from '../../api/_lib/supabase.js'

/**
 * Reads one uploaded file from a multipart/form-data request and validates
 * it against the same size/mime rules the formidable-based routes already
 * enforce (see src/utils/photoUpload.js / videoUpload.js for the actual
 * limits). Returns `{ ok: true, buffer, mimetype }` or `{ ok: false, status,
 * error }` — callers can always `if (!result.ok) return jsonResponse(...)`.
 */
export async function readUploadedFile(
  request,
  fieldName,
  { maxBytes, allowedMimeTypes, mimeErrorMessage = 'only JPEG, PNG, or WebP images are allowed' },
) {
  let formData
  try {
    formData = await request.formData()
  } catch {
    return { ok: false, status: 400, error: 'could not parse upload' }
  }

  const file = formData.get(fieldName)
  if (!file || typeof file === 'string') {
    return { ok: false, status: 400, error: 'no file uploaded' }
  }
  if (!allowedMimeTypes.includes(file.type)) {
    return { ok: false, status: 400, error: mimeErrorMessage }
  }
  if (file.size > maxBytes) {
    return { ok: false, status: 400, error: `file is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB)` }
  }

  const buffer = await file.arrayBuffer()
  return { ok: true, buffer, mimetype: file.type }
}

/** Uploads a buffer to a Supabase Storage bucket and returns its public URL — shared tail end of every upload route. */
export async function uploadToSupabaseStorage(bucket, filename, buffer, mimetype) {
  const supabase = getSupabase()
  const { error } = await supabase.storage.from(bucket).upload(filename, buffer, { contentType: mimetype, upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
