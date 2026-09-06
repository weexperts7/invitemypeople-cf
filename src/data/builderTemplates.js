// The full template list for the self-service Invitation Builder (/create —
// see pages/CreateInvitePage.jsx). Every "Buy Now"/"Customize" CTA site-wide
// now lands here (see utils/createLink.js), so every template a visitor can
// pick from the browsing galleries (WeddingsPage/GurujiSatsangsPage/
// GaneshChaturthiPage) needs an entry here too — otherwise clicking
// "Customize" on a template that's missing silently falls back to the first
// style for that occasion instead of the one the visitor actually chose.
//
// Each entry borrows its palette/motif/fonts/greeting straight from the
// existing template data (via the from*() helpers below) so the builder's
// preview never drifts out of sync with the "real" template it represents,
// and adds only what the builder itself needs: a generic `example` (the
// placeholder content shown in the live preview before a user types
// anything) and a `connective` line (the "invite you to..." sentence,
// reused verbatim from that template's own copy). Wedding entries also
// borrow `weddingType`/`heroPhoto` — GeneratedInvitePage.jsx renders a paid
// wedding invite through the full InvitationExperience (not just the
// lightweight preview card these two fields alone would suggest), and
// InvitationExperience needs them for the photo gallery / hero image.
import { Heart } from 'lucide-react'
import { GaneshIcon } from '../components/icons/GaneshIcon'
import { FoldedHandsIcon } from '../components/icons/FoldedHandsIcon'
import { TEMPLATES, getTemplateById } from './templatesData'
import { GANESH_TEMPLATES } from './ganeshTemplatesData'
import { SATSANG_TEMPLATES } from './satsangTemplatesData'

function fromWedding(id) {
  const t = TEMPLATES.find((x) => x.id === id)
  if (!t) throw new Error(`builderTemplates: unknown wedding template "${id}"`)
  return t
}
function fromGanesh(slug) {
  const t = GANESH_TEMPLATES.find((x) => x.slug === slug)
  if (!t) throw new Error(`builderTemplates: unknown Ganesh template "${slug}"`)
  return t
}
function fromSatsang(slug) {
  const t = SATSANG_TEMPLATES.find((x) => x.slug === slug)
  if (!t) throw new Error(`builderTemplates: unknown Satsang template "${slug}"`)
  return t
}

// One entry per occasion the builder supports — drives the tab bar in
// TemplateStyleSelector plus the copy (field label/placeholder) that varies
// by occasion, since "who" an invitation names differs (a couple vs. a
// hosting family).
//
// `disabled: true` on Ganesh Chaturthi/Guruji Satsang: not pulled from the
// builder, just gated off ahead of the ad campaign launch the same way
// their template cards/nav/footer entries are (see routesSeo.js's
// COMING_SOON_ROUTES comment for the full picture) — TemplateStyleSelector.jsx
// greys these tabs out and won't fire onOccasionChange for them, and
// CreateInvitePage.jsx refuses to honor a `?occasion=` deep link naming
// either one.
export const OCCASIONS = [
  {
    id: 'wedding',
    label: 'Wedding',
    icon: Heart,
    namesLabel: 'Couple / Host Names',
    namesPlaceholder: 'e.g. Aarav & Diya',
  },
  {
    id: 'ganesh-chaturthi',
    label: 'Ganesh Chaturthi',
    icon: GaneshIcon,
    namesLabel: 'Host Family Name',
    namesPlaceholder: 'e.g. The Deshmukh Family',
    disabled: true,
  },
  {
    id: 'guruji-satsang',
    label: 'Guruji Satsang',
    icon: FoldedHandsIcon,
    namesLabel: 'Host Family Name',
    namesPlaceholder: 'e.g. The Malhotra Family',
    disabled: true,
  },
]

export const BUILDER_TEMPLATES = [
  // ---- Weddings -----------------------------------------------------
  (() => {
    const src = fromWedding('rajasthani-royal')
    return {
      id: 'wedding-rajasthani-royal',
      sourceId: 'rajasthani-royal',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Palace arches, deep crimson & antique gold',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-12',
        time: '09:00',
        venue: 'Rambagh Palace Gardens, Jaipur',
        message:
          "Your presence is our greatest blessing — we can't wait to celebrate this new beginning with you.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('royal-festive-vibrant')
    return {
      id: 'wedding-royal-festive-vibrant',
      sourceId: 'royal-festive-vibrant',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Crimson, marigold, rani pink & emerald over shimmering gold',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-14',
        time: '09:00',
        venue: 'City Palace Gardens, Udaipur',
        message: "Come dressed in colour — we can't wait to dance, feast and celebrate with you.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('south-indian-temple-gold')
    return {
      id: 'wedding-south-indian-temple-gold',
      sourceId: 'south-indian-temple-gold',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Temple gopuram gold, jasmine & lotus',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      // No heroPhoto here (unlike the other builder entries, which borrow
      // it straight from src) — the source template's is a stock photo of
      // its own example couple, and shows up as a circular medallion on
      // WelcomeSplash (see CouplePhoto.jsx) above every buyer's own name,
      // regardless of what they actually type in. Every other builder
      // template already ships without one for the same reason; this one
      // just inherited it from the source template by omission.
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-05',
        time: '08:00',
        venue: 'Sri Kapaleeshwarar Kalyana Mandapam, Chennai',
        message:
          'With the blessings of Lord Venkateswara, we joyfully welcome you to our Kalyanam.',
      },
    }
  })(),
  (() => {
    const src = fromWedding('punjabi-phulkari')
    return {
      id: 'wedding-punjabi-phulkari',
      sourceId: 'punjabi-phulkari',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Hand-embroidered phulkari blooms, playful pastel',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-08',
        time: '10:00',
        venue: 'Guru Nanak Darbar Gurdwara, Amritsar',
        message: 'Rab Rakha — come dance, feast and celebrate our Anand Karaj with us!',
      },
    }
  })(),
  (() => {
    const src = fromWedding('western-elegant-minimalist')
    return {
      id: 'wedding-western-elegant-minimalist',
      sourceId: 'western-elegant-minimalist',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Clean typography, restrained floral line-art',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-11-21',
        time: '16:00',
        venue: 'St. Alex Church, Goa',
        message: "We can't wait to exchange vows surrounded by the people we love most.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('gujarati-traditional')
    return {
      id: 'wedding-gujarati-traditional',
      sourceId: 'gujarati-traditional',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Pastel ivory, marigold garlands & bandhani dots',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-11-14',
        time: '10:00',
        venue: 'Sarovar Portico Lawns, Ahmedabad',
        message: "Together with our families, we can't wait to celebrate this joyous new beginning with you.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('vrindavan-radha-krishna')
    return {
      id: 'wedding-vrindavan-radha-krishna',
      sourceId: 'vrindavan-radha-krishna',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Lotus halo, peacock-feather line-art, soft pastels',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-11-28',
        time: '09:00',
        venue: 'Prem Mandir Grounds, Vrindavan',
        message: "With Radha-Krishna's blessings, we can't wait to celebrate this sacred union with you.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('royal-mughal')
    return {
      id: 'wedding-royal-mughal',
      sourceId: 'royal-mughal',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Jaali lattice, arched domes, opulent gold over ivory',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-19',
        time: '19:00',
        venue: 'Falaknuma Palace, Hyderabad',
        message: 'Together with our families, we request the honour of your presence to celebrate our Nikah.',
      },
    }
  })(),
  (() => {
    const src = fromWedding('bengali-traditional')
    return {
      id: 'wedding-bengali-traditional',
      sourceId: 'bengali-traditional',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Vermillion red & gold, delicate alpona floor-art',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-01',
        time: '09:00',
        venue: 'Prinsep Ghat Lawns, Kolkata',
        message: 'With hearts full of joy, we invite you to celebrate our Shubho Bibaho with us.',
      },
    }
  })(),
  (() => {
    const src = fromWedding('midnight-noir')
    return {
      id: 'wedding-midnight-noir',
      sourceId: 'midnight-noir',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Black-tie noir, gold Art Deco sunburst & chevrons',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-11-07',
        time: '19:00',
        venue: 'The Imperial Ballroom, New Delhi',
        message: "Black tie requested — join us for an unforgettable night as we say 'I do.'",
      },
    }
  })(),
  (() => {
    const src = fromWedding('regal-onyx')
    return {
      id: 'wedding-regal-onyx',
      sourceId: 'regal-onyx',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Heraldic gold crest & laurel over deep emerald-onyx',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-10-24',
        time: '18:30',
        venue: 'Taj Falaknuma Palace, Hyderabad',
        message: 'With love and honor, we invite you to witness our vows.',
      },
    }
  })(),
  (() => {
    const src = fromWedding('royal-plum-curtain')
    return {
      id: 'wedding-royal-plum-curtain',
      sourceId: 'royal-plum-curtain',
      occasion: 'wedding',
      // Propagated so getBuilderTemplatesForOccasion() can keep this style
      // out of the builder's picker while it's hidden from the browsing
      // catalog too (see templatesData.js's royal-plum-curtain entry).
      hidden: src.hidden,
      name: src.name,
      tagline: 'Curtain reveal, gold particles & scratch-to-reveal cards',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      // Propagated through so buildWeddingExperienceTemplate.js's
      // `{ ...template, ... }` spread carries it onto the real generated
      // invite too — see InvitationExperience.jsx's dispatch, which reads
      // this same field name off whatever `template` it's given.
      layout: src.layout,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-12',
        time: '18:30',
        venue: 'The Leela Palace, Jodhpur',
        message: "Your presence is our greatest blessing — we can't wait to celebrate with you.",
      },
    }
  })(),
  (() => {
    const src = fromWedding('pink-gold-floral')
    return {
      id: 'wedding-pink-gold-floral',
      sourceId: 'pink-gold-floral',
      occasion: 'wedding',
      // Propagated so getBuilderTemplatesForOccasion() can keep this style
      // out of the builder's picker while it's hidden from the browsing
      // catalog too (see templatesData.js's pink-gold-floral entry).
      hidden: src.hidden,
      name: src.name,
      tagline: 'Watercolor roses, gold vines & a live blush-and-gold scroll',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      weddingType: src.weddingType,
      heroPhoto: src.heroPhoto,
      greeting: src.greeting,
      // Propagated through so buildWeddingExperienceTemplate.js's
      // `{ ...template, ... }` spread carries it onto the real generated
      // invite too — see InvitationExperience.jsx's dispatch, which reads
      // this same field name off whatever `template` it's given.
      layout: src.layout,
      connective: src.couple.invitationLine,
      example: {
        names: src.couple.names,
        date: '2026-12-13',
        time: '08:00',
        venue: 'ITC Grand Bharat, Gurugram',
        message: 'cordially invite you to join in the celebration of their wedding',
      },
    }
  })(),

  // ---- Ganesh Chaturthi ----------------------------------------------
  (() => {
    const src = fromGanesh('marigold-mandap')
    return {
      id: 'ganesh-marigold-mandap',
      sourceId: 'marigold-mandap',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:00',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),
  (() => {
    const src = fromGanesh('golden-trunk-blessing')
    return {
      id: 'ganesh-golden-trunk-blessing',
      sourceId: 'golden-trunk-blessing',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:30',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),
  (() => {
    const src = fromGanesh('royal-durbar-darshan')
    return {
      id: 'ganesh-royal-durbar-darshan',
      sourceId: 'royal-durbar-darshan',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:00',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),
  (() => {
    const src = fromGanesh('vermilion-lotus-aarti')
    return {
      id: 'ganesh-vermilion-lotus-aarti',
      sourceId: 'vermilion-lotus-aarti',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:00',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),
  (() => {
    const src = fromGanesh('emerald-doob-grace')
    return {
      id: 'ganesh-emerald-doob-grace',
      sourceId: 'emerald-doob-grace',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:00',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),
  (() => {
    const src = fromGanesh('divine-threshold')
    return {
      id: 'ganesh-divine-threshold',
      sourceId: 'divine-threshold',
      occasion: 'ganesh-chaturthi',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-14',
        time: '19:00',
        venue: src.event.venue,
        message: src.puja.note,
      },
    }
  })(),

  // ---- Guruji Satsang -------------------------------------------------
  (() => {
    const src = fromSatsang('divine-peacock')
    return {
      id: 'satsang-divine-peacock',
      sourceId: 'divine-peacock',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-09-12',
        time: '18:00',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('saffron-blossom')
    return {
      id: 'satsang-saffron-blossom',
      sourceId: 'saffron-blossom',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-10-03',
        time: '17:30',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('golden-temple-altar')
    return {
      id: 'satsang-golden-temple-altar',
      sourceId: 'golden-temple-altar',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2027-03-14',
        time: '18:00',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('radiant-sunrise')
    return {
      id: 'satsang-radiant-sunrise',
      sourceId: 'radiant-sunrise',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-11-08',
        time: '07:00',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('tulsi-serenity')
    return {
      id: 'satsang-tulsi-serenity',
      sourceId: 'tulsi-serenity',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2026-12-06',
        time: '18:00',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('diya-ganga')
    return {
      id: 'satsang-diya-ganga',
      sourceId: 'diya-ganga',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2027-01-17',
        time: '18:30',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
  (() => {
    const src = fromSatsang('celestial-om')
    return {
      id: 'satsang-celestial-om',
      sourceId: 'celestial-om',
      occasion: 'guruji-satsang',
      name: src.name,
      tagline: src.tagline,
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
      greeting: src.greeting,
      connective: src.host.hostLine,
      example: {
        names: src.host.familyName,
        date: '2027-02-21',
        time: '20:00',
        venue: src.event.venue,
        message: src.mahaprasad.note,
      },
    }
  })(),
]

export function getOccasion(id) {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0]
}

export function getBuilderTemplatesForOccasion(occasionId) {
  // Respect the source template's `hidden` flag (see templatesData.js's
  // royal-plum-curtain entry) so a style pulled from the public catalog
  // ahead of launch stays out of the builder's "choose your style" grid
  // too, not just the browsing gallery.
  return BUILDER_TEMPLATES.filter((t) => t.occasion === occasionId && !t.hidden)
}

export function getBuilderTemplateById(id) {
  return BUILDER_TEMPLATES.find((t) => t.id === id) ?? BUILDER_TEMPLATES[0]
}

// Resolves a REAL saved invite's `templateId` back to its rendering data —
// used by GeneratedInvitePage.jsx (/i/:slug) and PartnerInviteViewerPage.jsx
// (/p/:slug), never by the builder pages themselves (which keep calling
// getBuilderTemplateById() above, unchanged).
//
// Why this needs to exist separately: the self-service Invitation Builder
// and Partner Portal builder both save `template.id` from
// getBuilderTemplateById() — one of THIS file's own `wedding-<slug>` ids
// (see BUILDER_TEMPLATES above) — so looking it back up here always hits
// first. But AdminCreateInvitePage.jsx's Template picker (api/_lib/
// adminCreateInvite.js) deliberately offers the FULL wedding catalog
// (templatesData.js's TEMPLATES), not just this file's self-service subset
// — that's the whole point of Mahogany Seal being selectable there despite
// having no BUILDER_TEMPLATES entry at all (it's excluded from the
// self-service builder on purpose — see templatesData.js's own comment).
// A raw catalog id like "mahogany-seal" doesn't match any `wedding-*` id
// here, so getBuilderTemplateById() alone would silently return
// BUILDER_TEMPLATES[0] — a DIFFERENT template's palette/fonts/layout
// entirely — instead of erroring, which is exactly the bug an admin-minted
// Mahogany Seal invite hit: it rendered in a different, wrong template
// instead of failing loudly.
//
// Falls through: this file's own builder id -> the full catalog's own id
// -> the same BUILDER_TEMPLATES[0] safety net getBuilderTemplateById() has
// always had, in that order — so every existing self-service/partner
// invite (which only ever have a builder id) resolves exactly as before.
export function resolveWeddingTemplateForInvite(templateId) {
  return BUILDER_TEMPLATES.find((t) => t.id === templateId) ?? getTemplateById(templateId) ?? BUILDER_TEMPLATES[0]
}

// Reverse lookup used when a "Customize"/"Buy Now" CTA elsewhere on the site
// (a template card, a live preview) points at a template from the full
// TEMPLATES/GANESH_TEMPLATES/SATSANG_TEMPLATES catalogs rather than the
// builder's own id — see utils/createLink.js. Every catalog template has a
// matching entry above, but this still returns undefined safely if that
// ever drifts (a new catalog template added without its builder entry);
// callers fall back to just the occasion in that case.
export function findBuilderTemplateBySource(occasionId, sourceId) {
  return BUILDER_TEMPLATES.find(
    (t) => t.occasion === occasionId && t.sourceId === sourceId,
  )
}
