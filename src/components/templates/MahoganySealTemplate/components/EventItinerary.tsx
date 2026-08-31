import type { MahoganySealEvent } from '../types'
import { buildMapLink } from '../defaults'
import AmbientLights from './AmbientLights'

interface EventItineraryProps {
  events: MahoganySealEvent[]
  reduceMotion?: boolean
}

/**
 * Vertical timeline of ceremony cards — Engagement / Wedding / Reception,
 * etc. — connected by a gold line, each with date/time/venue and a
 * "Get Directions" deep-link.
 *
 * Dark mahogany throughout, not the bright cream panel this section used
 * to be: the intro video never shows a pale surface anywhere — it's wood
 * tones, amber lamplight, and gold from the first frame to the last — so a
 * light section here read as a hand-off to a different, unrelated design
 * rather than a continuation of what the guest just watched. `#1a100d`
 * (vs. the hero's `#2c1d18`/`#3d2820` and the scratch card's `#2c1d18`)
 * gives this section its own slightly darker depth in the same family,
 * so consecutive sections still read as distinct without ever leaving
 * mahogany for cream.
 */
export default function EventItinerary({ events, reduceMotion = false }: EventItineraryProps) {
  return (
    <section aria-label="Event itinerary" className="relative overflow-hidden bg-[#1a100d] px-5 py-16 sm:px-8">
      <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
      <div className="relative z-10 mx-auto max-w-lg">
        <p className="mst-font-seal text-center text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">The Itinerary</p>
        <h3 className="mst-font-display mt-2 text-center text-3xl font-semibold text-[#fbf3e3]">Where to be, and when</h3>

        <ol className="relative mt-12 space-y-10 border-l border-dashed border-[#d4af37]/40 pl-8">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[2.35rem] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#1a100d] shadow-[0_0_10px_rgba(212,175,55,0.25)]"
              >
                <span className="h-2 w-2 rounded-full bg-[#b23b3b]" />
              </span>

              <div className="rounded-2xl border border-[#d4af37]/25 bg-[#3d2820]/50 p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="mst-font-display text-xl font-semibold text-[#fbf3e3]">{event.name}</h4>
                  {event.badge && (
                    <span className="mst-font-seal rounded-full bg-[#d4af37] px-3 py-1 text-[10px] tracking-[0.15em] text-[#2c1d18] uppercase">
                      {event.badge}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-[#d4af37]/90">
                  {event.dateLabel} · {event.time}
                </p>

                <div className="mt-3 border-t border-dashed border-[#d4af37]/25 pt-3">
                  <p className="mst-font-display text-base font-medium text-[#fbf3e3]">{event.venue.name}</p>
                  {event.venue.address && <p className="mt-0.5 text-sm text-[#fbf3e3]/60">{event.venue.address}</p>}
                  {event.note && <p className="mt-2 text-sm italic text-[#e08a8a]">{event.note}</p>}

                  <a
                    href={buildMapLink(event.venue)}
                    target="_blank"
                    rel="noreferrer"
                    className="mst-font-seal mt-3 inline-flex items-center gap-1 text-[11px] tracking-[0.12em] text-[#d4af37] uppercase transition-colors hover:text-[#f2d675]"
                  >
                    Get Directions <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
