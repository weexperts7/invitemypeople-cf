import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import './MahoganySealTemplate.css'
import type { MahoganySealTemplateProps } from './types'
import { withMahoganySealDefaults } from './defaults'

import IntroOverlay from './components/IntroOverlay'
import CoupleHero from './components/CoupleHero'
import EventItinerary from './components/EventItinerary'
import GalleryPreview from './components/GalleryPreview'
import RsvpForm from './components/RsvpForm'
import AmbientLights from './components/AmbientLights'
import SealBurst from './components/SealBurst'

// How long the intro overlay's own CSS transition takes to finish (see the
// `duration-700` class on IntroOverlay's root) — kept in one place so the
// unmount timer below can never drift out of sync with the animation it's
// timing.
const DISMISS_MS = 700

// How long SealBurst's own `mst-burst-flash` animation runs (see its
// `950ms` there) — kept in one place for the same reason as `DISMISS_MS`
// above: this timer just needs to outlive the animation so the burst
// unmounts after it's actually finished playing, not mid-flash.
const BURST_MS = 950

// Every WhatsApp CTA site-wide reaches this same business number (see
// SiteHeader.jsx/SiteFooter.jsx/WeddingsPage.jsx, all
// `const WHATSAPP_NUMBER = '918847044554'`) — kept in sync here by hand
// since this template is deliberately self-contained and doesn't import
// from those files. See the "Create Your Own Invitation" bar below for why
// this opens a chat directly rather than linking to a details page.
const WHATSAPP_NUMBER = '918847044554'
const WHATSAPP_MESSAGE = "Hi! I'd love to create my own Mahogany Seal wedding invitation ✨"

/**
 * MahoganySealTemplate — a standalone, plug-and-play luxury wedding invite.
 * Cinematic intro (full-bleed rope-pull envelope video) → couple hero with
 * a live countdown → itinerary timeline → scratch-to-reveal secret →
 * photo gallery → RSVP.
 *
 * Fully self-contained: its own types, mock data, and scoped styles
 * (MahoganySealTemplate.css) — nothing here touches shared app code,
 * global CSS, Tailwind config, or existing routes. The only things it
 * reuses are the platform's shared RSVP plumbing (Honeypot, TurnstileWidget,
 * useRsvpSubmit) so the form is genuinely functional against `/api/rsvps`
 * rather than a decorative dead end — same call RoyalPlumCurtainTemplate's
 * own RSVP form makes.
 *
 * Intro open/closed is the one piece of local state this component owns
 * directly (`useState`, no animation library): `dismissing` flips true the
 * instant the intro video ends (`IntroOverlay` calls `onOpen` straight
 * from the video's own `onEnded` — no "now tap to continue" step in
 * between; tapping the screen at any point does the same thing early, as
 * a safety net for browsers that block autoplay). IntroOverlay's own CSS
 * transition zooms/fades it out, and once that's had time to finish,
 * `opened` flips true and the overlay unmounts. `bursting` flips true in
 * that same instant and drives `SealBurst` — a bloom of gold light that
 * bridges the handoff so what shows through the gap between the video
 * fading out and the dashboard fading in is a flash of the seal's own
 * light, not this root's plain dark background.
 */
export default function MahoganySealTemplate({
  data,
  onOpen,
  reduceMotion = false,
  showCreateCta = true,
}: MahoganySealTemplateProps) {
  const resolved = withMahoganySealDefaults(data)
  const { couple } = resolved
  const [opened, setOpened] = useState(false)
  // Drives `main`'s opacity/scale/blur specifically — kept separate from
  // `opened` (which drives whether it's in layout at all, via the `hidden`
  // class) because a CSS transition can't animate from a state that was
  // never painted: the moment `opened` flips true, `main` goes from
  // `display: none` to laid-out-at-opacity-0 in that same render, and only
  // gets its "settled" target one frame later (see the effect below), so
  // there's an actual painted "not yet settled" frame for the transition
  // to animate from instead of a silent pop-in.
  const [revealed, setRevealed] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [bursting, setBursting] = useState(false)
  const rafRef = useRef(0)

  const handleOpen = () => {
    if (dismissing || opened) return
    setDismissing(true)
    setBursting(true)
    window.setTimeout(() => {
      setOpened(true)
      onOpen?.()
    }, DISMISS_MS)
    window.setTimeout(() => setBursting(false), BURST_MS)
  }

  useEffect(() => {
    if (!opened) return
    // Double rAF: the first guarantees `main`'s un-hidden, opacity-0 state
    // has actually been painted; only then does flipping to opacity-100
    // (inside the second) register as a genuine transition rather than
    // both class changes landing in the same frame.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setRevealed(true))
    })
    return () => cancelAnimationFrame(rafRef.current)
  }, [opened])

  return (
    // Dark mahogany, not the bright cream this was originally — every
    // section now backs itself with its own dark tone (see
    // EventItinerary/GalleryPreview's own comments on why), but this root
    // color is what's actually visible for a moment during the transition
    // itself: IntroOverlay fades out and `main` fades in on their own
    // independent 700ms timers, so there's a real gap where neither is
    // fully opaque and this shows through underneath both. `SealBurst`
    // covers most of that gap with gold light on purpose, but this is the
    // color behind *that*, so it stays dark mahogany rather than the
    // bright cream this was originally — that combination read as a flash
    // of plain white cutting through an otherwise all-dark reveal.
    <div className="mst-root relative min-h-svh bg-[#1a100d]">
      {!opened && (
        <IntroOverlay
          hashtag={couple.hashtag}
          introPrompt={resolved.introPrompt}
          videoSrc={resolved.videoSrc}
          posterSrc={resolved.posterSrc}
          dismissing={dismissing}
          onOpen={handleOpen}
          reduceMotion={reduceMotion}
        />
      )}

      <SealBurst active={bursting} reduceMotion={reduceMotion} />

      {/* `display: none` (Tailwind's `hidden`) while the intro is still up
          — not just `opacity-0`, and not `overflow-hidden` + zero height
          either (tried that first; it clips the *paint* but the collapsed
          box's full natural content height still counts toward whatever
          ancestor scrolls, because `overflow: hidden` on its own doesn't
          stop a descendant's layout size from being measured — only
          removing it from layout with `display: none` does). `IntroOverlay`
          is `position:fixed` so it visually covers this regardless either
          way, but without `hidden`, this dashboard's full scrollable
          length still counts toward whatever ancestor scrolls (the page
          itself in real usage; the phone-frame preview's own
          `overflow-y-auto` card everywhere else), producing a scrollbar
          with nothing visibly there to scroll to.

          `revealed` (not `opened`) drives the transition so there's an
          actual painted "not yet settled" frame to animate from — see the
          double-rAF effect above for why `opened` alone would collapse
          this into a silent pop-in. The dashboard doesn't just fade in
          anymore: it settles into focus — starting very slightly
          zoomed-in and soft, then easing down to its resting scale and
          sharpness as it fades up, timed to land right as `SealBurst`'s
          own bloom is fading out, so the light seems to resolve directly
          into the dashboard rather than two unrelated effects happening
          to overlap. */}
      <main
        aria-hidden={!opened}
        className={`origin-top transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${opened ? '' : 'hidden'} ${
          revealed ? 'scale-100 opacity-100 blur-none' : 'scale-[1.04] opacity-0 blur-sm'
        }`}
      >
        <CoupleHero
          name1={couple.name1}
          name2={couple.name2}
          hashtag={couple.hashtag}
          caricatureUrl={couple.caricatureUrl}
          caricatureAlt={couple.caricatureAlt}
          weddingDateISO={resolved.weddingDateISO}
          reduceMotion={reduceMotion}
        />

        <EventItinerary events={resolved.events} reduceMotion={reduceMotion} />

        {/* The big "secret message" scratch card (ScratchReveal) that used to
            sit here is hidden per request — one scratch-to-reveal moment
            (the date, up in CoupleHero) is plenty; a second one right after
            it read as repetitive rather than a fresh surprise. The
            component itself is left in place, unused, in case it's wanted
            back later — nothing else in the file references it. */}

        <GalleryPreview photos={resolved.galleryPhotos} reduceMotion={reduceMotion} />

        <RsvpForm slug={resolved.invitationSlug} reduceMotion={reduceMotion} />

        {/* Extra bottom padding (pb-32, was pb-12) so the fixed "Create
            Your Own" bar below never sits on top of the footer's own text
            — the bar's height plus its gradient fade needs real room to
            breathe under the gratitude message instead of overlapping it. */}
        <footer className={`relative overflow-hidden bg-[#1a100d] px-6 pt-12 text-center ${showCreateCta ? 'pb-32' : 'pb-12'}`}>
          <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
          <p className="mst-font-script relative z-10 text-3xl text-[#d4af37]">With Love</p>
          <p className="relative z-10 mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#fbf3e3]/70">{resolved.gratitudeMessage}</p>
          <p className="mst-font-seal relative z-10 mt-6 text-xs tracking-[0.3em] text-[#d4af37]/60 uppercase">{couple.hashtag}</p>
        </footer>

      </main>

      {/* The site's other templates hand this off to the self-service,
          Razorpay-backed Invitation Builder (see InvitationExperience.jsx's
          own "Create Your Own — ₹X" bar) — this template's caricature
          video is bespoke, hand-produced work instead, so instant
          self-checkout was never really on the table. Rather than routing
          through a details form first, this CTA opens a WhatsApp chat
          straight away (`wa.me`, pre-filled) — the moment someone taps it
          we already have a real lead (their WhatsApp contact), before
          they've filled in a single field. Our team follows up in that
          chat and sends back the actual details form
          (MahoganySealCreatePage.tsx, at the permanent `/mahogany-seal/create`
          URL) for the lead to fill in on their own time — that page is
          never linked to automatically anymore; it's only ever reached by
          a link our team pastes into the conversation. `showCreateCta`
          defaults to true (every current caller is this template's own
          sales showcase); pass `false` once this is ever wired in as a
          real, already-paid-for guest-facing invite, the same way
          InvitationExperience.jsx gates its own CTA on `isPreview`.

          Portaled straight to <body>, not rendered in place — every caller
          (the standalone /_preview route, and now the real catalog via
          InvitationExperience's own phone-frame card, see App.jsx/
          InvitationExperience.jsx) wraps this template in a container with
          a *transformed* ancestor so `position:fixed` descendants like
          GalleryPreview's lightbox clip to that card instead of the full
          browser window. But a transformed ancestor that's ALSO a scroll
          container (`overflow-y-auto`) makes its `fixed` descendants
          scroll away with the content instead of staying put — this bar
          would only become visible once a guest scrolled all the way to
          the very bottom of the page, instead of floating there the whole
          time. A portal escapes that trap entirely, same fix
          GalleryPreview.tsx's own lightbox uses. Gated on `opened` here
          (not the `hidden` class `main` uses) since a portal renders
          outside `main`'s own DOM subtree, so its parent's `display:none`
          can no longer hide it for free. */}
      {opened &&
        showCreateCta &&
        createPortal(
          <div className="mst-root fixed inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-[#1a100d] via-[#1a100d]/85 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mst-font-seal flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#8b1e1e] px-6 py-3.5 text-xs tracking-[0.15em] text-[#fbf3e3] uppercase shadow-[0_10px_28px_-8px_rgba(139,30,30,0.7)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <span aria-hidden="true" className="text-sm">♥</span>
              Create Your Own Invitation
            </a>
          </div>,
          document.body,
        )}
    </div>
  )
}
