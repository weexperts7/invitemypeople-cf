import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardCheck,
  Download,
  Eye,
  Heart,
  LayoutTemplate,
  Sparkles,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import { ROUTES_SEO } from '../data/routesSeo'

// The self-serve builder (see pages/CreateInvitePage.jsx) gives every host a
// live dashboard, not just a card — these four are what actually ships
// today, so "What You Get" below stays honest instead of aspirational.
const WHAT_YOU_GET = [
  {
    icon: ClipboardCheck,
    title: 'A Complete Guest Management System',
    description:
      'More than an invite—get a live dashboard that tracks every single RSVP, headcount, and song request for your event functions.',
  },
  {
    icon: LayoutTemplate,
    title: 'All Your Events, One Page',
    description:
      'Add every function—Haldi, Sangeet, Wedding, Reception—into one polished, mobile-first invitation, each with its own date, time, and venue, all managed from a single link your guests open once.',
  },
  {
    icon: Eye,
    title: 'Live Preview As You Build',
    description:
      'Every name, date, and detail you enter updates your invitation’s live preview instantly, so you see exactly what your guests will see before you publish.',
  },
  {
    icon: Download,
    title: 'Your Data, Your Way',
    description:
      'Download your finalized guest lists for catering and planning instantly from your private host dashboard.',
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
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
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
              <SectionEyebrow icon={Sparkles} tone="gold">About Us</SectionEyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-serif text-4xl sm:text-6xl leading-[1.1] text-ink"
            >
              Invitations That Bring{' '}
              <span className="font-script text-rose text-5xl sm:text-7xl">Everyone</span> Together
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed"
            >
              InviteMyPeople turns the headache of event coordination into a
              seamless experience. We move beyond simple digital cards to
              give you a full-fledged guest management system, wrapped in a
              beautiful, custom-branded experience that works perfectly on
              every smartphone.
            </motion.p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Why we started */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ivory px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Heart} tone="rose">Our Origin</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">Why we started</h2>
            <p className="text-ink-soft leading-relaxed text-base sm:text-lg">
              Managing guest lists, tracking who&rsquo;s actually coming, and
              getting final headcounts shouldn&rsquo;t be a full-time job. We
              were tired of spreadsheet chaos and fragmented WhatsApp chats.
              We built InviteMyPeople to bridge the gap between
              &ldquo;sending an invite&rdquo; and &ldquo;managing an
              event&rdquo;&mdash;offering hosts a real-time dashboard to
              track RSVPs, gather wishes, and download clean guest lists, all
              while giving guests a stunning, personalized experience.
            </p>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* What you get */}
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
                <SectionEyebrow icon={Sparkles} tone="gold">The Details</SectionEyebrow>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink">What you get</h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHAT_YOU_GET.map((item, i) => {
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
        {/* What we believe */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-ivory px-6 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Heart} tone="rose">Our Philosophy</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-4">What we believe</h2>
            <p className="text-ink-soft leading-relaxed text-base sm:text-lg">
              Your time is better spent celebrating than chasing RSVPs. We
              obsess over making the &ldquo;behind-the-scenes&rdquo; of your
              event effortless, so you can focus on the big day. Hosts trust
              us to manage the logistics of their most important moments,
              from an intimate Satsang to a multi-day wedding with a hundred
              functions to track — and every one of those hosts builds their
              invitation themselves, in our live builder, without ever
              needing to brief a designer or wait on a revision.
            </p>
          </motion.div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* One platform, every celebration + honest pricing */}
        {/* ---------------------------------------------------------------- */}
        <section className="bg-champagne/40 px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 flex justify-center sm:justify-start">
                <SectionEyebrow icon={Sparkles} tone="gold">One Platform</SectionEyebrow>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-3 text-center sm:text-left">
                Built for every celebration
              </h2>
              <p className="text-ink-soft leading-relaxed text-base text-center sm:text-left">
                Weddings, Guruji Satsangs, and Ganesh Chaturthi celebrations
                are live today, with birthdays, engagements, baby showers,
                housewarmings, corporate events, and anniversaries on the
                way. Every occasion runs on the same live builder, the same
                interactive RSVP tracking, and the same private host
                dashboard — one platform, built for celebrations across
                India.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="mb-4 flex justify-center sm:justify-start">
                <SectionEyebrow icon={ClipboardCheck} tone="rose">Honest Pricing</SectionEyebrow>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-3 text-center sm:text-left">
                Why hosts choose us
              </h2>
              <p className="text-ink-soft leading-relaxed text-base text-center sm:text-left">
                Every invitation ships cost-effective, eco-friendly and
                mobile-first, backed by ready-made templates across every
                tradition, plus 2 free revisions. Pricing is all-inclusive,
                with no per-guest or courier costs added on — a celebration
                that's as unforgettable as the day itself never has to start
                with a complicated setup.
              </p>
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
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="font-serif text-3xl sm:text-5xl text-ivory mb-4">
              Ready to bring your people together?
            </h2>
            <p className="mx-auto max-w-lg text-white/70 mb-9">
              Browse our designs and see your own live, shareable invitation
              and guest dashboard come together in minutes.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
