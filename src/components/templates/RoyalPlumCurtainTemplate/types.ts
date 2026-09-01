/**
 * RoyalPlumCurtainTemplate — public type contract.
 *
 * This template is fully self-contained: it does not import types from
 * anywhere else in the app, and nothing outside this directory should need
 * to import from here except the single `RoyalPlumTemplateData` shape (and
 * the component itself) to render a preview.
 */

/** A single named person/venue location, used for the map deep-link. */
export interface RoyalPlumVenue {
  /** Venue name, e.g. "The Leela Palace, Bengaluru" */
  name: string
  /** Free-form address line shown under the venue name. Omit if the venue name already carries the full location (some integrations only have one combined string). */
  address?: string
  /** Optional Google Maps URL. If omitted, one is derived from `name` + `address`. */
  mapUrl?: string
}

/** One ceremony/event entry shown in the Event Announcement section. */
export interface RoyalPlumEvent {
  /** Unique key for React list rendering. */
  id: string
  /** Ceremony name, e.g. "Haldi", "Sangeet", "Pheras". */
  name: string
  /** Auspicious/scheduled timing copy, e.g. "Muhurat begins 7:42 PM". */
  timing: string
  /** Human date string shown on the card face, e.g. "Sat, 14th Feb 2026". */
  dateLabel: string
  venue: RoyalPlumVenue
  /** Short note revealed under the scratch layer, e.g. dress code or a blessing. */
  specialNote?: string
}

/** The couple's parents, shown under "Together with their families". */
export interface RoyalPlumParents {
  brideParents: string
  groomParents: string
}

export interface RoyalPlumCouple {
  brideName: string
  groomName: string
  /** Illustration of the couple in traditional wedding attire (sherwani/lehenga). */
  caricatureUrl: string
  /** Optional alt text for the caricature image. */
  caricatureAlt?: string
}

export interface RoyalPlumWhatsAppShare {
  /** Phone number is optional — omit to open the WhatsApp share sheet without a preset recipient. */
  phone?: string
  /** Pre-written message; `{link}` is replaced with `shareUrl` if present. */
  message: string
}

export interface RoyalPlumTemplateData {
  couple: RoyalPlumCouple
  parents: RoyalPlumParents
  /** ISO 8601 timestamp the countdown targets, e.g. "2026-12-12T18:30:00+05:30". */
  weddingDateISO: string
  /** Short teaser line on the envelope cover, e.g. "A SPECIAL DAY AWAITS". */
  teaserLine: string
  events: RoyalPlumEvent[]
  gratitudeMessage: string
  whatsapp: RoyalPlumShareConfig
  /** URL of the page itself, used to build the share message and copy link. */
  shareUrl?: string
  /**
   * The real invite's slug, e.g. "ananya-vivaan" — required for the RSVP
   * form and Wishes Wall to submit/load against `/api/rsvps` and
   * `/api/wishes` (both key everything off this, same as every other
   * template's RsvpForm/WishesWall). Left undefined, both sections still
   * render but every submit/fetch will fail against an unknown slug — same
   * "known gap until wired" behavior every bespoke layout has before its
   * caller passes a real one.
   */
  invitationSlug?: string
}

export interface RoyalPlumShareConfig extends RoyalPlumWhatsAppShare {}

/** Fallback-safe partial — every field in RoyalPlumTemplateData may be omitted by a caller. */
export type RoyalPlumTemplateDataInput = {
  couple?: Partial<RoyalPlumCouple>
  parents?: Partial<RoyalPlumParents>
  weddingDateISO?: string
  teaserLine?: string
  events?: RoyalPlumEvent[]
  gratitudeMessage?: string
  whatsapp?: Partial<RoyalPlumWhatsAppShare>
  shareUrl?: string
  invitationSlug?: string
}

export interface RoyalPlumTemplateProps {
  data?: RoyalPlumTemplateDataInput
  /** Called once the curtain-opening sequence finishes. Optional analytics/UX hook. */
  onOpen?: () => void
  /** Disables autoplay motion (bobbing, particles) for reduced-motion users; GSAP still respects prefers-reduced-motion internally, this is an explicit override. */
  reduceMotion?: boolean
}
