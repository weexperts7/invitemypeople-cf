// Hand-drawn SVG caricature illustrations of the couple, standing in for
// real photography until actual pictures/artwork are ready to drop in.
//
// Every color is threaded through a `palette` prop (falling back to the
// flagship template's own palette) so the same illustrations can be
// re-skinned per marketplace template without duplicating any artwork.
//
// `culture` selects an attire silhouette — headwear, facial hair, garment
// cut for the groom; skirt shape and drape for the bride — so the couple
// themselves read as belonging to that wedding tradition, not just wearing
// different colors of the same outfit.

const DEFAULT_PALETTE = {
  skin: '#e8b48f',
  hair: '#3b2a20',
  ink: '#4a3f3a',
  gold: '#c9a24b',
  goldSoft: '#ddc186',
  champagne: '#f0e2c8',
  champagneDeep: '#e3cd9c',
  blush: '#f6e2df',
  blushDeep: '#e8bfba',
  ivory: '#fdfaf4',
  linen: '#f6efe4',
  rose: '#c98f8a',
}

// Keyed off the same `weddingType` values used in templatesData.js.
const CULTURE_STYLES = {
  Hindu: { headwear: 'turban', beard: false, garment: 'sherwani', skirt: 'lehenga' },
  'South Indian': { headwear: 'none', beard: false, garment: 'veshti', skirt: 'saree' },
  Muslim: { headwear: 'topi', beard: false, garment: 'sherwani', skirt: 'lehenga' },
  Sikh: { headwear: 'turban', beard: true, garment: 'sherwani', skirt: 'lehenga' },
  Christian: { headwear: 'none', beard: false, garment: 'suit', skirt: 'gown' },
}
const DEFAULT_STYLE = CULTURE_STYLES.Hindu

function Groom({ x, y, rotate = 0, scale = 1, arm = 'down', face = 'smile', c, style = DEFAULT_STYLE }) {
  const { headwear, beard, garment } = style

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M-14,120 L-14,175 Q-14,182 -8,182 L-2,182 L-2,120 Z" fill={c.ivory} />
      <path d="M14,120 L14,175 Q14,182 8,182 L2,182 L2,120 Z" fill={c.ivory} />
      <ellipse cx="-8" cy="184" rx="9" ry="5" fill={c.ink} />
      <ellipse cx="8" cy="184" rx="9" ry="5" fill={c.ink} />

      {garment === 'sherwani' && (
        <>
          <path
            d="M-26,40 Q0,28 26,40 L30,130 Q0,140 -30,130 Z"
            fill={c.champagneDeep}
            stroke={c.gold}
            strokeWidth="1.5"
          />
          <line x1="0" y1="42" x2="0" y2="128" stroke={c.gold} strokeWidth="2" />
          <circle cx="0" cy="60" r="2.2" fill={c.gold} />
          <circle cx="0" cy="80" r="2.2" fill={c.gold} />
          <circle cx="0" cy="100" r="2.2" fill={c.gold} />
          <path d="M-10,32 Q0,24 10,32 L7,42 Q0,38 -7,42 Z" fill={c.rose} />
        </>
      )}

      {garment === 'suit' && (
        <>
          <path
            d="M-24,42 Q0,34 24,42 L26,130 Q0,138 -26,130 Z"
            fill={c.ink}
            stroke={c.goldSoft}
            strokeWidth="1"
          />
          <path d="M-8,42 L0,70 L8,42" fill="none" stroke={c.ivory} strokeWidth="2" />
          <path d="M-14,44 L-2,74" stroke={c.ivory} strokeWidth="1.4" />
          <path d="M14,44 L2,74" stroke={c.ivory} strokeWidth="1.4" />
          <circle cx="0" cy="82" r="1.6" fill={c.gold} />
          <circle cx="0" cy="98" r="1.6" fill={c.gold} />
        </>
      )}

      {garment === 'veshti' && (
        <>
          <path d="M-19,45 Q0,53 19,45 L19,78 Q0,86 -19,78 Z" fill={c.skin} opacity="0.28" />
          <path
            d="M-24,76 Q0,84 24,76 L28,130 Q0,140 -28,130 Z"
            fill={c.ivory}
            stroke={c.gold}
            strokeWidth="1.5"
          />
          <path d="M-19,45 L18,108" stroke={c.gold} strokeWidth="8" strokeLinecap="round" opacity="0.85" />
        </>
      )}

      {arm === 'down' && (
        <>
          <path d="M-26,45 Q-38,80 -32,120" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M26,45 Q38,80 32,120" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="-32" cy="122" r="8" fill={c.skin} />
          <circle cx="32" cy="122" r="8" fill={c.skin} />
        </>
      )}
      {arm === 'hold-right' && (
        <>
          <path d="M-26,45 Q-38,80 -32,120" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="-32" cy="122" r="8" fill={c.skin} />
          <path d="M26,45 Q42,68 40,92" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="94" r="8" fill={c.skin} />
        </>
      )}
      {arm === 'raised' && (
        <>
          <path d="M-26,45 Q-44,30 -46,5" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="-46" cy="3" r="8" fill={c.skin} />
          <path d="M26,45 Q44,30 46,5" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="46" cy="3" r="8" fill={c.skin} />
        </>
      )}
      {arm === 'embrace' && (
        <>
          <path d="M-26,45 Q-40,65 -20,88" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="-20" cy="88" r="8" fill={c.skin} />
          <path d="M26,45 Q46,65 38,100" stroke={c.champagneDeep} strokeWidth="14" fill="none" strokeLinecap="round" />
          <circle cx="38" cy="100" r="8" fill={c.skin} />
        </>
      )}

      {headwear === 'turban' && (
        <path d="M-28,-5 Q0,-32 28,-5 Q28,10 0,8 Q-28,10 -28,-5 Z" fill={c.rose} stroke={c.gold} strokeWidth="1.5" />
      )}
      {headwear === 'topi' && (
        <path d="M-15,-17 Q0,-32 15,-17 Q15,-8 0,-6 Q-15,-8 -15,-17 Z" fill={c.ivory} stroke={c.gold} strokeWidth="1.2" />
      )}

      <rect x="-6" y="18" width="12" height="14" fill={c.skin} />
      <circle cx="0" cy="0" r="27" fill={c.skin} />
      <path d="M-27,-4 Q-27,-30 0,-30 Q27,-30 27,-4 Q20,-16 0,-16 Q-20,-16 -27,-4 Z" fill={c.hair} />
      <path d="M-27,-4 Q-29,3 -26,9" stroke={c.hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M27,-4 Q29,3 26,9" stroke={c.hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M-9,10 Q0,15 9,10" stroke={c.hair} strokeWidth="3" fill="none" strokeLinecap="round" />

      {beard && (
        <path d="M-16,9 Q-18,26 0,32 Q18,26 16,9 Q16,20 0,24 Q-16,20 -16,9 Z" fill={c.hair} opacity="0.95" />
      )}

      {face === 'smile' && (
        <>
          <path d="M-13,-4 Q-9,-7 -5,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M13,-4 Q9,-7 5,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-8,16 Q0,22 8,16" stroke={c.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {face === 'laugh' && (
        <>
          <path d="M-13,-3 Q-9,-8 -5,-3" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M13,-3 Q9,-8 5,-3" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="0" cy="18" rx="8" ry="6" fill={c.ink} />
        </>
      )}
      {face === 'closed' && (
        <>
          <path d="M-13,-4 Q-9,-1 -5,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M13,-4 Q9,-1 5,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-8,16 Q0,20 8,16" stroke={c.ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  )
}

function Bride({ x, y, rotate = 0, scale = 1, arm = 'down', face = 'smile', c, style = DEFAULT_STYLE }) {
  const { skirt } = style
  const skirtFill = skirt === 'gown' ? c.ivory : c.rose
  const showJewelry = skirt !== 'gown'

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {skirt !== 'saree' && (
        <path
          d="M-34,60 Q0,45 34,60 L44,175 Q0,190 -44,175 Z"
          fill={skirtFill}
          stroke={c.gold}
          strokeWidth="1.5"
        />
      )}
      {skirt === 'saree' && (
        <path
          d="M-28,58 Q0,50 28,58 L34,175 Q0,184 -34,175 Z"
          fill={skirtFill}
          stroke={c.gold}
          strokeWidth="1.5"
        />
      )}
      {skirt === 'gown' && (
        <path
          d="M-34,150 Q0,175 34,150 L44,178 Q0,196 -44,178 Z"
          fill={c.ivory}
          opacity="0.85"
        />
      )}
      <path d="M-44,175 Q0,190 44,175" fill="none" stroke={c.gold} strokeWidth="2" opacity={skirt === 'gown' ? 0.4 : 1} />
      {showJewelry && (
        <>
          <circle cx="-18" cy="140" r="2.4" fill={c.goldSoft} />
          <circle cx="0" cy="150" r="2.4" fill={c.goldSoft} />
          <circle cx="18" cy="140" r="2.4" fill={c.goldSoft} />
        </>
      )}

      {arm === 'down' && (
        <>
          <path d="M-24,42 Q-36,75 -30,118" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <path d="M24,42 Q36,75 30,118" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="-30" cy="120" r="7.5" fill={c.skin} />
          <circle cx="30" cy="120" r="7.5" fill={c.skin} />
        </>
      )}
      {arm === 'hold-left' && (
        <>
          <path d="M-24,42 Q-40,62 -38,88" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="-38" cy="90" r="7.5" fill={c.skin} />
          <path d="M24,42 Q36,75 30,118" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="120" r="7.5" fill={c.skin} />
        </>
      )}
      {arm === 'raised' && (
        <>
          <path d="M-24,42 Q-42,28 -44,4" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="-44" cy="2" r="7.5" fill={c.skin} />
          <path d="M24,42 Q42,28 44,4" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="44" cy="2" r="7.5" fill={c.skin} />
        </>
      )}
      {arm === 'shy' && (
        <>
          <path d="M-24,42 Q-34,60 -14,68" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="-14" cy="68" r="7.5" fill={c.skin} />
          <path d="M24,42 Q36,75 30,118" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="120" r="7.5" fill={c.skin} />
        </>
      )}
      {arm === 'embrace' && (
        <>
          <path d="M-24,42 Q-40,60 -34,95" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="-34" cy="95" r="7.5" fill={c.skin} />
          <path d="M24,42 Q42,62 22,86" stroke={skirtFill} strokeWidth="13" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="86" r="7.5" fill={c.skin} />
        </>
      )}

      <path
        d="M-20,30 Q0,20 20,30 L22,62 Q0,70 -22,62 Z"
        fill={c.goldSoft}
        stroke={c.gold}
        strokeWidth="1.2"
      />

      {skirt === 'gown' ? (
        <path
          d="M-22,26 Q0,16 22,26 L28,92 Q0,102 -28,92 Z"
          fill={c.ivory}
          opacity="0.55"
        />
      ) : (
        <>
          <path
            d="M-20,32 Q12,58 6,140"
            fill="none"
            stroke={c.ivory}
            strokeOpacity="0.9"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <path
            d="M-20,32 Q12,58 6,140"
            fill="none"
            stroke={c.gold}
            strokeOpacity={skirt === 'saree' ? 0 : 0.5}
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        </>
      )}

      <rect x="-6" y="16" width="12" height="14" fill={c.skin} />
      <circle cx="0" cy="0" r="25" fill={c.skin} />
      <path d="M-25,-2 Q-26,-28 0,-29 Q26,-28 25,-2 Q18,-14 0,-14 Q-18,-14 -25,-2 Z" fill={c.hair} />
      <path d="M-25,-2 Q-30,20 -18,32 Q-18,20 -20,4" fill={c.hair} />
      <path d="M25,-2 Q30,20 18,32 Q18,20 20,4" fill={c.hair} />
      <circle cx="-18" cy="30" r="6" fill={c.hair} />

      {skirt === 'gown' && (
        <path
          d="M-24,-10 Q0,-2 24,-10 L20,26 Q0,32 -20,26 Z"
          fill={c.ivory}
          opacity="0.4"
        />
      )}

      {showJewelry && (
        <>
          <path d="M0,-29 L0,-14" stroke={c.gold} strokeWidth="2" />
          <circle cx="0" cy="-13" r="2" fill={c.gold} />
          <circle cx="0" cy="7" r="1.8" fill={c.rose} />
          <circle cx="-24" cy="6" r="1.6" fill={c.gold} />
          <circle cx="24" cy="6" r="1.6" fill={c.gold} />
        </>
      )}

      {face === 'smile' && (
        <>
          <path d="M-12,-4 Q-8,-7 -4,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12,-4 Q8,-7 4,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-7,14 Q0,19 7,14" stroke={c.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="-14" cy="8" r="4" fill={c.rose} opacity="0.35" />
          <circle cx="14" cy="8" r="4" fill={c.rose} opacity="0.35" />
        </>
      )}
      {face === 'laugh' && (
        <>
          <path d="M-12,-3 Q-8,-8 -4,-3" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12,-3 Q8,-8 4,-3" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="0" cy="16" rx="6.5" ry="5" fill={c.ink} />
          <circle cx="-14" cy="8" r="4" fill={c.rose} opacity="0.4" />
          <circle cx="14" cy="8" r="4" fill={c.rose} opacity="0.4" />
        </>
      )}
      {face === 'closed' && (
        <>
          <path d="M-12,-4 Q-8,-1 -4,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12,-4 Q8,-1 4,-4" stroke={c.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-7,14 Q0,18 7,14" stroke={c.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="-14" cy="8" r="4" fill={c.rose} opacity="0.4" />
          <circle cx="14" cy="8" r="4" fill={c.rose} opacity="0.4" />
        </>
      )}
    </g>
  )
}

function Hearts({ spots, color }) {
  return (
    <>
      {spots.map(([hx, hy, size, op], i) => (
        <path
          key={i}
          d={`M${hx},${hy} c${-size},${-size * 0.7} ${-size * 2},${size * 0.3} 0,${size * 1.6} c${size * 2},${-size * 1.3} ${size},${-size * 2.3} 0,${-size * 1.6}z`}
          fill={color}
          opacity={op}
        />
      ))}
    </>
  )
}

function Confetti({ spots, colors }) {
  return (
    <>
      {spots.map(([cx, cy, r, colorIndex], i) => (
        <rect
          key={i}
          x={cx - r / 2}
          y={cy - r / 2}
          width={r}
          height={r}
          fill={colors[colorIndex % colors.length]}
          transform={`rotate(${(i * 37) % 360} ${cx} ${cy})`}
        />
      ))}
    </>
  )
}

const VARIANTS = {
  laugh: {
    bg: (c) => [c.blush, c.champagne],
    render: (c, style) => (
      <>
        <Hearts color={c.rose} spots={[[60, 60, 6, 0.5], [250, 90, 5, 0.4], [235, 320, 5, 0.4]]} />
        <Groom x={118} y={165} rotate={-6} arm="raised" face="laugh" c={c} style={style} />
        <Bride x={190} y={168} rotate={6} arm="raised" face="laugh" c={c} style={style} />
      </>
    ),
  },
  portrait: {
    bg: (c) => [c.champagne, c.champagneDeep],
    render: (c, style) => (
      <>
        <circle cx="150" cy="185" r="128" fill={c.ivory} opacity="0.35" />
        <Groom x={112} y={175} rotate={0} arm="hold-right" face="smile" c={c} style={style} />
        <Bride x={188} y={178} rotate={0} arm="hold-left" face="smile" c={c} style={style} />
      </>
    ),
  },
  walk: {
    bg: (c) => [c.ivory, c.champagne],
    render: (c, style) => (
      <>
        <path d="M0,330 Q150,318 300,330" stroke={c.goldSoft} strokeWidth="3" fill="none" opacity="0.6" />
        <Groom x={110} y={160} rotate={-4} arm="hold-right" face="smile" c={c} style={style} />
        <Bride x={186} y={163} rotate={4} arm="hold-left" face="smile" c={c} style={style} />
      </>
    ),
  },
  candid: {
    bg: (c) => [c.blush, c.ivory],
    render: (c, style) => (
      <>
        <Hearts color={c.rose} spots={[[245, 70, 5, 0.4], [55, 250, 5, 0.35]]} />
        <Groom x={112} y={168} rotate={4} arm="down" face="smile" c={c} style={style} />
        <Bride x={192} y={172} rotate={-6} arm="shy" face="laugh" c={c} style={style} />
      </>
    ),
  },
  sunset: {
    bg: (c) => [c.champagne, c.rose],
    render: (c, style) => (
      <>
        <circle cx="150" cy="150" r="70" fill={c.goldSoft} opacity="0.7" />
        <circle cx="150" cy="150" r="70" fill="none" stroke={c.gold} strokeWidth="2" opacity="0.5" />
        <g opacity="0.92">
          <Groom x={128} y={215} rotate={0} arm="hold-right" face="smile" c={c} style={style} />
          <Bride x={182} y={218} rotate={0} arm="hold-left" face="smile" c={c} style={style} />
        </g>
      </>
    ),
  },
  closeup: {
    bg: (c) => [c.blush, c.blushDeep],
    render: (c, style) => (
      <>
        <Hearts color={c.rose} spots={[[65, 110, 7, 0.5], [235, 100, 6, 0.45], [150, 60, 5, 0.4]]} />
        <Groom x={108} y={225} rotate={-8} scale={1.55} arm="embrace" face="closed" c={c} style={style} />
        <Bride x={196} y={228} rotate={8} scale={1.55} arm="embrace" face="closed" c={c} style={style} />
      </>
    ),
  },
  quiet: {
    bg: (c) => [c.linen, c.champagne],
    render: (c, style) => (
      <>
        <rect x="90" y="290" width="120" height="14" rx="4" fill={c.champagneDeep} />
        <rect x="100" y="304" width="8" height="26" fill={c.champagneDeep} />
        <rect x="192" y="304" width="8" height="26" fill={c.champagneDeep} />
        <path d="M70,270 q6,-16 16,0" fill="none" stroke={c.gold} strokeWidth="2" opacity="0.6" />
        <Groom x={118} y={205} rotate={5} arm="down" face="closed" c={c} style={style} />
        <Bride x={184} y={208} rotate={-5} arm="down" face="closed" c={c} style={style} />
      </>
    ),
  },
  celebrate: {
    bg: (c) => [c.champagneDeep, c.gold],
    render: (c, style) => (
      <>
        <Confetti
          colors={[c.ivory, c.rose, c.ivory, c.linen, c.rose, c.ivory, c.linen]}
          spots={[
            [40, 50, 8, 0],
            [260, 60, 7, 1],
            [50, 260, 7, 2],
            [255, 250, 8, 3],
            [150, 30, 6, 4],
            [30, 150, 6, 5],
            [270, 150, 6, 6],
          ]}
        />
        <Groom x={112} y={160} rotate={-8} arm="raised" face="laugh" c={c} style={style} />
        <Bride x={190} y={163} rotate={8} arm="raised" face="laugh" c={c} style={style} />
      </>
    ),
  },
}

export default function CoupleCaricature({ variant = 'laugh', palette, culture, className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.laugh
  const c = palette ? { ...DEFAULT_PALETTE, ...palette } : DEFAULT_PALETTE
  const style = CULTURE_STYLES[culture] ?? DEFAULT_STYLE
  const gradId = `grad-${variant}-${c.rose.replace('#', '')}`
  const [from, to] = config.bg(c)

  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="300" height="400" fill={`url(#${gradId})`} />
      {config.render(c, style)}
    </svg>
  )
}
