// Shared validation for the Invitation Builder's "Additional Events" list
// (see CreateInvitePage.jsx) — used by both the local-dev Express route
// (server/index.js) and its Vercel Serverless counterpart
// (api/invites/index.js), so the two stay easy to compare. Takes the
// caller's own clean(value, max) trimmer/capper as a parameter rather than
// importing one, matching how clean() itself is already duplicated between
// those two files (see api/_lib/invites.js's own comment on that).
export const MAX_ADDITIONAL_EVENTS = 5

export function cleanEvents(rawEvents, clean) {
  if (!Array.isArray(rawEvents)) return []
  return rawEvents
    .slice(0, MAX_ADDITIONAL_EVENTS)
    .map((e) => ({
      title: clean(e?.title, 80),
      date: clean(e?.date, 20),
      time: clean(e?.time, 10),
      venue: clean(e?.venue, 200),
      locationUrl: clean(e?.locationUrl, 500),
      venuePhoto: clean(e?.venuePhoto, 500),
    }))
    // Drop rows the buyer added then left entirely blank.
    .filter((e) => e.title || e.date || e.venue)
}
