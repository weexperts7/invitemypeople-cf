interface AmbientLightsProps {
  /** Skips the flicker/drift animations — the warm wash and bokeh dots stay, just static. */
  reduceMotion?: boolean
  /**
   * 'wash' — a soft top-down lamp-glow plus a few out-of-focus light dots,
   * used behind every dashboard section (CoupleHero gets `full`, the rest
   * `soft`).
   * 'strings' — two columns of hanging fairy-light bulbs along the left/
   * right edges, standing in for the video's own string lights whenever
   * `IntroOverlay` falls back to the illustrated envelope (no video, or
   * one that failed to load).
   */
  variant?: 'wash' | 'strings'
  /** 'full' for the hero/intro (more lights), 'soft' for content sections further down the page. */
  density?: 'full' | 'soft'
}

// Fixed, hand-placed positions rather than randomized — keeps every render
// (and every guest's screen) identical instead of the dots jumping around
// on re-render, and avoids clustering that Math.random() can produce.
const WASH_BOKEH_FULL = [
  { top: '6%', left: '10%', size: 12, delay: '0s' },
  { top: '14%', left: '86%', size: 16, delay: '0.7s' },
  { top: '3%', left: '48%', size: 8, delay: '1.4s' },
  { top: '26%', left: '94%', size: 7, delay: '2.1s' },
  { top: '22%', left: '3%', size: 9, delay: '0.35s' },
  { top: '34%', left: '62%', size: 6, delay: '1.75s' },
]
const WASH_BOKEH_SOFT = [
  { top: '5%', left: '8%', size: 10, delay: '0s' },
  { top: '10%', left: '90%', size: 8, delay: '1.1s' },
  { top: '3%', left: '52%', size: 6, delay: '2s' },
]

const EMBERS_FULL = [
  { left: '14%', duration: '8s', delay: '0s', drift: '18px' },
  { left: '42%', duration: '10.5s', delay: '2.2s', drift: '-14px' },
  { left: '68%', duration: '9s', delay: '4.4s', drift: '10px' },
  { left: '85%', duration: '11s', delay: '1.1s', drift: '-20px' },
  { left: '28%', duration: '9.5s', delay: '5.6s', drift: '16px' },
]
const EMBERS_SOFT = [
  { left: '20%', duration: '9s', delay: '0s', drift: '14px' },
  { left: '75%', duration: '10s', delay: '3.5s', drift: '-16px' },
]

/** A hanging string of `count` warm bulbs, gently swaying/flickering, anchored to one edge. */
function LightString({ side, reduceMotion }: { side: 'left' | 'right'; reduceMotion: boolean }) {
  const bulbs = [0, 1, 2, 3, 4, 5]
  return (
    <div
      aria-hidden="true"
      className={`absolute top-0 h-full w-10 ${side === 'left' ? 'left-0' : 'right-0'} ${
        reduceMotion ? '' : 'animate-[mst-rope-sway_4s_ease-in-out_infinite_alternate]'
      }`}
      style={{ transformOrigin: 'top center' }}
    >
      {bulbs.map((i) => (
        <span
          key={i}
          className={`mst-bokeh absolute ${side === 'left' ? 'left-2' : 'right-2'} ${reduceMotion ? '' : 'animate-[mst-shimmer_2.4s_ease-in-out_infinite]'}`}
          style={{
            top: `${8 + i * 15}%`,
            width: 9,
            height: 9,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Decorative, non-interactive warm lighting — the lamp-glow wash, bokeh
 * dots, and (on `wash`) a couple of slowly rising embers that carry the
 * intro video's own bright, warmly-lit look into the dashboard beneath it.
 *
 * Always `aria-hidden` and `pointer-events-none`; the parent must be
 * `relative overflow-hidden` and any real content after it needs its own
 * `relative z-10` (see CoupleHero for the pattern) so this never paints
 * over anything readable or interactive.
 */
export default function AmbientLights({ reduceMotion = false, variant = 'wash', density = 'soft' }: AmbientLightsProps) {
  if (variant === 'strings') {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="mst-glow-wash absolute inset-0" />
        <LightString side="left" reduceMotion={reduceMotion} />
        <LightString side="right" reduceMotion={reduceMotion} />
      </div>
    )
  }

  const bokeh = density === 'full' ? WASH_BOKEH_FULL : WASH_BOKEH_SOFT
  const embers = density === 'full' ? EMBERS_FULL : EMBERS_SOFT

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="mst-glow-wash absolute inset-0" />

      {bokeh.map((dot, i) => (
        <span
          key={i}
          className={`mst-bokeh absolute ${reduceMotion ? '' : 'animate-[mst-shimmer_3s_ease-in-out_infinite]'}`}
          style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size, animationDelay: dot.delay }}
        />
      ))}

      {!reduceMotion &&
        embers.map((ember, i) => (
          <span
            key={i}
            className="mst-bokeh absolute bottom-0 h-[5px] w-[5px] animate-[mst-ember-drift_linear_infinite]"
            style={
              {
                left: ember.left,
                animationDuration: ember.duration,
                animationDelay: ember.delay,
                '--mst-drift': ember.drift,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  )
}
