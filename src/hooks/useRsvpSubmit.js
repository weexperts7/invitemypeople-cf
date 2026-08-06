import { useCallback, useState } from 'react'

// Supabase-backed in production (api/rsvps/index.js) and the flat-file
// counterpart in local dev (server/index.js) — see
// RSVPS-AND-REMINDERS-SETUP.md. Same-origin JSON POST, no CORS setup needed
// (the old external Google Apps Script endpoint this replaced required the
// text/plain trick this hook used to use).
const ENDPOINT = '/api/rsvps'

// The fetch/status-machine core shared by every RSVP form in the app,
// regardless of how differently each one is styled. `fields` is whatever
// the calling form collects beyond the shared invitationSlug/website
// envelope (e.g. { guestName, attendanceStatus, guests, message } for
// Satsang forms, plus { song, advice } for wedding forms).
export function useRsvpSubmit(slug) {
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const submit = useCallback(
    async (fields, honeypot = '') => {
      if (status === 'sending') return false
      setStatus('sending')

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invitationSlug: slug, website: honeypot, ...fields }),
        })

        const result = await response.json().catch(() => null)
        if (!response.ok || (result && result.ok === false)) {
          throw new Error(result?.error || `HTTP ${response.status}`)
        }

        setStatus('success')
        return true
      } catch (err) {
        console.error(
          `[RSVP] submission to ${ENDPOINT} failed — is the RSVP API running? (npm run dev starts it)`,
          err,
        )
        setStatus('error')
        return false
      }
    },
    [slug, status],
  )

  return { status, isSending: status === 'sending', submit }
}
