import { Navigate } from 'react-router-dom'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

// Wraps a page that needs a logged-in Supabase Auth session (a partner
// dashboard page or an admin page) — bounces to `loginPath` if there's no
// session once the initial session check finishes. Doesn't check partner
// `status` itself (approved/pending/rejected) — PartnerDashboardPage does
// that on its own, since /admin/* pages use this same guard but have no
// partner profile to check.
export default function RequirePartnerAuth({ loginPath, children }) {
  const { session, loading } = usePartnerAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#8a7a6f]">
        Loading…
      </div>
    )
  }
  if (!session) return <Navigate to={loginPath} replace />
  return children
}
