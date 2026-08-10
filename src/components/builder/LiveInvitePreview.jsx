// The Invitation Builder's live preview (see CreateInvitePage.jsx).
//
// Wedding and Ganesh Chaturthi invites get the REAL page in a phone frame:
// an iframe loading LiveDraftPreviewPage.jsx, which renders the exact same
// <InvitationExperience>/<GaneshExperience> component tree a guest gets at
// /i/:slug — envelope/curtain-or-door reveal, timeline/muhurat schedule,
// gallery, RSVP form, Wishes Wall, the works — built from the same
// buildWeddingExperienceTemplate()/buildGaneshExperienceTemplate() the real
// generated page uses. It's a genuine separate document (rather than
// inlining that tree on this page) specifically so that component's
// `position: fixed` chrome, `min-h-svh` sections, and scroll-linked
// animations measure against ITS OWN viewport — sized to a phone by the
// frame below — instead of the desktop builder page around it. Current form
// state is handed across via sessionStorage (see
// utils/draftInvitePreview.js), which the iframe picks up live as the
// buyer types, no polling required.
//
// Guruji Satsang routes through bespoke per-template experience components
// that don't yet support an external slug override (see
// GeneratedInvitePage.jsx) — that occasion keeps the lighter hero-card
// preview below, still phone-framed for consistency.
import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Clock, Heart, MapPin, MessagesSquare } from 'lucide-react'
import InvitePreviewCard from './InvitePreviewCard'
import MobilePreviewFrame from './MobilePreviewFrame'
import { formatInviteDate, formatInviteTime, mapsSearchUrl } from '../../utils/formatInviteDateTime'
import { iconForEventTitle } from '../../utils/eventIcon'
import { writeDraftInvitePreview } from '../../utils/draftInvitePreview'

function TimelineEntry({ palette, title, date, time, venue }) {
  const Icon = iconForEventTitle(title)
  return (
    <div className="flex gap-3">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${palette.goldSoft}30`, color: palette.gold }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 pb-4">
        <p className="truncate text-sm font-medium" style={{ color: palette.ink }}>
          {title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs" style={{ color: palette.inkSoft }}>
          {date && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {date}
            </span>
          )}
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {time}
            </span>
          )}
        </p>
        {venue && (
          <p className="mt-0.5 flex items-start gap-1 text-xs" style={{ color: palette.inkSoft }}>
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="leading-snug">{venue}</span>
          </p>
        )}
      </div>
    </div>
  )
}

function GenericHeroPreview({ template, values, photos, events, isWedding }) {
  const { palette } = template
  // "Additional Events" and the "Function Name" field only exist for the
  // wedding occasion (see CreateInvitePage.jsx) — for Ganesh
  // Chaturthi/Guruji Satsang, `values.eventTitle`/`events` are always
  // empty, and their one event's date/time/venue is already shown on the
  // hero card above, so there's nothing timeline-shaped to add here (and
  // showing one anyway used to hardcode a misleading "Wedding Ceremony"
  // title on non-wedding previews).
  const timeline = isWedding
    ? [
        {
          title: values.eventTitle.trim() || 'Wedding Ceremony',
          date: formatInviteDate(values.date || template.example.date),
          time: formatInviteTime(values.time || template.example.time),
          venue: values.venue.trim() || template.example.venue,
        },
        ...events
          .filter((ev) => ev.title.trim() || ev.venue.trim())
          .map((ev) => ({
            title: ev.title.trim() || 'Untitled Event',
            date: formatInviteDate(ev.date),
            time: formatInviteTime(ev.time),
            venue: ev.venue.trim(),
          })),
      ]
    : []

  return (
    <>
      <InvitePreviewCard template={template} values={values} bare />

      {timeline.length > 0 && (
        <div className="px-6 py-6" style={{ background: palette.ivory }}>
          <p className="mb-4 text-center text-[10px] uppercase tracking-[0.25em]" style={{ color: palette.inkSoft }}>
            Event Details
          </p>
          {timeline.map((event, index) => (
            <TimelineEntry key={index} palette={palette} {...event} />
          ))}
        </div>
      )}

      {photos.length > 0 && (
        <div className="px-6 pb-6" style={{ background: palette.ivory }}>
          <p className="mb-3 text-center text-[10px] uppercase tracking-[0.25em]" style={{ color: palette.inkSoft }}>
            Our Moments
          </p>
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, 6).map((url) => (
              <div key={url} className="aspect-square overflow-hidden rounded-lg">
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="mx-6 mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs"
        style={{ borderColor: `${palette.goldSoft}60`, background: `${palette.blush}30`, color: palette.inkSoft }}
      >
        <MessagesSquare className="h-3.5 w-3.5 shrink-0" style={{ color: palette.rose }} />
        Guests will be able to RSVP and leave wishes right on your live page.
      </div>

      <div className="flex flex-col items-center gap-1 px-6 pb-8 pt-2 text-center" style={{ background: palette.ivory }}>
        <Heart className="h-3.5 w-3.5" style={{ color: palette.rose }} />
        <p className="text-xs" style={{ color: palette.inkSoft }}>
          With love &amp; gratitude
        </p>
      </div>
    </>
  )
}

// The iframe renders at a real phone's layout size — not the frame's own
// (smaller) visible box — so InvitationExperience wraps text, spaces
// sections, and sizes its `min-h-svh` hero exactly as it would on an
// actual device. A CSS transform then scales that real layout down to fit
// the frame below, the same "device preview" technique design tools use:
// what's inside is never re-flowed to fit a narrower screen, just shown
// smaller.
const DEVICE_WIDTH = 375
const DEVICE_HEIGHT = 812
// Matches MobilePreviewFrame's screen width: its outer shell is
// max-w-[320px] with a 6px border and 8px padding on each side
// (320 - 2*6 - 2*8 = 292).
const FRAME_SCREEN_WIDTH = 292
const DEVICE_SCALE = FRAME_SCREEN_WIDTH / DEVICE_WIDTH

export default function LiveInvitePreview({ template, values, occasionId, photos = [], events = [], song = null }) {
  const isWedding = occasionId === 'wedding'
  // Wedding and Ganesh Chaturthi both render the real bespoke component
  // tree in the iframe below (InvitationExperience / GaneshExperience — see
  // LiveDraftPreviewPage.jsx, which branches on the draft's own
  // `occasionId`); Guruji Satsang still gets the lighter hero-card preview.
  const isRichPreview = isWedding || occasionId === 'ganesh-chaturthi'

  // The iframe's own first mount — fetching/parsing its JS, then React
  // mounting the real InvitationExperience tree (envelope animation,
  // background motif, everything) — is real, synchronous-ish work that
  // briefly competes for the main thread. Buyers land on this page and
  // start typing their names within the first second far more often than
  // not, so mounting the iframe immediately meant that very first,
  // longest name could get its keystrokes lost or scrambled while the
  // preview was still cold-starting underneath it. A ~600ms head start
  // (rendering the same lightweight hero card the non-wedding preview
  // uses in the meantime) lets that settle before the iframe ever exists.
  const [iframeReady, setIframeReady] = useState(false)
  useEffect(() => {
    if (!isRichPreview) return
    const timer = setTimeout(() => setIframeReady(true), 600)
    return () => clearTimeout(timer)
  }, [isRichPreview])

  // Keeps the iframe's sessionStorage-backed draft (see
  // utils/draftInvitePreview.js) in sync with typing/uploads — writing
  // fires a `storage` event on the iframe's window, which
  // LiveDraftPreviewPage listens for to re-render with the new data.
  // Debounced rather than written on every keystroke: each write triggers
  // a full re-render of the real InvitationExperience tree inside the
  // iframe (envelope, floating-icon animations, scroll-linked transforms
  // and all), and doing that synchronously on every character was heavy
  // enough to visibly stall typing — long names in particular would drop
  // keystrokes because the input's own re-render kept getting stuck behind
  // the iframe's.
  const draftTimer = useRef(null)
  useEffect(() => {
    if (!isRichPreview) return
    clearTimeout(draftTimer.current)
    draftTimer.current = setTimeout(() => {
      writeDraftInvitePreview({
        // LiveDraftPreviewPage.jsx reads this to decide which real
        // component tree/build function to render — wedding vs. Ganesh
        // Chaturthi (Guruji Satsang never reaches here, see isRichPreview
        // above).
        occasionId,
        templateId: template.id,
        names: values.names.trim() || template.example.names,
        eventTitle: values.eventTitle,
        date: values.date || template.example.date,
        time: values.time || template.example.time,
        venue: values.venue.trim() || template.example.venue,
        locationUrl: values.locationUrl,
        message: values.message,
        events,
        photos,
        // Background Music Selection (see builder/SongSearchPicker.jsx) —
        // same camelCase field names buildWeddingExperienceTemplate.js /
        // buildGaneshExperienceTemplate.js read from a real saved invite,
        // so this draft needs no separate mapping to preview correctly.
        bgSongTitle: song?.title || '',
        bgSongArtist: song?.artist || '',
        bgSongAlbumArt: song?.albumArt || '',
        bgSongPreviewUrl: song?.previewUrl || '',
      })
    }, 300)
    return () => clearTimeout(draftTimer.current)
  }, [isRichPreview, occasionId, template, values, events, photos, song])

  const showIframe = isRichPreview && iframeReady

  return (
    <MobilePreviewFrame
      screenHeight={showIframe ? DEVICE_HEIGHT * DEVICE_SCALE : 600}
      scroll={!showIframe}
    >
      {showIframe ? (
        <iframe
          title="Live invitation preview"
          src="/create/live-preview"
          style={{
            width: DEVICE_WIDTH,
            height: DEVICE_HEIGHT,
            border: 0,
            transform: `scale(${DEVICE_SCALE})`,
            transformOrigin: 'top left',
          }}
          allow="autoplay"
        />
      ) : (
        <GenericHeroPreview
          template={template}
          values={values}
          photos={photos}
          events={events}
          isWedding={isWedding}
        />
      )}
    </MobilePreviewFrame>
  )
}
