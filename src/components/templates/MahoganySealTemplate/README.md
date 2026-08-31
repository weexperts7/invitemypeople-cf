# MahoganySealTemplate

A standalone, plug-and-play luxury wedding invite: a cinematic dark-mahogany
intro with a rope-pull envelope video behind a 3D red wax seal CTA, then a
gold-on-cream dashboard with a couple hero, live countdown, itinerary
timeline, scratch-to-reveal card, photo gallery, and a functional RSVP form.

Built with **React + Tailwind CSS utility classes** and plain `useState` +
CSS transitions — no animation library dependency (unlike its neighbor,
`RoyalPlumCurtainTemplate`, which uses GSAP). Fully self-contained: its own
types, mock data, and one small scoped stylesheet — nothing here touches
shared app code, global CSS, Tailwind config, or existing routes.

## Files

```
MahoganySealTemplate/
├── MahoganySealTemplate.tsx   # main container — intro open/closed state, assembles every section
├── MahoganySealTemplate.css   # Google Fonts import + @keyframes + wax-seal/grain texture (.mst-root namespace)
├── types.ts                    # public prop/data type contract
├── mockData.ts                 # realistic sample dataset
├── defaults.ts                 # deep-merge fallback + map-link/date helpers
├── env.d.ts                    # local ambient *.css module declaration (isolated)
├── index.ts                    # barrel export
└── components/
    ├── IntroOverlay.tsx        # full-screen video + "Tap to Open Invite" + wax seal CTA
    ├── WaxSeal.tsx              # the 3D embossed red wax seal button, reused on the RSVP success state too
    ├── CoupleHero.tsx           # names, caricature, hashtag, live countdown
    ├── EventItinerary.tsx       # timeline cards (Engagement / Wedding / Reception, etc.)
    ├── ScratchReveal.tsx        # canvas scratch-to-reveal card
    ├── GalleryPreview.tsx       # photo grid + lightweight lightbox
    ├── RsvpForm.tsx             # RSVP form, posts to /api/rsvps
    ├── AmbientLights.tsx        # warm glow/bokeh/ember decoration, see below
    └── SealBurst.tsx            # gold-light burst bridging intro → dashboard, see below
```

## The intro video

`mockData.ts` now ships with the real rope-pull envelope clip:
`public/videos/mahogany-seal-envelope-intro.mp4` (+ a matching
`mahogany-seal-envelope-poster.jpg` first-frame poster). It plays once,
autoplaying (muted — see below) the moment the template mounts, and
finishing the clip auto-advances into the main dashboard on its own —
tapping the seal or anywhere on the overlay still skips it early for
guests who don't want to wait.

The file handed off originally was a raw 13.7MB export with its `moov` atom
at the *end* of the file (no `+faststart`) — browsers can't read a video's
duration/dimensions until that atom is found, so playback stalled
indefinitely waiting to download the whole file first. It was re-encoded
with `ffmpeg -c:v libx264 -crf 23 -c:a aac -b:a 96k -movflags +faststart`,
which moves `moov` to the front and dropped the file to ~2MB — metadata and
first frame are now available instantly. If you swap in a different clip
later, re-run it through the same `+faststart` treatment or you'll hit the
same stall.

`data.videoSrc` / `data.posterSrc` stay fully overridable:

```tsx
<MahoganySealTemplate data={{ videoSrc: '/videos/your-clip.mp4', posterSrc: '/videos/your-poster.jpg' }} />
```

**Sound**: the clip has its own audio track, but it plays `muted` — browsers
only allow autoplay-on-page-load without a prior user gesture when the
video is muted, and the brief calls for the video to start playing the
moment the guest lands, not after a tap. Muting is the tradeoff that keeps
autoplay reliable; an unmute toggle is a small addition if you'd rather
guests opt into sound.

If `videoSrc` is left unset (or the URL 404s), `IntroOverlay` renders an
illustrated CSS/SVG envelope-and-seal in its place — see `EnvelopeFallback`
in `IntroOverlay.tsx` — so the intro always looks intentional, never
broken. That fallback has no video to end, so it waits for the tap/seal
skip instead of auto-opening.

## Usage

```tsx
// No `@/...` path alias in this project — import by relative path.
import MahoganySealTemplate from '../components/templates/MahoganySealTemplate'

export default function PreviewPage() {
  return (
    <MahoganySealTemplate
      data={{
        couple: {
          name1: 'Shaya',
          name2: 'Rehaan',
          caricatureUrl: '/images/couples/your-caricature.png',
          hashtag: '#ShayaWedsRehaan',
        },
        weddingDateISO: '2026-12-18T18:30:00+05:30',
        events: [
          {
            id: 'wedding',
            name: 'Wedding Ceremony',
            dateLabel: 'Fri, 18th Dec 2026',
            time: 'Muhurat begins 6:30 PM',
            venue: { name: 'Taj Palace', address: 'Sardar Patel Marg, New Delhi' },
          },
        ],
        invitationSlug: 'shaya-rehaan',
      }}
    />
  )
}
```

Every field is optional — `data` itself is optional. Omitted fields fall
back to `mockData.ts` via `withMahoganySealDefaults`, so
`<MahoganySealTemplate />` with no props renders a fully populated preview.

## Ambient lighting

The intro video is warmly and brightly lit — lamplight amber on the
envelope, out-of-focus fairy-light bokeh glowing at the edges of frame.
`AmbientLights.tsx` carries that same lighting into every section that
follows it, instead of the dashboard dropping into flatter, plainer dark
gradients the moment the video ends:

- `variant="wash"` (`CoupleHero`, `EventItinerary`, `ScratchReveal`,
  `GalleryPreview`, `RsvpForm`, the footer) — a soft top-down glow plus a
  few out-of-focus warm light dots. `density="full"` on `CoupleHero` only,
  since it's the first section the guest sees right after the video;
  `density="soft"` everywhere else so it stays a background detail, not
  the focal point of every section.
- `variant="strings"` — two columns of hanging fairy-light bulbs down the
  left/right edges, used by `IntroOverlay`'s illustrated `EnvelopeFallback`
  (no video, a failed video, or `reduceMotion`) so that stand-in scene
  reads as intentionally lit too, not a dimmer placeholder for the real
  clip.

Built entirely from pieces that already existed but were never wired up:
the `mst-shimmer` and `mst-ember-drift` keyframes (defined since this
template's first pass, unused until now) and the `mst-rope-sway` keyframe
`EnvelopeFallback`'s own rope already used. `reduceMotion` drops the
flicker/drift animations (the glow wash and bokeh dots stay, just static)
— see "Reduced motion" below.

## The intro → dashboard transition

Opening the invite (video ends on its own, or a tap skips it early) used to
be a plain crossfade: the video fades/slides out, the dashboard fades in,
done. It now plays as one continuous, lit motion instead:

1. The video (or the illustrated fallback) zooms slightly toward the guest
   while brightening and softening — `scale-110 brightness-125 blur-[2px]`
   on `IntroOverlay`'s own root — instead of just fading and sliding away.
2. `SealBurst` mounts in that same instant: a bloom of warm gold light
   (`mst-burst-flash`, radial-gradient + scale) that punches in fast, then
   blossoms outward as it fades — the seal "breaking open," standing in
   for the moment neither the video nor the dashboard is fully on screen.
3. The dashboard doesn't just fade in either — it settles into focus,
   starting very slightly zoomed and soft (`scale-[1.04] blur-sm`) and
   easing down to its resting scale and sharpness (`scale-100 blur-none`)
   as it fades up, timed to land right as the burst's own bloom is fading
   out.

All three are plain CSS transitions/animations (no library), timed off two
`setTimeout`s in `MahoganySealTemplate.tsx` (`DISMISS_MS`, `BURST_MS`) that
are kept in sync with the CSS durations they're timing by comment, the
same pattern the rest of this template already uses.

## RSVP wiring

`RsvpForm.tsx` uses the same shared plumbing every other template's RSVP
form does: `useRsvpSubmit` (posts to `/api/rsvps`), `Honeypot`, and
`TurnstileWidget` (needs `VITE_TURNSTILE_SITE_KEY` set — see `.env.example`).
Pass `data.invitationSlug` for a real invite record or submits will 404
against an unknown slug — same "known gap until wired" behavior
`RoyalPlumCurtainTemplate` documents for its own `invitationSlug`.

The backend's `rsvps` table has no dedicated meal-preference column (see
`api/_lib/rsvps.js`), so the selected meal is folded into the free-form
`message` field before submit rather than silently dropped — a real column
is a one-line migration away whenever this is wired in for production.

### Wiring into the existing template catalog (when you're ready)

This template does **not** register itself anywhere — it's dormant until
imported. To offer it as a choice alongside the existing templates, add one
entry to the wedding catalog (`src/data/templatesData.js` or wherever it
lives) pointing at this component. Deliberately left undone here, same as
`RoyalPlumCurtainTemplate`'s own README explains.

## Reduced motion

Pass `reduceMotion` to skip the shimmer/pulse/floating-ember effects; the
CSS also has a `prefers-reduced-motion` block that kills transition/
animation durations as a belt-and-suspenders fallback.
