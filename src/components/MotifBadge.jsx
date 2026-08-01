// A bold, FILLED silhouette unique to a template's tradition — sitting
// behind the greeting symbol in both WelcomeSplash (full preview) and
// TemplateShowcase (landing-page thumbnail). Unlike CulturalMotif's thin
// low-opacity line-art tiling or FrameBanner's 1-2px strokes, this is a
// solid shape you can recognize at thumbnail size and a glance: a palace
// dome, a temple gopuram, a mosque onion-dome, a phulkari diamond. Templates
// without an entry here render nothing, which is itself the right choice
// for e.g. the Western minimalist template's deliberate restraint.
const BADGES = {
  // Rajasthani Royal — a palace jharokha dome.
  jharokha: (fill, accent) => (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <path
        d="M22 120 V58 Q22 16 60 16 Q98 16 98 58 V120 Z"
        fill={fill}
        opacity="0.9"
      />
      <circle cx="60" cy="9" r="6" fill={accent} />
    </svg>
  ),
  // South Indian Temple Gold — a stepped gopuram silhouette.
  'temple-gold': (fill, accent) => (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <path
        d="M8 120 V100 H24 V85 H40 V70 H50 V54 H70 V70 H80 V85 H96 V100 H112 V120 Z"
        fill={fill}
        opacity="0.9"
      />
      <path d="M50 54 Q60 34 70 54 Z" fill={accent} />
    </svg>
  ),
  // Royal Mughal — an onion dome with a crescent finial.
  'mughal-jaali': (fill, accent) => (
    <svg viewBox="0 0 120 130" className="h-full w-full">
      <path
        d="M28 130 V78 Q28 26 60 16 Q92 26 92 78 V130 Z"
        fill={fill}
        opacity="0.9"
      />
      <path
        d="M50 13 A11 11 0 0 0 68 15 Q63 6 60 0 Q57 6 50 13 Z"
        fill={accent}
      />
    </svg>
  ),
  // Punjabi Phulkari — a bold embroidered diamond.
  phulkari: (fill, accent) => (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="24" y="24" width="52" height="52" fill={fill} opacity="0.9" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="7" fill={accent} />
    </svg>
  ),
}

export default function MotifBadge({ motif, palette, accent, className = 'w-24 h-24' }) {
  const render = BADGES[motif]
  if (!render) return null
  const fill = palette?.champagneDeep ?? '#cfa054'
  const accentColor = accent ?? palette?.gold ?? '#a97c2f'

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {render(fill, accentColor)}
    </div>
  )
}
