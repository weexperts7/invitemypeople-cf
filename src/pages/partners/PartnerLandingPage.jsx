import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Gift,
  MessageCircle,
  Music2,
  Plus,
  QrCode,
  Sparkles,
} from 'lucide-react'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import SEO from '../../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../../components/PageDecor'
import { ROUTES_SEO } from '../../data/routesSeo'

const WHATSAPP_NUMBER = '918847044554'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

const BUNDLE_FEATURES = [
  {
    icon: Music2,
    title: 'The Digital Backend',
    description:
      'A royal envelope-opening reveal, ambient background music, live RSVP tracking, and an interactive blessing wall — all hosted seamlessly on invitemypeople.com. Your client gets a full wedding pass; you get zero engineering to maintain.',
  },
  {
    icon: QrCode,
    title: 'The Physical QR Insert',
    description:
      'Print-ready, business-card-sized templates in a gold-foil and matte-finish aesthetic — designed to slot straight into the boxes you already make. One scan, and the digital experience opens instantly.',
  },
  {
    icon: BadgeCheck,
    title: 'White-Label Branding',
    description:
      'Every invite your client opens carries a subtle, elegant "Curated exclusively by [Your Shop Name]" badge. Their guests see your brand — not ours.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Apply in 2 Minutes',
    description: 'Tell us about your shop and upload your logo. No paperwork, no meetings, no sales calls required.',
  },
  {
    number: '02',
    title: 'Get Approved & Buy Credits',
    description:
      'Most applications are approved within a couple of business days. Buy invite credits in bulk — starting at ₹600 each — and your branding locks in across every one.',
  },
  {
    number: '03',
    title: 'Hand Over The Upgrade',
    description:
      "Slip a QR insert into your next luxury box. Your client scans it, and their fully branded Digital Wedding Pass goes live instantly — no extra work from you, no delay for them.",
  },
]

const FAQS = [
  {
    question: 'Do I need any technical or design skills?',
    answer:
      "None at all. We build and host the entire digital experience — you just hand your client a printed QR card with their order. If you can hand over a box, you can sell this.",
  },
  {
    question: 'How quickly can I actually start selling this?',
    answer:
      'Most partner applications are reviewed within a couple of business days. Once approved, you can buy your first credit pack and start branding invites the same day.',
  },
  {
    question: 'Is there a minimum order or monthly commitment?',
    answer:
      "No monthly minimums. Credit packs are bought once and used whenever an order calls for it — there's no expiry pressure and nothing recurring to cancel.",
  },
  {
    question: 'What exactly does my client see?',
    answer:
      "A fully interactive digital wedding pass under your shop's name — envelope opening, background music, live RSVP tracking and a blessing wall — reached by scanning the QR card from their box. No InviteMyPeople branding is shown to them.",
  },
]

function FaqItem({ item, isOpen, onToggle }) {
  const reduceMotion = useReducedMotion()
  return (
    <div className="rounded-2xl border border-white/70 bg-ivory shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-serif text-lg text-ink">{item.question}</span>
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blush/60 text-rose transition-transform ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-ink-soft leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Public, unauthenticated marketing page at /partners — the pitch a sweet
// shop or wedding-box vendor sees before ever touching the signup form.
// Deliberately outside PartnerPortalLayout (see App.jsx): it needs no
// Supabase Auth session, just SiteHeader/SiteFooter like every other
// marketing page, so a partner can be pitched this page cold on a phone
// during a walk-in visit. Both CTAs route into the B2B flow that already
// exists — PartnerSignupPage.jsx (application) and PartnerLoginPage.jsx
// (returning partners) — this page sells the "why," it doesn't duplicate
// either form.
export default function PartnerLandingPage() {
  const reduceMotion = useReducedMotion()
  const [closedFaqs, setClosedFaqs] = useState(new Set([1, 2, 3]))

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/partners']} path="/partners" />
      <SiteHeader />

      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-petals px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[8%] top-14 bg-gold-soft/30" size={150} duration={11} />
              <FloatingOrb className="right-[6%] top-28 bg-blush-deep/40" size={130} duration={9} delay={1.2} />
              <FloatingIcon icon={Gift} className="right-[10%] top-16 hidden sm:block" duration={9} delay={0.6} />
              <FloatingIcon icon={Sparkles} className="left-[8%] bottom-10 hidden sm:block" duration={10} delay={1} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex justify-center"
            >
              <SectionEyebrow icon={Gift} tone="gold">For Sweet Shops &amp; Wedding Box Creators</SectionEyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-serif text-4xl sm:text-6xl leading-[1.1] text-ink"
            >
              Transform Your Luxury Wedding Boxes Into a Complete{' '}
              <span className="font-script text-rose text-5xl sm:text-7xl">High-End</span> Concierge Experience
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed"
            >
              Supply gorgeous physical mithai boxes? Now offer your couples an exclusive Interactive Digital Wedding
              Pass — complete with royal envelope openings, live RSVPs, and background music — branded entirely
              under your shop's name.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                to="/partners/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-ivory shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
              >
                Become a Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/partners/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/20 bg-ivory/70 px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-rose/50 hover:text-rose sm:w-auto"
              >
                Log In
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              className="mt-5 text-xs uppercase tracking-[0.2em] text-ink-soft"
            >
              Free to apply &middot; Approved in 2–3 business days &middot; 100% white-labeled
            </motion.p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* What's Inside the Package — the Box + Tech bundle */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-champagne/40 px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="mb-4 flex justify-center">
                <SectionEyebrow icon={Gift} tone="gold">The Box + Tech Bundle</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">
                Everything You Need To Sell The Upgrade
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {BUNDLE_FEATURES.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    className="rounded-3xl border border-white/70 bg-ivory p-6 shadow-card"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose text-ivory">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <h3 className="font-serif text-lg text-ink mb-1.5">{item.title}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{item.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* How it works — the bridge into the already-built signup flow */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ivory px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="mb-4 flex justify-center">
                <SectionEyebrow icon={ClipboardCheck} tone="ivory">Getting Started</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">
                From Application To Your First Sale
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl border border-champagne-deep/40 bg-linen p-6"
                >
                  <p className="font-script text-4xl text-rose">{step.number}</p>
                  <h3 className="font-serif text-lg text-ink mt-1 mb-1.5">{step.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA banner */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ink px-6 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="font-serif text-3xl sm:text-5xl text-ivory mb-4">
              Your Boxes Deserve The Upgrade Only You Can Offer
            </h2>
            <p className="mx-auto max-w-lg text-white/70 mb-9">
              Join the growing network of sweet shops and packaging showrooms already turning a ₹600 credit into a
              ₹2,000+ upgrade on every wedding order.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/partners/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03] sm:w-auto"
              >
                Become a Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/partners/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-ivory transition-colors hover:border-white/60 sm:w-auto"
              >
                Already a Partner? Log In
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-blush/40 px-6 py-16 sm:py-20 scroll-mt-6">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="mb-4 flex justify-center">
                <SectionEyebrow icon={MessageCircle} tone="rose">Got Questions</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">
                Partner Program FAQs
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              {FAQS.map((item, i) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={!closedFaqs.has(i)}
                  onToggle={() =>
                    setClosedFaqs((prev) => {
                      const next = new Set(prev)
                      if (next.has(i)) next.delete(i)
                      else next.add(i)
                      return next
                    })
                  }
                />
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 text-center text-sm text-ink-soft"
            >
              Still have a question?{' '}
              <a
                href={getWhatsAppLink("Hi! I'm a sweet shop/wedding box vendor interested in the Partner Program.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-rose hover:underline"
              >
                Ask us on WhatsApp
              </a>
            </motion.p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
