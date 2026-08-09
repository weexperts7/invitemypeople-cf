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
// The apex domain (invitemypeople.com) 308-redirects to this www subdomain
// at the DNS/Vercel level — www is the one that actually serves content
// (verify with `curl -I https://invitemypeople.com/`). Every canonical/
// og:url/JSON-LD URL in this codebase has to point at the domain that
// *doesn't* redirect, or a crawler following the canonical link lands on a
// different final URL than the one declared — precisely the "canonical
// link points to a different page" class of error. Keep index.html,
// public/robots.txt, and api/sitemap.js's own SITE_URL constant in sync
// with this one if it ever changes.
export const SITE_URL = 'https://www.invitemypeople.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`

// Real, always-present internal links — stamped into the raw HTML shell
// alongside `h1`/`body` below (see setRootContent in server/index.js and
// api/render.js) so a non-JS crawler finds actual <a href> internal links on
// every static page, not just once React mounts and renders SiteHeader/
// SiteFooter. Mirrors SiteFooter.jsx's "Quick Links" column — keep the two
// in sync if that list ever changes.
export const SITE_NAV_LINKS = [
  { href: '/weddings', label: 'Wedding Invitations' },
  { href: '/guruji-satsangs', label: 'Guruji Satsang Invitations' },
  { href: '/templates/ganesh-chaturthi', label: 'Ganesh Chaturthi Invitations' },
  { href: '/create', label: 'Build Your Invitation' },
  { href: '/about', label: 'About Us' },
]

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
    // Only the homepage carries `body` — real, on-page paragraph copy (see
    // the matching sections of LandingPage.jsx: hero subtitle, wedding/
    // Satsang/Ganesh Chaturthi scrollers, comparison, live builder and "how
    // it works") reproduced here so the *raw* HTML response a non-JS
    // crawler or SEO auditor sees already carries 400+ words of genuine,
    // keyword-relevant content instead of the bare h1 + empty shell they'd
    // otherwise get before React mounts — Seobility flagged the bare-shell
    // version as thin/empty entry-page content. Keep in sync with
    // LandingPage.jsx the same way `h1` above already has to be.
    //
    // A plain string renders as a <p>; a `{ h2 }` entry renders as an <h2> —
    // see setRootContent in server/index.js and api/render.js. This gives a
    // non-JS crawler a real H1 → H2 → paragraph hierarchy in the raw HTML,
    // not just a flat wall of text under one heading.
    body: [
      "InviteMyPeople is the digital wedding invitation maker India families turn to when a printed card, or a forwarded WhatsApp video, no longer feels like enough. Every invitation is interactive, mobile-first and genuinely unforgettable — built to open like a story, not just be glanced at once and forgotten. Whether you're planning a wedding, a Guruji Satsang, a Ganesh Chaturthi celebration or any occasion in between, one link turns into a tap-to-open envelope reveal, a scratch-to-reveal card, and a live guest list your whole event runs on.",
      { h2: 'A Digital Wedding Invitation Maker Built for Indian Celebrations' },
      'Browse interactive digital wedding invitations across Hindu, Muslim, Sikh and more traditions, each with an envelope-reveal animation, a gold-foil scratch card, and interactive RSVP tracking that records attendance, guest counts, song requests and blessings without a single phone call. As a digital wedding invitation maker India hosts trust for every function — Haldi, Sangeet, the wedding ceremony, Reception — each event keeps its own date, time and venue, all living on one polished, mobile-first invitation.',
      { h2: 'A Guruji Satsang Invite Online, With a Devotional Touch' },
      "Looking for a Guruji Satsang invite online that still feels personal? Our devotional templates pair Guruji's photo with a Divine Blessing scratch card and the same interactive RSVP tracking used across the platform, so hosts always know who's attending before the day arrives. Ganesh Chaturthi invitations open with a curtain-opening darshan reveal, the full puja muhurat, and a blessing wall guests can sign — every template fully interactive and built mobile-first.",
      { h2: 'More Than a Card — A Wedding Website Builder With a Live Dashboard' },
      "Unlike a static card, InviteMyPeople doubles as a wedding website builder: pick a template in our Invitation Builder, fill in your names, dates and venue, and watch a live phone preview update instantly as you type, so you see exactly what your guests will see before you publish. Every invitation stays interactive and editable long after it's sent — update the date, venue or any detail instantly, and everyone holding the link sees the change immediately, with no reprinting or re-recording required. Behind every link sits a private host dashboard with real-time interactive RSVP tracking, downloadable guest lists for catering and planning, and automated pre-event summaries, so nothing gets lost in a spreadsheet or a scattered WhatsApp thread.",
      { h2: 'Why Hosts Choose InviteMyPeople' },
      "Every InviteMyPeople invitation ships cost-effective, eco-friendly and mobile-first, backed by ready-made templates across every tradition and 2 free revisions — everything a paper card or a WhatsApp forward could never be. Pricing is all-inclusive, with no per-guest or courier costs added on, so a celebration that's as unforgettable as the day itself never has to start with a complicated setup.",
    ],
  },
  '/about': {
    title: 'About InviteMyPeople | Guest Management, Reinvented',
    description:
      'Why we built InviteMyPeople — a real-time guest management dashboard for weddings and events, wrapped in a beautiful, mobile-first invitation experience.',
    ogTitle: 'About InviteMyPeople — Invitations That Bring Everyone Together',
    ogDescription:
      'The story behind InviteMyPeople — why we built a real-time guest management dashboard wrapped in a beautiful, mobile-first invitation experience.',
    h1: 'Invitations That Bring Everyone Together',
    // Mirrors AboutPage.jsx's own paragraph copy word-for-word (see
    // STATIC_ROUTES_SEO['/']'s identical comment above) so a non-JS crawler
    // reading the raw HTML shell sees the same story a visitor does, not a
    // bare h1 with no supporting content.
    body: [
      'InviteMyPeople turns the headache of event coordination into a seamless experience. We move beyond simple digital cards to give you a full-fledged guest management system, wrapped in a beautiful, custom-branded experience that works perfectly on every smartphone.',
      'Why we started: Managing guest lists, tracking who’s actually coming, and getting final headcounts shouldn’t be a full-time job. We were tired of spreadsheet chaos and fragmented WhatsApp chats. We built InviteMyPeople to bridge the gap between "sending an invite" and "managing an event"—offering hosts a real-time dashboard to track RSVPs, gather wishes, and download clean guest lists, all while giving guests a stunning, personalized experience.',
      'What you get: a complete guest management system with a live dashboard tracking every RSVP, headcount, and song request; one polished, mobile-first invitation page holding every event function—Haldi, Sangeet, Wedding, Reception—each with its own date, time, and venue; a live preview that updates instantly as you enter your details, so you see exactly what your guests will see before you publish; and finalized guest lists you can download from your private host dashboard for catering and planning.',
      'What we believe: your time is better spent celebrating than chasing RSVPs. We obsess over making the behind-the-scenes of your event effortless, so you can focus on the big day. Hosts trust us to manage the logistics of their most important moments.',
    ],
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
  '/privacy': {
    title: 'Privacy Policy | InviteMyPeople',
    description:
      'How InviteMyPeople collects, uses, and protects your personal information, event details, and guest RSVP data.',
    ogTitle: 'Privacy Policy — InviteMyPeople',
    ogDescription:
      'How InviteMyPeople collects, uses, and protects your personal information, event details, and guest RSVP data.',
    h1: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms & Conditions | InviteMyPeople',
    description:
      'The rules and regulations for using InviteMyPeople’s self-service digital invitation builder and hosting platform.',
    ogTitle: 'Terms & Conditions — InviteMyPeople',
    ogDescription:
      'The rules and regulations for using InviteMyPeople’s self-service digital invitation builder and hosting platform.',
    h1: 'Terms & Conditions',
  },
  '/refund': {
    title: 'Refund & Cancellation Policy | InviteMyPeople',
    description:
      'When a refund applies for InviteMyPeople digital invitation purchases, including technical failures and duplicate charges.',
    ogTitle: 'Refund & Cancellation Policy — InviteMyPeople',
    ogDescription:
      'When a refund applies for InviteMyPeople digital invitation purchases, including technical failures and duplicate charges.',
    h1: 'Refund & Cancellation Policy',
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
