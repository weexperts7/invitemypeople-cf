import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Lock, LogOut, X } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import SEO from '../../components/SEO'
import RequirePartnerAuth from '../../components/partners/RequirePartnerAuth'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminListPartners, adminApprovePartner, adminRejectPartner } from '../../utils/partnerApi'

const TABS = ['pending', 'approved', 'rejected', 'suspended']

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-champagne text-ink-soft',
    approved: 'bg-blush text-rose',
    rejected: 'bg-ink/10 text-ink-soft',
    suspended: 'bg-ink/10 text-ink-soft',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || ''}`}>
      {status}
    </span>
  )
}

function AdminContent() {
  const { accessToken, signOut } = usePartnerAuth()
  const [tab, setTab] = useState('pending')
  const [partners, setPartners] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | forbidden | error
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await adminListPartners(accessToken, tab)
      setPartners(result.partners)
      setStatus('success')
    } catch (err) {
      setStatus(/not authorized|sign in required/i.test(err.message || '') ? 'forbidden' : 'error')
    }
  }, [accessToken, tab])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (partnerId) => {
    setBusyId(partnerId)
    try {
      await adminApprovePartner(accessToken, partnerId)
      await load()
    } catch (err) {
      console.error('[AdminPartners] approve failed:', err)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (partnerId) => {
    const reason = window.prompt('Reason for rejecting (optional):') || ''
    setBusyId(partnerId)
    try {
      await adminRejectPartner(accessToken, partnerId, reason)
      await load()
    } catch (err) {
      console.error('[AdminPartners] reject failed:', err)
    } finally {
      setBusyId(null)
    }
  }

  if (status === 'forbidden') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <Lock className="h-10 w-10 text-rose" strokeWidth={1.2} />
        <h1 className="font-serif text-2xl text-ink">Not authorized</h1>
        <p className="text-ink-soft">This login isn&rsquo;t on the admin allowlist for this deployment.</p>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Internal</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">Partner applications</h1>
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

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm capitalize transition-colors ${
              tab === t ? 'bg-rose text-ivory' : 'bg-ivory/70 text-ink-soft hover:bg-ivory'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {status === 'loading' && (
          <div className="flex items-center gap-2 py-10 text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        )}
        {status === 'error' && <p className="py-10 text-ink-soft">Could not load partners.</p>}
        {status === 'success' && partners.length === 0 && (
          <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
            No {tab} partners.
          </div>
        )}
        {status === 'success' &&
          partners.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg text-ink">{p.businessName}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-ink-soft">
                    {p.contactName} · {p.email}
                    {p.phone ? ` · ${p.phone}` : ''}
                  </p>
                  <p className="text-xs text-ink-soft/70">
                    Applied {new Date(p.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {p.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(p.id)}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-sm font-medium text-ivory shadow-card disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(p.id)}
                      disabled={busyId === p.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2 text-sm text-ink hover:bg-ivory disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </main>
  )
}

export default function AdminPartnersPage() {
  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title="Admin — Partners | InviteMyPeople" path="/admin/partners" noindex />
      <SiteHeader />
      <RequirePartnerAuth loginPath="/admin/login">
        <AdminContent />
      </RequirePartnerAuth>
      <SiteFooter />
    </div>
  )
}
