import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import SEO from '../../components/SEO'
import AdminForbidden from '../../components/admin/AdminForbidden'
import Pagination from '../../components/partners/Pagination'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminListPartners, adminApprovePartner, adminRejectPartner } from '../../utils/partnerApi'

const TABS = ['pending_approval', 'active', 'rejected', 'suspended']
const PAGE_SIZE = 10

function StatusBadge({ status }) {
  const styles = {
    pending_approval: 'bg-champagne text-ink-soft',
    active: 'bg-blush text-rose',
    rejected: 'bg-ink/10 text-ink-soft',
    suspended: 'bg-ink/10 text-ink-soft',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// "Partner Applications" in the admin sidebar (see AdminShell.jsx), which
// now provides the page chrome (header, nav, log out) — this only ever
// renders inside it, so unlike before it has no SiteHeader/SiteFooter or
// session guard of its own.
export default function AdminPartnersPage() {
  const { accessToken } = usePartnerAuth()
  const [tab, setTab] = useState('pending_approval')
  const [partners, setPartners] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | forbidden | error
  const [busyId, setBusyId] = useState(null)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await adminListPartners(accessToken, tab)
      setPartners(result.partners)
      setPage(1)
      setStatus('success')
    } catch (err) {
      setStatus(/not authorized|sign in required/i.test(err.message || '') ? 'forbidden' : 'error')
    }
  }, [accessToken, tab])

  useEffect(() => {
    load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(partners.length / PAGE_SIZE))
  const pagePartners = partners.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

  if (status === 'forbidden') return <AdminForbidden />

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Admin — Partners | InviteMyPeople" path="/admin/partners" noindex />
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Admin Panel</p>
      <h1 className="mt-1 font-serif text-3xl text-ink">Partner applications</h1>

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
            {t.replace('_', ' ')}
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
            No {tab.replace('_', ' ')} partners.
          </div>
        )}
        {status === 'success' &&
          pagePartners.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-4 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-champagne text-xs text-ink-soft">
                      No logo
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg text-ink">{p.businessName}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-sm text-ink-soft">
                      {p.email}
                      {p.phone ? ` · ${p.phone}` : ''}
                    </p>
                    {p.address && <p className="text-xs text-ink-soft/70">{p.address}</p>}
                    <p className="text-xs text-ink-soft/70">
                      Applied {new Date(p.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {p.status === 'pending_approval' && (
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
      {status === 'success' && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
    </main>
  )
}
