import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, UtensilsCrossed } from 'lucide-react'
import FallingPetals from '../../FallingPetals'
import CulturalMotif from '../../CulturalMotif'
import GurujiPhoto from '../../GurujiPhoto'
import WishesWall from '../../WishesWall'
import { themeToCssVars } from '../../../utils/themeToCssVars'
import SaffronLotusPetalReveal from './SaffronLotusPetalReveal'
import SaffronLotusRsvpForm from './SaffronLotusRsvpForm'
import { LotusDivider } from './lotusDividers'

// The "Asymmetrical Editorial" archetype: a left-aligned masthead instead of
// a centered greeting, an offset GurujiPhoto instead of a symmetric arch,
// organic curved dividers instead of straight rules, and a left-rule
// "fact list" for event details instead of a card grid or bordered panel —
// deliberately no ornamental frame, leaning into whitespace instead.
function FactRow({ icon: Icon, label, children, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3"
    >
      <Icon className="w-4 h-4 mt-1 shrink-0 text-rose" strokeWidth={1.6} />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-[0.25em] text-ink-soft mb-1">{label}</p>
        <div className="text-ink font-serif text-lg leading-snug">{children}</div>
        {action}
      </div>
    </motion.div>
  )
}

export default function SaffronLotusExperience({ template }) {
  const { palette, greeting, host, event, mahaprasad } = template
  const invitationSlug = `satsang-${template.slug}`
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const gold = palette?.gold ?? '#d9932e'

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <FallingPetals palette={palette} />

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:my-2 sm:rounded-[2rem] sm:shadow-soft sm:border sm:border-champagne-deep/30">
        <CulturalMotif motif="saffron-lotus" palette={palette} accent={palette?.rose} />

        <main className="relative">
          {/* ---------------------------------------------------------- */}
          {/* Left-aligned editorial masthead, photo offset right */}
          {/* ---------------------------------------------------------- */}
          <section className="pt-16 pb-8 px-6">
            <div className="grid grid-cols-[1fr_auto] items-start gap-4">
              <motion.div
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="pt-8"
              >
                <p className="text-[10px] tracking-[0.35em] uppercase text-rose mb-3">
                  Satsang Invitation
                </p>
                {greeting?.symbol && <p className="text-2xl text-gold mb-2">{greeting.symbol}</p>}
                <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-[1.05]">
                  {greeting?.line ?? 'Jai Guruji'}
                </h1>
              </motion.div>
              <GurujiPhoto size={88} palette={palette} className="justify-self-end translate-y-4" />
            </div>
          </section>

          <div className="px-6">
            <LotusDivider color={gold} />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Offset parchment host card */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 0.7 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0.7 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="ml-8 sm:ml-14 max-w-[85%] rounded-tr-md rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-bl-md border p-6 shadow-soft"
              style={{ borderColor: `${gold}45`, background: 'var(--color-champagne)' }}
            >
              <p className="font-script text-3xl sm:text-4xl text-rose leading-tight mb-2">
                {host?.familyName}
              </p>
              <p className="text-sm text-ink-soft leading-relaxed">{host?.hostLine}</p>
            </motion.div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Sacred Lotus Petal reveal */}
          {/* ---------------------------------------------------------- */}
          <SaffronLotusPetalReveal palette={palette} />

          <div className="px-6">
            <LotusDivider color={gold} flip />
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Event details — editorial fact list, not a card grid */}
          {/* ---------------------------------------------------------- */}
          <section className="px-6 py-14">
            <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-8 text-left">The Gathering</h2>
            <div className="space-y-7 border-l-2 pl-5" style={{ borderColor: `${gold}45` }}>
              <FactRow icon={CalendarDays} label="Date" gold={gold}>
                {event.date}
              </FactRow>
              <FactRow icon={Clock} label="Time" gold={gold}>
                {event.time}
              </FactRow>
              <FactRow
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
              </FactRow>
              <FactRow icon={UtensilsCrossed} label="Mahaprasad" gold={gold}>
                <span>{mahaprasad?.time}</span>
                <p className="mt-1.5 text-sm font-sans font-normal text-ink-soft leading-relaxed">
                  {mahaprasad?.note}
                </p>
              </FactRow>
            </div>
          </section>

          <SaffronLotusRsvpForm palette={palette} slug={invitationSlug} />

          <WishesWall
            slug={invitationSlug}
            heading="Wishes &amp; Blessings"
            cardClassName="ml-6 mr-2 rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md border px-5 py-4"
            sectionClassName="px-6 py-16"
          />

          <footer className="py-12 px-6 text-left text-sm text-ink-soft">
            <p className="font-script text-3xl text-gold mb-1">{host?.familyName}</p>
            <p>With love &amp; gratitude &middot; Jai Guruji</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
