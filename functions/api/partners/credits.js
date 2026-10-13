// Cloudflare Pages Function — thin wrapper. Reuses the existing Vercel
// Serverless Function handler unchanged (it already only touches
// req.method/req.query/req.body/res.status().json(), no Node built-ins) via
// toPagesFunction() — see functions/_lib/adapt.js for why this is safe and
// preferred over rewriting each route's logic by hand.
import handler from '../../../api/partners/credits.js'
import { toPagesFunction } from '../../_lib/adapt.js'

export const onRequest = toPagesFunction(handler)
