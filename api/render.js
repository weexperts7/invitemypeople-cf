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
import { ROUTES_SEO, SITE_URL, SITE_NAV_LINKS, satsangSeo, ganeshSeo } from '../src/data/routesSeo.js'
import { getSatsangTemplateBySlug } from '../src/data/satsangTemplatesData.js'
import { getGaneshTemplateBySlug } from '../src/data/ganeshTemplatesData.js'
import { getBlogPostBySlug, blogPostSeo, blogListSeo } from '../src/data/blogPosts.js'

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
// response get an actual semantic <h1> (plus, on the homepage, real
// paragraph/subheading copy and internal links — see `body`/`links` below)
// instead of an empty div, while JS-executing visitors see it swapped for
// React's own (matching) content within milliseconds, with no hydration
// warnings either way.
//
// Each `body` entry is a plain string (rendered as a <p>), a `{ h2 }`
// object (rendered as an <h2>), a `{ h3 }` object (rendered as an <h3> —
// added for blog posts, see blogPosts.js, which nest a subheading level
// beneath each <h2>), or an array of segments (rendered as a <p> whose
// segments are either plain text or a `{ text, href }` internal link,
// rendered as a real <a href>) — see routesSeo.js's homepage `body` for
// why: it gives a non-JS crawler a real H1 → H2 → (H3 →) paragraph heading
// hierarchy, with real contextual internal links inside that paragraph
// text, in the raw HTML — not just a flat wall of <p> text under a single
// heading, and not only links siloed off in the nav below.
function renderBodyBlock(block) {
  if (typeof block === 'string') return `<p>${escapeHtml(block)}</p>`
  if (Array.isArray(block)) {
    const inner = block
      .map((seg) =>
        typeof seg === 'string'
          ? escapeHtml(seg)
          : `<a href="${escapeHtml(seg.href)}">${escapeHtml(seg.text)}</a>`,
      )
      .join('')
    return `<p>${inner}</p>`
  }
  if (block.h3) return `<h3>${escapeHtml(block.h3)}</h3>`
  return `<h2>${escapeHtml(block.h2)}</h2>`
}

function setRootContent(html, { h1, body, links }) {
  const content = (body || []).map(renderBodyBlock).join('')
  const nav = links && links.length
    ? `<nav>${links.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join(' ')}</nav>`
    : ''
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><h1>${escapeHtml(h1)}</h1>${content}${nav}</div>`,
  )
}

// Collapses "/about/" down to "/about" (root "/" is left alone) before both
// the route lookup below and the canonical URL it produces. Without this, a
// trailing-slash request for an otherwise-recognized route (a common way
// crawlers, SEO auditors and old backlinks reach a page) missed every exact
// key in ROUTES_SEO, fell through to the noindex/no-canonical-update branch
// in renderSeoHtml, and served the *unmodified shell's* canonical — which
// always says the bare homepage URL — pointing a real, indexable page at a
// completely different URL. Normalizing first means "/about/" and
// "/about" both resolve to, and both self-canonicalize to, the same
// trailing-slash-free URL.
function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function resolveSeoForPath(pathname) {
  if (ROUTES_SEO[pathname]) return ROUTES_SEO[pathname]
  // Computed from BLOG_POSTS rather than a ROUTES_SEO entry — see
  // blogListSeo()'s own comment for why.
  if (pathname === '/blog') return blogListSeo()

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

  // Unlike satsang/ganesh templates, a blog post's raw SSR shell carries the
  // full article `body` (see blogPostSeo()) — its live page (BlogPostPage.jsx)
  // is nothing *but* that article content, so there's no bespoke client-side
  // hero copy this could drift out of sync with the way there would be for a
  // template's custom layout.
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogMatch) {
    const post = getBlogPostBySlug(decodeURIComponent(blogMatch[1]))
    if (post) return blogPostSeo(post)
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

function renderSeoHtml(rawPathname) {
  const html = getIndexHtmlTemplate()
  const pathname = normalizePathname(rawPathname)
  const seo = resolveSeoForPath(pathname)
  const url = `${SITE_URL}${pathname}`

  if (!seo) {
    // An actual 404, or a dynamic /i/:slug or /i/:slug/host/:hostToken page
    // whose content lives in Supabase, not here. Still self-canonicalize
    // (rather than leaving the shell's baked-in homepage canonical in
    // place) so a crawler that reaches this branch — most commonly a
    // trailing-slash or otherwise-unnormalized variant of a route that
    // *does* exist — never sees a canonical pointing at an unrelated page.
    return setCanonical(setMetaContent(html, 'name="robots"', 'noindex, follow'), url)
  }

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
  // out of sync with it. Every page that gets an h1 also gets the same
  // site-wide internal nav links; only the homepage additionally carries
  // `body` (see routesSeo.js's STATIC_ROUTES_SEO['/'] comment).
  if (seo.h1) steps.push([setRootContent, { h1: seo.h1, body: seo.body, links: SITE_NAV_LINKS }])
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
