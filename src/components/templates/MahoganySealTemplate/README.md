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
    ├── SealBurst.tsx            # gold-light burst bridging intro → dashboard, see below
    ├── EventDetailsEditor.tsx   # dynamic events list, used by ../../../pages/MahoganySealCreatePage.tsx
    ├── MstPhotoUploader.tsx     # gold-on-mahogany photo uploader, same page
    └── leadFormTypes.ts         # shared LeadEvent type/constant for the two above
```

The "Create Your Own" lead-capture form itself (see below) lives outside
this directory, at `src/pages/MahoganySealCreatePage.tsx` — it's a full
page (`SiteHeader`/`SiteFooter`, real route), not something scoped inside
this otherwise self-contained template.

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

## "Create Your Own" — an instant WhatsApp lead, then a details page

Every other template's sales showcase hands off to the site-wide
self-service Invitation Builder (`/create`, see `CreateInvitePage.jsx`) —
pick a style, fill in details, pay via Razorpay, get a live invite
instantly, all on one dedicated page. This template's caricature intro
video is bespoke, hand-produced work, so there's no instant checkout to
send anyone to — and rather than fronting a details form before the buyer
has even said hello, the fixed "Create Your Own Invitation" bar (shown
once the dashboard's revealed, see `showCreateCta` on
`MahoganySealTemplateProps`) opens a pre-filled WhatsApp chat straight
away (`wa.me`, same business number every WhatsApp CTA site-wide uses).
The instant someone taps it, we have a real lead — their WhatsApp contact
— before they've filled in a single field.

`MahoganySealCreatePage.tsx`, the actual "tell us everything" form (couple
names, wedding date, an events list, hashtag, gallery photos, each
partner's individual photo for the caricature, a footer message, contact
details), still exists at its own permanent URL —
`/mahogany-seal/create` — but nothing links there automatically anymore.
It's what our team sends the lead *after* that first WhatsApp reply, so
they can fill in the rest on their own time. Submitting it still composes
a formatted WhatsApp message from everything filled in and opens `wa.me`
with it pre-filled, same as before; our team follows up with the buyer's
own live template link, and payment happens there once they're happy with
it.

Nothing here writes to any database table — every photo (`galleryPhotos`,
each partner's portrait) uploads immediately to the same `POST /api/photos`
endpoint the real Invitation Builder uses (so the WhatsApp message carries
real, clickable Supabase Storage URLs, not files WhatsApp's own share
sheet has no way to attach for us), but the WhatsApp message itself *is*
the submission. This can't affect the self-service builder's own DB-backed
flow (`invites` table, Razorpay, `/api/invites`) at all.

The "Create Your Own" bar itself is a plain `<a href="https://wa.me/...">`
— no shared-app import needed for that anymore (an earlier version linked
to the details page directly via react-router's `Link`; this template is
back to depending on nothing outside its own directory). `MahoganySealCreatePage.tsx`,
reached separately once a lead's already in a WhatsApp conversation, is
the one place that still uses the shared `SiteHeader`/`SiteFooter`/`SEO`
components — it's a real page, not part of this self-contained tree.

### Wiring into the existing template catalog

Now registered in the real wedding catalog (`TEMPLATES` in
`src/data/templatesData.js`, `id: 'mahogany-seal'`), same mechanism
`royal-plum-curtain` uses: `layout: 'mahogany-seal'` dispatches through
`src/components/wedding/layoutRegistry.js` to
`src/components/wedding/mahogany-seal/MahoganySealAdapter.jsx`, which
renders this component with no `data` prop at all — every visitor lands on
the same curated showcase dataset (`mockData.ts`) to preview the design;
personalizing happens over WhatsApp instead (see "Create Your Own" above).
This makes the template show up in `WeddingsPage`'s grid and reachable at
`/templates/wedding/mahogany-seal`, same as every other template's
"Preview" button.

Two catalog fields specific to this template keep the generic self-service
builder out of its way: `hasOwnCreateCta: true` tells
`InvitationExperience.jsx` to skip its own generic "Create Your Own — ₹X"
bar (this template already renders its own WhatsApp one — see above), and
`customizeWhatsAppMessage` overrides `TemplateCard.jsx`'s "Customize"
button on the listing grid to open the same pre-filled WhatsApp chat
instead of the site-wide `/create` builder link every other template's
Customize button uses.

## Reduced motion

Pass `reduceMotion` to skip the shimmer/pulse/floating-ember effects; the
CSS also has a `prefers-reduced-motion` block that kills transition/
animation durations as a belt-and-suspenders fallback.
