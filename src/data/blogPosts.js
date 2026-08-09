// Blog content — a lightweight, hand-maintained content type distinct from
// the template data files (satsangTemplatesData.js, ganeshTemplatesData.js):
// posts are long-form editorial copy, not shareable invitation designs, so
// they live in their own array here rather than being folded into
// routesSeo.js's STATIC_ROUTES_SEO (which would bloat fast once more posts
// are added).
//
// Plain data only, no React/lucide imports — this file is imported by Node
// code too (server/index.js, api/render.js, api/sitemap.js), same
// import-safety rule routesSeo.js documents for itself.
//
// Each post's `body` uses the same block scheme as routesSeo.js's
// STATIC_ROUTES_SEO bodies, extended with one more shape: a `{ h3 }` entry
// renders as an <h3> (routesSeo.js only ever needed <h2>). See
// api/render.js's renderBodyBlock / server/index.js's renderBodyBlock for
// the SSR-shell renderer, and BlogPostPage.jsx for the live-page renderer —
// both read this same array, so a non-JS crawler and a real visitor always
// see identical article content, just like every other page on this site.
//
//   - a plain string            -> <p>
//   - { h2: '...' }             -> <h2>
//   - { h3: '...' }             -> <h3>
//   - [seg, seg, ...]           -> <p> whose segments are plain text or a
//                                  { text, href } internal link (<a>/<Link>)
export const BLOG_POSTS = [
  {
    slug: 'how-to-collect-wedding-rsvps-whatsapp-india',
    date: '2026-08-09',
    readingTime: '8 min read',
    title: 'How to Collect Wedding RSVPs via WhatsApp in India (Without Spreadsheet Chaos)',
    description:
      'Learn how modern Indian couples are using interactive digital wedding invitations and automated WhatsApp RSVP tracking to manage guest lists effortlessly.',
    excerpt:
      'A WhatsApp broadcast list was never built to be an RSVP system. Here’s how interactive digital invitations replace the spreadsheet chaos with a live, per-function guest list.',
    h1: 'How to Collect Wedding RSVPs via WhatsApp in India (Without Spreadsheet Chaos)',
    // Rendered as a real, styled button at the foot of the article (see
    // BlogPostPage.jsx) — kept as its own field, separate from `body`, so
    // its markup/styling can differ from a plain paragraph link while the
    // raw SSR shell (setRootContent) still gets a crawlable <a href> for it
    // via the trailing body paragraph below.
    cta: { label: 'Create your own interactive wedding invite now', href: '/create' },
    body: [
      "Every wedding season, thousands of Indian couples try to track their guest list through a tangle of WhatsApp forwards, phone calls, and a spreadsheet that's already out of date by the time anyone opens it. It works, technically — right up until the caterer needs a final headcount three days before the Sangeet and nobody can say with certainty who's actually coming. There's a better way, and it doesn't involve begging two hundred relatives to reply to a broadcast list. Modern hosts are switching to a digital wedding invitation maker India couples increasingly trust specifically because it replaces that entire manual process with interactive RSVP tracking that runs itself, quietly, from the day the invitation goes out to the morning of the wedding.",

      { h2: "Why a WhatsApp Broadcast Isn't a Real RSVP System" },
      "A WhatsApp group or broadcast list is brilliant for sharing news. It's a poor tool for collecting structured answers from two hundred people scattered across a dozen family threads, three cities, and at least one uncle who never opens a forwarded message until the day before the event. Every host who has tried it hits the same wall: replies arrive in a different format from everyone — \"we're coming\", \"yes both of us plus kids\", a thumbs-up emoji with no name attached — and someone still has to manually read every single one and transcribe it into a spreadsheet by hand.",

      { h3: "The \"Reply If You're Coming\" Problem" },
      "Asking guests to simply reply if they're attending sounds efficient, but it puts the entire burden of formatting a useful answer on the guest — and most guests don't know you need their exact headcount, or which specific function they're attending. A grandmother replying \"yes, we'll be there\" doesn't tell you if that's two people or six, or whether \"there\" means the wedding, the reception, or both.",

      { h3: 'When the Spreadsheet Falls Behind' },
      "Even a diligent host copying replies into a spreadsheet by hand falls behind within days. Messages get buried in a fast-moving group chat, guests reply days apart, and by the time the final numbers matter — for catering, for seating, for the return gifts — the spreadsheet and reality have quietly drifted apart. It isn't a discipline problem. It's the wrong tool for the job.",

      { h2: 'What Interactive RSVP Tracking Actually Looks Like' },
      [
        'An interactive digital wedding invitation flips the process around. Instead of a guest replying in free text and a host transcribing it later, the guest taps to respond directly on the invitation itself — choosing whether they’re attending, entering their guest count, adding a song request or a blessing — and that response lands, already structured, in the host’s own dashboard the instant it’s submitted. No transcription, no guesswork, no "wait, was that a yes?" moment three days before the wedding. It’s the same interactive RSVP tracking running quietly underneath every ',
        { text: 'digital wedding invitation', href: '/weddings' },
        ' on InviteMyPeople.',
      ],

      { h3: 'One Invitation Link Guests Actually Open' },
      [
        "Because the invitation is genuinely interactive — an envelope-reveal animation, a gold-foil scratch card, a real page instead of a forwarded video — guests are far more likely to actually open it and respond, rather than scrolling past yet another wedding clip in a group chat. This is also where a proper ",
        { text: 'wedding website builder', href: '/create' },
        ' earns its keep: every function of the wedding, from Haldi to Reception, lives on the same link, each with its own date, time and venue, so guests always know exactly which events they’re being asked to RSVP for.',
      ],

      { h3: 'A Host Dashboard That Updates Itself' },
      "Behind every one of those taps sits a private host dashboard, updating in real time as responses come in. There's nothing to refresh, nothing to reconcile at the end of the week — the attendance count, the guest breakdown per function, and every song request or blessing a guest leaves are all sitting in one place the moment they're submitted, ready to download whenever a caterer or planner asks for the latest number.",

      { h2: 'How to Set Up WhatsApp RSVP Collection the Smart Way' },
      'Moving from a group chat to interactive RSVP tracking takes less time than most hosts expect — most invitations go from a blank template to a shareable link in under half an hour.',

      { h3: 'Step 1 — Build Your Invitation' },
      'Pick a template and fill in your names, dates and venue in a live Invitation Builder. A phone preview updates the moment you type, so you see exactly what your guests will see before anything is public.',

      { h3: "Step 2 — Add Every Function, Not Just the Wedding" },
      "List each event separately — Haldi, Mehndi, Sangeet, the wedding ceremony, Reception — with its own date, time and venue. This is what lets a guest RSVP to the Sangeet and the Reception separately, instead of you having to guess which functions a one-word reply was actually meant for.",

      { h3: 'Step 3 — Share One Link on WhatsApp' },
      "Once it's live, share the single link the same way you always have — on WhatsApp, in the family group, wherever your guests already are. The difference is entirely in what happens after someone opens it.",

      { h3: 'Step 4 — Watch RSVPs Land in Your Dashboard' },
      "Every tap a guest makes — attending or not, headcount, song request, a blessing for the couple — flows straight into your private host dashboard in real time. Download the guest list whenever your caterer or planner needs the latest number, without opening a single spreadsheet by hand.",

      { h2: 'Common Mistakes Couples Make Tracking Wedding RSVPs Manually' },
      "The most common mistake is treating one WhatsApp thread as the RSVP system for every function of the wedding, when guests actually need to answer separately for the Mehndi, the Sangeet and the Reception. A close second is waiting until the week of the wedding to start chasing replies, instead of sending the invitation early enough that interactive RSVP tracking has time to do its job passively, with no follow-up calls needed at all. And a quieter mistake: never actually closing the loop with guests who haven't responded, because there's no dashboard showing who's still pending — just a scroll back through months of chat history to guess.",

      { h2: 'Why This Matters More for Multi-Function Indian Weddings' },
      "A single-day wedding might get away with one simple RSVP count. A multi-day Indian wedding with Haldi, Mehndi, Sangeet, the wedding ceremony and Reception genuinely can't — the caterer for an intimate Mehndi needs a completely different headcount than the one for a five-hundred-guest Reception hall. Interactive RSVP tracking that separates responses by function, not just by guest, is the difference between an accurate headcount for every single event and one blended, unreliable number covering all of them at once.",

      { h2: 'Frequently Asked Questions About Digital Wedding RSVP Tracking' },
      { h3: 'Do My Guests Need to Download an App?' },
      'No. The entire invitation, including the RSVP form, is a mobile-first web page that opens straight from the link in any browser, on any phone — nothing to install, nothing to sign up for.',

      { h3: 'Can I Still Change Details After Sending the Invitation?' },
      "Yes. If a venue or timing changes after the invitation is already out, update it once and everyone holding the link sees the change immediately, with no resending and no reprinting a card.",

      { h3: 'Is This Only Useful for Large Weddings?' },
      "Interactive RSVP tracking helps at any guest count, but it becomes essential past roughly fifty guests spread across multiple functions — the point at which a WhatsApp thread alone genuinely can't keep an accurate, per-event headcount without someone losing a Sunday to transcribing replies by hand.",

      [
        'Whether you’re planning an intimate Mehndi or a five-function wedding spread across a week, an interactive digital wedding invitation replaces the group-chat guesswork with a real, live guest list. It’s the same interactive RSVP tracking behind every InviteMyPeople wedding invitation — and the same wedding website builder that lets you edit every detail long after the invitation is already in your guests’ hands. Browse ',
        { text: 'digital wedding invitations', href: '/weddings' },
        ' across every tradition, or read more ',
        { text: 'about how InviteMyPeople works', href: '/about' },
        ' before you start.',
      ],
    ],
  },
]

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null
}

// SEO shape for an individual post — matches STATIC_ROUTES_SEO's per-route
// shape exactly (title/description/ogTitle/ogDescription/h1/body) so it can
// be handed straight to <SEO>, setRootContent's `seo` argument, and the
// sitemap without any extra mapping at each call site.
export function blogPostSeo(post) {
  return {
    title: post.title,
    description: post.description,
    ogTitle: post.title,
    ogDescription: post.description,
    h1: post.h1,
    body: post.body,
  }
}

// SEO + raw-SSR content for the /blog listing route itself. Computed from
// BLOG_POSTS rather than hand-written in routesSeo.js's STATIC_ROUTES_SEO,
// so a non-JS crawler's raw HTML always lists every published post, even
// the ones added after this function was last touched.
export function blogListSeo() {
  return {
    title: 'Wedding & Event Planning Blog | InviteMyPeople',
    description:
      'Practical guides on digital wedding invitations, WhatsApp RSVP tracking, and guest management for Indian weddings, Guruji Satsangs & more.',
    ogTitle: 'The InviteMyPeople Blog',
    ogDescription:
      'Guides on interactive RSVP tracking, digital wedding invitations, and guest management for hosts planning weddings, Guruji Satsangs and more.',
    h1: 'The InviteMyPeople Blog',
    body: [
      'Practical, no-fluff guides for hosts planning a wedding, a Guruji Satsang, or a Ganesh Chaturthi celebration — written by the team building the digital wedding invitation maker India couples use to replace spreadsheet chaos with a live guest list.',
      ...BLOG_POSTS.map((post) => [{ text: post.title, href: `/blog/${post.slug}` }]),
    ],
  }
}

export function formatBlogDate(isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
