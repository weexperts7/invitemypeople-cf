/**
 * MahoganySealTemplate — public type contract.
 *
 * Fully self-contained: nothing outside this directory should need to
 * import from here except the `MahoganySealTemplateData` shape (and the
 * component itself) to render a preview — same isolation contract as
 * RoyalPlumCurtainTemplate next door.
 */

/** A single venue, used for the "Get Directions" map deep-link. */
export interface MahoganySealVenue {
  /** Venue name, e.g. "The Imperial, New Delhi" */
  name: string
  /** Free-form address line shown under the venue name. */
  address?: string
  /** Optional Google Maps URL. If omitted, one is derived from `name` + `address`. */
  mapUrl?: string
}

/** One itinerary entry — Engagement, Wedding, Reception, etc. */
export interface MahoganySealEvent {
  /** Unique key for React list rendering. */
  id: string
  /** Ceremony name, e.g. "Engagement", "Wedding Ceremony", "Reception". */
  name: string
  /** Human date string, e.g. "Fri, 12th Dec 2026". */
  dateLabel: string
  /** Time copy, e.g. "6:30 PM onwards". */
  time: string
  venue: MahoganySealVenue
  /** Short note — dress code, a blessing, anything worth a highlight. */
  note?: string
  /** Small label badge shown on the card, e.g. "Day 1". Optional. */
  badge?: string
}

export interface MahoganySealCouple {
  /** First partner's name, e.g. "Shaya". */
  name1: string
  /** Second partner's name. */
  name2: string
  /** Illustration of the couple, Pixar/caricature style. */
  caricatureUrl: string
  caricatureAlt?: string
  /** Custom hashtag stamped into the wax seal and repeated in the hero, e.g. "#ShayaWedsRehaan". Include the leading "#". */
  hashtag: string
}

/** Content revealed under the scratch-off layer. */
export interface MahoganySealScratch {
  /** Small kicker above the reveal, e.g. "A little secret". */
  eyebrow: string
  /** Short line revealed once scratched off. */
  message: string
}

export interface MahoganySealTemplateData {
  couple: MahoganySealCouple
  /** ISO 8601 timestamp the countdown targets, e.g. "2026-12-12T18:30:00+05:30". */
  weddingDateISO: string
  /** Gold serif line shown over the intro video, e.g. "Tap to Open Invite". */
  introPrompt: string
  events: MahoganySealEvent[]
  scratch: MahoganySealScratch
  /** Photo URLs for the gallery preview strip. */
  galleryPhotos: string[]
  gratitudeMessage: string
  /**
   * MP4 source for the rope-pull envelope-opening loop played behind the
   * intro seal. Left unset (or pointing at a missing file) is a supported
   * state — see IntroOverlay's own comment — the illustrated envelope
   * fallback renders instead, so the template still looks intentional
   * before a real video asset is dropped in.
   */
  videoSrc?: string
  posterSrc?: string
  /**
   * Background track that starts the instant the guest opens the invite
   * (the same tap/click that dismisses the intro overlay) and loops from
   * there, with a corner mute toggle once the dashboard's up — mirrors
   * InvitationExperience.jsx's own background-music system, which this
   * bespoke layout otherwise opts out of entirely (see that file's
   * "Bespoke per-template layouts" comment). Left unset is a supported
   * state — the template still renders, just silently, same as a missing
   * `videoSrc` falling back to the illustrated envelope.
   */
  musicUrl?: string
  /**
   * The real invite's slug — required for the RSVP form to submit against
   * `/api/rsvps` (same contract every other template's RSVP form uses).
   * Left undefined, the form still renders but every submit will fail
   * against an unknown slug — same "known gap until wired" behavior
   * RoyalPlumCurtainTemplate documents for its own `invitationSlug`.
   */
  invitationSlug?: string
}

/** Fallback-safe partial — every field may be omitted by a caller. */
export type MahoganySealTemplateDataInput = {
  couple?: Partial<MahoganySealCouple>
  weddingDateISO?: string
  introPrompt?: string
  events?: MahoganySealEvent[]
  scratch?: Partial<MahoganySealScratch>
  galleryPhotos?: string[]
  gratitudeMessage?: string
  videoSrc?: string
  posterSrc?: string
  musicUrl?: string
  invitationSlug?: string
}

export interface MahoganySealTemplateProps {
  data?: MahoganySealTemplateDataInput
  /** Called once the guest opens the invite (dismisses the intro overlay). Optional analytics/UX hook. */
  onOpen?: () => void
  /** Disables non-essential ambient motion (shimmer, floating embers) for reduced-motion users. */
  reduceMotion?: boolean
  /**
   * Shows the fixed "Create Your Own Invitation" bar (opens a pre-filled
   * WhatsApp chat straight away — see `MahoganySealTemplate.tsx`'s own
   * comment on why) once the dashboard's revealed. Defaults to `true` —
   * every current caller renders this template as its own sales showcase
   * (the dormant `/_preview/mahogany-seal` route and the real catalog at
   * `/templates/wedding/mahogany-seal`). Pass `false` once this template
   * is wired in as a real, already-purchased guest-facing invite, where a
   * "buy this" CTA no longer makes sense — the same `isPreview`-gated
   * pattern InvitationExperience.jsx already uses for every other
   * template's own conversion bar.
   */
  showCreateCta?: boolean
}
