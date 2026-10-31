import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { JAAP_ROUND } from '../../../../utils/jaap'

const ENDPOINT = '/api/jaap'
const BEADS = Array.from({ length: JAAP_ROUND }, (_, i) => {
  const angle = (i / JAAP_ROUND) * Math.PI * 2 - Math.PI / 2
  return { x: 150 + Math.cos(angle) * 122, y: 150 + Math.sin(angle) * 122 }
})

interface MalaJaapProps {
  /** Real invites only. Without it the count stays on this device. */
  slug?: string
  demoCount?: number
  reduceMotion: boolean
}

/**
 * The Sangat Jaap: each tap lights a bead, and every finished round adds to a
 * total the whole sangat shares, so a guest opening the invite days before the
 * satsang is already doing something together with everyone else. Rounds are
 * saved rather than single taps, which keeps this to one request per round.
 */
export default function MalaJaap({ slug, demoCount = 0, reduceMotion }: MalaJaapProps) {
  const [total, setTotal] = useState(demoCount)
  const [beads, setBeads] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled && result.ok) setTotal(result.count)
      })
      .catch((err) => console.error('[Sangat Jaap] failed to load the count:', err))
    return () => {
      cancelled = true
    }
  }, [slug])

  const saveRound = () => {
    if (!slug) return
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, count: JAAP_ROUND }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.ok) setTotal(result.count)
      })
      .catch((err) => console.error('[Sangat Jaap] failed to save the round:', err))
  }

  const chant = () => {
    navigator.vibrate?.(12)
    setPulse((p) => p + 1)
    setTotal((t) => t + 1)
    if (beads + 1 === JAAP_ROUND) {
      setBeads(0)
      setRounds((r) => r + 1)
      saveRound()
    } else {
      setBeads(beads + 1)
    }
  }

  return (
    <section className="skd-section skd-section--night" data-skd-reveal aria-label="Sangat Jaap">
      <p className="skd-kicker">Sangat Jaap</p>
      <h2 className="skd-title">Chant With the Sangat</h2>

      <p className="skd-mantra" lang="hi">
        ॐ नमः शिवाय, शिवजी सदा सहाय
        <br />
        ॐ नमः शिवाय, गुरुजी सदा सहाय
      </p>
      <p className="skd-mantra-latin">
        Om Namah Shivay, Shivji Sada Sahay
        <br />
        Om Namah Shivay, Guruji Sada Sahay
      </p>

      <div className="skd-mala">
        <svg viewBox="0 0 300 300" aria-hidden="true">
          <circle cx="150" cy="150" r="122" className="skd-mala-thread" />
          {BEADS.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r="13" className={`skd-bead${i < beads ? ' skd-bead--on' : ''}`} />
          ))}
        </svg>

        <button type="button" className="skd-mala-tap" onClick={chant} aria-label={`Chant. ${beads} of ${JAAP_ROUND} beads this round.`}>
          <AnimatePresence>
            {!reduceMotion && pulse > 0 && (
              <motion.span
                key={pulse}
                className="skd-mala-ripple"
                initial={{ scale: 0.7, opacity: 0.7 }}
                animate={{ scale: 1.55, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
          <span className="skd-mala-om" aria-hidden="true">
            ॐ
          </span>
          <span className="skd-mala-label">Tap to chant</span>
        </button>
      </div>

      <p className="skd-jaap-total" aria-live="polite">
        <strong>{total.toLocaleString('en-IN')}</strong> chants by the sangat
      </p>
      {rounds > 0 && (
        <p className="skd-note skd-note--light">
          {rounds} {rounds === 1 ? 'round' : 'rounds'} from you. Shukrana!
        </p>
      )}
    </section>
  )
}
