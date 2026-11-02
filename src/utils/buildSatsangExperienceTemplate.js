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
  const isLangarRow = (p) => /langar|prasad/i.test(p.title)
  const rows = (invite.events ?? [])
    .filter((e) => e?.title?.trim())
    .map((e) => ({ title: e.title.trim(), time: e.time ? formatInviteTime(e.time) : '' }))

  // Null on an invite saved before the builder asked, which takes its langar
  // time from the programme and always shows the section.
  const langar = invite.langar
  const served = langar?.served !== false
  const programme = served ? rows : rows.filter((p) => !isLangarRow(p))

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
    mahaprasad: {
      served,
      time: langar?.time ? formatInviteTime(langar.time) : (rows.find(isLangarRow)?.time ?? ''),
      note: langar?.note || base.mahaprasad.note,
    },
    photos: invite.photos ?? [],
    privateNote: invite.privateNote?.trim() || '',
    bgMusic: invite.bgSongPreviewUrl ? { previewUrl: invite.bgSongPreviewUrl } : null,
  }
}
