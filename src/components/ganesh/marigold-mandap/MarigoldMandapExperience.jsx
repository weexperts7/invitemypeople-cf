import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Gift, Sunrise } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import { GaneshChapter, ModakGlyph } from '../ganeshMotifs'
import GaneshCurtainReveal from '../GaneshCurtainReveal'
import GaneshRsvpForm from '../GaneshRsvpForm'
import GaneshMomentsGallery from '../royal-durbar-darshan/GaneshMomentsGallery'

// Chapter numerals shift depending on whether the optional "Cherished
// Moments" chapter renders (see `moments` below) — only present once a
// host has uploaded their own photos, since this layout ships no stock
// moments of its own — so numbering is computed rather than hardcoded.
const ROMAN = ['I', 'II', 'III', 'IV', 'V']

// The "Storybook Mandap Flow" archetype: four numbered chapters, bookended
// by hairline rules and a modak-lit rhythm, giving the page a sequential
// read — same shape as the Satsang category's Golden Temple Altar template,
// re-themed in vibrant marigold/gold with a curtain-opening darshan reveal
// in place of an envelope.
function MandapStep({ icon: Icon, label, children, action, gold, isLast }) {
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

export default function MarigoldMandapExperience({ template, invitationSlug: slugOverride, onOpen }) {
  const { palette, greeting, host, event, puja, moments } = template
  const invitationSlug = slugOverride || `ganesh-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const gold = palette?.gold ?? '#d9932e'
  const hasMoments = moments?.length > 0
  const rsvpNumeral = ROMAN[hasMoments ? 3 : 2]
  const blessingsNumeral = ROMAN[hasMoments ? 4 : 3]

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif="marigold-garland" palette={palette} accent={palette?.rose} />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Chapter One — Bappa's Darshan (curtain reveal) */}
          {/* ---------------------------------------------------------- */}
          <GaneshChapter numeral="I" title="Bappa's Darshan" gold={gold} className="pt-4">
            <GaneshCurtainReveal palette={palette} greeting={greeting} host={host} onOpen={onOpen} />
          </GaneshChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Two — The Sacred Muhurat */}
          {/* ---------------------------------------------------------- */}
          <GaneshChapter numeral="II" title="The Sacred Muhurat" icon={ModakGlyph} gold={gold}>
            <div className="flex justify-center mb-4">
              <ModakGlyph color={gold} accent={palette?.rose} size={22} />
            </div>
            <div>
              <MandapStep icon={CalendarDays} label="Sthapana" gold={gold}>
                {event.sthapanaDate}
              </MandapStep>
              <MandapStep icon={Clock} label="Pran Pratishtha Muhurat" gold={gold}>
                {event.sthapanaMuhurat}
              </MandapStep>
              <MandapStep
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
              </MandapStep>
              <MandapStep icon={Sunrise} label="Daily Aarti" gold={gold}>
                Morning {event.morningAarti} &middot; Evening {event.eveningAarti}
              </MandapStep>
              <MandapStep icon={Gift} label="Visarjan &amp; Maha Prasad" gold={gold} isLast>
                <span>
                  {event.visarjanDate} &middot; Yatra at {event.visarjanYatraTime}
                </span>
                <p className="mt-1.5 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                  Maha Prasad at {event.mahaPrasadTime}. {puja?.note}
                </p>
              </MandapStep>
            </div>
            <div className="flex justify-center mt-2">
              <ModakGlyph color={gold} accent={palette?.rose} size={22} />
            </div>
          </GaneshChapter>

          {/* ---------------------------------------------------------- */}
          {/* Chapter Three — Cherished Moments (only once a host has    */}
          {/* uploaded photos — see buildGaneshExperienceTemplate.js)    */}
          {/* ---------------------------------------------------------- */}
          {hasMoments && (
            <GaneshChapter numeral="III" title="Cherished Moments" gold={gold}>
              <GaneshMomentsGallery moments={moments} palette={palette} gold={gold} rose={palette?.rose} />
            </GaneshChapter>
          )}

          {/* ---------------------------------------------------------- */}
          {/* Your Presence (RSVP) */}
          {/* ---------------------------------------------------------- */}
          <GaneshChapter numeral={rsvpNumeral} title="Your Presence" gold={gold}>
            <GaneshRsvpForm palette={palette} slug={invitationSlug} />
          </GaneshChapter>

          {/* ---------------------------------------------------------- */}
          {/* Blessings Received */}
          {/* ---------------------------------------------------------- */}
          <GaneshChapter numeral={blessingsNumeral} title="Blessings Received" gold={gold}>
            <WishesWall
              slug={invitationSlug}
              heading=""
              subheading=""
              sectionClassName=""
              cardClassName="rounded-lg border px-5 py-4"
              renderIcon={() => <ModakGlyph color={gold} accent={palette?.rose} size={14} />}
            />
          </GaneshChapter>

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex justify-center mb-3">
              <ModakGlyph color={gold} accent={palette?.rose} size={18} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Ganpati Bappa Morya &middot; With love &amp; devotion</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
