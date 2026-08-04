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
  // The Divine Peacock (Satsang) — a tiled peacock-feather "eye".
  'peacock-feather': (line, accent) => (
    <pattern id="motif-peacock-feather" width="110" height="130" patternUnits="userSpaceOnUse">
      <path d="M55 118 Q40 80 55 40" fill="none" stroke={line} strokeWidth="1.4" />
      <circle cx="55" cy="30" r="15" fill="none" stroke={accent} strokeWidth="1.4" />
      <circle cx="55" cy="30" r="8" fill="none" stroke={accent} strokeWidth="1" />
      <circle cx="55" cy="30" r="2.8" fill={accent} opacity="0.7" />
      <path d="M55 44 Q30 58 22 82" fill="none" stroke={line} strokeWidth="1" opacity="0.7" />
      <path d="M55 44 Q80 58 88 82" fill="none" stroke={line} strokeWidth="1" opacity="0.7" />
    </pattern>
  ),
  // Saffron Blossom (Satsang) — an open lotus bloom.
  'saffron-lotus': (line, accent) => (
    <pattern id="motif-saffron-lotus" width="120" height="120" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={line} strokeWidth="1.3">
        <path d="M60 88 Q48 64 60 38 Q72 64 60 88 Z" />
        <path d="M34 76 Q48 70 60 88 Q40 92 34 76 Z" />
        <path d="M86 76 Q72 70 60 88 Q80 92 86 76 Z" />
        <path d="M22 58 Q42 60 60 88 Q30 78 22 58 Z" />
        <path d="M98 58 Q78 60 60 88 Q90 78 98 58 Z" />
      </g>
      <circle cx="60" cy="86" r="3" fill={accent} opacity="0.7" />
    </pattern>
  ),
  // Radiant Sunrise (Satsang) — a small sun disc with radiating rays.
  'sunrise-rays': (line, accent) => (
    <pattern id="motif-sunrise-rays" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="60" cy="100" r="14" fill="none" stroke={accent} strokeWidth="1.4" />
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
        const rad = ((-90 + i * 18) * Math.PI) / 180
        return (
          <line
            key={i}
            x1={60 + Math.cos(rad) * 18}
            y1={100 + Math.sin(rad) * 18}
            x2={60 + Math.cos(rad) * 38}
            y2={100 + Math.sin(rad) * 38}
            stroke={line}
            strokeWidth="1.2"
          />
        )
      })}
    </pattern>
  ),
  // Tulsi Serenity (Satsang) — a tulsi (holy basil) sprig with paired leaves.
  'tulsi-leaf': (line) => (
    <pattern id="motif-tulsi-leaf" width="90" height="110" patternUnits="userSpaceOnUse">
      <path d="M45 92 L45 38" stroke={line} strokeWidth="1.2" fill="none" />
      <path d="M45 50 Q30 46 26 34 Q40 36 45 50 Z" fill="none" stroke={line} strokeWidth="1.1" />
      <path d="M45 50 Q60 46 64 34 Q50 36 45 50 Z" fill="none" stroke={line} strokeWidth="1.1" />
      <path d="M45 68 Q32 64 28 54 Q42 56 45 68 Z" fill="none" stroke={line} strokeWidth="1" opacity="0.85" />
      <path d="M45 68 Q58 64 62 54 Q48 56 45 68 Z" fill="none" stroke={line} strokeWidth="1" opacity="0.85" />
    </pattern>
  ),
  // Diya Ganga (Satsang) — a row of lit oil-lamps over a gentle river wave.
  'diya-wave': (line, accent) => (
    <pattern id="motif-diya-wave" width="110" height="100" patternUnits="userSpaceOnUse">
      <path d="M20 70 Q35 60 55 70 Q75 80 90 70" fill="none" stroke={line} strokeWidth="1.2" opacity="0.8" />
      <ellipse cx="55" cy="64" rx="13" ry="5" fill="none" stroke={line} strokeWidth="1.2" />
      <path
        d="M55 54 Q60 54 60 47 Q60 40 55 34 Q50 40 50 47 Q50 51 55 54 Z"
        fill={accent}
        opacity="0.75"
      />
    </pattern>
  ),
  // Marigold Garland (Ganesh Chaturthi) — a tiled strung marigold bloom.
  'marigold-garland': (line, accent) => (
    <pattern id="motif-marigold-garland" width="120" height="120" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={line} strokeWidth="1.2">
        <circle cx="60" cy="60" r="10" />
        <circle cx="60" cy="44" r="7" />
        <circle cx="76" cy="60" r="7" />
        <circle cx="60" cy="76" r="7" />
        <circle cx="44" cy="60" r="7" />
      </g>
      <circle cx="60" cy="60" r="3.2" fill={accent} opacity="0.75" />
    </pattern>
  ),
  // Modak Mandala (Ganesh Chaturthi) — a modak dumpling nested in a mandala ring.
  'modak-mandala': (line, accent) => (
    <pattern id="motif-modak-mandala" width="110" height="110" patternUnits="userSpaceOnUse">
      <circle cx="55" cy="55" r="34" fill="none" stroke={line} strokeWidth="1" strokeDasharray="1.5 5" />
      <path
        d="M55 38 Q70 44 70 60 Q70 74 55 78 Q40 74 40 60 Q40 44 55 38 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.3"
      />
      <path d="M55 38 L55 30" stroke={accent} strokeWidth="1.3" />
    </pattern>
  ),
  // Royal Durbar (Ganesh Chaturthi) — a small crown flanked by paired flame accents.
  'royal-durbar': (line, accent) => (
    <pattern id="motif-royal-durbar" width="130" height="130" patternUnits="userSpaceOnUse">
      <path d="M55 40 L65 22 L75 40 Z" fill="none" stroke={line} strokeWidth="1.3" />
      <line x1="55" y1="40" x2="75" y2="40" stroke={line} strokeWidth="1.3" />
      {[46, 84].map((x) => (
        <path
          key={x}
          d={`M${x} 60 Q${x - 4} 50 ${x} 42 Q${x + 4} 50 ${x} 60 Z`}
          fill={accent}
          opacity="0.75"
        />
      ))}
      <path d="M30 90 Q65 78 100 90" fill="none" stroke={line} strokeWidth="1" opacity="0.7" />
    </pattern>
  ),
  // Celestial Om (Satsang) — an Om arc adrift among stars and a crescent.
  'celestial-om': (line, accent) => (
    <pattern id="motif-celestial-om" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M30 78 A20 20 0 1 1 30 18" fill="none" stroke={line} strokeWidth="1.3" />
      <circle cx="70" cy="22" r="2.4" fill={accent} />
      <circle cx="82" cy="42" r="1.6" fill={accent} opacity="0.8" />
      <circle cx="66" cy="58" r="1.8" fill={accent} opacity="0.7" />
      <path d="M74 76 A10 10 0 1 0 84 86" fill="none" stroke={accent} strokeWidth="1.2" />
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
