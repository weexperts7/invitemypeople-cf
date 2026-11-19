// The one canonical origin. www is the host that serves content; the bare
// domain and plain http 301 to it (see functions/_middleware.js), so every
// canonical, og:url, sitemap and JSON-LD URL must use it. Keep index.html and
// public/robots.txt in step with this if it ever changes.
export const SITE_URL = 'https://www.invitemypeople.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`
