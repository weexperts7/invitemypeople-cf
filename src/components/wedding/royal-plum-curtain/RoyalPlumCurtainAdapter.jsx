import RoyalPlumTemplate from '../../templates/RoyalPlumCurtainTemplate/RoyalPlumTemplate.tsx'

// Adapts the site's shared wedding template shape (couple.names as a single
// "A & B" string, couple.people as [{name, parents}], ceremonies as
// [{icon, title, date, time, venue, mapHref}], weddingDate as a flat
// "YYYY-MM-DDTHH:mm:ss" string — see templatesData.js's comment block) into
// RoyalPlumCurtainTemplate's own typed `data` prop
// (RoyalPlumTemplateData — see ../../templates/RoyalPlumCurtainTemplate/types.ts).
//
// This one function is what both catalog-preview and real-purchase traffic
// flow through: the demo entry in templatesData.js and a buyer's own
// customized invite (see buildWeddingExperienceTemplate.js, which spreads
// `...template` and overrides couple/ceremonies/weddingDate/greeting with
// what the buyer actually typed) are both just "the shared wedding template
// shape" by the time they reach here — same as every other bespoke
// Ganesh/Satsang layout consuming its own category's shared shape.

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
// address field) and, for a buyer-customized invite only, a `mapHref` — see
// buildWeddingExperienceTemplate.js's toCeremony(). RoyalPlumTemplate's own
// venue.mapUrl fallback (Google Maps search from name+address) kicks in
// automatically for the demo catalog entry, which has no mapHref.
function toRoyalPlumEvents(ceremonies) {
  return (ceremonies ?? []).map((c, i) => ({
    id: `${(c.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    name: c.title,
    timing: c.time,
    dateLabel: c.date,
    venue: { name: c.venue, mapUrl: c.mapHref || undefined },
  }))
}

export default function RoyalPlumCurtainAdapter({ template, invitationSlug, onOpen }) {
  const [nameA, nameB] = splitCoupleNames(template?.couple?.names)
  const people = template?.couple?.people ?? []

  return (
    <RoyalPlumTemplate
      onOpen={onOpen}
      data={{
        couple: {
          brideName: nameA,
          groomName: nameB,
          // Falls back to RoyalPlumTemplate's own gold-monogram placeholder
          // (see ParticleHero.tsx) when the template has no heroPhoto —
          // true for every wedding template today, this one included.
          caricatureUrl: template?.heroPhoto?.src,
          caricatureAlt: template?.heroPhoto?.alt,
        },
        parents: {
          brideParents: people[0]?.parents || '',
          groomParents: people[1]?.parents || '',
        },
        weddingDateISO: template?.weddingDate,
        events: toRoyalPlumEvents(template?.ceremonies),
        gratitudeMessage: template?.couple?.invitationLine,
        shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        invitationSlug,
        whatsapp: {
          message: `You're lovingly invited to the wedding of ${template?.couple?.names ?? 'our'}! 💛 Join us as we begin our forever. {link}`,
        },
      }}
    />
  )
}
