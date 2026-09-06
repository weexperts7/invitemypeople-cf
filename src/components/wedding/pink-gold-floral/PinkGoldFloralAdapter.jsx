import PinkGoldFloralTemplate from '../../templates/PinkGoldFloralTemplate/PinkGoldFloralTemplate'

// Adapts the site's shared wedding template shape (couple.names as a single
// "A & B" string, ceremonies as [{title, date, time, venue, mapHref}],
// weddingDate as a flat "YYYY-MM-DDTHH:mm:ss" string — see
// templatesData.js's comment block) into PinkGoldFloralTemplate's own typed
// `data` prop (PinkGoldFloralTemplateData — see
// ../../templates/PinkGoldFloralTemplate/PinkGoldFloralTemplate.tsx's own
// type block). Mirrors MahoganySealAdapter.jsx/RoyalPlumCurtainAdapter.jsx
// next door — same pattern, just this template's own field names.

// "Aarav & Diya" is the site-wide convention for `couple.names` (see
// builderTemplates.js's own namesPlaceholder copy) — split on the same
// separator. Falls back to treating the whole string as one name rather
// than guessing, so a buyer who types something unusual still gets *a*
// name instead of "undefined & undefined".
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
// address field) and a `mapHref` — same shape every other adapter's own
// toXEvents() converts, just into PinkGoldFloralEvent's field names.
function toPinkGoldFloralEvents(ceremonies) {
  return (ceremonies ?? []).map((c, i) => ({
    id: `${(c.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    name: c.title,
    dateLabel: c.date,
    time: c.time,
    venue: { name: c.venue, mapUrl: c.mapHref || undefined },
  }))
}

// The "core event details" arch card needs one specific ceremony to anchor
// its date/time/venue — unlike the timeline below it, which just lists
// every ceremony in order. There's no dedicated field for that on the
// shared wedding template shape, so this finds whichever ceremony actually
// falls on `weddingDate`'s calendar day (for a real invite that's always
// `ceremonies[0]` — buildWeddingExperienceTemplate.js builds that entry
// from the exact same `invite.date`/`invite.time` used to build
// `weddingDate` itself — but matching by date rather than hard-coding index
// 0 also does the right thing for templatesData.js's own demo entry below,
// whose ceremonies aren't guaranteed to list the wedding day first).
// Falls back to the first ceremony if nothing matches (e.g. no ceremonies
// carry a parseable date).
function findMainCeremony(ceremonies, weddingDateISO) {
  const list = ceremonies ?? []
  if (!list.length) return null
  const weddingDate = weddingDateISO ? new Date(weddingDateISO) : null
  if (weddingDate && !Number.isNaN(weddingDate.getTime())) {
    const sameDay = list.find((c) => {
      const d = new Date(c.date)
      return (
        !Number.isNaN(d.getTime()) &&
        d.getFullYear() === weddingDate.getFullYear() &&
        d.getMonth() === weddingDate.getMonth() &&
        d.getDate() === weddingDate.getDate()
      )
    })
    if (sameDay) return sameDay
  }
  return list[0]
}

function formatTimeLabel(mainCeremony, weddingDateISO) {
  if (mainCeremony?.time) return `${mainCeremony.time} onwards`
  const d = weddingDateISO ? new Date(weddingDateISO) : null
  if (!d || Number.isNaN(d.getTime())) return undefined
  return `${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })} onwards`
}

export default function PinkGoldFloralAdapter({ template, invitationSlug, onOpen, rsvpEndpoint }) {
  if (!invitationSlug) {
    // Catalog-preview traffic (WeddingRoute in App.jsx,
    // /templates/wedding/pink-gold-floral) — same "render the curated demo
    // dataset untouched" early return MahoganySealAdapter uses, so the
    // showcase always matches PinkGoldFloralTemplate's own DEFAULT_DATA/
    // DEFAULT_ASSETS exactly.
    return <PinkGoldFloralTemplate onOpen={onOpen} />
  }

  const [brideName, groomName] = splitCoupleNames(template?.couple?.names)
  const mainCeremony = findMainCeremony(template?.ceremonies, template?.weddingDate)

  return (
    <PinkGoldFloralTemplate
      onOpen={onOpen}
      rsvpEndpoint={rsvpEndpoint}
      bg_music_url={template?.bgMusic?.previewUrl || undefined}
      data={{
        blessingLine: template?.greeting?.line,
        couple: { brideName, groomName },
        invitationMessage: template?.couple?.invitationLine,
        weddingDateISO: template?.weddingDate,
        weddingTimeLabel: formatTimeLabel(mainCeremony, template?.weddingDate),
        mainVenue: mainCeremony?.venue
          ? { name: mainCeremony.venue, mapUrl: mainCeremony.mapHref || undefined }
          : undefined,
        events: toPinkGoldFloralEvents(template?.ceremonies),
        // No generic field on the shared wedding template shape carries a
        // buyer's phone number through to this `template` object (see
        // buildWeddingExperienceTemplate.js — it's collected as
        // `invite.hostPhone` but never merged in). Explicitly clearing
        // `phone` here (rather than just omitting the whole `host` key)
        // stops withPinkGoldFloralDefaults() from falling back to its own
        // demo contact ("Geeta Singh, +91 98765 43210") on a REAL invite —
        // spreading a key whose value is `undefined` overwrites the
        // fallback's real value with `undefined`, the same deliberate
        // mechanism MahoganySealAdapter's own header comment documents (and
        // warns not to do by accident elsewhere). The footer's "Questions?
        // Reach..." line is gated on `host.phone` being truthy, so this
        // simply hides that line on real invites instead of showing a
        // stranger's number.
        host: { phone: undefined },
        invitationSlug,
      }}
    />
  )
}
