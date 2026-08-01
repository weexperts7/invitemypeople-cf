import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Lock } from 'lucide-react'
import Celebration from '../../Celebration'
import { useScratchCanvas } from '../../../hooks/useScratchCanvas'
import { useRandomBlessing } from '../../../hooks/useRandomBlessing'

const VAULT_SIZE = 172
// Circular reveal loses the canvas's corner pixels to the clip, so a lower
// threshold than the rectangular default (0.55) is needed — see
// useScratchCanvas's JSDoc.
const VAULT_REVEAL_THRESHOLD = 0.42

function drawVaultDoor(ctx, { width, height }, palette) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2
  const rose = palette?.rose ?? '#0e4d43'
  const gold = palette?.gold ?? '#c9a24b'
  const goldSoft = palette?.goldSoft ?? '#e2c884'

  const grad = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r)
  grad.addColorStop(0, goldSoft)
  grad.addColorStop(0.55, gold)
  grad.addColorStop(1, rose)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = `${rose}aa`
  ctx.lineWidth = 1.4
  ;[0.34, 0.56, 0.78].forEach((f) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r * f, 0, Math.PI * 2)
    ctx.stroke()
  })

  // padlock glyph
  ctx.fillStyle = rose
  ctx.beginPath()
  ctx.arc(cx, cy - r * 0.14, r * 0.14, Math.PI, 0, false)
  ctx.lineWidth = r * 0.05
  ctx.strokeStyle = rose
  ctx.stroke()
  ctx.fillRect(cx - r * 0.18, cy - r * 0.14, r * 0.36, r * 0.22)

  ctx.fillStyle = rose
  ctx.font = `600 ${Math.max(10, Math.round(width * 0.058))}px Poppins, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('SCRATCH TO OPEN', cx, cy + r * 0.42)
  ctx.fillText('THE VAULT', cx, cy + r * 0.42 + width * 0.075)
}

export default function RoyalPeacockVaultReveal({ palette }) {
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()

  const handleRevealed = useCallback(() => setBurst({ id: Date.now() }), [])
  const { blessing } = useRandomBlessing({ locked: Boolean(burst) })
  const { canvasRef, revealed, canvasHandlers } = useScratchCanvas({
    width: VAULT_SIZE,
    height: VAULT_SIZE,
    drawSurface: (ctx, size) => drawVaultDoor(ctx, size, palette),
    onRevealed: handleRevealed,
    revealThreshold: VAULT_REVEAL_THRESHOLD,
  })

  return (
    <section className="px-6 py-14 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-2xl sm:text-3xl text-ink mb-2"
      >
        The Divine Vault
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-ink-soft mb-8"
      >
        Scratch open the vault door to receive Guruji&rsquo;s blessing
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-xs rounded-[1.75rem] border-2 border-dashed p-6 pt-9"
        style={{
          borderColor: `${palette?.gold ?? '#c9a24b'}b3`,
          background: `linear-gradient(180deg, ${palette?.champagne ?? '#dcecd8'} 0%, ${palette?.ivory ?? '#fbfbf6'} 100%)`,
        }}
      >
        <span
          className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] shadow-card whitespace-nowrap"
          style={{
            background: palette?.rose ?? '#0e4d43',
            color: palette?.ivory ?? '#fbfbf6',
            borderColor: palette?.goldSoft ?? '#e2c884',
          }}
        >
          <Lock className="w-3 h-3" strokeWidth={1.8} />
          Divine Vault &middot; Ticket
        </span>

        <div className="flex items-center justify-center gap-4">
          <div
            className="flex shrink-0 items-center border-r border-dashed pr-3 py-4"
            style={{ borderColor: `${palette?.gold ?? '#c9a24b'}80` }}
          >
            <span
              className="text-[9px] tracking-[0.3em] uppercase text-ink-soft whitespace-nowrap"
              style={{ writingMode: 'vertical-rl' }}
            >
              Admit One &middot; Darshan
            </span>
          </div>

          <div
            className="relative shrink-0 overflow-hidden shadow-card"
            style={{ width: VAULT_SIZE, height: VAULT_SIZE, clipPath: 'circle(50% at 50% 50%)' }}
          >
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-8 text-center"
              initial={false}
              animate={revealed ? { scale: [0.5, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="font-serif text-[13px] leading-snug text-ink">
                &ldquo;{blessing?.text}&rdquo;
              </span>
            </motion.div>

            {revealed && !reduceMotion && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full border-2"
                style={{ borderColor: palette?.gold ?? '#c9a24b' }}
                initial={{ opacity: 0.9, scale: 0.85 }}
                animate={{ opacity: 0, scale: 1.35 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}

            {!revealed && (
              <canvas
                ref={canvasRef}
                style={{ width: VAULT_SIZE, height: VAULT_SIZE, touchAction: 'none' }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                {...canvasHandlers}
              />
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={1.6}
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
