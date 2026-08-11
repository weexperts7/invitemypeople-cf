// POST /api/partners/logo — a Vercel Serverless Function. Uploads a
// partner's logo (multipart/form-data, field "logo") to its own
// `partner-logos` Supabase Storage bucket — never the consumer
// `invite-photos` bucket api/photos.js uses. See
// api/_lib/partnerHandlers.js for the shared implementation.
export { uploadPartnerLogo as default } from '../_lib/partnerHandlers.js'

// Vercel's default JSON body parser would otherwise try (and fail) to
// consume this multipart stream before formidable ever sees it — same as
// api/photos.js.
export const config = { api: { bodyParser: false } }
