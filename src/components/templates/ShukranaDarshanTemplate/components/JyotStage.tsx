import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { createBell } from './bell'
import { LockIcon } from './Icons'
import JyotFlame from './JyotFlame'
import type { FlameState } from './JyotFlame'
import type { ShukranaData } from '../types'

const HOLD_MS = 1100
// The flame burns alone in the dark, and the diya is fully gone before the veil
// opens, so it never sits over Guruji's photo.
const FLAME_S = 1.9
const DIYA_FADE_S = 0.45
// The light spreads out of the diya; the page unlocks as it finishes.
const BLOOM_S = 2.2

interface JyotStageProps {
  data: ShukranaData
  height: number | null
  reduceMotion: boolean
  /** Fires inside the guest's press, while browsers still allow audio. */
  onPrime: () => void
  onOpened: () => void
}

function Diya({ state, reduceMotion }: { state: FlameState; reduceMotion: boolean }) {
  const lit = state === 'lit'

  return (
    <div className={`skd-diya-wrap${lit ? ' skd-diya-wrap--lit' : ''}`}>
      <svg className="skd-diya" viewBox="0 0 160 150" aria-hidden="true">
        <defs>
          <linearGradient id="skd-diya-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d99a48" />
            <stop offset="48%" stopColor="#a8611d" />
            <stop offset="100%" stopColor="#552a0b" />
          </linearGradient>
          <linearGradient id="skd-diya-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2a1305" stopOpacity="0.6" />
            <stop offset="32%" stopColor="#fff0c4" stopOpacity="0.2" />
            <stop offset="72%" stopColor="#2a1305" stopOpacity="0" />
            <stop offset="100%" stopColor="#2a1305" stopOpacity="0.65" />
          </linearGradient>
          <radialGradient id="skd-diya-oil" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#8a5316" />
            <stop offset="100%" stopColor="#2e1606" />
          </radialGradient>
          <radialGradient id="skd-diya-warm" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#fff0b0" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#ffb648" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff8a24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skd-diya-cast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#ff9d3c" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#ff9d3c" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="skd-flame" cx="50%" cy="72%" r="65%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="45%" stopColor="#ffd25e" />
            <stop offset="100%" stopColor="#f2711c" />
          </radialGradient>
        </defs>

        <ellipse cx="80" cy="141" rx="42" ry="5" fill="#000" opacity="0.45" />
        <path d="M10 86 C14 118 44 138 80 138 C116 138 146 118 150 86 Z" fill="url(#skd-diya-body)" />
        <path d="M10 86 C14 118 44 138 80 138 C116 138 146 118 150 86 Z" fill="url(#skd-diya-sheen)" />
        <path className="skd-diya-lit" d="M10 86 C14 118 44 138 80 138 C116 138 146 118 150 86 Z" fill="url(#skd-diya-cast)" />
        <path d="M30 112 Q80 128 130 112" fill="none" stroke="#ffe7b0" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round" />
        <ellipse cx="80" cy="86" rx="70" ry="13" fill="#c88a3c" />
        <ellipse cx="80" cy="86" rx="64" ry="10" fill="url(#skd-diya-oil)" />
        <ellipse className="skd-diya-lit" cx="80" cy="86" rx="64" ry="10" fill="url(#skd-diya-warm)" />
        <path d="M80 90 C78 84 83 80 80 73" fill="none" stroke="#f0e2c4" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M80 77 C81 75 80 74 80 73" fill="none" stroke="#1c0c04" strokeWidth="4.5" strokeLinecap="round" />

        {lit && reduceMotion && (
          <g>
            <path d="M80 6 C96 34 104 50 80 78 C56 50 64 34 80 6 Z" fill="url(#skd-flame)" />
            <path d="M80 38 C87 52 89 60 80 76 C71 60 73 52 80 38 Z" fill="#fffbe6" />
          </g>
        )}
      </svg>
      {!reduceMotion && <JyotFlame state={state} />}
    </div>
  )
}

/**
 * Step 1 — a dark room and an unlit diya. Pressing and holding lights the
 * jyot, and its light spreads to reveal Guruji's darshan. Stays mounted as the
 * hero once open. Two quick taps also light it, for anyone who taps instead of
 * holding; a keyboard press lights it straight away.
 */
export default function JyotStage({ data, height, reduceMotion, onPrime, onOpened }: JyotStageProps) {
  const [holding, setHolding] = useState(false)
  const [lit, setLit] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [nudge, setNudge] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bell = useRef<ReturnType<typeof createBell> | null>(null)
  const taps = useRef(0)

  const prime = () => {
    onPrime()
    bell.current ??= createBell()
    bell.current.resume()
  }

  const light = () => {
    if (timer.current) clearTimeout(timer.current)
    setHolding(false)
    setLit(true)
    bell.current?.ring()
    setTimeout(onOpened, reduceMotion ? 0 : (FLAME_S + BLOOM_S - 0.5) * 1000)
    setTimeout(() => setRevealed(true), reduceMotion ? 0 : (FLAME_S + BLOOM_S) * 1000)
  }

  const handleDown = () => {
    if (lit) return
    prime()
    setHolding(true)
    timer.current = setTimeout(light, reduceMotion ? 0 : HOLD_MS)
    // Phones only allow sound once a finger lifts, and the diya may already be
    // gone by then, so this listens on the window.
    window.addEventListener('pointerup', prime, { once: true })
    window.addEventListener('touchend', prime, { once: true })
  }

  const handleUp = () => {
    if (lit || !holding) return
    if (timer.current) clearTimeout(timer.current)
    setHolding(false)
    taps.current += 1
    if (taps.current >= 2) light()
    else setNudge(true)
  }

  // `detail` is 0 only for a keyboard-triggered click.
  const handleClick = (e: React.MouseEvent) => {
    if (e.detail === 0 && !lit) {
      prime()
      light()
    }
  }

  return (
    <section className="skd-stage" style={height ? { height } : undefined} aria-label="Invitation">
      <div className="skd-rays" aria-hidden="true" />
      <div className="skd-glow" aria-hidden="true" />

      <div className="skd-hero">
        <div className="skd-aura">
          <span className="skd-aura-ring" aria-hidden="true" />
          <img src={data.gurujiPhoto} alt="Guruji" />
        </div>
        <p className="skd-hero-greeting">
          <span>{data.greetingSymbol}</span> {data.greetingLine}
        </p>
        <h1 className="skd-hero-family">{data.familyName}</h1>
        <p className="skd-hero-sub">invite you to Guruji&rsquo;s Satsang</p>
        <p className="skd-hero-date">{data.dateLine}</p>
        {data.privateNote && (
          <p className="skd-private skd-private--hero">
            <LockIcon />
            {data.privateNote}
          </p>
        )}
        {revealed && (
          <div className="skd-scroll" aria-hidden="true">
            <span>Scroll</span>
            <svg viewBox="0 0 12 18" width="12" height="18">
              <path d="M6 1 V16 M1 11 L6 16 L11 11" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        )}
      </div>

      {!revealed && (
        <>
          {/* Starts below zero: at 0% the mask's soft edge would already show
              a ring of the hero through the dark. */}
          <motion.div
            className="skd-veil"
            initial={{ '--skd-r': '-20%' } as never}
            animate={{ '--skd-r': lit ? '190%' : '-20%' } as never}
            transition={{
              duration: reduceMotion ? 0 : BLOOM_S,
              delay: reduceMotion ? 0 : FLAME_S,
              ease: [0.45, 0, 0.3, 1],
            }}
          >
            <motion.div
              className="skd-veil-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: lit ? 1 : 0 }}
              transition={{ duration: FLAME_S }}
            />
          </motion.div>
          <motion.div
            className="skd-veil-inner"
            animate={{ opacity: lit ? 0 : 1 }}
            transition={{ duration: DIYA_FADE_S, delay: lit ? FLAME_S - DIYA_FADE_S - 0.05 : 0 }}
          >
            <motion.div animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 0.5 }} className="skd-veil-text">
              <p className="skd-veil-kicker">{data.greetingLine}</p>
              <p className="skd-veil-title">Light the jyot to begin</p>
            </motion.div>

            <button
              type="button"
              className={`skd-light${holding ? ' skd-light--holding' : ''}${lit ? ' skd-light--lit' : ''}`}
              aria-label="Light the jyot and open the invitation"
              onPointerDown={handleDown}
              onPointerUp={handleUp}
              onPointerLeave={handleUp}
              onPointerCancel={handleUp}
              onClick={handleClick}
              onContextMenu={(e) => e.preventDefault()}
            >
              <svg className="skd-hold-ring" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="92" />
                <circle className="skd-hold-progress" cx="100" cy="100" r="92" pathLength="100" />
              </svg>
              <Diya state={lit ? 'lit' : holding ? 'holding' : 'idle'} reduceMotion={reduceMotion} />
            </button>

            <motion.p animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 0.4 }} className="skd-veil-hint">
              {nudge ? 'Keep holding, or tap once more' : 'Press and hold the diya'}
            </motion.p>
          </motion.div>
        </>
      )}
    </section>
  )
}
