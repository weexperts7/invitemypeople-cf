import { Flower, Gem, Heart, Landmark, Moon, Music, PartyPopper, Sparkle } from 'lucide-react'

// Same price across every template today, so it's one shared constant
// rather than a per-template field — add per-template pricing later only
// if templates actually start to differ in price.
export const PRICING = { price: 2500, shagunPrice: 2100 }

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
    greeting: { symbol: 'ॐ', line: 'Shree Ganeshaya Namah' },
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
    tags: ['Festive', 'Punjabi', 'Phulkari', 'Sikh'],
    description:
      'Hand-embroidered Phulkari-inspired geometric blooms in playful pastel — the vibrant spirit of a Punjabi Sikh wedding and Anand Karaj.',
    motif: 'phulkari',
    motifAccent: '#3f7fae',
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
      ivory: '#fdfbf9',
      linen: '#faf1ee',
      champagne: '#f7e2d8',
      champagneDeep: '#eec3a8',
      blush: '#fbe1e8',
      blushDeep: '#f0aec0',
      rose: '#d64d63',
      gold: '#d99a3c',
      goldSoft: '#eec685',
      ink: '#452e2a',
      inkSoft: '#7d625c',
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
