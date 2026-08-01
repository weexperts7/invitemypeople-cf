# Aarav & Diya — Wedding Invitation

An interactive digital wedding invitation built with Vite, React, Tailwind CSS,
Framer Motion, and Lucide icons. Mobile-first: on wider screens the site renders
inside a centred phone-width shell.

## Getting started

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>. This starts two processes: the Vite site on
5173 and the RSVP API on 3001 (Vite proxies `/api` to it).

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Site + RSVP API together                      |
| `npm run dev:web` | Just the site                                 |
| `npm run dev:api` | Just the RSVP API                             |
| `npm run build`   | Production build into `dist/`                 |
| `npm start`       | Serve `dist/` **and** the RSVP API on one port |
| `npm run preview` | Vite's preview server                         |
| `npm run lint`    | Oxlint                                        |

## Sections

- **Envelope landing** — wax-sealed envelope, tap to open, flap unfolds and a
  gold particle wave sweeps the screen
- **Welcome** — Ganesha invocation, couple names, family details
- **Save the Date** — canvas scratch-to-reveal cards (July / 01 / 2026) that
  fire a full-screen confetti celebration
- **Our Celebration** — ceremony timeline with a scroll-drawn line and a live
  countdown to July 1, 2026
- **Our Moments** — photo grid with a lightbox
- **RSVP** — attendance, headcount, a dance-floor song request, marriage advice
  for the couple, and blessings — all saved to a Google Sheet

Petals drift continuously down the page throughout (CSS-driven, disabled under
`prefers-reduced-motion`).

## RSVP responses

Every submission is appended to a real Excel file — **no setup needed**:

```
data/rsvps.xlsx     ← the guest list, open it in Excel
data/rsvps.json     ← source of truth the spreadsheet is rebuilt from
```

Admin can also fetch <http://localhost:3001/api/rsvps.xlsx> to download it, or
<http://localhost:3001/api/rsvps> for JSON.

This requires the Node API to be running (`npm run dev` or `npm start`), so it
does **not** work on static-only hosting. For that, switch to the Google Sheets
option — both are documented in [RSVP-SETUP.md](RSVP-SETUP.md).

`data/` is gitignored: guest names and messages are personal data.

## Customising

- Names, family details, and copy: `src/components/WelcomeSplash.jsx`
- Ceremonies and the countdown target: `EVENTS` / `WEDDING_DATE` in
  `src/components/EventTimeline.jsx`
- The revealed date: `CARDS` in `src/components/ScratchCardSection.jsx`
- Photos: `PHOTOS` in `src/components/PhotoGallery.jsx` (currently placeholder
  images from picsum.photos — swap in real ones)
- Colours and fonts: the `@theme` block in `src/index.css`

All motion respects `prefers-reduced-motion`.
