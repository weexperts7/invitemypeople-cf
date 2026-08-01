// Guruji Satsang invitation templates — a separate category from the wedding
// TEMPLATES in templatesData.js, since a Satsang has its own shape of content
// (host/family instead of a couple, a single event instead of a ceremony
// list, Mahaprasad details) rather than being a reskinned wedding invite.
//
// Each template's `slug` drives its live URL (/satsang/:slug — see App.jsx)
// and its dedicated Google Sheet tab (RSVPs are stored under
// `satsang-${slug}`, same appendRow-per-tab mechanism the wedding invites
// already use — see google-apps-script/Code.gs).
//
// `palette`/`fonts`/`motif`/`motifAccent` follow the same contract as the
// wedding templates (see templatesData.js's comment block) so the same
// CulturalMotif/TemplateFrame system re-skins for free.
//
// `layout` (optional) is new: it names a bespoke experience component from
// src/components/satsang/layoutRegistry.js — a fully custom structure, CSS
// and interactive presentation, not just a re-skin. Templates without a
// `layout` render through the original shared LegacySatsangExperience.
export const SATSANG_TEMPLATES = [
  {
    slug: 'divine-peacock',
    name: 'The Royal Peacock',
    layout: 'royal-peacock',
    tagline: 'Majestic peacock blues, greens & glowing gold',
    description:
      'Majestic deep peacock-blue and emerald behind a continuous gold frame, glowing gold accents, an archway niche, and intricate peacock feather motifs — a regal, devotional welcome to Guruji\'s Satsang, bordered like a physical luxury invitation card.',
    tags: ['Peacock', 'Regal', 'Bordered Frame'],
    motif: 'peacock-feather',
    motifAccent: '#0f6e5c',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Malhotra Family',
      hostLine:
        'Together with our family, we joyfully invite you to a sacred Satsang in Guruji\'s divine presence.',
    },
    event: {
      date: 'September 12, 2026',
      time: '6:00 PM onwards',
      venue: 'Shree Guruji Ashram, Sector 21, Gurugram',
    },
    mahaprasad: {
      time: '8:30 PM',
      note: 'Mahaprasad will be lovingly served after the Satsang concludes. All devotees are warmly requested to partake.',
    },
    palette: {
      ivory: '#fbfbf6',
      linen: '#eef4f2',
      champagne: '#dcecd8',
      champagneDeep: '#a9cdb0',
      blush: '#dfeef0',
      blushDeep: '#9dc9cf',
      rose: '#0c3f42',
      gold: '#c9a24b',
      goldSoft: '#e2c884',
      ink: '#0a2422',
      inkSoft: '#3a5f5c',
    },
  },
  {
    slug: 'saffron-blossom',
    name: 'Saffron Lotus Serenity',
    layout: 'saffron-lotus-serenity',
    tagline: 'Warm saffron & ivory, minimalist lotus line art',
    description:
      'Warm saffron over soft ivory and cream, modern minimalist lotus line art, and parchment-style card containers laid out with editorial whitespace and asymmetrical offsets — a peaceful, radiant invitation to Guruji\'s Satsang.',
    tags: ['Saffron', 'Lotus', 'Editorial'],
    motif: 'saffron-lotus',
    motifAccent: '#c25a1e',
    fonts: { serif: '"Rozha One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Sharma Family',
      hostLine:
        'With hearts full of gratitude, our family invites you to join us for a blessed Satsang in Guruji\'s divine presence.',
    },
    event: {
      date: 'October 3, 2026',
      time: '5:30 PM onwards',
      venue: 'Radha Krishna Mandir Hall, Malviya Nagar, Jaipur',
    },
    mahaprasad: {
      time: '8:00 PM',
      note: 'Mahaprasad will be served after the Satsang concludes. All devotees are lovingly requested to partake.',
    },
    palette: {
      ivory: '#fffdf9',
      linen: '#fdf6ea',
      champagne: '#fbe3c0',
      champagneDeep: '#f0bd7c',
      blush: '#fce3d3',
      blushDeep: '#f0b48c',
      rose: '#c2531c',
      gold: '#d9932e',
      goldSoft: '#eec27a',
      ink: '#4a2f1a',
      inkSoft: '#8a6446',
    },
  },
  {
    slug: 'golden-temple-altar',
    name: 'Golden Temple Altar',
    layout: 'golden-temple-altar',
    tagline: 'Vintage gold, sepia & maroon, altar aesthetics',
    description:
      'Vintage gold, sepia and rich maroon over a symmetrical altar aesthetic, with sacred lamp and diya elements — Guruji\'s Satsang unfolds as five sequential chapters, blessing revealed inside a tap-to-open envelope.',
    tags: ['Altar', 'Diya', 'Storybook'],
    motif: 'temple-gold',
    motifAccent: '#c28a3a',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Trivedi Family',
      hostLine:
        'With reverence at the sacred altar, our family invites you to a divine Satsang in Guruji\'s presence.',
    },
    event: {
      date: 'March 14, 2027',
      time: '6:00 PM onwards',
      venue: 'Golden Temple Ashram Hall, Amritsar Road, Jalandhar',
    },
    mahaprasad: {
      time: '8:30 PM',
      note: 'Mahaprasad will be lovingly served at the altar after the Satsang concludes. All devotees are warmly requested to partake.',
    },
    palette: {
      ivory: '#fdf9f0',
      linen: '#f4e8d8',
      champagne: '#edcdb6',
      champagneDeep: '#d99e6e',
      blush: '#f0d6cd',
      blushDeep: '#c98f6f',
      rose: '#6b1e28',
      gold: '#b3862c',
      goldSoft: '#d9b26a',
      ink: '#33200f',
      inkSoft: '#6e5238',
    },
  },
  {
    slug: 'radiant-sunrise',
    name: 'Radiant Sunrise',
    tagline: 'Warm golds & amber sunrise tones',
    description:
      'A radiant sunburst in warm gold and amber over soft cream — an uplifting welcome to Guruji\'s morning Satsang.',
    tags: ['Sunrise', 'Uplifting', 'Golden'],
    motif: 'sunrise-rays',
    motifAccent: '#e0842a',
    fonts: { serif: '"Yatra One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Agarwal Family',
      hostLine:
        'With hearts full of light, our family invites you to a morning Satsang in Guruji\'s divine presence.',
    },
    event: {
      date: 'November 8, 2026',
      time: '7:00 AM onwards',
      venue: 'Suryodaya Ashram, Indore',
    },
    mahaprasad: {
      time: '9:30 AM',
      note: 'Mahaprasad will be lovingly served after the Satsang concludes. All devotees are warmly requested to partake.',
    },
    palette: {
      ivory: '#fffaf2',
      linen: '#fdf1dc',
      champagne: '#f9dfa8',
      champagneDeep: '#eebd5e',
      blush: '#fbe6c6',
      blushDeep: '#f0bf7e',
      rose: '#c9611f',
      gold: '#d98f2e',
      goldSoft: '#eec478',
      ink: '#4a2d12',
      inkSoft: '#8a6238',
    },
  },
  {
    slug: 'tulsi-serenity',
    name: 'Tulsi Serenity',
    tagline: 'Fresh sage green & holy tulsi leaf',
    description:
      'A serene sage-green canvas with delicate tulsi leaf sprays — a peaceful, grounded welcome to Guruji\'s Satsang.',
    tags: ['Tulsi', 'Minimal', 'Serene'],
    motif: 'tulsi-leaf',
    motifAccent: '#4f8a5b',
    fonts: { serif: '"Rozha One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Iyer Family',
      hostLine:
        'With quiet gratitude, our family invites you to join us for a peaceful Satsang in Guruji\'s divine presence.',
    },
    event: {
      date: 'December 6, 2026',
      time: '6:00 PM onwards',
      venue: 'Tulsi Bhawan Ashram, Pune',
    },
    mahaprasad: {
      time: '8:00 PM',
      note: 'Mahaprasad will be served after the Satsang concludes. All devotees are lovingly requested to partake.',
    },
    palette: {
      ivory: '#fbfdf9',
      linen: '#f1f7ee',
      champagne: '#dfeed8',
      champagneDeep: '#b9d8ab',
      blush: '#e9f2e3',
      blushDeep: '#c3ddb4',
      rose: '#3f7a4a',
      gold: '#b99a4a',
      goldSoft: '#dcc98a',
      ink: '#233420',
      inkSoft: '#5c6f56',
    },
  },
  {
    slug: 'diya-ganga',
    name: 'Diya Ganga',
    tagline: 'Deep maroon & gold, aarti glow',
    description:
      'Rows of glowing diyas over a deep maroon and gold canvas — a warm, aarti-lit welcome to Guruji\'s evening Satsang.',
    tags: ['Diya', 'Aarti', 'Radiant'],
    motif: 'diya-wave',
    motifAccent: '#c9682f',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Tiwari Family',
      hostLine:
        'With devotion in our hearts, our family invites you to a divine evening Satsang in Guruji\'s presence.',
    },
    event: {
      date: 'January 17, 2027',
      time: '6:30 PM onwards',
      venue: 'Ganga Aarti Ashram, Varanasi',
    },
    mahaprasad: {
      time: '8:45 PM',
      note: 'Mahaprasad will be lovingly served after the Aarti and Satsang conclude. All devotees are warmly requested to partake.',
    },
    palette: {
      ivory: '#fdf8f5',
      linen: '#f6e6de',
      champagne: '#edcdb6',
      champagneDeep: '#d99e6e',
      blush: '#f0d6cd',
      blushDeep: '#dba496',
      rose: '#7a2230',
      gold: '#c28a3a',
      goldSoft: '#e0bd80',
      ink: '#3a1418',
      inkSoft: '#7a4a45',
    },
  },
  {
    slug: 'celestial-om',
    name: 'Celestial Om',
    tagline: 'Midnight indigo & starlit gold',
    description:
      'A midnight-indigo sky scattered with gold stars around a glowing Om — a tranquil welcome to Guruji\'s night Satsang.',
    tags: ['Celestial', 'Night', 'Tranquil'],
    motif: 'celestial-om',
    motifAccent: '#c9a24b',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Jai Guruji' },
    host: {
      familyName: 'The Nair Family',
      hostLine:
        'Under Guruji\'s blessings, our family invites you to a tranquil night Satsang in his divine presence.',
    },
    event: {
      date: 'February 21, 2027',
      time: '8:00 PM onwards',
      venue: 'Shanti Dham Ashram, Rishikesh',
    },
    mahaprasad: {
      time: '9:30 PM',
      note: 'Mahaprasad will be served after the Satsang concludes. All devotees are lovingly requested to partake.',
    },
    palette: {
      ivory: '#f7f8fc',
      linen: '#e9edf6',
      champagne: '#d6ddef',
      champagneDeep: '#a9b8dd',
      blush: '#dde3f4',
      blushDeep: '#b2c0e6',
      rose: '#3a4a8f',
      gold: '#c9a24b',
      goldSoft: '#e2c884',
      ink: '#1c2340',
      inkSoft: '#4d5678',
    },
  },
]

export function getSatsangTemplateBySlug(slug) {
  return SATSANG_TEMPLATES.find((t) => t.slug === slug)
}

// Guruji's photo is the same across every Satsang template (it's one Guruji,
// not one per design), so it's a single shared path rather than a per-template
// field. Drop the actual photo at public/images/guruji-photo.jpg and it takes
// over automatically — see GurujiPhoto.jsx, which falls back to a devotional
// placeholder glyph if that file isn't present yet.
export const GURUJI_PHOTO_SRC = '/images/guruji-photo.jpg'
