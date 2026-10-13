// Bridges a Cloudflare Pages Function's (context) => Response world onto the
// Node/Express-shaped (req, res) => void handlers this codebase already has
// in api/**/*.js and api/_lib/*.js (the exact same functions Vercel's
// Serverless Functions and server/index.js's Express routes already share —
// see api/_lib/partnerHandlers.js's header for why those two runtimes
// already agree on one handler signature). Reusing those handlers unchanged
// here — rather than rewriting 30+ routes against the Fetch API by hand —
// is the whole point of this adapter: the business logic (validation,
// Supabase queries, Razorpay/Turnstile/Brevo calls, auth checks) carries
// over with zero behavior change, and only the thin req/res translation
// layer is new.
//
// Env vars: every handler this wraps reads credentials via `process.env.X`
// (see api/_lib/supabase.js, turnstile.js, src/utils/razorpay.js, email.js,
// spotify.js). Cloudflare Pages Functions don't have a `process.env`
// populated from `context.env` by default — this adapter bridges that gap
// explicitly on every request (`bridgeEnv` below), copying
// context.env.VARIABLE_NAME onto process.env.VARIABLE_NAME before the
// wrapped handler runs. That keeps credentials genuinely per-request/
// per-environment (Preview vs Production Cloudflare env vars resolve
// correctly) without having to thread an `env` parameter through every
// shared helper — same effective behavior requirement #3 in the migration
// asked for ("accept credentials passed dynamically from context.env"),
// just bridged once here instead of at every call site.
export function bridgeEnv(env) {
  if (typeof globalThis.process === 'undefined') globalThis.process = { env: {} }
  if (!globalThis.process.env) globalThis.process.env = {}
  Object.assign(globalThis.process.env, env || {})
}

// Builds the Express-like `req` the wrapped handlers expect. Route params
// (Cloudflare's context.params, from [slug]-style file paths) are merged
// into req.query — matching Vercel's own behavior (dynamic segments land in
// req.query, e.g. api/invites/[slug].js's `const { slug } = req.query`) —
// and also copied onto req.params for the handlers that read
// `req.params?.slug` instead (server/index.js's Express routes, and
// api/_lib/partnerHandlers.js's pathParam() helper, which checks both).
async function buildRequest(context) {
  const { request, params } = context
  const url = new URL(request.url)

  const headers = {}
  for (const [key, value] of request.headers.entries()) headers[key.toLowerCase()] = value
  // Cloudflare's own client-IP header — used as a fallback for
  // getClientIp() (api/_lib/turnstile.js) when x-forwarded-for isn't
  // already present, so Turnstile's siteverify still gets a real IP.
  if (!headers['x-forwarded-for'] && headers['cf-connecting-ip']) {
    headers['x-forwarded-for'] = headers['cf-connecting-ip']
  }

  const query = {}
  for (const [key, value] of url.searchParams.entries()) query[key] = value
  const normalizedParams = {}
  for (const [key, value] of Object.entries(params || {})) {
    normalizedParams[key] = Array.isArray(value) ? value.join('/') : value
  }
  Object.assign(query, normalizedParams)

  let body = {}
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const contentType = headers['content-type'] || ''
    if (contentType.includes('application/json')) {
      const text = await request.text()
      if (text) {
        try {
          body = JSON.parse(text)
        } catch {
          body = {}
        }
      }
    }
  }

  return {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    query,
    params: normalizedParams,
    body,
    socket: { remoteAddress: undefined },
  }
}

// Builds the Express-like `res` the wrapped handlers expect
// (res.status().json()/.send()/.setHeader()/.sendStatus()), capturing
// everything into a real Response once the handler finishes.
function buildResponse() {
  const state = { status: 200, headers: new Headers(), body: '', ended: false }

  const res = {
    status(code) {
      state.status = code
      return res
    },
    setHeader(name, value) {
      state.headers.set(name, value)
      return res
    },
    // Express alias some of this codebase's code doesn't use today, but
    // cheap to support in case a future route does.
    set(name, value) {
      return res.setHeader(name, value)
    },
    json(payload) {
      if (!state.headers.has('Content-Type')) {
        state.headers.set('Content-Type', 'application/json; charset=utf-8')
      }
      state.body = JSON.stringify(payload)
      state.ended = true
      return res
    },
    send(payload) {
      if (payload == null) {
        state.body = ''
      } else if (typeof payload === 'string') {
        if (!state.headers.has('Content-Type')) {
          state.headers.set('Content-Type', 'text/html; charset=utf-8')
        }
        state.body = payload
      } else {
        if (!state.headers.has('Content-Type')) {
          state.headers.set('Content-Type', 'application/json; charset=utf-8')
        }
        state.body = JSON.stringify(payload)
      }
      state.ended = true
      return res
    },
    sendStatus(code) {
      state.status = code
      state.body = ''
      state.ended = true
      return res
    },
  }

  return { res, state }
}

/**
 * Wraps one of this codebase's existing (req, res) => Promise<void> handlers
 * (a Vercel Serverless Function's default export, or one of
 * api/_lib/partnerHandlers.js's/templatePrices.js's named exports) into a
 * Cloudflare Pages Function — export the result as `onRequest` from a file
 * under /functions.
 */
export function toPagesFunction(handler) {
  return async (context) => {
    bridgeEnv(context.env)
    const req = await buildRequest(context)
    const { res, state } = buildResponse()

    try {
      await handler(req, res)
    } catch (err) {
      console.error('[functions] unhandled error:', err)
      if (!state.ended) {
        state.status = 500
        state.headers.set('Content-Type', 'application/json; charset=utf-8')
        state.body = JSON.stringify({ ok: false, error: 'internal server error' })
      }
    }

    return new Response(state.body, { status: state.status, headers: state.headers })
  }
}
