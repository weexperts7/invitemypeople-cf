import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { getMotifIcon } from '../data/motifIcons'
import RadhaKrishnaUnion from './RadhaKrishnaUnion'
import { coupleNameTier } from '../utils/coupleNameFit'

const COUPLE_NAME_SIZES = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg']

const PARTICLE_COUNT = 28

function GoldParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        angle: (i / PARTICLE_COUNT) * Math.PI * 2,
        distance: 220 + Math.random() * 260,
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.15,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold-soft"
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: [0, 1, 0],
            scale: [0, 1, 0.4],
          }}
          transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export default function EnvelopeLanding({ onOpen, motif, coupleNames = 'Aarav & Diya' }) {
  const [stage, setStage] = useState('closed') // closed | opening | done
  const reduceMotion = useReducedMotion()
  const SealIcon = getMotifIcon(motif) ?? Heart
  // Vrindavan Divine's devotional Radha-Krishna union moment — temporarily
  // switched off; flip this back on to re-enable it.
  const ENABLE_DIVINE_UNION = false
  const isDivineUnion = ENABLE_DIVINE_UNION && motif === 'lotus-peacock'

  const handleTap = () => {
    if (stage !== 'closed') return
    setStage('opening')
    const flapDelay = reduceMotion ? 100 : 900
    const totalDelay = reduceMotion ? 300 : isDivineUnion ? 2500 : 1900
    setTimeout(() => setStage('done'), flapDelay)
    setTimeout(() => onOpen(), totalDelay)
  }

  return (
    <motion.div
      key="envelope-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-linen bg-petals overflow-hidden"
    >
      {stage === 'opening' && !reduceMotion && isDivineUnion && (
        <RadhaKrishnaUnion active />
      )}
      {stage === 'opening' && !reduceMotion && !isDivineUnion && <GoldParticles />}

      <div className="relative" style={{ perspective: 1200 }}>
        {/* card that rises out of the envelope */}
        <motion.div
          className="absolute z-20 pointer-events-none left-1/2 top-1/2 w-64 sm:w-72 h-40 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-ivory shadow-soft border border-champagne-deep/60 flex flex-col items-center justify-center px-4 text-center"
          initial={{ y: 0, opacity: 0, scale: 0.9 }}
          animate={
            stage === 'closed'
              ? { y: 0, opacity: 0, scale: 0.9 }
              : { y: -140, opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
        >
          <p className={`font-script ${COUPLE_NAME_SIZES[coupleNameTier(coupleNames)]} text-rose whitespace-nowrap`}>
            {coupleNames}
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] uppercase text-ink-soft">
            request the honor of your presence
          </p>
        </motion.div>

        {/* envelope body */}
        <button
          type="button"
          onClick={handleTap}
          aria-label="Tap to open your wedding invitation"
          disabled={stage !== 'closed'}
          className="relative z-10 block w-64 sm:w-72 h-44 rounded-lg bg-champagne border border-gold-soft shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
        >
          {/* flap */}
          <motion.div
            className="absolute left-0 top-0 w-full h-1/2 origin-top"
            style={{ transformStyle: 'preserve-3d' }}
            animate={stage === 'closed' ? { rotateX: 0 } : { rotateX: -170 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 bg-champagne-deep border-b border-gold-soft"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
          </motion.div>

          {/* wax seal */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-rose shadow-card flex items-center justify-center border border-blush-deep"
            animate={stage === 'closed' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
          >
            <SealIcon
              className="w-6 h-6 text-ivory"
              fill={SealIcon === Heart ? 'currentColor' : 'none'}
              strokeWidth={SealIcon === Heart ? 1 : 1.75}
            />
          </motion.div>

          {stage === 'closed' && (
            <motion.p
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-sm tracking-[0.25em] uppercase text-ink-soft whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Tap to Open
            </motion.p>
          )}
        </button>
      </div>
    </motion.div>
  )
}
