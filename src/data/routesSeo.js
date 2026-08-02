// Central per-route SEO copy — the single source of truth for both the
// client-side <SEO> component (updates document head on navigation, mainly
// for the browser tab + JS-executing crawlers like Googlebot) and the
// server's HTML injection in server/index.js (needed because WhatsApp's
// link-preview scraper, like most social crawlers, fetches raw HTML and
// never executes JS — so the *initial* response has to already carry the
// right title/description/OG tags per route).
//
// Plain data only, no React/lucide imports — this file is also imported by
// the Node server, and must stay import-safe there.
export const SITE_URL = 'https://invitemypeople.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`

// "Coming soon" celebration categories — no live templates yet, but each
// still gets a real, crawlable, linkable URL (see occasionsData.js, which
// pairs this list with an icon + tagline for on-page display).
export const COMING_SOON_ROUTES = [
  {
    slug: 'birthdays',
    label: 'Birthday Parties',
    title: 'Digital Birthday Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital birthday party invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
  {
    slug: 'engagements',
    label: 'Engagements',
    title: 'Digital Engagement Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital engagement invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
  {
    slug: 'baby-showers',
    label: 'Baby Showers',
    title: 'Digital Baby Shower Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital baby shower invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
  {
    slug: 'housewarmings',
    label: 'Housewarmings',
    title: 'Digital Housewarming Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital housewarming (Griha Pravesh) invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
  {
    slug: 'corporate-events',
    label: 'Corporate Events',
    title: 'Digital Corporate Event Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital corporate event invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
  {
    slug: 'anniversaries',
    label: 'Anniversaries',
    title: 'Digital Anniversary Invitations (Coming Soon) | InviteMyPeople',
    description:
      'Interactive digital anniversary invitations are coming soon to InviteMyPeople — WhatsApp delivery, RSVP tracking and every feature we already offer for weddings and Satsangs.',
  },
]

const STATIC_ROUTES_SEO = {
  '/': {
    title: 'InviteMyPeople | Digital Invites for Weddings & Events',
    description:
      'Interactive digital invitations for weddings, Guruji Satsangs, birthdays, baby showers & housewarmings. Budget-friendly & delivered on WhatsApp in 30 minutes.',
    ogTitle: 'InviteMyPeople | Stunning Interactive Digital Invitations',
    ogDescription:
      'Budget-friendly, interactive digital invitations for weddings, Guruji Satsangs, birthdays, engagements, baby showers, housewarmings, corporate events & anniversaries — delivered on WhatsApp in 30 minutes.',
  },
  '/about': {
    title: 'About Us | InviteMyPeople',
    description:
      'Why we built InviteMyPeople: tired of chasing lost phone numbers, reprinting cards and tallying RSVPs by hand, we built interactive, WhatsApp-delivered digital invitations for every celebration.',
    ogTitle: 'About InviteMyPeople — Invitations, Reinvented',
    ogDescription:
      'The story behind InviteMyPeople and what makes our digital invitations different — interactive envelopes, scratch-to-reveal cards, live RSVP tracking, and a wishes wall.',
  },
  '/weddings': {
    title: 'Digital Wedding Invitations | InviteMyPeople',
    description:
      'Browse interactive digital wedding invitations — Hindu, Muslim, Sikh & more. Envelope reveal, scratch-to-reveal cards & built-in RSVP, delivered on WhatsApp in 30 minutes.',
    ogTitle: 'Digital Wedding Invitations — InviteMyPeople',
    ogDescription:
      'Interactive digital wedding invitations across every tradition — envelope reveal, scratch-to-reveal cards, and built-in RSVP tracking.',
  },
  '/guruji-satsangs': {
    title: 'Guruji Satsang Invitations | InviteMyPeople',
    description:
      "Devotional digital invitations for Guruji Satsangs — Guruji's photo, a live Divine Blessing scratch card and RSVP built in, delivered on WhatsApp in 30 minutes.",
    ogTitle: 'Guruji Satsang Invitations — InviteMyPeople',
    ogDescription:
      'Devotional digital invitations for Guruji Satsangs, complete with a Divine Blessing scratch card and built-in RSVP tracking.',
  },
  '/templates/ganesh-chaturthi': {
    title: 'Ganesh Chaturthi Invitations | InviteMyPeople',
    description:
      'Immersive digital Ganesh Chaturthi invitations — vibrant marigold & gold styling, a curtain-opening darshan reveal, full puja muhurat details, interactive RSVP and a blessing wall, delivered on WhatsApp in 30 minutes.',
    ogTitle: 'Ganesh Chaturthi Invitations — InviteMyPeople',
    ogDescription:
      'Immersive, photo-rich digital invitations to welcome Ganpati Bappa — curtain-opening darshan reveal, puja muhurat, interactive RSVP and a blessing wall.',
  },
}

export const ROUTES_SEO = COMING_SOON_ROUTES.reduce((acc, occasion) => {
  acc[`/${occasion.slug}`] = {
    title: occasion.title,
    description: occasion.description,
    ogTitle: occasion.title.replace(' | InviteMyPeople', ''),
    ogDescription: occasion.description,
  }
  return acc
}, { ...STATIC_ROUTES_SEO })
