// Production counterpart to server/index.js's renderSeoHtml/getIndexHtmlTemplate
// (which only ever runs for local `npm start`/dev — Vercel doesn't execute
// that Express app). vercel.json rewrites every non-API, non-static-file
// request here instead of straight to the static index.html.
//
// Why this exists: Vite's build produces one static index.html shared by
// every client-side route. Without this function, EVERY page — /about,
// /weddings, every /satsang/:slug and /templates/ganesh-chaturthi/:slug —
// serves the homepage's title/meta description to any crawler or SEO
// auditor that doesn't execute JS (src/components/SEO.jsx only patches the
// document head after React mounts). This function swaps in the right
// per-route title/description/canonical/OG tags on the raw HTML response
// itself, mirroring server/index.js exactly (see routesSeo.js, which is the
// shared source of truth both read from).
//
// Deliberately conservative: any route this function doesn't recognize
// (an actual 404, or a dynamic /i/:slug page whose content lives in
// Supabase, not in this function) falls through with the HTML returned
// UNCHANGED — i.e. today's status quo — rather than guessing. A bug in the
// lookup below can only leave a page's tags as they already are; it can
// never corrupt or de-index a page that already worked.
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
  // runs before bundling functions) produces dist/index.html first.
  if (indexHtmlTemplate === null) {
    indexHtmlTemplate = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf8')
  }
  return indexHtmlTemplate
}

function renderSeoHtml(pathname) {
  const html = getIndexHtmlTemplate()
  const seo = resolveSeoForPath(pathname)
  if (!seo) return html

  const url = `${SITE_URL}${pathname}`
  return [
    [setTitle, seo.title],
    [setMetaContent, 'name="description"', seo.description],
    [setCanonical, url],
    [setMetaContent, 'property="og:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'property="og:description"', seo.ogDescription || seo.description],
    [setMetaContent, 'property="og:url"', url],
    [setMetaContent, 'name="twitter:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'name="twitter:description"', seo.ogDescription || seo.description],
  ].reduce((acc, [fn, ...args]) => fn(acc, ...args), html)
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
