import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Celebration from './Celebration'
import { useScratchCanvas } from '../hooks/useScratchCanvas'
import { useRandomBlessing } from '../hooks/useRandomBlessing'

const CARD_MAX_WIDTH = 320
const CARD_ASPECT = 0.72 // height / width

function drawFoil(ctx, { width, height }, palette) {
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
  ctx.font = `500 ${Math.max(10, Math.round(width * 0.06))}px Poppins, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('scratch for your blessing', width / 2, height / 2)
}

export default function DivineBlessingScratchCard({ palette }) {
  const rowRef = useRef(null)
  const [cardWidth, setCardWidth] = useState(0)
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const measure = () => setCardWidth(Math.min(CARD_MAX_WIDTH, el.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cardHeight = Math.round(cardWidth * CARD_ASPECT)

  const handleRevealed = useCallback(() => {
    setBurst({ id: Date.now() })
  }, [])

  const { blessing } = useRandomBlessing({ locked: Boolean(burst) })
  const { canvasRef, revealed, canvasHandlers } = useScratchCanvas({
    width: cardWidth,
    height: cardHeight,
    drawSurface: (ctx, size) => drawFoil(ctx, size, palette),
    onRevealed: handleRevealed,
    enabled: cardWidth > 0,
  })

  return (
    <section className="px-5 pt-16 pb-4 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-ink mb-2"
      >
        Divine Blessing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-ink-soft mb-10"
      >
        Scratch the gold foil to receive your blessing
      </motion.p>

      <div ref={rowRef} className="mx-auto flex max-w-md items-center justify-center">
        {cardWidth > 0 && (
          <motion.div
            className="flex min-w-0 flex-col items-center gap-2"
            initial={{ opacity: 0, y: 42, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden border border-gold-soft shadow-card bg-ivory"
              style={{ width: cardWidth, height: cardHeight }}
              animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            >
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
                initial={false}
                animate={revealed ? { scale: [0.55, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              >
                <Sparkles className="w-5 h-5 text-gold" strokeWidth={1.5} />
                <span
                  className="font-serif text-rose leading-snug"
                  style={{ fontSize: Math.max(13, Math.round(cardWidth * 0.078)) }}
                >
                  &ldquo;{blessing?.text}&rdquo;
                </span>
                {blessing?.author && (
                  <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                    &mdash; {blessing.author}
                  </span>
                )}
              </motion.div>

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
                  style={{ width: cardWidth, height: cardHeight, touchAction: 'none' }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  {...canvasHandlers}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={1.6}
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
