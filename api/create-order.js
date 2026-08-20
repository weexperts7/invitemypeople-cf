// POST /api/create-order — a Vercel Serverless Function. Production
// counterpart to the local-dev POST /api/create-order route in
// server/index.js. See src/utils/razorpay.js for the shared order-creation
// logic and src/components/builder/PaymentModal.jsx for the Checkout.js
// widget that opens against the order this returns.
import { createOrder, MIN_AMOUNT_PAISE } from '../src/utils/razorpay.js'
import { getEffectivePrice } from './_lib/templatePrices.js'
import { clean } from './_lib/invites.js'
import { verifyTurnstileToken, getClientIp } from './_lib/turnstile.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}

    // Cloudflare Turnstile — see src/components/builder/PaymentModal.jsx,
    // which mints a token via TurnstileWidget.jsx and disables the "Pay"
    // button until one exists. Blocks scripted checkout abuse before a
    // Razorpay order is ever created.
    const verified = await verifyTurnstileToken(body.captchaToken, {
      remoteIp: getClientIp(req),
      expectedAction: 'checkout',
    })
    if (!verified) {
      return res.status(400).json({ ok: false, error: 'verification failed — please try again' })
    }

    const amount = Math.round(Number(body.amount))
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
      return res
        .status(400)
        .json({ ok: false, error: `amount must be at least ${MIN_AMOUNT_PAISE} paise` })
    }
    // Re-derives today's real price for THIS template on the server, in
    // paise, rather than trusting whatever amount the client happens to
    // send — so a tampered client can never buy an invite below the price
    // actually in effect right now (a Super Admin's per-template override,
    // see api/_lib/templatePrices.js, or the launch-sale rate before its
    // 17-day window — ../src/data/sale.js — closes).
    const templateKey = clean(body.templateId, 80)
    const expectedAmount = Math.round((await getEffectivePrice(templateKey)) * 100)
    if (amount !== expectedAmount) {
      return res.status(400).json({ ok: false, error: 'amount does not match the current price' })
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
