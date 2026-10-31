// Cloudflare Pages Function — thin wrapper. Reuses the existing Vercel
// Serverless Function handler unchanged — see functions/_lib/adapt.js.
import handler from '../../api/jaap.js'
import { toPagesFunction } from '../_lib/adapt.js'

export const onRequest = toPagesFunction(handler)
