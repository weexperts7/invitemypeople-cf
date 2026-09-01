import { useCallback, useEffect, useRef, useState } from 'react'
import HeartBurst from './HeartBurst'

interface ScratchCanvasProps {
  /** Content sitting under the gold scratch layer — revealed as the guest scratches it off. */
  children: React.ReactNode
  onRevealed?: () => void
  revealThreshold?: number
  /** Text embossed on the gold overlay, e.g. "SCRATCH TO REVEAL". */
  scratchLabel?: string
  ariaLabel?: string
  className?: string
  /** Fires a one-shot HeartBurst the moment the card finishes revealing. */
  celebrateOnReveal?: boolean
  reduceMotion?: boolean
}

const BRUSH_RADIUS = 26
// How long HeartBurst's own longest layer (its hearts) takes to finish
// flying/fading — see its `1150ms` animation plus up to ~125ms of
// staggered per-piece delay — kept in one place so the unmount timer below
// can't drift out of sync with the animation it's timing, same idiom as
// the root component's `BURST_MS`.
const HEART_BURST_MS = 1300

/**
 * Reusable canvas scratch-to-reveal surface: an embossed gold layer the
 * guest drags a finger/cursor across (`globalCompositeOperation =
 * "destination-out"` erases it), estimated by a downsampled alpha scan;
 * crossing `revealThreshold` fraction cleared cross-fades the rest away via
 * a plain CSS opacity transition (no animation library).
 *
 * Factored out of what was originally ScratchReveal's own canvas logic so
 * CoupleHero's date reveal can reuse the exact same mechanic instead of a
 * second copy of this — both wrap it around different `children`.
 */
export default function ScratchCanvas({
  children,
  onRevealed,
  revealThreshold = 0.45,
  scratchLabel = 'SCRATCH TO REVEAL',
  ariaLabel = 'Scratch to reveal',
  className = '',
  celebrateOnReveal = false,
  reduceMotion = false,
}: ScratchCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const revealedRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [dissolving, setDissolving] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const paintOverlay = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      const { width, height } = canvas

      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#f2d675')
      gradient.addColorStop(0.5, '#d4af37')
      gradient.addColorStop(1, '#8a6a1f')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'rgba(44,29,24,0.55)'
      ctx.font = `600 ${Math.max(12, width * 0.05)}px 'Cinzel', serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(scratchLabel, width / 2, height / 2)
    },
    [scratchLabel]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      // Bail on a 0×0 measurement instead of painting into it. This card
      // mounts while it's still inside the intro's `<main>`, which is
      // `display:none` until the intro video finishes — so the *first*
      // call here would otherwise size the canvas's drawing buffer to
      // 0×0, silently skip the gold overlay paint, and leave the date
      // showing "already scratched" the instant `main` un-hides. A plain
      // `window.resize` listener never fires for that display:none→flex
      // transition (the window itself hasn't resized), which is why this
      // uses a ResizeObserver instead — it fires for that transition too,
      // so the overlay actually gets painted once real dimensions exist.
      if (rect.width === 0 || rect.height === 0) return
      canvas.width = rect.width
      canvas.height = rect.height
      paintOverlay(canvas)
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [paintOverlay])

  const getScratchedFraction = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return 0
    const { width, height } = canvas
    const step = 6
    const data = ctx.getImageData(0, 0, width, height).data
    let transparent = 0
    let total = 0
    for (let i = 3; i < data.length; i += 4 * step) {
      total++
      if (data[i] < 30) transparent++
    }
    return total ? transparent / total : 0
  }, [])

  const finishReveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setDissolving(true)
    // Fires in the same instant the gold layer starts dissolving, not
    // after it's finished — the burst is the payoff *for* the reveal, so
    // it should land right as the card starts giving up what's underneath,
    // not as an afterthought once it's already visible.
    if (celebrateOnReveal) {
      setCelebrating(true)
      window.setTimeout(() => setCelebrating(false), HEART_BURST_MS)
    }
    // Matches the 500ms CSS transition on the canvas below — once it's
    // finished fading, drop the canvas from the DOM entirely so the
    // content underneath is fully interactive (links, etc.) again.
    window.setTimeout(() => {
      setRevealed(true)
      onRevealed?.()
    }, 520)
  }, [celebrateOnReveal, onRevealed])

  const scratchAt = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas || revealedRef.current) return
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.globalCompositeOperation = 'destination-out'
      const last = lastPointRef.current
      if (last) {
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = BRUSH_RADIUS * 2
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }
      lastPointRef.current = { x, y }

      if (getScratchedFraction(canvas) >= revealThreshold) finishReveal()
    },
    [finishReveal, getScratchedFraction, revealThreshold]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealedRef.current) return
    isDrawingRef.current = true
    lastPointRef.current = null
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
    scratchAt(e.clientX, e.clientY)
  }
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    for (const ev of events) scratchAt(ev.clientX, ev.clientY)
  }
  const handlePointerUp = () => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  return (
    // Outer wrapper carries the caller's sizing (`className` — width/aspect
    // ratio) and stays `overflow-visible` so HeartBurst's pieces can fly
    // past the card's own bounds instead of getting clipped at its edge.
    // The rounded/clipped card look lives one level in, on `wrapRef`, so
    // the gold overlay's corners still respect it.
    <div className={`relative ${className}`}>
      <div
        ref={wrapRef}
        className="relative h-full w-full overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#1a100d] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">{children}</div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full cursor-pointer touch-none transition-opacity duration-500 ease-out ${
              dissolving ? 'opacity-0' : 'opacity-100'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            role="img"
            aria-label={ariaLabel}
          />
        )}
      </div>

      {celebrateOnReveal && <HeartBurst active={celebrating} reduceMotion={reduceMotion} />}
    </div>
  )
}
