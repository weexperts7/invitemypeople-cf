import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  LogOut,
  Minus,
  Palette,
  Plus,
  Wallet,
} from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import SEO from '../../components/SEO'
import RequirePartnerAuth from '../../components/partners/RequirePartnerAuth'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { loadRazorpayCheckout } from '../../utils/loadRazorpayCheckout'
import {
  getMyCredits,
  updateBranding as updateBrandingApi,
  createPurchaseOrder,
  verifyPurchase,
} from '../../utils/partnerApi'
import { PARTNER_PACKAGES } from '../../data/partnerPackages'

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

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
            <p className="text-xs text-ink-soft/70">balance {tx.balanceAfter}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardContent() {
  const { partner, accessToken, signOut, refreshProfile } = usePartnerAuth()
  const [credits, setCredits] = useState(null) // { balance, transactions }
  const [purchasingId, setPurchasingId] = useState(null)
  const [purchaseError, setPurchaseError] = useState(null)

  const [branding, setBranding] = useState(null)
  const [savingBranding, setSavingBranding] = useState(false)
  const [brandingSaved, setBrandingSaved] = useState(false)

  const loadCredits = useCallback(async () => {
    try {
      const result = await getMyCredits(accessToken)
      setCredits(result)
    } catch (err) {
      console.error('[PartnerDashboard] failed to load credits:', err)
    }
  }, [accessToken])

  useEffect(() => {
    loadCredits()
  }, [loadCredits])

  useEffect(() => {
    if (partner) {
      setBranding({
        contactName: partner.contactName || '',
        phone: partner.phone || '',
        brandDisplayName: partner.brandDisplayName || '',
        brandLogoUrl: partner.brandLogoUrl || '',
        brandPrimaryColor: partner.brandPrimaryColor || '',
        brandSecondaryColor: partner.brandSecondaryColor || '',
      })
    }
  }, [partner])

  // A partner's own approval status can only ever move forward (or to
  // 'rejected'/'suspended') server-side — nothing on this page can change
  // it — so bouncing away here is safe from render loops.
  if (partner && partner.status !== 'approved') {
    return <Navigate to="/partners/pending" replace />
  }

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
            await loadCredits()
          } catch (err) {
            console.error('[PartnerDashboard] purchase verification failed:', err)
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
      console.error('[PartnerDashboard] failed to start purchase:', err)
      setPurchaseError(err.message || 'Could not start checkout.')
      setPurchasingId(null)
    }
  }

  const handleBrandingSubmit = async (e) => {
    e.preventDefault()
    setSavingBranding(true)
    setBrandingSaved(false)
    try {
      await updateBrandingApi(accessToken, branding)
      await refreshProfile()
      setBrandingSaved(true)
      setTimeout(() => setBrandingSaved(false), 2500)
    } catch (err) {
      console.error('[PartnerDashboard] failed to save branding:', err)
    } finally {
      setSavingBranding(false)
    }
  }

  if (!partner || !branding) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-soft">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title="Partner Dashboard | InviteMyPeople" path="/partners/dashboard" noindex />
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Dashboard</p>
            <h1 className="mt-1 font-serif text-3xl text-ink">{partner.businessName}</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2 text-sm text-ink hover:bg-ivory"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>

        {/* Credit balance + purchase */}
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <Wallet className="h-4 w-4 text-rose" />
            Credits
          </h2>
          <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-4 shadow-soft">
            <div className="font-serif text-3xl text-ink">{credits?.balance ?? '—'}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-ink-soft">credits available</div>
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

          <div className="mt-6">
            <CreditLedger transactions={credits?.transactions || []} />
          </div>
        </section>

        {/* Branding */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <Palette className="h-4 w-4 text-rose" />
            White-label branding
          </h2>
          <form
            onSubmit={handleBrandingSubmit}
            className="grid gap-4 rounded-2xl border border-white/60 bg-ivory/50 px-5 py-5 shadow-soft sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Display name</label>
              <input
                className={FIELD_CLASS}
                placeholder={partner.businessName}
                value={branding.brandDisplayName}
                onChange={(e) => setBranding((b) => ({ ...b, brandDisplayName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Logo URL</label>
              <input
                className={FIELD_CLASS}
                placeholder="https://…"
                value={branding.brandLogoUrl}
                onChange={(e) => setBranding((b) => ({ ...b, brandLogoUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Primary color</label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="#b3541e"
                value={branding.brandPrimaryColor}
                onChange={(e) => setBranding((b) => ({ ...b, brandPrimaryColor: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Secondary color</label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="#fbf3ea"
                value={branding.brandSecondaryColor}
                onChange={(e) => setBranding((b) => ({ ...b, brandSecondaryColor: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Contact name</label>
              <input
                className={FIELD_CLASS}
                value={branding.contactName}
                onChange={(e) => setBranding((b) => ({ ...b, contactName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Phone</label>
              <input
                className={FIELD_CLASS}
                value={branding.phone}
                onChange={(e) => setBranding((b) => ({ ...b, phone: e.target.value }))}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingBranding}
                className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
              >
                {savingBranding && <Loader2 className="h-4 w-4 animate-spin" />}
                Save branding
              </button>
              {brandingSaved && (
                <span className="flex items-center gap-1.5 text-sm text-rose">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function PartnerDashboardPage() {
  return (
    <RequirePartnerAuth loginPath="/partners/login">
      <DashboardContent />
    </RequirePartnerAuth>
  )
}
