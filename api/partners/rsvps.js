// POST /api/partners/rsvps — a Vercel Serverless Function. Public,
// unauthenticated — a guest submitting the RSVP form on /p/:slug. See
// api/_lib/partnerHandlers.js for the shared implementation.
export { submitPartnerRsvp as default } from '../_lib/partnerHandlers.js'
