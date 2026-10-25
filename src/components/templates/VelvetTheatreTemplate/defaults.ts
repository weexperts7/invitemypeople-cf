import type { VelvetTheatreTemplateData, VelvetTheatreTemplateDataInput } from './types'
import { velvetTheatreMockData } from './mockData'

/**
 * Merges caller data over the mock dataset so every field the template
 * renders is defined — `<VelvetTheatreTemplate />` with no props renders a
 * fully populated preview, same contract as withRoyalPlumDefaults.
 */
export function withVelvetTheatreDefaults(input?: VelvetTheatreTemplateDataInput): VelvetTheatreTemplateData {
  const fallback = velvetTheatreMockData
  return {
    couple: {
      firstName: input?.couple?.firstName || fallback.couple.firstName,
      secondName: input?.couple?.secondName ?? fallback.couple.secondName,
    },
    greetingLine: input?.greetingLine || fallback.greetingLine,
    invitationLine: input?.invitationLine || fallback.invitationLine,
    families: input?.families ?? fallback.families,
    weddingDateISO: input?.weddingDateISO || fallback.weddingDateISO,
    events: input?.events?.length ? input.events : fallback.events,
    photos: input?.photos ?? fallback.photos,
    musicUrl: input?.musicUrl,
    thankYouMessage: input?.thankYouMessage || fallback.thankYouMessage,
    whatsappMessage: input?.whatsappMessage || fallback.whatsappMessage,
    shareUrl: input?.shareUrl,
    invitationSlug: input?.invitationSlug,
    rsvpEndpoint: input?.rsvpEndpoint,
  }
}

export function buildWhatsAppShareLink(data: VelvetTheatreTemplateData): string {
  const text = data.whatsappMessage.replace('{link}', data.shareUrl ?? '')
  return `https://api.whatsapp.com/send?${new URLSearchParams({ text }).toString()}`
}

export function mapsUrlFor(venue: { name: string; address?: string; mapUrl?: string }): string {
  if (venue.mapUrl) return venue.mapUrl
  const query = [venue.name, venue.address].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
