import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { supabase } from '../../utils/supabaseClient'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Step 2 of the reset flow (see PartnerForgotPasswordPage.jsx) — where the
// emailed link lands. Supabase puts the visitor here already holding a
// short-lived "recovery" session, established one of two ways depending on
// this project's Auth flow type: the client auto-parses an
// #access_token=...&type=recovery URL hash on load (implicit flow), or we
// have to explicitly exchange a ?code=... query param for a session (PKCE
// flow, the supabase-js v2 default) — the exchange below covers that
// second case; the auth-state listener below picks up whichever one wins.
// Once a session exists (PASSWORD_RECOVERY event, or one already present),
// the form calls updatePassword() and signs out again so the visitor lands
// back at a normal login instead of skipping straight into the portal —
// works the same for a partner or an admin, since it's one shared Supabase
// Auth account model (see PartnerAuthContext.jsx).
export default function PartnerResetPasswordPage() {
  const navigate = useNavigate()
  const { updatePassword, signOut } = usePartnerAuth()
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return undefined
    }

    let cancelled = false

    if (window.location.search.includes('code=')) {
      supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {
        // Ignore — the implicit-flow hash case (or an already-consumed
        // link) falls through to the getSession()/listener checks below,
        // which report the real "no session" error if nothing works out.
      })
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true)
        setChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      if (data.session) setReady(true)
      setChecking(false)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      await signOut()
      navigate('/partners/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(err.message || 'Could not update your password. Please request a new reset link.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-linen text-ink">
      <SEO title="Set New Password | InviteMyPeople" path="/partners/reset-password" noindex />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-14">
        <Link to="/" aria-label="InviteMyPeople home">
          <Logo size="md" />
        </Link>

        <div className="mt-10 w-full max-w-sm rounded-3xl border border-white/60 bg-ivory/70 px-6 py-8 shadow-card sm:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Program</p>
          <h1 className="mt-1 text-center font-serif text-3xl text-ink">Set new password</h1>

          {checking ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-ink-soft" />
            </div>
          ) : !ready ? (
            <p className="mt-6 text-center text-sm text-ink-soft">
              This reset link is invalid or has expired.{' '}
              <Link to="/partners/forgot-password" className="font-medium text-rose">
                Request a new one
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">New password</label>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className={FIELD_CLASS}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Confirm new password</label>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  className={FIELD_CLASS}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="rounded-lg bg-blush px-3 py-2 text-sm text-rose">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink-soft">
        &copy; {new Date().getFullYear()} InviteMyPeople. All rights reserved.
      </footer>
    </div>
  )
}
