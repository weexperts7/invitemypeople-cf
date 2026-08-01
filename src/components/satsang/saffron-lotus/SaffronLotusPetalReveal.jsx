import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Flower2 } from 'lucide-react'
import Celebration from '../../Celebration'
import { useScratchCanvas } from '../../../hooks/useScratchCanvas'
import { useRandomBlessing } from '../../../hooks/useRandomBlessing'
import { LOTUS_PETAL_CLIP_PATH } from './lotusDividers'

const PETAL_WIDTH = 200
const PETAL_HEIGHT = 280
// The petal clip discards a large share of the rectangular canvas's corner
// pixels, so the default 0.55 threshold would rarely be reachable — see
// useScratchCanvas's JSDoc on clipped shapes.
const PETAL_REVEAL_THRESHOLD = 0.38

function drawPetalFoil(ctx, { width, height }, palette) {
  const gold = palette?.gold ?? '#d9932e'
  const goldSoft = palette?.goldSoft ?? '#eec27a'
  const champagne = palette?.champagne ?? '#fbe3c0'
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, goldSoft)
  grad.addColorStop(0.55, gold)
  grad.addColorStop(1, champagne)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = `${palette?.ivory ?? '#fffaf3'}d9`
  ctx.font = `500 ${Math.max(9, Math.round(width * 0.062))}px Poppins, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('gently', width / 2, height / 2 - 10)
  ctx.fillText('unfold', width / 2, height / 2 + 10)
}

export default function SaffronLotusPetalReveal({ palette }) {
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()
  const handleRevealed = useCallback(() => setBurst({ id: Date.now() }), [])
  const { blessing } = useRandomBlessing({ locked: Boolean(burst) })
  const { canvasRef, revealed, canvasHandlers } = useScratchCanvas({
    width: PETAL_WIDTH,
    height: PETAL_HEIGHT,
    drawSurface: (ctx, size) => drawPetalFoil(ctx, size, palette),
    onRevealed: handleRevealed,
    revealThreshold: PETAL_REVEAL_THRESHOLD,
  })

  return (
    <section className="px-6 py-14">
      <div className="max-w-[80%] mb-8">
        <p className="text-[10px] tracking-[0.3em] uppercase text-rose mb-2 flex items-center gap-1.5">
          <Flower2 className="w-3.5 h-3.5" strokeWidth={1.6} />
          Sacred Lotus Petal
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight mb-2 text-left">
          Unfold your blessing
        </h2>
        <p className="text-ink-soft text-sm leading-relaxed text-left">
          Trace your finger over the petal to let it open, one gentle stroke at a time.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="ml-1"
        style={{ width: PETAL_WIDTH }}
      >
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <clipPath id="lotus-petal-clip" clipPathUnits="objectBoundingBox">
              <path d={LOTUS_PETAL_CLIP_PATH} />
            </clipPath>
          </defs>
        </svg>

        <div
          className="relative shadow-card"
          style={{
            width: PETAL_WIDTH,
            height: PETAL_HEIGHT,
            clipPath: 'url(#lotus-petal-clip)',
          }}
        >
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center"
            initial={false}
            animate={revealed ? { scale: [0.5, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: 'var(--color-ivory)' }}
          >
            <span className="font-serif text-[13px] leading-snug text-ink">
              &ldquo;{blessing?.text}&rdquo;
            </span>
          </motion.div>

          {revealed && !reduceMotion && (
            <motion.span
              className="pointer-events-none absolute inset-0 border-2"
              style={{ borderColor: palette?.gold ?? '#d9932e' }}
              initial={{ opacity: 0.9, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {!revealed && (
            <canvas
              ref={canvasRef}
              style={{ width: PETAL_WIDTH, height: PETAL_HEIGHT, touchAction: 'none' }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              {...canvasHandlers}
            />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={1.5}
            onComplete={() => setBurst(null)}
            colors={
              palette
                ? [palette.gold, palette.goldSoft, palette.rose, palette.champagneDeep, palette.champagne, palette.ivory].filter(
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
