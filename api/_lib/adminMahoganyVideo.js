// POST /api/admin/mahogany-video — admin only, multipart/form-data (field
// name "video"). Uploads a real caricature intro video for a Mahogany Seal
// invite created via AdminCreateInvitePage.jsx (see
// api/_lib/adminCreateInvite.js's `caricatureVideoUrl` field) into its own
// isolated `mahogany-seal-videos` Storage bucket — never the consumer
// `invite-photos`/`partner-invite-photos` buckets api/photos.js and
// api/_lib/partnerHandlers.js's uploadPartnerInvitePhoto() write to. Same
// "own bucket per upload type" isolation those already establish.
//
// Shared handler (no dev/prod split) — Storage is always real Supabase in
// both environments, same reasoning every other B2B Partner Portal upload
// route in this codebase already follows (see api/_lib/partnerHandlers.js's
// own header). server/index.js registers this exact function directly.
import formidable from 'formidable'
import fs from 'node:fs/promises'
import { getSupabase } from './supabase.js'
import { requireAdmin } from './auth.js'
import { MAX_VIDEO_BYTES, ALLOWED_VIDEO_MIME_TYPES, randomVideoFilename } from '../../src/utils/videoUpload.js'

const VIDEO_BUCKET = 'mahogany-seal-videos'

export async function adminUploadMahoganyVideo(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const form = formidable({ maxFileSize: MAX_VIDEO_BYTES, maxFiles: 1 })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.video) ? files.video[0] : files.video
    if (!file) return res.status(400).json({ ok: false, error: 'no file uploaded' })
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ ok: false, error: 'only MP4, WebM, or MOV videos are allowed' })
    }

    const buffer = await fs.readFile(file.filepath)
    const filename = randomVideoFilename(file.mimetype)

    const supabase = getSupabase()
    const { error: uploadError } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(filename, buffer, { contentType: file.mimetype, upsert: false })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(VIDEO_BUCKET).getPublicUrl(filename)
    console.log(`[admin] ${admin.email} uploaded a Mahogany Seal caricature video (${filename})`)
    res.status(200).json({ ok: true, url: data.publicUrl })
  } catch (err) {
    console.error('[admin] mahogany video upload failed:', err)
    if (/maxFileSize/i.test(err.message || '')) {
      return res.status(400).json({ ok: false, error: 'file is too large (max 30MB)' })
    }
    res.status(500).json({ ok: false, error: 'could not upload video' })
  }
}
