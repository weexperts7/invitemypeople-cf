// The landing/gallery card's live miniature preview of a Ganesh Chaturthi
// template — same approach as SatsangShowcase.jsx: real palette, motif
// pattern and frame ornament, just scaled down, so the card never lies
// about what the live invitation looks like.
import CulturalMotif from './CulturalMotif'
import { FrameBanner, FrameCorners } from './TemplateFrame'
import MotifBadge from './MotifBadge'
import GaneshIdolPhoto from './GaneshIdolPhoto'

export default function GaneshShowcase({ template, className = '' }) {
  const { palette, motif, motifAccent, fonts, greeting, name, host } = template

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

        <GaneshIdolPhoto size={52} palette={palette} halo={false} className="mb-1" />

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

        <p
          className="text-[9px] font-medium uppercase tracking-[0.28em]"
          style={{ color: palette.inkSoft }}
        >
          {greeting?.line ?? name}
        </p>

        <span
          className="block h-px w-10 origin-center"
          style={{ background: palette.goldSoft }}
        />

        <p
          className="text-2xl sm:text-3xl leading-tight"
          style={{ color: palette.rose, fontFamily: '"Great Vibes", cursive' }}
        >
          {host?.familyName ?? 'Ganesh Chaturthi Invitation'}
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
