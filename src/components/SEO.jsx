import { useEffect } from 'react'
import { SITE_URL, DEFAULT_OG_IMAGE } from '../data/routesSeo'

// Upserts a <meta> tag by attribute selector rather than assuming it already
// exists in index.html — keeps this component usable for tags the static
// HTML doesn't define per-route (og:url changes on every navigation, for
// instance) without throwing if the element isn't there yet.
function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== 'content') el.setAttribute(key, value)
    })
    document.head.appendChild(el)
  }
  el.setAttribute('content', attrs.content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Updates document.title, meta description, canonical link, and Open
// Graph/Twitter tags on every route change. This covers the browser tab and
// JS-executing crawlers (Googlebot). It does NOT cover WhatsApp's link
// preview scraper, which never runs JS — that path is handled server-side
// in server/index.js, which injects the same per-route copy (see
// ../data/routesSeo.js) directly into the HTML response.
export default function SEO({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' })
    upsertCanonical(url)
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: ogTitle || title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: ogDescription || description,
    })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: ogTitle || title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: ogDescription || description,
    })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage })
  }, [title, description, path, ogTitle, ogDescription, ogImage, noindex])

  return null
}
