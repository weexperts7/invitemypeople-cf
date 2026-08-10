import { useCallback, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ModakGlyph } from '../ganeshMotifs'
import Celebration from '../../Celebration'
import { useScratchCanvas } from '../../../hooks/useScratchCanvas'
import { useRandomBlessing } from '../../../hooks/useRandomBlessing'

const CARD_WIDTH = 224
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.72) // same foil aspect as DivineBlessingScratchCard.jsx

// Draws the golden "foil" a guest scratches away — a modak-toned gradient
// with a small modak glyph and a "scratch" prompt, matching the gold-foil
// look of DivineBlessingScratchCard.jsx (the wedding/satsang equivalent)
// re-tinted to this template's own palette.
function drawFoil(ctx, { width, height }, palette) {
  const champagneDeep = palette?.champagneDeep ?? '#dda164'
  const gold = palette?.gold ?? '#c28a3a'
  const champagne = palette?.champagne ?? '#efcda3'
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, champagne)
  gradient.addColorStop(0.5, gold)
  gradient.addColorStop(1, champagneDeep)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(253, 248, 243, 0.85)'
  ctx.font = `500 ${Math.max(10, Math.round(width * 0.062))}px Poppins, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText("scratch for Bappa's blessing", width / 2, height / 2)
}

// The "Golden Trunk Blessing" interaction this template is named for — a
// gold-foil modak card a guest scratches away to reveal a personal
// blessing. Uses the same shared scratch mechanic as
// DivineBlessingScratchCard.jsx (see useScratchCanvas) rather than a
// tap-to-open lid, so revealing the blessing always reads as a scratch
// card, not an envelope-style flap opening.
export default function ModakBlessingBox({ palette, onOpen }) {
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()

  const gold = palette?.gold ?? '#c28a3a'
  const rose = palette?.rose ?? '#9a1f2b'

  const handleRevealed = useCallback(() => {
    onOpen?.()
    setBurst({ id: Date.now() })
  }, [onOpen])

  const { blessing } = useRandomBlessing({ locked: Boolean(burst) })
  const { canvasRef, revealed, canvasHandlers } = useScratchCanvas({
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    drawSurface: (ctx, size) => drawFoil(ctx, size, palette),
    onRevealed: handleRevealed,
  })

  return (
    <div className="flex flex-col items-center pb-10">
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-card border"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, borderColor: `${gold}80` }}
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
          style={{ background: palette?.ivory ?? '#fdf8f3' }}
        >
          <ModakGlyph color={gold} accent={rose} size={20} />
          <span className="font-serif text-[13px] leading-snug text-ink">
            &ldquo;{blessing?.text}&rdquo;
          </span>
          {blessing?.author && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              &mdash; {blessing.author}
            </span>
          )}
        </div>

        {revealed && !reduceMotion && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-2xl border-2"
            style={{ borderColor: gold }}
            initial={{ opacity: 0.9, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.35 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}

        {!revealed && (
          <canvas
            ref={canvasRef}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT, touchAction: 'none' }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            {...canvasHandlers}
          />
        )}
      </motion.div>

      {!revealed && (
        <motion.p
          className="mt-3 text-xs tracking-[0.25em] uppercase text-ink-soft"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Scratch to Reveal
        </motion.p>
      )}

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
    </div>
  )
}
