import { useCallback, useState } from 'react'

// Defaults to the bundled RSVP API (server/index.js), which appends every
// submission to data/rsvps.xlsx. Override to post to a Google Apps Script
// endpoint instead — see RSVP-SETUP.md.
const ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT || '/api/rsvp'

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
          // text/plain + a string body keeps this a "simple" CORS request (no
          // preflight), which is what Apps Script web apps can answer without
          // extra setup; e.postData.contents still parses fine as JSON.
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
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
