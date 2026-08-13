import { useCallback, useEffect, useState } from 'react'
import { CreditCard, Loader2, Minus, Plus, Wallet } from 'lucide-react'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { loadRazorpayCheckout } from '../../utils/loadRazorpayCheckout'
import { getMyCredits, createPurchaseOrder, verifyPurchase } from '../../utils/partnerApi'
import { PARTNER_PACKAGES } from '../../data/partnerPackages'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

function CreditLedger({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
        No credit activity yet.
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between rounded-xl border border-white/60 bg-ivory/50 px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-2">
            {tx.credits >= 0 ? (
              <Plus className="h-3.5 w-3.5 text-rose" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-ink-soft" />
            )}
            <div>
              <p className="text-ink">{tx.note || tx.type}</p>
              <p className="text-xs text-ink-soft/70">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={tx.credits >= 0 ? 'font-medium text-rose' : 'font-medium text-ink-soft'}>
              {tx.credits >= 0 ? '+' : ''}
              {tx.credits}
            </p>
            <p className="text-xs text-ink-soft/70">{tx.balanceAfter} remaining</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// "Credits & Billing" in the sidebar (see PartnerPortalShell.jsx) — balance,
// package purchase, and the full ledger, split out from the old
// all-in-one PartnerDashboardPage.jsx onto its own page.
export default function PartnerCreditsPage() {
  const { accessToken } = usePartnerAuth()
  const [credits, setCredits] = useState(null)
  const [purchasingId, setPurchasingId] = useState(null)
  const [purchaseError, setPurchaseError] = useState(null)

  const loadCredits = useCallback(async () => {
    try {
      setCredits(await getMyCredits(accessToken))
    } catch (err) {
      console.error('[PartnerCredits] failed to load credits:', err)
    }
  }, [accessToken])

  useEffect(() => {
    loadCredits()
  }, [loadCredits])

  const handlePurchase = async (pkg) => {
    if (!RAZORPAY_KEY_ID) {
      setPurchaseError('Payments are not configured for this deployment.')
      return
    }
    setPurchaseError(null)
    setPurchasingId(pkg.id)
    try {
      await loadRazorpayCheckout()
      const order = await createPurchaseOrder(accessToken, pkg.id)

      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: 'InviteMyPeople Partner Program',
        description: `${pkg.label} — ${pkg.credits} credits`,
        theme: { color: '#0a2540' },
        handler: async (response) => {
          try {
            await verifyPurchase(accessToken, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pkg.id,
            })
            // Credits land instantly — refetch right away so the balance
            // on screen updates without a page reload.
            await loadCredits()
          } catch (err) {
            console.error('[PartnerCredits] purchase verification failed:', err)
            setPurchaseError(
              err.message || "We couldn't confirm your purchase. If money was deducted, contact support.",
            )
          } finally {
            setPurchasingId(null)
          }
        },
        modal: { ondismiss: () => setPurchasingId(null) },
      })
      rzp.on('payment.failed', (response) => {
        setPurchaseError(response.error?.description || 'Payment failed. Please try again.')
        setPurchasingId(null)
      })
      rzp.open()
    } catch (err) {
      console.error('[PartnerCredits] failed to start purchase:', err)
      setPurchaseError(err.message || 'Could not start checkout.')
      setPurchasingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Credits & Billing | Partner Dashboard" path="/partners/dashboard/credits" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Portal</p>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
        <Wallet className="h-6 w-6 text-rose" />
        Credits &amp; Billing
      </h1>

      <div className="mt-8 rounded-2xl border border-white/60 bg-ivory/60 px-5 py-4 shadow-soft">
        <div className="font-serif text-3xl text-ink">
          {credits ? credits.creditsRemaining : <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">credits remaining</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PARTNER_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 text-center shadow-soft"
          >
            <p className="font-serif text-lg text-ink">{pkg.label}</p>
            <p className="text-sm text-ink-soft">{pkg.credits} credits</p>
            <p className="mt-1 font-medium text-ink">
              &#8377;{(pkg.pricePaise / 100).toLocaleString('en-IN')}
            </p>
            <button
              type="button"
              onClick={() => handlePurchase(pkg)}
              disabled={purchasingId === pkg.id}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-4 py-2 text-sm font-medium text-ivory shadow-card disabled:opacity-60"
            >
              {purchasingId === pkg.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CreditCard className="h-3.5 w-3.5" />
              )}
              Buy
            </button>
          </div>
        ))}
      </div>
      {purchaseError && (
        <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-sm text-rose">{purchaseError}</p>
      )}

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-xl text-ink">Ledger</h2>
        {credits ? (
          <CreditLedger transactions={credits.transactions || []} />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-ink-soft">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </section>
    </div>
  )
}
