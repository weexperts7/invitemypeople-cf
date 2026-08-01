import { useEffect, useRef, useState } from 'react'
import { FALLBACK_BLESSINGS } from '../data/blessings'

// Same endpoint the RSVP form and Wishes Wall use — the Apps Script backend's
// doGet answers ?blessings=1 with a random-order list of quotes from a
// "Blessings" sheet tab (see google-apps-script/Code.gs). Falls back to a
// local list so every "reveal a blessing" interaction still works with no
// endpoint configured, or if the fetch fails.
const ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT

function pickRandom(list) {
  if (!list?.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

// `locked` should flip true once the guest has started/finished revealing —
// a slow network response should never yank the blessing out from under
// their thumb (or their tap, in the envelope-opening variant).
export function useRandomBlessing({ locked = false } = {}) {
  const [blessing, setBlessing] = useState(() => pickRandom(FALLBACK_BLESSINGS))
  const lockedRef = useRef(locked)
  lockedRef.current = locked

  useEffect(() => {
    if (!ENDPOINT) return
    let cancelled = false

    fetch(`${ENDPOINT}?blessings=1`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled || lockedRef.current) return
        if (!result.ok) throw new Error(result.error || 'failed to load blessings')
        const list = (result.blessings || []).filter((b) => String(b?.text || '').trim())
        const picked = pickRandom(list)
        if (picked) setBlessing(picked)
      })
      .catch((err) => {
        console.error(`[Blessing] failed to load blessings from ${ENDPOINT}:`, err)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { blessing }
}
