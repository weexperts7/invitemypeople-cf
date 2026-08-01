import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import Celebration from '../../Celebration'
import { useRandomBlessing } from '../../../hooks/useRandomBlessing'

// The "Envelope Opening" interaction — a section-scoped tap-to-open
// envelope (the blessing-reveal slot this template uses instead of a
// scratch card), modeled on EnvelopeLanding.jsx's flap/wax-seal timing but
// sized to sit inline within Chapter Two rather than gating the whole page.
export default function BlessingEnvelope({ palette }) {
  const [stage, setStage] = useState('closed') // closed | opening | open
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()
  const { blessing } = useRandomBlessing({ locked: stage !== 'closed' })

  const gold = palette?.gold ?? '#c28a3a'
  const rose = palette?.rose ?? '#7a2230'

  const handleTap = () => {
    if (stage !== 'closed') return
    setStage('opening')
    const flapDelay = reduceMotion ? 100 : 700
    const openDelay = reduceMotion ? 200 : 1300
    setTimeout(() => setStage('open'), flapDelay)
    setTimeout(() => setBurst({ id: Date.now() }), openDelay)
  }

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="relative" style={{ perspective: 1000 }}>
        <motion.div
          className="absolute z-20 pointer-events-none left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-ivory shadow-soft border px-5 py-4 text-center"
          style={{ borderColor: `${gold}70` }}
          initial={{ y: 0, opacity: 0, scale: 0.9 }}
          animate={
            stage === 'closed' ? { y: 0, opacity: 0, scale: 0.9 } : { y: -112, opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        >
          <span className="font-serif text-[13px] leading-snug text-ink">
            &ldquo;{blessing?.text}&rdquo;
          </span>
        </motion.div>

        <button
          type="button"
          onClick={handleTap}
          aria-label="Tap to open your blessing"
          disabled={stage !== 'closed'}
          className="relative z-10 block w-56 h-36 rounded-lg shadow-card border"
          style={{ background: palette?.champagne ?? '#edcdb6', borderColor: `${gold}80` }}
        >
          <motion.div
            className="absolute left-0 top-0 w-full h-1/2 origin-top"
            style={{ transformStyle: 'preserve-3d' }}
            animate={stage === 'closed' ? { rotateX: 0 } : { rotateX: -170 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 border-b"
              style={{
                background: palette?.champagneDeep ?? '#d99e6e',
                borderColor: `${gold}80`,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          </motion.div>

          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-card flex items-center justify-center border"
            style={{ background: rose, borderColor: `${gold}90` }}
            animate={stage === 'closed' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
          >
            <Flame className="w-5 h-5 text-ivory" strokeWidth={1.6} />
          </motion.div>

          {stage === 'closed' && (
            <motion.p
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] uppercase text-ink-soft whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Tap to Open
            </motion.p>
          )}
        </button>
      </div>

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
