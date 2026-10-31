// The landing page's "real, high-fidelity miniature preview" of a template —
// not a cartoon standing in for the design, but the actual artwork a guest
// will see once they open the invitation, simply scaled down (see
// wedding/posterRegistry.js), so the card is never lying about what the
// template looks like.
//
// `template.cardImage` (see templatesData.js) opts a template out of that
// poster into a straight photo instead — see the early return below for why.
import PosterFrame from './wedding/PosterFrame'
import { getWeddingPoster } from './wedding/posterRegistry'
import { coupleNameTier } from '../utils/coupleNameFit'

const COUPLE_NAME_SIZES = [
  'text-3xl sm:text-4xl',
  'text-2xl sm:text-3xl',
  'text-xl sm:text-2xl',
  'text-lg sm:text-xl',
]

export default function TemplateShowcase({ template, className = '' }) {
  const { palette, fonts, greeting, name, couple, cardImage } = template

  // A handful of bespoke templates (Mahogany Seal's 3D Pixar-style
  // caricature, so far) are defined by something their opening screen
  // doesn't show — here, a real, animated caricature of the couple.
  // `cardImage` opts a template into showing that photo directly instead —
  // still "the same code the live preview renders" in spirit, just the
  // couple's caricature portrait rather than a poster.
  if (cardImage?.src) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden ${className}`}
        role="img"
        aria-label={`${name} template preview`}
      >
        <img
          src={cardImage.src}
          alt={cardImage.alt || `${name} template preview`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-6 pb-6 pt-14 text-center">
          {greeting?.line && (
            <p className="line-clamp-2 text-[9px] font-medium uppercase tracking-[0.28em] text-white/70">
              {greeting.line}
            </p>
          )}
          <p
            className={`${COUPLE_NAME_SIZES[coupleNameTier(couple?.names ?? 'Aarav & Diya')]} leading-none whitespace-nowrap`}
            style={{ color: palette.rose, fontFamily: fonts?.script ?? '"Great Vibes", cursive' }}
          >
            {couple?.names ?? 'Aarav & Diya'}
          </p>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/90"
            style={{ fontFamily: fonts?.serif ?? '"Cormorant Garamond", serif' }}
          >
            {name}
          </p>
        </div>
      </div>
    )
  }

  const Poster = getWeddingPoster(template.layout)
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      role="img"
      aria-label={`${name} template preview`}
    >
      <PosterFrame>
        <Poster template={template} />
      </PosterFrame>
    </div>
  )
}
