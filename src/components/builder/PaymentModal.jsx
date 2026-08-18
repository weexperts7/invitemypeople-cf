// Razorpay Standard Checkout — see CreateInvitePage.jsx for the caller.
// Deliberately isolated behind one call site (amount, templateId, summary,
// onSuccess, onClose) so this is the only file that knows about order
// creation, Checkout.js, or signature verification; nothing that calls it
// needs to change if the payment provider ever does.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Lock, ShieldCheck, X } from 'lucide-react'
import { loadRazorpayCheckout } from '../../utils/loadRazorpayCheckout'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

async function verifyPayment(response) {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok || !result?.ok) {
    throw new Error(result?.error || 'Payment verification failed')
  }
  return result.paymentId
}

export default function PaymentModal({ open, amount, originalAmount, templateId, summary, onSuccess, onClose }) {
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState('confirm') // confirm | processing | verifying | success | error
  const [errorMessage, setErrorMessage] = useState(null)
  // Guards the async pay() call below against a modal that's already been
  // closed (or reopened) by the time create-order/Checkout.js resolves.
  const cancelledRef = useRef(false)

  // Reset to a clean slate every time the modal is (re)opened, so a second
  // checkout after closing the first mid-flow doesn't reopen mid-"success".
  useEffect(() => {
    cancelledRef.current = !open
    if (open) {
      setStage('confirm')
      setErrorMessage(null)
    }
    return () => {
      cancelledRef.current = true
    }
  }, [open])

  // onSuccess only fires after the timer below, once the "success" stage's
  // had a moment to show — stash the verified paymentId on a ref rather
  // than in state so the effect doesn't need it as a dependency.
  const successPaymentId = useRef(null)

  useEffect(() => {
    if (stage !== 'success') return
    const timer = setTimeout(() => {
      onSuccess(successPaymentId.current)
    }, 1000)
    return () => clearTimeout(timer)
  }, [stage, onSuccess])

  const handlePay = async () => {
    if (!RAZORPAY_KEY_ID) {
      setErrorMessage('Payments are not configured for this deployment.')
      setStage('error')
      return
    }

    setErrorMessage(null)
    setStage('processing')

    try {
      await loadRazorpayCheckout()

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // rupees -> paise
          currency: 'INR',
          receipt: `invite_${Date.now()}`,
          // Lets the server re-derive THIS template's real price (a Super
          // Admin override, or the global default — see
          // api/_lib/templatePrices.js) instead of just checking `amount`
          // against one global price.
          templateId,
        }),
      })
      const order = await orderRes.json().catch(() => null)
      if (!orderRes.ok || !order?.ok) {
        throw new Error(order?.error || 'Could not start payment')
      }

      if (cancelledRef.current) return // modal was closed while the order request was in flight

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'InviteMyPeople',
        description: `${summary.templateName} — ${summary.names}`,
        theme: { color: '#0a2540' },
        handler: async (response) => {
          setStage('verifying')
          try {
            const paymentId = await verifyPayment(response)
            if (cancelledRef.current) return
            successPaymentId.current = paymentId
            setStage('success')
          } catch (err) {
            console.error('[razorpay] verification failed:', err)
            if (cancelledRef.current) return
            setErrorMessage(
              "We couldn't verify your payment. If money was deducted, it will be refunded automatically — please try again.",
            )
            setStage('error')
          }
        },
        modal: {
          // Fires when the user closes Checkout.js without paying — but
          // also after a successful payment on some flows, so only bounce
          // back to "confirm" if we're still mid-"processing".
          ondismiss: () => {
            if (!cancelledRef.current) setStage((s) => (s === 'processing' ? 'confirm' : s))
          },
        },
      })

      rzp.on('payment.failed', (response) => {
        console.error('[razorpay] payment failed:', response.error)
        if (cancelledRef.current) return
        setErrorMessage(response.error?.description || 'Payment failed. Please try again.')
        setStage('error')
      })

      rzp.open()
    } catch (err) {
      console.error('[razorpay] checkout failed to start:', err)
      if (cancelledRef.current) return
      setErrorMessage(err.message || 'Could not start payment. Please try again.')
      setStage('error')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={stage === 'confirm' ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/60 bg-ivory shadow-soft"
          >
            {/* Header strip — Razorpay's own blue, so the checkout reads as
                an actual payment gateway rather than a generic modal. */}
            <div className="flex items-center justify-between bg-[#0a2540] px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Lock className="h-4 w-4 text-[#3395ff]" />
                Razorpay
                {RAZORPAY_KEY_ID?.startsWith('rzp_test_') && (
                  <span className="rounded-full bg-[#3395ff]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#7bb8ff]">
                    Test Mode
                  </span>
                )}
              </div>
              {stage === 'confirm' && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="px-6 py-7 text-center">
              <AnimatePresence mode="wait">
                {stage === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-1">
                      Paying InviteMyPeople
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2">
                        <p className="font-serif text-3xl text-ink">
                          &#8377;{amount.toLocaleString('en-IN')}
                        </p>
                        {originalAmount > amount && (
                          <p className="text-base text-ink-soft/60 line-through">
                            &#8377;{originalAmount.toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                      {originalAmount > amount && (
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-blush px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rose">
                          Launch Sale — Save {Math.round(((originalAmount - amount) / originalAmount) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="mb-5 space-y-1 rounded-2xl border border-champagne-deep/40 bg-champagne/30 px-4 py-3 text-left text-sm text-ink-soft">
                      <p className="flex justify-between">
                        <span>Template</span>
                        <span className="font-medium text-ink">{summary.templateName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Invitation for</span>
                        <span className="font-medium text-ink">{summary.names}</span>
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handlePay}
                      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a2540] px-5 py-3.5 text-sm font-semibold text-white shadow-card"
                    >
                      <Lock className="h-4 w-4" />
                      Pay &#8377;{amount.toLocaleString('en-IN')}
                    </motion.button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Secured by Razorpay.
                    </p>
                  </motion.div>
                )}

                {stage === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8"
                  >
                    <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-[#3395ff]" />
                    <p className="font-serif text-xl text-ink mb-1">Opening Razorpay Checkout&hellip;</p>
                    <p className="text-sm text-ink-soft">Complete your payment in the window that opens.</p>
                  </motion.div>
                )}

                {stage === 'verifying' && (
                  <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8"
                  >
                    <Loader2 className="mx-auto mb-4 h-9 w-9 animate-spin text-[#3395ff]" />
                    <p className="font-serif text-xl text-ink mb-1">Verifying payment&hellip;</p>
                    <p className="text-sm text-ink-soft">Please don&rsquo;t close this window.</p>
                  </motion.div>
                )}

                {stage === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6"
                  >
                    <AlertCircle className="mx-auto mb-4 h-11 w-11 text-rose" strokeWidth={1.2} />
                    <p className="font-serif text-xl text-ink mb-1">Payment Didn&rsquo;t Go Through</p>
                    <p className="mb-5 text-sm text-ink-soft">
                      {errorMessage || 'Something went wrong. Please try again.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStage('confirm')}
                      className="w-full rounded-full bg-[#0a2540] px-5 py-3 text-sm font-semibold text-white shadow-card"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {stage === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -120 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                    >
                      <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-rose" strokeWidth={1.2} />
                    </motion.div>
                    <p className="font-serif text-xl text-ink mb-1">Payment Successful</p>
                    <p className="text-sm text-ink-soft">
                      Generating your live invitation&hellip;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
