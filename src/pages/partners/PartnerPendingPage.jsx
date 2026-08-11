import { Navigate } from 'react-router-dom'
import { Clock3, XCircle, PauseCircle } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import SEO from '../../components/SEO'
import RequirePartnerAuth from '../../components/partners/RequirePartnerAuth'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const COPY = {
  pending: {
    icon: Clock3,
    title: 'Your application is under review',
    body: "We'll email you as soon as a decision is made — usually within a couple of business days.",
  },
  rejected: {
    icon: XCircle,
    title: 'Your application was not approved',
    body: "If you think this was a mistake or your circumstances have changed, reply to the email we sent you and we'll take another look.",
  },
  suspended: {
    icon: PauseCircle,
    title: 'Your account is suspended',
    body: 'Contact us if you believe this is an error.',
  },
}

function PendingContent() {
  const { partner, profileError } = usePartnerAuth()

  // A logged-in, approved partner has no reason to be here.
  if (partner?.status === 'approved') return <Navigate to="/partners/dashboard" replace />

  const copy = COPY[partner?.status] || COPY.pending
  const Icon = copy.icon

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title="Application Status | InviteMyPeople" path="/partners/pending" noindex />
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <Icon className="h-10 w-10 text-rose" strokeWidth={1.2} />
        <h1 className="font-serif text-2xl text-ink">{copy.title}</h1>
        <p className="text-ink-soft">{copy.body}</p>
        {partner?.status === 'rejected' && partner.rejectedReason && (
          <p className="rounded-xl border border-champagne-deep/40 bg-champagne/30 px-4 py-3 text-sm text-ink-soft">
            <strong>Reason:</strong> {partner.rejectedReason}
          </p>
        )}
        {profileError && !partner && (
          <p className="text-sm text-ink-soft">{profileError}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default function PartnerPendingPage() {
  return (
    <RequirePartnerAuth loginPath="/partners/login">
      <PendingContent />
    </RequirePartnerAuth>
  )
}
