// POST /api/partners/signup — a Vercel Serverless Function. Thin wrapper
// around the shared handler in api/_lib/partnerHandlers.js — see that
// file's header for why the logic itself isn't duplicated here the way
// api/invites/index.js's is from server/index.js.
export { signupPartner as default } from '../_lib/partnerHandlers.js'
