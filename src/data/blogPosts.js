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
// STATIC_ROUTES_SEO bodies, extended with three more shapes: a `{ h3 }`
// entry renders as an <h3> (routesSeo.js only ever needed <h2>), a
// `{ cta }` entry renders as a real inline button mid-article (rather than
// a plain text link), and a `{ widget }` entry renders a hand-picked React
// component in place — currently only 'musicVibe' exists, see
// ../components/blog/MusicVibeWidget.jsx. See api/render.js's
// renderBodyBlock / server/index.js's renderBodyBlock for the SSR-shell
// renderer (both fall back to a plain crawlable <a>/<p> for `cta`/`widget`
// blocks — there's no server-side React to render the real component with),
// and BlogPostPage.jsx for the live-page renderer.
//
//   - a plain string            -> <p>
//   - { h2: '...' }             -> <h2>
//   - { h3: '...' }             -> <h3>
//   - { cta: { label, href } }  -> a real button <Link>, mid-article
//   - { widget: 'musicVibe' }   -> <MusicVibeWidget /> (blog-only, see
//                                  components/blog/MusicVibeWidget.jsx)
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
  {
    slug: 'add-custom-background-music-digital-invitations',
    date: '2026-08-09',
    readingTime: '7 min read',
    title: 'Set the Vibe: How to Add Custom Background Music to Your Digital Invitations',
    description:
      'Learn how to add a custom song to your digital wedding, sangeet or Guruji Satsang invitation on InviteMyPeople — searchable in seconds, with an instant 30-second preview before you apply it.',
    excerpt:
      'The first three seconds after a guest opens your invitation are mostly felt, not read. Here’s how to pick the right song — and how InviteMyPeople’s search-and-preview makes it a thirty-second decision.',
    h1: 'Set the Vibe: How to Add Custom Background Music to Your Digital Invitations',
    cta: { label: 'Pick your song and start building on /create', href: '/create' },
    body: [
      "A guest doesn't read your invitation before they feel it. In the half-second after they tap the envelope open, before a single word registers, sound has already told them something — that this is a wedding, or a Sangeet, or a Guruji Satsang; that it's joyful, or romantic, or reverent. Visuals set the scene, but music is what makes an invitation feel alive instead of looked at. That's the entire idea behind Background Music Selection on InviteMyPeople: a way to search for the exact song that matches your celebration, preview it instantly, and have it play the moment a guest opens your invite — without ever touching an audio file or a line of code.",

      { h2: 'Why Background Music Changes How an Invitation Feels' },
      "Two invitations can share the same photo, the same gold foil border, the same elegant script font — and still land completely differently, purely because of what a guest hears in the background. Silence reads as a webpage. A song reads as an occasion.",

      { h3: 'The First Three Seconds Guests Actually Feel' },
      "Attention is shortest in the first moment after a link opens. Before a guest has scrolled, read a date, or found the RSVP button, they've already absorbed the mood of your invitation from whatever's playing underneath it. A soft acoustic track says intimate wedding. A big, familiar Bollywood hook says the Sangeet is going to be loud and fun. A traditional aarti says take a breath, this one's devotional. Getting that first three seconds right does more emotional work than almost any other single design choice on the page.",

      { h3: "No Invitation Ever Opens in Silence" },
      "It's worth knowing what happens if you skip this step entirely: nothing goes silent. Every InviteMyPeople invitation plays something the moment a guest opens it — a soft, neutral default track steps in automatically if you never pick a song of your own. Choosing your own music isn't switching music on; it's replacing the generic default with something that's actually, unmistakably yours.",

      { h2: 'Choosing the Right Song for Each Kind of Celebration' },
      "Not every function calls for the same vibe, and a host planning several events under one invitation link often needs to think about this more than once.",

      { h3: 'Weddings — Romantic, Timeless, Personal' },
      "For the wedding ceremony itself, most hosts lean toward something warm and unhurried — a romantic classic, an instrumental version of a favourite song, or the track that was playing the night of the proposal. It should feel personal enough that a close friend would recognise it as \"so them\" the moment it starts.",

      { h3: 'Sangeets & Baraats — High-Energy, Familiar, Fun' },
      "A Sangeet or Baraat invitation earns a completely different choice: something high-energy and instantly familiar, a dance-floor hit everyone already knows the words to. This is the one function where a bold, popular pick almost always beats an obscure one — guests should recognise the song before they've even finished reading who's getting married.",

      { h3: 'Guruji Satsangs — Devotional, Calm, Respectful' },
      "A Guruji Satsang invitation calls for the opposite energy entirely — a traditional bhajan or aarti, calm and reverent, that sets a respectful tone before a guest has read a single detail about the gathering. Getting this one right matters just as much as getting a Sangeet's energy right; it's the same first-three-seconds effect, aimed at a completely different feeling.",

      { h2: 'How Song Search & Preview Works on InviteMyPeople' },
      [
        'This is the part hosts worry will be complicated, and it genuinely isn’t. The ',
        { text: 'Background Music Selection', href: '/create' },
        ' step inside the Invitation Builder is a single search box — type a song or an artist, and matching tracks appear as you type, each with its own album art and a one-tap 30-second preview, so you can hear a track before you ever commit to it.',
      ],

      { h3: 'Search Any Song or Artist' },
      "Start typing a title, an artist, or even part of a lyric, and results start appearing within moments — no separate music library to browse, no file to hunt down and upload from your phone.",

      { h3: 'Preview Before You Commit' },
      "Every result carries a tap-to-play 30-second preview, right there in the search results. Nothing gets applied to your invitation until you've actually heard it — and heard how it sits against your chosen template's mood, not just in isolation.",

      { h3: 'One Tap to Apply It to Your Invitation' },
      "Once a preview sounds right, one tap confirms it. That's the entire flow — search, preview, apply — and it's the same thirty-second decision whether you're picking a love song for the wedding page or a bhajan for the Satsang page.",

      { widget: 'musicVibe' },

      { h2: 'Step-by-Step: Adding Custom Music to Your Invitation' },
      "Here's the exact path from a blank invitation to one that plays your own song the moment a guest opens it.",

      { h3: 'Step 1 — Open the Builder' },
      [
        'Start (or open) your invitation in the ',
        { text: 'Invitation Builder', href: '/create' },
        ' and get to the Background Music Selection step — it sits alongside your other details like names, dates and venue, in the same guided flow.',
      ],

      { h3: 'Step 2 — Search for Your Song' },
      'Type the song or artist you have in mind into the search box. Results, complete with album art, start appearing as you type.',

      { h3: 'Step 3 — Preview and Confirm' },
      "Tap Preview 30s on any result to hear the clip before deciding. Once you've found the one, a single tap applies it to your invitation.",

      { h3: 'Step 4 — Share Your Invitation' },
      'Share your link the way you always would — WhatsApp, email, wherever your guests already are. Your song now plays automatically the moment anyone opens it.',

      { h2: 'Common Music Mistakes Hosts Make' },
      "The most avoidable mistake is picking a song purely from memory, without previewing it first — a track that sounds perfect in your head can feel oddly paced or too loud once it's actually playing under your invitation's design. A close second is using the same song across every function of a multi-event wedding; a Sangeet track playing under your Guruji Satsang invitation undercuts the tone you're trying to set. And it's easy to forget to actually test the invitation on a phone with the sound on before sending it out — the same quick check that catches a typo in the venue name catches a music choice that doesn't land the way you imagined.",

      { cta: { label: 'Try the music search on your own invitation', href: '/create' } },

      { h2: 'Frequently Asked Questions About Invitation Background Music' },
      { h3: 'Do I Have to Pick a Song?' },
      "No. Background Music Selection is entirely optional — if you skip it, your invitation still plays a soft, neutral default track automatically, so a guest never opens it to silence.",

      { h3: 'Will the Music Autoplay for Every Guest?' },
      "Yes. The moment a guest taps to open your invitation, your chosen song begins playing automatically — there's no separate play button they need to find first, and every guest gets muted controls if they'd rather turn it off.",

      { h3: 'Can I Change the Song After Sending the Invitation?' },
      "Yes. Go back into the Invitation Builder, search for a new track, preview it, and confirm — the change appears instantly for anyone opening your existing link, with nothing to resend.",

      { h3: 'Does Every Song Have a Preview Available?' },
      "Most searches return several results with a working 30-second preview, but not every track online has one available. Only songs with a preview can be selected, so you'll never end up with a \"song\" applied that turns out to be silent on the day.",

      [
        'A wedding, a Sangeet and a Guruji Satsang each deserve a completely different first three seconds — and now you can give each one its own. Search, preview, and apply your song directly in the ',
        { text: 'Invitation Builder', href: '/create' },
        ', browse ',
        { text: 'digital wedding invitations', href: '/weddings' },
        ' or ',
        { text: 'Guruji Satsang invitations', href: '/guruji-satsangs' },
        ' for a template to build it on, or read more ',
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
