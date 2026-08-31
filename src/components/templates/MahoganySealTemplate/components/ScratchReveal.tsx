import { useCallback, useEffect, useRef, useState } from 'react'
import AmbientLights from './AmbientLights'

interface ScratchRevealProps {
  eyebrow: string
  message: string
  hashtag: string
  revealThreshold?: number
  reduceMotion?: boolean
}

const BRUSH_RADIUS = 26

/**
 * Canvas scratch-to-reveal card: an embossed gold layer the guest drags a
 * finger/cursor across (`globalCompositeOperation = "destination-out"`
 * erases it), estimated by a downsampled alpha scan; crossing
 * `revealThreshold` fraction cleared cross-fades the rest away via a plain
 * CSS opacity transition (no animation library — matches the brief's
 * "useState + CSS transition" instruction).
 */
export default function ScratchReveal({
  eyebrow,
  message,
  hashtag,
  revealThreshold = 0.45,
  reduceMotion = false,
}: ScratchRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const revealedRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [dissolving, setDissolving] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const paintOverlay = useCallback((canvas: HTMLCanvasElement) => {
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
    // Matches the 500ms CSS transition on the canvas below — once it's
    // finished fading, drop the canvas from the DOM entirely so the
    // content underneath is fully interactive (links, etc.) again.
    window.setTimeout(() => setRevealed(true), 520)
  }, [])

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
    <section aria-label="Scratch card" className="relative overflow-hidden bg-[#2c1d18] px-5 py-16 sm:px-8">
      <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
      <div className="relative z-10 mx-auto max-w-md text-center">
        <p className="mst-font-seal text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">{eyebrow}</p>
        <h3 className="mst-font-display mt-2 text-2xl font-semibold text-[#fbf3e3]">Go on, scratch it</h3>

        <div
          ref={wrapRef}
          className="relative mx-auto mt-8 aspect-[5/3] w-full overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#1a100d] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="mst-font-display text-lg leading-relaxed text-[#fbf3e3]">{message}</p>
            <p className="mst-font-seal text-xs tracking-[0.15em] text-[#d4af37]">{hashtag}</p>
          </div>

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
              aria-label="Scratch to reveal a message from the couple"
            />
          )}
        </div>
      </div>
    </section>
  )
}
