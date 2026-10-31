// Dynamic "Additional Events" list for the Invitation Builder — see
// CreateInvitePage.jsx. Lets a buyer add extra functions (Sangeet, Mehndi,
// Reception, ...) beyond the one main event the form already collects,
// each with its own date/time/venue/location. Purely local form state —
// GeneratedInvitePage.jsx is what actually renders whatever ends up here,
// once the invite is saved.
import { Plus, X } from 'lucide-react'
import SinglePhotoUploader from './SinglePhotoUploader'
import { MAX_ADDITIONAL_EVENTS } from '../../utils/cleanEvents'

const EMPTY_EVENT = { title: '', date: '', time: '', venue: '', locationUrl: '', venuePhoto: '' }

// `venuePhotoHint` also turns the venue photo on — only templates that show
// one (`hasVenuePhotos` in data/builderTemplates.js) pass it.
export default function EventsListEditor({
  events,
  onChange,
  titlePlaceholder = 'e.g. Sangeet Night',
  venuePhotoHint,
  uploadEndpoint,
  uploadToken,
}) {
  const addEvent = () => {
    if (events.length >= MAX_ADDITIONAL_EVENTS) return
    onChange([...events, { ...EMPTY_EVENT }])
  }

  const updateEvent = (index, field) => (e) => {
    const next = events.slice()
    next[index] = { ...next[index], [field]: e.target.value }
    onChange(next)
  }

  const removeEvent = (index) => onChange(events.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={index}
          className="relative rounded-2xl border border-champagne-deep/50 bg-ivory/70 p-4"
        >
          <button
            type="button"
            onClick={() => removeEvent(index)}
            aria-label="Remove event"
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-ink-soft hover:text-rose"
          >
            <X className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={event.title}
            onChange={updateEvent(index, 'title')}
            placeholder={titlePlaceholder}
            className="mb-3 w-full rounded-lg border border-champagne-deep/50 bg-ivory px-3 py-2 pr-8 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={event.date}
              onChange={updateEvent(index, 'date')}
              className="rounded-lg border border-champagne-deep/50 bg-ivory px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-soft"
            />
            <input
              type="time"
              value={event.time}
              onChange={updateEvent(index, 'time')}
              className="rounded-lg border border-champagne-deep/50 bg-ivory px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold-soft"
            />
          </div>

          <input
            type="text"
            value={event.venue}
            onChange={updateEvent(index, 'venue')}
            placeholder="Venue name"
            className="mt-3 w-full rounded-lg border border-champagne-deep/50 bg-ivory px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft"
          />

          <input
            type="text"
            value={event.locationUrl}
            onChange={updateEvent(index, 'locationUrl')}
            placeholder="Location URL (optional)"
            className="mt-3 w-full rounded-lg border border-champagne-deep/50 bg-ivory px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft"
          />

          {venuePhotoHint && (
            <div className="mt-3">
              <SinglePhotoUploader
                shape="wide"
                label="Venue photo"
                hint={venuePhotoHint}
                url={event.venuePhoto}
                onChange={(url) => updateEvent(index, 'venuePhoto')({ target: { value: url } })}
                endpoint={uploadEndpoint}
                token={uploadToken}
              />
            </div>
          )}
        </div>
      ))}

      {events.length < MAX_ADDITIONAL_EVENTS && (
        <button
          type="button"
          onClick={addEvent}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-champagne-deep/60 py-3 text-sm text-ink-soft transition-colors hover:border-gold-soft hover:text-ink"
        >
          <Plus className="h-4 w-4" />
          Add Another Event
        </button>
      )}
    </div>
  )
}
