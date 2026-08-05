// POST /api/verify-payment — a Vercel Serverless Function. Production
// counterpart to the local-dev POST /api/verify-payment route in
// server/index.js. Wraps src/utils/razorpay.js's HMAC check — nothing
// downstream should treat an invite as paid until this returns ok:true.
import { verifySignature } from '../src/utils/razorpay.js'
import { clean } from './_lib/invites.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}
    const orderId = clean(body.razorpay_order_id, 100)
    const paymentId = clean(body.razorpay_payment_id, 100)
    const signature = clean(body.razorpay_signature, 200)
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ ok: false, error: 'missing payment fields' })
    }

    if (!verifySignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ ok: false, error: 'signature mismatch' })
    }

    res.status(200).json({ ok: true, paymentId })
  } catch (err) {
    console.error('[verify-payment] failed:', err)
    res.status(500).json({ ok: false, error: 'could not verify payment' })
  }
}
