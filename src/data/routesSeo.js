// Central per-route SEO copy — the single source of truth for the
// client-side <SEO> component (updates document head on navigation, mainly
// for the browser tab + JS-executing crawlers like Googlebot), the local
// dev server's HTML injection (server/index.js), and the production
// Vercel function that does the same job (api/render.js). Needed because
// WhatsApp's link-preview scraper, like most social crawlers and some SEO
// auditors, fetches raw HTML and never executes JS — so the *initial*
// response has to already carry the right title/description/OG tags per
// route, not just whatever the client patches in after render.
//
// Plain data only, no React/lucide imports — this file is also imported by
// Node code (server/index.js, api/render.js, api/sitemap.js), and must stay
// import-safe there.
//
// Title tags are kept under 60 characters and meta descriptions under 160
// (ideally ~150, to leave room for Google's own truncation) — both are hard
// limits enforced by convention here, not by any runtime check, so keep new
// entries within budget too.
export const SITE_URL = 'https://invitemypeople.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`

// "Coming soon" celebration categories — no live templates yet, but each
// still gets a real, crawlable, linkable URL (see occasionsData.js, which
// pairs this list with an icon + tagline for on-page display).
export const COMING_SOON_ROUTES = [
  {
    slug: 'birthdays',
    label: 'Birthday Parties',
    title: 'Birthday Party Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital birthday party invitations are coming soon — the same WhatsApp delivery, RSVP tracking and interactive design already live for weddings & Satsangs.',
  },
  {
    slug: 'engagements',
    label: 'Engagements',
    title: 'Digital Engagement Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital engagement invitations are coming soon — the same WhatsApp delivery, RSVP tracking and interactive design already live for weddings & Satsangs.',
  },
  {
    slug: 'baby-showers',
    label: 'Baby Showers',
    title: 'Baby Shower Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital baby shower invitations are coming soon — the same WhatsApp delivery, RSVP tracking and interactive design already live for weddings & Satsangs.',
  },
  {
    slug: 'housewarmings',
    label: 'Housewarmings',
    title: 'Housewarming Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital housewarming (Griha Pravesh) invites are coming soon — the same WhatsApp delivery and RSVP tracking already live for weddings & Satsangs.',
  },
  {
    slug: 'corporate-events',
    label: 'Corporate Events',
    title: 'Corporate Event Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital corporate event invitations are coming soon — the same WhatsApp delivery, RSVP tracking and interactive design already live for weddings & Satsangs.',
  },
  {
    slug: 'anniversaries',
    label: 'Anniversaries',
    title: 'Anniversary Invites (Coming Soon) | InviteMyPeople',
    description:
      'Digital anniversary invitations are coming soon — the same WhatsApp delivery, RSVP tracking and interactive design already live for weddings & Satsangs.',
  },
]

// `h1` mirrors the literal on-page headline for each route (see
// LandingPage.jsx, AboutPage.jsx, WeddingsPage.jsx, etc.) — kept here so the
// server-side HTML injection below (setRootH1, used by server/index.js and
// api/render.js) can stamp a real, crawlable <h1> into the *raw* HTML
// response, matching what React renders after mount. Without this, a
// non-JS-executing crawler or SEO auditor sees only an empty
// `<div id="root"></div>` — the SPA shell has no heading at all until
// client-side JS runs. Keep each value in sync with its component's actual
// heading text word-for-word, so bots and JS-rendering visitors always see
// identical content (never drift into showing crawlers something different
// from what users see).
const STATIC_ROUTES_SEO = {
  '/': {
    title: 'InviteMyPeople | Digital Invites for Weddings & Events',
    description:
      'Interactive digital invitations for weddings, Guruji Satsangs & more — budget-friendly, delivered on WhatsApp in 30 minutes.',
    ogTitle: 'InviteMyPeople | Stunning Interactive Digital Invitations',
    ogDescription:
      'Budget-friendly, interactive digital invitations for weddings, Guruji Satsangs, birthdays, engagements, baby showers, housewarmings, corporate events & anniversaries — delivered on WhatsApp in 30 minutes.',
    h1: 'Digital Invitations as unforgettable as your celebration',
  },
  '/about': {
    title: 'About Us | InviteMyPeople',
    description:
      'Why we built InviteMyPeople — tired of lost phone numbers and hand-tallied RSVPs, we made interactive, WhatsApp-delivered digital invitations instead.',
    ogTitle: 'About InviteMyPeople — Invitations, Reinvented',
    ogDescription:
      'The story behind InviteMyPeople and what makes our digital invitations different — interactive envelopes, scratch-to-reveal cards, live RSVP tracking, and a wishes wall.',
    h1: 'Invitations, the way they should’ve always felt.',
  },
  '/weddings': {
    title: 'Digital Wedding Invitations | InviteMyPeople',
    description:
      'Browse interactive digital wedding invitations — Hindu, Muslim, Sikh & more — with envelope reveals, scratch cards and built-in RSVP.',
    ogTitle: 'Digital Wedding Invitations — InviteMyPeople',
    ogDescription:
      'Interactive digital wedding invitations across every tradition — envelope reveal, scratch-to-reveal cards, and built-in RSVP tracking.',
    h1: 'Digital Wedding Invitations for Every Tradition',
  },
  '/guruji-satsangs': {
    title: 'Guruji Satsang Invitations | InviteMyPeople',
    description:
      "Devotional digital invitations for Guruji Satsangs — Guruji's photo, a Divine Blessing scratch card and RSVP, all built in.",
    ogTitle: 'Guruji Satsang Invitations — InviteMyPeople',
    ogDescription:
      'Devotional digital invitations for Guruji Satsangs, complete with a Divine Blessing scratch card and built-in RSVP tracking.',
    h1: 'Devotional Invitations for Guruji’s Satsang',
  },
  '/templates/ganesh-chaturthi': {
    title: 'Ganesh Chaturthi Invitations | InviteMyPeople',
    description:
      'Immersive digital Ganesh Chaturthi invitations — a curtain-opening darshan reveal, full puja muhurat, interactive RSVP and a blessing wall.',
    ogTitle: 'Ganesh Chaturthi Invitations — InviteMyPeople',
    ogDescription:
      'Immersive, photo-rich digital invitations to welcome Ganpati Bappa — curtain-opening darshan reveal, puja muhurat, interactive RSVP and a blessing wall.',
    h1: 'Immersive Ganesh Chaturthi Invitations to Welcome Bappa',
  },
  '/create': {
    title: 'Invitation Builder | InviteMyPeople',
    description:
      'Build your own digital invitation — pick a style, add your names, date and venue, and watch a live preview update instantly.',
    ogTitle: 'Invitation Builder — InviteMyPeople',
    ogDescription:
      'Pick a template style, fill in your details, and watch your invitation come to life in a live preview — then send it to us on WhatsApp to finalize.',
    h1: 'Build Your Invitation, Live',
  },
}

export const ROUTES_SEO = COMING_SOON_ROUTES.reduce((acc, occasion) => {
  acc[`/${occasion.slug}`] = {
    title: occasion.title,
    description: occasion.description,
    ogTitle: occasion.title.replace(' | InviteMyPeople', ''),
    ogDescription: occasion.description,
    // Matches ComingSoonPage.jsx's own `Digital {occasion.label} Invitations`
    // heading exactly — see the STATIC_ROUTES_SEO comment above for why.
    h1: `Digital ${occasion.label} Invitations`,
  }
  return acc
}, { ...STATIC_ROUTES_SEO })

// Shared title/description builders for the two dynamic, directly-linkable
// template detail pages (/satsang/:slug and /templates/ganesh-chaturthi/:slug)
// — used by src/App.jsx (client-side <SEO>), server/index.js (local dev SSR)
// and api/render.js (production SSR) so all three stay in sync automatically
// instead of re-deriving the same title format three times.
//
// Templates carry a rich, evocative `description` used as on-page marketing
// copy (see SatsangTemplateCard.jsx/GaneshTemplateCard.jsx) that often runs
// well past the ~155-character budget a meta description has to fit in —
// `metaDescription` is an optional, shorter, SEO-specific override; templates
// whose `description` already fits the budget don't need one.
export function satsangSeo(template) {
  const title = `${template.name} — Guruji Satsang | InviteMyPeople`
  const description = template.metaDescription || template.description
  return { title, description, ogTitle: title, ogDescription: description }
}

export function ganeshSeo(template) {
  const title = `${template.name} — Ganesh Chaturthi | InviteMyPeople`
  const description = template.metaDescription || template.description
  return { title, description, ogTitle: title, ogDescription: description }
}
