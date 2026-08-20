// Cloudflare Turnstile server-side verification — shared by every endpoint
// that requires a `captchaToken` from a Turnstile-protected form (RSVP
// submissions in api/rsvps/index.js, checkout order creation in
// api/create-order.js, and server/index.js's local-dev mirrors of both).
// See src/components/TurnstileWidget.jsx for the frontend half that mints
// the token this verifies.
//
// TURNSTILE_SECRET_KEY is server-only — read straight from process.env,
// never prefixed with VITE_ (that would ship it in the public JS bundle,
// same rule every other server secret in this repo follows — see
// .env.example).
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verifies a Turnstile token against Cloudflare's siteverify API.
 *
 * @param {string} token - the `captchaToken` a form submitted (from
 *   TurnstileWidget.jsx's onSuccess callback).
 * @param {{ remoteIp?: string, expectedAction?: string }} [opts]
 * @returns {Promise<boolean>} true only if Cloudflare confirms the token is
 *   genuine, unexpired, unused, and (when provided) matches the expected
 *   `action`. Every failure mode — missing secret, malformed token, network
 *   error, siteverify rejection — resolves to false rather than throwing,
 *   so callers can always just `if (!verified) return res.status(400)...`.
 */
export async function verifyTurnstileToken(token, opts = {}) {
  const { remoteIp, expectedAction } = opts
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set — refusing to verify')
    return false
  }
  // Turnstile tokens are short opaque strings; this just rejects obviously
  // malformed input before spending a network round-trip on it.
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return false
  }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)

    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return false

    const result = await response.json()
    if (!result.success) return false
    // Binds the token to the form it was meant for — a token minted for the
    // RSVP widget can't be replayed against checkout, or vice versa.
    if (expectedAction && result.action !== expectedAction) return false

    return true
  } catch (err) {
    console.error('[turnstile] siteverify request failed:', err)
    return false
  }
}

/** Best-effort client IP from a Node/Express-style request — Vercel and the
 * local dev server both populate x-forwarded-for; remoteAddress is the
 * fallback when it's absent. Passed to siteverify as `remoteip`, which
 * Cloudflare uses to improve its risk scoring — never required for a
 * successful verification. */
export function getClientIp(req) {
  const forwardedFor = req.headers?.['x-forwarded-for']
  if (forwardedFor) return String(forwardedFor).split(',')[0].trim()
  return req.socket?.remoteAddress || undefined
}
