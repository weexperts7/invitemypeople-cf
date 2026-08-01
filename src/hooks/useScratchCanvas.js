import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_REVEAL_THRESHOLD = 0.55
const DEFAULT_TOUCH_DECISION_PX = 8

// Generalizes the scratch-to-reveal canvas mechanic shared by every
// "scratch foil" interaction in the app (Save the Date, Divine Blessing, and
// now the per-template Satsang reveals). Handles DPR-aware sizing, the
// destination-out scratch stroke, alpha-sampled progress detection, and the
// touch-vs-scroll gesture disambiguator — all copied 1:1 from the original
// ScratchCardSection/DivineBlessingScratchCard implementations, since none of
// that interaction math needs to change per template.
//
// The hook stays visually blank: callers own the "foil" art via
// `drawSurface(ctx, { width, height })`, so a vault door, a lotus petal, or
// a plain gold gradient can all sit on top of the same mechanic. For a
// non-rectangular reveal (e.g. a lotus-petal clip-path), wrap the returned
// canvas in a clipped container and pass a lower `revealThreshold` — the
// alpha sampling still runs over the full rectangular backing store, so a
// clipped shape's permanently-hidden corner pixels would otherwise count
// against the threshold.
export function useScratchCanvas({
  width,
  height,
  drawSurface,
  onRevealed,
  revealThreshold = DEFAULT_REVEAL_THRESHOLD,
  brushRadius,
  touchDecisionPx = DEFAULT_TOUCH_DECISION_PX,
  enabled = true,
}) {
  const canvasRef = useRef(null)
  const isScratching = useRef(false)
  const lastPoint = useRef(null)
  const touchMode = useRef('undecided') // 'undecided' | 'scratch' | 'scroll'
  const touchStart = useRef(null)
  const lastTouchY = useRef(null)
  const hasRevealed = useRef(false)
  const [revealed, setRevealed] = useState(false)

  const radius = brushRadius ?? Math.max(9, width * 0.09)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height || !enabled) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    drawSurface(ctx, { width, height })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, enabled])

  const getPoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const scratchAt = (ctx, point) => {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fill()
    if (lastPoint.current) {
      ctx.lineWidth = radius * 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }
    lastPoint.current = point
  }

  const checkProgress = useCallback(() => {
    if (hasRevealed.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    let total = 0
    const step = 4 * 8 // sample every 8th pixel for performance
    for (let i = 3; i < data.length; i += step) {
      total += 1
      if (data[i] < 60) cleared += 1
    }
    if (cleared / total > revealThreshold) {
      hasRevealed.current = true
      setRevealed(true)
      onRevealed?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealThreshold, onRevealed])

  const handleMouseDown = (e) => {
    if (revealed) return
    isScratching.current = true
    lastPoint.current = null
    scratchAt(canvasRef.current.getContext('2d'), getPoint(e.clientX, e.clientY))
  }

  const handleMouseMove = (e) => {
    if (!isScratching.current || revealed) return
    scratchAt(canvasRef.current.getContext('2d'), getPoint(e.clientX, e.clientY))
    checkProgress()
  }

  const handleMouseUp = () => {
    isScratching.current = false
    lastPoint.current = null
  }

  // Touch has to disambiguate a scratch stroke from a scroll swipe: the
  // canvas keeps touch-action:none so scratching is always captured, and
  // once a gesture reads as vertical-dominant we scroll the page manually.
  const handleTouchStart = (e) => {
    if (revealed) return
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
    lastTouchY.current = t.clientY
    touchMode.current = 'undecided'
    lastPoint.current = null
  }

  const handleTouchMove = (e) => {
    if (revealed || !touchStart.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y

    if (touchMode.current === 'undecided') {
      if (Math.abs(dx) < touchDecisionPx && Math.abs(dy) < touchDecisionPx) return
      touchMode.current = Math.abs(dy) > Math.abs(dx) * 1.3 ? 'scroll' : 'scratch'
    }

    if (touchMode.current === 'scratch') {
      scratchAt(canvasRef.current.getContext('2d'), getPoint(t.clientX, t.clientY))
      checkProgress()
    } else {
      window.scrollBy(0, lastTouchY.current - t.clientY)
      lastTouchY.current = t.clientY
    }
  }

  const handleTouchEnd = () => {
    touchStart.current = null
    lastTouchY.current = null
    touchMode.current = 'undecided'
    lastPoint.current = null
  }

  return {
    canvasRef,
    revealed,
    canvasHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
