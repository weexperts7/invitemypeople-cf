// Shared Razorpay Standard Checkout helpers — mirrors the split in
// api/_lib/supabase.js and src/utils/slugify.js: one framework-agnostic
// module imported by every runtime this app deploys to (local-dev Express
// in server/index.js, Vercel Serverless Functions, and Cloudflare Pages
// Functions — see functions/api/create-order.js). Server-side only —
// RAZORPAY_KEY_SECRET must never be reachable from anything the client
// bundle imports.
//
// Calls Razorpay's REST API directly via `fetch` rather than the `razorpay`
// npm SDK (which this module used until the Cloudflare migration): that SDK
// depends on axios, which picks a Node http/https adapter outside the
// browser — unavailable on Cloudflare Workers, which have no Node socket
// layer underneath a Pages Function even with the `nodejs_compat`
// compatibility flag (that flag covers built-in modules like node:crypto,
// not a working node:http client). `fetch` and node:crypto both work
// identically in Node 18+ and Workers, so this one implementation now
// covers every runtime instead of needing a Cloudflare-specific fork.
import crypto from 'node:crypto'

// Razorpay's own floor for an Order's amount — ₹1.
export const MIN_AMOUNT_PAISE = 100

/**
 * Creates a Razorpay Order — Standard Checkout's required first step. The
 * amount is whatever this request's own (already-validated) body carries;
 * the Checkout.js widget it's handed to and the signature verification
 * below both anchor back to this order_id, so nothing past this point ever
 * re-trusts a client-supplied amount.
 */
export async function createOrder({ amount, currency = 'INR', receipt }) {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set for this deployment.')
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${key_id}:${key_secret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency, receipt }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const err = new Error(body?.error?.description || `Razorpay order creation failed (HTTP ${response.status})`)
    if (response.status === 401) err.statusCode = 401
    throw err
  }

  const order = await response.json()
  return { order_id: order.id, amount: order.amount, currency: order.currency }
}

/**
 * Standard Checkout's own verification recipe: HMAC-SHA256 of
 * "{order_id}|{payment_id}", keyed with the account's key secret, must
 * equal the razorpay_signature the widget hands back on success. Compared
 * with timingSafeEqual (not ===) so the comparison itself can't leak a
 * forged signature one byte at a time via response-time differences.
 */
export function verifySignature({ orderId, paymentId, signature }) {
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not set for this deployment.')
  }

  const expected = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(String(signature ?? ''), 'utf8')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
