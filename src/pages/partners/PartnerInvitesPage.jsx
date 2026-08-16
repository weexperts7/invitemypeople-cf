import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Copy, Link2, Loader2, Sparkles } from 'lucide-react'
import SEO from '../../components/SEO'
import Pagination from '../../components/partners/Pagination'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { getMyInvites } from '../../utils/partnerApi'
import { SITE_URL } from '../../data/routesSeo'
import { formatInviteDate } from '../../utils/formatInviteDateTime'
import { getEventStatus } from '../../utils/eventStatus'

const PAGE_SIZE = 5

// Active/Closed — computed client-side from the invite's own wedding date
// (see getEventStatus()), same "event + 24h buffer" rule the public
// /i/:slug page uses to swap in its "Event Concluded" view. Purely a status
// label here: a partner's own /p/:slug client link never auto-closes (see
// PartnerInviteViewerPage.jsx), so guest lists and analytics for a
// "Closed" invite stay fully viewable — this badge just tells the partner
// at a glance whether the event itself has already happened.
function EventStatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive ? 'bg-blush text-rose' : 'bg-ink/10 text-ink-soft'
      }`}
    >
      {isActive ? 'Active' : 'Closed'}
    </span>
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
      console.error('[PartnerInvites] clipboard copy failed:', err)
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

// "Clients" in the sidebar (see PartnerPortalShell.jsx) — every invite this
// partner has generated for a client, split out from the old all-in-one
// PartnerDashboardPage.jsx onto its own page.
export default function PartnerInvitesPage() {
  const { accessToken } = usePartnerAuth()
  const [invites, setInvites] = useState(null)
  const [page, setPage] = useState(1)

  const loadInvites = useCallback(async () => {
    try {
      const result = await getMyInvites(accessToken)
      setInvites(result.invites)
      setPage(1)
    } catch (err) {
      console.error('[PartnerInvites] failed to load invites:', err)
    }
  }, [accessToken])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  const pageCount = Math.max(1, Math.ceil((invites?.length ?? 0) / PAGE_SIZE))
  const pageInvites = (invites ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Your Clients | Partner Dashboard" path="/partners/dashboard/invites" noindex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Portal</p>
          <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
            <Link2 className="h-6 w-6 text-rose" />
            Your Clients
          </h1>
        </div>
        <Link
          to="/partners/dashboard/create"
          className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create Invite
        </Link>
      </div>

      <div className="mt-8">
        {invites === null ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/60 bg-ivory/50 px-5 py-10 text-ink-soft">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : invites.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-10 text-center text-ink-soft">
            No invites created yet — generate your first one from the
            Create Invite page.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {pageInvites.map((inv) => {
                const url = `${SITE_URL}/p/${inv.slug}`
                const status = getEventStatus({
                  date: inv.weddingDate,
                  time: inv.weddingTime,
                  events: inv.events,
                })
                const eventDateLabel = formatInviteDate(inv.weddingDate) || inv.weddingDate || 'No date set'
                return (
                  <div
                    key={inv.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/60 bg-ivory/50 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-ink">{inv.coupleNames}</p>
                        <EventStatusBadge status={status} />
                      </div>
                      <p className="text-xs text-ink-soft/70">
                        {inv.venue} · Event Date: {eventDateLabel}
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
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
