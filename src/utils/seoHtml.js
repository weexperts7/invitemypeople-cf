// Turns the SPA's static HTML shell into a page-specific document: title,
// description, canonical, robots, Open Graph, JSON-LD and a crawlable block of
// real content, all in the very first response. Needed because crawlers such
// as WhatsApp's link previewer never run JavaScript, and Googlebot indexes
// the raw HTML first.
//
// Shared by functions/[[path]].js (Cloudflare Pages, production) and
// server/index.js (the local production server) so both produce identical
// output. Pure string functions with no Node or Workers APIs, so it runs in
// either.
import {
  ROUTES_SEO,
  SITE_URL,
  SITE_NAV_LINKS,
  satsangSeo,
  ganeshSeo,
  weddingSeo,
} from '../data/routesSeo.js'
import { getSatsangTemplateBySlug } from '../data/satsangTemplatesData.js'
import { getGaneshTemplateBySlug } from '../data/ganeshTemplatesData.js'
import { findTemplateById } from '../data/templatesData.js'
import { getBlogPostBySlug, blogPostSeo, blogListSeo } from '../data/blogPosts.js'
import { REDIRECTS } from '../data/redirects.js'

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Finds a <meta ...> tag by an attribute match (e.g. `name="description"`)
// and swaps its content="..." value. `[^>]` matches newlines, so index.html's
// multi-line attribute formatting is fine.
function setMetaContent(html, attrMatch, value) {
  const re = new RegExp(`(<meta\\b[^>]*?${attrMatch}[^>]*?content=")[^"]*("[^>]*>)`, 'i')
  return html.replace(re, (_, open, close) => `${open}${escapeHtml(value)}${close}`)
}

function setCanonical(html, href) {
  return html.replace(
    /(<link\b[^>]*?rel="canonical"[^>]*?href=")[^"]*("[^>]*>)/i,
    (_, open, close) => `${open}${escapeHtml(href)}${close}`,
  )
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
}

// Marked so the client's <SEO> component can swap them on navigation without
// touching the site-wide Organization/WebSite/Service blocks in index.html.
function setJsonLd(html, blocks) {
  if (!blocks || !blocks.length) return html
  const tags = blocks
    .map(
      (block) =>
        `<script type="application/ld+json" data-seo-jsonld="1">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`,
    )
    .join('')
  return html.replace('</head>', () => `${tags}</head>`)
}

function renderSegments(segments) {
  return segments
    .map((seg) =>
      typeof seg === 'string' ? escapeHtml(seg) : `<a href="${escapeHtml(seg.href)}">${escapeHtml(seg.text)}</a>`,
    )
    .join('')
}

// Block shapes (also documented in blogPosts.js): a string is a <p>; an array
// is a <p> of text and { text, href } links; then { h2 }, { h3 }, { cta },
// { widget }, and two more for template pages: { links: [{ text, href }] }
// (a list of internal links) and { breadcrumb: [{ label, href? }] }.
export function renderBodyBlock(block) {
  if (typeof block === 'string') return `<p>${escapeHtml(block)}</p>`
  if (Array.isArray(block)) return `<p>${renderSegments(block)}</p>`
  if (block.h3) return `<h3>${escapeHtml(block.h3)}</h3>`
  if (block.cta) return `<p><a href="${escapeHtml(block.cta.href)}">${escapeHtml(block.cta.label)}</a></p>`
  if (block.widget) return '<p>Interactive demo: search for a song and preview a 30-second clip.</p>'
  if (block.links) {
    return `<ul>${block.links
      .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a></li>`)
      .join('')}</ul>`
  }
  if (block.breadcrumb) {
    const items = block.breadcrumb.map(
      (c) => `<li>${c.href ? `<a href="${escapeHtml(c.href)}">${escapeHtml(c.label)}</a>` : escapeHtml(c.label)}</li>`,
    )
    return `<nav aria-label="Breadcrumb"><ol>${items.join('')}</ol></nav>`
  }
  return `<h2>${escapeHtml(block.h2)}</h2>`
}

// Visually hidden, not display:none, so screen readers and text crawlers still
// read it. Inline, so it never flashes before React replaces #root's children.
const SR_ONLY_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'

function setRootContent(html, { h1, body, links }) {
  const blocks = body || []
  // A breadcrumb leads the page on screen, so it leads the raw HTML too.
  const lead = blocks[0] && blocks[0].breadcrumb ? renderBodyBlock(blocks[0]) : ''
  const content = (lead ? blocks.slice(1) : blocks).map(renderBodyBlock).join('')
  const nav =
    links && links.length
      ? `<nav>${links.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join(' ')}</nav>`
      : ''
  return html.replace(
    '<div id="root"></div>',
    () => `<div id="root"><div style="${SR_ONLY_STYLE}">${lead}<h1>${escapeHtml(h1)}</h1>${content}${nav}</div></div>`,
  )
}

export function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

export function getRedirectTarget(rawPathname) {
  return REDIRECTS[normalizePathname(rawPathname)] ?? null
}

// Per-route SEO for any URL the SPA router recognises, or null for an unknown
// one. Template lookups are strict on purpose: getTemplateById falls back to
// the first template, which would give every made-up /templates/wedding/xyz
// URL a real-looking, indexable page.
export function resolveSeoForPath(pathname) {
  if (ROUTES_SEO[pathname]) return ROUTES_SEO[pathname]
  if (pathname === '/blog') return blogListSeo()

  const satsang = pathname.match(/^\/satsang\/([^/]+)$/)
  if (satsang) {
    const template = getSatsangTemplateBySlug(decodeURIComponent(satsang[1]))
    if (template) return satsangSeo(template)
  }

  const ganesh = pathname.match(/^\/templates\/ganesh-chaturthi\/([^/]+)$/)
  if (ganesh) {
    const template = getGaneshTemplateBySlug(decodeURIComponent(ganesh[1]))
    if (template) return ganeshSeo(template)
  }

  const wedding = pathname.match(/^\/templates\/wedding\/([^/]+)$/)
  if (wedding) {
    const template = findTemplateById(decodeURIComponent(wedding[1]))
    if (template) return weddingSeo(template)
  }

  const blog = pathname.match(/^\/blog\/([^/]+)$/)
  if (blog) {
    const post = getBlogPostBySlug(decodeURIComponent(blog[1]))
    if (post) return blogPostSeo(post)
  }

  return null
}

export function renderSeoHtml(shellHtml, rawPathname) {
  const pathname = normalizePathname(rawPathname)
  const seo = resolveSeoForPath(pathname)
  const url = `${SITE_URL}${pathname}`

  if (!seo) {
    // Unknown route: the SPA draws its 404 client-side. Keep it out of the
    // index, and self-canonicalise instead of keeping the shell's homepage one.
    return setCanonical(setMetaContent(shellHtml, 'name="robots"', 'noindex, follow'), url)
  }

  const steps = [
    [setTitle, seo.title],
    [setMetaContent, 'name="description"', seo.description],
    [setMetaContent, 'name="robots"', seo.noindex ? 'noindex, follow' : 'index, follow'],
    [setCanonical, url],
    [setMetaContent, 'property="og:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'property="og:description"', seo.ogDescription || seo.description],
    [setMetaContent, 'property="og:url"', url],
    [setMetaContent, 'name="twitter:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'name="twitter:description"', seo.ogDescription || seo.description],
    [setJsonLd, seo.jsonLd],
  ]
  if (seo.h1) steps.push([setRootContent, { h1: seo.h1, body: seo.body, links: SITE_NAV_LINKS }])
  return steps.reduce((acc, [fn, ...args]) => fn(acc, ...args), shellHtml)
}
