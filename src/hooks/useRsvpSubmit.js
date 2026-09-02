import { useCallback, useState } from 'react'

// Supabase-backed in production (api/rsvps/index.js) and the flat-file
// counterpart in local dev (server/index.js) — see
// RSVPS-AND-REMINDERS-SETUP.md. Same-origin JSON POST, no CORS setup needed
// (the old external Google Apps Script endpoint this replaced required the
// text/plain trick this hook used to use).
const DEFAULT_ENDPOINT = '/api/rsvps'

// The fetch/status-machine core shared by every RSVP form in the app,
// regardless of how differently each one is styled. `fields` is whatever
// the calling form collects beyond the shared invitationSlug/website
// envelope (e.g. { guestName, attendanceStatus, guests, message } for
// Satsang forms, plus { song, advice } for wedding forms).
//
// `endpoint` is an optional override — same pattern the shared RsvpForm.jsx/
// WishesWall.jsx/PhotoUploader.jsx already use, so a bespoke layout's own
// RSVP form (e.g. MahoganySealTemplate's) can point this at
// '/api/partners/rsvps' when it's rendering a partner-created invite
// instead of always posting into the consumer `rsvps` table. Every
// existing caller that doesn't pass one keeps hitting '/api/rsvps' exactly
// as before.
export function useRsvpSubmit(slug, endpoint = DEFAULT_ENDPOINT) {
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  // `captchaToken` comes from each calling form's own <TurnstileWidget> (see
  // its onSuccess callback) — required server-side by api/rsvps/index.js /
  // server/index.js's POST /api/rsvps, so every form using this hook must
  // render the widget and pass a token, or every submit will 400.
  const submit = useCallback(
    async (fields, honeypot = '', captchaToken = null) => {
      if (status === 'sending') return false
      setStatus('sending')

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationSlug: slug, website: honeypot, captchaToken, ...fields }),
        })

        const result = await response.json().catch(() => null)
        if (!response.ok || (result && result.ok === false)) {
          throw new Error(result?.error || `HTTP ${response.status}`)
        }

        setStatus('success')
        return true
      } catch (err) {
        console.error(
          `[RSVP] submission to ${endpoint} failed — is the RSVP API running? (npm run dev starts it)`,
          err,
        )
        setStatus('error')
        return false
      }
    },
    [slug, endpoint, status],
  )

  return { status, isSending: status === 'sending', submit }
}
