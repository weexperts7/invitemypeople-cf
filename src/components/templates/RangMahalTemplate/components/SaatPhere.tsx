import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { HawanKund } from './Motifs'

const VOWS = [
  { title: 'Nourishment', line: 'We will care for one another, and for the home we build together.' },
  { title: 'Strength', line: 'We will stand side by side, in good health and in hardship.' },
  { title: 'Prosperity', line: 'We will share all we earn, and grow it with honesty.' },
  { title: 'Family', line: 'We will honour our elders and fill our home with love and respect.' },
  { title: 'Joy', line: 'We will raise those who come after us with kindness and laughter.' },
  { title: 'Seasons', line: 'We will walk through every season of life together.' },
  { title: 'Friendship', line: 'We will remain the closest of friends, in this life and beyond.' },
]

const RING = 268
const RADIUS = 112
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Step 6 — the seven vows, walked one at a time around the sacred fire. */
export default function SaatPhere() {
  const [step, setStep] = useState(0)
  const vow = VOWS[step]
  const atEnd = step === VOWS.length - 1

  return (
    <section className="rmt-section rmt-section--night" data-rmt-reveal aria-label="The seven vows">
      <p className="rmt-kicker">Sacred promises</p>
      <h2 className="rmt-title">Saat Phere</h2>

      <div className="rmt-phere" style={{ width: RING, height: RING }}>
        <svg className="rmt-phere-ring" viewBox={`0 0 ${RING} ${RING}`} aria-hidden="true">
          <circle cx={RING / 2} cy={RING / 2} r={RADIUS} />
          <motion.circle
            className="rmt-phere-progress"
            cx={RING / 2}
            cy={RING / 2}
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            initial={false}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - step / (VOWS.length - 1)) }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </svg>

        <div className="rmt-phere-fire" aria-hidden="true">
          <HawanKund className="rmt-kund" />
        </div>

        {VOWS.map((v, i) => {
          const angle = (i / VOWS.length) * Math.PI * 2 - Math.PI / 2
          return (
            <button
              key={v.title}
              type="button"
              className={`rmt-phere-step${i <= step ? ' rmt-phere-step--on' : ''}${i === step ? ' rmt-phere-step--now' : ''}`}
              style={{ left: RING / 2 + Math.cos(angle) * RADIUS, top: RING / 2 + Math.sin(angle) * RADIUS }}
              onClick={() => setStep(i)}
              aria-label={`Vow ${i + 1}: ${v.title}`}
              aria-current={i === step ? 'step' : undefined}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="rmt-vow" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={vow.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28 }}
          >
            <h3>{vow.title}</h3>
            <p>{vow.line}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button type="button" className="rmt-btn rmt-btn--gold" onClick={() => setStep(atEnd ? 0 : step + 1)}>
        {atEnd ? 'Walk them again' : 'Next phera'}
      </button>
    </section>
  )
}
