import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Gift } from 'lucide-react'
import FallingPetals from '../FallingPetals'
import CulturalMotif from '../CulturalMotif'
import { FrameBanner, FrameCorners } from '../TemplateFrame'
import MotifBadge from '../MotifBadge'
import WishesWall from '../WishesWall'
import { themeToCssVars } from '../../utils/themeToCssVars'
import { ModakGlyph } from './ganeshMotifs'
import GaneshCurtainReveal from './GaneshCurtainReveal'
import GaneshRsvpForm from './GaneshRsvpForm'

// The shared Ganesh Chaturthi layout for every template that doesn't
// declare a bespoke `layout` (see ganesh/layoutRegistry.js) — mirrors
// LegacySatsangExperience.jsx's role for the Satsang category, re-themed
// with the marigold/gold curtain-reveal hero and puja-muhurat details every
// Ganesh Chaturthi template needs.
function DetailCard({ icon: Icon, label, children, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-champagne-deep/40 bg-ivory/70 px-5 py-5 shadow-card text-center"
    >
      <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blush border border-gold-soft">
        <Icon className="w-5 h-5 text-rose" strokeWidth={1.6} />
      </span>
      <p className="text-[11px] uppercase tracking-[0.22em] text-ink-soft mb-1.5">{label}</p>
      <div className="text-ink font-serif text-lg leading-snug">{children}</div>
      {action}
    </motion.div>
  )
}

export default function LegacyGaneshExperience({ template }) {
  const { palette, motif, motifAccent, greeting, host, event, puja, name } = template
  const invitationSlug = `ganesh-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />
        <FrameCorners motif={motif} palette={palette} accent={motifAccent} className="z-10" />

        <main className="relative bg-petals">
          {/* ---------------------------------------------------------- */}
          {/* Decorative header + curtain-reveal darshan */}
          {/* ---------------------------------------------------------- */}
          <section className="relative overflow-hidden pt-10 text-center flex flex-col items-center">
            <MotifBadge
              motif={motif}
              palette={palette}
              accent={motifAccent}
              className="absolute -z-10 top-4 left-1/2 -translate-x-1/2 w-32 h-32 opacity-25"
            />
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-xs px-6 mb-1"
            >
              <FrameBanner motif={motif} palette={palette} accent={motifAccent} className="w-full h-auto" />
            </motion.div>

            <GaneshCurtainReveal palette={palette} greeting={greeting} host={host} />
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Puja muhurat details */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8"
            >
              Puja Muhurat
            </motion.h2>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <DetailCard icon={CalendarDays} label="Sthapana">
                {event.sthapanaDate}
              </DetailCard>
              <DetailCard icon={Clock} label="Muhurat">
                {event.muhurat}
              </DetailCard>
              <div className="col-span-2">
                <DetailCard
                  icon={MapPin}
                  label="Venue"
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
                <DetailCard icon={Gift} label="Aarti &amp; Visarjan">
                  <span className="text-base">{event.time}</span>
                  <p className="mt-2 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                    {puja?.note} Visarjan on {event.visarjanDate}.
                  </p>
                </DetailCard>
              </div>
            </div>
          </section>

          <GaneshRsvpForm palette={palette} slug={invitationSlug} />
          <WishesWall
            slug={invitationSlug}
            renderIcon={() => <ModakGlyph color={palette?.gold} accent={palette?.rose} size={14} />}
          />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Ganpati Bappa Morya &middot; With love &amp; devotion</p>
            <p className="mt-1 text-xs text-ink-soft/70">{name}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
