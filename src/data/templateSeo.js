// SEO and page content for each template's own page. Builds the title, meta
// description, H1, the crawlable body, the breadcrumb and the structured data
// from the template's data (templatesData.js and friends), the written copy in
// templateCopy.js and the live prices, so nothing is typed twice.
//
// The `body` is a list of the same blocks routesSeo.js and blogPosts.js use.
// It feeds both the server-rendered HTML (utils/seoHtml.js) and the visible
// section under the demo (components/TemplatePageContent.jsx), so crawlers and
// visitors read identical text.
//
// Plain data and string work only; safe to import from Node and from the
// Cloudflare function. Do not import React, builderTemplates.js or anything
// with JSX here.
import { SITE_URL } from './siteUrl.js'
import { TEMPLATES } from './templatesData.js'
import { SATSANG_TEMPLATES } from './satsangTemplatesData.js'
import { GANESH_TEMPLATES } from './ganeshTemplatesData.js'
import { effectivePrice } from './pricesFor.js'
import { WEDDING_COPY, SATSANG_COPY, GANESH_COPY, SHARED_WEDDING_FEATURES } from './templateCopy.js'

const WHATSAPP_NUMBER = '918847044554'
const SUFFIX = ' | InviteMyPeople'
const MAX_TITLE = 60

const CATEGORY = {
  wedding: { label: 'Weddings', href: '/weddings', noun: 'wedding' },
  satsang: { label: 'Guruji Satsangs', href: '/guruji-satsangs', noun: 'Guruji Satsang' },
  ganesh: { label: 'Ganesh Chaturthi', href: '/templates/ganesh-chaturthi', noun: 'Ganesh Chaturthi' },
}

export const rupees = (n) => `₹${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Same convention as data/builderTemplates.js (wedding-<id>, satsang-<slug>).
// A check in the verification script compares these with the real list.
function createHref(occasion, builderId) {
  return `/create?${new URLSearchParams({ occasion, template: builderId }).toString()}`
}

function joinList(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function pickTitle(candidates) {
  return candidates.find((t) => t.length <= MAX_TITLE) ?? candidates[candidates.length - 1]
}

// Hidden wedding templates and the demo-only satsang designs are real pages
// but not for sale, so they stay out of the index and carry no sales copy.
export function isIndexable(kind, template) {
  if (kind === 'wedding') return !template.hidden
  if (kind === 'satsang') return Boolean(template.fullExperience)
  return true
}

function describe(kind, template) {
  const copy = { wedding: WEDDING_COPY, satsang: SATSANG_COPY, ganesh: GANESH_COPY }[kind][template.id ?? template.slug]
  return copy ?? null
}

function siblings(kind, template) {
  const cat = CATEGORY[kind]
  const id = template.id ?? template.slug
  const all = {
    wedding: TEMPLATES.filter((t) => !t.hidden),
    satsang: SATSANG_TEMPLATES.filter((t) => t.fullExperience),
    ganesh: GANESH_TEMPLATES,
  }[kind].filter((t) => (t.id ?? t.slug) !== id)
  // Same tradition first, so a Sikh template links to the other Sikh and
  // Hindu ones before the Western ones.
  const sorted =
    kind === 'wedding'
      ? [...all.filter((t) => t.weddingType === template.weddingType), ...all.filter((t) => t.weddingType !== template.weddingType)]
      : all
  return sorted.slice(0, 5).map((t) => {
    const tid = t.id ?? t.slug
    const href = { wedding: `/templates/wedding/${tid}`, satsang: `/satsang/${tid}`, ganesh: `/templates/ganesh-chaturthi/${tid}` }[kind]
    const label = kind === 'wedding' ? `${t.weddingType} wedding invitation` : `${cat.noun} invitation`
    return { text: `${t.name} ${cat.noun} invitation`, href, name: t.name, label, palette: paletteOf(t) }
  })
}

// What the template costs right now, including a price an admin has set
// (overrides: { [builderTemplateId]: price }), or null if it is not for sale.
function priceFacts(kind, template, overrides) {
  return kind === 'ganesh' ? null : effectivePrice(kind, template, overrides)
}

// The written meta description plus the live price, if the two still fit in 155
// characters.
function withPrice(meta, facts) {
  if (!facts) return meta
  const full = `${meta} From ${rupees(facts.price)}.`
  return full.length <= 155 ? full : meta
}

// { intro, steps: [{ title, text }], note }. Every field may be empty.
function howItWorks(kind, template) {
  const name = template.name
  if (kind === 'ganesh') {
    return {
      intro: `Ganesh Chaturthi invitations are launching soon. ${name} is fully designed, but ordering is not open yet. Message us on WhatsApp and we will tell you the moment it is.`,
      steps: [],
      note: '',
    }
  }
  if (kind === 'wedding' && template.hasOwnCreateCta) {
    return {
      intro: `Because the caricature video is made by hand, ${name} is arranged on WhatsApp rather than in the self-serve builder.`,
      steps: [
        { title: 'Message us', text: 'Start a chat with us on WhatsApp from this page.' },
        { title: 'Share your details', text: 'We send you a short details form to fill in.' },
        { title: 'We make it for you', text: 'We make your caricature video and your invitation.' },
      ],
      note: 'If a date or venue changes later, message us on WhatsApp and it is edited live.',
    }
  }
  return {
    intro: '',
    steps: [
      { title: 'Personalise it', text: `Pick ${name} in the Invitation Builder and add your names, dates and venue.` },
      { title: 'Preview it live', text: 'A live phone preview updates as you type, and you can edit freely before you pay.' },
      { title: 'Pay once, share instantly', text: 'Pay once through Razorpay and your live, shareable link is ready instantly.' },
    ],
    note: 'Would you rather have it set up for you? Choose the template, message us on WhatsApp and we deliver it in about 30 minutes. If a date or venue changes later, message us on WhatsApp and it is edited live.',
  }
}

// A template's own colours, used to theme its page (see
// TemplatePageContent.jsx). Every template defines these four.
const DEFAULT_PALETTE = { ivory: '#fdf8f0', ink: '#3a1a1f', rose: '#7a1f33', gold: '#b08a3e' }
function paletteOf(t) {
  const p = t.palette || {}
  return { bg: p.ivory || DEFAULT_PALETTE.ivory, ink: p.ink || DEFAULT_PALETTE.ink, accent: p.rose || DEFAULT_PALETTE.rose, gold: p.gold || DEFAULT_PALETTE.gold }
}

function priceParagraph(kind, template, overrides) {
  const facts = priceFacts(kind, template, overrides)
  const name = template.name
  if (!facts) return `We will share pricing when ordering opens for ${name}.`
  const regular = facts.list
  if (kind === 'satsang') {
    return `${name} is ${rupees(facts.price)}, a special price for Guruji's sangat${regular ? `, against a regular ${rupees(regular)}` : ''}. The price is all-inclusive and covers the whole invitation.`
  }
  if (template.hasOwnCreateCta) {
    return `${name} is ${rupees(facts.price)}${regular ? `, down from ${rupees(regular)}` : ''}. The price includes your hand-animated caricature video.`
  }
  return `${name} is ${rupees(facts.price)}${regular ? ` at our launch price, down from the regular ${rupees(regular)}` : ''}. The price is all-inclusive, with no per-guest fees, and it covers every event on the invitation.`
}

// The short line under the price on the page.
function priceNote(kind, template) {
  if (kind === 'satsang') return "A special price for Guruji's sangat. All-inclusive, and it covers the whole invitation."
  if (template.hasOwnCreateCta) return 'Includes your hand-animated caricature video.'
  return 'All-inclusive, with no per-guest fees. It covers every event on the invitation.'
}

function ctaFor(kind, template) {
  const id = template.id ?? template.slug
  if (kind === 'ganesh') {
    return {
      label: 'Notify me on WhatsApp',
      href: whatsappLink("Hi! I'd like to be notified when InviteMyPeople launches digital Ganesh Chaturthi invitations."),
      external: true,
    }
  }
  if (kind === 'wedding' && template.hasOwnCreateCta) {
    return { label: 'Customise this template', href: whatsappLink(template.customizeWhatsAppMessage), external: true }
  }
  if (kind === 'wedding') return { label: 'Customise this template', href: createHref('wedding', `wedding-${id}`) }
  return { label: 'Customise this template', href: createHref('guruji-satsang', `satsang-${id}`) }
}

function featureList(kind, template, copy) {
  if (copy.features) return copy.features
  if (kind === 'wedding') return SHARED_WEDDING_FEATURES
  return []
}

// The whole page, or null when the template is not one to sell or index.
export function templatePage(kind, template, overrides = {}) {
  if (!template || !isIndexable(kind, template)) return null
  const copy = describe(kind, template)
  if (!copy) return null
  const facts = priceFacts(kind, template, overrides)
  const meta = withPrice(copy.meta, facts)

  const cat = CATEGORY[kind]
  const id = template.id ?? template.slug
  const name = template.name
  const path = { wedding: `/templates/wedding/${id}`, satsang: `/satsang/${id}`, ganesh: `/templates/ganesh-chaturthi/${id}` }[kind]
  const url = `${SITE_URL}${path}`

  const noun = { wedding: 'Wedding Invitation', satsang: 'Guruji Satsang Invitation', ganesh: 'Ganesh Chaturthi Invitation' }[kind]
  const shortNoun = { wedding: 'Wedding Invitation', satsang: 'Satsang Invitation', ganesh: 'Ganesh Invitation' }[kind]
  const title = pickTitle([`${name} ${noun}${SUFFIX}`, `${name} ${shortNoun}${SUFFIX}`, `${name} ${noun}`])

  const h1 =
    kind === 'wedding'
      ? `${name} – ${template.weddingType} Digital Wedding Invitation`
      : `${name} – Digital ${cat.noun} Invitation`

  const breadcrumb = [{ label: 'Home', href: '/' }, { label: cat.label, href: cat.href }, { label: name }]
  const features = featureList(kind, template, copy)
  const cta = ctaFor(kind, template)
  const sibs = siblings(kind, template)
  const sameTradition = kind === 'wedding' ? `${template.weddingType} ` : ''

  const how = howItWorks(kind, template)
  const priceText = priceParagraph(kind, template, overrides)
  const appNote = 'Guests need no app and no account: it opens from a link on any phone.'

  const body = [
    { breadcrumb },
    ...copy.intro,
    { h2: `Who ${name} is for` },
    copy.suits,
    { h2: `What ${name} includes` },
    `${name} includes ${joinList(features)}. ${appNote}`,
    { h2: kind === 'ganesh' ? 'Availability' : 'How it works' },
    ...(how.intro ? [how.intro] : []),
    ...how.steps.flatMap((step, i) => [{ h3: `${i + 1}. ${step.title}` }, step.text]),
    ...(how.note ? [how.note] : []),
    { h2: kind === 'ganesh' ? 'Pricing' : 'Price' },
    priceText,
    { cta: { label: cta.label, href: cta.href } },
    { h2: `More ${sameTradition}${cat.noun} templates` },
    { links: sibs },
    ['See every design on our ', { text: `${cat.noun} invitations page`, href: cat.href }, '.'],
  ]

  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${SITE_URL}${c.href}` : url,
    })),
  }
  const jsonLd = [crumbLd]
  if (facts) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${name} ${noun}`,
      description: meta,
      category: 'Digital invitation',
      brand: { '@type': 'Brand', name: 'InviteMyPeople' },
      url,
      offers: {
        '@type': 'Offer',
        url,
        price: String(facts.price),
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    })
  }

  return {
    kind,
    id,
    name,
    path,
    url,
    title,
    description: meta,
    h1,
    body,
    cta,
    breadcrumb,
    categoryHref: cat.href,
    jsonLd,
    // The same content, split into pieces so the visible page can lay it out
    // as cards, chips and a price panel. The server-rendered body above reads
    // the same text.
    parts: {
      eyebrow: kind === 'wedding' ? `${template.weddingType} wedding invitation` : `${cat.noun} invitation`,
      intro: copy.intro,
      suits: copy.suits,
      features,
      appNote,
      howHeading: kind === 'ganesh' ? 'Availability' : 'How it works',
      how,
      palette: paletteOf(template),
      madeFor: kind === 'wedding' ? `${template.weddingType} weddings` : kind === 'satsang' ? 'Guruji Satsangs' : 'Ganesh Chaturthi',
      delivery: kind === 'ganesh' ? 'Launching soon' : template.hasOwnCreateCta ? 'Made by hand' : 'Ready instantly',
      title: { name, type: h1.slice(name.length + 3) },
      priceHeading: kind === 'ganesh' ? 'Pricing' : 'Price',
      priceText,
      price: facts ? facts.price : null,
      priceList: facts ? facts.list : null,
      priceNote: facts ? priceNote(kind, template) : null,
      moreHeading: `More ${sameTradition}${cat.noun} templates`,
      siblings: sibs,
      categoryLabel: `${cat.noun} invitations page`,
    },
  }
}

function clip(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

function seoFor(kind, template, overrides) {
  const page = templatePage(kind, template, overrides)
  if (!page) {
    // Real, reachable page that is not for sale: keep a basic title and
    // description for browsers and link previews, and keep it out of the index.
    const title = pickTitle([`${template.name} preview${SUFFIX}`, `${template.name} preview`])
    const description = clip(template.metaDescription || template.description, 155)
    return { title, description, ogTitle: title, ogDescription: description, noindex: true }
  }
  return {
    title: page.title,
    description: page.description,
    ogTitle: page.title,
    ogDescription: page.description,
    h1: page.h1,
    body: page.body,
    jsonLd: page.jsonLd,
  }
}

export const weddingSeo = (template, overrides) => seoFor('wedding', template, overrides)
export const satsangSeo = (template, overrides) => seoFor('satsang', template, overrides)
export const ganeshSeo = (template, overrides) => seoFor('ganesh', template, overrides)
