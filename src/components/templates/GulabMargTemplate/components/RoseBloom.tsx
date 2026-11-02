import { useId } from 'react'

const PETAL = 'M0 -6 C34 -18 46 -60 0 -92 C-46 -60 -34 -18 0 -6 Z'
const RINGS = [
  { className: 'gm-petal--outer', scale: 1, angles: [0, 60, 120, 180, 240, 300] },
  { className: 'gm-petal--mid', scale: 0.76, angles: [30, 102, 174, 246, 318] },
  { className: 'gm-petal--inner', scale: 0.52, angles: [10, 130, 250] },
]

/**
 * One garden rose. It sits closed until a parent marks it `[data-gm-in]` (or
 * passes `open`), then opens ring by ring; the motion lives in
 * GulabMargTemplate.css. Without that stylesheet it simply draws open, which is
 * how SatsangSpotlight.jsx uses it.
 */
export default function RoseBloom({ open = false, className = '' }: { open?: boolean; className?: string }) {
  const gradient = useId()

  return (
    <svg
      viewBox="-100 -100 200 200"
      className={`gm-bloom${open ? ' gm-bloom--open' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradient} cx="0" cy="0" r="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b23a5e" />
          <stop offset="0.55" stopColor="#e27c97" />
          <stop offset="1" stopColor="#f9c3cd" />
        </radialGradient>
      </defs>
      {RINGS.map((ring, r) =>
        ring.angles.map((deg, i) => (
          <g key={`${r}-${deg}`} transform={`rotate(${deg}) scale(${ring.scale})`}>
            <path
              className={`gm-petal ${ring.className}`}
              style={{ transitionDelay: `${(2 - r) * 110 + i * 26}ms` }}
              d={PETAL}
              fill={`url(#${gradient})`}
              stroke="#c25877"
              strokeWidth="1.2"
            />
          </g>
        )),
      )}
      <circle r="8" fill="#a12f52" />
    </svg>
  )
}
