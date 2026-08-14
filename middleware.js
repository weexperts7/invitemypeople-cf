// Vercel Routing Middleware — gates every non-production deployment (the
// `dev` branch and any other preview/feature branch) behind a standard
// browser Basic Auth prompt (native username/password popup, no
// Vercel-branded login screen). Runs before Vercel's cache on every request,
// for every route (static assets, /api/*, everything) — see
// https://vercel.com/docs/routing-middleware.
//
// Framework-agnostic (this is a Vite SPA + Serverless Functions project, not
// Next.js), so this lives at the project root and uses `@vercel/functions`
// helpers rather than Next's NextResponse/NextRequest.
//
// Scope: everything EXCEPT production is protected — VERCEL_ENV is set
// automatically by Vercel on every deployment ('production' | 'preview' |
// 'development'), no config needed. This replaces Vercel's own "Vercel
// Authentication" (SSO) project setting, which was previously doing this
// job but only as an all-or-nothing toggle (no per-branch scoping) and with
// a Vercel-branded login screen instead of a native browser popup — that
// project setting has been turned off for previews to make room for this.
// Production (invitemypeople.com and its .vercel.app alias) is untouched
// either way. To narrow this to just the `dev` branch instead of every
// preview, swap the condition below for
// `process.env.VERCEL_GIT_COMMIT_REF !== 'dev'`.
//
// Why this also keeps search engines out: a crawler that can't authenticate
// never receives a response body — there's no HTML to index, so there's
// nothing to add "noindex" meta tags to. This is a stronger, simpler
// deterrent than robots.txt (which is advisory; bots can ignore it) or a
// Vercel-hosted password page (which still serves crawlable meta/branding
// before the check).
//
// Setup: in Vercel → Project Settings → Environment Variables, add
// BASIC_AUTH_USER and BASIC_AUTH_PASSWORD scoped to the Preview environment
// — never Production. Then redeploy (or push a commit) to pick them up.
//
// Note on strength: this is a lightweight deterrent (keeps out bots and
// casual visitors), not a hardened security boundary — Basic Auth sends
// credentials base64-encoded (readable, not encrypted) on every request,
// relying entirely on HTTPS for transport security, and the comparison
// below is a plain string check, not constant-time. That's an intentional
// trade-off for a low-stakes dev preview; don't reuse these credentials
// anywhere that matters, and don't use this as the only thing standing
// between the public and real user/payment data.

import { next } from '@vercel/functions'

export default function middleware(request) {
  // Every non-production deployment is gated — production (custom domain
  // and its .vercel.app alias) passes straight through untouched.
  if (process.env.VERCEL_ENV === 'production') {
    return next()
  }

  const user = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASSWORD

  // Fail open on missing config rather than locking everyone out (including
  // you) if the env vars haven't been set yet in Vercel — but log loudly so
  // it's obvious in the function logs that protection isn't actually active.
  if (!user || !password) {
    console.warn('[middleware] BASIC_AUTH_USER/BASIC_AUTH_PASSWORD not set — this preview deployment is NOT password-protected')
    return next()
  }

  const authHeader = request.headers.get('authorization')

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
  // is exactly what makes this different from Vercel's own Password
  // Protection screen).
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="InviteMyPeople DEV", charset="UTF-8"',
    },
  })
}

// No matcher — runs on every path, so static assets (JS/CSS bundles,
// images) are gated too, not just the HTML shell.
export const config = {
  runtime: 'edge',
}
