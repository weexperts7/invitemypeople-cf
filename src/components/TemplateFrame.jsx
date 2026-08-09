// The structural ornament that makes each template's "layout structure" and
// "unique thematic elements" genuinely differ, not just its color palette.
//
// Two pieces, both keyed by the same `motif` id used in templatesData.js /
// CulturalMotif.jsx, both pure vector so they render identically crisp at
// mini thumbnail size (TemplateShowcase) and full hero size (WelcomeSplash):
//
// - FrameBanner: a wide header ornament (jharokha arch, marigold garland,
//   lotus + peacock, a bare minimalist line, a gopuram silhouette, ...)
//   that sits above the greeting — this is the "header style" a user should
//   recognize a template by at a glance.
// - FrameCorners: a single corner glyph, mirrored into all four corners of
//   the invitation card, standing in for a literal "frame border" without
//   needing four hand-authored corners per template.

function Banner({ viewBox = '0 0 320 100', className, children }) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function Corner({ viewBox = '0 0 56 56', className, children }) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const BANNERS = {
  // Rajasthani Royal — jharokha palace-balcony arch with a sun-rosette crest.
  jharokha: (c) => (
    <>
      <path
        d="M40,88 L40,32 Q70,6 100,32 Q130,58 160,20 Q190,58 220,32 Q250,6 280,32 L280,88"
        fill="none"
        stroke={c.gold}
        strokeWidth="2"
      />
      <rect x="34" y="24" width="12" height="10" rx="2" fill={c.rose} />
      <rect x="274" y="24" width="12" height="10" rx="2" fill={c.rose} />
      <circle cx="160" cy="20" r="10" fill="none" stroke={c.gold} strokeWidth="1.4" />
      <circle cx="160" cy="20" r="3.2" fill={c.rose} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1={160 + Math.cos((deg * Math.PI) / 180) * 12}
          y1={20 + Math.sin((deg * Math.PI) / 180) * 12}
          x2={160 + Math.cos((deg * Math.PI) / 180) * 17}
          y2={20 + Math.sin((deg * Math.PI) / 180) * 17}
          stroke={c.goldSoft}
          strokeWidth="1.2"
        />
      ))}
      <line x1="24" y1="92" x2="296" y2="92" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Royal Festive Vibrant — a jewel medallion flanked by rani-pink paisleys.
  'rani-mandala': (c, accent) => (
    <>
      <path d="M40,88 Q100,32 160,32 Q220,32 280,88" fill="none" stroke={c.gold} strokeWidth="2" />
      <circle cx="160" cy="26" r="13" fill={c.blushDeep} stroke={c.gold} strokeWidth="1.6" />
      <circle cx="160" cy="26" r="5" fill={accent} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={160 + Math.cos((deg * Math.PI) / 180) * 13}
          y1={26 + Math.sin((deg * Math.PI) / 180) * 13}
          x2={160 + Math.cos((deg * Math.PI) / 180) * 19}
          y2={26 + Math.sin((deg * Math.PI) / 180) * 19}
          stroke={c.goldSoft}
          strokeWidth="1.2"
        />
      ))}
      <path d="M90,58 Q70,50 66,30 Q90,34 96,54 Q94,60 90,58 Z" fill={c.blushDeep} opacity="0.85" />
      <path d="M230,58 Q250,50 254,30 Q230,34 224,54 Q226,60 230,58 Z" fill={c.blushDeep} opacity="0.85" />
      <line x1="24" y1="92" x2="296" y2="92" stroke={c.goldSoft} strokeWidth="1" opacity="0.85" />
    </>
  ),
  // Gujarati Traditional — a strung marigold garland with tasseled ends.
  'swastik-mandala': (c) => (
    <>
      <path
        d="M22,22 Q160,72 298,22"
        fill="none"
        stroke={c.gold}
        strokeWidth="1.6"
        opacity="0.85"
      />
      {[
        [40, 36],
        [76, 48],
        [112, 56],
        [148, 60],
        [160, 61],
        [172, 60],
        [208, 56],
        [244, 48],
        [280, 36],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="7" fill={c.goldSoft} stroke={c.gold} strokeWidth="1" />
          <circle cx={x} cy={y} r="2.4" fill={c.rose} />
        </g>
      ))}
      {[22, 298].map((x) => (
        <g key={x}>
          <line x1={x} y1="20" x2={x - 4} y2="34" stroke={c.rose} strokeWidth="1.4" />
          <line x1={x} y1="20" x2={x} y2="36" stroke={c.rose} strokeWidth="1.4" />
          <line x1={x} y1="20" x2={x + 4} y2="34" stroke={c.rose} strokeWidth="1.4" />
        </g>
      ))}
      {Array.from({ length: 13 }, (_, i) => 40 + i * 20).map((x) => (
        <circle
          key={x}
          cx={x}
          cy="90"
          r={x % 40 === 0 ? 2 : 1.4}
          fill={x % 40 === 0 ? c.rose : c.gold}
          opacity="0.85"
        />
      ))}
    </>
  ),
  // Vrindavan Divine — a lotus halo flanked by two peacock-feather eyes.
  'lotus-peacock': (c, accent) => (
    <>
      <path d="M160,78 Q144,46 160,14 Q176,46 160,78 Z" fill={c.blush} stroke={c.rose} strokeWidth="1.2" />
      <path d="M160,78 Q132,58 118,28 Q144,42 160,78 Z" fill="none" stroke={c.rose} strokeWidth="1.1" />
      <path d="M160,78 Q188,58 202,28 Q176,42 160,78 Z" fill="none" stroke={c.rose} strokeWidth="1.1" />
      <path d="M160,78 Q108,66 84,44 Q124,50 160,78 Z" fill="none" stroke={accent} strokeWidth="1" opacity="0.8" />
      <path d="M160,78 Q212,66 236,44 Q196,50 160,78 Z" fill="none" stroke={accent} strokeWidth="1" opacity="0.8" />
      {[64, 256].map((x) => (
        <g key={x}>
          <circle cx={x} cy="40" r="13" fill="none" stroke={accent} strokeWidth="1.4" />
          <circle cx={x} cy="40" r="6.5" fill="none" stroke={accent} strokeWidth="1" />
          <circle cx={x} cy="40" r="2.4" fill={accent} opacity="0.75" />
        </g>
      ))}
      <line x1="30" y1="90" x2="290" y2="90" stroke={c.goldSoft} strokeWidth="1" opacity="0.7" />
    </>
  ),
  // Western Minimalist — a single restrained line-art sprig, mostly whitespace.
  'floral-line-art': (c) => (
    <>
      <path d="M30,54 Q95,26 160,52 Q225,78 290,50" fill="none" stroke={c.gold} strokeWidth="0.9" opacity="0.75" />
      {[
        [95, 30],
        [160, 51],
        [225, 74],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3" fill="none" stroke={c.gold} strokeWidth="0.9" />
      ))}
      <path d="M60,50 Q72,42 82,48" fill="none" stroke={c.gold} strokeWidth="0.8" opacity="0.6" />
      <path d="M258,58 Q246,50 236,56" fill="none" stroke={c.gold} strokeWidth="0.8" opacity="0.6" />
    </>
  ),
  // South Indian Temple Gold — a stepped gopuram silhouette with a kalasha finial.
  'temple-gold': (c, accent) => (
    <>
      <circle cx="160" cy="18" r="3.4" fill={c.gold} />
      <line x1="160" y1="21" x2="160" y2="28" stroke={c.gold} strokeWidth="1.6" />
      <path
        d="M108,88 L108,70 L122,70 L122,58 L136,58 L136,46 L150,46 L150,28 L170,28 L170,46 L184,46 L184,58 L198,58 L198,70 L212,70 L212,88"
        fill="none"
        stroke={c.gold}
        strokeWidth="2"
      />
      <path d="M150,46 Q160,60 170,46" fill="none" stroke={accent} strokeWidth="1.2" />
      <line x1="20" y1="92" x2="300" y2="92" stroke={c.gold} strokeWidth="1.4" />
      <line x1="20" y1="96" x2="300" y2="96" stroke={c.goldSoft} strokeWidth="1" />
    </>
  ),
  // Punjabi Phulkari — a nested-diamond Bagh garland crowned by a royal
  // gold crest medallion, linked throughout by a fine filigree thread.
  phulkari: (c, accent) => (
    <>
      {[30, 74, 118, 202, 246, 290].map((x) => (
        <g key={x}>
          <path d={`M${x - 16},50 L${x},32 L${x + 16},50 L${x},68 Z`} fill="none" stroke={c.gold} strokeWidth="1.4" />
          <path
            d={`M${x - 8},50 L${x},41 L${x + 8},50 L${x},59 Z`}
            fill="none"
            stroke={c.goldSoft}
            strokeWidth="0.9"
            opacity="0.85"
          />
          <circle cx={x} cy="50" r="2" fill={accent ?? c.rose} />
        </g>
      ))}
      <path
        d="M46,50 L58,50 M90,50 L102,50 M234,50 L222,50 M278,50 L266,50"
        stroke={c.goldSoft}
        strokeWidth="1"
        opacity="0.75"
      />
      <path d="M118,58 Q140,38 160,42 Q180,38 202,58" fill="none" stroke={c.gold} strokeWidth="1.3" />
      <circle cx="160" cy="22" r="12" fill="none" stroke={c.gold} strokeWidth="1.6" />
      <circle cx="160" cy="22" r="6" fill="none" stroke={accent ?? c.rose} strokeWidth="1.2" />
      <circle cx="160" cy="22" r="2.4" fill={accent ?? c.rose} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1={160 + Math.cos((deg * Math.PI) / 180) * 12}
          y1={22 + Math.sin((deg * Math.PI) / 180) * 12}
          x2={160 + Math.cos((deg * Math.PI) / 180) * 17}
          y2={22 + Math.sin((deg * Math.PI) / 180) * 17}
          stroke={c.goldSoft}
          strokeWidth="1.1"
        />
      ))}
      <line x1="20" y1="88" x2="300" y2="88" stroke={c.goldSoft} strokeWidth="1" opacity="0.85" />
    </>
  ),
  // Royal Mughal — an interlocking jaali lattice band.
  'mughal-jaali': (c, accent) => (
    <>
      {[60, 130, 200, 270].map((x) => (
        <g key={x}>
          <path d={`M${x - 30},50 L${x},22 L${x + 30},50 L${x},78 Z`} fill="none" stroke={c.gold} strokeWidth="1.3" />
          <circle cx={x} cy="50" r="10" fill="none" stroke={accent ?? c.goldSoft} strokeWidth="1" />
        </g>
      ))}
      <line x1="18" y1="92" x2="302" y2="92" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Bengali Traditional — an alpona rice-paste swirl arc.
  alpona: (c) => (
    <>
      <path d="M40,70 Q40,26 160,26 Q280,26 280,70" fill="none" stroke={c.rose} strokeWidth="1.6" />
      <circle cx="160" cy="16" r="3.4" fill={c.rose} />
      <path d="M20,84 Q160,112 300,84" fill="none" stroke={c.gold} strokeWidth="1" opacity="0.8" />
      {[70, 160, 250].map((x) => (
        <circle key={x} cx={x} cy="70" r="2" fill={c.gold} />
      ))}
    </>
  ),
  // Midnight Noir — a radiating Gatsby-era sunburst fan over a stepped chevron base.
  'art-deco': (c, accent) => (
    <>
      {[-60, -40, -20, 0, 20, 40, 60].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return (
          <line
            key={deg}
            x1="160"
            y1="22"
            x2={160 + Math.sin(rad) * 66}
            y2={22 + Math.cos(rad) * 50}
            stroke={c.gold}
            strokeWidth="1.2"
            opacity="0.85"
          />
        )
      })}
      <circle cx="160" cy="22" r="5" fill="none" stroke={accent} strokeWidth="1.4" />
      <circle cx="160" cy="22" r="2" fill={accent} />
      <path
        d="M40,90 L68,80 L96,90 L124,80 L152,90 L180,80 L208,90 L236,80 L264,90"
        fill="none"
        stroke={c.gold}
        strokeWidth="1.6"
      />
    </>
  ),
  // Regal Onyx — a heraldic shield crest flanked by laurel sprigs.
  'heraldic-crest': (c, accent) => (
    <>
      <path
        d="M160,14 L184,24 L184,52 Q184,72 160,82 Q136,72 136,52 L136,24 Z"
        fill="none"
        stroke={c.gold}
        strokeWidth="2"
      />
      <circle cx="160" cy="46" r="8" fill="none" stroke={accent} strokeWidth="1.2" />
      <circle cx="160" cy="46" r="2.6" fill={accent} />
      <path d="M136,30 Q112,38 100,58" fill="none" stroke={c.gold} strokeWidth="1.2" />
      <path d="M184,30 Q208,38 220,58" fill="none" stroke={c.gold} strokeWidth="1.2" />
      {[0, 1, 2].map((i) => (
        <ellipse
          key={`l${i}`}
          cx={112 - i * 8}
          cy={42 + i * 7}
          rx="5"
          ry="2.4"
          fill="none"
          stroke={c.gold}
          strokeWidth="1"
          transform={`rotate(${-30 - i * 10} ${112 - i * 8} ${42 + i * 7})`}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <ellipse
          key={`r${i}`}
          cx={208 + i * 8}
          cy={42 + i * 7}
          rx="5"
          ry="2.4"
          fill="none"
          stroke={c.gold}
          strokeWidth="1"
          transform={`rotate(${30 + i * 10} ${208 + i * 8} ${42 + i * 7})`}
        />
      ))}
      <line x1="40" y1="92" x2="280" y2="92" stroke={c.goldSoft} strokeWidth="1" opacity="0.7" />
    </>
  ),
  // The Divine Peacock (Satsang) — a spread of three peacock-feather eyes.
  'peacock-feather': (c, accent) => (
    <>
      {[100, 160, 220].map((x, i) => (
        <g key={x}>
          <path d={`M${x},70 Q${x - 10},44 ${x},18`} fill="none" stroke={c.gold} strokeWidth="1.3" />
          <circle cx={x} cy="14" r={i === 1 ? 12 : 9} fill="none" stroke={accent} strokeWidth="1.4" />
          <circle cx={x} cy="14" r={i === 1 ? 5 : 3.6} fill="none" stroke={accent} strokeWidth="1" />
          <circle cx={x} cy="14" r="1.8" fill={accent} opacity="0.75" />
        </g>
      ))}
      <line x1="24" y1="88" x2="296" y2="88" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Saffron Blossom (Satsang) — a wide open lotus bloom at center.
  'saffron-lotus': (c, accent) => (
    <>
      <path d="M160,86 Q144,56 160,20 Q176,56 160,86 Z" fill={c.blush} stroke={c.rose} strokeWidth="1.2" />
      <path d="M160,86 Q130,68 116,34 Q144,46 160,86 Z" fill="none" stroke={c.rose} strokeWidth="1.1" />
      <path d="M160,86 Q190,68 204,34 Q176,46 160,86 Z" fill="none" stroke={c.rose} strokeWidth="1.1" />
      <path d="M160,86 Q104,74 84,50 Q126,54 160,86 Z" fill="none" stroke={accent} strokeWidth="1" opacity="0.85" />
      <path d="M160,86 Q216,74 236,50 Q194,54 160,86 Z" fill="none" stroke={accent} strokeWidth="1" opacity="0.85" />
      <circle cx="160" cy="84" r="3.4" fill={accent} />
      <line x1="30" y1="94" x2="290" y2="94" stroke={c.goldSoft} strokeWidth="1" opacity="0.7" />
    </>
  ),
  // Radiant Sunrise (Satsang) — a rising sun disc with radiating rays.
  'sunrise-rays': (c, accent) => (
    <>
      <circle cx="160" cy="46" r="16" fill="none" stroke={accent} strokeWidth="1.6" />
      <circle cx="160" cy="46" r="8" fill={accent} opacity="0.25" />
      {[...Array(9)].map((_, i) => {
        const rad = ((-150 + i * 22.5) * Math.PI) / 180
        const x1 = 160 + Math.cos(rad) * 22
        const y1 = 46 + Math.sin(rad) * 22
        const x2 = 160 + Math.cos(rad) * 34
        const y2 = 46 + Math.sin(rad) * 34
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.gold} strokeWidth="1.4" />
      })}
      <line x1="24" y1="88" x2="296" y2="88" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Tulsi Serenity (Satsang) — a tulsi plant with tiers of paired leaves.
  'tulsi-leaf': (c) => (
    <>
      <path d="M160,84 L160,30" stroke={c.gold} strokeWidth="1.4" fill="none" />
      {[0, 1, 2, 3].map((i) => {
        const y = 76 - i * 14
        const spread = 20 + i * 4
        return (
          <g key={i}>
            <path d={`M160,${y} Q${160 - spread},${y - 10} ${160 - spread + 6},${y - 22}`} fill="none" stroke={c.rose} strokeWidth="1.1" />
            <path d={`M160,${y} Q${160 + spread},${y - 10} ${160 + spread - 6},${y - 22}`} fill="none" stroke={c.rose} strokeWidth="1.1" />
          </g>
        )
      })}
      <line x1="30" y1="90" x2="290" y2="90" stroke={c.goldSoft} strokeWidth="1" opacity="0.75" />
    </>
  ),
  // Diya Ganga (Satsang) — three lit oil-lamps over a gentle river wave.
  'diya-wave': (c, accent) => (
    <>
      {[120, 160, 200].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 11},58 Q${x},44 ${x + 11},58 Z`} fill="none" stroke={c.gold} strokeWidth="1.4" />
          <path d={`M${x},44 Q${x - 4},34 ${x},24 Q${x + 4},34 ${x},44 Z`} fill={accent} opacity={i === 1 ? 0.9 : 0.6} />
        </g>
      ))}
      <path d="M30,80 Q95,64 160,80 Q225,96 290,80" fill="none" stroke={c.goldSoft} strokeWidth="1.2" opacity="0.85" />
    </>
  ),
  // Celestial Om (Satsang) — an Om arc adrift among stars and a crescent.
  'celestial-om': (c, accent) => (
    <>
      <path d="M140,70 A22 22 0 1 1 140,26" fill="none" stroke={c.gold} strokeWidth="1.6" />
      <circle cx="190" cy="24" r="2.6" fill={accent} />
      <circle cx="210" cy="42" r="1.8" fill={accent} opacity="0.8" />
      <circle cx="180" cy="52" r="2" fill={accent} opacity="0.7" />
      <path d="M225,60 A12 12 0 1 0 240,74" fill="none" stroke={accent} strokeWidth="1.3" />
      <line x1="24" y1="90" x2="296" y2="90" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Marigold Garland (Ganesh Chaturthi) — a strung marigold garland with a modak crest.
  'marigold-garland': (c, accent) => (
    <>
      <path d="M22,20 Q160,66 298,20" fill="none" stroke={c.gold} strokeWidth="1.6" opacity="0.85" />
      {[
        [40, 32],
        [76, 44],
        [112, 52],
        [148, 56],
        [172, 56],
        [208, 52],
        [244, 44],
        [280, 32],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6.5" fill={c.goldSoft} stroke={c.gold} strokeWidth="1" />
          <circle cx={x} cy={y} r="2.2" fill={c.rose} />
        </g>
      ))}
      <path d="M144,18 Q160,4 176,18 Q168,34 160,40 Q152,34 144,18 Z" fill={accent} opacity="0.9" />
      <line x1="24" y1="90" x2="296" y2="90" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Modak Mandala (Ganesh Chaturthi) — a modak dome cradled in a mandala ring.
  'modak-mandala': (c, accent) => (
    <>
      <circle cx="160" cy="46" r="30" fill="none" stroke={c.gold} strokeWidth="1" strokeDasharray="1.5 5" />
      <path
        d="M160,24 Q182,32 182,52 Q182,68 160,74 Q138,68 138,52 Q138,32 160,24 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.4"
      />
      <path d="M160,24 L160,14" stroke={accent} strokeWidth="1.4" />
      <line x1="24" y1="90" x2="296" y2="90" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
  // Royal Durbar (Ganesh Chaturthi) — a crowned jharokha arch flanked by peacock-feather flourishes.
  'royal-durbar': (c, accent) => (
    <>
      <path
        d="M30,88 L30,40 Q70,10 160,10 Q250,10 290,40 L290,88"
        fill="none"
        stroke={c.gold}
        strokeWidth="2"
      />
      <path d="M150,22 L160,4 L170,22 Z" fill={c.gold} opacity="0.9" />
      <circle cx="160" cy="18" r="2.6" fill={accent} />
      <g>
        <path d="M60,60 Q36,34 30,12" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.8" />
        <circle cx="30" cy="10" r="8" fill="none" stroke={accent} strokeWidth="1.3" />
        <circle cx="30" cy="10" r="2.8" fill={accent} opacity="0.75" />
      </g>
      <g>
        <path d="M260,60 Q284,34 290,12" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.8" />
        <circle cx="290" cy="10" r="8" fill="none" stroke={accent} strokeWidth="1.3" />
        <circle cx="290" cy="10" r="2.8" fill={accent} opacity="0.75" />
      </g>
      <line x1="20" y1="92" x2="300" y2="92" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
    </>
  ),
}

const CORNERS = {
  'rani-mandala': (c, accent) => (
    <>
      <path d="M6,52 Q6,20 34,10" fill="none" stroke={c.gold} strokeWidth="1.6" />
      <path d="M18,20 Q10,14 12,4 Q22,6 24,16 Q22,20 18,20 Z" fill={c.blushDeep} opacity="0.85" />
      <circle cx="12" cy="14" r="2.4" fill={accent} />
    </>
  ),
  jharokha: (c) => (
    <>
      <path d="M6,52 L6,18 Q6,6 18,6 L52,6" fill="none" stroke={c.gold} strokeWidth="2" />
      <path d="M13,52 L13,22 Q13,13 22,13 L52,13" fill="none" stroke={c.goldSoft} strokeWidth="1" opacity="0.8" />
      <circle cx="16" cy="16" r="4" fill={c.rose} />
    </>
  ),
  'swastik-mandala': (c) => (
    <>
      <path d="M6,50 Q6,20 34,10" fill="none" stroke={c.gold} strokeWidth="1.4" opacity="0.85" />
      <circle cx="12" cy="14" r="6" fill={c.goldSoft} stroke={c.gold} strokeWidth="1" />
      <circle cx="12" cy="14" r="2" fill={c.rose} />
      <circle cx="26" cy="7" r="4" fill={c.goldSoft} stroke={c.gold} strokeWidth="1" />
      <circle cx="26" cy="7" r="1.4" fill={c.rose} />
    </>
  ),
  'lotus-peacock': (c, accent) => (
    <>
      <path d="M6,52 Q6,26 30,14 Q16,32 6,52 Z" fill={c.blush} stroke={c.rose} strokeWidth="1" />
      <circle cx="14" cy="12" r="6" fill="none" stroke={accent} strokeWidth="1.2" />
      <circle cx="14" cy="12" r="2" fill={accent} opacity="0.7" />
    </>
  ),
  'floral-line-art': (c) => (
    <path d="M8,44 Q14,22 36,10" fill="none" stroke={c.gold} strokeWidth="0.8" opacity="0.55" />
  ),
  'temple-gold': (c) => (
    <path
      d="M4,52 L4,30 L16,30 L16,18 L28,18 L28,4 L52,4"
      fill="none"
      stroke={c.gold}
      strokeWidth="2"
    />
  ),
  phulkari: (c, accent) => (
    <>
      <path d="M6,52 Q6,24 34,12" fill="none" stroke={c.gold} strokeWidth="1.3" opacity="0.85" />
      <path d="M6,40 L20,26 L34,40 L20,54 Z" fill="none" stroke={c.gold} strokeWidth="1.3" />
      <path d="M12,40 L20,32 L28,40 L20,48 Z" fill="none" stroke={c.goldSoft} strokeWidth="0.9" opacity="0.85" />
      <circle cx="20" cy="40" r="2" fill={accent ?? c.rose} />
    </>
  ),
  'mughal-jaali': (c, accent) => (
    <>
      <path d="M6,52 L6,20 Q6,6 20,6 L52,6" fill="none" stroke={c.gold} strokeWidth="1.6" />
      <circle cx="18" cy="18" r="7" fill="none" stroke={accent ?? c.goldSoft} strokeWidth="1" />
    </>
  ),
  alpona: (c) => (
    <path d="M4,40 Q4,10 34,6" fill="none" stroke={c.rose} strokeWidth="1.4" />
  ),
  'art-deco': (c, accent) => (
    <>
      <path d="M4,52 L4,36 L20,36 L20,20 L36,20 L36,4 L52,4" fill="none" stroke={c.gold} strokeWidth="1.8" />
      <circle cx="20" cy="20" r="2.4" fill={accent} />
    </>
  ),
  'heraldic-crest': (c, accent) => (
    <>
      <path d="M6,50 L6,14 Q6,6 14,6 L50,6" fill="none" stroke={c.gold} strokeWidth="1.6" />
      <ellipse cx="14" cy="14" rx="5" ry="2.6" fill="none" stroke={accent} strokeWidth="1" transform="rotate(-40 14 14)" />
    </>
  ),
  'peacock-feather': (c, accent) => (
    <>
      <path d="M6,52 Q6,26 24,16" fill="none" stroke={c.gold} strokeWidth="1.3" />
      <circle cx="14" cy="14" r="7" fill="none" stroke={accent} strokeWidth="1.2" />
      <circle cx="14" cy="14" r="2.4" fill={accent} opacity="0.75" />
    </>
  ),
  'saffron-lotus': (c) => (
    <path d="M6,50 Q6,22 34,12 Q18,30 6,50 Z" fill={c.blush} stroke={c.rose} strokeWidth="1" />
  ),
  'sunrise-rays': (c, accent) => (
    <>
      <circle cx="16" cy="22" r="6" fill="none" stroke={accent} strokeWidth="1.3" />
      <line x1="16" y1="10" x2="16" y2="4" stroke={c.gold} strokeWidth="1.2" />
      <line x1="26" y1="16" x2="32" y2="12" stroke={c.gold} strokeWidth="1.2" />
    </>
  ),
  'tulsi-leaf': (c) => (
    <path d="M14,50 L14,10 M14,30 Q24,26 28,16 M14,30 Q4,26 2,18" fill="none" stroke={c.rose} strokeWidth="1.1" />
  ),
  'diya-wave': (c, accent) => (
    <>
      <path d="M8,36 Q16,28 24,36 Z" fill="none" stroke={c.gold} strokeWidth="1.3" />
      <path d="M16,28 Q13,22 16,16 Q19,22 16,28 Z" fill={accent} opacity="0.8" />
    </>
  ),
  'celestial-om': (c, accent) => (
    <>
      <path d="M10,40 A10 10 0 1 1 10,20" fill="none" stroke={c.gold} strokeWidth="1.3" />
      <circle cx="30" cy="12" r="2" fill={accent} />
      <circle cx="40" cy="20" r="1.4" fill={accent} opacity="0.75" />
    </>
  ),
  'marigold-garland': (c, accent) => (
    <>
      <path d="M6,52 Q6,24 34,12" fill="none" stroke={c.gold} strokeWidth="1.4" opacity="0.85" />
      <circle cx="12" cy="16" r="6" fill={c.goldSoft} stroke={c.gold} strokeWidth="1" />
      <circle cx="12" cy="16" r="2" fill={accent} />
    </>
  ),
  'modak-mandala': (c, accent) => (
    <>
      <path d="M6,50 Q6,22 34,12" fill="none" stroke={c.gold} strokeWidth="1.3" opacity="0.85" />
      <path
        d="M14,16 Q22,20 22,28 Q22,34 14,37 Q6,34 6,28 Q6,20 14,16 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.2"
      />
    </>
  ),
  'royal-durbar': (c, accent) => (
    <>
      <path d="M6,52 L6,20 Q6,6 20,6 L52,6" fill="none" stroke={c.gold} strokeWidth="1.8" />
      <path d="M18,10 L24,2 L30,10 Z" fill={c.gold} opacity="0.85" />
      <circle cx="14" cy="14" r="5" fill="none" stroke={accent} strokeWidth="1.2" />
      <circle cx="14" cy="14" r="1.8" fill={accent} opacity="0.75" />
    </>
  ),
}

const DEFAULT_C = {
  gold: '#c9a24b',
  goldSoft: '#ddc186',
  rose: '#c98f8a',
  blush: '#f6e2df',
}

function resolveColors(palette) {
  return palette ? { ...DEFAULT_C, ...palette } : DEFAULT_C
}

export function FrameBanner({ motif, palette, accent, className = '' }) {
  const render = BANNERS[motif]
  if (!render) return null
  const c = resolveColors(palette)
  return (
    <Banner className={className}>{render(c, accent ?? c.goldSoft)}</Banner>
  )
}

// Renders the same corner glyph in all four corners via CSS mirroring, so a
// template only has to define one quarter of its "frame border".
export function FrameCorners({ motif, palette, accent, className = '', size = 'w-12 h-12 sm:w-14 sm:h-14' }) {
  const render = CORNERS[motif]
  if (!render) return null
  const c = resolveColors(palette)
  const glyph = render(c, accent ?? c.goldSoft)

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Corner className={`absolute left-2 top-2 ${size} opacity-70`}>{glyph}</Corner>
      <Corner className={`absolute right-2 top-2 ${size} opacity-70 -scale-x-100`}>{glyph}</Corner>
      <Corner className={`absolute left-2 bottom-2 ${size} opacity-70 -scale-y-100`}>{glyph}</Corner>
      <Corner className={`absolute right-2 bottom-2 ${size} opacity-70 -scale-x-100 -scale-y-100`}>
        {glyph}
      </Corner>
    </div>
  )
}
