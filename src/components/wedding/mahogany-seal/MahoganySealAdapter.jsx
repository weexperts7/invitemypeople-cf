import MahoganySealTemplate from '../../templates/MahoganySealTemplate'

// Adapts the site's shared wedding template shape (couple.names as a single
// "A & B" string, ceremonies as [{title, date, time, venue, mapHref}],
// weddingDate as a flat "YYYY-MM-DDTHH:mm:ss" string — see
// templatesData.js's comment block, and RoyalPlumCurtainAdapter.jsx next
// door for the identical pattern this mirrors) into MahoganySealTemplate's
// own typed `data` prop (MahoganySealTemplateData — see
// ../../templates/MahoganySealTemplate/types.ts).
//
// Real invite traffic only: a REAL invite (minted by AdminCreateInvitePage.jsx
// — see api/_lib/adminCreateInvite.js's own header on why this template is
// selectable there despite having no self-service checkout) always carries
// an `invitationSlug` (required for its RSVP form — see
// MahoganySealTemplateData's own comment on that field). Catalog-preview
// traffic (WeddingRoute in App.jsx, /templates/wedding/mahogany-seal) never
// passes one, so it keeps rendering the curated showcase dataset
// (mockData.ts) exactly as this file always has — nothing changes there.
//
// Deliberately partial: this template's background track and its
// scratch-reveal secret are bespoke assets no invite-creation form
// collects (see MahoganySealCreatePage.jsx's own header) — those fields
// are left unset here on purpose so withMahoganySealDefaults() (defaults.ts)
// fills them from the same curated demo assets, exactly the "degrades
// gracefully" contract that function already documents.
//
// IMPORTANT: withMahoganySealDefaults() merges `couple` with a plain
// object spread (`{ ...fallback.couple, ...input?.couple }`) — spreading a
// key whose VALUE is `undefined` still overwrites the fallback's real
// value with `undefined` (unlike the `||`/`??`/length-check fallbacks
// every other field below uses). `coupleData` is therefore built by only
// ever adding a key when there's real data for it, never assigning one to
// `undefined` — the bug an earlier version of this file had, which
// silently broke the hero photo (rendered as `<img src={undefined}>`,
// nothing but a broken-image icon) and the hashtag the same way.
function splitCoupleNames(names) {
  const parts = (names || '')
    .split(/\s*&\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length >= 2) return [parts[0], parts[1]]
  if (parts.length === 1) return [parts[0], '']
  return ['', '']
}

// `template.ceremonies` entries have one flat `venue` string (no separate
// address field) and a `mapHref` — same shape RoyalPlumCurtainAdapter's own
// toRoyalPlumEvents() converts, just into MahoganySealEvent's slightly
// different field names (`dateLabel` instead of `date`, an object `venue`
// instead of a bare string).
function toMahoganyEvents(ceremonies) {
  return (ceremonies ?? []).map((c, i) => ({
    id: `${(c.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    name: c.title,
    dateLabel: c.date,
    time: c.time,
    venue: { name: c.venue, mapUrl: c.mapHref || undefined },
  }))
}

export default function MahoganySealAdapter({ template, invitationSlug, onOpen, rsvpEndpoint }) {
  if (!invitationSlug) {
    return <MahoganySealTemplate onOpen={onOpen} />
  }

  const [name1, name2] = splitCoupleNames(template?.couple?.names)
  const galleryPhotos = template?.photos ?? []
  // The couple's hero portrait at the top of the page is simply their
  // first uploaded gallery photo (see AdminCreateInvitePage.jsx's "Gallery
  // Photos" field) — there's no separate, dedicated hero-photo upload.
  const heroPhotoUrl = galleryPhotos[0]

  const coupleData = { name1, name2 }
  if (heroPhotoUrl) {
    coupleData.caricatureUrl = heroPhotoUrl
    coupleData.caricatureAlt = `${name1} & ${name2}`
  }
  // Admin-entered (see AdminCreateInvitePage.jsx's "Wedding Hashtag"
  // field, 0015_admin_mahogany_hashtag.sql) — left blank, this key is
  // simply absent, so withMahoganySealDefaults() keeps the demo couple's
  // own hashtag instead of showing nothing.
  if (template?.hashtag) coupleData.hashtag = template.hashtag

  return (
    <MahoganySealTemplate
      onOpen={onOpen}
      // A live, guest-facing invite never shows the "buy this template"
      // WhatsApp CTA this component renders internally by default — that's
      // only for the catalog-preview render above (showCreateCta defaults
      // true there, matching every prior caller of this component).
      showCreateCta={false}
      // PartnerInviteViewerPage.jsx passes '/api/partners/rsvps' down
      // through InvitationExperience -> here for a partner-created invite
      // (/p/:slug); GeneratedInvitePage.jsx (/i/:slug) passes nothing, so
      // this stays undefined and RsvpForm falls back to '/api/rsvps'.
      rsvpEndpoint={rsvpEndpoint}
      data={{
        couple: coupleData,
        weddingDateISO: template?.weddingDate,
        events: toMahoganyEvents(template?.ceremonies),
        galleryPhotos,
        // Falls back to the curated demo intro clip (mockData.ts, via
        // withMahoganySealDefaults()) whenever an admin didn't upload one —
        // exactly the "same default caricature video" fallback requested.
        videoSrc: template?.caricatureVideoUrl || undefined,
        // Background Music Selection (see AdminCreateInvitePage.jsx's
        // SongSearchPicker, same Spotify-preview-clip picker every other
        // template uses) — buildWeddingExperienceTemplate.js already
        // resolves this to `bgMusic.previewUrl` (or null if no song was
        // confirmed). Falls back to the curated demo track when unset,
        // same as videoSrc above.
        musicUrl: template?.bgMusic?.previewUrl || undefined,
        // The admin/partner form's "Footer Message" field (see
        // AdminCreateInvitePage.jsx's relabeling for this template) —
        // buildWeddingExperienceTemplate.js already puts whatever the
        // buyer typed (or the template's own stock line) here.
        gratitudeMessage: template?.couple?.invitationLine,
        invitationSlug,
      }}
    />
  )
}
