import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Step 1 of the reset flow, linked from both PartnerLoginPage.jsx and
// AdminLoginPage.jsx (one shared Supabase Auth account model — see
// PartnerAuthContext.jsx). Always shows the same "check your email"
// confirmation regardless of whether the address matches an account, so
// this can't be used to enumerate partner/admin emails. Step 2 is
// PartnerResetPasswordPage.jsx, which the emailed link lands on.
export default function PartnerForgotPasswordPage() {
  const { sendPasswordReset } = usePartnerAuth()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send the reset email. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-linen text-ink">
      <SEO title="Reset Password | InviteMyPeople" path="/partners/forgot-password" noindex />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-14">
        <Link to="/" aria-label="InviteMyPeople home">
          <Logo size="md" />
        </Link>

        <div className="mt-10 w-full max-w-sm rounded-3xl border border-white/60 bg-ivory/70 px-6 py-8 shadow-card sm:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Program</p>
          <h1 className="mt-1 text-center font-serif text-3xl text-ink">Reset password</h1>

          {sent ? (
            <p className="mt-6 text-center text-sm text-ink-soft">
              If an account exists for <span className="font-medium text-ink">{email}</span>, we've sent a link to
              reset the password. It's valid for a short time, so use it soon.
            </p>
          ) : (
            <>
              <p className="mt-3 text-center text-sm text-ink-soft">
                Enter the email you log in with and we'll send you a link to set a new password.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

                {error && <p className="rounded-lg bg-blush px-3 py-2 text-sm text-rose">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-soft">
            <Link to="/partners/login" className="font-medium text-rose">
              Back to log in
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
