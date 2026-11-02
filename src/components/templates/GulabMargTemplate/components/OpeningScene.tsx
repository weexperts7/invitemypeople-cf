import { useId } from 'react'

import type { GulabMargData } from '../types'
import RoseBloom from './RoseBloom'

// Left half of a cusped mehrab, 102 wide by 252 tall, apex at the top right.
const HALF_ARCH = 'M0 252 L0 106 C0 94 6 88 15 84 C12 68 22 57 35 55 C35 40 47 30 61 29 C70 17 86 9 102 0'
const FULL_ARCH = `${HALF_ARCH} C118 9 134 17 143 29 C157 30 169 40 169 55 C182 57 192 68 189 84 C198 88 204 94 204 106 L204 252 Z`
const DOOR = `${HALF_ARCH} L102 252 Z`
const BED = Array.from({ length: 8 }, (_, i) => i)

function GateDoor({ side }: { side: 'left' | 'right' }) {
  const id = useId()

  return (
    <svg className={`gm-door gm-door--${side}`} viewBox="0 0 102 252" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#fbe3df" />
        </linearGradient>
        <pattern id={`${id}-jaali`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M12 2 C17 7 17 7 22 12 C17 17 17 17 12 22 C7 17 7 17 2 12 C7 7 7 7 12 2 Z" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="0" cy="0" r="2" />
          <circle cx="24" cy="0" r="2" />
          <circle cx="0" cy="24" r="2" />
          <circle cx="24" cy="24" r="2" />
        </pattern>
      </defs>
      <g transform={side === 'right' ? 'matrix(-1 0 0 1 102 0)' : undefined}>
        <path d={DOOR} fill={`url(#${id}-fill)`} />
        <path className="gm-jaali" d={DOOR} fill={`url(#${id}-jaali)`} />
        <path className="gm-door-edge" d={DOOR} />
        <circle className="gm-door-ring" cx="92" cy="146" r="5" />
      </g>
    </svg>
  )
}

interface OpeningSceneProps {
  data: GulabMargData
  height: number | null
  started: boolean
  /** The gate has finished opening and the path below is ready. */
  open: boolean
  onBegin: () => void
  onWalk: () => void
}

/**
 * Morning at a carved garden gate. Pressing it swings the jaali doors open onto
 * Guruji's darshan, and the guest stays with it until they choose to walk on. A
 * plain tap rather than a hold: the sound starts on this click, which every
 * phone allows.
 */
export default function OpeningScene({ data, height, started, open, onBegin, onWalk }: OpeningSceneProps) {
  const light = useId()
  const archClip = useId()
  const photoFade = useId()

  return (
    <header className="gm-open" style={height ? { height } : undefined}>
      <span className="gm-sun" aria-hidden="true" />

      <div className="gm-open-copy">
        <p className="gm-sacred">
          {data.greetingSymbol} {data.greetingLine}
        </p>
        <h1 className="gm-family">{data.familyName}</h1>
        <p className="gm-open-line">welcome you into the rose garden, for Guruji&rsquo;s Satsang</p>
        <p className="gm-open-date">{data.dateLine}</p>
      </div>

      <button
        type="button"
        className={`gm-gate${started ? ' gm-gate--open' : ''}`}
        onClick={onBegin}
        disabled={started}
        aria-label="Open the garden gate"
      >
        <svg className="gm-gate-frame" viewBox="-14 -14 232 280" aria-hidden="true">
          <defs>
            <radialGradient id={light} cx="50%" cy="58%" r="62%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#fff3cf" />
              <stop offset="1" stopColor="#fbdc9b" />
            </radialGradient>
            <clipPath id={archClip}>
              <path d={FULL_ARCH} />
            </clipPath>
            <linearGradient id={`${photoFade}-fade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#000" />
              <stop offset="0.16" stopColor="#fff" />
            </linearGradient>
            <mask id={photoFade}>
              <rect y="42" width="204" height="210" fill={`url(#${photoFade}-fade)`} />
            </mask>
          </defs>
          <path className="gm-gate-glow" fill={`url(#${light})`} d={FULL_ARCH} />
          <g clipPath={`url(#${archClip})`}>
            <image
              className="gm-gate-photo"
              href={data.gurujiPhoto}
              y="42"
              width="204"
              height="210"
              preserveAspectRatio="xMidYMin slice"
              mask={`url(#${photoFade})`}
            />
          </g>
          <path className="gm-gate-line" d={FULL_ARCH} />
        </svg>
        <GateDoor side="left" />
        <GateDoor side="right" />
        <RoseBloom open className="gm-gate-rose gm-gate-rose--top" />
        <RoseBloom open className="gm-gate-rose gm-gate-rose--left" />
        <RoseBloom open className="gm-gate-rose gm-gate-rose--right" />
      </button>

      {open ? (
        <button type="button" className="gm-walk-on" onClick={onWalk}>
          Scroll down to walk the rose path
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      ) : started ? (
        <p className="gm-open-hint">Jai Guruji</p>
      ) : (
        <button type="button" className="gm-btn" onClick={onBegin}>
          Open the Garden Gate
        </button>
      )}

      <span className="gm-bed" aria-hidden="true">
        {BED.map((i) => (
          <RoseBloom key={i} open />
        ))}
      </span>
    </header>
  )
}
