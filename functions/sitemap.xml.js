// GET /sitemap.xml — Cloudflare Pages Function. api/sitemap.js's handler is
// already pure (no Node built-ins, just string-building off src/data/*),
// so it's reused unchanged via toPagesFunction() — same pattern as every
// thin wrapper under functions/api/.
import handler from '../api/sitemap.js'
import { toPagesFunction } from './_lib/adapt.js'

export const onRequest = toPagesFunction(handler)
