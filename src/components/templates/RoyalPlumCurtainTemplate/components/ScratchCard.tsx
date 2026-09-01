import { useRef, useState, useCallback, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface ScratchCardProps {
  /** Content rendered underneath the scratchable gold layer. */
  children: React.ReactNode
  /** Fraction (0-1) of the canvas that must be cleared before it auto-dissolves. */
  revealThreshold?: number
  /** Fired once the card fully reveals (either by scratching or auto-finish). */
  onRevealed?: () => void
}

/**
 * Step C — an HTML5 Canvas scratch-to-reveal card. Draws a metallic gold
 * overlay, tracks mouse/touch drag with `globalCompositeOperation =
 * "destination-out"` to erase it, estimates the cleared percentage from a
 * downsampled pixel scan, and once the threshold is crossed, GSAP takes over
 * to fade out whatever's left with a small celebratory sparkle burst.
 */
const BRUSH_RADIUS = 26

export default function ScratchCard({ children, revealThreshold = 0.35, onRevealed }: ScratchCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparkleRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const revealedRef = useRef(false)
  // The last point erased in the current stroke — `null` between strokes
  // (pointer up, or the very start of a new one) so scratchAt knows to
  // stamp a single dot rather than draw a line from a stale, unrelated
  // point left over from wherever the previous stroke ended.
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [revealed, setRevealed] = useState(false)

  const { contextSafe } = useGSAP({ scope: wrapRef })

  const paintOverlay = useCallback((canvas: HTMLCanvasElement) => {
    // willReadFrequently is set on this first getContext('2d') call because
    // per spec, whichever call establishes the context first wins — later
    // calls elsewhere on this canvas (scratchAt, getScratchedFraction)
    // just get the same context back with their own options ignored.
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const { width, height } = canvas

    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f5d061')
    gradient.addColorStop(0.5, '#c79526')
    gradient.addColorStop(1, '#e6ba47')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `${Math.max(12, width * 0.045)}px Montserrat, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      paintOverlay(canvas)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [paintOverlay])

  const finishReveal = contextSafe(() => {
    if (revealedRef.current) return
    revealedRef.current = true

    const canvas = canvasRef.current
    gsap
      .timeline({
        onComplete: () => {
          setRevealed(true)
          onRevealed?.()
        },
      })
      .to(canvas, { opacity: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(
        sparkleRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1.4, duration: 0.35, ease: 'back.out(3)' },
        '<'
      )
      .to(sparkleRef.current, { opacity: 0, duration: 0.4 }, '>-0.05')
  })

  const getScratchedFraction = useCallback((canvas: HTMLCanvasElement) => {
    // willReadFrequently: this path calls getImageData on every scratch
    // move — hint the browser to keep a CPU-backed surface rather than
    // eating a GPU readback penalty each stroke.
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return 0
    // Downsample for performance: sample every 6th pixel rather than every pixel.
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

  // Stamping an isolated circle at each pointermove sample (the old
  // approach) leaves visible gaps whenever the pointer travels farther
  // between two samples than the brush's own diameter — which, at normal
  // scratch speed, is most of the time — so the erased trail reads as a
  // dotted line instead of a continuous scratch. Stroking a round-capped
  // line from the previous point to this one fills that gap solidly, same
  // as every real scratch-card implementation (and how a brush tool works
  // in any paint program).
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
        // First point of a stroke — nothing to draw a line from yet, so
        // stamp a single dot (a zero-length stroke doesn't reliably paint
        // in every browser even with round caps).
        ctx.beginPath()
        ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }
      lastPointRef.current = { x, y }

      const fraction = getScratchedFraction(canvas)
      if (fraction >= revealThreshold) {
        finishReveal()
      }
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
    // The browser batches several real hardware samples into one React
    // pointermove event; replaying all of them (not just the latest) keeps
    // fast scratches from skipping segments between samples.
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    for (const ev of events) {
      scratchAt(ev.clientX, ev.clientY)
    }
  }
  const handlePointerUp = () => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  return (
    <div ref={wrapRef} className="rpc-scratch-wrap">
      <div className="rpc-scratch-content">{children}</div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="rpc-scratch-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="img"
          aria-label="Scratch to reveal venue details"
        />
      )}
      <div
        ref={sparkleRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
        }}
      >
        ✨
      </div>
    </div>
  )
}
