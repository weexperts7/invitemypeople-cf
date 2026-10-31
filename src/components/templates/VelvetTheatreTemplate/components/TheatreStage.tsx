import { motion } from 'framer-motion'

interface TheatreStageProps {
  phase: 'closed' | 'opening' | 'open'
  onTap: () => void
  firstName: string
  secondName: string
  greetingLine: string
  invitationLine: string
  dateLine: string
  /** Pixel height of one "screen" — see VelvetTheatreTemplate's useStageHeight. */
  height: number | null
  reduceMotion: boolean
  /** Rendering inside a catalog card (see VelvetTheatrePoster.tsx), not as the invite. */
  poster?: boolean
}

// Each drape is a polygon whose outer edge stays on the wall and whose inner
// edge is sampled at these heights. Closed, the inner edge is a straight
// line just past the panel's own edge (the two panels overlap at the
// centre seam); open, it bows in to a cinched tie-back point and flares
// out again toward the floor. Both states share the same point count, so
// framer-motion interpolates the clip-path between them directly.
const EDGE_Y = [0, 8, 16, 24, 32, 40, 48, 56, 62, 70, 80, 90, 100]
const CLOSED_X = EDGE_Y.map(() => 101)
const OPEN_X = [46, 44, 41, 37, 32, 26, 20, 15, 13, 17, 25, 33, 40]
const TIE_Y = 62

function drapePolygon(xs: number[]) {
  const edge = xs.map((x, i) => `${x}% ${EDGE_Y[i]}%`).join(', ')
  return `polygon(0% 0%, ${edge}, 0% 100%)`
}

const CLOSED_CLIP = drapePolygon(CLOSED_X)
const OPEN_CLIP = drapePolygon(OPEN_X)

// Curved highlight lines that make an opened drape read as gathered fabric
// rather than a flat cut-out — each starts spread across the top, pinches
// in at the tie-back and fans back out below it.
const FOLD_LINES = [0.12, 0.28, 0.44, 0.6, 0.76, 0.9].map((t) => {
  const top = OPEN_X[0] * t
  const tie = OPEN_X[8] * t
  const bottom = OPEN_X[12] * t
  return `M ${top} 0 Q ${top * 0.55 + tie * 0.45} ${TIE_Y * 0.6} ${tie} ${TIE_Y} Q ${tie * 0.7 + bottom * 0.3} ${TIE_Y + 22} ${bottom} 100`
})

const CURTAIN_EASE = [0.65, 0, 0.35, 1] as const

function Drape({ side, phase, reduceMotion }: { side: 'left' | 'right'; phase: TheatreStageProps['phase']; reduceMotion: boolean }) {
  const isOpen = phase !== 'closed'
  return (
    <motion.div
      className={`vtt-drape vtt-drape--${side}`}
      initial={false}
      animate={{ clipPath: isOpen ? OPEN_CLIP : CLOSED_CLIP }}
      transition={{ duration: reduceMotion ? 0 : 2.1, ease: CURTAIN_EASE }}
      aria-hidden="true"
    >
      <motion.svg
        className="vtt-drape-folds"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 1 }}
      >
        {FOLD_LINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </motion.svg>
      <motion.span
        className="vtt-drape-tie"
        style={{ top: `${TIE_Y - 1.5}%` }}
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 1.7 }}
      />
    </motion.div>
  )
}

function Valance() {
  // Six gold-trimmed swags across the top of the proscenium.
  const swags = Array.from({ length: 6 }, (_, i) => i * (400 / 6))
  const w = 400 / 6
  const scallops = swags.map((x) => `Q ${x + w / 2} 74 ${x + w} 44`).join(' ')
  return (
    <svg className="vtt-valance" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="vtt-valance-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a070b" />
          <stop offset="55%" stopColor="#8e161d" />
          <stop offset="100%" stopColor="#6a0c12" />
        </linearGradient>
      </defs>
      <path d={`M0 0 L0 44 ${scallops} L400 0 Z`} fill="url(#vtt-valance-fill)" />
      <path d={`M0 44 ${scallops}`} fill="none" stroke="#d6ad5a" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
      <path d="M0 10 H400" stroke="#d6ad5a" strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * Step 1 — the closed velvet curtain, the opening sweep, and the lit stage
 * behind it. Stays mounted after opening: the tied-back drapes keep framing
 * the couple's names like the reference's own first screen.
 */
export default function TheatreStage({
  phase,
  onTap,
  firstName,
  secondName,
  greetingLine,
  invitationLine,
  dateLine,
  height,
  reduceMotion,
  poster = false,
}: TheatreStageProps) {
  const isClosed = phase === 'closed'
  const isOpen = phase === 'open'
  // A grid of posters must not add a page's worth of <h1>s to the catalog.
  const Names = poster ? motion.div : motion.h1
  const initials = [firstName, secondName].filter(Boolean).map((n) => n.trim().charAt(0).toUpperCase())
  const longest = Math.max(firstName.length, secondName.length, 5)
  const nameSize = Math.round(Math.max(38, Math.min(66, 380 / longest)))

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
    animate: isClosed ? { opacity: 0, y: 14, filter: 'blur(6px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : delay, ease: 'easeOut' as const },
  })

  return (
    <section
      className={`vtt-stage${isClosed ? ' vtt-stage--closed' : ''}`}
      style={height ? { height } : undefined}
      aria-label="Invitation"
      onClick={isClosed ? onTap : undefined}
    >
      <div className="vtt-stage-spot" aria-hidden="true" />

      <div className="vtt-stage-content">
        <motion.p className="vtt-kicker" {...reveal(1.1)}>
          {greetingLine}
        </motion.p>
        <motion.p className="vtt-stage-invite" {...reveal(1.25)}>
          You are cordially invited to celebrate the wedding of
        </motion.p>
        <Names className="vtt-names" style={{ fontSize: nameSize }} {...reveal(1.45)}>
          <span>{firstName}</span>
          {secondName && (
            <>
              <span className="vtt-names-amp">&amp;</span>
              <span>{secondName}</span>
            </>
          )}
        </Names>
        <motion.p className="vtt-stage-date" {...reveal(1.7)}>
          {dateLine}
        </motion.p>
        <motion.p className="vtt-stage-line" {...reveal(1.9)}>
          {invitationLine}
        </motion.p>
      </div>

      <Drape side="left" phase={phase} reduceMotion={reduceMotion} />
      <Drape side="right" phase={phase} reduceMotion={reduceMotion} />
      <Valance />

      <motion.div
        className="vtt-curtain-call"
        initial={false}
        animate={{ opacity: isClosed ? 1 : 0, scale: isClosed ? 1 : 0.9 }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        style={{ pointerEvents: isClosed ? 'auto' : 'none' }}
      >
        <button type="button" className="vtt-monogram" onClick={onTap} aria-label="Open the invitation">
          <span>{initials.join(' & ') || '♥'}</span>
        </button>
        <p className="vtt-tap-hint">Tap to raise the curtain</p>
      </motion.div>

      {isOpen && !poster && (
        <motion.div
          className="vtt-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.4 }}
          aria-hidden="true"
        >
          <span>Scroll</span>
          <svg viewBox="0 0 12 18" width="12" height="18">
            <path d="M6 1 V16 M1 11 L6 16 L11 11" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </motion.div>
      )}
    </section>
  )
}
