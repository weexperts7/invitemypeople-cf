// Content for the three category pages (/weddings, /guruji-satsangs,
// /templates/ganesh-chaturthi): a crawlable list of every template with
// descriptive link text, and a FAQ. The visible pages and the server-rendered
// HTML both read these blocks, and the FAQPage structured data is built from
// the same FAQ arrays (faqData.js), so the text is identical everywhere.
//
// Plain data only; safe to import from Node and the Cloudflare function.
import { TEMPLATES } from './templatesData.js'
import { SATSANG_TEMPLATES } from './satsangTemplatesData.js'
import { GANESH_TEMPLATES } from './ganeshTemplatesData.js'
import { getWeddingFaqs, getSatsangFaqs, GANESH_FAQS, faqBlocks, faqJsonLd } from './faqData.js'
import { rupees } from './templateSeo.js'
import { priceSummary } from './pricesFor.js'

const weddingLinks = () =>
  TEMPLATES.filter((t) => !t.hidden).map((t) => ({
    text: `${t.name} – ${t.weddingType} wedding invitation`,
    href: `/templates/wedding/${t.id}`,
  }))

const satsangLinks = () =>
  SATSANG_TEMPLATES.filter((t) => t.fullExperience).map((t) => ({
    text: `${t.name} – Guruji Satsang invitation`,
    href: `/satsang/${t.slug}`,
  }))

const ganeshLinks = () =>
  GANESH_TEMPLATES.map((t) => ({
    text: `${t.name} – Ganesh Chaturthi invitation (launching soon)`,
    href: `/templates/ganesh-chaturthi/${t.slug}`,
  }))

// The Guruji Satsang page was short, so it carries the main written copy.
// Facts here come from the two live templates' own data and code.
// "Both templates are ₹799, a special price for Guruji's sangat, against a
// regular ₹2,399." or, if an admin has priced them differently, a range.
function satsangPrices(overrides) {
  const p = priceSummary('satsang', overrides)
  const regular = p.regular ? `, against a regular ${rupees(p.regular)}` : ''
  return p.same
    ? `Both templates are ${rupees(p.min)}, a special price for Guruji's sangat${regular}.`
    : `Templates are priced from ${rupees(p.min)} to ${rupees(p.max)}, a special price for Guruji's sangat.`
}

const satsangAbout = (overrides) => [
  "A Guruji Satsang invitation should feel like the gathering it announces. Our Guruji Satsang invitations are web pages that open from a single link on any phone, with no app or account for your guests. They carry Guruji's darshan, the programme and the langar prasad details, and they ask the sangat to take part before the day arrives.",
  { h2: "Two ways to open Guruji's darshan" },
  "Shukrana Darshan opens in the dark. Guests light the jyot, and its glow reveals Guruji's darshan. Gulab Marg opens in daylight on a carved garden gate that swings open onto Guruji's darshan, with a rose vine that grows as guests read.",
  { h2: 'Chant, offer and give thanks together' },
  "On Shukrana Darshan, guests chant together on the Sangat Jaap, a mala whose count the whole sangat shares. They open a rose to receive one of Guruji's vachans, offer seva as they RSVP, and leave their shukrana on a wall everyone can read. On Gulab Marg, each guest offers a rose to a bouquet that grows with the sangat, and opens a note with Guruji's vachan.",
  { h2: 'RSVP and planning in one place' },
  'Every response goes into a private host dashboard, so you know how many to expect for langar prasad. You can add your own greeting for Guruji, and an invite-only note if the satsang is not open to everyone. If a date or venue changes after you share the link, message us on WhatsApp and we edit it live, so everyone sees the update.',
  { h2: 'Price and how it works' },
  `${satsangPrices(overrides)} Pick a template, fill in your family name, date and venue in the Invitation Builder with a live phone preview, and pay once through Razorpay for an instant link. If you would rather have it set up for you, message us on WhatsApp and we deliver it in about 30 minutes.`,
]

// Blocks shown (and server-rendered) after each page's own copy. The Satsang
// page uses its About copy as the whole body. Pass the admin price overrides to
// keep every price on the page current.
export function getCategoryBlocks(path, overrides = {}) {
  if (path === '/weddings') {
    return [
      { h2: 'All wedding invitation templates' },
      { links: weddingLinks() },
      ...faqBlocks('Frequently asked questions about digital wedding invitations', getWeddingFaqs(overrides)),
    ]
  }
  if (path === '/guruji-satsangs') {
    return [
      ...satsangAbout(overrides),
      { h2: 'Our Guruji Satsang invitation templates' },
      { links: satsangLinks() },
      ...faqBlocks('Frequently asked questions about Guruji Satsang invitations', getSatsangFaqs(overrides)),
    ]
  }
  if (path === '/templates/ganesh-chaturthi') {
    return [
      { h2: 'All Ganesh Chaturthi invitation templates' },
      { links: ganeshLinks() },
      ...faqBlocks('Frequently asked questions about Ganesh Chaturthi invitations', GANESH_FAQS),
    ]
  }
  return null
}

export const CATEGORY_PATHS = ['/weddings', '/guruji-satsangs', '/templates/ganesh-chaturthi']

export function getCategoryJsonLd(path, overrides = {}) {
  if (path === '/weddings') return [faqJsonLd(getWeddingFaqs(overrides))]
  if (path === '/guruji-satsangs') return [faqJsonLd(getSatsangFaqs(overrides))]
  if (path === '/templates/ganesh-chaturthi') return [faqJsonLd(GANESH_FAQS)]
  return []
}

// Routes whose old body is dropped entirely in favour of CATEGORY_BLOCKS.
export const CATEGORY_REPLACES_BODY = new Set(['/guruji-satsangs'])
