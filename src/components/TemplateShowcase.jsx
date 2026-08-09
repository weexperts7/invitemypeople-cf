// The landing page's "real, high-fidelity miniature preview" of a template —
// not a cartoon standing in for the design, but the actual palette, motif
// pattern, frame ornament and typography a guest will see once they open the
// invitation, simply scaled down. Every piece here (CulturalMotif,
// FrameBanner/FrameCorners, the palette itself) is the same code the live
// InvitationExperience renders at full size, so the card is never lying
// about what the template looks like.
import CulturalMotif from './CulturalMotif'
import { FrameBanner, FrameCorners } from './TemplateFrame'
import MotifBadge from './MotifBadge'
import { coupleNameTier } from '../utils/coupleNameFit'

const COUPLE_NAME_SIZES = [
  'text-3xl sm:text-4xl',
  'text-2xl sm:text-3xl',
  'text-xl sm:text-2xl',
  'text-lg sm:text-xl',
]

export default function TemplateShowcase({ template, className = '' }) {
  const { palette, motif, motifAccent, fonts, greeting, name, couple } = template

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, ${palette.linen} 0%, ${palette.champagne} 55%, ${palette.blush} 100%)`,
      }}
      role="img"
      aria-label={`${name} template preview`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 82% 88%, ${palette.blushDeep}55, transparent 55%)`,
        }}
      />

      <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />
      <FrameCorners motif={motif} palette={palette} accent={motifAccent} size="w-9 h-9 sm:w-11 sm:h-11" />

      <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-6 py-8 text-center">
        <MotifBadge
          motif={motif}
          palette={palette}
          accent={motifAccent}
          className="absolute -z-10 top-6 left-1/2 -translate-x-1/2 w-28 h-28 opacity-30"
        />

        <FrameBanner
          motif={motif}
          palette={palette}
          accent={motifAccent}
          className="w-[85%] max-w-[220px] h-auto mb-1"
        />

        {greeting?.symbol && (
          <p className="text-lg leading-none" style={{ color: palette.gold }}>
            {greeting.symbol}
          </p>
        )}

        {/* line-clamp-2 guards this miniature card against a template whose
            greeting is a full mantra/verse rather than a short 2-3 word
            tagline (e.g. Rajasthani Royal's) — without it, the wrapped text
            grows past the card's fixed height and pushes/overflows the rest
            of the centered layout. Every other template's short one-line
            greeting is already well under 2 lines, so this is a no-op for
            them. */}
        <p
          className="text-[9px] font-medium uppercase tracking-[0.28em] line-clamp-2"
          style={{ color: palette.inkSoft }}
        >
          {greeting?.line ?? name}
        </p>

        <span
          className="block h-px w-10 origin-center"
          style={{ background: palette.goldSoft }}
        />

        <p
          className={`${COUPLE_NAME_SIZES[coupleNameTier(couple?.names ?? 'Aarav & Diya')]} leading-none whitespace-nowrap`}
          style={{ color: palette.rose, fontFamily: '"Great Vibes", cursive' }}
        >
          {couple?.names ?? 'Aarav & Diya'}
        </p>

        <p
          className="mt-1 text-[10px] uppercase tracking-[0.22em]"
          style={{ color: palette.ink, fontFamily: fonts?.serif ?? '"Cormorant Garamond", serif' }}
        >
          {name}
        </p>
      </div>
    </div>
  )
}
