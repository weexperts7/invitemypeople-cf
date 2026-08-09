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

  return {
    ...template,
    couple: {
      names: invite.names,
      invitationLine: invite.message?.trim() || template.connective,
      people: [],
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
  }
}
