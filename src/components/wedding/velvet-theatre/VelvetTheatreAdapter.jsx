import VelvetTheatreTemplate from '../../templates/VelvetTheatreTemplate/VelvetTheatreTemplate.tsx'

// Adapts the site's shared wedding template shape (see
// RoyalPlumCurtainAdapter.jsx's header comment — same input, whether it's
// the catalog demo entry or a buyer's invite merged by
// buildWeddingExperienceTemplate.js) into VelvetTheatreTemplate's own
// `data` prop (VelvetTheatreTemplateDataInput — see
// ../../templates/VelvetTheatreTemplate/types.ts).

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

function toTheatreEvents(ceremonies) {
  return (ceremonies ?? []).map((c, i) => ({
    id: `${(c.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    name: c.title,
    dateLabel: c.date,
    timing: c.time,
    venue: { name: c.venue, mapUrl: c.mapHref || undefined },
  }))
}

export default function VelvetTheatreAdapter({ template, invitationSlug, onOpen, rsvpEndpoint }) {
  const [firstName, secondName] = splitCoupleNames(template?.couple?.names)
  const photos = (template?.photos ?? []).filter((p) => typeof p === 'string' && p)

  return (
    <VelvetTheatreTemplate
      onOpen={onOpen}
      data={{
        couple: { firstName, secondName },
        greetingLine: template?.greeting?.line,
        invitationLine: template?.couple?.invitationLine,
        families: template?.couple?.people ?? [],
        weddingDateISO: template?.weddingDate,
        events: toTheatreEvents(template?.ceremonies),
        // A buyer's own uploads win; the catalog demo falls back to the
        // template's mock gallery (undefined → withVelvetTheatreDefaults).
        photos: photos.length ? photos : undefined,
        // The host's own pick when they chose a song; otherwise the same
        // default loop InvitationExperience.jsx falls back to, since the
        // builder promises "we'll play a soft default track instead".
        musicUrl: template?.bgMusic?.previewUrl || DEFAULT_BG_MUSIC_URL,
        shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        invitationSlug,
        rsvpEndpoint,
        whatsappMessage: `You're invited to the wedding of ${template?.couple?.names ?? 'our dear friends'}! Take your seat — the curtains are about to rise 🎭 {link}`,
      }}
    />
  )
}
