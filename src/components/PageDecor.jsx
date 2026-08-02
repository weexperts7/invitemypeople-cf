import { motion } from 'framer-motion'

// Shared hero/section decoration used across every page (Home, About,
// category pages) so they read as one consistent design system rather than
// each page reinventing its own eyebrow/orb/icon treatment.
export function SectionEyebrow({ icon: Icon, children, tone = 'rose' }) {
  const tones = {
    rose: 'border-rose/30 bg-blush/60 text-rose',
    gold: 'border-gold-soft/50 bg-champagne/60 text-ink',
    ivory: 'border-white/60 bg-ivory/70 text-ink-soft',
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] shadow-card ${tones[tone]}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}

export function FloatingOrb({ className, size, duration = 10, delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// Faint, thin-stroke glyphs drifting behind hero copy so the first fold
// reads as "celebrations" at a glance, before a visitor reads a word.
export function FloatingIcon({ icon: Icon, className, size = 'w-9 h-9 sm:w-11 sm:h-11', duration = 9, delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute text-rose/[0.14] ${className}`}
      animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon className={size} strokeWidth={1} />
    </motion.div>
  )
}
