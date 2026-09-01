interface HeartBurstProps {
  /** Mounted only while true — plays once and the parent unmounts it after the animation's had time to finish, it never lingers. */
  active: boolean
  reduceMotion?: boolean
}

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

const HEART_COUNT = 24
// Golden-and-mahogany only — no pinks/reds, so the burst reads as this
// template's own gold-on-dark-mahogany palette (mst-gold/-soft/-deep plus
// mst-mahogany-700 for depth) rather than a generic multicolor confetti.
const HEART_COLORS = ['#f2d675', '#fbf3e3', '#d4af37', '#8a6a1f', '#4f3229']

// Deterministic, not Math.random() — same "fixed, hand-placed positions"
// philosophy as AmbientLights' bokeh/ember arrays: every guest sees the
// identical burst, and it never reshuffles between renders. Angles spread
// evenly around the circle with a small alternating stagger so it doesn't
// read as a perfectly even wheel; distance cycles through four bands so
// the burst has real depth instead of every heart landing on one ring.
const HEART_PIECES = Array.from({ length: HEART_COUNT }, (_, i) => {
  const angle = (360 / HEART_COUNT) * i + (i % 2 === 0 ? 8 : -8)
  const distance = 120 + (i % 4) * 34
  const rad = (angle * Math.PI) / 180
  return {
    cx: Math.cos(rad) * distance,
    cy: Math.sin(rad) * distance,
    rotate: (i % 2 === 0 ? 1 : -1) * (140 + (i % 5) * 32),
    color: HEART_COLORS[i % HEART_COLORS.length],
    size: 16 + (i % 4) * 5,
    delay: (i % 6) * 25,
  }
})

// A denser ring of tiny, fast sparks that shoot out and vanish well before
// the hearts finish — the "crack of light" that sells the instant of
// impact, the same way a firework's core flash reads before its trails do.
const SPARK_COUNT = 16
const SPARK_PIECES = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (360 / SPARK_COUNT) * i
  const distance = 60 + (i % 3) * 26
  const rad = (angle * Math.PI) / 180
  return {
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 4 + (i % 3) * 2,
    delay: (i % 4) * 15,
  }
})

/**
 * A one-shot celebratory burst that plays the moment a scratch card
 * finishes revealing — layered so the "something wonderful just happened"
 * moment is unmistakable rather than a subtle flourish easy to miss:
 *
 *  1. `mst-heart-flash` — a bright bloom of light punching outward, the
 *     instant-of-impact flash.
 *  2. `mst-shock-ring` — a gold ring expanding outward right behind the
 *     flash, like a shockwave — the single clearest "something just
 *     happened here" cue of the four.
 *  3. Sparks — a dense ring of tiny fast dots shooting out and vanishing
 *     before the hearts arrive, the flash's own afterglow.
 *  4. Hearts — the main event: bigger, more numerous, more heavily glowing
 *     than a first pass, popping outward with a scale overshoot and then
 *     drifting further out while rising and fading, like hearts floating
 *     away rather than confetti falling.
 *
 * Same one-shot pattern as SealBurst/ScratchCanvas's own idiom: mounted
 * only while `active`, unmounted by the parent once every layer's had time
 * to finish so it never sits idle in the DOM or intercepts a later
 * scratch. Absolutely positioned (not `fixed` like SealBurst) so it's
 * scoped to whichever card triggered it — the parent needs to stay
 * `relative` and `overflow-visible` for all of this to fly past the
 * card's own edges (see ScratchCanvas).
 */
export default function HeartBurst({ active, reduceMotion = false }: HeartBurstProps) {
  if (!active || reduceMotion) return null
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30">
      <div
        className="absolute inset-0 animate-[mst-heart-flash_650ms_cubic-bezier(.16,1,.3,1)_forwards]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,250,235,0.98) 0%, rgba(255,244,214,0.75) 20%, rgba(242,214,117,0.4) 42%, rgba(212,175,55,0.12) 62%, transparent 78%)',
        }}
      />

      {/* The keyframe's own 0% state already centers this (translate(-50%,
          -50%)), so no Tailwind translate utility is needed here. */}
      <div
        className="absolute top-1/2 left-1/2 h-16 w-16 rounded-full border-[3px] border-[#f2d675] animate-[mst-shock-ring_700ms_cubic-bezier(.16,1,.3,1)_forwards]"
        style={{ boxShadow: '0 0 24px 4px rgba(242,214,117,0.55)' }}
      />

      {SPARK_PIECES.map((spark, i) => (
        <span
          key={`spark-${i}`}
          className="absolute top-1/2 left-1/2 rounded-full bg-[#fbf3e3] animate-[mst-spark-fly_520ms_ease-out_forwards]"
          style={
            {
              width: spark.size,
              height: spark.size,
              boxShadow: '0 0 6px 2px rgba(251,243,227,0.8)',
              animationDelay: `${spark.delay}ms`,
              '--mst-spark-x': `${spark.x}px`,
              '--mst-spark-y': `${spark.y}px`,
            } as React.CSSProperties
          }
        />
      ))}

      {HEART_PIECES.map((piece, i) => (
        <svg
          key={`heart-${i}`}
          viewBox="0 0 24 24"
          className="absolute top-1/2 left-1/2 animate-[mst-heart-burst_1150ms_cubic-bezier(.16,1,.3,1)_forwards]"
          style={
            {
              width: piece.size,
              height: piece.size,
              fill: piece.color,
              filter: `drop-shadow(0 0 6px ${piece.color}) drop-shadow(0 0 12px ${piece.color}99)`,
              animationDelay: `${piece.delay}ms`,
              '--mst-heart-x': `${piece.cx}px`,
              '--mst-heart-y': `${piece.cy}px`,
              '--mst-heart-rotate': `${piece.rotate}deg`,
            } as React.CSSProperties
          }
        >
          <path d={HEART_PATH} />
        </svg>
      ))}
    </div>
  )
}
