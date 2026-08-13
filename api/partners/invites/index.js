// GET /api/partners/invites (list mine) and POST /api/partners/invites
// (spend a credit, create a client invite) — a Vercel Serverless Function.
// See api/_lib/partnerHandlers.js for the shared implementation.
export { partnerInvitesIndex as default } from '../../_lib/partnerHandlers.js'
