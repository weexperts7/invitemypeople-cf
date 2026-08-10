import { getGaneshTemplateBySlug } from '../data/ganeshTemplatesData'
import { formatInviteDate, formatInviteTime } from './formatInviteDateTime'

// Finds the buyer's "Festival Schedule" entry (see builder/EventsListEditor.jsx,
// reused for Ganesh Chaturthi as CreateInvitePage.jsx's "Festival Schedule"
// section) matching a session by a case-insensitive substring of its title —
// CreateInvitePage.jsx auto-seeds rows titled exactly "Morning Aarti" /
// "Evening Aarti" / "Visarjan Yatra" / "Maha Prasad", but a buyer who
// retitles or reorders them still matches as long as the keyword survives.
function findSession(events, keyword) {
  return (events ?? []).find((e) => (e?.title || '').toLowerCase().includes(keyword))
}

// Ganesh Chaturthi invites get the same full bespoke-layout treatment every
// pre-built template uses (see GaneshExperience.jsx) — built from a merged
// object: the full catalog template (palette/motif/layout/puja/moments/
// event — see getGaneshTemplateBySlug in ganeshTemplatesData.js, looked up
// via the builder template's `sourceId`) with host/event/photos/music
// overridden by what the buyer actually submitted. Any schedule field the
// buyer left blank falls back to the base template's own baked-in example
// value, so a generated invite never renders an empty "undefined" — same
// graceful-fallback spirit as buildWeddingExperienceTemplate.js.
//
// Shared by GeneratedInvitePage.jsx (the real, paid /i/:slug page) and
// LiveDraftPreviewPage.jsx (the Invitation Builder's own live preview, see
// builder/LiveInvitePreview.jsx) — both feed it the same-shaped
// `{ names, eventTitle, date, time, venue, message, events, photos,
// bgSong* }` object CreateInvitePage.jsx collects.
export function buildGaneshExperienceTemplate(invite, builderTemplate) {
  const base = getGaneshTemplateBySlug(builderTemplate.sourceId) ?? builderTemplate
  const events = invite.events ?? []

  const morning = findSession(events, 'morning')
  const evening = findSession(events, 'evening')
  const visarjan = findSession(events, 'visarjan')
  const prasad = findSession(events, 'prasad')

  // Any row a buyer added beyond the four auto-seeded ones (see
  // CreateInvitePage.jsx's "+ Add Another Event", capped at
  // MAX_ADDITIONAL_EVENTS) — or one of the four they retitled away from a
  // matchable keyword — would otherwise vanish silently: nothing above
  // reads it once it stops matching morning/evening/visarjan/prasad. Every
  // Ganesh layout renders `event.extraSessions` as its own generic
  // "additional session" row/card, right after the four named ones, so a
  // custom entry (e.g. "Ganesh Sthapana Procession") always shows up
  // somewhere on the invitation instead of being dropped.
  const known = new Set([morning, evening, visarjan, prasad].filter(Boolean))
  const extraSessions = events
    .filter((e) => !known.has(e) && (e?.title?.trim() || e?.date || e?.time))
    .map((e) => ({
      title: e.title?.trim() || 'Special Session',
      date: e.date ? formatInviteDate(e.date) : '',
      time: e.time ? formatInviteTime(e.time) : '',
      venue: e.venue?.trim() || '',
    }))

  // Real uploaded photos (see builder/PhotoUploader.jsx) win over the base
  // template's curated "Sacred Moments" — reused as-is by
  // GaneshMomentsGallery.jsx, which already accepts this generic
  // `{src, caption}` shape (see royal-durbar-darshan/GaneshMomentsGallery.jsx).
  const moments = invite.photos?.length
    ? invite.photos.map((src) => ({ src, caption: 'A cherished moment from the celebration' }))
    : base.moments

  return {
    ...base,
    host: {
      familyName: invite.names,
      hostLine: invite.message?.trim() || builderTemplate.connective,
    },
    event: {
      ...base.event,
      sthapanaDate: invite.date ? formatInviteDate(invite.date) : base.event.sthapanaDate,
      venue: invite.venue?.trim() || base.event.venue,
      // "Sthapana Muhurat" (see CreateInvitePage.jsx) reuses the generic
      // `eventTitle` field, captured there as a <input type="time"> (the
      // auspicious Pran Pratishtha moment) rather than free text — same
      // "HH:MM" 24-hour shape formatInviteTime() already formats for every
      // other time field. Falls back to the plain Event Time field, then to
      // the base template's own muhurat text.
      sthapanaMuhurat:
        (invite.eventTitle ? formatInviteTime(invite.eventTitle) : '') ||
        (invite.time ? formatInviteTime(invite.time) : '') ||
        base.event.sthapanaMuhurat,
      morningAarti: morning?.time ? formatInviteTime(morning.time) : base.event.morningAarti,
      eveningAarti: evening?.time ? formatInviteTime(evening.time) : base.event.eveningAarti,
      visarjanDate: visarjan?.date ? formatInviteDate(visarjan.date) : base.event.visarjanDate,
      visarjanYatraTime: visarjan?.time ? formatInviteTime(visarjan.time) : base.event.visarjanYatraTime,
      mahaPrasadTime: prasad?.time ? formatInviteTime(prasad.time) : base.event.mahaPrasadTime,
      extraSessions,
    },
    moments,
    // Background Music Selection (see builder/SongSearchPicker.jsx) — same
    // shape/null-when-unselected convention as buildWeddingExperienceTemplate.js;
    // GaneshExperience.jsx falls back to DEFAULT_GANESH_MUSIC_URL when this
    // is null, so a generated invite always plays *something* once opened.
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
