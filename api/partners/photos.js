// POST /api/partners/photos — a Vercel Serverless Function. Uploads a photo
// for a partner's client invite (multipart/form-data, field "photo") to
// its own `partner-invite-photos` Supabase Storage bucket — never the
// consumer `invite-photos` bucket api/photos.js uses. Requires a logged-in
// partner. See api/_lib/partnerHandlers.js for the shared implementation.
export { uploadPartnerInvitePhoto as default } from '../_lib/partnerHandlers.js'

// Vercel's default JSON body parser would otherwise try (and fail) to
// consume this multipart stream before formidable ever sees it — same as
// api/photos.js / api/partners/logo.js.
export const config = { api: { bodyParser: false } }
