// GET /api/partners/wishes?slug=... — a Vercel Serverless Function. Public,
// unauthenticated — the Wishes Wall data source for /p/:slug. See
// api/_lib/partnerHandlers.js for the shared implementation.
export { getPartnerWishes as default } from '../_lib/partnerHandlers.js'
