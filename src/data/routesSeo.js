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

// Real, always-present internal links — stamped into the raw HTML shell
// alongside `h1`/`body` below (see setRootContent in server/index.js and
// api/render.js) so a non-JS crawler finds real <a href> internal links to
// every core route — live and coming-soon — on every single static page's
// *raw* response, not just once React mounts and renders SiteHeader/
// SiteFooter. Deliberately broader than SiteFooter.jsx's own "Quick Links"
// column (which stays curated to the live occasions, for human visitors) —
// this list's job is crawlability, not the footer's UX; 14 links here plus
// the contextual links inside HOMEPAGE_SEO_BODY below comfortably clears
// the 15+ internal links Seobility expects to find without JS.
export const SITE_NAV_LINKS = [
  { href: '/weddings', label: 'Wedding Invitations' },
  { href: '/guruji-satsangs', label: 'Guruji Satsang Invitations' },
  { href: '/templates/ganesh-chaturthi', label: 'Ganesh Chaturthi Invitations' },
  { href: '/create', label: 'Build Your Invitation' },
  { href: '/about', label: 'About Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/refund', label: 'Refund Policy' },
  ...COMING_SOON_ROUTES.map((o) => ({ href: `/${o.slug}`, label: o.label })),
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
// The homepage's rich, keyword-relevant narrative copy — the single source
// of truth for BOTH the raw, pre-hydration SSR HTML (via
// STATIC_ROUTES_SEO['/'].body below, read by server/index.js and
// api/render.js's setRootContent) AND the real, permanent "About
// InviteMyPeople" section LandingPage.jsx renders near the bottom of the
// page. Earlier revisions only injected this into the raw SSR shell, which
// React's `createRoot(...).render()` (not hydrateRoot — see api/render.js's
// comment) fully replaces on mount, so a JS-executing crawler (most SEO
// auditors, Googlebot) never actually saw it once the real page took over —
// only the initial, pre-JS response did. Exporting one shared array and
// having LandingPage.jsx render it directly closes that gap permanently:
// whatever a non-JS crawler sees before React mounts is now exactly what
// everyone else sees after, with no risk of the two drifting apart the way
// hand-duplicated copy in two files eventually would.
//
// A plain string renders as a <p>; a `{ h2 }` entry renders as an <h2> in
// the raw SSR shell (setRootContent) or an <h3> in LandingPage.jsx's own
// section (which already has its own <h2> above this content, one level
// deeper than the flat pre-hydration shell). Either way: a real H1 → H2 →
// (H3 →) paragraph hierarchy, not a flat wall of text under one heading.
//
// The trailing "How Digital Invites for Weddings & Events Work" and
// "Frequently Asked Questions" entries exist for the same reason as the
// rest of this array: the real, interactive How It Works/FAQ sections
// further up the page (STEPS/FAQS below) only render once React mounts,
// so a non-JS crawler's raw response never saw them — only this array's
// ~410 words did, still short of Seobility's recommended depth for an
// entry page. Deliberately reworded from STEPS/FAQS rather than copied
// verbatim, so the page doesn't read as literally repeating itself twice
// to a human visitor scrolling past both sections.
//
// A paragraph entry can also be an array of segments instead of a plain
// string — each segment is either a plain string or a `{ text, href }`
// internal link. setRootContent (server/index.js, api/render.js) renders
// those as real <a href> tags inside the <p>; LandingPage.jsx's own
// section renders them as real react-router <Link>s. This gives the
// homepage's body copy actual contextual internal links (not just the
// flat SITE_NAV_LINKS nav above) in both the raw SSR response and the
// live page — e.g. "digital wedding invitations" linking to /weddings
// right where that phrase naturally occurs, rather than only in a nav
// list divorced from the sentence that justifies the link.
export const HOMEPAGE_SEO_BODY = [
  "InviteMyPeople is the digital wedding invitation maker India families turn to for digital invites for weddings & events. A printed card can't update itself. A forwarded WhatsApp video isn't interactive. Every InviteMyPeople invitation is different: mobile-first, genuinely unforgettable, and built to open like a story rather than be glanced at once and forgotten. Whether you're planning a wedding, a Guruji Satsang, or a Ganesh Chaturthi celebration, one link does it all. It becomes a tap-to-open envelope reveal, a scratch-to-reveal card, and a live guest list your whole event runs on.",
  { h2: 'A Digital Wedding Invitation Maker Built for Indian Celebrations' },
  [
    'Browse interactive ',
    { text: 'digital wedding invitations', href: '/weddings' },
    ' across Hindu, Muslim, Sikh and more traditions. Each one opens with an envelope-reveal animation and a gold-foil scratch card. Each one ships with interactive RSVP tracking built in, recording attendance, guest counts, song requests and blessings — without a single phone call. As the digital wedding invitation maker India hosts trust, we cover every function: Haldi, Sangeet, the wedding ceremony, Reception. Each event keeps its own date, time and venue, all living on one polished, mobile-first invitation.',
  ],
  { h2: 'A Guruji Satsang Invite Online, With a Devotional Touch' },
  [
    'Looking for a ',
    { text: 'Guruji Satsang invite online', href: '/guruji-satsangs' },
    " that still feels personal? Our devotional templates pair Guruji's photo with a Divine Blessing scratch card. They use the same interactive RSVP tracking as every other template, so hosts always know who's attending before the day arrives. ",
    { text: 'Ganesh Chaturthi invitations', href: '/templates/ganesh-chaturthi' },
    ' open differently: a curtain-opening darshan reveal, the full puja muhurat, and a blessing wall guests can sign. Every template stays fully interactive and mobile-first.',
  ],
  { h2: 'More Than a Card — A Wedding Website Builder With a Live Dashboard' },
  [
    'Unlike a static card, InviteMyPeople doubles as a ',
    { text: 'wedding website builder', href: '/weddings' },
    '. Ready to ',
    { text: 'create your own custom invite', href: '/create' },
    "? Pick a template in our Invitation Builder. Fill in your names, dates and venue. Watch a live phone preview update instantly as you type, so you see exactly what your guests will see before you publish. Every invitation stays interactive and editable long after it's sent. Update any detail instantly, and everyone holding the link sees the change right away — no reprinting, no re-recording. Behind every link sits a private host dashboard with real-time interactive RSVP tracking and downloadable guest lists. Automated pre-event summaries mean nothing gets lost in a spreadsheet or a scattered WhatsApp thread.",
  ],
  { h2: 'Why Hosts Choose InviteMyPeople' },
  [
    "Every InviteMyPeople invitation ships cost-effective, eco-friendly and mobile-first. It's backed by ready-made templates across every tradition, plus 2 free revisions — everything a paper card or a WhatsApp forward could never be. Pricing is all-inclusive, with no per-guest or courier costs added on. A celebration that's as unforgettable as the day itself never has to start with a complicated setup. Curious how it all started? Read more ",
    { text: 'about our platform', href: '/about' },
    '.',
  ],
  { h2: 'How Digital Invites for Weddings & Events Work' },
  'Getting your own digital invitation takes four simple steps, from picking a template to sharing a live link with your guests.',
  { h2: 'Step 1: Pick a Template' },
  'Choose a design for a wedding, a Guruji Satsang, or a Ganesh Chaturthi celebration. Every template is fully interactive from the moment you open it.',
  { h2: 'Step 2: Fill In Your Details' },
  'Add your names, dates and venue in the Invitation Builder. Add every function — Haldi, Sangeet, the ceremony, Reception — each with its own time and place.',
  { h2: 'Step 3: Watch the Live Preview' },
  'A phone preview updates the moment you type. You see exactly what your guests will see, before you publish anything.',
  { h2: 'Step 4: Publish and Share' },
  'Pay securely online. Your finished, shareable invitation link goes live instantly — ready to send on WhatsApp, or anywhere else your guests are.',
  { h2: 'Frequently Asked Questions About Our Digital Invites' },
  'Real answers to the questions hosts ask most before building their own wedding invitation, Guruji Satsang invite, or Ganesh Chaturthi invitation.',
  { h2: 'Do Guests Need to Install an App?' },
  'No. Every invitation is a mobile-first web page. It opens straight from the link, in any browser, on any phone.',
  { h2: 'How Do RSVPs and Guest Tracking Work?' },
  "Guests tap to respond right on the invitation itself. Their attendance, guest count, and wishes flow straight into your private host dashboard — the same interactive RSVP tracking behind every InviteMyPeople template.",
  { h2: 'Can Details Change After the Invitation Is Live?' },
  'Yes. Edit any detail instantly, at any time. Everyone holding the link sees the update immediately, with no reprinting or resending needed.',
  { h2: 'What Does a Digital Invite Cost?' },
  'One flat, all-inclusive price covers your whole invitation, every event on it, and 2 free revisions. There are no hidden per-guest or printing fees, on any template for any occasion.',
  { h2: 'One Platform for Every Celebration' },
  'Weddings, Guruji Satsangs, and Ganesh Chaturthi celebrations are live today, with birthdays, engagements, baby showers, housewarmings, corporate events, and anniversaries on the way. Every occasion runs on the same live builder, the same interactive RSVP tracking, and the same private host dashboard — one platform, built for celebrations across India.',
]

const STATIC_ROUTES_SEO = {
  '/': {
    title: 'InviteMyPeople | Digital Invites for Weddings & Events',
    description:
      'Interactive digital invitations for weddings, Guruji Satsangs & more — budget-friendly, delivered on WhatsApp in 30 minutes.',
    ogTitle: 'InviteMyPeople | Stunning Interactive Digital Invitations',
    ogDescription:
      'Budget-friendly, interactive digital invitations for weddings, Guruji Satsangs, birthdays, engagements, baby showers, housewarmings, corporate events & anniversaries — delivered on WhatsApp in 30 minutes.',
    h1: 'Digital Invitations as unforgettable as your celebration',
    // See HOMEPAGE_SEO_BODY above for what this is and why it's shared with
    // LandingPage.jsx's own "About InviteMyPeople" section instead of being
    // duplicated here.
    body: HOMEPAGE_SEO_BODY,
  },
  '/about': {
    title: 'About InviteMyPeople | Guest Management, Reinvented',
    description:
      'Why we built InviteMyPeople — a real-time guest management dashboard for weddings and events, wrapped in a beautiful, mobile-first invitation experience.',
    ogTitle: 'About InviteMyPeople — Invitations That Bring Everyone Together',
    ogDescription:
      'The story behind InviteMyPeople — why we built a real-time guest management dashboard wrapped in a beautiful, mobile-first invitation experience.',
    h1: 'Invitations That Bring Everyone Together',
    // Mirrors AboutPage.jsx's own section copy and heading structure (see
    // STATIC_ROUTES_SEO['/']'s identical comment above, including the
    // string/`{ h2 }` mix) so a non-JS crawler reading the raw HTML shell
    // sees the same story, under the same headings, a visitor does — not a
    // bare h1 with no supporting content.
    body: [
      'InviteMyPeople turns the headache of event coordination into a seamless experience. We move beyond simple digital cards to give you a full-fledged guest management system, wrapped in a beautiful, custom-branded experience that works perfectly on every smartphone, whether you found us searching for a digital wedding invitation maker India venues and planners already recommend, or a Guruji Satsang invite online for a more devotional occasion. Every template we build, across every occasion, shares the same foundation: interactive design up front, real guest management underneath.',
      { h2: 'Why we started' },
      'Managing guest lists, tracking who’s actually coming, and getting final headcounts shouldn’t be a full-time job. We were tired of spreadsheet chaos and fragmented WhatsApp chats. We built InviteMyPeople to bridge the gap between "sending an invite" and "managing an event" — offering hosts a real-time dashboard to track RSVPs, gather wishes, and download clean guest lists, all while giving guests a stunning, personalized experience.',
      { h2: 'What you get' },
      'A complete guest management system with a live dashboard tracking every RSVP, headcount, and song request; one polished, mobile-first invitation page holding every event function — Haldi, Sangeet, Wedding, Reception — each with its own date, time, and venue; a live preview that updates instantly as you enter your details in our wedding website builder, so you see exactly what your guests will see before you publish; and finalized guest lists you can download from your private host dashboard for catering and planning. Interactive RSVP tracking runs underneath every template we offer, not just the wedding ones.',
      { h2: 'What we believe' },
      'Your time is better spent celebrating than chasing RSVPs. We obsess over making the behind-the-scenes of your event effortless, so you can focus on the big day. Hosts trust us to manage the logistics of their most important moments, from an intimate Satsang to a multi-day wedding with a hundred functions to track — and every one of those hosts builds their invitation themselves, in our live builder, without ever needing to brief a designer or wait on a revision.',
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
    // See STATIC_ROUTES_SEO['/']'s comment above for why this exists and
    // how the string/`{ h2 }` mix renders in the raw SSR HTML.
    body: [
      "InviteMyPeople is a digital wedding invitation maker India couples turn to for a wedding invitation that does more than sit in a WhatsApp chat. Every design below is interactive and mobile-first, spanning Hindu, Muslim, Sikh and more traditions, so however your wedding is celebrated, there's a template built around it — not squeezed into a generic layout no one else got to try first.",
      { h2: 'A Digital Wedding Invitation Maker for Every Tradition' },
      'Each template opens with an envelope-reveal animation and a gold-foil scratch card before guests ever reach the details, and every single one ships with interactive RSVP tracking built in — attendance, guest counts, song requests and blessings all flow into your private host dashboard instead of a scattered set of phone calls and texts. Search by name or tradition above, or filter by wedding type, to find the design that matches your ceremony.',
      { h2: 'More Than a Card — A Wedding Website Builder You Can Edit Anytime' },
      "Pick a design you like and open it in our Invitation Builder, our self-service wedding website builder that lets you add every function — Haldi, Sangeet, the wedding ceremony, Reception — onto one polished, mobile-first page, each with its own date, time and venue. A live phone preview updates as you type, so you see exactly what your guests will see before you publish, and every detail stays editable after the link is live — no reprinting, no re-sending, no waiting on a reply.",
      { h2: 'Built for Every Budget' },
      "Pricing is all-inclusive, with no per-guest or courier costs added on, and every invitation includes 2 free revisions after it's live. Compared to a printed card or a forwarded WhatsApp video, a digital wedding invitation from InviteMyPeople stays interactive, editable and easy to track long after the day it's sent — and every response your guests submit is right there in your dashboard the moment they submit it, ready to download whenever your caterer or planner needs the latest headcount.",
    ],
  },
  '/guruji-satsangs': {
    title: 'Guruji Satsang Invitations | InviteMyPeople',
    description:
      "Devotional digital invitations for Guruji Satsangs — Guruji's photo, a Divine Blessing scratch card and RSVP, all built in.",
    ogTitle: 'Guruji Satsang Invitations — InviteMyPeople',
    ogDescription:
      'Devotional digital invitations for Guruji Satsangs, complete with a Divine Blessing scratch card and built-in RSVP tracking.',
    h1: 'Devotional Invitations for Guruji’s Satsang',
    body: [
      "Looking for a Guruji Satsang invite online that feels as devotional as the gathering itself? Our Satsang templates pair Guruji's photo with a Divine Blessing scratch card, a curated devotional palette, and the same interactive RSVP tracking used across every InviteMyPeople invitation, so hosts always know who's coming before the day arrives.",
      { h2: 'A Guruji Satsang Invite Online, Built With Devotion' },
      "Each template opens with a gentle reveal befitting a sacred gathering, carries Guruji's photo and a greeting of your choosing, and includes full Mahaprasad details alongside the Satsang's date, time and venue — all on one shareable, mobile-first link. Guests tap to RSVP directly on the invitation itself, and every response, headcount and blessing flows straight into your private host dashboard.",
      { h2: 'Devotional Design, Practical Guest Management' },
      'Behind the devotional design sits the same interactive RSVP tracking and downloadable guest list every InviteMyPeople host relies on for planning Mahaprasad and seating — no spreadsheet chasing, no missed calls. Pick a template, personalize it in our Invitation Builder with a live preview, and publish a link ready to share on WhatsApp with your entire Satsang community.',
      { h2: 'From Browsing to Sharing in Minutes' },
      "Selecting a Guruji Satsang invite online shouldn't take longer than the Satsang itself. Choose a template, add your family name, Guruji's greeting, and the event details in the builder, watch the live preview update with every change, then pay securely online — your finished link is ready to share the moment checkout completes, with no waiting on a reply before you can send it out.",
      { h2: "Every Detail Editable, Long After It's Sent" },
      'If the date, time or venue changes, update it once and everyone holding the link sees the change immediately — no re-printing, no re-recording, no resending to every devotee individually. Pricing is all-inclusive, with 2 free revisions included on every invitation, so a last-minute change to the Mahaprasad timing or a shift in venue never means starting your Guruji Satsang invite online over from scratch.',
    ],
  },
  '/templates/ganesh-chaturthi': {
    title: 'Ganesh Chaturthi Invitations | InviteMyPeople',
    description:
      'Immersive digital Ganesh Chaturthi invitations — a curtain-opening darshan reveal, full puja muhurat, interactive RSVP and a blessing wall.',
    ogTitle: 'Ganesh Chaturthi Invitations — InviteMyPeople',
    ogDescription:
      'Immersive, photo-rich digital invitations to welcome Ganpati Bappa — curtain-opening darshan reveal, puja muhurat, interactive RSVP and a blessing wall.',
    h1: 'Immersive Ganesh Chaturthi Invitations to Welcome Bappa',
    body: [
      'Welcome Ganpati Bappa home with an invitation as vivid as the celebration itself. Every Ganesh Chaturthi template on InviteMyPeople opens with a curtain-opening darshan reveal, carries the full puja muhurat, and includes a blessing wall guests can sign — genuinely interactive, not just a photo forwarded on WhatsApp.',
      { h2: 'An Immersive, Photo-Rich Ganesh Chaturthi Invitation' },
      "Each design is built mobile-first around Ganpati's idol photo, a curtain-opening reveal animation, and a devotional colour palette drawn from marigold, vermilion and gold. Puja muhurat, aarti timings, and visarjan details all sit on one shareable link, alongside interactive RSVP tracking that records who's attending, how many are coming, and the blessings they leave on your wishes wall.",
      { h2: 'A Live Guest Dashboard for Your Whole Celebration' },
      "Personalize a template in our Invitation Builder — a live phone preview updates instantly as you add your family name, dates and venue, so you see exactly what your guests will see before you publish. Once it's live, every RSVP, headcount and blessing flows into your private host dashboard, ready to download for prasad and seating planning, the same interactive RSVP tracking that powers every InviteMyPeople invitation, wedding or otherwise.",
      { h2: 'A Blessing Wall Guests Actually Use' },
      'Every template includes an interactive blessing wall where visitors can leave their wishes for Bappa and your family alongside their RSVP, turning a one-time card into something guests keep coming back to before the visarjan. Nothing here is a static graphic — every reveal, every form, every wall of blessings is built to be tapped, filled in, and shared.',
      { h2: 'Ready to Share in Minutes' },
      'Pricing is all-inclusive, with no per-guest costs, and every invitation includes 2 free revisions — so updating a muhurat time or a venue after the fact never means starting over. Share one link on WhatsApp and your entire community can RSVP, view the puja details and leave their blessings in one place, right up until visarjan day, with nothing lost between the first darshan and the final aarti.',
    ],
  },
  '/create': {
    title: 'Invitation Builder | InviteMyPeople',
    description:
      'Build your own digital invitation — pick a style, add your names, date and venue, and watch a live preview update instantly.',
    ogTitle: 'Invitation Builder — InviteMyPeople',
    ogDescription:
      'Pick a template style, fill in your details, and watch your invitation come to life in a live preview — then send it to us on WhatsApp to finalize.',
    h1: 'Build Your Invitation, Live',
    body: [
      "The Invitation Builder is InviteMyPeople's self-service wedding website builder — pick a style, fill in your details, and watch a live phone preview update instantly as you type, so you always see exactly what your guests will see, before you ever publish.",
      { h2: 'A Wedding Website Builder That Updates as You Type' },
      "Choose from templates across weddings, Guruji Satsangs and Ganesh Chaturthi, then add your names, dates, venues and photos directly in the builder. Every function of your celebration — Haldi, Sangeet, the ceremony, Reception — gets its own card on one polished, mobile-first page, and the live preview beside the form updates instantly with each change, so nothing is ever a surprise once it's live.",
      { h2: 'Interactive RSVP Tracking, Built In From the Start' },
      "Every invitation built here ships with interactive RSVP tracking already wired in — guests tap to respond right on the invitation, and attendance, guest counts, song requests and blessings all land in your own private host dashboard. Once you're happy with how it looks, pay securely online and your finished, shareable invitation link is ready instantly — no forms with us, no waiting on a reply, no back-and-forth before your guests can start responding.",
      { h2: 'One Dashboard for Everything After You Publish' },
      'Once your invitation is live, the same dashboard that showed your live preview becomes your guest management home base — track RSVPs as they arrive, download a clean guest list for your caterer, and read every wish and blessing your guests leave behind, all without opening a spreadsheet or chasing a single phone call.',
      { h2: "Nothing Is Locked In Until You Publish" },
      "Every detail stays editable live in the builder before you pay, and every invitation still includes 2 free revisions after it's live — message us on WhatsApp with anything you'd like changed and we'll update it and send the link back. Pricing is all-inclusive, with no per-guest or courier costs added on, whether you're building a wedding website, a Guruji Satsang invite online, or a Ganesh Chaturthi invitation.",
    ],
  },
  '/privacy': {
    title: 'Privacy Policy | InviteMyPeople',
    description:
      'How InviteMyPeople collects, uses, and protects your personal information, event details, and guest RSVP data.',
    ogTitle: 'Privacy Policy — InviteMyPeople',
    ogDescription:
      'How InviteMyPeople collects, uses, and protects your personal information, event details, and guest RSVP data.',
    h1: 'Privacy Policy',
    // Condensed, prose-form mirror of PrivacyPolicyPage.jsx's own
    // intro/SECTIONS content (bullet lists flattened into a paragraph each,
    // since setRootContent only renders <p>/<h2> — the real page still
    // shows the nicer bulleted layout to any JS-rendering visitor).
    body: [
      "At InviteMyPeople, accessible from invitemypeople.com, one of our main priorities is the privacy of our visitors and users. InviteMyPeople is a digital wedding invitation maker and guest management platform used by hosts planning weddings, a Guruji Satsang invite online, and Ganesh Chaturthi celebrations across India. This Privacy Policy explains the types of information we collect, whether you're a host building an invitation or a guest submitting an RSVP, and how we use it.",
      { h2: 'Information We Collect' },
      'Personal information such as your name, email address, phone number, and payment details — processed securely via Razorpay — when you create an account or purchase an invitation package. Event and guest data such as event titles, dates, venue locations, host details, and guest RSVP submissions, including names, attendance statuses, headcounts, song requests, and wishes, stored securely in our database. And automatically collected data such as browser type, IP address, device information, and usage analytics, gathered via tools like Google Analytics and Microsoft Clarity to help us improve the experience for every visitor.',
      { h2: 'How We Use Your Information' },
      'We use the information we collect to provide, operate, and maintain our digital invitation builder and hosting services; to process your transactions securely and send order confirmations; to send automated event reminders, host summaries, and RSVP notifications — including the pre-event guest list summary sent to the main host as part of our interactive RSVP tracking; and to analyze website traffic and user behavior so we can keep improving our templates and features.',
      { h2: 'How We Protect Your Information' },
      'We implement robust security measures — including encrypted database storage and secure payment gateways — to protect your personal information and event data against unauthorized access, alteration, or disclosure.',
      { h2: 'Contact Us' },
      'If you have additional questions or require more information about our Privacy Policy, our digital wedding invitation maker, or how your guest data is handled, contact us at invitemypeople@gmail.com and we will get back to you.',
    ],
  },
  '/terms': {
    title: 'Terms & Conditions | InviteMyPeople',
    description:
      'The rules and regulations for using InviteMyPeople’s self-service digital invitation builder and hosting platform.',
    ogTitle: 'Terms & Conditions — InviteMyPeople',
    ogDescription:
      'The rules and regulations for using InviteMyPeople’s self-service digital invitation builder and hosting platform.',
    h1: 'Terms & Conditions',
    // See '/privacy' above for why this mirrors TermsOfServicePage.jsx's
    // own content in condensed prose form rather than word-for-word.
    body: [
      "Welcome to InviteMyPeople! These terms and conditions outline the rules and regulations for the use of InviteMyPeople's website. By accessing this website and utilizing our self-service invitation builder, you accept these terms — they govern your use of the Invitation Builder itself, our published invitation links, our host dashboards, and every other feature of the platform, whether you're browsing templates as a digital wedding invitation maker, building a wedding website of your own, or managing RSVPs for a Guruji Satsang or Ganesh Chaturthi celebration.",
      { h2: 'Using Our Platform' },
      'You must be at least 18 years old, or possess legal parental or guardian consent, to use this platform and make purchases. You agree to provide accurate, current, and complete information during the invitation creation and checkout process. And you are solely responsible for the content, text, images, and media you upload or display through your customized digital invitations, whether that invitation is a wedding, a Guruji Satsang, or a Ganesh Chaturthi celebration.',
      { h2: 'Intellectual Property' },
      'Unless otherwise stated, InviteMyPeople and its licensors own the intellectual property rights for all templates, designs, graphics, and source code on the website. All intellectual property rights are reserved, and you may not copy, redistribute, or resell our core template designs without our explicit written permission.',
      { h2: 'Service Availability' },
      'InviteMyPeople provides digital invitation hosting and guest management services on an "as is" basis. While we strive for 99.9% uptime and reliable automated delivery, including WhatsApp links and pre-event emails, we are not liable for third-party service interruptions such as payment gateway downtime or mobile network delivery failures.',
      { h2: 'Changes to These Terms' },
      'We reserve the right to amend these terms at any time. By continuing to use the platform — our wedding website builder, our interactive RSVP tracking, or any Guruji Satsang invite online you generate through it — after changes are posted, you agree to be bound by the updated terms.',
    ],
  },
  '/refund': {
    title: 'Refund & Cancellation Policy | InviteMyPeople',
    description:
      'When a refund applies for InviteMyPeople digital invitation purchases, including technical failures and duplicate charges.',
    ogTitle: 'Refund & Cancellation Policy — InviteMyPeople',
    ogDescription:
      'When a refund applies for InviteMyPeople digital invitation purchases, including technical failures and duplicate charges.',
    h1: 'Refund & Cancellation Policy',
    // See '/privacy' above for why this mirrors RefundPolicyPage.jsx's own
    // content in condensed prose form rather than word-for-word.
    body: [
      "Thank you for choosing InviteMyPeople for your special celebrations. This policy covers every paid purchase made through InviteMyPeople's Invitation Builder — whether you're generating a digital wedding invitation, a Guruji Satsang invite online, or a Ganesh Chaturthi invitation — deployed to its own unique, live link the instant payment succeeds, with interactive RSVP tracking already switched on and ready for your guests.",
      { h2: 'Our Policy' },
      'Because our platform provides instant, digital, self-service software generation — where unique interactive invitation links and database slots are deployed immediately upon successful payment — our refund policy is structured accordingly. Once an invitation has been successfully paid for, generated, and published to a unique link, the service is considered fully rendered and consumed, so digital purchases and custom invitation fees are generally non-refundable.',
      { h2: 'Exceptions' },
      'We want you to be completely satisfied with your experience, so a refund may still be considered under two exceptional circumstances: a technical failure, where a system error or proven technical glitch on our end entirely prevented the generation of your invitation link after a successful payment transaction; or duplicate charges, where an accidental double charge processed by our payment gateway, Razorpay, will be fully refunded to your original payment method.',
      { h2: 'Requesting a Refund' },
      'If you experience any technical difficulties during your invitation creation or believe you qualify for an exception under our policy, please reach out to us immediately at support@invitemypeople.com with your payment transaction ID and event details — we are always happy to help resolve issues promptly, and we aim to respond within a few business days, keeping you updated by email throughout. This applies across every occasion we support, whether your invitation was built as a digital wedding invitation maker template, a Guruji Satsang invite online, or a Ganesh Chaturthi celebration — the same policy and the same support inbox handle all of them.',
    ],
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
// `h1` here has to match each template's actual rendered <h1> text
// word-for-word (see the STATIC_ROUTES_SEO comment above for why) — without
// it, every /satsang/:slug page's raw SSR HTML had no <h1> at all, since
// setRootContent (server/index.js, api/render.js) only fires when `seo.h1`
// is set. Satsang templates render one of three different things as their
// <h1>, depending on their bespoke layout (see satsang/layoutRegistry.js —
// keep this in sync with it):
//   - 'royal-peacock' / 'golden-temple-altar': the host family name
//     (RoyalPeacockExperience.jsx / GoldenTempleAltarExperience.jsx)
//   - 'saffron-lotus-serenity': the greeting line instead
//     (SaffronLotusExperience.jsx)
//   - no `layout` at all: the fixed "Satsang Invitation" heading, with the
//     family name appearing separately below it (LegacySatsangExperience.jsx)
export function satsangSeo(template) {
  const title = `${template.name} — Guruji Satsang | InviteMyPeople`
  const description = template.metaDescription || template.description
  let h1 = 'Satsang Invitation'
  if (template.layout === 'saffron-lotus-serenity') h1 = template.greeting?.line || 'Jai Guruji'
  else if (template.layout) h1 = template.host?.familyName || h1
  return { title, description, ogTitle: title, ogDescription: description, h1 }
}

// Every Ganesh Chaturthi bespoke layout (including LegacyGaneshExperience,
// via the shared GaneshCurtainReveal it renders — see
// ganesh/layoutRegistry.js) consistently uses the host family name as its
// <h1>, so no per-layout branching is needed here the way satsangSeo()
// above requires.
export function ganeshSeo(template) {
  const title = `${template.name} — Ganesh Chaturthi | InviteMyPeople`
  const description = template.metaDescription || template.description
  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    h1: template.host?.familyName || template.name,
  }
}
