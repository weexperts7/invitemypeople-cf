import type { RoyalPlumTemplateData, RoyalPlumTemplateDataInput } from './types'
import { royalPlumMockData } from './mockData'

/**
 * Deep-merges a caller-supplied (fully optional) data object over the mock
 * dataset so every field the template renders is always defined. This is
 * the template's *comprehensive fallback* — callers may pass as little as
 * `{ couple: { brideName: 'X', groomName: 'Y' } }` and everything else
 * degrades gracefully to a sensible default instead of crashing or
 * rendering "undefined".
 */
export function withRoyalPlumDefaults(
  input?: RoyalPlumTemplateDataInput
): RoyalPlumTemplateData {
  const fallback = royalPlumMockData

  return {
    couple: { ...fallback.couple, ...input?.couple },
    parents: { ...fallback.parents, ...input?.parents },
    weddingDateISO: input?.weddingDateISO || fallback.weddingDateISO,
    teaserLine: input?.teaserLine || fallback.teaserLine,
    events: input?.events?.length ? input.events : fallback.events,
    gratitudeMessage: input?.gratitudeMessage || fallback.gratitudeMessage,
    whatsapp: { ...fallback.whatsapp, ...input?.whatsapp },
    shareUrl: input?.shareUrl ?? fallback.shareUrl,
    invitationSlug: input?.invitationSlug ?? fallback.invitationSlug,
  }
}

/** Builds the final `wa.me`/`api.whatsapp.com` share link from template data. */
export function buildWhatsAppShareLink(data: RoyalPlumTemplateData): string {
  const rawMessage = data.whatsapp.message.replace('{link}', data.shareUrl ?? '')
  const params = new URLSearchParams({ text: rawMessage })
  if (data.whatsapp.phone) {
    params.set('phone', data.whatsapp.phone.replace(/[^\d]/g, ''))
  }
  return `https://api.whatsapp.com/send?${params.toString()}`
}
