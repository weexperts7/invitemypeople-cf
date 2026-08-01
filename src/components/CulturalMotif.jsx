// A subtle, tiled line-art pattern rendered behind the invitation content,
// swapped per template (see `motif` in src/data/templatesData.js) so the
// background texture reads as the selected region/tradition rather than a
// generic floral wash. Kept to thin strokes at low opacity — decoration,
// never competing with the content on top of it.

const MOTIFS = {
  // Jharokha — a Rajasthani palace balcony arch, with a pillar and finial.
  jharokha: (line) => (
    <pattern id="motif-jharokha" width="140" height="180" patternUnits="userSpaceOnUse">
      <path
        d="M10 180 V70 A60 60 0 0 1 130 70 V180"
        fill="none"
        stroke={line}
        strokeWidth="2"
      />
      <path d="M10 70 Q70 42 130 70" fill="none" stroke={line} strokeWidth="1.2" />
      <circle cx="70" cy="24" r="4" fill={line} />
      <path d="M40 180 V92 M100 180 V92" stroke={line} strokeWidth="1" />
    </pattern>
  ),
  // Swastik & mandala ring — the classic Gujarati/Marwari auspicious opener.
  'swastik-mandala': (line) => (
    <pattern id="motif-swastik-mandala" width="110" height="110" patternUnits="userSpaceOnUse">
      <circle
        cx="55"
        cy="55"
        r="36"
        fill="none"
        stroke={line}
        strokeWidth="1"
        strokeDasharray="1.5 5"
      />
      <path
        d="M55 25 V55 M55 55 H85 M85 55 V47 M55 55 H25 M25 55 V63 M55 55 V85 M55 85 H63"
        stroke={line}
        strokeWidth="4"
        fill="none"
        strokeLinecap="square"
      />
    </pattern>
  ),
  // Lotus bloom paired with a peacock-feather "eye".
  'lotus-peacock': (line, accent) => (
    <pattern id="motif-lotus-peacock" width="120" height="140" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={line} strokeWidth="1.4">
        <path d="M60 90 Q48 66 60 40 Q72 66 60 90 Z" />
        <path d="M34 78 Q48 72 60 90 Q42 94 34 78 Z" />
        <path d="M86 78 Q72 72 60 90 Q78 94 86 78 Z" />
      </g>
      <circle cx="98" cy="26" r="9" fill="none" stroke={accent} strokeWidth="1.2" />
      <circle cx="98" cy="26" r="3.5" fill={accent} opacity="0.6" />
    </pattern>
  ),
  // Single-line vine wreath sprigs — minimalist western line art.
  'floral-line-art': (line) => (
    <pattern id="motif-floral-line-art" width="130" height="130" patternUnits="userSpaceOnUse">
      <path d="M6 110 Q30 60 62 76 T118 40" fill="none" stroke={line} strokeWidth="1" />
      <circle cx="62" cy="76" r="3" fill="none" stroke={line} strokeWidth="1" />
      <circle cx="96" cy="52" r="2" fill="none" stroke={line} strokeWidth="1" />
      <circle cx="30" cy="60" r="1.6" fill="none" stroke={line} strokeWidth="1" />
    </pattern>
  ),
  // Stepped gopuram silhouette with a small banana-leaf accent.
  'temple-gold': (line, accent) => (
    <pattern id="motif-temple-gold" width="120" height="130" patternUnits="userSpaceOnUse">
      <path
        d="M20 120 L20 90 L32 90 L32 74 L44 74 L44 58 L76 58 L76 74 L88 74 L88 90 L100 90 L100 120"
        fill="none"
        stroke={line}
        strokeWidth="2"
      />
      <path d="M54 120 Q60 98 66 120" fill="none" stroke={accent} strokeWidth="1.4" />
    </pattern>
  ),
  // Diamond chevrons with stitch dots — Phulkari embroidery.
  phulkari: (line, accent) => (
    <pattern id="motif-phulkari" width="100" height="60" patternUnits="userSpaceOnUse">
      <path
        d="M20 10 L40 30 L20 50 L0 30 Z M70 10 L90 30 L70 50 L50 30 Z"
        fill="none"
        stroke={line}
        strokeWidth="1.6"
      />
      <circle cx="20" cy="30" r="2.2" fill={accent} />
      <circle cx="70" cy="30" r="2.2" fill={accent} />
    </pattern>
  ),
  // Interlocking diamond + circle lattice — Mughal jaali screen.
  'mughal-jaali': (line) => (
    <pattern id="motif-mughal-jaali" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M0 50 L50 0 L100 50 L50 100 Z" fill="none" stroke={line} strokeWidth="1.2" />
      <circle cx="50" cy="50" r="15" fill="none" stroke={line} strokeWidth="1" />
    </pattern>
  ),
  // Alpona rice-paste floor art — scalloped swirls and dots.
  alpona: (line) => (
    <pattern id="motif-alpona" width="120" height="100" patternUnits="userSpaceOnUse">
      <path d="M20 70 Q20 34 60 34 Q100 34 100 70" fill="none" stroke={line} strokeWidth="1.4" />
      <circle cx="60" cy="22" r="3" fill={line} />
      <path d="M8 82 Q60 106 112 82" fill="none" stroke={line} strokeWidth="1" />
    </pattern>
  ),
  // Midnight Noir — a radiating Gatsby-era sunburst fan.
  'art-deco': (line, accent) => (
    <pattern id="motif-art-deco" width="100" height="100" patternUnits="userSpaceOnUse">
      <g stroke={line} strokeWidth="1" fill="none" opacity="0.9">
        <path d="M50 100 L50 58" />
        <path d="M50 100 L28 64" />
        <path d="M50 100 L72 64" />
        <path d="M50 100 L10 82" />
        <path d="M50 100 L90 82" />
      </g>
      <circle cx="50" cy="52" r="4" fill="none" stroke={accent} strokeWidth="1.2" />
    </pattern>
  ),
  // Regal Onyx — a heraldic shield-and-laurel diaper.
  'heraldic-crest': (line, accent) => (
    <pattern id="motif-heraldic-crest" width="90" height="90" patternUnits="userSpaceOnUse">
      <path
        d="M45 14 L68 24 L68 52 Q68 72 45 80 Q22 72 22 52 L22 24 Z"
        fill="none"
        stroke={line}
        strokeWidth="1"
        opacity="0.85"
      />
      <circle cx="45" cy="46" r="3" fill={accent} opacity="0.6" />
    </pattern>
  ),
}

export default function CulturalMotif({ motif, palette, accent }) {
  const config = MOTIFS[motif]
  if (!config) return null

  const line = palette?.gold ?? '#c9a24b'
  const accentColor = accent ?? palette?.goldSoft ?? line

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
    >
      <defs>{config(line, accentColor)}</defs>
      <rect width="100%" height="100%" fill={`url(#motif-${motif})`} />
    </svg>
  )
}
