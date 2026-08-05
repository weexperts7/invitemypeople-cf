// Shared Razorpay Standard Checkout helpers — mirrors the split in
// api/_lib/supabase.js and src/utils/slugify.js: one framework-agnostic
// module imported by both the local-dev Express routes (server/index.js)
// and their Vercel Serverless counterparts (api/create-order.js,
// api/verify-payment.js). Server-side only — RAZORPAY_KEY_SECRET must never
// be reachable from anything the client bundle imports.
import crypto from 'node:crypto'
import Razorpay from 'razorpay'

let client = null

function getClient() {
  if (client) return client

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set for this deployment.')
  }

  client = new Razorpay({ key_id, key_secret })
  return client
}

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
  const order = await getClient().orders.create({ amount, currency, receipt })
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
