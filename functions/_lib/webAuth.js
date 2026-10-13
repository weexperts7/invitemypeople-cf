// Minimal auth helpers for the 3 Cloudflare-native upload routes
// (functions/api/partners/photos.js, functions/api/admin/mahogany-video.js
// — functions/api/partners/logo.js is deliberately unauthenticated, same as
// its original — see that file's own comment) that don't go through
// functions/_lib/adapt.js's full req/res shim. getRequestUser()/
// isAdminEmail() (api/_lib/auth.js) only ever need req.headers.authorization,
// so a real Express-style req/res pair isn't worth building here — this
// just hands them the one header they read.
import { getRequestUser, isAdminEmail } from '../../api/_lib/auth.js'

/** Resolves the bearer token on a Request to a Supabase Auth user, or null. */
export async function requireBearerUser(request) {
  return getRequestUser({ headers: { authorization: request.headers.get('authorization') } })
}

/** Same as requireBearerUser(), plus the ADMIN_EMAILS allowlist check. */
export async function requireBearerAdmin(request) {
  const user = await requireBearerUser(request)
  if (!user || !isAdminEmail(user.email)) return null
  return user
}
