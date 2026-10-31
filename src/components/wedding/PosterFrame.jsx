import { useLayoutEffect, useRef, useState } from 'react'

// The width a poster is laid out at: a phone, like the invite it shows.
const DESIGN_WIDTH = 390

// Scales a bespoke template's real full-size artwork down into a catalog
// card, so its styles stay written in phone-sized pixels instead of needing a
// second miniature set. `inert` takes the artwork's buttons out of tab order:
// inside a card they're a picture, not controls.
export default function PosterFrame({ children }) {
  const ref = useRef(null)
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const el = ref.current
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = size ? size.width / DESIGN_WIDTH : 1

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden" inert>
      {size?.width > 0 && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: DESIGN_WIDTH, height: size.height / scale, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
