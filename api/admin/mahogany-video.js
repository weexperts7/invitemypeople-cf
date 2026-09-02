// POST /api/admin/mahogany-video — a Vercel Serverless Function. See
// api/_lib/adminMahoganyVideo.js for the shared implementation.
export { adminUploadMahoganyVideo as default } from '../_lib/adminMahoganyVideo.js'

// Vercel's default JSON body parser would otherwise try (and fail) to
// consume this multipart stream before formidable ever sees it — same as
// api/photos.js's identical config.
export const config = { api: { bodyParser: false } }
