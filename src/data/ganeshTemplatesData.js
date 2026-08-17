// Ganesh Chaturthi invitation templates — a separate category from the
// wedding TEMPLATES (templatesData.js) and Guruji Satsang SATSANG_TEMPLATES
// (satsangTemplatesData.js), since a Ganesh Chaturthi invite has its own
// shape of content (a Sthapana/installation date, a puja muhurat window, a
// multi-day festival, and a Visarjan/immersion date) rather than being a
// reskinned Satsang invite.
//
// Each template's `slug` drives its live URL
// (/templates/ganesh-chaturthi/:slug — see App.jsx) and its dedicated Google
// Sheet tab (RSVPs are stored under `ganesh-${slug}`, the same
// appendRow-per-tab mechanism the wedding and Satsang invites already use —
// see google-apps-script/Code.gs, which creates sheet tabs dynamically by
// slug with no hardcoded prefix list).
//
// `palette`/`fonts`/`motif`/`motifAccent` follow the same contract as the
// wedding/Satsang templates (see templatesData.js's comment block) so the
// same CulturalMotif/TemplateFrame system re-skins for free — see
// CulturalMotif.jsx and TemplateFrame.jsx for the 'marigold-garland' and
// 'modak-mandala' motifs added for this category.
//
// `layout` (optional) names a bespoke experience component from
// src/components/ganesh/layoutRegistry.js. Templates without a `layout`
// render through the shared LegacyGaneshExperience.
export const GANESH_TEMPLATES = [
  {
    slug: 'marigold-mandap',
    name: 'Marigold Mandap',
    layout: 'marigold-mandap',
    tagline: 'Vibrant marigold & gold, a curtain-reveal mandap',
    description:
      'A vivid marigold-and-gold mandap unfolds as five sequential chapters — sacred red curtains part on tap to reveal Bappa, framed by a marigold garland border, with the full puja muhurat, interactive RSVP and a blessing wall.',
    // Shorter, SEO-specific override for the meta description tag — see
    // ganeshSeo() in routesSeo.js. The `description` above is on-page
    // marketing copy and runs well past a meta description's ~155-char budget.
    metaDescription:
      'Vivid marigold & gold Ganesh Chaturthi invitation with a tap-to-reveal curtain, full puja muhurat, interactive RSVP and a blessing wall.',
    tags: ['Marigold', 'Curtain Reveal', 'Storybook'],
    motif: 'marigold-garland',
    motifAccent: '#c2410c',
    fonts: { serif: '"Yatra One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Deshmukh Family',
      hostLine:
        'With joyful hearts, our family invites you to welcome Ganpati Bappa home for ten days of blessings, devotion and celebration.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '6:00 AM – 8:30 AM (Pran Pratishtha Muhurat)',
      morningAarti: '8:00 AM',
      eveningAarti: '7:00 PM',
      venue: 'Deshmukh Residence, Prabhadevi, Mumbai',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '4:00 PM',
      mahaPrasadTime: '6:30 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Daily Aarti and Modak Prasad follow every evening, with all devotees warmly invited to join.',
    },
    // Reuses the same free-licensed festival photography as
    // royal-durbar-darshan/divine-threshold (see the Wikimedia Commons
    // credits at the bottom of this file) so every template's demo page —
    // not just the two photo-led flagships — shows guests a real "Sacred
    // Moments" gallery, matching what a buyer's own uploaded photos
    // (buildGaneshExperienceTemplate.js) replace it with once purchased.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at the doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, every evening',
        when: 'Daily · 7:00 PM',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
    ],
    palette: {
      ivory: '#fffaf3',
      linen: '#fdf0da',
      champagne: '#fbdc9e',
      champagneDeep: '#f0b355',
      blush: '#fbe0c8',
      blushDeep: '#f0a978',
      rose: '#c2410c',
      gold: '#d9932e',
      goldSoft: '#eec26a',
      ink: '#4a260f',
      inkSoft: '#8a5a34',
    },
  },
  {
    slug: 'golden-trunk-blessing',
    name: 'Golden Trunk Blessing',
    layout: 'golden-trunk-blessing',
    tagline: 'Deep vermilion & gold, scratch-to-reveal',
    description:
      'Bappa’s photo takes center stage inside a golden symmetric panel, framed by a modak-and-mandala border. A scratch-to-reveal golden modak card uncovers a personal blessing, alongside the full puja muhurat, RSVP and blessing wall.',
    metaDescription:
      'Golden Ganesh Chaturthi invitation with a modak-and-mandala border and a scratch-to-reveal blessing card, plus full puja muhurat, RSVP and blessing wall.',
    tags: ['Vermilion', 'Scratch Reveal', 'Symmetric Panel'],
    motif: 'modak-mandala',
    motifAccent: '#9a1f2b',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Kulkarni Family',
      hostLine:
        'With devotion and delight, our family invites you to seek Bappa’s blessings with us this Ganesh Chaturthi.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '7:00 AM – 9:00 AM (Pran Pratishtha Muhurat)',
      morningAarti: '7:30 AM',
      eveningAarti: '7:30 PM',
      venue: 'Kulkarni Niwas, Shivaji Nagar, Pune',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '4:30 PM',
      mahaPrasadTime: '7:00 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Modak Prasad is served after every evening Aarti, and all devotees are lovingly requested to partake.',
    },
    // See marigold-mandap's own `moments` comment above — same shared,
    // free-licensed photo set.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at the doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, every evening',
        when: 'Daily · 7:00 PM',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
    ],
    palette: {
      ivory: '#fdf8f3',
      linen: '#f7e6d6',
      champagne: '#efcda3',
      champagneDeep: '#dda164',
      blush: '#f2d5cb',
      blushDeep: '#dd9f8f',
      rose: '#9a1f2b',
      gold: '#c28a3a',
      goldSoft: '#e0bd80',
      ink: '#3a1410',
      inkSoft: '#7a4a3a',
    },
  },
  {
    slug: 'vermilion-lotus-aarti',
    name: 'Vermilion Lotus Aarti',
    tagline: 'Radiant vermilion-red & gold, lotus-lit aarti',
    description:
      'A radiant vermilion-red canvas glowing with gold lotus accents — a warm, aarti-lit welcome to Bappa’s ten-day stay, with a tap-to-reveal curtain, full puja muhurat, RSVP and a blessing wall.',
    metaDescription:
      'Radiant vermilion & gold Ganesh Chaturthi invitation for Bappa’s ten-day stay, with a tap-to-reveal curtain, puja muhurat, RSVP and blessing wall.',
    tags: ['Vermilion', 'Lotus', 'Radiant Design'],
    motif: 'marigold-garland',
    motifAccent: '#b3122a',
    fonts: { serif: '"Rozha One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Joshi Family',
      hostLine:
        'With hearts full of devotion, our family invites you to celebrate Ganesh Chaturthi and welcome Bappa’s blessings into our home.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '6:30 AM – 9:00 AM (Pran Pratishtha Muhurat)',
      morningAarti: '8:00 AM',
      eveningAarti: '7:00 PM',
      venue: 'Joshi Wada, Sadashiv Peth, Pune',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '4:00 PM',
      mahaPrasadTime: '6:30 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Aarti and Modak Prasad follow every evening, with all devotees warmly welcomed to join us through the ten days.',
    },
    // See marigold-mandap's own `moments` comment above — same shared,
    // free-licensed photo set.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at the doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, every evening',
        when: 'Daily · 7:00 PM',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
    ],
    palette: {
      ivory: '#fdf7f2',
      linen: '#f9e3da',
      champagne: '#f2c9a8',
      champagneDeep: '#e2996a',
      blush: '#f3d2c4',
      blushDeep: '#e29f8a',
      rose: '#b3122a',
      gold: '#cf9a3a',
      goldSoft: '#e6c079',
      ink: '#3a1210',
      inkSoft: '#7a4438',
    },
  },
  {
    slug: 'emerald-doob-grace',
    name: 'Emerald Doob Grace',
    tagline: 'Emerald green & gold, sacred doob-grass calm',
    description:
      'A serene emerald-green canvas edged in gold, honoring the sacred doob grass offered to Bappa — a peaceful, grounded welcome with a tap-to-reveal curtain, full puja muhurat, RSVP and a blessing wall.',
    metaDescription:
      'Serene emerald-green Ganesh Chaturthi invitation honoring sacred doob grass, with a tap-to-reveal curtain, puja muhurat, RSVP and a blessing wall.',
    tags: ['Emerald', 'Doob Grass', 'Serene Design'],
    motif: 'modak-mandala',
    motifAccent: '#2f6d3f',
    fonts: { serif: '"Marcellus", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Rao Family',
      hostLine:
        'With quiet gratitude, our family invites you to join us in welcoming Ganpati Bappa home this Chaturthi.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '6:00 AM – 8:00 AM (Pran Pratishtha Muhurat)',
      morningAarti: '7:30 AM',
      eveningAarti: '7:00 PM',
      venue: 'Rao Bhavan, Malleshwaram, Bengaluru',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '3:30 PM',
      mahaPrasadTime: '6:00 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Modak Prasad is served after every evening Aarti, and all devotees are lovingly requested to partake.',
    },
    // See marigold-mandap's own `moments` comment above — same shared,
    // free-licensed photo set.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at the doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, every evening',
        when: 'Daily · 7:00 PM',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
    ],
    palette: {
      ivory: '#f8fbf6',
      linen: '#eaf3e6',
      champagne: '#d6ead0',
      champagneDeep: '#a9d29d',
      blush: '#e2eedb',
      blushDeep: '#b0d3a4',
      rose: '#2f6d3f',
      gold: '#b99a4a',
      goldSoft: '#dcc98a',
      ink: '#1e2f1c',
      inkSoft: '#526b4d',
    },
  },
  {
    slug: 'royal-durbar-darshan',
    name: 'Royal Durbar Darshan',
    layout: 'royal-durbar-darshan',
    tagline: 'Regal maroon & gold, a full-bleed durbar',
    description:
      'A cinematic, photo-led welcome fit for a king — Bappa’s portrait rises inside a crowned jharokha niche over a full-bleed festival photograph, followed by a scrollable gallery of real festival moments and an unfurling parchment scroll of the puja muhurat, with interactive RSVP and a blessing wall.',
    metaDescription:
      'Cinematic, photo-led Ganesh Chaturthi invitation with a festival photo gallery, an unfurling puja-muhurat scroll, interactive RSVP and a blessing wall.',
    tags: ['Royal', 'Photo Gallery', 'Scroll Reveal'],
    motif: 'royal-durbar',
    motifAccent: '#7a1230',
    fonts: { serif: '"Cinzel Decorative", "Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Chavan Family',
      hostLine:
        'With regal joy, our family throws open the durbar doors to welcome Ganpati Bappa and all who wish to seek his blessings.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '6:00 AM – 8:30 AM (Pran Pratishtha Muhurat)',
      morningAarti: '8:00 AM',
      eveningAarti: '7:00 PM',
      venue: 'Chavan Wada, Dadar, Mumbai',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '4:00 PM',
      mahaPrasadTime: '6:30 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Daily Aarti and Modak Prasad follow every evening, with the durbar doors open to all devotees throughout the ten days.',
    },
    // A real festival photograph for the hero backdrop — drop a file at this
    // path and it takes over automatically. Falls back to a rich gradient
    // wash (see DurbarPhotoHero.jsx) if it isn't present yet, so the
    // template still looks intentional out of the box.
    heroPhoto: {
      src: '/images/ganesh/royal-durbar/hero.jpg',
      alt: 'A grand Ganpati Bappa mandap decorated for Ganesh Chaturthi',
    },
    // Real photography for the scrollable "Sacred Moments" gallery (see
    // GaneshMomentsGallery.jsx) — this is what makes this template
    // genuinely photo-led rather than a re-skinned icon-based one. Each
    // entry falls back to an on-palette gradient card with a themed icon
    // if its file isn't present yet.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at the doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, every evening',
        when: 'Daily · 7:00 PM',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
      {
        src: '/images/ganesh/royal-durbar/dhol.jpg',
        alt: 'Dhol-tasha drummers celebrating',
        caption: 'Dhol-Tasha Welcome',
        sub: 'Drums that announce Bappa’s arrival',
        when: 'September 14 · 6:00 AM',
      },
    ],
    palette: {
      ivory: '#fdf9f0',
      linen: '#f2e6c9',
      champagne: '#e6c883',
      champagneDeep: '#cf9f42',
      blush: '#e3d6a8',
      blushDeep: '#c2a45c',
      rose: '#7a1230',
      gold: '#b8892c',
      goldSoft: '#dcb662',
      ink: '#241009',
      inkSoft: '#5c3a24',
    },
  },
  {
    slug: 'divine-threshold',
    name: 'Divine Threshold',
    layout: 'divine-threshold',
    tagline: 'Temple doors part on tap over a full-bleed',
    description:
      'A show-stopping, photo-driven welcome — a full-bleed festival photograph stands behind two ornate temple doors that swing open on tap to reveal Bappa, in rich marigold orange, auspicious red and sacred gold. A day-by-day festival timeline lays out Sthapana, daily Aarti and Visarjan & Maha Prasad in one glance, alongside a swipeable photo gallery, interactive RSVP and a blessing wall.',
    metaDescription:
      'Photo-driven Ganesh Chaturthi invitation with a tap-to-open temple-door reveal, a day-by-day festival timeline, photo gallery, interactive RSVP and a blessing wall.',
    tags: ['Marigold', 'Photo Doors', 'Festival Timeline'],
    motif: 'marigold-garland',
    motifAccent: '#e8720c',
    fonts: { serif: '"Cinzel Decorative", "Yatra One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Ganpati Bappa Morya' },
    host: {
      familyName: 'The Patil Family',
      hostLine:
        'With overflowing joy, our family throws open our doors to welcome Ganpati Bappa and everyone who wishes to seek his blessings this Chaturthi.',
    },
    event: {
      sthapanaDate: 'September 14, 2026',
      sthapanaMuhurat: '6:00 AM – 8:30 AM (Pran Pratishtha Muhurat)',
      morningAarti: '7:30 AM',
      eveningAarti: '7:30 PM',
      venue: 'Patil Wada, Vile Parle, Mumbai',
      visarjanDate: 'September 23, 2026',
      visarjanYatraTime: '4:00 PM',
      mahaPrasadTime: '6:30 PM (following the Visarjan Yatra)',
    },
    puja: {
      note:
        'Daily Aarti and Modak Prasad follow every morning and evening, with our doors open to every devotee across the ten days.',
    },
    // A real festival photograph for the temple-door hero backdrop — same
    // drop-in convention as royal-durbar-darshan's heroPhoto (see
    // TempleDoorReveal.jsx, which falls back to a rich gradient wash if this
    // file isn't present yet).
    heroPhoto: {
      src: '/images/ganesh/divine-threshold/hero.jpg',
      alt: 'A beautifully lit Ganpati Bappa mandap decorated for Ganesh Chaturthi',
    },
    // Reuses the same generic {src, alt, caption, sub, when} shape
    // GaneshMomentsGallery.jsx already renders for royal-durbar-darshan —
    // this is also exactly the shape buildGaneshExperienceTemplate.js maps
    // a buyer's own uploaded photos into for a purchased invite.
    moments: [
      {
        src: '/images/ganesh/royal-durbar/marigold.jpg',
        alt: 'Strings of fresh marigold flowers',
        caption: 'The Marigold Threshold',
        sub: 'Fresh garlands strung at every doorway',
        when: 'September 13 · Evening',
      },
      {
        src: '/images/ganesh/royal-durbar/aarti.jpg',
        alt: 'Lit oil lamps at evening aarti',
        caption: 'Aarti’s Golden Glow',
        sub: 'Diyas lit at dusk, morning and evening',
        when: 'Daily',
      },
      {
        src: '/images/ganesh/royal-durbar/modak.jpg',
        alt: 'Modak sweets offered as prasad',
        caption: 'Modak Prasad',
        sub: 'Bappa’s favourite sweet, shared with all',
        when: 'Daily · After Aarti',
      },
    ],
    palette: {
      ivory: '#fffaf3',
      linen: '#fdedd6',
      champagne: '#fad39a',
      champagneDeep: '#e8720c',
      blush: '#fcdccb',
      blushDeep: '#e89a6e',
      rose: '#c1272d',
      gold: '#d4a017',
      goldSoft: '#eec767',
      ink: '#3a1408',
      inkSoft: '#7a4a2c',
    },
  },
]

export function getGaneshTemplateBySlug(slug) {
  return GANESH_TEMPLATES.find((t) => t.slug === slug)
}

// Bappa's idol/photo is the same across every Ganesh Chaturthi template
// (one Ganpati murti photo, not one per design), so it's a single shared
// path rather than a per-template field — same pattern as
// GURUJI_PHOTO_SRC in satsangTemplatesData.js. Drop the actual photo at
// public/images/ganesh-idol.jpg and it takes over automatically — see
// GaneshIdolPhoto.jsx, which falls back to a devotional placeholder glyph
// if that file isn't present yet.
//
// The current public/images/ganesh-idol.jpg is a crop of "Ganesh Chaturthi
// Festival (192)" by AmanAgrahari01, CC BY-SA 4.0, via Wikimedia Commons:
// https://commons.wikimedia.org/wiki/File:Ganesh_Chaturthi_Festival_(192).jpg
export const GANESH_IDOL_PHOTO_SRC = '/images/ganesh-idol.jpg'

// Real photography originally sourced for Royal Durbar Darshan's heroPhoto/
// moments (see DurbarPhotoHero.jsx / GaneshMomentsGallery.jsx) — marigold/
// aarti/modak are now reused as the shared `moments` gallery on every other
// template above too, so each one's demo page shows a real "Sacred Moments"
// section rather than none at all. All freely-licensed via Wikimedia Commons:
//
// - hero.jpg: "Ganesh Chaturthi Festival (247)" by AmanAgrahari01, CC BY-SA 4.0
//   https://commons.wikimedia.org/wiki/File:Ganesh_Chaturthi_Festival_(247).jpg
// - marigold.jpg: "Marigold Flowers as garland in India" by SnapMeUp, CC BY 4.0
//   https://commons.wikimedia.org/wiki/File:Marigold_Flowers_as_garland_in_India.jpg
// - aarti.jpg: "Lamps, Diyas for aarti, India" by Scott Dexter, CC BY-SA 2.0
//   https://commons.wikimedia.org/wiki/File:Lamps,_Diyas_for_aarti,_India.jpg
// - modak.jpg: "Modak mithai" by Marajozkee, CC BY-SA 4.0
//   https://commons.wikimedia.org/wiki/File:Modak_mithai.jpg
// - dhol.jpg: "Dhol Tasha" by Ramnath Bhat, CC BY 2.0
//   https://commons.wikimedia.org/wiki/File:Dhol_Tasha_(7943196228).jpg
