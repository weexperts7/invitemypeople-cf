import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { createBell } from '../../ShukranaDarshanTemplate/components/bell'

// The same shared per-invite total the Sangat Jaap uses (see api/jaap.js), here
// counting roses, so this template needs no table of its own.
const ENDPOINT = '/api/jaap'
const ROSE_SIZE = 34
const SPREAD = 8.5
const MAX_DRAWN = 90
const GOLDEN_ANGLE = 2.399963
// The bouquet is drawn at radius 100 and scaled to the bunch: 250 wide, 270
// tall, with the bunch centred 100 down from the top.
const MIN_RADIUS = 34
const WRAP_WIDTH = 2.5
const WRAP_HEIGHT = 2.7
const PAPER_BACK = 'M6 104 L34 16 L78 50 L125 -6 L172 50 L216 16 L244 104 L134 222 L116 222 Z'
const PAPER_FRONT = 'M2 118 C50 138 92 150 125 196 C158 150 200 138 248 118 L136 226 L114 226 Z'
const STEMS = 'M118 228 L100 268 M125 228 L125 270 M132 228 L150 268'
const BOW = 'M125 224 C96 200 74 214 80 228 C84 240 108 234 125 224 C142 234 166 240 170 228 C176 214 154 200 125 224 Z M125 224 L104 256 M125 224 L146 256'

// Each new rose lands just outside the last on a golden-angle spiral, which is
// how a bunch naturally fills out: rounder and wider with every rose.
function roseAt(index: number) {
  const reach = SPREAD * Math.sqrt(index)
  const angle = index * GOLDEN_ANGLE
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach }
}

function bunchRadius(count: number) {
  return Math.max(SPREAD * Math.sqrt(Math.max(count - 1, 0)) + ROSE_SIZE / 2, MIN_RADIUS)
}

function storageKey(slug?: string) {
  return `gm-rose-offered:${slug ?? 'demo'}`
}

function readOffered(slug?: string) {
  try {
    return window.localStorage.getItem(storageKey(slug)) === '1'
  } catch {
    return false
  }
}

function rememberOffered(slug?: string) {
  try {
    window.localStorage.setItem(storageKey(slug), '1')
  } catch {
    // Private windows can refuse this; the guest just sees the button again.
  }
}

interface BouquetOfferingProps {
  photo: string
  /** Real invites only. Without it the count stays on this device. */
  slug?: string
  demoCount?: number
  reduceMotion: boolean
}

/**
 * Where the vine ends: Guruji's darshan, with a bouquet below it that the sangat
 * makes together. Each guest offers one rose, which flies up and joins the
 * bunch, so the bouquet grows bigger as more of the sangat arrive.
 */
export default function BouquetOffering({ photo, slug, demoCount = 0, reduceMotion }: BouquetOfferingProps) {
  const [total, setTotal] = useState(demoCount)
  // Preview offers aren't remembered, so a host can try it more than once.
  const [offered, setOffered] = useState(() => Boolean(slug) && readOffered(slug))
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (!cancelled && result.ok) setTotal(result.count)
      })
      .catch((err) => console.error('[Rose Bouquet] failed to load the count:', err))
    return () => {
      cancelled = true
    }
  }, [slug])

  const offer = () => {
    if (offered) return
    navigator.vibrate?.(15)
    const bell = createBell()
    bell.resume()
    bell.ring()
    setOffered(true)
    setFlying(!reduceMotion)
    setTotal((t) => t + 1)
    if (!slug) return
    rememberOffered(slug)
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, count: 1 }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.ok) setTotal(result.count)
      })
      .catch((err) => console.error('[Rose Bouquet] failed to save the rose:', err))
  }

  const drawn = Math.min(total, MAX_DRAWN)
  const radius = bunchRadius(drawn)
  const wrap = { width: radius * WRAP_WIDTH, height: radius * WRAP_HEIGHT }
  const roses = Array.from({ length: drawn }, (_, i) => i)
  const newest = drawn - 1

  return (
    <section className="gm-darbar" data-gm-stop aria-label="Guruji's darshan">
      <span className="gm-darbar-sun" aria-hidden="true" />
      <p className="gm-kicker">You have arrived</p>
      <h2 className="gm-title">Guruji&rsquo;s Darshan</h2>

      <img className="gm-darshan-photo" src={photo} alt="Guruji" />

      <div className="gm-bouquet" style={{ height: wrap.height }} aria-hidden="true">
        <svg className="gm-wrap" viewBox="0 0 250 270" style={wrap}>
          <path className="gm-stems" d={STEMS} />
          <path className="gm-paper" d={PAPER_BACK} />
        </svg>
        {drawn > 0 && (
          <div className="gm-bunch" style={{ top: radius }}>
            <span className="gm-bunch-base" style={{ width: radius * 2 - 6, height: radius * 2 - 6 }} />
            {/* Oldest last, so the middle of the bunch sits on top of the rim. */}
            {[...roses].reverse().map((i) => {
              const spot = roseAt(i)
              if (flying && i === newest) return null
              return (
                <span
                  key={i}
                  className={`gm-rose${i % 3 === 1 ? ' gm-rose--deep' : ''}`}
                  style={{ transform: `translate(${spot.x}px, ${spot.y}px) rotate(${i * 47}deg)` }}
                />
              )
            })}
            {flying && (
              <motion.span
                className="gm-rose"
                initial={{ x: 0, y: radius + 150, scale: 2.2, opacity: 0 }}
                animate={{ x: roseAt(newest).x, y: roseAt(newest).y, scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.3, 0.1, 0.2, 1] }}
                onAnimationComplete={() => setFlying(false)}
              />
            )}
          </div>
        )}
        <svg className="gm-wrap" viewBox="0 0 250 270" style={wrap}>
          <path className="gm-paper gm-paper--front" d={PAPER_FRONT} />
          <path className="gm-bow" d={BOW} />
        </svg>
      </div>

      <p className="gm-bouquet-count" aria-live="polite">
        {total > 0
          ? `${total.toLocaleString('en-IN')} ${total === 1 ? 'rose' : 'roses'} from the sangat`
          : 'Be the first rose in the bouquet'}
      </p>

      {offered ? (
        <p className="gm-bouquet-done">Your rose is in the bouquet. Jai Guruji!</p>
      ) : (
        <button type="button" className="gm-btn" onClick={offer}>
          Offer a Rose to Guruji
        </button>
      )}
    </section>
  )
}
