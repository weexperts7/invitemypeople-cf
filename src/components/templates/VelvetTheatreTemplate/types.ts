/**
 * VelvetTheatreTemplate — public type contract.
 *
 * Self-contained like RoyalPlumCurtainTemplate: nothing here imports types
 * from the rest of the app. VelvetTheatreAdapter.jsx maps the site's shared
 * wedding template shape onto `VelvetTheatreTemplateDataInput`.
 */

export interface VelvetTheatreVenue {
  name: string
  address?: string
  /** Optional Google Maps URL. Derived from `name` + `address` when omitted. */
  mapUrl?: string
}

/** One ceremony, rendered as an "admit one" theatre ticket. */
export interface VelvetTheatreEvent {
  id: string
  name: string
  /** Human date string, e.g. "Sunday, 14 February 2027". */
  dateLabel: string
  /** Time copy, e.g. "6:30 PM". */
  timing: string
  venue: VelvetTheatreVenue
}

export interface VelvetTheatreFamily {
  name: string
  /** e.g. "Daughter of Mr. Rajesh & Mrs. Sunita Malhotra" */
  parents: string
}

export interface VelvetTheatreCouple {
  firstName: string
  secondName: string
}

export interface VelvetTheatreTemplateData {
  couple: VelvetTheatreCouple
  /** Small line above the names on stage, e.g. "Shubh Vivah". */
  greetingLine: string
  /** Paragraph under the names on stage. */
  invitationLine: string
  families: VelvetTheatreFamily[]
  /** Local or ISO timestamp the scratch coins and countdown target. */
  weddingDateISO: string
  events: VelvetTheatreEvent[]
  /** Photo URLs for the framed gallery. Empty hides the section. */
  photos: string[]
  /** Background track, started on the curtain tap. Omit for a silent invite. */
  musicUrl?: string
  thankYouMessage: string
  /** `{link}` is replaced with `shareUrl`. */
  whatsappMessage: string
  shareUrl?: string
  /** The real invite's slug — RSVP and Wishes Wall key off it. */
  invitationSlug?: string
  /** RSVP endpoint override (partner invites post to /api/partners/rsvps). */
  rsvpEndpoint?: string
}

/** Every field may be omitted; see `withVelvetTheatreDefaults`. */
export type VelvetTheatreTemplateDataInput = Partial<Omit<VelvetTheatreTemplateData, 'couple'>> & {
  couple?: Partial<VelvetTheatreCouple>
}

export interface VelvetTheatreTemplateProps {
  data?: VelvetTheatreTemplateDataInput
  /** Called once the curtains have finished opening. */
  onOpen?: () => void
}
