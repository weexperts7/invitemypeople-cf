// Block-print miniatures for the event cards. Each ceremony gets its own
// scene and colourway, chosen from the title a buyer typed, so a Mehendi and
// a Sangeet never look like the same card with different text.

type Kind = 'mehendi' | 'haldi' | 'sangeet' | 'wedding' | 'reception' | 'engagement' | 'default'

const KINDS: [RegExp, Kind][] = [
  [/mehe?n?di|henna/i, 'mehendi'],
  [/haldi|pithi|ubtan/i, 'haldi'],
  [/sangeet|music|cocktail|garba|dance/i, 'sangeet'],
  [/engag|sagai|ring|roka|tilak/i, 'engagement'],
  [/recept|party|dinner|walima/i, 'reception'],
  [/wedding|phera|vivah|shaadi|ceremony|muhurat/i, 'wedding'],
]

function kindFor(title: string): Kind {
  return KINDS.find(([re]) => re.test(title))?.[1] ?? 'default'
}

const COLOURS: Record<Kind, [string, string]> = {
  mehendi: ['#2f6b3c', '#1d4a29'],
  haldi: ['#f2b01e', '#d98a06'],
  sangeet: ['#c2185b', '#8d0f42'],
  wedding: ['#721a27', '#4b1018'],
  reception: ['#0f6b6b', '#094848'],
  engagement: ['#b5476b', '#83294a'],
  default: ['#a6752b', '#7d5417'],
}

const CREAM = '#fff3d6'
const GOLD = '#f0cf86'

function Mandala({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={CREAM}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} transform={`rotate(${i * 30})`} d={`M0 ${-r * 0.42} Q${r * 0.16} ${-r * 0.75} 0 ${-r} Q${-r * 0.16} ${-r * 0.75} 0 ${-r * 0.42} Z`} strokeWidth="1.1" />
      ))}
      <circle r={r * 0.4} strokeWidth="1.2" />
      <circle r={r * 0.22} strokeWidth="1" strokeDasharray="1 3" strokeLinecap="round" />
      <circle r={r * 0.07} fill={CREAM} stroke="none" />
    </g>
  )
}

function Paisley({ x, y, s, flip }: { x: number; y: number; s: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill="none" stroke={CREAM} strokeWidth={1.3 / s}>
      <path d="M0 -24 C20 -22 26 2 12 16 C2 26 -18 22 -18 6 C-18 -6 -4 -8 0 -2 C4 4 -4 10 -8 6" />
      <path d="M-3 -12 C8 -12 14 0 8 8" strokeDasharray="1 3" strokeLinecap="round" />
    </g>
  )
}

function Scene({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'mehendi':
      return (
        <>
          <Mandala x={160} y={68} r={52} />
          <Paisley x={62} y={70} s={1.1} />
          <Paisley x={258} y={70} s={1.1} flip />
        </>
      )
    case 'haldi':
      return (
        <>
          <ellipse cx="160" cy="84" rx="66" ry="12" fill="#fff3d6" />
          <path d="M94 84 q6 38 66 40 q60 -2 66 -40 Z" fill="#8a4413" />
          <ellipse cx="160" cy="84" rx="58" ry="8" fill="#ffd21f" />
          {[64, 256, 40, 280].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i < 2 ? 56 : 104})`}>
              {Array.from({ length: 8 }, (_, p) => (
                <circle key={p} cx={Math.cos((p * Math.PI) / 4) * 11} cy={Math.sin((p * Math.PI) / 4) * 11} r="7" fill="#ef6c00" />
              ))}
              <circle r="7" fill="#fff3d6" />
            </g>
          ))}
        </>
      )
    case 'sangeet':
      return (
        <>
          <path d="M100 48 Q160 30 220 48 L232 98 Q160 124 88 98 Z" fill="#fff3d6" />
          <ellipse cx="94" cy="73" rx="12" ry="27" fill={GOLD} />
          <ellipse cx="226" cy="73" rx="12" ry="27" fill={GOLD} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${112 + i * 16} ${46 - Math.sin((i / 6) * Math.PI) * 6} L${106 + i * 18} ${106 + Math.sin((i / 6) * Math.PI) * 12}`} stroke="#8d0f42" strokeWidth="2" />
          ))}
          <g fill={CREAM}>
            <path d="M44 42 v30 a8 6 0 1 1 -3 -5 v-18 l18 -5 v18 a8 6 0 1 1 -3 -5 v-20 Z" />
            <path d="M270 34 v30 a8 6 0 1 1 -3 -5 v-25 Z" />
          </g>
        </>
      )
    case 'wedding':
      return (
        <>
          <path d="M70 46 Q160 -6 250 46 Z" fill={GOLD} />
          <path d="M70 46 q22.500 18 45 0 q22.500 18 45 0 q22.500 18 45 0 q22.500 18 45 0" fill="none" stroke={CREAM} strokeWidth="3" />
          {[78, 242].map((x) => (
            <rect key={x} x={x - 4} y="46" width="8" height="82" fill={CREAM} />
          ))}
          <path d="M132 128 h56 l-6 -12 h-44 Z" fill={GOLD} />
          <path d="M160 72 C164 88 178 94 176 108 C174 118 146 118 144 108 C142 94 156 88 160 72 Z" fill="#ff9d1c" />
          <path d="M160 92 C162 100 169 102 168 110 C166 115 154 115 152 110 C151 102 158 100 160 92 Z" fill="#ffe08a" />
          {[24, 296].map((x) => (
            <g key={x} fill={GOLD}>
              <path d={`M${x} 40 q-10 14 0 28 q10 -14 0 -28 Z`} />
              <circle cx={x} cy="84" r="4" />
              <circle cx={x} cy="100" r="3" />
            </g>
          ))}
        </>
      )
    case 'reception':
      return (
        <>
          <path d="M0 18 Q160 66 320 18" fill="none" stroke={GOLD} strokeWidth="1.5" />
          {[40, 88, 136, 184, 232, 280].map((x, i) => {
            const y = 18 + 48 * 2 * (x / 320) * (1 - x / 320)
            return (
              <g key={x}>
                <path d={`M${x} ${y} v10`} stroke={GOLD} strokeWidth="1.2" />
                <path d={`M${x - 9} ${y + 10} h18 l4 16 q-13 8 -26 0 Z`} fill={i % 2 ? GOLD : CREAM} />
              </g>
            )
          })}
          {[70, 160, 250].map((x) => (
            <path key={x} d={`M${x} 92 l4 11 l11 4 l-11 4 l-4 11 l-4 -11 l-11 -4 l11 -4 Z`} fill={CREAM} />
          ))}
        </>
      )
    case 'engagement':
      return (
        <>
          <circle cx="140" cy="78" r="30" fill="none" stroke={GOLD} strokeWidth="7" />
          <circle cx="182" cy="78" r="30" fill="none" stroke={CREAM} strokeWidth="7" />
          <path d="M140 48 l-10 -12 l10 -11 l10 11 Z" fill={CREAM} />
          <Paisley x={56} y={74} s={0.9} />
          <Paisley x={264} y={74} s={0.9} flip />
        </>
      )
    default:
      return (
        <>
          <Mandala x={84} y={70} r={40} />
          <Mandala x={160} y={70} r={52} />
          <Mandala x={236} y={70} r={40} />
        </>
      )
  }
}

export default function EventArt({ title }: { title: string }) {
  const kind = kindFor(title)
  const [bg, deep] = COLOURS[kind]
  const id = `rmt-art-${kind}`
  return (
    <svg className="rmt-event-art" viewBox="0 0 320 136" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {/* Bandhani: the tie-dye dot ground of Rajasthani textiles. */}
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.3" fill="#fff" opacity="0.28" />
          <circle cx="12" cy="12" r="1.3" fill="#fff" opacity="0.28" />
        </pattern>
      </defs>
      <rect width="320" height="136" fill={bg} />
      <rect width="320" height="136" fill={`url(#${id})`} />
      <Scene kind={kind} />
      <rect y="126" width="320" height="10" fill={deep} />
    </svg>
  )
}
