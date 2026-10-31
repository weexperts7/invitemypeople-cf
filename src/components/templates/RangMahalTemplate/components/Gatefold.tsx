import { motion } from 'framer-motion'

import { Kalash, Latkan, Toran } from './Motifs'

interface GatefoldProps {
  phase: 'closed' | 'opening' | 'open'
  onOpen: () => void
  firstName: string
  secondName: string
  greetingLine: string
  dateLine: string
  /** Pixel height of one "screen" — see RangMahalTemplate's useStageHeight. */
  height: number | null
  reduceMotion: boolean
}

// A pull this far (px) counts as opening the card; less just springs back.
const PULL_THRESHOLD = 34
const DOOR_EASE = [0.6, 0.02, 0.25, 1] as const

const BURST = Array.from({ length: 26 }, (_, i) => {
  const angle = (i / 26) * Math.PI * 2
  const reach = 150 + (i % 5) * 34
  return {
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach,
    color: ['#ef9a12', '#fbc531', '#c2185b', '#b3261e'][i % 4],
    rotate: i * 47,
  }
})

function Cover({ firstName, secondName, greetingLine, dateLine }: Pick<GatefoldProps, 'firstName' | 'secondName' | 'greetingLine' | 'dateLine'>) {
  const longest = Math.max(firstName.length, secondName.length, 4)
  const size = Math.round(Math.max(32, Math.min(70, 460 / longest)))
  return (
    <div className="rmt-cover">
      <div className="rmt-cover-frame" />
      <p className="rmt-kicker">{greetingLine}</p>
      <h1 className="rmt-names" style={{ fontSize: size }}>
        <span>{firstName}</span>
        {secondName && (
          <>
            <span className="rmt-names-amp">&amp;</span>
            <span>{secondName}</span>
          </>
        )}
      </h1>
      <p className="rmt-cover-date">{dateLine}</p>
    </div>
  )
}

/**
 * Step 1 — a real gatefold wedding card. The cover is printed once per door
 * and each door clips to its half, so the names read whole until the seam
 * opens. Guests pull the hanging latkan (or tap anywhere); the doors swing
 * back in 3D onto the blessing behind them.
 */
export default function Gatefold({ phase, onOpen, firstName, secondName, greetingLine, dateLine, height, reduceMotion }: GatefoldProps) {
  const isClosed = phase === 'closed'
  const isOpening = phase === 'opening'
  const cover = <Cover firstName={firstName} secondName={secondName} greetingLine={greetingLine} dateLine={dateLine} />
  const doorTransition = { duration: reduceMotion ? 0 : 1.7, delay: reduceMotion ? 0 : 0.3, ease: DOOR_EASE }

  return (
    <section
      className={`rmt-stage${isClosed ? ' rmt-stage--closed' : ''}`}
      style={height ? { height } : undefined}
      aria-label="Invitation"
      onClick={isClosed ? onOpen : undefined}
    >
      <div className="rmt-blessing">
        <motion.div
          className="rmt-toran"
          initial={false}
          animate={{ y: isClosed ? -110 : 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 11, delay: reduceMotion ? 0 : 1 }}
        >
          <Toran />
        </motion.div>

        <div className="rmt-jharokha">
          <Kalash className="rmt-kalash" />
          <p className="rmt-shloka" lang="sa">
            ॐ श्री गणेशाय नमः
          </p>
          <p className="rmt-blessing-line">May every obstacle be cleared, and this union be blessed with joy.</p>
        </div>

        {phase === 'open' && (
          <div className="rmt-scroll-cue" aria-hidden="true">
            <span>Scroll</span>
            <svg viewBox="0 0 12 18" width="12" height="18">
              <path d="M6 1 V16 M1 11 L6 16 L11 11" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </div>
        )}
      </div>

      {isOpening && !reduceMotion && (
        <div className="rmt-burst" aria-hidden="true">
          {BURST.map((p, i) => (
            <motion.span
              key={i}
              style={{ background: p.color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
              animate={{ x: p.x, y: p.y + 120, opacity: 0, scale: 1.1, rotate: p.rotate }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      {phase !== 'open' && (
        <motion.div
          className="rmt-fold"
          initial={false}
          animate={{ opacity: isClosed ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 1.5 }}
        >
          <motion.div
            className="rmt-door rmt-door--left"
            initial={false}
            animate={{ rotateY: isClosed ? 0 : -118 }}
            transition={doorTransition}
          >
            <div className="rmt-door-face">
              <div className="rmt-door-print">{cover}</div>
            </div>
            <div className="rmt-door-back" />
          </motion.div>

          <motion.div
            className="rmt-door rmt-door--right"
            initial={false}
            animate={{ rotateY: isClosed ? 0 : 118 }}
            transition={doorTransition}
          >
            <div className="rmt-door-face">
              <div className="rmt-door-print">{cover}</div>
            </div>
            <div className="rmt-door-back" />
          </motion.div>
        </motion.div>
      )}

      {phase !== 'open' && (
        <motion.div
          className="rmt-latkan"
          drag={isClosed ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.55}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > PULL_THRESHOLD) onOpen()
          }}
          initial={false}
          animate={isClosed ? { y: 0 } : { y: [0, 46, -300] }}
          transition={isClosed ? undefined : { duration: reduceMotion ? 0 : 0.8, times: [0, 0.3, 1], ease: 'easeInOut' }}
        >
          <Latkan className="rmt-latkan-art" />
        </motion.div>
      )}

      {isClosed && (
        // No onClick here: the stage around it already opens on any tap, and a
        // second handler would run alongside it and ring the bell twice.
        <button type="button" className="rmt-pull-hint">
          Pull the latkan to open
        </button>
      )}
    </section>
  )
}
