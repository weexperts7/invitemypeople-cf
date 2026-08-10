import { useEffect } from 'react'
import { Crown } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import { FrameCorners } from '../../TemplateFrame'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import GaneshRsvpForm from '../GaneshRsvpForm'
import DurbarPhotoHero from './DurbarPhotoHero'
import GaneshMomentsGallery from './GaneshMomentsGallery'
import MuhuratScroll from './MuhuratScroll'

// The "Photographic Royal Durbar" archetype — the one Ganesh Chaturthi
// template built around real photography rather than icon-based
// illustration: a full-bleed festival photograph opens the page (in place
// of a circular idol medallion or a curtain reveal), followed by a
// horizontally scrollable "Sacred Moments" photo gallery, and the puja
// muhurat presented as an unrolling parchment scroll rather than a step
// list or card grid — the structural differentiator from
// MarigoldMandapExperience and GoldenTrunkBlessingExperience.
export default function RoyalDurbarDarshanExperience({ template, invitationSlug: slugOverride, onOpen }) {
  const { palette, host, event, puja, moments } = template
  const invitationSlug = slugOverride || `ganesh-${template.slug}`
  const gold = palette?.gold ?? '#b8892c'
  const rose = palette?.rose ?? '#7a1230'

  // No tap-gated reveal here (it's a straight full-bleed photo hero, unlike
  // GaneshCurtainReveal/ModakBlessingBox/TempleDoorReveal) — background
  // music (see GaneshExperience.jsx) still needs an "opened" signal to
  // start playing, so this fires it as soon as the page mounts instead.
  useEffect(() => {
    onOpen?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif="royal-durbar" palette={palette} accent={rose} />
        <FrameCorners motif="royal-durbar" palette={palette} accent={rose} className="z-20" />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Full-bleed photographic hero */}
          {/* ---------------------------------------------------------- */}
          <DurbarPhotoHero template={template} />

          {/* ---------------------------------------------------------- */}
          {/* Sacred Moments — a scrollable strip of festival photography */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 pt-14 pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
              Sacred Moments
            </h2>
            <p className="text-center text-sm text-ink-soft mb-8 max-w-xs mx-auto">
              Swipe through a glimpse of the durbar as it comes alive, ten days of devotion.
            </p>
            <GaneshMomentsGallery moments={moments} palette={palette} gold={gold} rose={rose} />
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Puja muhurat — an unrolling scroll, not a step list or card grid */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-14">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8">
              Puja Muhurat
            </h2>
            <MuhuratScroll event={event} puja={puja} palette={palette} gold={gold} rose={rose} />
          </section>

          <div className="px-6">
            <GaneshRsvpForm palette={palette} slug={invitationSlug} />
          </div>
          <WishesWall
            slug={invitationSlug}
            heading="Blessings for Bappa's Family"
            subheading="Leave a wish — Ganpati Bappa Morya 🙏"
            renderIcon={() => <Crown className="w-3.5 h-3.5" style={{ color: rose }} strokeWidth={1.6} />}
          />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex justify-center mb-3">
              <Crown className="w-4 h-4" style={{ color: gold }} strokeWidth={1.6} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Ganpati Bappa Morya &middot; With love &amp; devotion</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
