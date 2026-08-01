import { PeacockCornerMedallion } from './peacockMotifs'

// The "physical luxury invitation card" border — a continuous double gold
// ring (drawn with two absolutely-positioned rounded-border layers, since
// the card's height is content-driven and a single SVG rect can't stretch
// cleanly) plus a peacock-eye medallion mirrored into all 4 corners.
export default function RoyalPeacockFrame({ palette }) {
  const gold = palette?.gold ?? '#c9a24b'
  const accent = palette?.rose ?? '#0f6e5c'
  const rose = palette?.champagneDeep ?? '#a9cdb0'

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <div className="absolute inset-3 rounded-[2rem] border-2" style={{ borderColor: gold }} />
      <div
        className="absolute inset-[18px] rounded-[1.7rem] border"
        style={{ borderColor: accent, opacity: 0.5 }}
      />
      {[
        'left-2 top-2',
        'right-2 top-2 -scale-x-100',
        'left-2 bottom-2 -scale-y-100',
        'right-2 bottom-2 -scale-x-100 -scale-y-100',
      ].map((pos) => (
        <div key={pos} className={`absolute w-16 h-16 ${pos}`}>
          <PeacockCornerMedallion gold={gold} accent={accent} rose={rose} />
        </div>
      ))}
    </div>
  )
}
