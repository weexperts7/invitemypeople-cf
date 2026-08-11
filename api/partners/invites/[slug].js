// GET /api/partners/invites/:slug — a Vercel Serverless Function. Public,
// unauthenticated — this is the shareable /p/:slug link's data source. See
// api/_lib/partnerHandlers.js for the shared implementation.
export { getPartnerInviteBySlug as default } from '../../_lib/partnerHandlers.js'
