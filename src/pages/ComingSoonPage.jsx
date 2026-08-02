import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, MessageCircle, ArrowRight, Heart } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb } from '../components/PageDecor'
import { COMING_SOON_OCCASIONS } from '../data/occasionsData'
import { ROUTES_SEO } from '../data/routesSeo'

const WHATSAPP_NUMBER = '919877647707'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// One shared page for every not-yet-launched celebration category
// (/birthdays, /engagements, /baby-showers, /housewarmings,
// /corporate-events, /anniversaries) — a real, linkable URL for each so the
// roadmap is navigable rather than just a list of badges on the homepage.
export default function ComingSoonPage({ occasion }) {
  const reduceMotion = useReducedMotion()
  const Icon = occasion.icon
  const otherOccasions = COMING_SOON_OCCASIONS.filter((o) => o.slug !== occasion.slug)
  const seo = ROUTES_SEO[`/${occasion.slug}`]

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...seo} path={`/${occasion.slug}`} />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-20 sm:pt-24 sm:pb-24">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[10%] top-14 bg-blush-deep/40" size={160} duration={11} />
              <FloatingOrb className="right-[8%] top-24 bg-gold-soft/30" size={130} duration={9} delay={1.2} />
            </>
          )}

          <div className="relative mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 flex justify-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-champagne text-ink shadow-card">
                <Icon className="w-7 h-7" strokeWidth={1.5} />
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mb-5 flex justify-center"
            >
              <SectionEyebrow icon={Sparkles} tone="gold">Coming Soon</SectionEyebrow>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl leading-[1.15] text-ink mb-4"
            >
              Digital {occasion.label} Invitations
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mx-auto max-w-lg text-base sm:text-lg text-ink-soft mb-9"
            >
              {occasion.tagline} We&rsquo;re building interactive, WhatsApp-delivered
              invitations for {occasion.label.toLowerCase()} next — with the
              same envelope reveals, scratch-to-reveal cards and live RSVP
              tracking already live for weddings and Satsangs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.26 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href={getWhatsAppLink(
                  `Hi! I'd like to be notified when InviteMyPeople launches digital ${occasion.label} invitations.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3.5 text-sm font-medium text-ivory shadow-soft transition-transform hover:scale-[1.03]"
              >
                <MessageCircle className="w-4 h-4" />
                Notify Me on WhatsApp
              </a>
              <Link
                to="/weddings"
                className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/60 bg-ivory/70 px-6 py-3.5 text-sm font-medium text-ink shadow-card transition-colors hover:bg-champagne/40"
              >
                See What&rsquo;s Live Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="bg-ivory px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Heart} tone="rose">Live Now</SectionEyebrow>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-8">
              Available Today
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
              <Link
                to="/weddings"
                className="rounded-3xl border border-rose/30 bg-blush/40 p-6 text-left shadow-card transition-colors hover:bg-blush/60"
              >
                <h3 className="font-serif text-xl text-ink mb-1">Weddings</h3>
                <p className="text-sm text-ink-soft">Interactive wedding invitations across every tradition.</p>
              </Link>
              <Link
                to="/guruji-satsangs"
                className="rounded-3xl border border-gold-soft/50 bg-champagne/50 p-6 text-left shadow-card transition-colors hover:bg-champagne/70"
              >
                <h3 className="font-serif text-xl text-ink mb-1">Guruji Satsangs</h3>
                <p className="text-sm text-ink-soft">Devotional invitations with a Divine Blessing scratch card.</p>
              </Link>
            </div>

            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-soft">Also Coming Soon</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {otherOccasions.map((other) => {
                const OtherIcon = other.icon
                return (
                  <Link
                    key={other.slug}
                    to={`/${other.slug}`}
                    className="inline-flex items-center gap-2.5 rounded-full border border-dashed border-champagne-deep/60 bg-ivory/50 pl-2 pr-4 py-2 text-sm text-ink-soft transition-colors hover:bg-champagne/40 hover:text-ink"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-champagne/60 text-ink-soft">
                      <OtherIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </span>
                    {other.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
