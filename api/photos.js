// POST /api/photos — a Vercel Serverless Function. Production counterpart
// to the local-dev POST /api/photos route in server/index.js. Parses a
// single uploaded image and stores it in the `invite-photos` Supabase
// Storage bucket (see INVITES-SETUP.md for the one-time bucket setup) — see
// src/pages/CreateInvitePage.jsx for the caller.
import formidable from 'formidable'
import fs from 'node:fs/promises'
import { getSupabase } from './_lib/supabase.js'
import { MAX_PHOTO_BYTES, ALLOWED_MIME_TYPES, randomPhotoFilename } from '../src/utils/photoUpload.js'

// Vercel's default JSON body parser would otherwise try (and fail) to
// consume this multipart stream before formidable ever sees it.
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const form = formidable({ maxFileSize: MAX_PHOTO_BYTES, maxFiles: 1 })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
    if (!file) return res.status(400).json({ ok: false, error: 'no file uploaded' })
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ ok: false, error: 'only JPEG, PNG, or WebP images are allowed' })
    }

    const buffer = await fs.readFile(file.filepath)
    const filename = randomPhotoFilename(file.mimetype)

    const supabase = getSupabase()
    const { error: uploadError } = await supabase.storage
      .from('invite-photos')
      .upload(filename, buffer, { contentType: file.mimetype, upsert: false })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('invite-photos').getPublicUrl(filename)
    res.status(200).json({ ok: true, url: data.publicUrl })
  } catch (err) {
    console.error('[photos] upload failed:', err)
    if (/maxFileSize/i.test(err.message || '')) {
      return res.status(400).json({ ok: false, error: 'file is too large (max 4MB)' })
    }
    res.status(500).json({ ok: false, error: 'could not upload photo' })
  }
}
