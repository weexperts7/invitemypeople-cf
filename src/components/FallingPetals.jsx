import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

const PETAL_COUNT = 18
const DEFAULT_PETAL_COLORS = [
  '#f6e2df', // blush
  '#e8bfba', // blush deep
  '#efd9d4',
  '#f0e2c8', // champagne
  '#e7cdc8',
  '#ddc186', // gold soft (sparingly)
]

/**
 * A soft, continuous drift of petals across the screen.
 *
 * Driven entirely by CSS keyframes (not JS) so it stays smooth no matter how
 * long the page is open, and it is aligned to the same max-width column as the
 * app shell so petals fall *inside* the phone frame on desktop. Petal colors
 * are drawn from the active template's palette so the effect reads as part
 * of that theme rather than always the same blush-and-gold mix.
 */
export default function FallingPetals({ palette }) {
  const reduceMotion = useReducedMotion()

  const petalColors = palette
    ? [
        palette.blush,
        palette.blushDeep,
        palette.champagne,
        palette.champagneDeep,
        palette.rose,
        palette.goldSoft,
      ].filter(Boolean)
    : DEFAULT_PETAL_COLORS

  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 9,
        color: petalColors[i % petalColors.length],
        fallDuration: 12 + Math.random() * 10,
        swayDuration: 3.2 + Math.random() * 2.8,
        swayDistance: 14 + Math.random() * 26,
        // negative delay => petals are already mid-fall on first paint
        delay: -Math.random() * 22,
        spin: 160 + Math.random() * 380,
        opacity: 0.3 + Math.random() * 0.3,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette],
  )

  if (reduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] flex justify-center"
    >
      <div className="relative w-full max-w-md overflow-hidden">
        {petals.map((p) => (
          <span
            key={p.id}
            className="petal-fall"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.fallDuration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            <span
              className="petal"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.opacity,
                animationDuration: `${p.swayDuration}s`,
                '--sway': `${p.swayDistance}px`,
                '--spin': `${p.spin}deg`,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
