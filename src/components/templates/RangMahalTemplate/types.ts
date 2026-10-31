/**
 * RangMahalTemplate — public type contract.
 *
 * Self-contained like the other bespoke wedding templates: nothing here
 * imports types from the rest of the app. RangMahalAdapter.jsx maps the
 * site's shared wedding template shape onto `RangMahalTemplateDataInput`.
 */

export interface RangMahalVenue {
  name: string
  address?: string
  /** Optional Google Maps URL. Derived from `name` + `address` when omitted. */
  mapUrl?: string
  /** Picture of the venue for the event's card. Falls back to its illustration. */
  photo?: string
}

export interface RangMahalEvent {
  id: string
  name: string
  /** Human date string containing "<day> <Month> <year>", e.g. "Sunday, 14 February 2027". */
  dateLabel: string
  /** Time copy, e.g. "6:30 PM". */
  timing: string
  venue: RangMahalVenue
}

export interface RangMahalFamily {
  name: string
  /** e.g. "Daughter of Mr. Rajesh & Mrs. Sunita Malhotra" */
  parents: string
  /** Portrait URL for the arch. Falls back to the name's initial. */
  photo?: string
}

export interface RangMahalCouple {
  firstName: string
  secondName: string
}

export interface RangMahalTemplateData {
  couple: RangMahalCouple
  /** Small line above the names on the gatefold cover, e.g. "Shubh Vivah". */
  greetingLine: string
  invitationLine: string
  families: RangMahalFamily[]
  /** Local or ISO timestamp the diyas and countdown target. */
  weddingDateISO: string
  events: RangMahalEvent[]
  /** Photo URLs for the gallery. Empty hides the section. */
  photos: string[]
  /** Background track, started when the card is opened. Omit for a silent invite. */
  musicUrl?: string
  /** Shown with the share buttons; derived from the names when omitted. */
  hashtag: string
  thankYouMessage: string
  /** `{link}` is replaced with `shareUrl`. */
  whatsappMessage: string
  shareUrl?: string
  /** The real invite's slug — RSVP and Wishes Wall key off it. */
  invitationSlug?: string
  /** RSVP endpoint override (partner invites post to /api/partners/rsvps). */
  rsvpEndpoint?: string
}

/** Every field may be omitted; see `withRangMahalDefaults`. */
export type RangMahalTemplateDataInput = Partial<Omit<RangMahalTemplateData, 'couple'>> & {
  couple?: Partial<RangMahalCouple>
}

export interface RangMahalTemplateProps {
  data?: RangMahalTemplateDataInput
  /** Called once the gatefold has finished opening. */
  onOpen?: () => void
}
