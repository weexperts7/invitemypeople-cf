import { EMPTY_LEAD_EVENT, type LeadEvent } from './leadFormTypes'

interface EventDetailsEditorProps {
  events: LeadEvent[]
  onChange: (events: LeadEvent[]) => void
  max?: number
}

// `font-sans` rather than the inherited decorative `.mst-root` serif — see
// MahoganySealCreatePage.tsx's own comment on `inputClasses` for why.
const fieldClasses =
  'w-full rounded-lg border border-[#d4af37]/30 bg-[#fbf3e3] px-3 py-2 font-sans text-sm text-[#2c1d18] placeholder:text-[#8a6a1f]/50 outline-none transition-colors focus:border-[#8b1e1e] focus:ring-2 focus:ring-[#8b1e1e]/15'

/**
 * Dynamic "Events" list for `MahoganySealCreatePage.tsx` — Engagement, Wedding,
 * Reception, etc., each with its own date/time/venue/note, mirroring
 * `MahoganySealEvent`'s own shape (types.ts) field-for-field so whatever a
 * lead fills in here maps directly onto the real template's itinerary once
 * their invite is actually built. Same add/remove interaction as the
 * shared `builder/EventsListEditor.jsx`, reimplemented in this template's
 * own gold-on-mahogany palette rather than the site's ivory/rose theme —
 * see `MstPhotoUploader.tsx`'s own comment for why this template never
 * reuses shared-theme UI directly.
 */
export default function EventDetailsEditor({ events, onChange, max = 5 }: EventDetailsEditorProps) {
  const addEvent = () => {
    if (events.length >= max) return
    onChange([...events, { ...EMPTY_LEAD_EVENT }])
  }

  const updateEvent = (index: number, field: keyof LeadEvent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = events.slice()
    next[index] = { ...next[index], [field]: e.target.value }
    onChange(next)
  }

  const removeEvent = (index: number) => onChange(events.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="relative rounded-xl border border-[#d4af37]/25 bg-[#1a100d]/30 p-4">
          {events.length > 1 && (
            <button
              type="button"
              onClick={() => removeEvent(index)}
              aria-label="Remove event"
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[#d4af37]/70 hover:text-[#8b1e1e]"
            >
              &times;
            </button>
          )}

          <input
            type="text"
            value={event.name}
            onChange={updateEvent(index, 'name')}
            placeholder="e.g. Engagement, Wedding Ceremony, Reception"
            className={`mb-3 pr-8 ${fieldClasses}`}
          />

          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={event.date} onChange={updateEvent(index, 'date')} className={fieldClasses} />
            <input
              type="text"
              value={event.time}
              onChange={updateEvent(index, 'time')}
              placeholder="e.g. 6:30 PM"
              className={fieldClasses}
            />
          </div>

          <input
            type="text"
            value={event.venue}
            onChange={updateEvent(index, 'venue')}
            placeholder="Venue name"
            className={`mt-3 ${fieldClasses}`}
          />

          <input
            type="text"
            value={event.note}
            onChange={updateEvent(index, 'note')}
            placeholder="Note — dress code, a blessing, anything worth a highlight (optional)"
            className={`mt-3 ${fieldClasses}`}
          />
        </div>
      ))}

      {events.length < max && (
        <button
          type="button"
          onClick={addEvent}
          className="mst-font-seal flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d4af37]/40 py-3 text-xs tracking-[0.1em] text-[#8a6a1f] uppercase transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
        >
          + Add Another Event
        </button>
      )}
    </div>
  )
}
