import type { MahoganySealTemplateData } from './types'

/**
 * Realistic mock dataset for local preview/dev. Not imported by the
 * production build path — safe to delete without affecting
 * `MahoganySealTemplate`, which has its own internal fallback defaults.
 *
 * `couple.caricatureUrl` and every `galleryPhotos` entry are stills pulled
 * straight from `videoSrc` below (`public/images/mahogany-seal/*.jpg`) —
 * not generic stock. Borrowing another template's caricature image here
 * (an earlier version of this file used RoyalPlumCurtainTemplate's,
 * purple lehenga and all) put a color palette on screen the intro video
 * never actually shows; the dashboard is meant to feel like a continuation
 * of the video, not a hand-off to an unrelated one. If you swap in a real
 * couple's own video later, re-crop this dataset's images from *that*
 * video the same way (see the frame-extraction note on `videoSrc`).
 */
export const mahoganySealMockData: MahoganySealTemplateData = {
  couple: {
    name1: 'Shaya',
    name2: 'Rehaan',
    caricatureUrl: '/images/mahogany-seal/couple-portrait.jpg',
    caricatureAlt: 'Illustrated Pixar-style caricature of Shaya and Rehaan, a still from the intro video',
    // Matches the wax seal stamped into the intro video's own envelope
    // artwork (see videoSrc below) — keep these in sync if either changes.
    hashtag: '#Shaya',
  },
  weddingDateISO: '2026-12-18T18:30:00+05:30',
  introPrompt: 'Tap to Open Invite',
  events: [
    {
      id: 'engagement',
      name: 'Engagement',
      dateLabel: 'Thu, 17th Dec 2026',
      time: '7:00 PM onwards',
      venue: { name: 'The Oberoi, Gurugram', address: 'Golf Course Road, Gurugram' },
      note: 'Cocktail attire',
      badge: 'Day 1',
    },
    {
      id: 'wedding',
      name: 'Wedding Ceremony',
      dateLabel: 'Fri, 18th Dec 2026',
      time: 'Muhurat begins 6:30 PM',
      venue: { name: 'Taj Palace', address: 'Sardar Patel Marg, New Delhi', mapUrl: 'https://maps.google.com/?q=Taj+Palace+New+Delhi' },
      note: 'Traditional attire in gold and maroon requested',
      badge: 'Day 2',
    },
    {
      id: 'reception',
      name: 'Reception',
      dateLabel: 'Sat, 19th Dec 2026',
      time: '8:00 PM onwards',
      venue: { name: 'The Leela Ambience', address: 'Ambience Island, Gurugram' },
      note: 'Black tie, dancing shoes on',
      badge: 'Day 3',
    },
  ],
  scratch: {
    eyebrow: 'A little secret',
    message: 'We fell in love over chai and bad puns. Come dance at the wedding of the century — ours.',
  },
  galleryPhotos: [
    '/images/mahogany-seal/gallery-1.jpg',
    '/images/mahogany-seal/gallery-2.jpg',
    '/images/mahogany-seal/gallery-3.jpg',
    '/images/mahogany-seal/gallery-4.jpg',
    '/images/mahogany-seal/gallery-5.jpg',
    '/images/mahogany-seal/gallery-6.jpg',
  ],
  gratitudeMessage:
    'Your presence is the best gift we could ask for. Thank you for being part of our story, from the very first chapter to this one.',
  // The rope-pull envelope-opening clip — re-encoded from the original
  // export with `+faststart` (moov atom moved to the front) and down from
  // 13.7MB to ~2MB (H.264 crf 23 + AAC 96k), so metadata and first frame
  // are available instantly instead of only after the whole file
  // downloads. See IntroOverlay's own comment for the fallback this
  // renders in place of it if the URL ever 404s.
  //
  // `couple.caricatureUrl` and `galleryPhotos` above were cropped straight
  // from frames of this exact file (`ffmpeg -ss <t> -frames:v 1 -vf crop=...`)
  // rather than sourced separately, so the dashboard's color palette —
  // ivory sherwani, champagne-gold lehenga, mahogany wood, warm amber glow
  // — always matches whatever's actually on screen a moment earlier.
  videoSrc: '/videos/mahogany-seal-envelope-intro.mp4',
  posterSrc: '/videos/mahogany-seal-envelope-poster.jpg',
  invitationSlug: 'shaya-rehaan',
}

export default mahoganySealMockData
