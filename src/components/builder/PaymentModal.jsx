// A Razorpay Test Mode checkout — simulated for now, since this project has
// no live Razorpay account/keys yet (see CreateInvitePage.jsx). Deliberately
// isolated behind one call site (openPayment-style props: amount, summary,
// onSuccess, onClose) so wiring up the real Razorpay Checkout.js widget
// later is a swap of this component's insides, not a change to anything
// that calls it — CreateInvitePage still just gets a paymentId back.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Loader2, Lock, ShieldCheck, X } from 'lucide-react'

function fakeRazorpayPaymentId() {
  return `pay_test_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export default function PaymentModal({ open, amount, summary, onSuccess, onClose }) {
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState('confirm') // confirm | processing | success

  // Reset to a clean slate every time the modal is (re)opened, so a second
  // checkout after closing the first mid-flow doesn't reopen mid-"processing".
  useEffect(() => {
    if (open) setStage('confirm')
  }, [open])

  useEffect(() => {
    if (stage !== 'processing') return
    const timer = setTimeout(() => {
      setStage('success')
    }, 1400)
    return () => clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'success') return
    const timer = setTimeout(() => {
      onSuccess(fakeRazorpayPaymentId())
    }, 1000)
    return () => clearTimeout(timer)
  }, [stage, onSuccess])

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
            {/* Header strip — Razorpay's own blue, so the "Test Mode" framing
                reads as an actual payment gateway rather than a generic modal. */}
            <div className="flex items-center justify-between bg-[#0a2540] px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Lock className="h-4 w-4 text-[#3395ff]" />
                Razorpay
                <span className="rounded-full bg-[#3395ff]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#7bb8ff]">
                  Test Mode
                </span>
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
                    <p className="font-serif text-3xl text-ink mb-4">
                      &#8377;{amount.toLocaleString('en-IN')}
                    </p>

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
                      onClick={() => setStage('processing')}
                      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0a2540] px-5 py-3.5 text-sm font-semibold text-white shadow-card"
                    >
                      <Lock className="h-4 w-4" />
                      Pay &#8377;{amount.toLocaleString('en-IN')} (Test Mode)
                    </motion.button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-soft">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      No real money is charged in Test Mode.
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
                    <p className="font-serif text-xl text-ink mb-1">Processing payment&hellip;</p>
                    <p className="text-sm text-ink-soft">Please don&rsquo;t close this window.</p>
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
