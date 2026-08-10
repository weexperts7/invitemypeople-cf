import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Navigation, Sunrise, Sunset, Flame, Gift } from 'lucide-react'

// A day-grouped badge ("Day One", "Every Day", "Final Day") heading a
// section of the festival timeline — the structural piece that makes
// Divine Threshold read as a genuine multi-session schedule (Murti
// Sthapana & Pran Pratishtha, daily Aarti, Visarjan Yatra & Maha Prasad)
// rather than the flat muhurat card/step-list/scroll every other Ganesh
// template uses for the same underlying event data.
function DayBadge({ label, gold, rose }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory"
        style={{ background: `linear-gradient(90deg, ${rose}, ${gold})` }}
      >
        {label}
      </span>
      <span className="h-px flex-1" style={{ background: `${gold}40` }} />
    </div>
  )
}

function Row({ icon: Icon, label, children, gold, rose }) {
  return (
    <div className="flex gap-3 mb-3 last:mb-0">
      <span
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: `${gold}70`, background: 'var(--color-ivory)' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: rose }} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft mb-0.5">{label}</p>
        <div className="text-ink font-serif text-base leading-snug">{children}</div>
      </div>
    </div>
  )
}

export default function FestivalTimeline({ event, puja, gold, rose }) {
  // A buyer's own pasted Google Maps link (see CreateInvitePage.jsx's
  // "Location URL" field, threaded through as `event.mapHref` by
  // buildGaneshExperienceTemplate.js) wins over this generic venue-name
  // search, which only the pre-built demo templates (with no mapHref) fall
  // back to.
  const mapsHref = event.mapHref || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`

  return (
    <div className="mx-auto max-w-sm space-y-8">
      {/* Day One — Murti Sthapana & Pran Pratishtha */}
      <div
        className="rounded-2xl border px-5 py-6"
        style={{ borderColor: `${gold}45`, background: 'var(--color-ivory)' }}
      >
        <DayBadge label="Day One" gold={gold} rose={rose} />
        <Row icon={CalendarDays} label="Murti Sthapana" gold={gold} rose={rose}>
          {event.sthapanaDate}
        </Row>
        <Row icon={Clock} label="Pran Pratishtha Muhurat" gold={gold} rose={rose}>
          {event.sthapanaMuhurat}
        </Row>
        <Row icon={MapPin} label="Venue" gold={gold} rose={rose}>
          <span>{event.venue}</span>
          <div>
            <motion.a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose px-3.5 py-1.5 text-xs font-medium text-ivory shadow-card"
            >
              <Navigation className="w-3 h-3" />
              Get Directions
            </motion.a>
          </div>
        </Row>
      </div>

      {/* Every Day — Aarti Schedule */}
      <div
        className="rounded-2xl border px-5 py-6"
        style={{ borderColor: `${gold}45`, background: 'var(--color-ivory)' }}
      >
        <DayBadge label="Every Day" gold={gold} rose={rose} />
        <div className="grid grid-cols-2 gap-3">
          <Row icon={Sunrise} label="Morning Aarti" gold={gold} rose={rose}>
            {event.morningAarti}
          </Row>
          <Row icon={Sunset} label="Evening Aarti" gold={gold} rose={rose}>
            {event.eveningAarti}
          </Row>
        </div>
      </div>

      {/* Final Day — Visarjan & Maha Prasad */}
      <div
        className="rounded-2xl border px-5 py-6"
        style={{ borderColor: `${gold}45`, background: 'var(--color-ivory)' }}
      >
        <DayBadge label="Final Day" gold={gold} rose={rose} />
        <Row icon={Flame} label="Visarjan Yatra" gold={gold} rose={rose}>
          {event.visarjanDate} &middot; {event.visarjanYatraTime}
        </Row>
        <Row icon={Gift} label="Maha Prasad" gold={gold} rose={rose}>
          {event.mahaPrasadTime}
        </Row>
        {puja?.note && (
          <p className="mt-3 text-sm font-sans text-ink-soft leading-relaxed">{puja.note}</p>
        )}
      </div>

      {/* Also On The Calendar — any host-added session beyond the three
          days above (see buildGaneshExperienceTemplate.js's
          `extraSessions`), so a custom entry always shows up somewhere. */}
      {event.extraSessions?.length > 0 && (
        <div
          className="rounded-2xl border px-5 py-6"
          style={{ borderColor: `${gold}45`, background: 'var(--color-ivory)' }}
        >
          <DayBadge label="Also On The Calendar" gold={gold} rose={rose} />
          {event.extraSessions.map((session, i) => (
            <Row key={i} icon={CalendarDays} label={session.title} gold={gold} rose={rose}>
              <span>{[session.date, session.time].filter(Boolean).join(' · ') || 'Details to follow'}</span>
              {session.venue && (
                <p className="mt-1 text-sm font-sans font-normal text-ink-soft leading-relaxed">{session.venue}</p>
              )}
            </Row>
          ))}
        </div>
      )}
    </div>
  )
}
