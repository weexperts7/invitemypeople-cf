import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { ROSE_VACHANS } from '../vachans'
import { createBell } from './bell'

const PETAL = 'M0 -4 C30 -16 42 -56 0 -86 C-42 -56 -30 -16 0 -4 Z'
const OUTER = [0, 60, 120, 180, 240, 300]
const INNER = [30, 102, 174, 246, 318]
const BURST = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const reach = i % 2 ? 150 : 112
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, rotate: i % 2 ? 260 : -220 }
})
const WORD_S = 0.06
const WORDS_START_S = 0.75

interface RoseThoughtProps {
  familyName: string
  dateLine: string
  shareUrl: string
  /** The vachan can still be shared, just not the invite. */
  isPrivate: boolean
  reduceMotion: boolean
}

/**
 * A glowing closed rose holding one of Guruji's vachans. Each guest gets their
 * own, which opens with a bell and a burst of petals, then reads in word by
 * word and can be passed on over WhatsApp along with the invite.
 */
export default function RoseThought({ familyName, dateLine, shareUrl, isPrivate, reduceMotion }: RoseThoughtProps) {
  const [opened, setOpened] = useState(false)
  const [vachan] = useState(() => ROSE_VACHANS[Math.floor(Math.random() * ROSE_VACHANS.length)])
  const vachanRef = useRef<HTMLQuoteElement>(null)

  const words = vachan.text.split(' ')
  const afterWords = reduceMotion ? 0 : WORDS_START_S + words.length * WORD_S

  const open = () => {
    if (opened) return
    navigator.vibrate?.(15)
    const bell = createBell()
    bell.resume()
    bell.ring()
    setOpened(true)
  }

  // The card can land below the fold on a short phone.
  useEffect(() => {
    if (!opened) return
    const timer = setTimeout(
      () => vachanRef.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }),
      reduceMotion ? 0 : 700,
    )
    return () => clearTimeout(timer)
  }, [opened, reduceMotion])

  const vachanText = `Jai Guruji 🙏\n\n${vachan.text}\n(${vachan.meaning})`
  const shareText = isPrivate
    ? vachanText
    : `${vachanText}\n\n${familyName} invite you to satsang on ${dateLine}. Open the rose for your own vachan: ${shareUrl}`

  return (
    <section className="skd-section skd-section--night skd-vachan" data-skd-reveal aria-label="Guruji's Vachan">
      <p className="skd-kicker">{opened ? 'Received with love' : 'A vachan is waiting for you'}</p>
      <h2 className="skd-title">{opened ? 'Guruji’s Vachan' : 'Open the Rose'}</h2>
      {!opened && <p className="skd-note skd-note--light">Every guest receives one of Guruji&rsquo;s vachans. Yours is folded inside.</p>}

      <button
        type="button"
        className={`skd-rose-btn${opened ? ' skd-rose-btn--open' : ''}`}
        onClick={open}
        disabled={opened}
        aria-label="Open the rose to receive Guruji's vachan"
      >
        {!opened && (
          <>
            <span className="skd-rose-halo" aria-hidden="true" />
            <span className="skd-rose-halo skd-rose-halo--late" aria-hidden="true" />
          </>
        )}
        <svg viewBox="-100 -100 200 200" className="skd-rose" aria-hidden="true">
          {OUTER.map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <path className="skd-petal skd-petal--outer" d={PETAL} />
            </g>
          ))}
          {INNER.map((deg) => (
            <g key={deg} transform={`rotate(${deg})`}>
              <path className="skd-petal skd-petal--inner" d={PETAL} />
            </g>
          ))}
          <circle className="skd-rose-heart" r="11" />
        </svg>
        {opened && !reduceMotion && (
          <span className="skd-rose-burst" aria-hidden="true">
            {BURST.map((b, i) => (
              <motion.i
                key={i}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.6 }}
                animate={{ x: b.x, y: b.y, rotate: b.rotate, opacity: 0, scale: 1.1 }}
                transition={{ duration: 1.3, ease: [0.15, 0.7, 0.3, 1] }}
              />
            ))}
          </span>
        )}
      </button>

      {!opened && (
        <button type="button" className="skd-btn skd-rose-cta" onClick={open}>
          Open Guruji&rsquo;s Vachan
        </button>
      )}

      {opened && (
        <>
          <motion.blockquote
            ref={vachanRef}
            className="skd-thought"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.45 }}
          >
            <span lang="pa-Latn">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: reduceMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: reduceMotion ? 0 : WORDS_START_S + i * WORD_S }}
                >
                  {word}{' '}
                </motion.span>
              ))}
            </span>
            <motion.small
              className="skd-thought-meaning"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: afterWords }}
            >
              {vachan.meaning}
            </motion.small>
          </motion.blockquote>

          <motion.a
            className="skd-btn skd-rose-share"
            href={`https://api.whatsapp.com/send?${new URLSearchParams({ text: shareText }).toString()}`}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: afterWords + (reduceMotion ? 0 : 0.4) }}
          >
            Share this vachan on WhatsApp
          </motion.a>
        </>
      )}
    </section>
  )
}
