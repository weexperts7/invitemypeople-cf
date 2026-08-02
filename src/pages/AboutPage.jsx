import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Heart,
  Mail,
  Timer,
  ClipboardCheck,
  MessageCircle,
  ArrowRight,
  PhoneOff,
  Printer,
  Users,
  CheckCircle2,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import { COMING_SOON_OCCASIONS } from '../data/occasionsData'
import { ROUTES_SEO } from '../data/routesSeo'

const WHATSAPP_NUMBER = '919877647707'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// The exact chaos a physical invite forces on a host, before the digital
// alternative even enters the picture — grounds "why we built this" in
// specifics instead of a vague "invitations are hard" claim.
const PAIN_POINTS = [
  {
    icon: Printer,
    text: 'Printing hundreds of cards, only to reprint half of them after a venue or date changes.',
  },
  {
    icon: PhoneOff,
    text: "Digging through years-old contacts for a phone number that changed three homes ago.",
  },
  {
    icon: Users,
    text: 'Chasing RSVPs over a dozen scattered phone calls, with no single place to see who’s actually coming.',
  },
]

const DIFFERENTIATORS = [
  {
    icon: Timer,
    title: 'WhatsApp Delivery in 30 Minutes',
    description: 'Send us your details on WhatsApp and get back a live, personalized invitation link — no forms, no waiting days.',
  },
  {
    icon: Mail,
    title: 'Interactive Envelopes',
    description: 'A tap-to-open wax-seal reveal turns opening your invite into a moment guests actually remember.',
  },
  {
    icon: Sparkles,
    title: 'Scratch-to-Reveal Cards',
    description: 'A gold-foil scratch card reveals a save-the-date or divine blessing, with real, satisfying suspense.',
  },
  {
    icon: ClipboardCheck,
    title: 'Live RSVP Tracking',
    description: 'Every response lands in one dashboard the moment a guest taps — no more guessing headcounts.',
  },
  {
    icon: Heart,
    title: 'A Wishes Wall',
    description: 'Guests leave blessings and messages right on the invitation, gathered in one place you’ll want to keep.',
  },
]

export default function AboutPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/about']} path="/about" />
      <SiteHeader />

      <main>
        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-20 sm:pt-24 sm:pb-24">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[10%] top-14 bg-blush-deep/40" size={160} duration={11} />
              <FloatingOrb className="right-[8%] top-24 bg-gold-soft/30" size={130} duration={9} delay={1.2} />
              <FloatingIcon icon={Heart} className="right-[10%] top-16 hidden sm:block" duration={9} delay={0.6} />
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
              <SectionEyebrow icon={Sparkles} tone="gold">Our Story</SectionEyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-serif text-4xl sm:text-6xl leading-[1.1] text-ink"
            >
              Invitations, the way they
              <br className="hidden sm:block" /> should&rsquo;ve always{' '}
              <span className="font-script text-rose text-5xl sm:text-7xl">felt.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-ink-soft"
            >
              We built InviteMyPeople because we lived the chaos of paper
              cards and scattered WhatsApp forwards ourselves — and decided
              invitations deserved better.
            </motion.p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Brand story — the pain point */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ivory px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="mb-4 flex justify-center">
                <SectionEyebrow icon={Heart} tone="rose">Why We Built This</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">
                We&rsquo;ve Been the Ones Planning the Event
              </h2>
              <p className="mx-auto max-w-2xl text-ink-soft leading-relaxed">
                Long before InviteMyPeople was a product, it was a problem
                we couldn&rsquo;t stop running into ourselves — traditional
                paper invites that cost a fortune and still couldn&rsquo;t
                reach everyone in time, phone numbers that had changed one
                too many times, and the quiet chaos of trying to keep track
                of who was actually coming.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {PAIN_POINTS.map((point, i) => {
                const Icon = point.icon
                return (
                  <motion.div
                    key={point.text}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="rounded-3xl border border-white/70 bg-linen/60 p-6 text-center shadow-card"
                  >
                    <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blush text-rose">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </span>
                    <p className="text-sm text-ink-soft leading-relaxed">{point.text}</p>
                  </motion.div>
                )
              })}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto max-w-2xl text-center text-ink-soft leading-relaxed"
            >
              So we built the invitation we wished we&rsquo;d had: something
              interactive enough to feel special, simple enough to send in
              minutes on WhatsApp, and honest enough to show us, in real
              time, exactly who was coming. That&rsquo;s InviteMyPeople —
              effortless, interactive invitations for the people you love.
            </motion.p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* What makes us different */}
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
                <SectionEyebrow icon={Sparkles} tone="gold">What Makes Us Different</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
                Not Just a PDF on WhatsApp
              </h2>
              <p className="text-ink-soft max-w-xl mx-auto">
                Every invitation we build ships with the same set of
                features, no matter the occasion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {DIFFERENTIATORS.map((item, i) => {
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
        {/* Full spectrum of events */}
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
                <SectionEyebrow icon={Heart} tone="rose">Every Celebration</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
                One Platform, Every Occasion
              </h2>
              <p className="text-ink-soft max-w-xl mx-auto">
                Weddings and Guruji Satsangs are live today. We&rsquo;re
                building out the rest of life&rsquo;s celebrations next.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-soft">Live Now</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/weddings"
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-rose/30 bg-blush/40 p-6 shadow-card transition-colors hover:bg-blush/60"
                >
                  <div>
                    <h3 className="font-serif text-xl text-ink mb-1 flex items-center gap-2">
                      Weddings
                      <CheckCircle2 className="w-4 h-4 text-rose" />
                    </h3>
                    <p className="text-sm text-ink-soft">Interactive wedding invitations across every tradition.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-none text-rose transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/guruji-satsangs"
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-gold-soft/50 bg-champagne/50 p-6 shadow-card transition-colors hover:bg-champagne/70"
                >
                  <div>
                    <h3 className="font-serif text-xl text-ink mb-1 flex items-center gap-2">
                      Guruji Satsangs
                      <CheckCircle2 className="w-4 h-4 text-rose" />
                    </h3>
                    <p className="text-sm text-ink-soft">Devotional invitations with a Divine Blessing scratch card.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 flex-none text-rose transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.18 }}
            >
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-soft">Coming Soon</p>
              <div className="flex flex-wrap gap-3">
                {COMING_SOON_OCCASIONS.map((occasion) => {
                  const Icon = occasion.icon
                  return (
                    <Link
                      key={occasion.slug}
                      to={`/${occasion.slug}`}
                      className="inline-flex items-center gap-2.5 rounded-full border border-dashed border-champagne-deep/60 bg-ivory/50 pl-2 pr-4 py-2 text-sm text-ink-soft transition-colors hover:bg-champagne/40 hover:text-ink"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-champagne/60 text-ink-soft">
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </span>
                      {occasion.label}
                      <span className="text-[9px] uppercase tracking-[0.15em] text-ink-soft/60">Soon</span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CTA */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ink px-6 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="font-serif text-3xl sm:text-5xl text-ivory mb-4">
              Let&rsquo;s build yours together.
            </h2>
            <p className="mx-auto max-w-lg text-white/70 mb-9">
              Tell us about your celebration on WhatsApp, or browse our
              templates first — either way, you&rsquo;ll have a live
              invitation in 30 minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={getWhatsAppLink("Hi! I'd like to get started with my digital invitation.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Us on WhatsApp
              </a>
              <Link
                to="/weddings"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-white/10"
              >
                Browse Templates
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
