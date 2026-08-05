import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Celebration from './Celebration'

const CARD_MAX_WIDTH = 300
const CARD_ASPECT = 0.66 // height / width
const REVEAL_THRESHOLD = 0.55
const TOUCH_DECISION_PX = 8
const DEFAULT_DATE = { month: 'JULY', day: '01', year: '2026' }
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

// Accepts a Date or an ISO-ish string ("2026-12-12" / "2026-12-12T09:00:00")
// — falls back to the demo date if it's missing or unparseable, so every
// existing caller that doesn't pass one keeps today's behavior exactly.
function formatScratchDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (!date || Number.isNaN(d.getTime())) return DEFAULT_DATE
  return {
    month: MONTHS[d.getMonth()],
    day: String(d.getDate()).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
}

function ScratchCard({ width, height, onRevealed, palette, date }) {
  const canvasRef = useRef(null)
  const isScratching = useRef(false)
  const lastPoint = useRef(null)
  const touchMode = useRef('undecided') // 'undecided' | 'scratch' | 'scroll'
  const touchStart = useRef(null)
  const lastTouchY = useRef(null)
  const hasRevealed = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const reduceMotion = useReducedMotion()

  // Brush scales with the card so a small card still takes a few strokes.
  const brushRadius = Math.max(9, width * 0.09)
  const displayDate = formatScratchDate(date)

  const drawFoil = useCallback(
    (ctx) => {
      const goldSoft = palette?.goldSoft ?? '#ddc186'
      const gold = palette?.gold ?? '#c9a24b'
      const ivory = palette?.ivory ?? '#fdfaf4'
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, goldSoft)
      gradient.addColorStop(0.5, gold)
      gradient.addColorStop(1, goldSoft)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = `${ivory}d9`
      ctx.font = `500 ${Math.max(10, Math.round(width * 0.07))}px Poppins, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('scratch to reveal', width / 2, height / 2)
    },
    [width, height, palette],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width) return
    // Size the backing store for the device pixel ratio, then keep the scale
    // applied so scratch strokes share the foil's coordinate space.
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    drawFoil(ctx)
  }, [drawFoil, width, height])

  const getPoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const scratchAt = (ctx, point) => {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(point.x, point.y, brushRadius, 0, Math.PI * 2)
    ctx.fill()
    if (lastPoint.current) {
      ctx.lineWidth = brushRadius * 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }
    lastPoint.current = point
  }

  const checkProgress = () => {
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
    if (cleared / total > REVEAL_THRESHOLD) {
      hasRevealed.current = true
      setRevealed(true)
      onRevealed()
    }
  }

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

  // Touch has to disambiguate a scratch stroke from a scroll swipe: the canvas
  // keeps touch-action:none so scratching is always captured, and once a
  // gesture reads as vertical-dominant we scroll the page manually instead.
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
      if (Math.abs(dx) < TOUCH_DECISION_PX && Math.abs(dy) < TOUCH_DECISION_PX) return
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

  return (
    <motion.div
      className="flex min-w-0 flex-col items-center gap-2"
      initial={{ opacity: 0, y: 42, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden border border-gold-soft shadow-card bg-ivory"
        style={{ width, height }}
        animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      >
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1"
          initial={false}
          animate={revealed ? { scale: [0.55, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <span className="text-[11px] tracking-[0.25em] uppercase text-ink-soft">
            We&rsquo;re getting married
          </span>
          <span
            className="font-serif text-rose leading-none"
            style={{ fontSize: Math.round(width * 0.15) }}
          >
            {displayDate.month} {displayDate.day}
          </span>
          <span
            className="font-serif text-ink-soft leading-none"
            style={{ fontSize: Math.round(width * 0.09) }}
          >
            {displayDate.year}
          </span>
        </motion.div>

        {/* gold ring flash the moment the card clears */}
        {revealed && !reduceMotion && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-gold"
            initial={{ opacity: 0.9, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.35 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {!revealed && (
          <canvas
            ref={canvasRef}
            style={{ width, height, touchAction: 'none' }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export default function ScratchCardSection({ palette, date }) {
  const rowRef = useRef(null)
  const [burst, setBurst] = useState(null)
  // Card is sized from the row's real width so it always fits within the section.
  const [cardWidth, setCardWidth] = useState(0)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const measure = () => setCardWidth(Math.min(CARD_MAX_WIDTH, el.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleRevealed = useCallback(() => {
    setBurst({ id: Date.now(), final: true })
  }, [])

  const cardHeight = Math.round(cardWidth * CARD_ASPECT)

  return (
    <section className="px-5 py-20 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-ink mb-2"
      >
        Save the Date
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-ink-soft mb-10"
      >
        Scratch the gold foil to reveal our day
      </motion.p>

      <div ref={rowRef} className="mx-auto flex max-w-md items-center justify-center">
        {cardWidth > 0 && (
          <ScratchCard
            width={cardWidth}
            height={cardHeight}
            onRevealed={handleRevealed}
            palette={palette}
            date={date}
          />
        )}
      </div>

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={burst.final ? 1.9 : 1}
            onComplete={() => setBurst(null)}
            colors={
              palette
                ? [palette.gold, palette.goldSoft, palette.blushDeep, palette.rose, palette.champagne, palette.ivory].filter(
                    Boolean,
                  )
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </section>
  )
}
