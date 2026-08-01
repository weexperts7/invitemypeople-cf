import { motion } from 'framer-motion'

// A small lit-diya glyph — the recurring "sacred lamp" motif this template
// uses to mark chapter numerals and flank the altar-step details list.
export function DiyaFlame({ color = '#c28a3a', flameColor = '#e0a34a', size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 30" width={size} height={Math.round(size * 1.25)} className={className} aria-hidden="true">
      <ellipse cx="12" cy="24" rx="9" ry="3.4" fill="none" stroke={color} strokeWidth="1.4" />
      <path
        d="M12 22 Q9 22 9 18 Q9 14 12 8 Q15 14 15 18 Q15 22 12 22 Z"
        fill={flameColor}
        opacity="0.9"
      />
    </svg>
  )
}

// The stepped gopuram-style niche framing Guruji's photo in Chapter One —
// vintage-gold and symmetrical, echoing a temple altar's central shrine.
export function TempleArchNiche({ gold = '#c28a3a', accent = '#7a2230', children }) {
  return (
    <div className="relative flex items-end justify-center" style={{ width: 208, height: 214 }}>
      <svg viewBox="0 0 208 214" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M18 214 L18 150 L40 150 L40 126 L62 126 L62 102 L82 102 L82 74 L104 44 L126 74 L126 102 L146 102 L146 126 L168 126 L168 150 L190 150 L190 214"
          fill="none"
          stroke={gold}
          strokeWidth="2.5"
        />
        <path
          d="M30 214 L30 154 L48 154 L48 130 L68 130 L68 106 L86 106 L86 80 L104 58 L122 80 L122 106 L140 106 L140 130 L160 130 L160 154 L178 154 L178 214"
          fill="none"
          stroke={gold}
          strokeWidth="1"
          opacity="0.5"
        />
        <circle cx="104" cy="34" r="7" fill="none" stroke={accent} strokeWidth="1.6" />
        <circle cx="104" cy="34" r="2.6" fill={accent} opacity="0.85" />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mb-8"
      >
        {children}
      </motion.div>
    </div>
  )
}
