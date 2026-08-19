// GET /api/partners/invites/:slug/host?token=... — a Vercel Serverless
// Function. The private Host Dashboard's only data source for a
// partner-created invite (/p/:slug/host/:hostToken). See
// api/_lib/partnerHandlers.js for the shared implementation.
export { getPartnerInviteHostDashboard as default } from '../../../_lib/partnerHandlers.js'
