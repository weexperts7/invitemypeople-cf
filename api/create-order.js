// POST /api/create-order — a Vercel Serverless Function. Production
// counterpart to the local-dev POST /api/create-order route in
// server/index.js. See src/utils/razorpay.js for the shared order-creation
// logic and src/components/builder/PaymentModal.jsx for the Checkout.js
// widget that opens against the order this returns.
import { createOrder, MIN_AMOUNT_PAISE } from '../src/utils/razorpay.js'
import { clean } from './_lib/invites.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}
    const amount = Math.round(Number(body.amount))
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
      return res
        .status(400)
        .json({ ok: false, error: `amount must be at least ${MIN_AMOUNT_PAISE} paise` })
    }

    const receipt = clean(body.receipt, 60) || `receipt_${Date.now()}`
    const order = await createOrder({
      amount,
      currency: clean(body.currency, 3) || 'INR',
      receipt,
    })
    res.status(200).json({ ok: true, ...order })
  } catch (err) {
    console.error('[create-order] failed:', err)
    if (err.statusCode === 401) {
      return res.status(401).json({ ok: false, error: 'Razorpay authentication failed' })
    }
    res.status(500).json({ ok: false, error: 'could not create payment order' })
  }
}
