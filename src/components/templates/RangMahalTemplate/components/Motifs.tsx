// The template's hand-printed ornaments, drawn entirely in SVG: no raster
// assets to ship, crisp at any size on a phone.

const MAROON = '#721a27'
const GOLD = '#c8963e'
const GOLD_LIGHT = '#f0cf86'
const MARIGOLD = '#ef9a12'
const MARIGOLD_LIGHT = '#fbc531'
const RANI = '#c2185b'

/** The hanging silk tassel guests pull to open the card. */
export function Latkan({ className }: { className?: string }) {
  // One silk tassel: a gold cap over a fan of fine threads, flared at the hem.
  const tassel = (x: number, y: number, length: number, silk: string, id: string) => (
    <g key={id}>
      {Array.from({ length: 11 }, (_, i) => {
        const spread = (i - 5) * 1.7
        return (
          <path
            key={i}
            d={`M${x + spread * 0.6} ${y + 6} Q${x + spread * 0.7} ${y + length * 0.6} ${x + spread * 1.5} ${y + length + (i % 2) * 2}`}
            stroke={silk}
            strokeWidth="1.5"
          />
        )
      })}
      <path d={`M${x - 8} ${y + 12} h16`} stroke={GOLD_LIGHT} strokeWidth="2" />
      <path d={`M${x - 6} ${y} h12 l3 9 h-18 Z`} fill={GOLD} stroke="#8a6524" strokeWidth="0.7" />
      <circle cx={x} cy={y - 3} r="3.6" fill={GOLD_LIGHT} stroke="#8a6524" strokeWidth="0.7" />
    </g>
  )
  const bead = (x: number, y: number, r: number, fill: string) => (
    <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={fill} stroke="#8a6524" strokeWidth="0.7" />
  )
  // A strand of beads on a gold cord, ending in a tassel.
  const strand = (x: number, top: number, count: number, length: number, silk: string, accent: string) => (
    <g key={x}>
      <path d={`M${x} ${top} V${top + count * 11 + 6}`} stroke={GOLD} strokeWidth="1.4" />
      {Array.from({ length: count }, (_, i) =>
        bead(x, top + 6 + i * 11, i % 2 ? 3.2 : 4.8, i % 2 ? '#fff6e0' : accent)
      )}
      {tassel(x, top + count * 11 + 8, length, silk, `t${x}`)}
    </g>
  )
  return (
    <svg className={className} viewBox="0 0 110 214" fill="none" aria-hidden="true">
      {/* The rosette the three strands hang from. */}
      <path d="M55 0 V16" stroke={GOLD} strokeWidth="3" />
      <path d="M20 26 Q55 44 90 26" stroke={GOLD} strokeWidth="2" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return <circle key={i} cx={55 + Math.cos(a) * 12} cy={24 + Math.sin(a) * 12} r="6" fill={i % 2 ? MARIGOLD : MARIGOLD_LIGHT} />
      })}
      <circle cx="55" cy="24" r="7" fill={MAROON} stroke={GOLD_LIGHT} strokeWidth="1.5" />
      {strand(22, 28, 5, 44, MAROON, RANI)}
      {strand(88, 28, 5, 44, MAROON, RANI)}
      {strand(55, 40, 7, 56, RANI, MAROON)}
    </svg>
  )
}

/** A marigold-and-mango-leaf toran, generated swag by swag. */
export function Toran({ className }: { className?: string }) {
  const W = 400
  const SWAGS = 4
  const BALLS = 10
  const flowers: { x: number; y: number; i: number }[] = []
  for (let s = 0; s < SWAGS; s += 1) {
    for (let b = 0; b <= BALLS; b += 1) {
      const t = b / BALLS
      flowers.push({
        x: ((s + t) * W) / SWAGS,
        y: 8 + 4 * 34 * t * (1 - t),
        i: s * BALLS + b,
      })
    }
  }
  const leaves = [0.5, 1.5, 2.5, 3.5].map((s) => (s * W) / SWAGS)
  return (
    <svg className={className} viewBox="0 0 400 74" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {leaves.map((x) => (
        <g key={x} fill="#2f6b3c">
          <path d={`M${x} 42 q-8 16 0 30 q8 -14 0 -30 Z`} />
          <path d={`M${x - 8} 40 q-11 11 -8 25 q11 -9 8 -25 Z`} opacity="0.85" />
          <path d={`M${x + 8} 40 q11 11 8 25 q-11 -9 -8 -25 Z`} opacity="0.85" />
        </g>
      ))}
      {flowers.map(({ x, y, i }) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill={i % 2 ? MARIGOLD : MARIGOLD_LIGHT} />
          <circle cx={x} cy={y} r="5.5" fill={i % 2 ? MARIGOLD_LIGHT : MARIGOLD} opacity="0.8" />
          <circle cx={x} cy={y} r="2" fill="#c96a05" />
        </g>
      ))}
    </svg>
  )
}

/** The auspicious mangal kalash: pot, mango leaves and coconut. */
export function Kalash({ className }: { className?: string }) {
  const leaves = [-62, -40, -18, 18, 40, 62]
  return (
    <svg className={className} viewBox="0 0 160 190" aria-hidden="true">
      <defs>
        <linearGradient id="rmt-kalash" x1="0" x2="1">
          <stop offset="0" stopColor="#8f5a1c" />
          <stop offset="0.35" stopColor="#f6d68d" />
          <stop offset="0.65" stopColor="#d9a44a" />
          <stop offset="1" stopColor="#7d4c16" />
        </linearGradient>
      </defs>
      {leaves.map((a) => (
        <path key={a} transform={`rotate(${a} 80 74)`} d="M80 74 Q66 44 80 12 Q94 44 80 74 Z" fill="#2f6b3c" stroke="#1d4a29" strokeWidth="0.8" />
      ))}
      <ellipse cx="80" cy="50" rx="21" ry="25" fill="#8a5a2b" />
      <path d="M62 44 q18 -16 36 0" fill="none" stroke="#5f3b18" strokeWidth="1.2" />
      <path d="M80 26 v-8" stroke="#5f3b18" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M58 76 h44 l-5 12 q34 18 34 46 q0 34 -51 40 q-51 -6 -51 -40 q0 -28 34 -46 Z" fill="url(#rmt-kalash)" stroke="#7d4c16" strokeWidth="1" />
      <path d="M52 74 h56 v7 h-56 Z" fill="#f0cf86" stroke="#7d4c16" strokeWidth="1" />
      <path d="M36 122 q44 18 88 0" fill="none" stroke={MAROON} strokeWidth="5" />
      <path d="M36 122 q44 18 88 0" fill="none" stroke={MARIGOLD_LIGHT} strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="80" cy="150" r="6" fill={MAROON} />
      <circle cx="80" cy="150" r="2.4" fill={MARIGOLD_LIGHT} />
    </svg>
  )
}

/** Divider: a small lotus between two printed rules. */
export function LotusRule({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 22" fill="none" aria-hidden="true">
      <path d="M4 14 H58 M102 14 H156" stroke={GOLD} strokeWidth="1" />
      <g fill={MAROON}>
        <path d="M80 2 q7 8 0 17 q-7 -9 0 -17 Z" />
        <path d="M80 19 q-13 -1 -15 -11 q11 1 15 11 Z" opacity="0.8" />
        <path d="M80 19 q13 -1 15 -11 q-11 1 -15 11 Z" opacity="0.8" />
      </g>
    </svg>
  )
}

/** A flame, shared by the diyas and the sacred fire. */
export function Flame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 64" aria-hidden="true">
      <defs>
        <linearGradient id="rmt-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff6a00" />
          <stop offset="0.55" stopColor="#ffb300" />
          <stop offset="1" stopColor="#ffe9a8" />
        </linearGradient>
      </defs>
      <path d="M20 1 C24 16 37 26 37 42 C37 54 29 63 20 63 C11 63 3 54 3 42 C3 26 16 16 20 1 Z" fill="url(#rmt-flame)" />
      <path d="M20 30 C23 38 28 42 28 49 C28 56 24 60 20 60 C16 60 12 56 12 49 C12 42 17 38 20 30 Z" fill="#fff4cf" opacity="0.9" />
    </svg>
  )
}

/**
 * The hawan kund for the Saat Phere: a stepped copper vessel, its pit stacked
 * with samidha wood. Each flame tongue flickers on its own timing (see
 * .rmt-kund-tongue), so the fire never reads as a single candle flame.
 */
export function HawanKund({ className }: { className?: string }) {
  const tongues = [
    // Outer flames first, so the tall centre burns in front of them.
    { d: 'M38 34 C42 54 58 62 56 84 C55 97 47 104 38 104 C27 104 20 95 21 83 C23 65 36 54 38 34 Z', delay: '-0.5s' },
    { d: 'M102 30 C98 52 82 60 84 84 C85 97 93 104 102 104 C113 104 120 95 119 83 C117 63 104 52 102 30 Z', delay: '-0.9s' },
    { d: 'M56 16 C58 40 74 50 70 80 C68 96 60 104 52 104 C40 104 34 92 36 78 C39 54 54 44 56 16 Z', delay: '-0.2s' },
    { d: 'M86 20 C84 42 68 52 72 80 C74 96 82 104 90 104 C102 104 107 92 105 78 C102 56 88 46 86 20 Z', delay: '-1.2s' },
    { d: 'M70 1 C75 30 97 48 95 76 C94 94 83 104 70 104 C57 104 46 94 45 76 C43 48 65 30 70 1 Z', delay: '0s' },
  ]
  const logs = ['M22 106 L84 92', 'M118 106 L56 92', 'M34 112 L102 96', 'M106 112 L38 96']
  return (
    <svg className={className} viewBox="0 0 140 156" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rmt-kund-fire" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd34d" />
          <stop offset="0.38" stopColor="#ff8a00" />
          <stop offset="0.8" stopColor="#e53a00" />
          <stop offset="1" stopColor="#b31d00" />
        </linearGradient>
        <linearGradient id="rmt-kund-core" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset="0.6" stopColor="#ffd34d" />
          <stop offset="1" stopColor="#ff9d12" />
        </linearGradient>
        <linearGradient id="rmt-kund-copper" x1="0" x2="1">
          <stop offset="0" stopColor="#6e3312" />
          <stop offset="0.22" stopColor="#c8743a" />
          <stop offset="0.5" stopColor="#f2b27a" />
          <stop offset="0.78" stopColor="#b5622c" />
          <stop offset="1" stopColor="#5e2a0e" />
        </linearGradient>
      </defs>

      {/* The pit, with embers glowing through it. */}
      <path d="M26 96 H114 L128 112 H12 Z" fill="#2b0d07" />
      <ellipse className="rmt-kund-embers" cx="70" cy="105" rx="46" ry="7" fill="#ff6a00" />

      {logs.slice(0, 2).map((d) => (
        <path key={d} d={d} stroke="#3d1f10" strokeWidth="8" strokeLinecap="round" />
      ))}

      {tongues.map((t) => (
        <path key={t.d} className="rmt-kund-tongue" style={{ animationDelay: t.delay }} d={t.d} fill="url(#rmt-kund-fire)" />
      ))}
      <path
        className="rmt-kund-tongue"
        style={{ animationDelay: '-0.7s' }}
        d="M70 42 C73 60 86 68 84 86 C83 97 77 104 70 104 C63 104 57 97 56 86 C54 68 67 60 70 42 Z"
        fill="url(#rmt-kund-core)"
      />
      {[
        { x: 52, delay: '0s' },
        { x: 86, delay: '-0.8s' },
        { x: 68, delay: '-1.5s' },
        { x: 100, delay: '-2.1s' },
      ].map((s) => (
        <circle key={s.x} className="rmt-kund-spark" style={{ animationDelay: s.delay }} cx={s.x} cy="56" r="1.5" fill="#ffd34d" />
      ))}

      {/* Front logs lie over the base of the fire. */}
      {logs.slice(2).map((d) => (
        <g key={d}>
          <path d={d} stroke="#5a2f17" strokeWidth="8" strokeLinecap="round" />
          <path d={d} stroke="#ff7a1a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 9" />
        </g>
      ))}

      {/* Three copper steps narrowing toward the base, each with a lit rim. */}
      <path d="M10 112 H130 L126 126 H14 Z" fill="url(#rmt-kund-copper)" />
      <path d="M22 126 H118 L114 140 H26 Z" fill="url(#rmt-kund-copper)" />
      <path d="M34 140 H106 L102 154 H38 Z" fill="url(#rmt-kund-copper)" />
      <path d="M10 112 H130 M22 126 H118 M34 140 H106" stroke="#ffd9a8" strokeWidth="1.2" />
      <path d="M22 119 H118" stroke="#5e2a0e" strokeWidth="1.6" strokeDasharray="1.5 7" strokeLinecap="round" />
    </svg>
  )
}

/** A clay diya bowl. */
export function DiyaBowl({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 110 50" aria-hidden="true">
      <defs>
        <linearGradient id="rmt-diya" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e7a44a" />
          <stop offset="1" stopColor="#8a4413" />
        </linearGradient>
      </defs>
      <path d="M3 8 Q55 18 107 8 Q98 46 55 48 Q12 46 3 8 Z" fill="url(#rmt-diya)" />
      <path d="M3 8 Q55 18 107 8 Q55 0 3 8 Z" fill="#5f2e0c" />
      <path d="M24 28 q31 12 62 0" fill="none" stroke="#fbe3b0" strokeWidth="1.4" strokeDasharray="1 5" strokeLinecap="round" />
    </svg>
  )
}
