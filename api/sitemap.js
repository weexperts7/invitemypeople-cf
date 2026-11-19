// Dynamic sitemap.xml — generated from the same route data every other SEO
// surface reads from (routesSeo.js, templatesData.js, satsangTemplatesData.js,
// ganeshTemplatesData.js) instead of a hand-maintained public/sitemap.xml
// that silently goes stale every time a template ships. vercel.json rewrites
// GET /sitemap.xml here.
//
// Deliberately excludes: /i/:slug (dynamic, per-buyer invites — noindex'd,
// see GeneratedInvitePage.jsx) and /i/:slug/host/:hostToken (private host
// dashboards — see robots.txt's explicit Disallow for these).
import { ROUTES_SEO } from '../src/data/routesSeo.js'
import { TEMPLATES } from '../src/data/templatesData.js'
import { SATSANG_TEMPLATES } from '../src/data/satsangTemplatesData.js'
import { GANESH_TEMPLATES } from '../src/data/ganeshTemplatesData.js'
import { BLOG_POSTS } from '../src/data/blogPosts.js'
import { LASTMOD } from '../src/data/lastmod.js'
import { SITE_URL } from '../src/data/siteUrl.js'


// changefreq/priority per top-level path — homepage highest.
const STATIC_META = {
  '/': { changefreq: 'weekly', priority: '1.0' },
  '/about': { changefreq: 'monthly', priority: '0.9' },
  '/weddings': { changefreq: 'weekly', priority: '0.8' },
  '/guruji-satsangs': { changefreq: 'weekly', priority: '0.8' },
  '/templates/ganesh-chaturthi': { changefreq: 'weekly', priority: '0.8' },
  '/create': { changefreq: 'monthly', priority: '0.8' },
  '/partners': { changefreq: 'monthly', priority: '0.7' },
  '/privacy': { changefreq: 'yearly', priority: '0.3' },
  '/terms': { changefreq: 'yearly', priority: '0.3' },
  '/refund': { changefreq: 'yearly', priority: '0.3' },
}
const DEFAULT_META = { changefreq: 'monthly', priority: '0.6' }
const TEMPLATE_META = { changefreq: 'monthly', priority: '0.6' }
// /blog isn't a ROUTES_SEO key (see blogListSeo() in blogPosts.js — its SEO
// is computed straight from BLOG_POSTS instead), so it and every post get
// pushed explicitly below rather than falling out of the ROUTES_SEO loop.
const BLOG_LIST_META = { changefreq: 'weekly', priority: '0.7' }
const BLOG_POST_META = { changefreq: 'monthly', priority: '0.6' }

// <lastmod> comes from src/data/lastmod.js (npm run lastmod). A URL with no
// date there simply has no <lastmod>; a made-up date is worse than none.
function urlEntry(loc, { changefreq, priority }) {
  const date = LASTMOD[loc]
  const lastmod = date ? `\n    <lastmod>${date}</lastmod>` : ''
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>${lastmod}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

// Only pages that should be in search results: indexable, canonical and not a
// redirect. Coming-soon categories (noindex), the retired /ganesh-chaturthi-invites
// (a 301), and hidden or demo-only templates are all left out.
export function buildSitemap() {
  const entries = []

  for (const [path, seo] of Object.entries(ROUTES_SEO)) {
    if (seo.noindex) continue
    entries.push(urlEntry(path, STATIC_META[path] || DEFAULT_META))
  }
  for (const t of TEMPLATES.filter((x) => !x.hidden)) {
    entries.push(urlEntry(`/templates/wedding/${t.id}`, TEMPLATE_META))
  }
  for (const t of SATSANG_TEMPLATES.filter((s) => s.fullExperience)) {
    entries.push(urlEntry(`/satsang/${t.slug}`, TEMPLATE_META))
  }
  for (const t of GANESH_TEMPLATES) {
    entries.push(urlEntry(`/templates/ganesh-chaturthi/${t.slug}`, TEMPLATE_META))
  }

  entries.push(urlEntry('/blog', BLOG_LIST_META))
  for (const post of BLOG_POSTS) {
    entries.push(urlEntry(`/blog/${post.slug}`, BLOG_POST_META))
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

export default function handler(_req, res) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return res.status(200).send(buildSitemap())
}
