// Dynamic sitemap.xml — generated from the same route data every other SEO
// surface reads from (routesSeo.js, satsangTemplatesData.js,
// ganeshTemplatesData.js) instead of a hand-maintained public/sitemap.xml
// that silently goes stale every time a template ships. vercel.json rewrites
// GET /sitemap.xml here.
//
// Deliberately excludes: /i/:slug (dynamic, per-buyer invites — noindex'd,
// see GeneratedInvitePage.jsx) and /i/:slug/host/:hostToken (private host
// dashboards — see robots.txt's explicit Disallow for these).
import { ROUTES_SEO } from '../src/data/routesSeo.js'
import { SATSANG_TEMPLATES } from '../src/data/satsangTemplatesData.js'
import { GANESH_TEMPLATES } from '../src/data/ganeshTemplatesData.js'
import { BLOG_POSTS } from '../src/data/blogPosts.js'

// Kept in sync with routesSeo.js's SITE_URL — see its comment for why this
// has to be the www subdomain, not the apex domain (which redirects here).
const SITE_URL = 'https://www.invitemypeople.com'

// changefreq/priority per top-level path — mirrors the previous static
// sitemap's weighting (homepage highest, coming-soon lowest).
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
const COMING_SOON_META = { changefreq: 'weekly', priority: '0.7' }
const TEMPLATE_META = { changefreq: 'monthly', priority: '0.6' }
// /blog isn't a ROUTES_SEO key (see blogListSeo() in blogPosts.js — its SEO
// is computed straight from BLOG_POSTS instead), so it and every post get
// pushed explicitly below rather than falling out of the ROUTES_SEO loop.
const BLOG_LIST_META = { changefreq: 'weekly', priority: '0.7' }
const BLOG_POST_META = { changefreq: 'monthly', priority: '0.6' }

function urlEntry(loc, { changefreq, priority }) {
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

function buildSitemap() {
  const entries = []

  for (const path of Object.keys(ROUTES_SEO)) {
    const meta = STATIC_META[path] || COMING_SOON_META
    entries.push(urlEntry(path, meta))
  }
  for (const t of SATSANG_TEMPLATES) {
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
