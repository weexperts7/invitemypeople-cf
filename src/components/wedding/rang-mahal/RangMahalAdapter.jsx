import RangMahalTemplate from '../../templates/RangMahalTemplate/RangMahalTemplate.tsx'

// Adapts the site's shared wedding template shape (see
// RoyalPlumCurtainAdapter.jsx's header comment — same input, whether it's
// the catalog demo entry or a buyer's invite merged by
// buildWeddingExperienceTemplate.js) into RangMahalTemplate's own `data`
// prop (RangMahalTemplateDataInput — see
// ../../templates/RangMahalTemplate/types.ts).

const DEFAULT_BG_MUSIC_URL = '/audio/default-background-music.mp3'

// Same "A & B" split RoyalPlumCurtainAdapter.jsx uses for couple.names.
function splitCoupleNames(names) {
  const parts = (names || '')
    .split(/\s*&\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return [parts[0], parts[1]]
  if (parts.length === 1) return [parts[0], '']
  return ['', '']
}

function toRangMahalEvents(ceremonies) {
  return (ceremonies ?? []).map((c, i) => ({
    id: `${(c.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    name: c.title,
    dateLabel: c.date,
    timing: c.time,
    venue: { name: c.venue, mapUrl: c.mapHref || undefined, photo: c.venuePhoto || undefined },
  }))
}

export default function RangMahalAdapter({ template, invitationSlug, onOpen, rsvpEndpoint }) {
  const [firstName, secondName] = splitCoupleNames(template?.couple?.names)
  const photos = (template?.photos ?? []).filter((p) => typeof p === 'string' && p)

  return (
    <RangMahalTemplate
      onOpen={onOpen}
      data={{
        couple: { firstName, secondName },
        greetingLine: template?.greeting?.line,
        invitationLine: template?.couple?.invitationLine,
        families: template?.couple?.portraits ?? template?.couple?.people ?? [],
        weddingDateISO: template?.weddingDate,
        events: toRangMahalEvents(template?.ceremonies),
        // A buyer's own uploads win; otherwise the template's stock gallery,
        // the same fallback PhotoGallery.jsx gives every other template.
        photos: photos.length ? photos : undefined,
        // The builder promises "a soft default track" when no song is picked.
        musicUrl: template?.bgMusic?.previewUrl || DEFAULT_BG_MUSIC_URL,
        hashtag: template?.hashtag || undefined,
        shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        invitationSlug,
        rsvpEndpoint,
        whatsappMessage: `You're invited to the wedding of ${template?.couple?.names ?? 'our dear ones'}! Open the card and pull the latkan 🪔 {link}`,
      }}
    />
  )
}
