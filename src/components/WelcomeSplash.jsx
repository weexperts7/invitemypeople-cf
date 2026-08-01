import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Flower2 } from 'lucide-react'
import { getMotifIcon } from '../data/motifIcons'
import { FrameBanner } from './TemplateFrame'
import MotifBadge from './MotifBadge'
import { coupleNameTier } from '../utils/coupleNameFit'

const COUPLE_NAME_SIZES = [
  'text-6xl sm:text-7xl',
  'text-5xl sm:text-6xl',
  'text-4xl sm:text-5xl',
  'text-3xl sm:text-4xl',
]

const DEFAULT_GREETING = { symbol: 'ॐ', line: 'Shree Ganeshaya Namah' }

const DEFAULT_COUPLE = {
  names: 'Aarav & Diya',
  invitationLine:
    'Together with their families, joyfully invite you to celebrate the beginning of their forever.',
  people: [
    { name: 'Aarav Malhotra', parents: 'Son of Mr. Rajesh & Mrs. Kavita Malhotra' },
    { name: 'Diya Kapoor', parents: 'Daughter of Mr. Anil & Mrs. Sunita Kapoor' },
  ],
}

// Per-template layout hints keyed off the same `motif` id — this is what
// keeps templates from just being recolors of one another. Ornate/dense
// themes get the full floating-icon + halo treatment; the Western
// minimalist template deliberately gets more whitespace and no clutter.
const LAYOUT_HINTS = {
  'floral-line-art': { airy: true, showFloatingIcons: false, halo: false },
  'lotus-peacock': { airy: false, showFloatingIcons: true, halo: true },
  'art-deco': { airy: true, showFloatingIcons: false, halo: false },
  // Rajasthani Royal — maximalist: floating motifs plus a warm halo glow.
  jharokha: { airy: false, showFloatingIcons: true, halo: true },
  // South Indian Temple Gold — stately temple glow, no floating clutter.
  'temple-gold': { airy: false, showFloatingIcons: false, halo: true },
  // Royal Mughal — spacious geometric jaali architecture, no halo or icons.
  'mughal-jaali': { airy: true, showFloatingIcons: false, halo: false },
  // Punjabi Phulkari — busy, vibrant floating embroidery blooms.
  phulkari: { airy: false, showFloatingIcons: true, halo: false },
}
const DEFAULT_HINTS = { airy: false, showFloatingIcons: true, halo: false }

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

function FloatingMotif({ className, size, duration = 8, delay = 0, parallax, Icon = Flower2 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute text-champagne-deep/50 ${className}`}
      style={parallax ? { y: parallax } : undefined}
    >
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className={size} strokeWidth={1} />
      </motion.div>
    </motion.div>
  )
}

export default function WelcomeSplash({ greeting, motif, palette, motifAccent, couple }) {
  const sectionRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const Icon = getMotifIcon(motif) ?? Flower2
  const hints = LAYOUT_HINTS[motif] ?? DEFAULT_HINTS
  const { symbol, line } = greeting ?? DEFAULT_GREETING
  const { names: coupleNames, invitationLine, people } = couple ?? DEFAULT_COUPLE
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const slowY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const fastY = useTransform(scrollYProgress, [0, 1], [0, 170])

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden px-6 text-center min-h-svh flex flex-col items-center justify-center ${
        hints.airy ? 'py-32' : 'py-24'
      }`}
    >
      {hints.showFloatingIcons && (
        <>
          <FloatingMotif
            className="left-4 top-16"
            size="w-10 h-10 sm:w-14 sm:h-14"
            duration={9}
            parallax={reduceMotion ? undefined : slowY}
            Icon={Icon}
          />
          <FloatingMotif
            className="right-6 top-28"
            size="w-12 h-12 sm:w-16 sm:h-16"
            duration={7}
            delay={1.2}
            parallax={reduceMotion ? undefined : fastY}
            Icon={Icon}
          />
          <FloatingMotif
            className="left-10 bottom-20"
            size="w-9 h-9 sm:w-12 sm:h-12"
            duration={10}
            delay={0.6}
            parallax={reduceMotion ? undefined : fastY}
            Icon={Icon}
          />
          <FloatingMotif
            className="right-10 bottom-16"
            size="w-11 h-11 sm:w-14 sm:h-14"
            duration={8.5}
            delay={1.8}
            parallax={reduceMotion ? undefined : slowY}
            Icon={Icon}
          />
        </>
      )}

      <div className="relative flex flex-col items-center">
        <MotifBadge
          motif={motif}
          palette={palette}
          accent={motifAccent}
          className="absolute -z-10 top-2 left-1/2 -translate-x-1/2 w-32 h-32 sm:w-40 sm:h-40 opacity-25"
        />

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-xs sm:max-w-sm mb-2"
        >
          <FrameBanner motif={motif} palette={palette} accent={motifAccent} className="w-full h-auto" />
        </motion.div>

        {symbol && (
          <motion.p
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative text-2xl sm:text-3xl text-gold mb-6"
          >
            {hints.halo && (
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
                style={{ background: `${palette?.blushDeep ?? '#e8bfba'}66` }}
              />
            )}
            <motion.span
              className="inline-block"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {symbol}
            </motion.span>
          </motion.p>
        )}
      </div>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="text-sm tracking-[0.3em] uppercase text-ink-soft mb-4"
      >
        {line}
      </motion.p>

      {/* gold hairline that draws itself in */}
      <motion.span
        className="block h-px w-32 bg-gold-soft mb-8 origin-center"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
      />

      <h1
        aria-label={coupleNames}
        className={`font-script ${COUPLE_NAME_SIZES[coupleNameTier(coupleNames)]} text-rose leading-tight whitespace-nowrap`}
      >
        {coupleNames.split('').map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            aria-hidden="true"
            className="inline-block"
            initial={{ opacity: 0, y: 26, rotate: -8 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.55,
              delay: 0.35 + i * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
        className="mt-6 text-base sm:text-lg text-ink-soft max-w-md"
      >
        {invitationLine}
      </motion.p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.15, delayChildren: 1.05 }}
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-ink-soft max-w-lg"
      >
        {people.map((person) => (
          <motion.div
            key={person.name}
            variants={fadeUp}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="rounded-2xl bg-ivory/70 border border-champagne-deep/40 px-5 py-4 shadow-card"
          >
            <p className="font-serif text-lg text-ink mb-1">{person.name}</p>
            <p>{person.parents}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-soft"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <motion.span
          className="h-8 w-px bg-gold-soft"
          animate={reduceMotion ? undefined : { scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
          style={{ originY: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
