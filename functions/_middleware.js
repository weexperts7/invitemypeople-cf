// Cloudflare Pages middleware — gates every non-production deployment (any
// branch other than `main`) behind a standard browser Basic Auth prompt
// (native username/password popup, no Cloudflare-branded login screen).
// Runs before every Pages Function AND every static asset request that
// still reaches Functions — see the _routes.json caveat below for the one
// exception. Direct Cloudflare Pages Functions port of middleware.js (the
// Vercel Routing Middleware this project used before the Cloudflare
// migration) — same Basic Auth logic, same Bearer-passthrough rule, same
// fail-open-on-missing-config behavior; only the production-detection
// mechanism changed (Vercel's VERCEL_ENV vs. Cloudflare's CF_PAGES_BRANCH,
// see below) and `next()` is now `context.next()`.
//
// Production detection: Cloudflare Pages doesn't set a VERCEL_ENV-style
// "production" | "preview" flag — instead it sets CF_PAGES_BRANCH to
// whatever branch triggered the deployment. This checks that against
// "main" directly (the production branch configured when the Pages project
// was created — see wrangler.toml/`wrangler pages project create
// --production-branch=main`). If the production branch is ever renamed,
// update the check below to match.
//
// Caveat vs. the original Vercel middleware: static assets excluded in
// public/_routes.json (see that file — /assets/*, /images/*, etc., added
// so those requests skip Pages Functions entirely and load fast/uncached)
// never reach this middleware either, unlike Vercel's "no matcher — runs on
// every path" setup, which gated even static files. A preview deployment's
// HTML is still fully gated (crawlers and casual visitors get a 401 before
// any markup renders), but someone who already knows/guesses a direct
// asset URL on a preview branch can fetch it unauthenticated. Acceptable
// for this project's "keep out bots and casual visitors" threat model (see
// the Note on strength below) — tighten _routes.json instead if that
// changes.
//
// Setup: in the Cloudflare Pages project → Settings → Environment
// variables, add BASIC_AUTH_USER and BASIC_AUTH_PASSWORD scoped to the
// Preview environment only — never Production. Redeploy (or push a commit)
// to pick them up.
//
// Note on strength: this is a lightweight deterrent (keeps out bots and
// casual visitors), not a hardened security boundary — Basic Auth sends
// credentials base64-encoded (readable, not encrypted) on every request,
// relying entirely on HTTPS for transport security, and the comparison
// below is a plain string check, not constant-time. That's an intentional
// trade-off for a low-stakes dev preview; don't reuse these credentials
// anywhere that matters, and don't use this as the only thing standing
// between the public and real user/payment data.
//
// Bearer passthrough: a request can only carry one Authorization header,
// and partnerApi.js/adminApi.js explicitly set `Bearer <token>` on every
// partner/admin portal API call — which silently replaces whatever Basic
// credentials a browser would otherwise auto-attach for this origin.
// Without letting Bearer through below, every logged-in partner/admin API
// call gets rejected right here before api/_lib/auth.js's own
// requireUser()/requireAdmin() session check ever runs, breaking the whole
// portal on any Basic-Auth-gated deployment. This doesn't newly expose
// anything — those routes already enforce their own session check
// server-side regardless of this middleware.

export async function onRequest(context) {
  const { request, env, next } = context

  // Every non-production deployment is gated — production (the `main`
  // branch, and any custom domain attached to it) passes straight through
  // untouched.
  if (env.CF_PAGES_BRANCH === 'main') {
    return next()
  }

  const user = env.BASIC_AUTH_USER
  const password = env.BASIC_AUTH_PASSWORD

  // Fail open on missing config rather than locking everyone out (including
  // you) if the env vars haven't been set yet in Cloudflare — but log
  // loudly so it's obvious in the Functions logs that protection isn't
  // actually active.
  if (!user || !password) {
    console.warn('[middleware] BASIC_AUTH_USER/BASIC_AUTH_PASSWORD not set — this preview deployment is NOT password-protected')
    return next()
  }

  const authHeader = request.headers.get('authorization')

  // See "Bearer passthrough" above — must be checked before the Basic
  // check below, since these are mutually exclusive prefixes on the same
  // header.
  if (authHeader?.startsWith('Bearer ')) {
    return next()
  }

  if (authHeader?.startsWith('Basic ')) {
    try {
      const decoded = atob(authHeader.slice(6))
      const separatorIndex = decoded.indexOf(':')
      const suppliedUser = decoded.slice(0, separatorIndex)
      const suppliedPassword = decoded.slice(separatorIndex + 1)

      if (suppliedUser === user && suppliedPassword === password) {
        return next()
      }
    } catch {
      // Malformed Authorization header — fall through to the 401 below.
    }
  }

  // No/invalid credentials — return 401 with WWW-Authenticate so the browser
  // shows its native username/password popup (not a custom HTML page, which
  // is exactly what makes this different from a hosted password-protection
  // screen).
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="InviteMyPeople DEV", charset="UTF-8"',
    },
  })
}
