import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, UtensilsCrossed } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import GurujiPhoto from '../../GurujiPhoto'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import RoyalPeacockFrame from './RoyalPeacockFrame'
import RoyalPeacockVaultReveal from './RoyalPeacockVaultReveal'
import RoyalPeacockRsvpForm from './RoyalPeacockRsvpForm'
import { PeacockArchway } from './peacockMotifs'

// The "Symmetrical / Bordered Royal Frame" archetype: a continuous
// ornamental double-border frame around the whole card (RoyalPeacockFrame),
// a pointed archway niche for Guruji's photo, and a strictly centered,
// symmetric section flow — the physical-luxury-card read the user asked for.
function DetailRow({ icon: Icon, label, children, action, gold }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0"
      style={{ borderColor: `${gold}30` }}
    >
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: `${gold}80`, background: `${gold}14` }}
      >
        <Icon className="w-4 h-4 text-rose" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-soft mb-1">{label}</p>
        <div className="text-ink font-serif text-base leading-snug">{children}</div>
        {action}
      </div>
    </motion.div>
  )
}

export default function RoyalPeacockExperience({ template }) {
  const { palette, greeting, host, event, mahaprasad } = template
  const invitationSlug = `satsang-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const gold = palette?.gold ?? '#c9a24b'

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh overflow-hidden sm:my-2 sm:rounded-[2.5rem] sm:shadow-soft bg-gradient-to-b from-[var(--color-linen)] to-[var(--color-ivory)]">
        <CulturalMotif motif="peacock-feather" palette={palette} accent={palette?.rose} />
        <RoyalPeacockFrame palette={palette} />

        <main className="relative px-2 pb-4">
          {/* ---------------------------------------------------------- */}
          {/* Symmetric archway header */}
          {/* ---------------------------------------------------------- */}
          <section className="flex flex-col items-center px-6 pt-14 pb-6 text-center">
            <PeacockArchway gold={gold} accent={palette?.rose} rose={palette?.champagneDeep}>
              <GurujiPhoto size={104} palette={palette} />
            </PeacockArchway>

            {greeting?.symbol && (
              <motion.p
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-2xl text-gold mt-1 mb-1"
              >
                {greeting.symbol}
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs tracking-[0.35em] uppercase text-ink-soft mb-2"
            >
              {greeting?.line ?? 'Jai Guruji'}
            </motion.p>

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10" style={{ background: `${gold}90` }} />
              <span className="text-[10px] tracking-[0.3em] uppercase text-ink-soft">The Royal Peacock</span>
              <span className="h-px w-10" style={{ background: `${gold}90` }} />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="font-script text-4xl sm:text-5xl text-rose leading-tight mb-4"
            >
              {host?.familyName}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="max-w-sm text-sm sm:text-base text-ink-soft leading-relaxed"
            >
              {host?.hostLine}
            </motion.p>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Divine Vault / Ticket reveal */}
          {/* ---------------------------------------------------------- */}
          <RoyalPeacockVaultReveal palette={palette} />

          {/* ---------------------------------------------------------- */}
          {/* Satsang Details — one bordered panel, not a card grid */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-serif text-2xl sm:text-3xl text-ink text-center mb-6"
            >
              Satsang Details
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto rounded-[1.5rem] border-2 overflow-hidden shadow-card"
              style={{ borderColor: `${gold}55`, background: 'var(--color-ivory)' }}
            >
              <DetailRow icon={CalendarDays} label="Date" gold={gold}>
                {event.date}
              </DetailRow>
              <DetailRow icon={Clock} label="Time" gold={gold}>
                {event.time}
              </DetailRow>
              <DetailRow
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
              </DetailRow>
              <DetailRow icon={UtensilsCrossed} label="Mahaprasad" gold={gold}>
                <span>{mahaprasad?.time}</span>
                <p className="mt-1.5 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                  {mahaprasad?.note}
                </p>
              </DetailRow>
            </motion.div>
          </section>

          <RoyalPeacockRsvpForm palette={palette} slug={invitationSlug} />

          <WishesWall
            slug={invitationSlug}
            heading="Blessings Received"
            cardClassName="rounded-2xl border-2 px-5 py-4"
            sectionClassName="px-6 py-16"
          />

          <footer className="py-12 text-center text-sm text-ink-soft">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-10" style={{ background: `${gold}90` }} />
              <span className="text-[10px] tracking-[0.3em] uppercase">Jai Guruji</span>
              <span className="h-px w-10" style={{ background: `${gold}90` }} />
            </div>
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>With love &amp; gratitude</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
