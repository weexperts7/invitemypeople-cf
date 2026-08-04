// The curated template list for the self-service Invitation Builder
// (/create — see pages/CreateInvitePage.jsx). Deliberately a hand-picked
// subset of TEMPLATES / GANESH_TEMPLATES / SATSANG_TEMPLATES rather than
// every template in those files — the builder's job is to get a couple/
// family to a good-looking live preview in a few keystrokes, not to
// reproduce the full browsing galleries those pages already own.
//
// Each entry borrows its palette/motif/fonts/greeting straight from the
// existing template data (via the from*() helpers below) so the builder's
// preview never drifts out of sync with the "real" template it represents,
// and adds only what the builder itself needs: a generic `example` (the
// placeholder content shown in the live preview before a user types
// anything) and a `connective` line (the "invite you to..." sentence,
// reused verbatim from that template's own copy).
import { Heart } from 'lucide-react'
import { GaneshIcon } from '../components/icons/GaneshIcon'
import { FoldedHandsIcon } from '../components/icons/FoldedHandsIcon'
import { TEMPLATES } from './templatesData'
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
  },
  {
    id: 'guruji-satsang',
    label: 'Guruji Satsang',
    icon: FoldedHandsIcon,
    namesLabel: 'Host Family Name',
    namesPlaceholder: 'e.g. The Malhotra Family',
  },
]

export const BUILDER_TEMPLATES = [
  // ---- Weddings -----------------------------------------------------
  (() => {
    const src = fromWedding('rajasthani-royal')
    return {
      id: 'wedding-rajasthani-royal',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Palace arches, deep crimson & antique gold',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
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
    const src = fromWedding('south-indian-temple-gold')
    return {
      id: 'wedding-south-indian-temple-gold',
      occasion: 'wedding',
      name: src.name,
      tagline: 'Temple gopuram gold, jasmine & lotus',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
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
      occasion: 'wedding',
      name: src.name,
      tagline: 'Hand-embroidered phulkari blooms, playful pastel',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
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
      occasion: 'wedding',
      name: src.name,
      tagline: 'Clean typography, restrained floral line-art',
      palette: src.palette,
      motif: src.motif,
      motifAccent: src.motifAccent,
      fonts: src.fonts,
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

  // ---- Ganesh Chaturthi ----------------------------------------------
  (() => {
    const src = fromGanesh('marigold-mandap')
    return {
      id: 'ganesh-marigold-mandap',
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
]

export function getOccasion(id) {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[0]
}

export function getBuilderTemplatesForOccasion(occasionId) {
  return BUILDER_TEMPLATES.filter((t) => t.occasion === occasionId)
}

export function getBuilderTemplateById(id) {
  return BUILDER_TEMPLATES.find((t) => t.id === id) ?? BUILDER_TEMPLATES[0]
}
