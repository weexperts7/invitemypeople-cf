import { formatInviteDate, formatInviteTime, mapsSearchUrl } from './formatInviteDateTime'
import { iconForEventTitle } from './eventIcon'

// Formats one buyer-submitted event (main or additional) into the shape
// EventTimeline.jsx expects.
function toCeremony({ title, date, time, venue, locationUrl }) {
  return {
    icon: iconForEventTitle(title),
    title,
    date: formatInviteDate(date),
    time: formatInviteTime(time),
    venue,
    mapHref: locationUrl?.trim() || mapsSearchUrl(venue),
  }
}

// Wedding invites get the same full envelope/scratch-card/timeline/gallery
// experience every pre-built template uses (see InvitationExperience.jsx),
// built from a merged object: palette/motif/fonts/etc. from the selected
// builder template, but names/date/venue/message overridden with what the
// buyer actually submitted. The timeline shows the buyer's own real
// event(s) — the main one plus any "Additional Events" they added (see
// builder/EventsListEditor.jsx) — not the stock multi-ceremony schedule
// those templates ship with as a demo.
// Real uploaded photos (see builder/PhotoUploader.jsx) win over the
// template's stock "Our Moments" gallery when the buyer added any — but
// deliberately NOT the circular hero-photo medallion: that frame's tight
// circular crop was designed around specific pre-vetted stock photos, and
// forcing an arbitrary upload into it crops faces/framing unpredictably.
// The hero medallion stays whatever the template itself ships (often
// nothing).
//
// Shared by GeneratedInvitePage.jsx (the real, paid /i/:slug page) and
// LiveDraftPreviewPage.jsx (the Invitation Builder's own live preview, see
// builder/LiveInvitePreview.jsx) — both feed it the same-shaped
// `{ names, eventTitle, date, time, venue, locationUrl, message, events,
// photos }` object so the preview a buyer sees while building is built by
// the exact same function as the page their guests eventually get, not a
// hand-maintained approximation of it.
export function buildWeddingExperienceTemplate(invite, template) {
  const photos = invite.photos?.length ? invite.photos : []
  const mainEvent = toCeremony({
    title: invite.eventTitle?.trim() || 'Wedding Ceremony',
    date: invite.date,
    time: invite.time,
    venue: invite.venue,
    locationUrl: invite.locationUrl,
  })
  const additionalEvents = (invite.events ?? []).map(toCeremony)

  // "Family Details" (see CreateInvitePage.jsx) — the two cards
  // WelcomeSplash.jsx renders under the couple's names (couple.people, same
  // { name, parents } shape every demo template in templatesData.js
  // already ships, e.g. "Son of Mr. Rajesh & Mrs. Kavita Malhotra"). Both
  // sides are independently optional: a buyer who fills in only one still
  // gets that one card, and leaving both blank reproduces today's
  // behavior (an empty array — WelcomeSplash renders nothing there).
  const people = [
    invite.groomName?.trim() && { name: invite.groomName.trim(), parents: invite.groomParents?.trim() || '' },
    invite.brideName?.trim() && { name: invite.brideName.trim(), parents: invite.brideParents?.trim() || '' },
  ].filter(Boolean)

  return {
    ...template,
    couple: {
      names: invite.names,
      invitationLine: invite.message?.trim() || template.connective,
      people,
    },
    // The short invocation at the top of the hero (WelcomeSplash.jsx's
    // greeting.line — "Shubh Vivah", "Radhe Radhe", "Rab Rakha", "Together
    // With Love", ...). Same override shape as couple.invitationLine above:
    // the buyer's own text wins when they typed one (see CreateInvitePage.jsx's
    // "Opening Greeting" field), the template's own stock line otherwise.
    // `symbol` (the Om/Ik Onkar/etc. glyph, when the template has one)
    // deliberately never comes from the buyer — it's tied to that
    // template's own tradition, and a free-text line paired with a
    // mismatched glyph would read as a mistake, not personalization.
    greeting: {
      symbol: template.greeting?.symbol,
      line: invite.greetingLine?.trim() || template.greeting?.line,
    },
    ceremoniesHeading: 'Event Details',
    ceremonies: [mainEvent, ...additionalEvents],
    weddingDate: invite.time ? `${invite.date}T${invite.time}:00` : `${invite.date}T00:00:00`,
    photos,
    // Background Music Selection (see builder/SongSearchPicker.jsx) — null
    // when the host never confirmed a song, so InvitationExperience.jsx
    // renders no <audio> element at all rather than a silent one. Gated on
    // bgSongPreviewUrl specifically: that's the one field playback actually
    // needs, and it's only ever set together with the other three.
    bgMusic: invite.bgSongPreviewUrl
      ? {
          title: invite.bgSongTitle,
          artist: invite.bgSongArtist,
          albumArt: invite.bgSongAlbumArt,
          previewUrl: invite.bgSongPreviewUrl,
        }
      : null,
    // Admin-only, Mahogany Seal template only (see
    // MahoganySealAdapter.jsx) — null for every other invite. Carried
    // through here so that adapter, which only ever sees this merged
    // `template` object (never the raw `invite`), can read it.
    caricatureVideoUrl: invite.caricatureVideoUrl || null,
    hashtag: invite.hashtag || null,
  }
}
