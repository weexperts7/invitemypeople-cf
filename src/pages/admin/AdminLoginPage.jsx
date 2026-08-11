import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Same Supabase Auth session as the partner login (see
// PartnerLoginPage.jsx) — there's no separate admin-accounts table.
// "Admin" just means this login's email is in the server's ADMIN_EMAILS
// allowlist (see api/_lib/auth.js), which AdminPartnersPage.jsx finds out
// by calling the admin API and handling a 403 — not checked here.
export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn } = usePartnerAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate('/admin/partners')
    } catch (err) {
      setError(err.message || 'Could not log you in.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title="Admin Login | InviteMyPeople" path="/admin/login" noindex />
      <SiteHeader />

      <main className="mx-auto max-w-sm px-6 py-14 sm:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Internal</p>
        <h1 className="mt-1 font-serif text-3xl text-ink">Admin login</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Email</label>
            <input
              required
              type="email"
              className={FIELD_CLASS}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Password</label>
            <input
              required
              type="password"
              className={FIELD_CLASS}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="rounded-lg bg-blush px-3 py-2 text-sm text-rose">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Looking for the partner portal?{' '}
          <Link to="/partners/login" className="font-medium text-rose">
            Partner login
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
