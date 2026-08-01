import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, UtensilsCrossed } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import GurujiPhoto from '../../GurujiPhoto'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import GoldenTempleAltarChapter from './GoldenTempleAltarChapter'
import BlessingEnvelope from './BlessingEnvelope'
import GoldenTempleAltarRsvpForm from './GoldenTempleAltarRsvpForm'
import { DiyaFlame, TempleArchNiche } from './altarMotifs'

// The "Storybook Chapter Flow" archetype: five numbered chapters, each
// bookended by hairline rules and a diya-lit rhythm, giving the page a
// sequential read instead of the Royal Peacock's symmetric panel or the
// Saffron Lotus's editorial whitespace. The blessing reveal here is an
// "Envelope Opening" tap interaction (BlessingEnvelope) rather than a
// scratch card.
function AltarStep({ icon: Icon, label, children, action, gold, isLast }) {
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <span className="absolute left-[15px] top-8 bottom-0 w-px" style={{ background: `${gold}45` }} />
      )}
      <div
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: gold, background: 'var(--color-ivory)' }}
      >
        <Icon className="w-3.5 h-3.5 text-rose" strokeWidth={1.6} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft mb-1">{label}</p>
        <div className="text-ink font-serif text-lg leading-snug">{children}</div>
        {action}
      </div>
    </div>
  )
}

export default function GoldenTempleAltarExperience({ template }) {
  const { palette, greeting, host, event, mahaprasad } = template
  const invitationSlug = `satsang-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const gold = palette?.gold ?? '#c28a3a'

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif="temple-gold" palette={palette} accent={palette?.rose} />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Chapter One — The Invocation */}
          {/* ---------------------------------------------------------- */}
          <GoldenTempleAltarChapter numeral="I" title="The Invocation" gold={gold} className="pt-16">
            <div className="flex flex-col items-center text-center">
              <TempleArchNiche gold={gold} accent={palette?.rose} rose={palette?.champagneDeep}>
                <GurujiPhoto size={100} palette={palette} />
              </TempleArchNiche>

              {greeting?.symbol && <p className="text-2xl text-gold mb-1">{greeting.symbol}</p>}
              <p className="text-xs tracking-[0.35em] uppercase text-ink-soft mb-4">
                {greeting?.line ?? 'Jai Guruji'}
              </p>
              <p className="font-script text-4xl sm:text-5xl text-rose leading-tight mb-4">
                {host?.familyName}
              </p>
              <p className="max-w-sm text-sm sm:text-base text-ink-soft leading-relaxed">
                {host?.hostLine}
              </p>
            </div>
          </GoldenTempleAltarChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Two — The Sacred Invitation (envelope reveal) */}
          {/* ---------------------------------------------------------- */}
          <GoldenTempleAltarChapter numeral="II" title="The Sacred Invitation" icon={DiyaFlame} gold={gold}>
            <p className="text-center text-sm text-ink-soft mb-8 max-w-xs mx-auto">
              Tap the sealed envelope to receive a blessing for your journey to the Satsang.
            </p>
            <BlessingEnvelope palette={palette} />
          </GoldenTempleAltarChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Three — The Gathering (altar-step details) */}
          {/* ---------------------------------------------------------- */}
          <GoldenTempleAltarChapter numeral="III" title="The Gathering" gold={gold}>
            <div className="flex justify-center mb-4">
              <DiyaFlame color={gold} flameColor={palette?.rose} size={22} />
            </div>
            <div>
              <AltarStep icon={CalendarDays} label="Date" gold={gold}>
                {event.date}
              </AltarStep>
              <AltarStep icon={Clock} label="Time" gold={gold}>
                {event.time}
              </AltarStep>
              <AltarStep
                icon={MapPin}
                label="Venue"
                gold={gold}
                action={
                  <motion.a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-xs font-medium text-ivory shadow-card"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Get Directions
                  </motion.a>
                }
              >
                {event.venue}
              </AltarStep>
              <AltarStep icon={UtensilsCrossed} label="Mahaprasad" gold={gold} isLast>
                <span>{mahaprasad?.time}</span>
                <p className="mt-1.5 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                  {mahaprasad?.note}
                </p>
              </AltarStep>
            </div>
            <div className="flex justify-center mt-2">
              <DiyaFlame color={gold} flameColor={palette?.rose} size={22} />
            </div>
          </GoldenTempleAltarChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Four — Your Presence (RSVP) */}
          {/* ---------------------------------------------------------- */}
          <GoldenTempleAltarChapter numeral="IV" title="Your Presence" gold={gold}>
            <GoldenTempleAltarRsvpForm palette={palette} slug={invitationSlug} />
          </GoldenTempleAltarChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Five — Blessings Received */}
          {/* ---------------------------------------------------------- */}
          <GoldenTempleAltarChapter numeral="V" title="Blessings Received" gold={gold}>
            <WishesWall
              slug={invitationSlug}
              heading=""
              subheading=""
              sectionClassName=""
              cardClassName="rounded-lg border px-5 py-4"
              renderIcon={() => <DiyaFlame color={gold} flameColor={palette?.rose} size={14} />}
            />
          </GoldenTempleAltarChapter>

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex justify-center mb-3">
              <DiyaFlame color={gold} flameColor={palette?.rose} size={18} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Jai Guruji &middot; With love &amp; gratitude</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
