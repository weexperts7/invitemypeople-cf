// Re-export point for the handful of things the *non*-thin-wrapper
// functions/**/*.js files need: the SEO route data (for the catch-all SSR
// shell and sitemap.xml) and the photo/video upload constants (for the 4
// Cloudflare-native upload routes — see functions/_lib/webUpload.js).
// Every plain JSON API route instead imports its existing Vercel handler
// directly and wraps it with toPagesFunction() (see functions/_lib/
// adapt.js) — those handlers already only touch req.method/req.query/
// req.body/res.status().json(), no Node built-ins, so there's nothing to
// re-export for them.
export { MAX_PHOTO_BYTES, ALLOWED_MIME_TYPES, randomPhotoFilename } from '../../src/utils/photoUpload.js'
export { MAX_VIDEO_BYTES, ALLOWED_VIDEO_MIME_TYPES, randomVideoFilename } from '../../src/utils/videoUpload.js'
export { getRequestUser, isAdminEmail } from '../../api/_lib/auth.js'
export { SITE_URL, ROUTES_SEO, SITE_NAV_LINKS, satsangSeo, ganeshSeo, weddingSeo } from '../../src/data/routesSeo.js'
export { getSatsangTemplateBySlug } from '../../src/data/satsangTemplatesData.js'
export { getGaneshTemplateBySlug } from '../../src/data/ganeshTemplatesData.js'
export { getTemplateById, TEMPLATES } from '../../src/data/templatesData.js'
export { getBlogPostBySlug, blogPostSeo, blogListSeo, BLOG_POSTS } from '../../src/data/blogPosts.js'
export { SATSANG_TEMPLATES } from '../../src/data/satsangTemplatesData.js'
export { GANESH_TEMPLATES } from '../../src/data/ganeshTemplatesData.js'
