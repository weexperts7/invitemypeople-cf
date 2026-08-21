import { forwardRef } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

// Public site key — safe to bundle (see .env.example). The matching secret
// (TURNSTILE_SECRET_KEY) never leaves the server; see api/_lib/turnstile.js.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

// Invisible Cloudflare Turnstile challenge embedded in every form that
// writes to the database or opens a checkout (RsvpForm.jsx and its
// per-template siblings, PaymentModal.jsx). `size: 'invisible'` means no
// checkbox or badge is ever shown — Cloudflare runs its risk check silently
// in the background, matching the luxury feel these forms are styled for.
//
// Forwards a ref so the parent can call `.reset()` after a failed or
// already-used submit — Turnstile tokens are single-use, so the widget must
// mint a fresh one before the caller can try again (see Cloudflare's token
// lifecycle docs). `action` tags the token with what it's for
// ("rsvp_submit" vs "checkout"), which the backend checks against —
// see verifyTurnstileToken()'s expectedAction option.
const TurnstileWidget = forwardRef(function TurnstileWidget(
  { action, onSuccess, onExpire, onError },
  ref,
) {
  if (!SITE_KEY) {
    // Fails closed rather than silently: no token is ever produced, so
    // every gated submit button simply stays disabled. Logged once so a
    // missing VITE_TURNSTILE_SITE_KEY is obvious instead of a mystery.
    console.error(
      '[Turnstile] VITE_TURNSTILE_SITE_KEY is not set — this form cannot be submitted until it is.',
    )
    return null
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={SITE_KEY}
      onSuccess={onSuccess}
      onExpire={onExpire}
      onError={onError}
      options={{ size: 'invisible', action }}
    />
  )
})

export default TurnstileWidget
