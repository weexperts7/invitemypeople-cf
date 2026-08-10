import { Flame } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import { FrameCorners } from '../../TemplateFrame'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import GaneshRsvpForm from '../GaneshRsvpForm'
import GaneshMomentsGallery from '../royal-durbar-darshan/GaneshMomentsGallery'
import TempleDoorReveal from './TempleDoorReveal'
import FestivalTimeline from './FestivalTimeline'

// The "Photographic Temple Doors" archetype — Divine Threshold, the
// category's flagship: a full-bleed festival photograph behind ornate doors
// that swing open on tap (TempleDoorReveal.jsx), followed by a day-grouped
// festival timeline (FestivalTimeline.jsx) rather than the flat muhurat
// card/step-list/scroll the other five templates use, plus a swipeable
// photo gallery reusing royal-durbar-darshan's GaneshMomentsGallery as-is.
//
// `invitationSlug` is passed down from GaneshExperience.jsx rather than
// computed here — it defaults to `ganesh-${template.slug}` for the free
// pre-built template pages, but is the real invite's own slug for a
// checkout-generated invite (see buildGaneshExperienceTemplate.js /
// GeneratedInvitePage.jsx), so RSVPs/wishes from different buyers of this
// same style never collide in one bucket.
export default function DivineThresholdExperience({ template, invitationSlug, onOpen }) {
  const { palette, event, puja, moments, host } = template
  const gold = palette?.gold ?? '#d4a017'
  const rose = palette?.rose ?? '#c1272d'

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif="marigold-garland" palette={palette} accent={rose} />
        <FrameCorners motif="marigold-garland" palette={palette} accent={rose} className="z-20" />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Full-bleed photographic hero, gated behind temple doors */}
          {/* ---------------------------------------------------------- */}
          <TempleDoorReveal template={template} onOpen={onOpen} />

          {/* ---------------------------------------------------------- */}
          {/* Festival Timeline — Day One / Every Day / Final Day */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-14">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
              The Festival Timeline
            </h2>
            <p className="text-center text-sm text-ink-soft mb-8 max-w-xs mx-auto">
              Ten days of devotion, from Bappa&rsquo;s arrival to his farewell.
            </p>
            <FestivalTimeline event={event} puja={puja} gold={gold} rose={rose} />
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Sacred Moments gallery */}
          {/* ---------------------------------------------------------- */}
          {moments?.length > 0 && (
            <section className="px-6 pb-4">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-2">
                Sacred Moments
              </h2>
              <p className="text-center text-sm text-ink-soft mb-8 max-w-xs mx-auto">
                A glimpse of the celebration, ten days of marigold and light.
              </p>
              <GaneshMomentsGallery moments={moments} palette={palette} gold={gold} rose={rose} />
            </section>
          )}

          <div className="px-6 pt-10">
            <GaneshRsvpForm palette={palette} slug={invitationSlug} />
          </div>
          <WishesWall
            slug={invitationSlug}
            heading="Blessings for Bappa's Family"
            subheading="Leave a wish — Ganpati Bappa Morya 🙏"
            renderIcon={() => <Flame className="w-3.5 h-3.5" style={{ color: rose }} strokeWidth={1.6} />}
          />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex justify-center mb-3">
              <Flame className="w-4 h-4" style={{ color: gold }} strokeWidth={1.6} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Ganpati Bappa Morya &middot; With love &amp; devotion</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
