import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, UtensilsCrossed } from 'lucide-react'
import FallingPetals from '../FallingPetals'
import CulturalMotif from '../CulturalMotif'
import { FrameBanner, FrameCorners } from '../TemplateFrame'
import MotifBadge from '../MotifBadge'
import DivineBlessingScratchCard from '../DivineBlessingScratchCard'
import SatsangRsvpForm from '../SatsangRsvpForm'
import WishesWall from '../WishesWall'
import GurujiPhoto from '../GurujiPhoto'
import { themeToCssVars } from '../../utils/themeToCssVars'

// The original, shared Satsang layout — still used by every Satsang template
// that doesn't declare a `layout` (see satsang/layoutRegistry.js). Kept
// verbatim so the templates still on this path (radiant-sunrise,
// tulsi-serenity, diya-ganga, celestial-om) render exactly as before.
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

export default function LegacySatsangExperience({ template }) {
  const { palette, motif, motifAccent, greeting, host, event, mahaprasad, name } = template
  const invitationSlug = `satsang-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />
        <FrameCorners motif={motif} palette={palette} accent={motifAccent} className="z-10" />

        <main className="relative bg-petals">
          {/* ---------------------------------------------------------- */}
          {/* Divine header */}
          {/* ---------------------------------------------------------- */}
          <section className="relative overflow-hidden px-6 pt-20 pb-10 text-center flex flex-col items-center">
            <MotifBadge
              motif={motif}
              palette={palette}
              accent={motifAccent}
              className="absolute -z-10 top-4 left-1/2 -translate-x-1/2 w-32 h-32 opacity-25"
            />

            <GurujiPhoto size={132} palette={palette} className="mb-4" />

            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-xs mb-2"
            >
              <FrameBanner motif={motif} palette={palette} accent={motifAccent} className="w-full h-auto" />
            </motion.div>

            {greeting?.symbol && (
              <motion.p
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-3xl text-gold mb-2"
              >
                {greeting.symbol}
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm tracking-[0.3em] uppercase text-ink-soft mb-3"
            >
              {greeting?.line ?? 'Jai Guruji'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
              className="font-serif text-3xl sm:text-4xl text-ink mb-3"
            >
              Satsang Invitation
            </motion.h1>

            <motion.span
              className="block h-px w-28 bg-gold-soft mb-6 origin-center"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-script text-4xl sm:text-5xl text-rose leading-tight mb-4"
            >
              {host?.familyName}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="max-w-sm text-sm sm:text-base text-ink-soft leading-relaxed"
            >
              {host?.hostLine}
            </motion.p>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Divine Blessing scratch card */}
          {/* ---------------------------------------------------------- */}
          <DivineBlessingScratchCard palette={palette} />

          {/* ---------------------------------------------------------- */}
          {/* Event details */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-2xl sm:text-3xl text-ink text-center mb-8"
            >
              Satsang Details
            </motion.h2>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <DetailCard icon={CalendarDays} label="Date">
                {event.date}
              </DetailCard>
              <DetailCard icon={Clock} label="Time">
                {event.time}
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
                <DetailCard icon={UtensilsCrossed} label="Mahaprasad">
                  <span className="text-base">{mahaprasad?.time}</span>
                  <p className="mt-2 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                    {mahaprasad?.note}
                  </p>
                </DetailCard>
              </div>
            </div>
          </section>

          <SatsangRsvpForm palette={palette} slug={invitationSlug} />
          <WishesWall slug={invitationSlug} />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>Jai Guruji &middot; With love &amp; gratitude</p>
            <p className="mt-1 text-xs text-ink-soft/70">{name}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
