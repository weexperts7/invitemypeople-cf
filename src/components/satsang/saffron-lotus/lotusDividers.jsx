// Organic curved section divider for the Saffron Lotus Serenity layout —
// used instead of straight rules so the page reads as editorial whitespace
// rather than a stack of boxed sections.
export function LotusDivider({ color = '#c9a24b', flip = false, className = '' }) {
  return (
    <svg
      viewBox="0 0 400 32"
      preserveAspectRatio="none"
      className={`w-full h-6 ${flip ? '-scale-y-100' : ''} ${className}`}
      aria-hidden="true"
    >
      <path d="M0 16 Q100 -2 200 16 T400 16" fill="none" stroke={color} strokeWidth="1.4" opacity="0.65" />
      <circle cx="200" cy="16" r="2.6" fill={color} opacity="0.8" />
    </svg>
  )
}

// A lotus-petal silhouette expressed as an objectBoundingBox clip-path path
// (0..1 coordinate space) — clips the scratch reveal's canvas + content
// layer into a petal shape instead of a rectangle. See
// SaffronLotusPetalReveal.jsx.
export const LOTUS_PETAL_CLIP_PATH = 'M0.5,0 C0.86,0.16 0.86,0.84 0.5,1 C0.14,0.84 0.14,0.16 0.5,0 Z'
