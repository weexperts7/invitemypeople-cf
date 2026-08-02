import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

// Coarse-pointer (touch) devices get the plain swipeable row too: the
// autoplaying track is a CSS-transform animation inside an overflow-hidden
// box, which has no native scroll position for touch gestures to grab —
// pausing on touch stops the animation but doesn't let a swipe move it.
function useCoarsePointer() {
  const [coarse, setCoarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )

  useEffect(() => {
    const mql = window.matchMedia('(pointer: coarse)')
    const onChange = (e) => setCoarse(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return coarse
}

// A continuously auto-scrolling row of template cards — used for both the
// wedding and Satsang galleries on the landing page so the two categories
// read as equally-weighted "browse this way" sections instead of one being
// a static grid and the other an afterthought below it.
//
// Technique: render two back-to-back copies of the list, then animate the
// track from translateX(-50%) to 0% (see .marquee-right in index.css) so it
// loops seamlessly — the moment copy two finishes sliding into copy one's
// original position, the animation resets with no visible jump. Each item
// carries its own trailing marginRight (rather than a flex `gap`) so that
// math holds exactly: two copies of identically-sized items means 50% of the
// track's width is exactly one copy wide.
export default function TemplateMarquee({
  items,
  keyExtractor,
  renderItem,
  itemWidth = 300,
  gap = 24,
  secondsPerItem = 4.5,
  reverse = false,
}) {
  const reduceMotion = useReducedMotion()
  const coarsePointer = useCoarsePointer()
  const [paused, setPaused] = useState(false)

  if (!items.length) return null

  // Reduced motion or touch: a plain swipeable row, no autoplay. Edge
  // padding here (rather than on the track itself) keeps the autoplaying
  // version flush corner-to-corner while this fallback still gives the
  // first/last card room to breathe against the viewport edge.
  if (reduceMotion || coarsePointer) {
    return (
      <div className="flex overflow-x-auto pt-2 pb-4 pl-6 pr-6 snap-x snap-mandatory">
        {items.map((item) => (
          <div
            key={keyExtractor(item)}
            className="shrink-0 snap-start"
            style={{ width: itemWidth, marginRight: gap }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    )
  }

  const duration = Math.max(items.length * secondsPerItem, 14)
  const track = [...items, ...items]

  return (
    <div
      className="overflow-hidden pt-2 pb-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex w-max"
        style={{
          animationName: 'marquee-right',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {track.map((item, i) => (
          <div
            key={`${keyExtractor(item)}-${i}`}
            className="shrink-0"
            style={{ width: itemWidth, marginRight: gap }}
            aria-hidden={i >= items.length}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
