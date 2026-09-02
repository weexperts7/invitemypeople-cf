import type { MahoganySealTemplateData, MahoganySealTemplateDataInput } from './types'
import { mahoganySealMockData } from './mockData'

/**
 * Deep-merges a caller-supplied (fully optional) data object over the mock
 * dataset so every field the template renders is always defined. Mirrors
 * RoyalPlumCurtainTemplate's `withRoyalPlumDefaults` — callers may pass as
 * little as `{ couple: { name1: 'X', name2: 'Y' } }` and everything else
 * degrades gracefully instead of rendering "undefined".
 */
export function withMahoganySealDefaults(
  input?: MahoganySealTemplateDataInput
): MahoganySealTemplateData {
  const fallback = mahoganySealMockData

  return {
    couple: { ...fallback.couple, ...input?.couple },
    weddingDateISO: input?.weddingDateISO || fallback.weddingDateISO,
    introPrompt: input?.introPrompt || fallback.introPrompt,
    events: input?.events?.length ? input.events : fallback.events,
    scratch: { ...fallback.scratch, ...input?.scratch },
    galleryPhotos: input?.galleryPhotos?.length ? input.galleryPhotos : fallback.galleryPhotos,
    gratitudeMessage: input?.gratitudeMessage || fallback.gratitudeMessage,
    videoSrc: input?.videoSrc ?? fallback.videoSrc,
    posterSrc: input?.posterSrc ?? fallback.posterSrc,
    musicUrl: input?.musicUrl ?? fallback.musicUrl,
    invitationSlug: input?.invitationSlug ?? fallback.invitationSlug,
  }
}

/** Builds the Google Maps deep-link for a venue when no explicit `mapUrl` was given. */
export function buildMapLink(venue: { name: string; address?: string; mapUrl?: string }): string {
  return (
    venue.mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [venue.name, venue.address].filter(Boolean).join(' ')
    )}`
  )
}

/** Formats an ISO date into "Fri, 18 December 2026". */
export function formatDateLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}
