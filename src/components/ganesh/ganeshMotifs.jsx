import { motion } from 'framer-motion'

// A small modak glyph — the recurring "sacred sweet" motif used to mark
// chapter numerals and flank the puja-muhurat details list, the same role
// DiyaFlame plays for the Golden Temple Altar Satsang template.
export function ModakGlyph({ color = '#d9932e', accent = '#c2410c', size = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 28" width={size} height={Math.round(size * 1.17)} className={className} aria-hidden="true">
      <path
        d="M12 4c4.5 1.8 7 5.2 7 9.4C19 19 15.5 22.6 12 24c-3.5-1.4-7-5-7-10.6C5 9.2 7.5 5.8 12 4Z"
        fill={accent}
        opacity="0.9"
      />
      <path d="M12 4 L12 1" stroke={color} strokeWidth="1.4" />
      <path d="M8.5 10c1-1 2.2-1.5 3.5-1.5s2.5.5 3.5 1.5" fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

// The recurring "storybook chapter" wrapper used by Marigold Mandap — a
// numeral medallion, a title flanked by hairline rules, and an optional
// icon, mirroring GoldenTempleAltarChapter.jsx's pattern for the Satsang
// category.
export function GaneshChapter({ numeral, title, icon: Icon, gold, children, className = '' }) {
  return (
    <section className={`px-6 py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-7"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-serif text-sm"
          style={{ borderColor: gold, color: gold }}
        >
          {numeral}
        </span>
        <span className="flex-1 h-px" style={{ background: `${gold}55` }} />
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: gold }} strokeWidth={1.6} />}
        <h2 className="font-serif text-xl sm:text-2xl text-ink whitespace-nowrap">{title}</h2>
        <span className="flex-1 h-px" style={{ background: `${gold}55` }} />
      </motion.div>
      {children}
    </section>
  )
}

// A symmetric arched niche framing Bappa's idol photo in the Golden Trunk
// Blessing hero — mirrors TempleArchNiche.jsx's role for the Golden Temple
// Altar Satsang template, but a rounded mandap arch instead of a stepped
// gopuram.
export function MandapArch({ gold = '#c28a3a', accent = '#9a1f2b', children }) {
  return (
    <div className="relative flex items-end justify-center" style={{ width: 208, height: 214 }}>
      <svg viewBox="0 0 208 214" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M18 214 V110 Q18 30 104 20 Q190 30 190 110 V214"
          fill="none"
          stroke={gold}
          strokeWidth="2.5"
        />
        <path
          d="M32 214 V112 Q32 44 104 34 Q176 44 176 112 V214"
          fill="none"
          stroke={gold}
          strokeWidth="1"
          opacity="0.5"
        />
        <circle cx="104" cy="18" r="7" fill="none" stroke={accent} strokeWidth="1.6" />
        <circle cx="104" cy="18" r="2.6" fill={accent} opacity="0.85" />
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

// A taller, crowned jharokha niche with peacock-feather flourishes at the
// shoulders and a kalasha finial at the apex — the "Royal Durbar" hero frame
// for Bappa's portrait in RoyalDurbarDarshanExperience, standing over a
// full-bleed photograph rather than a flat palette backdrop like MandapArch.
export function DurbarNiche({ gold = '#b8892c', accent = '#7a1230', children }) {
  return (
    <div className="relative flex items-end justify-center" style={{ width: 232, height: 260 }}>
      <svg viewBox="0 0 232 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M20 260 V130 Q20 34 116 22 Q212 34 212 130 V260"
          fill="none"
          stroke={gold}
          strokeWidth="2.5"
        />
        <path
          d="M34 260 V132 Q34 50 116 40 Q198 50 198 132 V260"
          fill="none"
          stroke={gold}
          strokeWidth="1"
          opacity="0.5"
        />
        <g>
          <path d="M54 96 Q30 70 26 40" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.85" />
          <circle cx="26" cy="34" r="8" fill="none" stroke={accent} strokeWidth="1.3" />
          <circle cx="26" cy="34" r="3" fill={accent} opacity="0.75" />
        </g>
        <g>
          <path d="M178 96 Q202 70 206 40" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.85" />
          <circle cx="206" cy="34" r="8" fill="none" stroke={accent} strokeWidth="1.3" />
          <circle cx="206" cy="34" r="3" fill={accent} opacity="0.75" />
        </g>
        <path d="M104 20 L116 2 L128 20 Z" fill={gold} opacity="0.9" />
        <circle cx="116" cy="18" r="3" fill={accent} />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mb-10"
      >
        {children}
      </motion.div>
    </div>
  )
}
