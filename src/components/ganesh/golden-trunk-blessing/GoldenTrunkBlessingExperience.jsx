import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Gift, Sunrise } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import { FrameCorners } from '../../TemplateFrame'
import GaneshIdolPhoto from '../../GaneshIdolPhoto'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import { MandapArch, ModakGlyph } from '../ganeshMotifs'
import GaneshRsvpForm from '../GaneshRsvpForm'
import GaneshMomentsGallery from '../royal-durbar-darshan/GaneshMomentsGallery'
import ModakBlessingBox from './ModakBlessingBox'

// The "Symmetric Golden Panel" archetype — Bappa's photo sits front and
// center inside a mandap-arch niche (no curtain reveal here, that's Marigold
// Mandap's signature move), followed by a card-grid muhurat layout instead
// of a vertical step list — the structural differentiator from
// MarigoldMandapExperience, mirroring how the Satsang category's Royal
// Peacock differs structurally from its Golden Temple Altar sibling.
function DetailCard({ icon: Icon, label, children, action, gold, rose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border px-5 py-5 shadow-card text-center"
      style={{ borderColor: `${gold}45`, background: 'var(--color-ivory)' }}
    >
      <span
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border"
        style={{ background: 'var(--color-blush)', borderColor: `${gold}70` }}
      >
        <Icon className="w-5 h-5" style={{ color: rose }} strokeWidth={1.6} />
      </span>
      <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft mb-1.5">{label}</p>
      <div className="text-ink font-serif text-lg leading-snug">{children}</div>
      {action}
    </motion.div>
  )
}

export default function GoldenTrunkBlessingExperience({ template, invitationSlug: slugOverride, onOpen }) {
  const { palette, greeting, host, event, puja, moments } = template
  const invitationSlug = slugOverride || `ganesh-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const gold = palette?.gold ?? '#c28a3a'
  const rose = palette?.rose ?? '#9a1f2b'

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif="modak-mandala" palette={palette} accent={palette?.rose} />
        <FrameCorners motif="modak-mandala" palette={palette} accent={palette?.rose} className="z-10" />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Symmetric hero panel */}
          {/* ---------------------------------------------------------- */}
          <section className="relative overflow-hidden px-6 pt-20 pb-8 text-center flex flex-col items-center">
            <MandapArch gold={gold} accent={rose}>
              <GaneshIdolPhoto size={100} palette={palette} />
            </MandapArch>

            {greeting?.symbol && <p className="text-2xl text-gold mb-1">{greeting.symbol}</p>}
            <p className="text-xs tracking-[0.35em] uppercase text-ink-soft mb-4">
              {greeting?.line ?? 'Ganpati Bappa Morya'}
            </p>
            <h1 className="font-script text-4xl sm:text-5xl leading-tight mb-4" style={{ color: rose }}>
              {host?.familyName}
            </h1>
            <p className="max-w-sm text-sm sm:text-base text-ink-soft leading-relaxed">
              {host?.hostLine}
            </p>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Golden Trunk Blessing — tap-to-open modak box */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 pb-4">
            <p className="text-center text-sm text-ink-soft mb-8 max-w-xs mx-auto">
              Tap the golden box to receive Bappa&rsquo;s blessing for your journey ahead.
            </p>
            <ModakBlessingBox palette={palette} onOpen={onOpen} />
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Puja muhurat — card grid, not a step list */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8">
              Puja Muhurat
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <DetailCard icon={CalendarDays} label="Sthapana" gold={gold} rose={rose}>
                {event.sthapanaDate}
              </DetailCard>
              <DetailCard icon={Clock} label="Pran Pratishtha Muhurat" gold={gold} rose={rose}>
                {event.sthapanaMuhurat}
              </DetailCard>
              <div className="col-span-2">
                <DetailCard
                  icon={MapPin}
                  label="Venue"
                  gold={gold}
                  rose={rose}
                  action={
                    <motion.a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-xs font-medium text-ivory shadow-card"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Get Directions
                    </motion.a>
                  }
                >
                  <span className="text-base">{event.venue}</span>
                </DetailCard>
              </div>
              <div className="col-span-2">
                <DetailCard icon={Sunrise} label="Daily Aarti" gold={gold} rose={rose}>
                  <span className="text-base">
                    Morning {event.morningAarti} &middot; Evening {event.eveningAarti}
                  </span>
                </DetailCard>
              </div>
              <div className="col-span-2">
                <DetailCard icon={Gift} label="Visarjan &amp; Maha Prasad" gold={gold} rose={rose}>
                  <span className="text-base">
                    {event.visarjanDate} &middot; Yatra at {event.visarjanYatraTime}
                  </span>
                  <p className="mt-2 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                    Maha Prasad at {event.mahaPrasadTime}. {puja?.note}
                  </p>
                </DetailCard>
              </div>
            </div>
          </section>

          {/* Sacred Moments — only present once a host has uploaded their
              own photos (see buildGaneshExperienceTemplate.js); the
              pre-built demo templates don't ship stock `moments` for this
              layout, so this renders nothing for them. */}
          {moments?.length > 0 && (
            <section className="px-6 pb-4">
              <h2 className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8">
                Sacred Moments
              </h2>
              <GaneshMomentsGallery moments={moments} palette={palette} gold={gold} rose={rose} />
            </section>
          )}

          <div className="px-6">
            <GaneshRsvpForm palette={palette} slug={invitationSlug} />
          </div>
          <WishesWall
            slug={invitationSlug}
            heading="Blessings for Bappa's Family"
            subheading="Leave a wish — Ganpati Bappa Morya 🙏"
            renderIcon={() => <ModakGlyph color={gold} accent={rose} size={14} />}
          />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex justify-center mb-3">
              <ModakGlyph color={gold} accent={rose} size={18} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Ganpati Bappa Morya &middot; With love &amp; devotion</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
