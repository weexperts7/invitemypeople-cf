import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { adminGetMe } from '../../utils/partnerApi'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Same Supabase Auth session as the partner login (see
// PartnerLoginPage.jsx) — there's no separate admin-accounts table.
// "Admin" just means this login's email is in the server's ADMIN_EMAILS
// allowlist (see api/_lib/auth.js). Supabase Auth alone can't tell us that
// (it only knows the password is correct), so right after signIn()
// succeeds this calls the cheap GET /api/admin/me check and, if it 403s,
// signs the session back out and reports the rejection right here instead
// of letting a valid partner login through to /admin/dashboard and finding
// out via that page's AdminForbidden fallback. That fallback stays in
// place too, for a session that reaches an /admin/* page some other way
// (e.g. a partner who's already signed in via /partners/login navigating
// straight to the URL) — this just closes the obvious front door.
export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn, signOut } = usePartnerAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const session = await signIn(email, password)
      try {
        await adminGetMe(session?.access_token)
      } catch {
        await signOut()
        throw new Error("This login isn't on the admin allowlist for this deployment.")
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Could not log you in.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-linen text-ink">
      <SEO title="Admin Login | InviteMyPeople" path="/admin/login" noindex />

      {/* No SiteHeader/SiteFooter here — this is an internal-only door, not
          a marketing page, so it deliberately doesn't offer the full site
          nav (menu links, CTAs, socials). Just the brand mark so it's
          still unmistakably InviteMyPeople, the form, and a plain
          copyright line — see the <footer> below. */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-14">
        <Link to="/" aria-label="InviteMyPeople home">
          <Logo size="md" />
        </Link>

        <div className="mt-10 w-full max-w-sm rounded-3xl border border-white/60 bg-ivory/70 px-6 py-8 shadow-card sm:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Internal</p>
          <h1 className="mt-1 text-center font-serif text-3xl text-ink">Admin login</h1>

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
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink-soft">
        &copy; {new Date().getFullYear()} InviteMyPeople. All rights reserved.
      </footer>
    </div>
  )
}
