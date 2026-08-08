// Production counterpart to server/index.js's renderSeoHtml/getIndexHtmlTemplate
// (which only ever runs for local `npm start`/dev — Vercel doesn't execute
// that Express app). vercel.json rewrites every non-API, non-static-file
// request here instead of straight to the static shell.
//
// Why this exists: Vite's build produces one static HTML shell shared by
// every client-side route. Without this function, EVERY page — /about,
// /weddings, every /satsang/:slug and /templates/ganesh-chaturthi/:slug —
// serves the homepage's title/meta description to any crawler or SEO
// auditor that doesn't execute JS (src/components/SEO.jsx only patches the
// document head after React mounts). This function swaps in the right
// per-route title/description/canonical/OG tags on the raw HTML response
// itself, mirroring server/index.js exactly (see routesSeo.js, which is the
// shared source of truth both read from).
//
// The template this function reads is dist/app-shell.html, NOT
// dist/index.html — scripts/postbuild.js renames Vite's build output
// specifically so no literal "index.html" file exists in the deployed
// static output. Vercel's rewrites only apply when no static file already
// matches the request path, so as long as a file named index.html sat at
// the output root, a request for "/" resolved straight to that static file
// — completely bypassing this function and its <h1>/meta injection — while
// every other route (having no matching static file) correctly fell
// through to the rewrite. Renaming the file closes that one gap, which
// happened to be the single most important page for this to work on.
//
// Any route this function doesn't recognize (an actual 404, or a dynamic
// /i/:slug or /i/:slug/host/:hostToken page whose content lives in Supabase,
// not in this function) gets its <meta name="robots"> flipped to
// "noindex, follow" rather than guessing at a title/description. Mirrors
// server/index.js exactly, and matches what those pages already declare
// themselves once JS mounts (see GeneratedInvitePage.jsx/HostDashboardPage.jsx's
// own <SEO noindex />) — without this, a non-JS crawler hitting one of them
// directly saw the default "index, follow" straight through, since
// src/components/SEO.jsx only patches that meta tag after React mounts.
import fs from 'node:fs'
import path from 'node:path'
import { ROUTES_SEO, SITE_URL, satsangSeo, ganeshSeo } from '../src/data/routesSeo.js'
import { getSatsangTemplateBySlug } from '../src/data/satsangTemplatesData.js'
import { getGaneshTemplateBySlug } from '../src/data/ganeshTemplatesData.js'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Same attribute-match-and-swap approach as server/index.js's setMetaContent
// — tolerant of index.html's multi-line meta tag formatting.
function setMetaContent(html, attrMatch, value) {
  const re = new RegExp(`(<meta\\b[^>]*?${attrMatch}[^>]*?content=")[^"]*("[^>]*>)`, 'i')
  return html.replace(re, `$1${escapeHtml(value)}$2`)
}

function setCanonical(html, href) {
  return html.replace(
    /(<link\b[^>]*?rel="canonical"[^>]*?href=")[^"]*("[^>]*>)/i,
    `$1${escapeHtml(href)}$2`,
  )
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
}

// The SPA renders via `createRoot(...).render()` (see src/main.jsx), not
// `hydrateRoot` — so it fully replaces #root's children on mount rather than
// reconciling against them. That makes it safe to seed #root with real
// markup here: non-JS crawlers and SEO auditors that only ever see this raw
// response get an actual semantic <h1> instead of an empty div, while
// JS-executing visitors see it swapped for React's own (matching) heading
// within milliseconds, with no hydration warnings either way.
function setRootH1(html, h1) {
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><h1>${escapeHtml(h1)}</h1></div>`,
  )
}

function resolveSeoForPath(pathname) {
  if (ROUTES_SEO[pathname]) return ROUTES_SEO[pathname]

  const satsangMatch = pathname.match(/^\/satsang\/([^/]+)\/?$/)
  if (satsangMatch) {
    const template = getSatsangTemplateBySlug(decodeURIComponent(satsangMatch[1]))
    if (template) return satsangSeo(template)
  }

  const ganeshMatch = pathname.match(/^\/templates\/ganesh-chaturthi\/([^/]+)\/?$/)
  if (ganeshMatch) {
    const template = getGaneshTemplateBySlug(decodeURIComponent(ganeshMatch[1]))
    if (template) return ganeshSeo(template)
  }

  return null
}

let indexHtmlTemplate = null
function getIndexHtmlTemplate() {
  // Bundled into this function's deployment via vercel.json's
  // functions["api/render.js"].includeFiles — Vite's build (which Vercel
  // runs before bundling functions) produces this first, then
  // scripts/postbuild.js renames it from dist/index.html (see this file's
  // header comment for why it can't keep that name).
  if (indexHtmlTemplate === null) {
    indexHtmlTemplate = fs.readFileSync(path.join(process.cwd(), 'dist', 'app-shell.html'), 'utf8')
  }
  return indexHtmlTemplate
}

function renderSeoHtml(pathname) {
  const html = getIndexHtmlTemplate()
  const seo = resolveSeoForPath(pathname)
  if (!seo) return setMetaContent(html, 'name="robots"', 'noindex, follow')

  const url = `${SITE_URL}${pathname}`
  const steps = [
    [setTitle, seo.title],
    [setMetaContent, 'name="description"', seo.description],
    [setCanonical, url],
    [setMetaContent, 'property="og:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'property="og:description"', seo.ogDescription || seo.description],
    [setMetaContent, 'property="og:url"', url],
    [setMetaContent, 'name="twitter:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'name="twitter:description"', seo.ogDescription || seo.description],
  ]
  // Only the static routes (routesSeo.js's STATIC_ROUTES_SEO/COMING_SOON_ROUTES)
  // carry an `h1` — satsangSeo()/ganeshSeo() don't, since those dynamic
  // template pages already render their own real <h1> client-side and
  // duplicating their bespoke per-template hero copy here would risk drifting
  // out of sync with it.
  if (seo.h1) steps.push([setRootH1, seo.h1])
  return steps.reduce((acc, [fn, ...args]) => fn(acc, ...args), html)
}

export default function handler(req, res) {
  try {
    const pathname = (req.url || '/').split('?')[0]
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(renderSeoHtml(pathname))
  } catch (err) {
    // Never let an SEO-injection bug take the whole site down — fall back
    // to the plain, unmodified shell (today's behavior) instead of a 500.
    console.error('[render] failed to build SEO HTML, serving plain shell:', err)
    try {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.status(200).send(getIndexHtmlTemplate())
    } catch (fallbackErr) {
      console.error('[render] fallback shell also failed:', fallbackErr)
      return res.status(500).send('Internal Server Error')
    }
  }
}
