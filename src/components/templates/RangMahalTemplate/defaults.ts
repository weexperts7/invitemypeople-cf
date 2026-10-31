import type { RangMahalEvent, RangMahalTemplateData, RangMahalTemplateDataInput } from './types'
import { rangMahalMockData } from './mockData'

/** Merges caller data over the mock dataset — same contract as withRoyalPlumDefaults. */
export function withRangMahalDefaults(input?: RangMahalTemplateDataInput): RangMahalTemplateData {
  const fallback = rangMahalMockData
  const couple = {
    firstName: input?.couple?.firstName || fallback.couple.firstName,
    secondName: input?.couple?.secondName ?? fallback.couple.secondName,
  }
  return {
    couple,
    greetingLine: input?.greetingLine || fallback.greetingLine,
    invitationLine: input?.invitationLine || fallback.invitationLine,
    families: input?.families?.length ? input.families : input ? [] : fallback.families,
    weddingDateISO: input?.weddingDateISO || fallback.weddingDateISO,
    events: sortEventsByDate(input?.events?.length ? input.events : fallback.events),
    photos: input?.photos ?? fallback.photos,
    musicUrl: input?.musicUrl,
    hashtag: input?.hashtag || defaultHashtag(couple.firstName, couple.secondName),
    thankYouMessage: input?.thankYouMessage || fallback.thankYouMessage,
    whatsappMessage: input?.whatsappMessage || fallback.whatsappMessage,
    shareUrl: input?.shareUrl,
    invitationSlug: input?.invitationSlug,
    rsvpEndpoint: input?.rsvpEndpoint,
  }
}

function defaultHashtag(a: string, b: string) {
  const tag = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, '')
  return b ? `#${tag(a)}Weds${tag(b)}` : `#${tag(a)}Wedding`
}

export function buildWhatsAppShareLink(data: RangMahalTemplateData): string {
  const text = data.whatsappMessage.replace('{link}', data.shareUrl ?? '')
  return `https://api.whatsapp.com/send?${new URLSearchParams({ text }).toString()}`
}

export function mapsUrlFor(venue: RangMahalEvent['venue']): string {
  if (venue.mapUrl) return venue.mapUrl
  const query = [venue.name, venue.address].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Reads an event's formatted copy back into a Date. Events only carry display
 * strings, so this uses a regex instead of `new Date(string)`, whose parsing
 * of "Sunday, 14 February 2027 6:30 PM" differs between browsers.
 */
function parseEventStart(event: RangMahalEvent): { start: Date; hasTime: boolean } | null {
  const date = event.dateLabel.match(/(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*,?\s+(\d{4})/)
  if (!date) return null
  const month = MONTHS.indexOf(date[2].toLowerCase())
  if (month < 0) return null

  const time = event.timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  const hours = time ? (Number(time[1]) % 12) + (time[3].toUpperCase() === 'PM' ? 12 : 0) : 0
  const minutes = time ? Number(time[2]) : 0
  return { start: new Date(Number(date[3]), month, Number(date[1]), hours, minutes), hasTime: Boolean(time) }
}

/**
 * Chronological order. The builder saves the main event first and any
 * additional ones after it, whatever their dates, which would otherwise put
 * the Wedding above the Haldi held two days before it. Unreadable dates keep
 * their place at the end.
 */
export function sortEventsByDate(events: RangMahalEvent[]): RangMahalEvent[] {
  const at = (e: RangMahalEvent) => parseEventStart(e)?.start.getTime() ?? Infinity
  return [...events].sort((a, b) => {
    const [x, y] = [at(a), at(b)]
    return x === y ? 0 : x - y
  })
}

/**
 * Google Calendar link for one event, or null when its date can't be read
 * back (the button is then hidden rather than wrong). Timed events assume
 * three hours in Indian time; an event with no time is an all-day entry.
 */
export function buildCalendarLink(event: RangMahalEvent): string | null {
  const parsed = parseEventStart(event)
  if (!parsed) return null
  const { start, hasTime } = parsed

  const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const stamp = (d: Date) => `${day(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const dates = hasTime
    ? `${stamp(start)}/${stamp(new Date(start.getTime() + 3 * 3_600_000))}`
    : `${day(start)}/${day(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1))}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates,
    ctz: 'Asia/Kolkata',
    location: [event.venue.name, event.venue.address].filter(Boolean).join(', '),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
