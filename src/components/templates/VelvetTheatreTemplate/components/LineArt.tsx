// Hand-drawn-style line illustrations in the template's oxblood ink. Pure
// SVG strokes — no raster assets to ship, crisp at any size, and they pick
// up `currentColor` so the CSS owns their colour.

export function PalaceFacade({ className }: { className?: string }) {
  const columns = [68, 100, 214, 246]
  return (
    <svg className={className} viewBox="0 0 320 170" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* dome on its drum, behind the pediment */}
      <path d="M142 54 V44 H178 V54" />
      <path d="M142 44 Q160 8 178 44" />
      <path d="M150 44 Q160 20 170 44" strokeOpacity="0.5" />
      <path d="M160 17 V9" />
      <circle cx="160" cy="7" r="2" />
      {/* main body + cornice */}
      <path d="M60 80 V148 H260 V80" />
      <path d="M54 80 H266 M58 76 H262" />
      <path d="M110 76 L160 52 L210 76" className="vtt-art-fill" />
      <circle cx="160" cy="66" r="4" />
      {/* garland swags along the cornice */}
      <path d="M62 86 Q76 94 90 86 Q104 94 118 86 Q132 94 146 86 Q160 94 174 86 Q188 94 202 86 Q216 94 230 86 Q244 94 258 86" strokeOpacity="0.7" />
      {/* paired columns with capitals */}
      {columns.map((x) => (
        <g key={x}>
          <path d={`M${x} 98 V148 M${x + 6} 98 V148`} />
          <path d={`M${x - 3} 98 H${x + 9} M${x - 3} 146 H${x + 9}`} />
        </g>
      ))}
      {/* arched doorway and side windows */}
      <path d="M146 148 V118 Q160 100 174 118 V148" />
      <path d="M152 148 V121 Q160 110 168 121 V148" strokeOpacity="0.5" />
      <path d="M122 140 V122 Q128 114 134 122 V140 Z" />
      <path d="M186 140 V122 Q192 114 198 122 V140 Z" />
      <path d="M80 136 V112 Q86 104 92 112 V136 Z" strokeOpacity="0.7" />
      <path d="M228 136 V112 Q234 104 240 112 V136 Z" strokeOpacity="0.7" />
      {/* steps */}
      <path d="M112 148 V152 H208 V148 M104 152 V156 H216 V152 M96 156 V160 H224 V156" />
      {/* cypress trees */}
      <path d="M32 160 Q22 120 36 78 Q50 120 40 160 Z" />
      <path d="M36 90 V160" strokeOpacity="0.4" />
      <path d="M288 160 Q298 120 284 78 Q270 120 280 160 Z" />
      <path d="M284 90 V160" strokeOpacity="0.4" />
      {/* ground */}
      <path d="M8 160 H312" />
      <path d="M40 165 H120 M200 165 H280" strokeOpacity="0.4" />
    </svg>
  )
}

/** A small flourish used between sections. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
      <path d="M4 8 H44 M76 8 H116" strokeOpacity="0.6" />
      <path d="M44 8 Q52 1 60 8 Q68 15 76 8" />
      <path d="M44 8 Q52 15 60 8 Q68 1 76 8" />
      <circle cx="60" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}

/** Theatre masks, for the RSVP heading. */
export function TheatreMasks({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 10 Q24 2 40 10 V28 Q40 46 23 48 Q6 46 6 28 Z" className="vtt-art-fill" />
      <path d="M13 22 Q17 18 21 22 M27 22 Q31 18 35 22" />
      <path d="M14 33 Q23 41 32 33" />
      <path d="M40 16 Q56 8 74 16 V34 Q74 52 57 54 Q40 52 40 34 Z" className="vtt-art-fill" />
      <path d="M47 27 Q51 31 55 27 M61 27 Q65 31 69 27" />
      <path d="M48 44 Q57 37 66 44" />
    </svg>
  )
}
