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
import {
  ROUTES_SEO,
  SITE_URL,
  SITE_NAV_LINKS,
  satsangSeo,
  ganeshSeo,
  weddingSeo,
  getSatsangTemplateBySlug,
  getGaneshTemplateBySlug,
  getTemplateById,
  getBlogPostBySlug,
  blogPostSeo,
  blogListSeo,
} from './_lib/shared.js'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function setMetaContent(html, attrMatch, value) {
  const re = new RegExp(`(<meta\\b[^>]*?${attrMatch}[^>]*?content=")[^"]*("[^>]*>)`, 'i')
  return html.replace(re, `$1${escapeHtml(value)}$2`)
}

function setCanonical(html, href) {
  return html.replace(/(<link\b[^>]*?rel="canonical"[^>]*?href=")[^"]*("[^>]*>)/i, `$1${escapeHtml(href)}$2`)
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
}

function renderBodyBlock(block) {
  if (typeof block === 'string') return `<p>${escapeHtml(block)}</p>`
  if (Array.isArray(block)) {
    const inner = block
      .map((seg) => (typeof seg === 'string' ? escapeHtml(seg) : `<a href="${escapeHtml(seg.href)}">${escapeHtml(seg.text)}</a>`))
      .join('')
    return `<p>${inner}</p>`
  }
  if (block.h3) return `<h3>${escapeHtml(block.h3)}</h3>`
  if (block.cta) return `<p><a href="${escapeHtml(block.cta.href)}">${escapeHtml(block.cta.label)}</a></p>`
  if (block.widget) return `<p>Interactive demo: search for a song and preview a 30-second clip.</p>`
  return `<h2>${escapeHtml(block.h2)}</h2>`
}

const SR_ONLY_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'

function setRootContent(html, { h1, body, links }) {
  const content = (body || []).map(renderBodyBlock).join('')
  const nav = links && links.length
    ? `<nav>${links.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join(' ')}</nav>`
    : ''
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><div style="${SR_ONLY_STYLE}"><h1>${escapeHtml(h1)}</h1>${content}${nav}</div></div>`,
  )
}

function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function resolveSeoForPath(pathname) {
  if (ROUTES_SEO[pathname]) return ROUTES_SEO[pathname]
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

  const weddingMatch = pathname.match(/^\/templates\/wedding\/([^/]+)\/?$/)
  if (weddingMatch) {
    const template = getTemplateById(decodeURIComponent(weddingMatch[1]))
    if (template) return weddingSeo(template)
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogMatch) {
    const post = getBlogPostBySlug(decodeURIComponent(blogMatch[1]))
    if (post) return blogPostSeo(post)
  }

  return null
}

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

async function renderSeoHtml(env, requestUrl, rawPathname) {
  const html = await getIndexHtmlTemplate(env, requestUrl)
  const pathname = normalizePathname(rawPathname)
  const seo = resolveSeoForPath(pathname)
  const url = `${SITE_URL}${pathname}`

  if (!seo) {
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
  if (seo.h1) steps.push([setRootContent, { h1: seo.h1, body: seo.body, links: SITE_NAV_LINKS }])
  return steps.reduce((acc, [fn, ...args]) => fn(acc, ...args), html)
}

export async function onRequest(context) {
  try {
    const html = await renderSeoHtml(context.env, context.request.url, new URL(context.request.url).pathname)
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
