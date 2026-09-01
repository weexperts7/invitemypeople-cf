import { Flower, Gem, Heart, Landmark, Moon, Music, PartyPopper, Sparkle } from 'lucide-react'

// Moved to its own file so it can be imported server-side without pulling
// in the lucide-react icon imports above — see pricing.js's own comment.
export { PRICING } from './pricing.js'

// Every color key mirrors a CSS custom property from src/index.css's
// @theme block (ivory -> --color-ivory, champagneDeep -> --color-champagne-deep,
// etc). InvitationExperience overrides those variables on a wrapper element,
// which re-themes every existing component for free since all of them are
// built from Tailwind utilities that resolve to those same variables.
//
// Beyond palette, each template can also carry:
// - fonts: { serif } — overrides --font-serif (heading typeface) for the template.
//   Omitted templates fall back to the app's default Cormorant Garamond.
// - motif: id consumed by CulturalMotif.jsx (tiled background), and by
//   TemplateFrame.jsx's FrameBanner/FrameCorners (header ornament + card
//   border glyph) and TemplateShowcase.jsx (landing page live preview) —
//   one id drives every structural/thematic element unique to the template.
// - motifAccent: an optional secondary hex hint (sapphire, peacock teal,
//   banana-leaf green, etc.) used sparingly inside that motif's linework.
// - greeting: { symbol, line } — the invocation shown at the top of
//   WelcomeSplash. symbol is optional (Western-style templates omit it).
export const TEMPLATES = [
  {
    id: 'mahogany-seal',
    name: 'Mahogany Seal',
    category: 'Luxury',
    weddingType: 'Hindu',
    tags: ['Luxury', 'Cinematic', 'Caricature Video', 'Wax Seal'],
    description:
      'A cinematic dark-mahogany intro — a rope-pull envelope video behind a 3D red wax seal — opens into a gold-on-cream dashboard with a couple hero, live countdown, itinerary, scratch-to-reveal date, gallery and RSVP, finished off with your own hand-animated caricature video.',
    isFlagship: true,
    // Bespoke experience component, same mechanism as royal-plum-curtain
    // just above — see components/wedding/layoutRegistry.js and
    // components/wedding/mahogany-seal/MahoganySealAdapter.jsx. `motif`/
    // `motifAccent` deliberately omitted for the same reason royal-plum-curtain's
    // own comment gives: the bespoke layout owns its entire visual
    // language, and CulturalMotif/FrameCorners/MotifBadge all no-op safely
    // on an unset motif (used only by TemplateShowcase's catalog thumbnail
    // below).
    layout: 'mahogany-seal',
    // This template's caricature intro video is bespoke, hand-produced
    // work, not something the self-service builder (`/create`) can
    // generate, so there's no instant Razorpay checkout to send anyone to.
    // `hasOwnCreateCta` tells InvitationExperience.jsx to skip its own
    // generic "Create Your Own — ₹X" bar (which would otherwise send
    // buyers to the wrong, incompatible checkout) since MahoganySealTemplate
    // already renders its own — a WhatsApp chat, opened straight away for
    // an instant lead, not a details form (see MahoganySealTemplate.tsx's
    // own comment). `customizeWhatsAppMessage` is the matching override for
    // TemplateCard.jsx's "Customize" button on the listing grid — same
    // WhatsApp-first behavior there too, rather than the site-wide
    // `buildCreateLink()` every other template's Customize button uses.
    // The detailed form our team sends back after that first reply
    // (MahoganySealCreatePage.tsx, at `/mahogany-seal/create`) is never
    // linked from here automatically.
    hasOwnCreateCta: true,
    customizeWhatsAppMessage: "Hi! I'd love to create my own Mahogany Seal wedding invitation ✨",
    // Its own fixed price, not the global launch-sale/PRICING.price every
    // self-serve-checkout template shows (see TemplateCard.jsx's own
    // comment on `originalPrice`/`salePrice`) — this template's bespoke
    // caricature video costs more to produce, and its price isn't tied to
    // the site-wide sale window since checkout never happens through
    // Razorpay at all.
    originalPrice: 9000,
    salePrice: 3900,
    fonts: { serif: '"Playfair Display", "Cormorant Garamond", serif', script: '"Great Vibes", cursive' },
    greeting: { line: 'Together With Joy' },
    couple: { names: 'Shaya & Rehaan' },
    // With no `motif` to draw from, TemplateShowcase's usual palette-and-
    // typography card would tell a browser nothing about the one thing
    // that actually sets this template apart — a real, animated 3D
    // caricature of the couple, not a flat illustration like every other
    // template. `cardImage` opts the catalog thumbnail into showing that
    // caricature photo directly instead (see TemplateShowcase.jsx's own
    // comment) — the same still frame CoupleHero.tsx shows live, cropped
    // from the intro video (see mockData.ts's own comment on it).
    // `previewBadge` stamps an extra "3D Caricature Video" chip onto the
    // card (see TemplateCard.jsx) so that's obvious even at a glance,
    // before a browser has scrolled the card into clear view.
    cardImage: {
      src: '/images/mahogany-seal/couple-portrait.jpg',
      alt: 'Illustrated 3D Pixar-style caricature of the couple, from the animated intro video',
    },
    previewBadge: '3D Caricature Video',
    // Still used as this card's text colors (couple-name script, template
    // name) over the photo above, and as the fallback for any other UI
    // that reads a template's palette generically — kept in sync with
    // MahoganySealTemplate.css's own --mst-* custom properties (dark
    // mahogany through to warm gold).
    palette: {
      ivory: '#1a100d',
      linen: '#150b09',
      champagne: '#2c1d18',
      champagneDeep: '#8a6a1f',
      blush: '#3d2820',
      blushDeep: '#d4af37',
      rose: '#f2d675',
      gold: '#d4af37',
      goldSoft: '#f2d675',
      ink: '#fbf3e3',
      inkSoft: '#c9b38a',
    },
  },
  {
    id: 'rajasthani-royal',
    name: 'Rajasthani Royal',
    category: 'Royal',
    weddingType: 'Hindu',
    tags: ['Royal', 'Rajasthani', 'Heritage'],
    description:
      'Palace jharokha arches, a royal crest medallion, and heavy antique gold over deep crimson with a hint of sapphire — a Rajasthani royal wedding, reimagined.',
    isFlagship: true,
    motif: 'jharokha',
    motifAccent: '#3f5c76',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: {
      symbol: 'ॐ',
      line: 'Vakratunda Maha-Kaaya Surya-Kotti Samaprabha, Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvadaa',
    },
    couple: {
      names: 'Aarav & Diya',
      invitationLine:
        'Together with their families, joyfully invite you to celebrate the beginning of their forever.',
      people: [
        { name: 'Aarav Malhotra', parents: 'Son of Mr. Rajesh & Mrs. Kavita Malhotra' },
        { name: 'Diya Kapoor', parents: 'Daughter of Mr. Anil & Mrs. Sunita Kapoor' },
      ],
    },
    ceremoniesHeading: 'Our Celebration',
    weddingDate: '2026-12-12T09:00:00',
    ceremonies: [
      { icon: Flower, title: 'Haldi Ceremony', date: 'December 10, 2026', time: '10:00 AM', venue: 'Rambagh Palace Lawns, Jaipur' },
      { icon: Music, title: 'Sangeet Night', date: 'December 11, 2026', time: '7:00 PM', venue: 'The Leela Palace, Jaipur' },
      { icon: Sparkle, title: 'Mehndi Ceremony', date: 'December 11, 2026', time: '4:00 PM', venue: 'Rambagh Palace Lawns, Jaipur' },
      { icon: Heart, title: 'Pheras — Wedding Ceremony', date: 'December 12, 2026', time: '9:00 AM', venue: 'Rambagh Palace Gardens, Jaipur' },
      { icon: PartyPopper, title: 'Reception', date: 'December 12, 2026', time: '7:30 PM', venue: 'Rambagh Palace Grand Lawn, Jaipur' },
    ],
    palette: {
      ivory: '#fdfaf4',
      linen: '#f7ede0',
      champagne: '#edd9ab',
      champagneDeep: '#cfa054',
      blush: '#f0dcdb',
      blushDeep: '#d6a29c',
      rose: '#6e2233',
      gold: '#a97c2f',
      goldSoft: '#c9a860',
      ink: '#341f1b',
      inkSoft: '#755049',
    },
  },
  {
    id: 'royal-festive-vibrant',
    name: 'Royal Festive Vibrant',
    category: 'Festive',
    weddingType: 'Hindu',
    tags: ['Festive', 'Royal', 'Vibrant', 'Rani Pink'],
    description:
      'A jewel-box mandala medallion in deep crimson, marigold yellow, rani pink and emerald green over shimmering gold — for a couple who wants their invitation to feel like the celebration already started.',
    isFlagship: true,
    motif: 'rani-mandala',
    motifAccent: '#0f6b4a',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Shubh Vivah' },
    couple: {
      names: 'Veer & Ananya',
      invitationLine:
        'Together with their families, joyfully invite you to a celebration bursting with colour, music and blessings.',
      people: [
        { name: 'Veer Bhatia', parents: 'Son of Mr. Sanjay & Mrs. Ritu Bhatia' },
        { name: 'Ananya Rathore', parents: 'Daughter of Mr. Devendra & Mrs. Poonam Rathore' },
      ],
    },
    ceremoniesHeading: 'Our Festivities',
    weddingDate: '2026-12-14T09:00:00',
    ceremonies: [
      { icon: Flower, title: 'Haldi Ceremony', date: 'December 12, 2026', time: '10:00 AM', venue: 'Bhatia Residence Lawns, Udaipur' },
      { icon: Music, title: 'Sangeet Night', date: 'December 13, 2026', time: '7:30 PM', venue: 'The Oberoi Udaivilas, Udaipur' },
      { icon: Heart, title: 'Wedding Ceremony — Pheras', date: 'December 14, 2026', time: '9:00 AM', venue: 'City Palace Gardens, Udaipur' },
      { icon: PartyPopper, title: 'Reception', date: 'December 14, 2026', time: '7:30 PM', venue: 'The Oberoi Udaivilas, Udaipur' },
    ],
    palette: {
      ivory: '#fffaf2',
      linen: '#fff1da',
      champagne: '#ffd875',
      champagneDeep: '#f6a81c',
      blush: '#ffd6ea',
      blushDeep: '#ff2f92',
      rose: '#b3092e',
      gold: '#caa008',
      goldSoft: '#ffcf3f',
      ink: '#4a0b18',
      inkSoft: '#8a3b4a',
    },
  },
  {
    id: 'gujarati-traditional',
    name: 'Gujarati Traditional',
    category: 'Traditional',
    weddingType: 'Hindu',
    tags: ['Traditional', 'Gujarati', 'Festive'],
    description:
      'Fresh pastel ivory with a strung marigold garland header, bandhani-dot borders, and a leheriya-blue accent — the joyful charm of a Gujarati wedding card.',
    motif: 'swastik-mandala',
    motifAccent: '#2f8fae',
    fonts: { serif: '"Yatra One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Shubh Labh' },
    couple: {
      names: 'Rohan & Priya',
      invitationLine:
        'Together with their families, joyfully invite you to their Shubh Vivah.',
      people: [
        { name: 'Rohan Shah', parents: 'Son of Mr. Kiran & Mrs. Nita Shah' },
        { name: 'Priya Patel', parents: 'Daughter of Mr. Deepak & Mrs. Falguni Patel' },
      ],
    },
    palette: {
      ivory: '#fffaf6',
      linen: '#fdf2e9',
      champagne: '#fbe5d2',
      champagneDeep: '#f3c79a',
      blush: '#fde3ec',
      blushDeep: '#f5b8cd',
      rose: '#e0587a',
      gold: '#e0a339',
      goldSoft: '#f0c877',
      ink: '#4a3325',
      inkSoft: '#8a6a52',
    },
  },
  {
    id: 'vrindavan-radha-krishna',
    name: 'Vrindavan Divine',
    category: 'Divine',
    weddingType: 'Hindu',
    tags: ['Divine', 'Radha-Krishna', 'Spiritual'],
    description:
      'A lotus halo, delicate peacock-feather line-art, and soft pastel blues, creams and gold — the serene devotion of Vrindavan.',
    motif: 'lotus-peacock',
    motifAccent: '#1f8a86',
    greeting: { symbol: 'ॐ', line: 'Radhe Radhe' },
    couple: {
      names: 'Kabir & Radhika',
      invitationLine:
        "With Radha-Krishna's blessings, their families joyfully invite you to celebrate their union.",
      people: [
        { name: 'Kabir Sharma', parents: 'Son of Mr. Mohan & Mrs. Geeta Sharma' },
        { name: 'Radhika Mehra', parents: 'Daughter of Mr. Vinod & Mrs. Sunita Mehra' },
      ],
    },
    palette: {
      ivory: '#fdfcf8',
      linen: '#f3f6f7',
      champagne: '#eaf1f0',
      champagneDeep: '#cfe3df',
      blush: '#eef1fb',
      blushDeep: '#c9d6f2',
      rose: '#5b7fb5',
      gold: '#c9a24b',
      goldSoft: '#e6cf94',
      ink: '#3d4550',
      inkSoft: '#75808f',
    },
  },
  {
    id: 'western-elegant-minimalist',
    name: 'Western Elegant Minimalist',
    category: 'Minimalist',
    weddingType: 'Christian',
    isFlagship: true,
    tags: ['Minimalist', 'Western', 'Modern Romance', 'Christian'],
    description:
      'Clean typography, a restrained floral line-art sprig, and soft champagne-blush tones over generous whitespace — a church wedding and reception, reimagined with elegant restraint.',
    motif: 'floral-line-art',
    fonts: { serif: '"Marcellus", "Cormorant Garamond", serif' },
    greeting: { symbol: null, line: 'Together With Love' },
    couple: {
      names: 'James & Grace',
      invitationLine:
        'Together with their families, request the pleasure of your company as they exchange vows.',
      people: [
        { name: 'James Anderson', parents: 'Son of Mr. Richard & Mrs. Susan Anderson' },
        { name: 'Grace Bennett', parents: 'Daughter of Mr. Michael & Mrs. Patricia Bennett' },
      ],
    },
    ceremoniesHeading: 'Our Wedding Weekend',
    weddingDate: '2026-11-21T16:00:00',
    ceremonies: [
      { icon: Music, title: 'Rehearsal Dinner', date: 'November 20, 2026', time: '7:00 PM', venue: 'Anderson Residence, Goa' },
      { icon: Heart, title: 'Wedding Ceremony', date: 'November 21, 2026', time: '4:00 PM', venue: "St. Alex Church, Goa" },
      { icon: PartyPopper, title: 'Reception', date: 'November 21, 2026', time: '8:00 PM', venue: 'Taj Exotica, Goa' },
    ],
    palette: {
      ivory: '#fdfdfb',
      linen: '#f8f7f4',
      champagne: '#f1ece2',
      champagneDeep: '#e3d7c0',
      blush: '#f4efe8',
      blushDeep: '#e6d8c8',
      rose: '#b89574',
      gold: '#ad9257',
      goldSoft: '#e8dcc3',
      ink: '#3d3733',
      inkSoft: '#85796e',
    },
  },
  {
    id: 'south-indian-temple-gold',
    name: 'South Indian Temple Gold',
    category: 'Traditional',
    weddingType: 'South Indian',
    isFlagship: true,
    tags: ['Traditional', 'South Indian', 'Temple Gold'],
    description:
      'A temple-gopuram arch header, rich matte gold double-line borders, and jasmine and lotus motifs over warm classic ivory — the timeless grammar of a South Indian Kalyanam.',
    motif: 'temple-gold',
    motifAccent: '#2f6b3f',
    fonts: { serif: '"Rozha One", "Cormorant Garamond", serif' },
    greeting: { symbol: 'ॐ', line: 'Shubhamastu' },
    heroPhoto: { src: '/images/couples/south-indian-2.jpg', alt: 'Karthik & Meera' },
    couple: {
      names: 'Karthik & Meera',
      invitationLine:
        'Together with their families, cordially invite you to their Kalyanam, blessed by Lord Venkateswara.',
      people: [
        { name: 'Karthik Subramaniam', parents: 'Son of Mr. Venkatesh & Mrs. Lakshmi Subramaniam' },
        { name: 'Meera Krishnan', parents: 'Daughter of Mr. Ramesh & Mrs. Padma Krishnan' },
      ],
    },
    ceremoniesHeading: 'Our Kalyanam',
    weddingDate: '2026-12-05T08:00:00',
    ceremonies: [
      { icon: Gem, title: 'Nichayathartham — Engagement', date: 'December 3, 2026', time: '6:00 PM', venue: 'Krishnan Residence, Chennai' },
      { icon: Flower, title: 'Mangala Snanam', date: 'December 4, 2026', time: '7:00 AM', venue: 'Krishnan Residence, Chennai' },
      { icon: Heart, title: 'Kalyanam — Muhurtham', date: 'December 5, 2026', time: '8:00 AM', venue: 'Sri Kapaleeshwarar Kalyana Mandapam, Chennai' },
      { icon: PartyPopper, title: 'Reception', date: 'December 5, 2026', time: '7:00 PM', venue: 'ITC Grand Chola, Chennai' },
    ],
    palette: {
      ivory: '#fffaf0',
      linen: '#fdf3df',
      champagne: '#f7e4b8',
      champagneDeep: '#eccb84',
      blush: '#fbead0',
      blushDeep: '#eec98f',
      rose: '#a83232',
      gold: '#b3862c',
      goldSoft: '#dcb35c',
      ink: '#3f2c14',
      inkSoft: '#7d6a48',
    },
  },
  {
    id: 'punjabi-phulkari',
    name: 'Punjabi Phulkari',
    category: 'Festive',
    weddingType: 'Sikh',
    isFlagship: true,
    tags: ['Festive', 'Punjabi', 'Phulkari', 'Sikh', 'Royal Maroon'],
    description:
      'Hand-embroidered Bagh Phulkari geometry in rich crimson and deep maroon, worked over with shimmering antique gold filigree and royal framing — the opulent spirit of a Punjabi Sikh wedding and Anand Karaj.',
    motif: 'phulkari',
    motifAccent: '#e8961f',
    greeting: { symbol: 'ੴ', line: 'Rab Rakha' },
    couple: {
      names: 'Gurpreet & Simran',
      invitationLine:
        'Together with their families, joyfully invite you to their Anand Karaj.',
      people: [
        { name: 'Gurpreet Singh', parents: 'Son of S. Manjeet & Mrs. Harpreet Singh' },
        { name: 'Simran Kaur', parents: 'Daughter of S. Baljeet & Mrs. Amarjeet Kaur' },
      ],
    },
    ceremoniesHeading: 'Our Anand Karaj',
    weddingDate: '2026-12-08T10:00:00',
    ceremonies: [
      { icon: Music, title: 'Kirtan & Chunni Ceremony', date: 'December 6, 2026', time: '5:00 PM', venue: 'Singh Residence, Amritsar' },
      { icon: Sparkle, title: 'Mehndi', date: 'December 7, 2026', time: '4:00 PM', venue: 'Singh Residence, Amritsar' },
      { icon: Landmark, title: 'Anand Karaj', date: 'December 8, 2026', time: '10:00 AM', venue: 'Guru Nanak Darbar Gurdwara, Amritsar' },
      { icon: PartyPopper, title: 'Reception', date: 'December 8, 2026', time: '7:00 PM', venue: 'Taj Swarna, Amritsar' },
    ],
    palette: {
      ivory: '#1c0509',
      linen: '#160406',
      champagne: '#2c0a10',
      champagneDeep: '#5c1119',
      blush: '#22060d',
      blushDeep: '#7a1a28',
      rose: '#dba53a',
      gold: '#c9962a',
      goldSoft: '#f2d27a',
      ink: '#fbf1da',
      inkSoft: '#ecd7ae',
    },
  },
  {
    id: 'royal-mughal',
    name: 'Royal Mughal',
    category: 'Royal',
    weddingType: 'Muslim',
    isFlagship: true,
    tags: ['Royal', 'Mughal', 'Jaali', 'Muslim'],
    description:
      'Intricate jaali lattice work, arched domes, and opulent gold over ivory — the grandeur of Mughal-era architecture for a Nikah and Walima.',
    motif: 'mughal-jaali',
    motifAccent: '#3f7a5e',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: null, line: 'Mubarak Ho' },
    couple: {
      names: 'Imran & Zara',
      invitationLine:
        'Together with their families, request the honour of your presence to celebrate their Nikah.',
      people: [
        { name: 'Imran Ahmed Khan', parents: 'Son of Mr. Farooq & Mrs. Nasreen Khan' },
        { name: 'Zara Sheikh', parents: 'Daughter of Mr. Kamal & Mrs. Yasmin Sheikh' },
      ],
    },
    ceremoniesHeading: 'Nikah & Walima',
    weddingDate: '2026-12-19T19:00:00',
    ceremonies: [
      { icon: Sparkle, title: 'Mehendi Night', date: 'December 17, 2026', time: '7:00 PM', venue: 'Khan Residence, Hyderabad' },
      { icon: Moon, title: 'Nikah Ceremony', date: 'December 19, 2026', time: '7:00 PM', venue: 'Falaknuma Palace, Hyderabad' },
      { icon: PartyPopper, title: 'Walima', date: 'December 20, 2026', time: '8:00 PM', venue: 'Chowmahalla Palace, Hyderabad' },
    ],
    palette: {
      ivory: '#fdfaf5',
      linen: '#f6efe2',
      champagne: '#f0e0bd',
      champagneDeep: '#dcb96f',
      blush: '#f2e4de',
      blushDeep: '#dcb9a8',
      rose: '#8f5a3c',
      gold: '#bb8f3f',
      goldSoft: '#ddc186',
      ink: '#3a2f22',
      inkSoft: '#7d6a52',
    },
  },
  {
    id: 'bengali-traditional',
    name: 'Bengali Traditional',
    category: 'Traditional',
    weddingType: 'Hindu',
    tags: ['Traditional', 'Bengali', 'Alpona'],
    description:
      'Vermillion red and gold with delicate alpona floor-art swirls — the warmth of a Bengali wedding morning.',
    motif: 'alpona',
    greeting: { symbol: 'ॐ', line: 'Shubho Bibaho' },
    couple: {
      names: 'Arjun & Ananya',
      invitationLine:
        'Together with their families, invite you to their Shubho Bibaho.',
      people: [
        { name: 'Arjun Chatterjee', parents: 'Son of Mr. Debashish & Mrs. Mitali Chatterjee' },
        { name: 'Ananya Bose', parents: 'Daughter of Mr. Subrata & Mrs. Sharmila Bose' },
      ],
    },
    palette: {
      ivory: '#fffaf6',
      linen: '#fdf0e6',
      champagne: '#f7ddc0',
      champagneDeep: '#eab97e',
      blush: '#fbe2df',
      blushDeep: '#eeb2ac',
      rose: '#b8283a',
      gold: '#c9932e',
      goldSoft: '#e3bd6c',
      ink: '#402420',
      inkSoft: '#7d5c52',
    },
  },
  {
    id: 'midnight-noir',
    name: 'Midnight Noir',
    category: 'Noir',
    weddingType: 'Christian',
    tags: ['Noir', 'Art Deco', 'Black Tie'],
    description:
      'A dramatic black-tie affair — deep charcoal-black with a radiant gold Art Deco sunburst and sharp chevron borders, for couples who want their invitation to feel like a Gatsby-era soirée.',
    motif: 'art-deco',
    motifAccent: '#b23a52',
    fonts: { serif: '"Cinzel", "Cormorant Garamond", serif' },
    greeting: { symbol: null, line: 'The Pleasure Of Your Company' },
    couple: {
      names: 'Ethan & Sophia',
      invitationLine:
        'Together with their families, request the pleasure of your company at their black-tie wedding celebration.',
      people: [
        { name: 'Ethan Wolfe', parents: 'Son of Mr. Gerald & Mrs. Eleanor Wolfe' },
        { name: 'Sophia Blackwood', parents: 'Daughter of Mr. Nathaniel & Mrs. Margaret Blackwood' },
      ],
    },
    palette: {
      ivory: '#171310',
      linen: '#211b16',
      champagne: '#2b2318',
      champagneDeep: '#4a3a22',
      blush: '#241b1d',
      blushDeep: '#4a2630',
      rose: '#e0ac4c',
      gold: '#d9b46e',
      goldSoft: '#a9895a',
      ink: '#f4ecd9',
      inkSoft: '#c7b89c',
    },
  },
  {
    id: 'regal-onyx',
    name: 'Regal Onyx',
    category: 'Royal',
    weddingType: 'Christian',
    tags: ['Royal', 'Noir', 'Heraldic'],
    description:
      'A heraldic gold crest and laurel sprigs over deep emerald-onyx — quiet, moody grandeur for a couple who wants royal without the pastel.',
    motif: 'heraldic-crest',
    motifAccent: '#3f8f63',
    fonts: { serif: '"Marcellus", "Cormorant Garamond", serif' },
    greeting: { symbol: null, line: 'With Love & Honor' },
    couple: {
      names: 'Alexander & Isabella',
      invitationLine: 'With love and honor, they invite you to witness their vows.',
      people: [
        { name: 'Alexander Hale', parents: 'Son of Mr. Edmund & Mrs. Charlotte Hale' },
        { name: 'Isabella Kane', parents: 'Daughter of Mr. Frederick & Mrs. Victoria Kane' },
      ],
    },
    palette: {
      ivory: '#10150f',
      linen: '#161d14',
      champagne: '#1e2a1a',
      champagneDeep: '#3a4f30',
      blush: '#1a1512',
      blushDeep: '#4a2e22',
      rose: '#d4af37',
      gold: '#c9a24b',
      goldSoft: '#9c7f3f',
      ink: '#f0e6cf',
      inkSoft: '#c2b696',
    },
  },
  {
    id: 'royal-plum-curtain',
    name: 'Royal Plum Curtain',
    category: 'Royal',
    weddingType: 'Hindu',
    tags: ['Royal', 'Curtain Reveal', 'Interactive', 'Scratch Card'],
    description:
      'A royal plum-and-gold curtain parts on tap to reveal a couple lit by drifting gold particles, a scratch-to-reveal save-the-date, event details, RSVP, and a live countdown to the big day — a fully animated, GSAP-driven take on the traditional invite.',
    isFlagship: true,
    // Pulled from the public catalog for now (LandingPage.jsx/WeddingsPage.jsx
    // filter it out of their listings and counts) while we hold it back —
    // left fully intact here, not deleted, so it's a one-line revert to
    // bring it back. Direct/shared links still resolve via getTemplateById,
    // which doesn't consult this flag.
    hidden: true,
    // Bespoke experience component, not the shared InvitationExperience
    // body — see components/wedding/layoutRegistry.js and
    // components/templates/RoyalPlumCurtainTemplate/. Mirrors the `layout`
    // field GANESH_TEMPLATES/SATSANG_TEMPLATES already use for their own
    // one-off designs (see ganeshTemplatesData.js's comment block).
    // `motif`/`motifAccent` are deliberately omitted: the bespoke layout
    // owns its entire visual language and never reads them, and
    // CulturalMotif/FrameCorners/MotifBadge all no-op safely on an unset
    // motif (used only by TemplateShowcase's catalog thumbnail below).
    layout: 'royal-plum-curtain',
    fonts: { serif: '"Cinzel", "Playfair Display", serif', script: '"Great Vibes", cursive' },
    greeting: { symbol: 'ॐ', line: 'A Special Day Awaits' },
    // The hero caricature RoyalPlumCurtainAdapter passes through as
    // couple.caricatureUrl (see components/wedding/royal-plum-curtain/
    // RoyalPlumCurtainAdapter.jsx) — a couple in royal purple-and-gold
    // sherwani/lehenga, cropped tight and re-encoded to WebP (230KB,
    // down from a 3.5MB source PNG) since this loads on every guest's
    // phone, often over mobile data.
    heroPhoto: { src: '/images/couples/royal-plum-caricature.webp', alt: 'Illustrated couple in royal purple and gold wedding attire' },
    couple: {
      names: 'Ananya & Vivaan',
      invitationLine:
        'Thank you for being a part of our special journey. Your love, blessings, and presence mean the world to us as we begin this new chapter together.',
      people: [
        { name: 'Ananya Malhotra', parents: 'Daughter of Mr. Rajesh & Mrs. Sunita Malhotra' },
        { name: 'Vivaan Rathore', parents: 'Son of Mr. Arvind & Mrs. Kavita Rathore' },
      ],
    },
    ceremoniesHeading: 'Wedding Events',
    weddingDate: '2026-12-12T18:30:00',
    ceremonies: [
      { icon: Flower, title: 'Haldi Ceremony', date: 'December 10, 2026', time: '9:00 AM', venue: 'Rathore Family Residence, Jodhpur' },
      { icon: Music, title: 'Sangeet Night', date: 'December 11, 2026', time: '7:00 PM', venue: 'Umaid Bhawan Lawns, Jodhpur' },
      { icon: Heart, title: 'Wedding Pheras', date: 'December 12, 2026', time: '6:30 PM', venue: 'The Leela Palace, Jodhpur' },
    ],
    // A deliberately dark palette (unlike every other template's light
    // ivory/linen/champagne progression) — TemplateShowcase.jsx's catalog
    // thumbnail builds its gradient straight from these three, so the card
    // itself previews the template's real royal-plum-and-gold look instead
    // of a mismatched light background.
    palette: {
      ivory: '#2f0440',
      linen: '#260433',
      champagne: '#3d0855',
      champagneDeep: '#c79526',
      blush: '#3d0855',
      blushDeep: '#e6ba47',
      rose: '#f5d061',
      gold: '#e6ba47',
      goldSoft: '#f5d061',
      ink: '#fff4d2',
      inkSoft: '#e8c574',
    },
  },
]

export const CATEGORIES = ['All', ...new Set(TEMPLATES.map((t) => t.category))]

// The primary browsing axis: which wedding tradition a template is built
// for. Distinct from `category`, which is just the aesthetic style label
// (Royal, Minimalist, Noir, ...) — a single wedding tradition can span
// several aesthetic styles (e.g. several Hindu templates in different
// regional styles), so both filters coexist.
export const WEDDING_TYPES = ['All', ...new Set(TEMPLATES.map((t) => t.weddingType))]

export function getTemplateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
