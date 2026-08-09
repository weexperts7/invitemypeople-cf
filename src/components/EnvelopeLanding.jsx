import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { getMotifIcon } from '../data/motifIcons'
import RadhaKrishnaUnion from './RadhaKrishnaUnion'
import CulturalMotif from './CulturalMotif'
import { FrameBanner } from './TemplateFrame'
import { coupleNameTier } from '../utils/coupleNameFit'

const COUPLE_NAME_SIZES = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg']

const PARTICLE_COUNT = 28

// Cycled across bursting particles so the reveal reads as a proper festive
// confetti pop rather than a single flat gold tone — every color here is a
// CSS var already re-themed per template (see themeToCssVars), so a vibrant
// palette template automatically bursts in crimson/rani-pink/marigold too.
const PARTICLE_COLOR_CLASSES = ['bg-gold-soft', 'bg-rose', 'bg-blush-deep']

// Punjabi Phulkari's tap gets a bigger, richer burst (see isPhulkari below)
// than every other template's default — count/colorClasses/distance are
// props specifically so that override can't leak into any other template's
// envelope, which keeps calling this with no props at all.
function GoldParticles({
  count = PARTICLE_COUNT,
  colorClasses = PARTICLE_COLOR_CLASSES,
  distance = [220, 480],
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (i / count) * Math.PI * 2,
        distance: distance[0] + Math.random() * (distance[1] - distance[0]),
        size: 4 + Math.random() * 6,
        delay: Math.random() * 0.15,
        colorClass: colorClasses[i % colorClasses.length],
      })),
    [count, colorClasses, distance],
  )

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute rounded-full ${p.colorClass}`}
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

// A slow diagonal light sweep across the closed envelope — the small,
// continuous shimmer that reads as "shimmering gold accents" without ever
// competing with the "Tap to Open" cue.
function GoldShimmer() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg"
      initial={{ x: '-120%' }}
      animate={{ x: '220%' }}
      transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }}
    >
      <div
        className="h-full w-1/3 -skew-x-12"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-gold-soft) 55%, transparent) 50%, transparent 100%)',
        }}
      />
    </motion.div>
  )
}

// --- Punjabi Phulkari-only showpiece pieces below -------------------------
// Everything here is only ever rendered when `motif === 'phulkari'` (see
// `isPhulkari` in EnvelopeLanding) so every other template's envelope is
// byte-for-byte the same as before.

const PHULKARI_PARTICLE_COLORS = ['bg-gold-soft', 'bg-rose', 'bg-blush-deep', 'bg-champagne-deep']

// A concentric royal-crest rosette standing in for the shared lucide seal
// icon — the "golden wax-stamp/crest motif" ask, echoing the same medallion
// drawn into this template's FrameBanner so seal and header read as one
// crest. Pure vector, colored via currentColor so it inherits the seal's
// text-ivory the same way every other template's seal icon does.
function PhulkariCrestSeal({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="3.4" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={20 + Math.cos((deg * Math.PI) / 180) * 17}
          y1={20 + Math.sin((deg * Math.PI) / 180) * 17}
          x2={20 + Math.cos((deg * Math.PI) / 180) * 21.5}
          y2={20 + Math.sin((deg * Math.PI) / 180) * 21.5}
          stroke="currentColor"
          strokeWidth="1.2"
        />
      ))}
    </svg>
  )
}

// A slow breathing gold-glow halo behind the closed seal — pure opacity/
// scale (no filter/blur) so it costs nothing on low-power phones.
function SealGlow() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full"
      style={{
        background:
          'radial-gradient(circle, color-mix(in srgb, var(--color-gold-soft) 70%, transparent) 0%, transparent 70%)',
      }}
      animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.9, 1.08, 0.9] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// The instant the seal "breaks" — an expanding gold ring that flashes and
// dissolves right as the flap starts folding back.
function SealCrackFlash() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-gold-soft"
      initial={{ opacity: 0.9, scale: 0.55 }}
      animate={{ opacity: 0, scale: 2.6 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

export default function EnvelopeLanding({
  onOpen,
  motif,
  palette,
  motifAccent,
  coupleNames = 'Aarav & Diya',
}) {
  const [stage, setStage] = useState('closed') // closed | opening | done
  const reduceMotion = useReducedMotion()
  const SealIcon = getMotifIcon(motif) ?? Heart
  // Vrindavan Divine's devotional Radha-Krishna union moment — temporarily
  // switched off; flip this back on to re-enable it.
  const ENABLE_DIVINE_UNION = false
  const isDivineUnion = ENABLE_DIVINE_UNION && motif === 'lotus-peacock'
  // Punjabi Phulkari's dedicated show-stopping open — every branch below
  // keyed off this stays false (and so behaves exactly as before) for
  // every other template.
  const isPhulkari = motif === 'phulkari'

  const handleTap = () => {
    if (stage !== 'closed') return
    setStage('opening')
    const flapDelay = reduceMotion ? 100 : isPhulkari ? 950 : 900
    const totalDelay = reduceMotion ? 300 : isDivineUnion ? 2500 : isPhulkari ? 2200 : 1900
    setTimeout(() => setStage('done'), flapDelay)
    setTimeout(() => onOpen(), totalDelay)
  }

  // A fluid, slightly overshooting spring instead of a flat ease — the
  // "physics-based" flap-fold and card-rise feel, Phulkari-only.
  const flapTransition = isPhulkari
    ? { type: 'spring', stiffness: 130, damping: 15, mass: 0.9 }
    : { duration: 0.7, ease: 'easeInOut' }
  const cardTransition = isPhulkari
    ? { type: 'spring', stiffness: 110, damping: 14, mass: 0.85, delay: 0.15 }
    : { duration: 0.9, ease: 'easeOut', delay: 0.15 }

  return (
    <motion.div
      key="envelope-screen"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-linen bg-petals overflow-hidden"
    >
      {/* faint traditional tiling behind the whole opening scene, tied to
          the template's own motif so this screen already reads as "the
          invitation" and not a generic loading gate */}
      <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />

      {stage === 'opening' && !reduceMotion && isDivineUnion && (
        <RadhaKrishnaUnion active />
      )}
      {stage === 'opening' && !reduceMotion && !isDivineUnion && (
        <GoldParticles
          {...(isPhulkari
            ? { count: 46, colorClasses: PHULKARI_PARTICLE_COLORS, distance: [240, 560] }
            : {})}
        />
      )}

      <div className="relative" style={{ perspective: 1200 }}>
        {/* a small banner of the template's own ornament (garland, jharokha
            arch, mandala medallion, ...) floating above the envelope — the
            "traditional motif" that makes each template's envelope distinct,
            not just a recolor of the same generic seal */}
        {stage === 'closed' && (
          <motion.div
            className="pointer-events-none absolute -top-14 left-1/2 z-30 w-44 -translate-x-1/2 sm:-top-16 sm:w-52"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 0.95, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <FrameBanner motif={motif} palette={palette} accent={motifAccent} className="h-auto w-full" />
          </motion.div>
        )}

        {/* card that rises out of the envelope */}
        <motion.div
          className="absolute z-20 pointer-events-none left-1/2 top-1/2 w-64 sm:w-72 h-40 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-ivory shadow-soft border border-champagne-deep/60 flex flex-col items-center justify-center px-4 text-center"
          initial={{ y: 0, opacity: 0, scale: 0.9 }}
          animate={
            stage === 'closed'
              ? { y: 0, opacity: 0, scale: 0.9 }
              : { y: isPhulkari ? -156 : -140, opacity: 1, scale: 1 }
          }
          transition={cardTransition}
        >
          <p className={`font-script ${COUPLE_NAME_SIZES[coupleNameTier(coupleNames)]} text-rose whitespace-nowrap`}>
            {coupleNames}
          </p>
          <p className="mt-1 text-xs tracking-[0.2em] uppercase text-ink-soft">
            request the honor of your presence
          </p>
        </motion.div>

        {/* ornate double-line gold frame around the envelope, with small
            jeweled studs at each corner — the "gold border" ask, independent
            of whatever tap animation is running underneath it */}
        <div className="pointer-events-none absolute -inset-3 rounded-[1.6rem] border-2 border-gold/70" />
        <div className="pointer-events-none absolute -inset-1.5 rounded-2xl border border-gold-soft/60" />
        {[
          '-top-3 -left-3',
          '-top-3 -right-3',
          '-bottom-3 -left-3',
          '-bottom-3 -right-3',
        ].map((pos) => (
          <span
            key={pos}
            className={`pointer-events-none absolute ${pos} h-2.5 w-2.5 rotate-45 border border-gold bg-gold-soft shadow-card`}
          />
        ))}

        {/* envelope body */}
        <motion.button
          type="button"
          onClick={handleTap}
          aria-label="Tap to open your wedding invitation"
          disabled={stage !== 'closed'}
          whileTap={isPhulkari && stage === 'closed' ? { scale: reduceMotion ? 1 : 0.97 } : undefined}
          className="relative z-10 block w-64 sm:w-72 h-44 rounded-lg bg-champagne border border-gold-soft shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
        >
          {stage === 'closed' && !reduceMotion && <GoldShimmer />}

          {/* flap */}
          <motion.div
            className="absolute left-0 top-0 w-full h-1/2 origin-top"
            style={{ transformStyle: 'preserve-3d' }}
            animate={stage === 'closed' ? { rotateX: 0 } : { rotateX: -170 }}
            transition={flapTransition}
          >
            <div
              className="absolute inset-0 bg-champagne-deep border-b border-gold-soft"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              }}
            />
            {/* thin gold trim tracing the flap's fold lines — a woven-braid
                accent instead of one flat color block */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                background:
                  'linear-gradient(160deg, transparent 40%, color-mix(in srgb, var(--color-gold) 45%, transparent) 100%)',
              }}
            />
          </motion.div>

          {/* glowing golden wax-stamp seal */}
          {isPhulkari && stage === 'closed' && !reduceMotion && <SealGlow />}
          {isPhulkari && stage === 'opening' && !reduceMotion && <SealCrackFlash />}
          <motion.div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose shadow-card flex items-center justify-center border border-blush-deep ${
              isPhulkari ? 'w-16 h-16' : 'w-14 h-14'
            }`}
            animate={stage === 'closed' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35 }}
          >
            {isPhulkari ? (
              <PhulkariCrestSeal className="w-8 h-8 text-ivory" />
            ) : (
              <SealIcon
                className="w-6 h-6 text-ivory"
                fill={SealIcon === Heart ? 'currentColor' : 'none'}
                strokeWidth={SealIcon === Heart ? 1 : 1.75}
              />
            )}
          </motion.div>

          {stage === 'closed' && (
            <motion.p
              className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-sm tracking-[0.25em] uppercase text-ink-soft whitespace-nowrap"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              Tap to Open
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            </motion.p>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
