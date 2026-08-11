import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  CheckCircle2,
  Copy,
  CreditCard,
  ImagePlus,
  Link2,
  Loader2,
  LogOut,
  Minus,
  Plus,
  Sparkles,
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
  updateProfile as updateProfileApi,
  uploadPartnerLogo,
  createPurchaseOrder,
  verifyPurchase,
  getMyInvites,
  createClientInvite,
} from '../../utils/partnerApi'
import { PARTNER_PACKAGES } from '../../data/partnerPackages'
import { TEMPLATES } from '../../data/templatesData'
import { SITE_URL } from '../../data/routesSeo'

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
            <p className="text-xs text-ink-soft/70">{tx.balanceAfter} remaining</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CopyLinkButton({ url }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[PartnerDashboard] clipboard copy failed:', err)
    }
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-3.5 py-2 text-xs font-medium text-ivory shadow-card"
    >
      {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DashboardContent() {
  const { partner, accessToken, signOut, refreshProfile } = usePartnerAuth()

  const [credits, setCredits] = useState(null) // { creditsRemaining, transactions }
  const [purchasingId, setPurchasingId] = useState(null)
  const [purchaseError, setPurchaseError] = useState(null)

  const [profile, setProfile] = useState(null)
  const [profileLogoFile, setProfileLogoFile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [invites, setInvites] = useState([])
  const [inviteForm, setInviteForm] = useState({
    coupleNames: '',
    weddingDate: '',
    weddingTime: '',
    venue: '',
    locationUrl: '',
    message: '',
    templateId: TEMPLATES[0]?.id || '',
  })
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const loadCredits = useCallback(async () => {
    try {
      setCredits(await getMyCredits(accessToken))
    } catch (err) {
      console.error('[PartnerDashboard] failed to load credits:', err)
    }
  }, [accessToken])

  const loadInvites = useCallback(async () => {
    try {
      const result = await getMyInvites(accessToken)
      setInvites(result.invites)
    } catch (err) {
      console.error('[PartnerDashboard] failed to load invites:', err)
    }
  }, [accessToken])

  useEffect(() => {
    loadCredits()
    loadInvites()
  }, [loadCredits, loadInvites])

  useEffect(() => {
    if (partner) {
      setProfile({
        businessName: partner.businessName || '',
        address: partner.address || '',
        phone: partner.phone || '',
        logoUrl: partner.logoUrl || '',
      })
    }
  }, [partner])

  // A partner's own approval status can only ever move forward (or to
  // 'rejected'/'suspended') server-side — nothing on this page can change
  // it — so bouncing away here is safe from render loops.
  if (partner && partner.status !== 'active') {
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
            // Credits land instantly — refetch right away so the balance
            // on screen updates without a page reload.
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      let logoUrl = profile.logoUrl
      if (profileLogoFile) {
        logoUrl = await uploadPartnerLogo(profileLogoFile)
      }
      await updateProfileApi(accessToken, { ...profile, logoUrl })
      await refreshProfile()
      setProfileLogoFile(null)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } catch (err) {
      console.error('[PartnerDashboard] failed to save profile:', err)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    setCreatingInvite(true)
    setInviteError(null)
    try {
      await createClientInvite(accessToken, inviteForm)
      setInviteForm((f) => ({ ...f, coupleNames: '', weddingDate: '', weddingTime: '', venue: '', locationUrl: '', message: '' }))
      await Promise.all([loadCredits(), loadInvites()])
    } catch (err) {
      setInviteError(err.message || 'Could not create the invite.')
    } finally {
      setCreatingInvite(false)
    }
  }

  if (!partner || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-soft">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  const noCredits = (credits?.creditsRemaining ?? 0) < 1

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title="Partner Dashboard | InviteMyPeople" path="/partners/dashboard" noindex />
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {partner.logoUrl && (
              <img src={partner.logoUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Dashboard</p>
              <h1 className="mt-1 font-serif text-3xl text-ink">{partner.businessName}</h1>
            </div>
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
            <div className="font-serif text-3xl text-ink">{credits?.creditsRemaining ?? '—'}</div>
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

          <div className="mt-6">
            <CreditLedger transactions={credits?.transactions || []} />
          </div>
        </section>

        {/* Create a client invite */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <Sparkles className="h-4 w-4 text-rose" />
            Create a client invite
          </h2>
          <form
            onSubmit={handleInviteSubmit}
            className="grid gap-4 rounded-2xl border border-white/60 bg-ivory/50 px-5 py-5 shadow-soft sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Couple names</label>
              <input
                required
                placeholder="Meenal & Avinash"
                className={FIELD_CLASS}
                value={inviteForm.coupleNames}
                onChange={(e) => setInviteForm((f) => ({ ...f, coupleNames: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Wedding date</label>
              <input
                required
                type="date"
                className={FIELD_CLASS}
                value={inviteForm.weddingDate}
                onChange={(e) => setInviteForm((f) => ({ ...f, weddingDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Time (optional)</label>
              <input
                type="time"
                className={FIELD_CLASS}
                value={inviteForm.weddingTime}
                onChange={(e) => setInviteForm((f) => ({ ...f, weddingTime: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Venue</label>
              <input
                required
                className={FIELD_CLASS}
                value={inviteForm.venue}
                onChange={(e) => setInviteForm((f) => ({ ...f, venue: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Map link (optional)</label>
              <input
                className={FIELD_CLASS}
                placeholder="https://maps.google.com/…"
                value={inviteForm.locationUrl}
                onChange={(e) => setInviteForm((f) => ({ ...f, locationUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Look &amp; feel</label>
              <select
                className={FIELD_CLASS}
                value={inviteForm.templateId}
                onChange={(e) => setInviteForm((f) => ({ ...f, templateId: e.target.value }))}
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Message (optional)</label>
              <textarea
                rows={2}
                className={FIELD_CLASS}
                value={inviteForm.message}
                onChange={(e) => setInviteForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>

            {inviteError && (
              <p className="sm:col-span-2 rounded-lg bg-blush px-3 py-2 text-sm text-rose">{inviteError}</p>
            )}
            {noCredits && !inviteError && (
              <p className="sm:col-span-2 rounded-lg bg-champagne/40 px-3 py-2 text-sm text-ink-soft">
                You have no credits remaining — buy a package above first.
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creatingInvite || noCredits}
                className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
              >
                {creatingInvite && <Loader2 className="h-4 w-4 animate-spin" />}
                Generate invite (1 credit)
              </button>
            </div>
          </form>
        </section>

        {/* Past invites */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <Link2 className="h-4 w-4 text-rose" />
            Your invites
          </h2>
          {invites.length === 0 ? (
            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
              No invites created yet.
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map((inv) => {
                const url = `${SITE_URL}/p/${inv.slug}`
                return (
                  <div
                    key={inv.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/60 bg-ivory/50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-ink">{inv.coupleNames}</p>
                      <p className="text-xs text-ink-soft/70">
                        {inv.venue} · {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="max-w-[220px] truncate text-xs text-ink-soft">{url}</span>
                      <CopyLinkButton url={url} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Business profile */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <ImagePlus className="h-4 w-4 text-rose" />
            Business profile &amp; branding
          </h2>
          <form
            onSubmit={handleProfileSubmit}
            className="grid gap-4 rounded-2xl border border-white/60 bg-ivory/50 px-5 py-5 shadow-soft sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Business name</label>
              <input
                className={FIELD_CLASS}
                value={profile.businessName}
                onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Phone</label>
              <input
                className={FIELD_CLASS}
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Address</label>
              <textarea
                rows={2}
                className={FIELD_CLASS}
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Logo</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-champagne-deep/60 bg-ivory/50 px-4 py-3 text-sm text-ink-soft hover:bg-ivory">
                {profileLogoFile ? (
                  <img src={URL.createObjectURL(profileLogoFile)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : profile.logoUrl ? (
                  <img src={profile.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                {profileLogoFile ? profileLogoFile.name : 'Change logo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => setProfileLogoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
              >
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
              {profileSaved && (
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
