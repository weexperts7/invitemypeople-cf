import { useEffect, useRef, type ReactNode } from 'react'

const BENDS = 22
const STEP = 1000 / BENDS
const CENTRE = 50
const LEAVES = 44
const sideOf = (bend: number) => (bend % 2 ? 76 : 24)
// Control points at a third and two thirds of each bend keep y linear in t, so
// the tip can follow the vine by arithmetic instead of measuring the path.
const VINE = Array.from({ length: BENDS }, (_, i) => {
  const y = i * STEP
  return `C${sideOf(i)} ${y + STEP / 3} ${sideOf(i)} ${y + (STEP * 2) / 3} ${CENTRE} ${y + STEP}`
}).join(' ')
const VINE_PATH = `M${CENTRE} 0 ${VINE}`

function vineX(progress: number) {
  const along = Math.min(progress, 0.9999) * BENDS
  const bend = Math.floor(along)
  const t = along - bend
  const u = 1 - t
  return CENTRE * (u * u * u + t * t * t) + sideOf(bend) * 3 * u * t
}

const LEAF_SPOTS = Array.from({ length: LEAVES }, (_, i) => {
  const at = (i + 0.5) / LEAVES
  return { top: at * 100, left: vineX(at), flip: i % 2 === 1 }
})

function findScroller(el: HTMLElement) {
  let node = el.parentElement
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node)
    if (overflowY === 'auto' || overflowY === 'scroll') return node
    node = node.parentElement
  }
  return null
}

/**
 * The rose vine down the left of the page. A faint pencil line runs the full
 * length, and the living stem, with its leaves and a budding tip, grows along
 * it as the guest scrolls. Written straight to the DOM on each frame, never
 * through state, so a scroll doesn't re-render the page.
 */
export default function RosePath({ children, reduceMotion }: { children: ReactNode; reduceMotion: boolean }) {
  const walkRef = useRef<HTMLDivElement>(null)
  const vineRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const walk = walkRef.current
    if (!walk) return
    if (reduceMotion) {
      walk.style.setProperty('--gm-grown', '100%')
      return
    }

    const scroller = findScroller(walk)
    const target: HTMLElement | Window = scroller ?? window
    let frame = 0

    const update = () => {
      frame = 0
      const rect = walk.getBoundingClientRect()
      const top = scroller ? scroller.getBoundingClientRect().top : 0
      const viewport = scroller ? scroller.clientHeight : window.innerHeight
      const walked = top + viewport * 0.62 - rect.top
      const progress = Math.min(1, Math.max(0, walked / rect.height))
      walk.style.setProperty('--gm-grown', `${(progress * 100).toFixed(2)}%`)
      const tip = tipRef.current
      const vine = vineRef.current
      if (tip && vine) {
        const x = (vineX(progress) / 100) * vine.clientWidth
        tip.style.transform = `translate3d(${x.toFixed(1)}px, ${(progress * rect.height).toFixed(1)}px, 0)`
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    target.addEventListener('scroll', schedule, { passive: true })
    const ro = new ResizeObserver(schedule)
    ro.observe(walk)
    return () => {
      target.removeEventListener('scroll', schedule)
      ro.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [reduceMotion])

  return (
    <div ref={walkRef} className="gm-walk">
      <svg className="gm-vine-svg" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
        <path className="gm-vine-pencil" d={VINE_PATH} vectorEffect="non-scaling-stroke" />
      </svg>
      <div ref={vineRef} className="gm-vine" aria-hidden="true">
        <svg className="gm-vine-svg" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path className="gm-vine-stem" d={VINE_PATH} vectorEffect="non-scaling-stroke" />
        </svg>
        {LEAF_SPOTS.map((leaf, i) => (
          <i
            key={i}
            className={`gm-leaf${leaf.flip ? ' gm-leaf--flip' : ''}`}
            style={{ top: `${leaf.top}%`, left: `${leaf.left}%` }}
          />
        ))}
      </div>
      {!reduceMotion && <span ref={tipRef} className="gm-tip" aria-hidden="true" />}
      {children}
    </div>
  )
}
