# RoyalPlumCurtainTemplate

A standalone, plug-and-play luxury Indian wedding invite. Fully self-contained:
its own types, mock data, styles (including font imports), and GSAP-driven
motion — nothing here touches shared app code, global CSS, Tailwind config,
or existing routes.

## Files

```
RoyalPlumCurtainTemplate/
├── RoyalPlumTemplate.tsx      # main container — assembles every section
├── RoyalPlumTemplate.css      # scoped styles + Google Fonts import (.rpc-root namespace)
├── types.ts                   # public prop/data type contract
├── mockData.ts                # realistic sample dataset
├── defaults.ts                # deep-merge fallback + WhatsApp link builder
├── env.d.ts                   # local ambient *.css module declaration (isolated, doesn't touch a global vite-env.d.ts)
├── index.ts                   # barrel export
└── components/
    ├── CurtainEnvelope.tsx    # Step A — seal button + sliding curtain reveal
    ├── ParticleHero.tsx       # Step B — bobbing caricature + canvas light orbs
    ├── ScratchCard.tsx        # Step C — scratch-to-reveal canvas
    ├── CountdownTimer.tsx     # Step D — live Days/Hours/Min/Sec countdown
    └── LoveHearts.tsx         # Step D — click-to-float heart particles
```

## Dependencies added

This template requires GSAP, which was not previously a dependency of this
project. Added additively (nothing existing was changed):

```
npm install gsap @gsap/react
```

`typescript` was also added as a dev dependency so these `.tsx`/`.ts` files
can be type-checked (`tsc --noEmit`) — Vite itself builds TypeScript out of
the box via `@vitejs/plugin-react`, with or without a `tsconfig.json`, so no
build config changed.

## Usage

```tsx
// This project has no `@/...` path alias configured (see vite.config.js) —
// import by relative path, same as every other component here.
import RoyalPlumTemplate from '../components/templates/RoyalPlumCurtainTemplate'
// or: import { RoyalPlumTemplate } from '../components/templates/RoyalPlumCurtainTemplate'

export default function PreviewPage() {
  return (
    <RoyalPlumTemplate
      data={{
        couple: {
          brideName: 'Ananya',
          groomName: 'Vivaan',
          caricatureUrl: '/images/couples/ananya-vivaan.png',
        },
        weddingDateISO: '2026-12-12T18:30:00+05:30',
        events: [
          {
            id: 'pheras',
            name: 'Wedding Pheras',
            timing: 'Muhurat begins 6:30 PM',
            dateLabel: 'Sat, 12th Dec 2026',
            venue: { name: 'The Leela Palace', address: 'Kaiser Bagh, Jodhpur' },
          },
        ],
      }}
    />
  )
}
```

Every field is optional — `data` itself is optional. Omitted fields fall back
to `mockData.ts` via `withRoyalPlumDefaults` (see `defaults.ts`), so
`<RoyalPlumTemplate />` with no props renders a fully populated preview.

### Wiring into the existing template catalog (when you're ready)

This template does **not** register itself anywhere — it's dormant until
imported. To actually offer it as a choice alongside the existing
Ganesh/Satsang/Wedding templates, you'd add one entry to
`src/data/templatesData.js` (or wherever the wedding catalog lives) pointing
at this component, the same way existing entries reference their template
components. That step is deliberately left undone here per the isolation
requirement — it's a one-line addition you can make whenever you're ready to
ship it, not part of this component's own contract.

## Verification performed

- `tsc --noEmit` (strict) over every `.ts`/`.tsx` file — clean.
- `npm run build` (the project's real Vite build) — unaffected, same output
  as before this change (this template isn't imported anywhere yet, so it
  doesn't even reach the bundle).
- `npm run lint` (oxlint) — no new warnings; the 2 pre-existing warnings in
  unrelated files are untouched.
- Rendered in a real browser (temporary, deleted harness) and clicked
  through the full flow: envelope → seal click → curtain slide → hero →
  scratch-reveal (simulated drag → auto-dissolve at threshold) → live
  countdown ticking → Send Love → hearts spawn and self-remove from the DOM.
  Two real bugs were caught this way and fixed:
  - The right curtain panel wasn't covering its half (a stray `left: 0`
    inherited from the base rule's `inset: 0` collided with `right: 0`,
    collapsing both panels onto the left side).
  - The envelope's seal/frame was rendered *under* the curtain z-index,
    making it invisible and unclickable.

## Reduced motion

Pass `reduceMotion` to skip the caricature bob, particle drift, and
scroll-reveal tweens (the CSS also has a `prefers-reduced-motion` block that
kills transition/animation durations as a belt-and-suspenders fallback).
