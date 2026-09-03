import { useEffect, useRef, useState } from 'react'

import AudioToggle from '../../AudioToggle'
import Honeypot from '../../Honeypot'
import TurnstileWidget from '../../TurnstileWidget'
import { useRsvpSubmit } from '../../../hooks/useRsvpSubmit'

/**
 * PinkGoldFloralTemplate — a standalone, plug-and-play luxury Indian wedding
 * invite: soft cream/blush background, bronze/gold serif + script
 * typography, a continuous vertical "story" scroll (blessing → couple names
 * → core event details → multi-day ceremony timeline → motif & closing note
 * → host/RSVP footer) — framed throughout with the real exported Canva
 * artwork (watercolor floral corners, a gold lantern-vine band, an arched
 * card silhouette, and a tileable gold mandala texture) rather than plain
 * CSS approximations, so it reads as a physical printed invitation
 * digitized, not flat text on a solid background.
 *
 * Fully self-contained in this one file — its own types, default/mock data,
 * scoped `<style>` block (fonts + keyframes, all under the `pgf-` prefix),
 * and a tiny scroll-reveal helper — so dropping it into the template
 * registry cannot touch any other template, the design system, routing, or
 * database models. The only outside imports are the site's existing,
 * unmodified shared pieces every other template's own RSVP form already
 * builds on — `AudioToggle` (corner mute control), and `Honeypot` /
 * `TurnstileWidget` / `useRsvpSubmit` (the real `/api/rsvps` submit
 * plumbing, see `PinkGoldFloralRsvpForm` below) — so both the
 * background-audio affordance and the RSVP flow look and behave
 * identically to the rest of the catalog instead of reinventing either.
 *
 * Frame artwork lives at `public/images/templates/pink-gold-floral/*.png`
 * (new, isolated folder — nothing existing was touched) and is layered in
 * as decorative `<img>`s: `aria-hidden`, `pointer-events-none`, `absolute`,
 * always painted *before* (i.e. behind, z-0) the actual copy (z-10) — see
 * `FrameLayer`/`ArchBackdrop` below. Every asset is also an optional prop
 * with the shipped PNG as its default, so a caller can swap in a different
 * export later without touching this file — same "optional prop, tasteful
 * fallback" contract `videoSrc`/`posterSrc` have on MahoganySealTemplate,
 * except the fallback here is simply "render without that particular
 * layer" rather than a CSS stand-in, since these are pure ornamentation.
 */

// ---------------------------------------------------------------------------
// Types — public prop/data contract for this template.
// ---------------------------------------------------------------------------

export interface PinkGoldFloralVenue {
  /** Venue name, e.g. "The Imperial, New Delhi". */
  name: string
  /** Free-form address line shown under the venue name. */
  address?: string
  /** Optional Google Maps URL. If omitted, one is derived from `name` + `address`. */
  mapUrl?: string
}

/** One ceremony in the multi-day timeline — Sangeet, Haldi, Engagement, Wedding, etc. */
export interface PinkGoldFloralEvent {
  /** Unique key for React list rendering. */
  id: string
  /** Ceremony name, e.g. "Sangeet", "Haldi", "Wedding Ceremony". */
  name: string
  /** Human date string, e.g. "Sunday, 27th July 2025". */
  dateLabel: string
  /** Time copy, e.g. "7:00 PM onwards". Optional — some ceremonies are day-long. */
  time?: string
  venue: PinkGoldFloralVenue
  /** Short note — dress code, a blessing, anything worth a highlight. */
  note?: string
}

export interface PinkGoldFloralCouple {
  brideName: string
  groomName: string
}

/** Host/RSVP contact shown in the footer, e.g. the couple's parent. */
export interface PinkGoldFloralHost {
  name: string
  phone?: string
}

/**
 * The real exported Canva frame artwork, each independently overridable.
 * Every field defaults to the matching file under
 * `public/images/templates/pink-gold-floral/` — see `DEFAULT_ASSETS`.
 */
export interface PinkGoldFloralAssets {
  /** Watercolor rose + gold vine, corners-only — bleeds across the very top of the page. */
  floralTop: string
  /** Same motif, corners-only — bleeds across the very bottom of the page, bookending `floralTop`. */
  floralBottom: string
  /** Gold vine with hanging lanterns — overlaid on the core-details arch card. */
  frameTop: string
  /** Gold vine + lanterns + roses combined — overlaid on the RSVP/footer arch card. */
  frameBottom: string
  /** The arched, scalloped-top card silhouette used behind both the core-details and RSVP sections. */
  archBackground: string
  /** Seamless gold mandala pattern, tiled at very low opacity behind the entire page. */
  texture: string
}

export interface PinkGoldFloralTemplateData {
  /** Sanskrit blessing at the very top, e.g. "Om Shree Ganeshay Namah". */
  blessingLine: string
  /** "Together with their families" style intro line above the couple names. */
  familyIntro: string
  couple: PinkGoldFloralCouple
  /** Warm invitation copy between the names and the core date/time/venue block. */
  invitationMessage: string
  /** ISO 8601 timestamp the core details card is derived from, e.g. "2026-12-12T20:00:00+05:30". */
  weddingDateISO: string
  /** Human time copy shown alongside the date, e.g. "8:00 AM onwards". */
  weddingTimeLabel: string
  mainVenue: PinkGoldFloralVenue
  /** The multi-day ceremony timeline, rendered top to bottom in array order. */
  events: PinkGoldFloralEvent[]
  /** Short closing note under the motif, e.g. a gratitude line. */
  closingNote: string
  host: PinkGoldFloralHost
  /**
   * Optional Ganesha/auspicious motif image. Left unset renders a
   * CSS/SVG "ॐ" mandala medallion in its place — see `MotifMedallion`
   * below — so the section still looks intentional without a real asset.
   */
  motifImageUrl?: string
  /**
   * The real invite's slug — handed to whatever the caller renders inside
   * `rsvpSlot` below, mirroring `invitationSlug` on every other template in
   * this catalog (RoyalPlumCurtainTemplate, MahoganySealTemplate) so a real
   * RSVP form dropped into the slot has what it needs to submit against
   * `/api/rsvps`. This template makes no assumption about *how* that form
   * is built — see `rsvpSlot`.
   */
  invitationSlug?: string
}

/** Fallback-safe partial — every field may be omitted by a caller. */
export type PinkGoldFloralTemplateDataInput = {
  blessingLine?: string
  familyIntro?: string
  couple?: Partial<PinkGoldFloralCouple>
  invitationMessage?: string
  weddingDateISO?: string
  weddingTimeLabel?: string
  mainVenue?: Partial<PinkGoldFloralVenue>
  events?: PinkGoldFloralEvent[]
  closingNote?: string
  host?: Partial<PinkGoldFloralHost>
  motifImageUrl?: string
  invitationSlug?: string
}

export interface PinkGoldFloralTemplateProps {
  data?: PinkGoldFloralTemplateDataInput
  /**
   * Optional background-audio track. Named `bg_music_url` (rather than
   * this file's own otherwise-camelCase convention) to match the exact
   * prop the integration brief asked for. Left unset, no `<audio>` element
   * is even mounted and the corner toggle doesn't render — same
   * "supported unset state" contract `musicUrl` has on
   * MahoganySealTemplate.
   */
  bg_music_url?: string
  /** Called once, the first time the guest interacts with the page (first scroll/tap) — optional analytics/UX hook, mirrors `onOpen` on every other template here even though this layout has no intro overlay to "open". */
  onOpen?: () => void
  /** Disables scroll-reveal motion and petal-drift ambience for reduced-motion users. */
  reduceMotion?: boolean
  /**
   * Overrides the footer's RSVP form entirely with a custom render-prop —
   * for the rare case a caller wants to mount something other than
   * `PinkGoldFloralRsvpForm` there (a different widget, a wax-seal-style
   * interaction, etc.), same escape hatch every other bespoke template in
   * this catalog reserves. Left unset (the common case), the footer
   * renders the real, functional `PinkGoldFloralRsvpForm` below — posting
   * to `/api/rsvps` via the same shared `useRsvpSubmit`/`Honeypot`/
   * `TurnstileWidget` plumbing MahoganySealTemplate's and
   * RoyalPlumCurtainTemplate's own RSVP forms use, just restyled to this
   * template's cream/gold palette.
   */
  rsvpSlot?: (ctx: { invitationSlug?: string }) => React.ReactNode
  /**
   * Overrides the RSVP form's submit target — '/api/partners/rsvps' for a
   * partner-created invite (see PartnerInviteViewerPage.jsx), so guest
   * RSVPs land in `partner_rsvps`, not the consumer `rsvps` table. Left
   * unset, `useRsvpSubmit` falls back to the site-wide '/api/rsvps'
   * default — same convention `rsvpEndpoint` has on MahoganySealTemplate.
   */
  rsvpEndpoint?: string
  /**
   * Overrides any subset of the frame artwork (see `PinkGoldFloralAssets`).
   * Every field left unset falls back to the shipped Canva export under
   * `public/images/templates/pink-gold-floral/`.
   */
  assets?: Partial<PinkGoldFloralAssets>
  /** Extra classes for the outermost wrapper — e.g. to constrain height in a preview card. */
  className?: string
}

// ---------------------------------------------------------------------------
// Default / mock data — lets `<PinkGoldFloralTemplate />` render fully
// populated and fully framed with zero props, same as every sibling
// template's own `mockData.ts`. Modeled on the reference design's own
// sample content.
// ---------------------------------------------------------------------------

const DEFAULT_DATA: PinkGoldFloralTemplateData = {
  blessingLine: 'Om Shree Ganeshay Namah',
  familyIntro: 'Together with their families',
  couple: { brideName: 'Prerna Singh', groomName: 'Sumit Gupta' },
  invitationMessage: 'cordially invite you to join the occasion of their joyous commitment',
  weddingDateISO: '2026-07-28T08:00:00+05:30',
  weddingTimeLabel: '8:00 AM onwards',
  mainVenue: { name: '123 Anywhere St, Any City, ST 12345' },
  events: [
    { id: 'sangeet', name: 'Sangeet', dateLabel: 'Wednesday, 23rd July 2026', venue: { name: '123 Anywhere St, Any City' } },
    { id: 'haldi', name: 'Haldi', dateLabel: 'Friday, 25th July 2026', venue: { name: '123 Anywhere St, Any City' } },
    { id: 'engagement', name: 'Engagement', dateLabel: 'Sunday, 27th July 2026', venue: { name: '123 Anywhere St, Any City' } },
    { id: 'wedding', name: 'Wedding', dateLabel: 'Tuesday, 28th July 2026', venue: { name: '123 Anywhere St, Any City' } },
  ],
  closingNote: 'We look forward to celebrating this special occasion with you and creating cherished memories.',
  host: { name: 'Geeta Singh', phone: '+91 98765 43210' },
}

/**
 * The real exported Canva assets this template ships with. Paths are
 * root-relative into `public/` (Vite serves that directory unprocessed at
 * the site root), same convention MahoganySealTemplate's `public/videos/…`
 * defaults use.
 */
const DEFAULT_ASSETS: PinkGoldFloralAssets = {
  floralTop: '/images/templates/pink-gold-floral/floral-top.png',
  floralBottom: '/images/templates/pink-gold-floral/floral-bottom.png',
  frameTop: '/images/templates/pink-gold-floral/frame-top.png',
  frameBottom: '/images/templates/pink-gold-floral/frame-bottom.png',
  archBackground: '/images/templates/pink-gold-floral/background-frame.png',
  texture: '/images/templates/pink-gold-floral/background-texture.png',
}

/** Deep-merges a caller-supplied partial dataset over `DEFAULT_DATA`, same pattern as `withMahoganySealDefaults`/`withRoyalPlumDefaults`. */
function withPinkGoldFloralDefaults(input?: PinkGoldFloralTemplateDataInput): PinkGoldFloralTemplateData {
  return {
    blessingLine: input?.blessingLine || DEFAULT_DATA.blessingLine,
    familyIntro: input?.familyIntro || DEFAULT_DATA.familyIntro,
    couple: { ...DEFAULT_DATA.couple, ...input?.couple },
    invitationMessage: input?.invitationMessage || DEFAULT_DATA.invitationMessage,
    weddingDateISO: input?.weddingDateISO || DEFAULT_DATA.weddingDateISO,
    weddingTimeLabel: input?.weddingTimeLabel || DEFAULT_DATA.weddingTimeLabel,
    mainVenue: { ...DEFAULT_DATA.mainVenue, ...input?.mainVenue },
    events: input?.events?.length ? input.events : DEFAULT_DATA.events,
    closingNote: input?.closingNote || DEFAULT_DATA.closingNote,
    host: { ...DEFAULT_DATA.host, ...input?.host },
    motifImageUrl: input?.motifImageUrl,
    invitationSlug: input?.invitationSlug,
  }
}

/** Merges a caller-supplied partial asset override over `DEFAULT_ASSETS`. */
function withPinkGoldFloralAssets(input?: Partial<PinkGoldFloralAssets>): PinkGoldFloralAssets {
  return { ...DEFAULT_ASSETS, ...input }
}

/** Builds the Google Maps deep-link for a venue when no explicit `mapUrl` was given. */
function buildMapLink(venue: PinkGoldFloralVenue): string {
  return (
    venue.mapUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.name, venue.address].filter(Boolean).join(' '))}`
  )
}

/** Splits an ISO date into day/month/year/weekday parts for the "core details" date card. */
function getDateParts(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { weekday: '', day: '', month: '', year: '' }
  return {
    weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }),
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('en-IN', { month: 'long' }).toUpperCase(),
    year: String(d.getFullYear()),
  }
}

// ---------------------------------------------------------------------------
// Small in-file helpers — kept local so this stays a single, self-contained
// file rather than spawning a `components/` subdirectory like its siblings.
// ---------------------------------------------------------------------------

/**
 * Fades + rises a section into place the first time it scrolls into view.
 * Plain `IntersectionObserver` + Tailwind transition classes — no animation
 * library dependency, same "CSS transitions only" choice MahoganySealTemplate
 * documents for itself. No-ops (renders fully visible, no observer) when
 * `reduceMotion` is set.
 */
function Reveal({
  children,
  reduceMotion,
  className = '',
  delayMs = 0,
}: {
  children: React.ReactNode
  reduceMotion?: boolean
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!!reduceMotion)

  useEffect(() => {
    if (reduceMotion) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <div
      ref={ref}
      className={`pgf-reveal transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
      style={{ transitionDelay: reduceMotion ? '0ms' : `${delayMs}ms` }}
    >
      {children}
    </div>
  )
}

/** Thin gold ornamental divider — "❧"-style flourish between timeline cards. */
function Flourish({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c9932f]/70 sm:w-16" />
      <svg width="18" height="18" viewBox="0 0 24 24" className="text-[#c9932f]">
        <path
          fill="currentColor"
          d="M12 2c1.2 2.4 2.6 3.8 5 5-2.4 1.2-3.8 2.6-5 5-1.2-2.4-2.6-3.8-5-5 2.4-1.2 3.8-2.6 5-5zM4 15.5c1.6.6 2.5 1.5 3.1 3.1.6-1.6 1.5-2.5 3.1-3.1-1.6-.6-2.5-1.5-3.1-3.1-.6 1.6-1.5 2.5-3.1 3.1zm13.8 0c1.6.6 2.5 1.5 3.1 3.1.6-1.6 1.5-2.5 3.1-3.1-1.6-.6-2.5-1.5-3.1-3.1-.6 1.6-1.5 2.5-3.1 3.1z"
        />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c9932f]/70 sm:w-16" />
    </div>
  )
}

/** Ganesha/auspicious motif — a real image if provided, else a hand-drawn "ॐ" mandala medallion so the section never looks unfinished. */
function MotifMedallion({ imageUrl, alt }: { imageUrl?: string; alt: string }) {
  if (imageUrl) {
    return <img src={imageUrl} alt={alt} className="mx-auto h-28 w-28 object-contain sm:h-36 sm:w-36" loading="lazy" />
  }
  return (
    <div className="pgf-shimmer relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#c9932f]/40 bg-gradient-to-br from-[#fff7ec] to-[#f8e3c9] shadow-[0_8px_30px_-12px_rgba(184,134,11,0.45)] sm:h-36 sm:w-36">
      <span aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-[#c9932f]/30" />
      <span className="font-serif text-5xl text-[#a9720f] sm:text-6xl" style={{ fontFamily: "'Noto Serif Devanagari', 'Playfair Display', serif" }}>
        ॐ
      </span>
    </div>
  )
}

/**
 * A decorative edge band cropped from one of the tall Canva corner-motif
 * PNGs (roses, or the lantern vine) — `object-cover` + `object-position`
 * pinned to wherever the actual artwork lives in that source file, with
 * the mostly-transparent remainder cropped away rather than stretched.
 *
 * Two independent placements, not one: `anchor` is where the band sits in
 * *this* container (top-0 vs bottom-0), while `source` is which end of
 * *the source image* actually has the illustration on it. They usually
 * match (`floral-top.png`'s roses live at its own top, and it's anchored
 * to the top of the header) — but not always: `frame-bottom.png`'s
 * lantern-and-roses artwork lives at the *bottom* of that file, yet it's
 * anchored to the *top* of the RSVP arch card (hanging over the arch's
 * peak, mirroring `frame-top.png`'s role on the details card above it).
 * Conflating the two crops blank, transparent canvas instead of the art.
 *
 * `heightClass` is a responsive Tailwind height (e.g. `"h-40 sm:h-56"`) so
 * the band scales gracefully instead of overflowing or clipping into
 * whatever sits below it — see requirement 3 (responsive frame scaling).
 * Always `aria-hidden`/`pointer-events-none`: purely decorative, layered
 * at `z-0` so real copy (`z-10` in every section below) never sits behind
 * it.
 */
function FrameLayer({
  src,
  anchor,
  source = anchor,
  heightClass,
  className = '',
}: {
  src: string
  anchor: 'top' | 'bottom'
  /** Which end of the source image has the artwork. Defaults to `anchor`. */
  source?: 'top' | 'bottom'
  heightClass: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`pointer-events-none absolute inset-x-0 z-0 w-full object-cover ${anchor === 'top' ? 'top-0' : 'bottom-0'} ${source === 'top' ? 'object-top' : 'object-bottom'} ${heightClass} ${className}`}
    />
  )
}

/**
 * The arched, scalloped card silhouette (`background-frame.png`) filling a
 * section's full bounds behind its content — `object-cover object-top`
 * keeps the arch's pointed peak in frame regardless of how tall the real
 * content inside makes the card (a fixed-aspect image behind
 * variable-length copy would otherwise either starve the text of height or
 * leave a gap under the art). The section's own Tailwind gradient
 * background (see `ArchCard`) shows through anywhere the art doesn't
 * reach, so there's never a hard edge if the two don't line up exactly.
 *
 * `overlaySrc` — the lantern-vine (`frame-top.png`) or lantern-and-roses
 * (`frame-bottom.png`) art hanging over the arch's peak — is stacked with
 * the *exact same* `inset-0 h-full w-full object-cover object-top` box as
 * the arch itself, not a separately sized band. All three PNGs are
 * exported from the same 1240×1748 Canva canvas as layers of one
 * composition (confirmed by sampling: the lantern-vine artwork's own
 * footprint tracks the arch silhouette's dome → scallop → rectangle
 * transition at matching y-coordinates), so cropping the overlay
 * independently — an earlier version of this file gave it its own small
 * fixed-height band — breaks that built-in alignment: the band's straight
 * crop edge lands partway through the arch's curved silhouette instead of
 * following it, reading as a misaligned seam rather than one frame.
 * Identical boxes guarantee the designer's original alignment survives
 * regardless of how tall the card ends up rendering.
 */
function ArchBackdrop({ src, overlaySrc }: { src: string; overlaySrc?: string }) {
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
      />
      {overlaySrc && (
        <img
          src={overlaySrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top"
        />
      )}
    </>
  )
}

/**
 * Shared shell for the two "arch card" sections (core details + RSVP
 * footer) — the gold-on-cream gradient is the safe fallback fill,
 * `ArchBackdrop` layers the real arch art (plus its aligned lantern
 * overlay, see `overlaySrc` above) on top of it, and children render last
 * at `z-10` with generous padding (`px-8 py-12 sm:px-12 sm:py-16`) so
 * names/dates/venue text sits well inside the arch's silhouette instead of
 * touching the card's outer edge — requirement 2.
 */
function ArchCard({
  archSrc,
  overlaySrc,
  children,
  className = '',
  ariaLabel,
}: {
  archSrc: string
  overlaySrc?: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#fdf1de] to-[#fbe6c4] shadow-[0_18px_45px_-24px_rgba(169,114,15,0.45)] ${className}`}
    >
      <ArchBackdrop src={archSrc} overlaySrc={overlaySrc} />
      <div className="relative z-10 px-8 py-12 text-center sm:px-12 sm:py-16">{children}</div>
    </section>
  )
}

const GUEST_COUNTS = ['1', '2', '3', '4', '5']

const pgfInputClasses =
  'w-full rounded-lg border border-[#c9932f]/35 bg-white/70 px-4 py-2.5 text-[#5c431f] placeholder:text-[#a9720f]/45 outline-none transition-colors focus:border-[#a9720f] focus:ring-2 focus:ring-[#a9720f]/15'
const pgfLabelClasses = 'pgf-font-heading mb-1.5 block text-[11px] tracking-[0.15em] text-[#a9720f] uppercase'

/**
 * The real, functional RSVP form for this template — name, email
 * (optional), attendance, guest count (shown only when attending), and an
 * optional note, posting to the exact same `/api/rsvps` contract every
 * other template's RSVP form in this catalog uses: `useRsvpSubmit` (the
 * shared fetch/status-machine hook), `Honeypot` (silent bot filter), and
 * `TurnstileWidget` (invisible Cloudflare challenge — submit stays
 * disabled until it resolves). All three are reused unmodified from
 * `src/components/` / `src/hooks/`, exactly like MahoganySealTemplate's
 * and RoyalPlumCurtainTemplate's own RSVP forms already do — only the
 * markup/classes here are new, restyled to this template's cream-and-gold
 * palette instead of copied from either of theirs.
 *
 * Left without a real `slug` (the template's own zero-props preview mode),
 * the form still renders and is fully interactive — submitting just 404s
 * against an unknown invite, the same "known gap until wired" behavior
 * every bespoke template here documents for its own `invitationSlug`.
 */
function PinkGoldFloralRsvpForm({ slug, endpoint }: { slug?: string; endpoint?: string }) {
  const [form, setForm] = useState({ name: '', email: '', attending: 'joyfully', guests: '1', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const { status, isSending, submit } = useRsvpSubmit(slug, endpoint)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const isAttending = form.attending === 'joyfully'

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) return
    await submit(
      {
        guestName: form.name,
        guestEmail: form.email,
        attendanceStatus: form.attending,
        guests: isAttending ? Number(form.guests) || 1 : 0,
        message: form.message,
      },
      honeypot,
      captchaToken
    )
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  const handleReset = () => setForm({ name: '', email: '', attending: 'joyfully', guests: '1', message: '' })

  return (
    <div className="rounded-2xl border border-[#c9932f]/30 bg-white/70 p-6 text-left shadow-[0_14px_36px_-20px_rgba(169,114,15,0.4)] sm:p-8">
      {status === 'success' ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="pgf-gold-text pgf-font-heading text-4xl">✓</span>
          <p className="pgf-font-heading text-2xl font-semibold text-[#5c431f]">Thank you{form.name ? `, ${form.name}` : ''}!</p>
          <p className="max-w-xs text-sm text-[#7a5c33]">
            {isAttending ? "Your RSVP is in — we can't wait to celebrate with you." : "We'll miss you, but thank you for letting us know."}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 text-[11px] tracking-[0.15em] text-[#a9720f] uppercase underline underline-offset-4 hover:text-[#8a5a0c]"
          >
            Submit another response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && (
            <div className="rounded-lg border border-[#8a5a0c]/30 bg-[#fdf1de] px-4 py-2.5 text-sm text-[#8a5a0c]">
              We couldn't save your response — please try again.
            </div>
          )}

          <div>
            <label htmlFor="pgf-rsvp-name" className={pgfLabelClasses}>
              Your Name
            </label>
            <input
              id="pgf-rsvp-name"
              type="text"
              required
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Full name"
              className={pgfInputClasses}
            />
          </div>

          <div>
            <label htmlFor="pgf-rsvp-email" className={pgfLabelClasses}>
              Email <span className="normal-case tracking-normal text-[#a9720f]/60">(optional)</span>
            </label>
            <input
              id="pgf-rsvp-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              className={pgfInputClasses}
            />
          </div>

          <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

          <div>
            <span className={pgfLabelClasses}>Will you attend?</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'joyfully', label: 'Joyfully accepts' },
                { value: 'regretfully', label: 'Regretfully declines' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-xs tracking-[0.08em] uppercase transition-colors ${
                    form.attending === option.value ? 'border-[#a9720f] bg-[#fdf1de] text-[#8a5a0c]' : 'border-[#c9932f]/30 text-[#a9720f] hover:border-[#c9932f]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="pgf-attending"
                    value={option.value}
                    checked={form.attending === option.value}
                    onChange={handleChange('attending')}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {isAttending && (
            <div>
              <label htmlFor="pgf-rsvp-guests" className={pgfLabelClasses}>
                Number of Guests
              </label>
              <select id="pgf-rsvp-guests" value={form.guests} onChange={handleChange('guests')} className={pgfInputClasses}>
                {GUEST_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="pgf-rsvp-message" className={pgfLabelClasses}>
              A note for the couple <span className="normal-case tracking-normal text-[#a9720f]/60">(optional)</span>
            </label>
            <textarea
              id="pgf-rsvp-message"
              rows={3}
              value={form.message}
              onChange={handleChange('message')}
              placeholder="Share your wishes for the couple"
              className={`${pgfInputClasses} resize-none`}
            />
          </div>

          <TurnstileWidget
            ref={turnstileRef}
            action="rsvp_submit"
            onSuccess={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />

          <button
            type="submit"
            disabled={isSending || !captchaToken}
            className="pgf-font-heading w-full rounded-lg bg-[#a9720f] py-3 text-sm tracking-[0.12em] text-[#fff9f2] uppercase shadow-[0_10px_24px_-8px_rgba(169,114,15,0.55)] transition-transform hover:enabled:scale-[1.01] active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Sending…' : 'Send RSVP'}
          </button>
        </form>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PinkGoldFloralTemplate({
  data,
  bg_music_url,
  onOpen,
  reduceMotion = false,
  rsvpSlot,
  rsvpEndpoint,
  assets,
  className = '',
}: PinkGoldFloralTemplateProps) {
  const resolved = withPinkGoldFloralDefaults(data)
  const art = withPinkGoldFloralAssets(assets)
  const { couple, mainVenue, events, host } = resolved
  const dateParts = getDateParts(resolved.weddingDateISO)

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const hasFiredOpenRef = useRef(false)

  // Fires `onOpen` once, on the guest's first genuine interaction with the
  // page (there's no intro overlay to "open" in this continuous-scroll
  // layout, unlike MahoganySealTemplate/RoyalPlumCurtainTemplate) — and
  // doubles as the user gesture that unlocks audible autoplay in browsers
  // that block sound before any interaction, same reasoning
  // MahoganySealTemplate documents for its own listen-once effect.
  useEffect(() => {
    const fire = () => {
      if (hasFiredOpenRef.current) return
      hasFiredOpenRef.current = true
      onOpen?.()
    }
    const interactionEvents: (keyof DocumentEventMap)[] = ['pointerdown', 'keydown', 'scroll']
    interactionEvents.forEach((event) => document.addEventListener(event, fire, { once: true, passive: true }))
    return () => interactionEvents.forEach((event) => document.removeEventListener(event, fire))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleAudio = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isMuted) {
      audio.play().catch(() => {
        /* Autoplay blocked despite the gesture — rare, the toggle stays tappable to retry. */
      })
    } else {
      audio.pause()
    }
    setIsMuted((m) => !m)
  }

  return (
    <div className={`pgf-root relative min-h-svh overflow-x-hidden bg-[#fff9f2] ${className}`}>
      {/* Scoped fonts + keyframes — everything namespaced under `pgf-` so
          nothing here can collide with global styles or other templates. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Cormorant+Garamond:wght@400;500;600&family=Dancing+Script:wght@600;700&family=Noto+Serif+Devanagari:wght@500&display=swap');

        .pgf-root { font-family: 'Cormorant Garamond', 'Georgia', serif; }
        .pgf-font-heading { font-family: 'Playfair Display', 'Georgia', serif; }
        /* Was 'Meddon' — a heavy brush script whose loops and descenders
           collide at the large sizes the couple's names render at (see
           text-5xl/text-6xl below), reading as an illegible blur instead
           of elegant calligraphy. 'Dancing Script' is a cursive built
           specifically to stay legible at display sizes (open counters,
           no overlapping swashes) while still reading as genuine
           handwriting — the standard choice for wedding-invite names for
           exactly that reason. font-weight: 700 (its "Bold" cut) instead
           of the default 400 so strokes stay confidently visible rather
           than thinning out at these sizes. */
        .pgf-font-script { font-family: 'Dancing Script', cursive; font-weight: 700; }

        .pgf-gold-text {
          background: linear-gradient(180deg, #d8a94d 0%, #a9720f 55%, #8a5a0c 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @keyframes pgf-shimmer {
          0%, 100% { box-shadow: 0 8px 30px -12px rgba(184,134,11,0.35); }
          50% { box-shadow: 0 8px 34px -10px rgba(184,134,11,0.6); }
        }
        .pgf-shimmer { animation: pgf-shimmer 3.6s ease-in-out infinite; }

        @keyframes pgf-petal-drift {
          0% { transform: translateY(-10%) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.5; }
          100% { transform: translateY(110vh) translateX(24px) rotate(180deg); opacity: 0; }
        }
        .pgf-petal { animation: pgf-petal-drift linear infinite; }

        @media (prefers-reduced-motion: reduce) {
          .pgf-shimmer, .pgf-petal { animation: none !important; }
          .pgf-reveal { transition: none !important; }
        }
      `}</style>

      {/* Base texture wash — the seamless gold mandala pattern tiled behind
          the entire page. `absolute inset-0` against `.pgf-root` (this
          component's own `relative` root, right below) rather than
          `fixed`: a `fixed` descendant re-anchors to the nearest
          transformed/scrolling ancestor instead of the real viewport the
          moment one exists — exactly what every phone-frame preview shell
          in this codebase wraps templates in (see e.g.
          `sm:[transform:translateZ(0)]` on the `_preview` routes in
          App.jsx) — so it would silently stop covering the page past one
          screen-height of scroll. `absolute` against `.pgf-root` instead
          naturally stretches to that root's full scrollable height
          regardless of what wraps it. Sits at the very back (z-0, painted
          first in source order) — every section's own background
          color/art layers on top of it.
          No CSS opacity dimming here (deliberately, not an oversight) —
          the source PNG's "black" is actually fully transparent
          (alpha 0) and its gold linework already carries its own baked-in
          ~18% alpha (confirmed by sampling the pixels directly), so it's
          already exactly as subtle as a texture wash should be. Stacking
          extra `opacity-*` on top multiplies against that same ~18% and
          crushes it toward invisible — the original bug report ("the
          background is missing") was this, not a rendering failure. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: `url(${art.texture})`, backgroundRepeat: 'repeat', backgroundSize: '360px 360px' }}
      />

      {/* Optional background track — no <audio> mounted at all when unset, mirrors `musicUrl` on MahoganySealTemplate. */}
      {bg_music_url && (
        <audio ref={audioRef} loop preload="none">
          <source src={bg_music_url} />
        </audio>
      )}

      {/* Ambient drifting petals — purely decorative, skipped for reduced
          motion. `absolute`, not `fixed`, for the same containing-block
          reason as the texture wash above. */}
      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
          {[12, 32, 54, 71, 88].map((left, i) => (
            <span
              key={left}
              className="pgf-petal absolute top-0 block h-3 w-3 rounded-full bg-gradient-to-br from-[#f4b8c6] to-[#e9a3b6] opacity-60"
              style={{ left: `${left}%`, animationDuration: `${14 + i * 3}s`, animationDelay: `${i * 2.4}s` }}
            />
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------
          1. HEADER — blessing, family intro, couple names, framed by the
          watercolor rose + gold vine bleeding in from both top corners.
          Deliberately kept OUTSIDE the padded content column below (it
          gets its own matching `mx-auto max-w-xl` with no horizontal
          padding) so `FrameLayer`'s `w-full` bleeds edge-to-edge — nested
          inside that column's own `px-5 sm:px-10` instead, the art would
          only ever span the padded-in content width, leaving bare gaps
          down both sides right where the roses should reach the corners.
      --------------------------------------------------------------- */}
      <header className="relative z-10 mx-auto max-w-xl overflow-hidden pt-[clamp(11rem,34vw,15rem)] pb-10 text-center">
        <FrameLayer src={art.floralTop} anchor="top" heightClass="h-[clamp(9.5rem,30vw,13rem)]" />

        <div className="relative z-10 px-6 sm:px-10">
          <Reveal reduceMotion={reduceMotion}>
            <p className="pgf-font-script text-2xl text-[#a9720f] sm:text-3xl">ॐ</p>
            <p className="pgf-gold-text mt-2 text-sm tracking-[0.25em] uppercase sm:text-base">{resolved.blessingLine}</p>
          </Reveal>

          <Reveal reduceMotion={reduceMotion} delayMs={100} className="mt-10">
            <p className="text-sm tracking-[0.2em] text-[#8a5a0c]/80 uppercase sm:text-base">{resolved.familyIntro}</p>
          </Reveal>

          <Reveal reduceMotion={reduceMotion} delayMs={200} className="mt-4">
            <h1 className="pgf-font-script pgf-gold-text text-5xl leading-[1.3] sm:text-6xl">{couple.brideName}</h1>
            <p className="pgf-font-script mt-1 text-2xl text-[#c9932f] sm:text-3xl">&amp;</p>
            <h1 className="pgf-font-script pgf-gold-text text-5xl leading-[1.3] sm:text-6xl">{couple.groomName}</h1>
          </Reveal>

          <Reveal reduceMotion={reduceMotion} delayMs={300} className="mx-auto mt-8 max-w-sm">
            <p className="text-base leading-relaxed text-[#7a5c33] italic sm:text-lg">{resolved.invitationMessage}</p>
          </Reveal>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 sm:px-10">
        {/* ---------------------------------------------------------------
            2. CORE EVENT DETAILS — date, time, main venue, set inside the
            arched card silhouette with the gold lantern vine hanging over
            its peak, same composition as the reference's own date page.
        --------------------------------------------------------------- */}
        <Reveal reduceMotion={reduceMotion}>
          <ArchCard archSrc={art.archBackground} overlaySrc={art.frameTop} className="pt-8" ariaLabel="Wedding date, time and venue">
            <div className="relative z-10 pt-28 sm:pt-32">
              <p className="pgf-font-heading text-xs tracking-[0.3em] text-[#a9720f] uppercase">{dateParts.month}</p>
              <p className="pgf-gold-text pgf-font-heading mt-1 text-7xl font-semibold sm:text-8xl">{dateParts.day}</p>
              <p className="text-sm tracking-[0.2em] text-[#8a5a0c]/80 uppercase">
                {dateParts.weekday} &middot; {dateParts.year}
              </p>

              <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-4 border-t border-[#c9932f]/30 pt-6">
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.2em] text-[#a9720f] uppercase">Time</p>
                  <p className="mt-1 text-sm font-medium text-[#5c431f] sm:text-base">{resolved.weddingTimeLabel}</p>
                </div>
                <div className="h-8 w-px bg-[#c9932f]/30" />
                <div className="flex-1">
                  <p className="text-[11px] tracking-[0.2em] text-[#a9720f] uppercase">Venue</p>
                  <p className="mt-1 text-sm font-medium text-[#5c431f] sm:text-base">{mainVenue.name}</p>
                </div>
              </div>

              {mainVenue.address && <p className="mt-3 text-sm text-[#7a5c33]">{mainVenue.address}</p>}

              <a
                href={buildMapLink(mainVenue)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block text-xs font-medium tracking-[0.15em] text-[#a9720f] uppercase underline decoration-[#c9932f]/50 underline-offset-4 transition-colors hover:text-[#8a5a0c]"
              >
                Get Directions →
              </a>
            </div>
          </ArchCard>
        </Reveal>

        {/* ---------------------------------------------------------------
            3. MULTI-DAY TIMELINE — Sangeet / Haldi / Engagement / Wedding
        --------------------------------------------------------------- */}
        <section className="mt-14" aria-label="Functions and ceremonies">
          <Reveal reduceMotion={reduceMotion} className="text-center">
            <h2 className="pgf-font-script pgf-gold-text text-4xl sm:text-5xl">Functions &amp; Ceremonies</h2>
            <Flourish className="mt-4" />
          </Reveal>

          <div className="mt-10 space-y-8">
            {events.map((event, i) => (
              <Reveal key={event.id} reduceMotion={reduceMotion} delayMs={i * 80}>
                <div className="rounded-xl border border-[#e8c98a]/50 bg-white/60 px-6 py-5 text-center backdrop-blur-sm transition-shadow hover:shadow-[0_14px_34px_-20px_rgba(169,114,15,0.5)] sm:px-8">
                  <p className="pgf-font-heading text-lg font-semibold text-[#8a5a0c] sm:text-xl">{event.name}</p>
                  <p className="mt-1 text-sm tracking-[0.05em] text-[#7a5c33] uppercase">{event.dateLabel}</p>
                  {event.time && <p className="mt-0.5 text-sm text-[#7a5c33]">{event.time}</p>}
                  <p className="mt-2 text-sm text-[#a9720f]">{event.venue.name}</p>
                  {event.venue.address && <p className="text-xs text-[#7a5c33]">{event.venue.address}</p>}
                  {event.note && <p className="mt-2 text-xs text-[#8a5a0c] italic">{event.note}</p>}
                  <a
                    href={buildMapLink(event.venue)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-[11px] font-medium tracking-[0.15em] text-[#a9720f] uppercase underline decoration-[#c9932f]/40 underline-offset-4"
                  >
                    Get Directions →
                  </a>
                </div>
                {i < events.length - 1 && <Flourish className="mt-8" />}
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------
            4. MOTIF & CLOSING
        --------------------------------------------------------------- */}
        <Reveal reduceMotion={reduceMotion} className="mt-16 text-center">
          <MotifMedallion imageUrl={resolved.motifImageUrl} alt="Auspicious blessing motif" />
          <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-[#7a5c33] sm:text-lg">{resolved.closingNote}</p>
        </Reveal>

        {/* ---------------------------------------------------------------
            5. FOOTER / INTERACTIVE ZONE — the real RSVP form, framed by
            the same arch silhouette with the combined lantern-vine-and-
            roses band hanging over its peak.
        --------------------------------------------------------------- */}
        <Reveal reduceMotion={reduceMotion} className="mt-16">
          <ArchCard archSrc={art.archBackground} overlaySrc={art.frameBottom} className="pt-8">
            <div className="relative z-10 pt-28 sm:pt-32">
              <p className="pgf-font-heading pgf-gold-text text-2xl tracking-[0.1em] uppercase sm:text-3xl">RSVP</p>
              <Flourish className="mt-3" />

              {/* The real, functional RSVP form by default — same
                  `/api/rsvps` plumbing every other template's own RSVP
                  form here uses. `rsvpSlot` remains available for a
                  caller that needs to mount something else entirely; see
                  its own doc comment on `PinkGoldFloralTemplateProps`. */}
              <div className="mt-6">
                {rsvpSlot ? rsvpSlot({ invitationSlug: resolved.invitationSlug }) : <PinkGoldFloralRsvpForm slug={resolved.invitationSlug} endpoint={rsvpEndpoint} />}
              </div>

              {host.phone && (
                <p className="mt-6 text-xs tracking-[0.05em] text-[#7a5c33]">
                  Questions? Reach {host.name} at {host.phone}
                </p>
              )}
            </div>
          </ArchCard>
        </Reveal>

        <p className="mt-12 text-center text-xs tracking-[0.3em] text-[#a9720f]/70 uppercase">
          {couple.brideName} &amp; {couple.groomName}
        </p>
      </div>

      {/* Closing bookend — the same rose + gold vine motif as the header,
          mirrored along the very bottom edge of the whole page so the
          entire scroll reads as one continuously framed invitation rather
          than a card that stops being decorated halfway through. Sits in
          normal flow (not `fixed`) so it scrolls in with the rest of the
          page instead of permanently overlapping the footer above it. */}
      <div className="relative z-0 h-[clamp(9.5rem,30vw,13rem)] w-full overflow-hidden" aria-hidden="true">
        <img src={art.floralBottom} alt="" loading="lazy" className="pointer-events-none absolute inset-x-0 bottom-0 w-full object-cover object-bottom" style={{ height: '100%' }} />
      </div>

      {/* Floating, subtle play/mute toggle — fixed in the corner, only
          rendered when a track is actually configured (same gating
          MahoganySealTemplate uses for its own corner AudioToggle). */}
      {bg_music_url && (
        <div className="pgf-root fixed right-4 bottom-4 z-40">
          <AudioToggle isMuted={isMuted} onToggle={toggleAudio} className="!h-11 !w-11 !border-[#c9932f]/40 !bg-[#fff9f2]/85 !text-[#8a5a0c]" />
        </div>
      )}
    </div>
  )
}
