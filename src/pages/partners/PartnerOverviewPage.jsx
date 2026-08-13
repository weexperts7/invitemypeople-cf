import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Link2, Loader2, Sparkles, Wallet } from 'lucide-react'
import SEO from '../../components/SEO'
import Pagination from '../../components/partners/Pagination'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { getMyCredits, getMyInvites } from '../../utils/partnerApi'
import { SITE_URL } from '../../data/routesSeo'

const RECENT_INVITES_PAGE_SIZE = 5

// Landing page inside the Partner Portal shell (see PartnerPortalShell.jsx)
// — a quick-glance summary (credits balance, recent client invites) plus
// the two things a partner does most: create an invite, top up credits.
// The full detail for each of those now lives on its own page
// (PartnerInvitesPage.jsx, PartnerCreditsPage.jsx, PartnerBrandingPage.jsx)
// rather than all four being stacked on one long scroll.
export default function PartnerOverviewPage() {
  const { partner, accessToken } = usePartnerAuth()
  const [credits, setCredits] = useState(null)
  const [invites, setInvites] = useState(null)
  const [recentPage, setRecentPage] = useState(1)

  const load = useCallback(async () => {
    try {
      const [creditsResult, invitesResult] = await Promise.all([
        getMyCredits(accessToken),
        getMyInvites(accessToken),
      ])
      setCredits(creditsResult)
      setInvites(invitesResult.invites)
      setRecentPage(1)
    } catch (err) {
      console.error('[PartnerOverview] failed to load:', err)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const recentPageCount = Math.max(1, Math.ceil((invites?.length ?? 0) / RECENT_INVITES_PAGE_SIZE))
  const recentInvites = (invites ?? []).slice(
    (recentPage - 1) * RECENT_INVITES_PAGE_SIZE,
    recentPage * RECENT_INVITES_PAGE_SIZE,
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Partner Dashboard | InviteMyPeople" path="/partners/dashboard" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Welcome back</p>
      <h1 className="mt-1 font-serif text-3xl text-ink">{partner?.businessName}</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
            <Wallet className="h-3.5 w-3.5 text-rose" />
            Credits Remaining
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">
            {credits ? credits.creditsRemaining : <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />}
          </div>
          <Link to="/partners/dashboard/credits" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rose">
            Buy more credits
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/60 bg-ivory/60 px-5 py-5 shadow-soft">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
            <Link2 className="h-3.5 w-3.5 text-rose" />
            Invites Created
          </div>
          <div className="mt-2 font-serif text-4xl text-ink">
            {invites ? invites.length : <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />}
          </div>
          <Link to="/partners/dashboard/invites" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rose">
            View all clients
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-blush/30 px-5 py-5 shadow-soft">
        <p className="max-w-md text-sm text-ink-soft">
          Build your next client&rsquo;s invitation with the same style
          picker and live preview your own customers use.
        </p>
        <Link
          to="/partners/dashboard/create"
          className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create Invite
        </Link>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl text-ink">
            <Link2 className="h-4 w-4 text-rose" />
            Recent Invites
          </h2>
          {invites && invites.length > 0 && (
            <Link to="/partners/dashboard/invites" className="text-sm font-medium text-rose">
              View all
            </Link>
          )}
        </div>
        {invites === null ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-ink-soft">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : recentInvites.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
            No invites created yet.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {recentInvites.map((inv) => (
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
                  <span className="max-w-[220px] truncate text-xs text-ink-soft">{`${SITE_URL}/p/${inv.slug}`}</span>
                </div>
              ))}
            </div>
            <Pagination page={recentPage} pageCount={recentPageCount} onChange={setRecentPage} />
          </>
        )}
      </section>
    </div>
  )
}
