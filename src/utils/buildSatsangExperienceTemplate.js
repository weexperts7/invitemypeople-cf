import { getSatsangTemplateBySlug } from '../data/satsangTemplatesData'
import { formatInviteDate, formatInviteTime, mapsSearchUrl } from './formatInviteDateTime'

// A `fullExperience` Satsang invite: the catalog template with host, event,
// programme, photos and music overridden by what the buyer submitted.
// Shared by GeneratedInvitePage.jsx (the real, paid /i/:slug page) and
// LiveDraftPreviewPage.jsx (the Invitation Builder's live preview), same
// role as buildGaneshExperienceTemplate.js.
export function buildSatsangExperienceTemplate(invite, builderTemplate) {
  const base = getSatsangTemplateBySlug(builderTemplate.sourceId)
  const venue = invite.venue?.trim() || base.event.venue

  // Rows the buyer cleared are dropped; a row with no time still shows, since
  // the order of the evening is useful on its own.
  const programme = (invite.events ?? [])
    .filter((e) => e?.title?.trim())
    .map((e) => ({ title: e.title.trim(), time: e.time ? formatInviteTime(e.time) : '' }))
  const langar = programme.find((p) => /langar|prasad/i.test(p.title))

  return {
    ...base,
    host: {
      familyName: invite.names,
      hostLine: invite.message?.trim() || builderTemplate.connective,
    },
    event: {
      date: formatInviteDate(invite.date),
      time: invite.time ? formatInviteTime(invite.time) : '',
      venue,
      mapHref: invite.locationUrl?.trim() || mapsSearchUrl(venue),
      startISO: invite.time ? `${invite.date}T${invite.time}:00` : `${invite.date}T00:00:00`,
    },
    programme,
    mahaprasad: { ...base.mahaprasad, time: langar?.time ?? '' },
    photos: invite.photos ?? [],
    privateNote: invite.privateNote?.trim() || '',
    bgMusic: invite.bgSongPreviewUrl ? { previewUrl: invite.bgSongPreviewUrl } : null,
  }
}
