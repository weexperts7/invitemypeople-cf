// FAQ and "how it works" copy, kept in one place. The visible page, the
// server-rendered HTML body and the FAQPage structured data all read from
// here, so the text can never differ between them (Google requires the
// structured answers to match what the page shows).
//
// Plain data and string work only, so it is safe to import from Node and from
// the Cloudflare function.
import { PRICING } from './pricing.js'
import { SATSANG_PRICE, SATSANG_LIST_PRICE, getActivePrice, getSavingsPercent, isSaleActive } from './sale.js'
import { TEMPLATES } from './templatesData.js'

const rupees = (n) => `₹${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
const flagship = TEMPLATES.find((t) => t.salePrice)

// Two ways to get an invitation are offered: build it yourself and get the
// link instantly, or message us on WhatsApp and we set it up (about 30
// minutes). The copy says both, everywhere.
export const HOW_IT_WORKS = {
  subtitle: 'Three steps to a live invitation: instant when you build it yourself, about 30 minutes when we do it for you.',
  steps: [
    {
      title: 'Select a Template',
      description: 'Browse our collection and pick the design that matches your celebration.',
    },
    {
      title: 'Build It or Message Us',
      description:
        'Fill in your names, dates and venue in the Invitation Builder and watch a live phone preview, or send the details to us on WhatsApp.',
    },
    {
      title: 'Go Live',
      description:
        'Pay once through Razorpay and your shareable link is ready instantly. If we set it up for you on WhatsApp, it is delivered in about 30 minutes.',
    },
  ],
}

const costAnswer = () => {
  const saleLive = isSaleActive()
  const price = getActivePrice()
  const wedding = saleLive
    ? `Most wedding templates are ${rupees(price)} during our current launch sale, a ${getSavingsPercent()}% saving on the regular ${rupees(PRICING.price)}.`
    : `Most wedding templates are ${rupees(price)} at our launch price, against a regular ${rupees(PRICING.price)}.`
  const flag = flagship
    ? ` ${flagship.name}, our caricature-video template, is ${rupees(flagship.salePrice)} (regular ${rupees(flagship.originalPrice)}).`
    : ''
  return `${wedding} Guruji Satsang invitations are ${rupees(SATSANG_PRICE)}, a special price for Guruji's sangat (regular ${rupees(SATSANG_LIST_PRICE)}).${flag} Every price is all-inclusive, with no per-guest or printing costs, and you pay once through Razorpay.`
}

export function getHomepageFaqs() {
  return [
    {
      question: 'How does the whole process work?',
      answer:
        'Pick a template in our Invitation Builder, then fill in your names, dates and venue. A live phone preview updates as you type, so you see exactly what your guests will get. When it looks right, pay once through Razorpay and your own live, shareable link is ready instantly. If you would rather have it done for you, message us on WhatsApp and we deliver it in about 30 minutes.',
    },
    { question: 'How much does it cost?', answer: costAnswer() },
    {
      question: 'Can I make changes after I see my invitation?',
      answer: "Yes. You can edit every detail live in the builder before you pay, so nothing is locked in until you're happy with it.",
    },
    {
      question: 'Do my guests need to install an app?',
      answer:
        'No. Every template is a mobile-first web page that opens straight from the shared link in any browser, with no app, download or account required.',
    },
    {
      question: 'Can I add my own background music?',
      answer:
        "Yes. Search for any song right in the builder and pick it as your invitation's background music, so it starts playing the moment a guest taps the envelope open. It's entirely optional; skip it and we'll play a soft default track instead. Either way, a mute button lets every guest turn it off if they'd rather open your invitation in silence.",
    },
    {
      question: 'How do RSVPs work?',
      answer:
        "Guests tap to respond right on the invitation. Attendance, guest count, and blessings or wishes all flow straight into your private host dashboard, so there's no chasing phone calls.",
    },
    {
      question: 'Can I update details after the date changes or a venue moves?',
      answer:
        "Yes. Message us the update on WhatsApp and we'll edit it live. Everyone with the link instantly sees the latest details, with no reprinting or resending required.",
    },
  ]
}

export const WEDDING_FAQS = [
  {
    question: 'Is a digital invitation acceptable for a traditional Indian wedding?',
    answer:
      'Yes. Digital wedding invitations are now standard across Indian weddings of every size and tradition, often used alongside or instead of printed cards. They reach guests instantly, work for local relatives and those abroad, and remove the courier delays and reprint costs of physical cards.',
  },
  {
    question: 'Can I send a digital invitation to some guests and a printed one to others?',
    answer:
      "Yes. Many hosts use the digital invitation to reach most guests instantly on WhatsApp and still print a small batch of cards for elders or close family who prefer something physical. The two don't exclude each other.",
  },
  {
    question: "What happens if my wedding's date, venue or timing changes?",
    answer:
      'Message us the update on WhatsApp and we edit it live. Everyone holding the link sees the change immediately, so there is nothing to reprint or resend.',
  },
  {
    question: 'How much does a digital wedding invitation cost?',
    answer: costAnswer(),
  },
  {
    question: 'Do my guests need to install an app?',
    answer: 'No. Every invitation is a mobile-first web page that opens from the link in any browser, with no app or account.',
  },
  {
    question: 'How do RSVPs work?',
    answer:
      'Guests tap to respond on the invitation itself. Attendance, guest count and wishes go straight into your private host dashboard.',
  },
]

export const SATSANG_FAQS = [
  {
    question: "Can I include Guruji's photo and a personal greeting?",
    answer:
      "Yes. Every Guruji Satsang template is built around Guruji's darshan, and you add your family name and your own greeting alongside the date, time and venue.",
  },
  {
    question: 'How do I know how many devotees are coming?',
    answer:
      'Every guest can RSVP on the invitation, and their response, with the guest count, appears in your private host dashboard. You can use it to plan langar prasad and seating.',
  },
  {
    question: 'What is the Sangat Jaap?',
    answer:
      'On Shukrana Darshan, the Sangat Jaap is a mala that guests chant on together. The count is shared by the whole sangat, so every guest sees the sangat chanting as one.',
  },
  {
    question: 'How much does a Guruji Satsang invitation cost?',
    answer: `${rupees(SATSANG_PRICE)}, a special price for Guruji's sangat, against a regular ${rupees(SATSANG_LIST_PRICE)}. It is all-inclusive and you pay once through Razorpay.`,
  },
  {
    question: 'Can I update the invitation after sending it to my community?',
    answer:
      'Yes. Message us the new date, time or venue on WhatsApp and we edit it live. Everyone who already has the link sees the update the next time they open it.',
  },
]

export const GANESH_FAQS = [
  {
    question: 'When will Ganesh Chaturthi invitations be available?',
    answer:
      "They are launching soon. The templates are fully designed, but ordering isn't open yet. Message us on WhatsApp and we'll tell you the moment they are live.",
  },
  {
    question: 'Can I list multiple aarti timings across the ten days?',
    answer:
      'Yes. Add as many events as your celebration has, each with its own date, time and description, from Sthapana morning through to Visarjan. Guests see the full schedule on one link.',
  },
  {
    question: 'Does the blessing wall replace RSVP tracking, or work alongside it?',
    answer:
      "They work alongside each other. Guests RSVP with attendance and headcount, and can separately leave a blessing for Bappa and your family on the wall. You get numbers for prasad planning and a keepsake of everyone's wishes.",
  },
  {
    question: 'Can I update the Visarjan date or route if plans change?',
    answer:
      'Yes. Message us the update on WhatsApp and we edit it live. Everyone holding the link sees the change the next time they open it.',
  },
]

// The FAQ as page-body blocks (an H2, then an H3 and a paragraph per item).
export function faqBlocks(heading, faqs) {
  return [{ h2: heading }, ...faqs.flatMap((f) => [{ h3: f.question }, f.answer])]
}

export function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}
