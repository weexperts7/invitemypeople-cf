import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Shared login for the Partner Portal — always lands on
// /partners/dashboard, which itself redirects to /partners/pending if the
// partner isn't approved yet (see that page's own guard logic). Admins log
// in separately at /admin/login — same Supabase Auth, different landing
// page — since an admin login has no partner profile to redirect through.
// Same minimal, no-SiteHeader/SiteFooter treatment as AdminLoginPage.jsx —
// this is a login door into the portal, not a marketing page, so it
// deliberately skips the full site nav in favor of just the brand mark and
// a plain copyright line.
export default function PartnerLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
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
      navigate('/partners/dashboard')
    } catch (err) {
      setError(err.message || 'Could not log you in. Check your email and password.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-linen text-ink">
      <SEO title="Partner Login | InviteMyPeople" path="/partners/login" noindex />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-14">
        <Link to="/" aria-label="InviteMyPeople home">
          <Logo size="md" />
        </Link>

        <div className="mt-10 w-full max-w-sm rounded-3xl border border-white/60 bg-ivory/70 px-6 py-8 shadow-card sm:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Program</p>
          <h1 className="mt-1 text-center font-serif text-3xl text-ink">Log in</h1>

          {location.state?.passwordReset && (
            <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700">
              Password updated — log in with your new password.
            </p>
          )}

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
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium text-ink-soft">Password</label>
                <Link to="/partners/forgot-password" className="text-xs font-medium text-rose">
                  Forgot password?
                </Link>
              </div>
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
            New partner?{' '}
            <Link to="/partners/signup" className="font-medium text-rose">
              Apply here
            </Link>
          </p>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink-soft">
        &copy; {new Date().getFullYear()} InviteMyPeople. All rights reserved.
      </footer>
    </div>
  )
}
