// Catch-all Cloudflare Pages Function. Production counterpart to
// server/index.js's renderSeoHtml/getIndexHtmlTemplate (local-dev-only) —
// see "why this exists" below: per-route SEO meta injection for crawlers
// that don't execute JS, and why it reads dist/app-shell.html specifically,
// never dist/index.html (scripts/postbuild.js renames it — see that
// script's own comment for why a literal index.html file would silently
// bypass this function for "/"). Originally ported from this project's
// Vercel Serverless Function equivalent (api/render.js, since removed once
// the Cloudflare migration was cut over) — logic is otherwise unchanged.
//
// Cloudflare Pages Functions route this file for any request path that
// doesn't match a static asset in the build output (a real
// dist/assets/app.js, favicon.ico, robots.txt, etc. is still served
// directly, never reaching this function), which is exactly why renaming
// index.html to app-shell.html still matters here too: without it, "/"
// would resolve straight to that static file and skip this function's
// <h1>/meta injection entirely.
//
// Only real difference from a Node renderer: there's no filesystem on
// Workers, so the HTML template is read via Cloudflare Pages' ASSETS
// binding (a Fetcher over this same build output) instead of
// `fs.readFileSync`.
import { renderSeoHtml, getRedirectTarget, needsPrices } from '../src/utils/seoHtml.js'
import { getPriceOverrides } from '../api/_lib/templatePrices.js'
import { bridgeEnv } from './_lib/adapt.js'

// Per-isolate cache — Cloudflare reuses a worker isolate across requests, so
// this avoids re-fetching the static shell from ASSETS on every request,
// same benefit getIndexHtmlTemplate()'s module-scope cache gave the
// fs-based originals.
let indexHtmlTemplate = null
async function getIndexHtmlTemplate(env, requestUrl) {
  if (indexHtmlTemplate !== null) return indexHtmlTemplate
  const assetUrl = new URL('/app-shell.html', requestUrl)
  const response = await env.ASSETS.fetch(assetUrl)
  if (!response.ok) throw new Error(`could not load app-shell.html from ASSETS (HTTP ${response.status})`)
  indexHtmlTemplate = await response.text()
  return indexHtmlTemplate
}

export async function onRequest(context) {
  try {
    const { pathname } = new URL(context.request.url)
    const target = getRedirectTarget(pathname)
    if (target) return Response.redirect(new URL(target, context.request.url), 301)
    const shell = await getIndexHtmlTemplate(context.env, context.request.url)
    // The price a visitor sees in the page text must be the one they would
    // pay, including a price an admin has set. A slow or failed lookup falls
    // back to the default prices rather than delaying the page.
    let overrides = {}
    if (needsPrices(pathname)) {
      bridgeEnv(context.env)
      overrides = await Promise.race([getPriceOverrides(), new Promise((resolve) => setTimeout(() => resolve({}), 1500))])
    }
    const html = renderSeoHtml(shell, pathname, overrides)
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (err) {
    // Never let an SEO-injection bug take the whole site down — fall back
    // to the plain, unmodified shell (same contract api/render.js makes).
    console.error('[functions] failed to build SEO HTML, serving plain shell:', err)
    try {
      const html = await getIndexHtmlTemplate(context.env, context.request.url)
      return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    } catch (fallbackErr) {
      console.error('[functions] fallback shell also failed:', fallbackErr)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}
