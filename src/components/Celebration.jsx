import { useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const DEFAULT_CONFETTI_COLORS = [
  '#c9a24b', // gold
  '#ddc186', // gold soft
  '#e8bfba', // blush deep
  '#6b1d2b', // rose
  '#f0e2c8', // champagne
  '#fdfaf4', // ivory
]

const BURST_BASE = 46
const RAIN_BASE = 26

/**
 * Full-screen celebration: a confetti burst from the centre of the viewport,
 * a gold shockwave ring, and a short confetti rain. Rendered as a fixed
 * overlay so it covers the whole screen rather than a single card.
 *
 * `colors` lets the invitation pass its active template's palette through so
 * the confetti matches that theme instead of always the default gold/rose mix.
 */
export default function Celebration({ intensity = 1, label = null, onComplete, colors }) {
  const reduceMotion = useReducedMotion()
  const confettiColors = colors?.length ? colors : DEFAULT_CONFETTI_COLORS
  const pick = (i) => confettiColors[i % confettiColors.length]

  useEffect(() => {
    const ms = reduceMotion ? 900 : 2800
    const timer = setTimeout(() => onComplete?.(), ms)
    return () => clearTimeout(timer)
  }, [onComplete, reduceMotion])

  const { burst, rain } = useMemo(() => {
    const vw = typeof window === 'undefined' ? 375 : window.innerWidth
    const vh = typeof window === 'undefined' ? 812 : window.innerHeight
    const reach = Math.max(vw, vh) * 0.62 * intensity

    return {
      burst: Array.from({ length: Math.round(BURST_BASE * intensity) }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const distance = reach * (0.35 + Math.random() * 0.65)
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - vh * 0.06,
          rotate: Math.random() * 720 - 360,
          width: 6 + Math.random() * 8,
          height: 8 + Math.random() * 12,
          round: Math.random() > 0.55,
          color: pick(i),
          delay: Math.random() * 0.16,
          duration: 1.2 + Math.random() * 0.9,
        }
      }),
      rain: Array.from({ length: Math.round(RAIN_BASE * intensity) }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        drift: (Math.random() - 0.5) * 90,
        rotate: Math.random() * 540 - 270,
        width: 5 + Math.random() * 7,
        height: 8 + Math.random() * 10,
        round: Math.random() > 0.6,
        color: pick(i + 2),
        delay: 0.1 + Math.random() * 0.9,
        duration: 1.7 + Math.random() * 1.1,
        fall: vh + 120,
      })),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intensity, confettiColors])

  if (reduceMotion) {
    return (
      <motion.div
        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {label && (
          <p className="font-serif text-3xl text-rose bg-ivory/90 px-6 py-3 rounded-2xl shadow-soft">
            {label}
          </p>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* warm flash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(221,193,134,0.38) 0%, rgba(221,193,134,0) 62%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* shockwave rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 0.16].map((delay, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border-2 border-gold-soft"
            style={{ width: 120, height: 120 }}
            initial={{ scale: 0, opacity: 0.85 }}
            animate={{ scale: 9 * intensity, opacity: 0 }}
            transition={{ duration: 1.3, delay, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* centre burst */}
      <div className="absolute inset-0 flex items-center justify-center">
        {burst.map((p) => (
          <motion.span
            key={p.id}
            className="absolute"
            style={{
              width: p.width,
              height: p.round ? p.width : p.height,
              backgroundColor: p.color,
              borderRadius: p.round ? '9999px' : '2px',
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{
              x: p.x,
              y: [0, p.y * 0.72, p.y],
              scale: [0, 1, 0.9],
              opacity: [0, 1, 0],
              rotate: p.rotate,
            }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* confetti rain */}
      {rain.map((p) => (
        <motion.span
          key={`rain-${p.id}`}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.round ? p.width : p.height,
            backgroundColor: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: p.fall,
            x: [0, p.drift, 0],
            opacity: [0, 1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}

      {label && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <motion.p
            className="font-serif text-3xl sm:text-4xl text-rose bg-ivory/85 backdrop-blur-sm px-7 py-4 rounded-2xl shadow-soft border border-champagne-deep/50 text-center"
            initial={{ scale: 0.6, opacity: 0, y: 14 }}
            animate={{ scale: [0.6, 1.08, 1], opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: 2.4, times: [0, 0.18, 0.75, 1], ease: 'easeOut' }}
          >
            {label}
          </motion.p>
        </div>
      )}
    </motion.div>
  )
}
