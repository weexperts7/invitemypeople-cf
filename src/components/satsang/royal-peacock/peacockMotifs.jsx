// Bespoke, larger-scale peacock ornamentation for the Royal Peacock layout —
// deliberately distinct from (and richer than) the small shared glyphs in
// ../../TemplateFrame.jsx, since this template's whole identity is an
// ornamental "physical luxury card" frame, not a thin corner accent.
import { motion } from 'framer-motion'

// A single corner ornament — a double-line frame arm meeting a peacock-eye
// medallion with feather fronds — mirrored into all 4 corners by
// RoyalPeacockFrame.jsx.
export function PeacockCornerMedallion({ gold = '#c9a24b', accent = '#0f6e5c', rose = '#0e4d43' }) {
  return (
    <svg viewBox="0 0 90 90" aria-hidden="true" className="h-full w-full">
      <path d="M4 90 L4 22 Q4 4 22 4 L90 4" fill="none" stroke={gold} strokeWidth="2.5" />
      <path d="M14 90 L14 28 Q14 14 28 14 L90 14" fill="none" stroke={gold} strokeWidth="1" opacity="0.55" />
      <circle cx="19" cy="19" r="13" fill="none" stroke={accent} strokeWidth="1.6" />
      <circle cx="19" cy="19" r="7" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="19" cy="19" r="2.6" fill={accent} opacity="0.85" />
      <path d="M19 19 Q6 34 4 58" fill="none" stroke={rose} strokeWidth="1.1" opacity="0.7" />
      <path d="M19 19 Q34 6 58 4" fill="none" stroke={rose} strokeWidth="1.1" opacity="0.7" />
    </svg>
  )
}

// The pointed archway niche framing Guruji's photo — a jharokha-style arch
// reworked with a peacock-eye crest and fanned feather fronds at the apex.
export function PeacockArchway({ gold = '#c9a24b', accent = '#0f6e5c', rose = '#0e4d43', children }) {
  return (
    <div className="relative flex items-end justify-center" style={{ width: 208, height: 214 }}>
      <svg viewBox="0 0 208 214" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M22 214 V96 Q22 22 104 22 Q186 22 186 96 V214"
          fill="none"
          stroke={gold}
          strokeWidth="2.5"
        />
        <path
          d="M35 214 V100 Q35 36 104 36 Q173 36 173 100 V214"
          fill="none"
          stroke={gold}
          strokeWidth="1"
          opacity="0.55"
        />
        <circle cx="104" cy="16" r="9" fill="none" stroke={accent} strokeWidth="1.6" />
        <circle cx="104" cy="16" r="3.4" fill={accent} opacity="0.85" />
        {[-70, -35, 0, 35, 70].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x1 = 104 + Math.cos(rad - Math.PI / 2) * 12
          const y1 = 16 + Math.sin(rad - Math.PI / 2) * 12
          const x2 = 104 + Math.cos(rad - Math.PI / 2) * 24
          const y2 = 16 + Math.sin(rad - Math.PI / 2) * 24
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={rose} strokeWidth="1.3" />
        })}
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mb-6"
      >
        {children}
      </motion.div>
    </div>
  )
}
