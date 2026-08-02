import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Gift } from 'lucide-react'

function ScrollRod({ gold, goldSoft, champagne }) {
  return (
    <div
      className="relative z-10 mx-[-14px] h-4 rounded-full shadow-card"
      style={{ background: `linear-gradient(90deg, ${gold}, ${goldSoft}, ${gold})` }}
    >
      <span
        className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2"
        style={{ borderColor: gold, background: champagne }}
      />
      <span
        className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2"
        style={{ borderColor: gold, background: champagne }}
      />
    </div>
  )
}

function ScrollRow({ icon: Icon, label, children, gold, rose, last }) {
  return (
    <div
      className={last ? 'px-2' : 'px-2 pb-6 mb-6 border-b border-dashed'}
      style={last ? undefined : { borderColor: `${gold}45` }}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: rose }} strokeWidth={1.6} />
        <span className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">{label}</span>
      </div>
      <div className="font-serif text-lg text-ink leading-snug">{children}</div>
    </div>
  )
}

// The puja muhurat presented as an unrolling parchment scroll — two gold
// rods bookending a panel that unfurls into view on scroll — rather than
// the vertical step-list (Marigold Mandap) or card-grid (Golden Trunk
// Blessing) the other two Ganesh templates use for the same content.
export default function MuhuratScroll({ event, puja, palette, gold, rose }) {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`
  const goldSoft = palette?.goldSoft ?? '#dcb662'
  const champagne = palette?.champagne ?? '#e6c883'

  return (
    <div className="relative mx-auto max-w-sm">
      <ScrollRod gold={gold} goldSoft={goldSoft} champagne={champagne} />

      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="origin-top border-x-2 px-6 py-8 sm:px-8"
        style={{
          borderColor: `${gold}55`,
          background: `linear-gradient(180deg, ${palette?.linen ?? '#f2e6c9'} 0%, ${palette?.ivory ?? '#fdf9f0'} 55%, ${palette?.linen ?? '#f2e6c9'} 100%)`,
        }}
      >
        <ScrollRow icon={CalendarDays} label="Sthapana" gold={gold} rose={rose}>
          {event.sthapanaDate}
        </ScrollRow>
        <ScrollRow icon={Clock} label="Muhurat" gold={gold} rose={rose}>
          {event.muhurat}
        </ScrollRow>
        <ScrollRow icon={MapPin} label="Venue" gold={gold} rose={rose}>
          <span>{event.venue}</span>
          <div>
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
          </div>
        </ScrollRow>
        <ScrollRow icon={Gift} label="Aarti & Visarjan" gold={gold} rose={rose} last>
          <span>{event.time}</span>
          <p className="mt-2 text-sm font-sans font-normal text-ink-soft leading-relaxed">
            {puja?.note} Visarjan on {event.visarjanDate}.
          </p>
        </ScrollRow>
      </motion.div>

      <ScrollRod gold={gold} goldSoft={goldSoft} champagne={champagne} />
    </div>
  )
}
