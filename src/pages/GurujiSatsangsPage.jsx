import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Eye, MessageCircle } from 'lucide-react'
import { FoldedHandsIcon } from '../components/icons/FoldedHandsIcon'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import SatsangTemplateCard from '../components/SatsangTemplateCard'
import { SATSANG_TEMPLATES } from '../data/satsangTemplatesData'
import { ROUTES_SEO } from '../data/routesSeo'

const WHATSAPP_NUMBER = '918847044554'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// The dedicated Guruji Satsang template gallery — the homepage's Satsang
// section stays a lighter teaser marquee that links here for the complete
// browsing experience (see LandingPage.jsx).
export default function GurujiSatsangsPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/guruji-satsangs']} path="/guruji-satsangs" />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[8%] top-10 bg-champagne-deep/40" size={150} duration={11} />
              <FloatingOrb className="right-[10%] top-20 bg-gold-soft/30" size={120} duration={9} delay={1.2} />
              <FloatingIcon icon={Flame} className="right-[8%] top-14 hidden sm:block" duration={8} delay={0.8} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={FoldedHandsIcon} tone="gold">Guruji Satsang Invitations</SectionEyebrow>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-4">
              Devotional Invitations for Guruji&rsquo;s Satsang
            </h1>
            <p className="mx-auto max-w-xl text-ink-soft">
              {SATSANG_TEMPLATES.length} template{SATSANG_TEMPLATES.length === 1 ? '' : 's'} —
              Guruji&rsquo;s photo, a live Divine Blessing scratch card and
              RSVP built in, delivered on WhatsApp in 30 minutes.
            </p>
          </div>
        </section>

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SATSANG_TEMPLATES.map((template) => (
                <SatsangTemplateCard key={template.slug} template={template} />
              ))}
            </motion.div>

            <div className="mt-12 flex justify-center">
              <a
                href={getWhatsAppLink("Hi! I'd like to start a Guruji Satsang invitation.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/60 bg-ivory/70 px-6 py-3 text-sm font-medium text-ink shadow-card transition-colors hover:bg-champagne/40"
              >
                <Eye className="w-4 h-4" />
                Not sure which one? Ask us on WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="bg-ink px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-ivory mb-3">
              Ready to make it yours?
            </h2>
            <p className="text-white/70 mb-7">
              Message us Guruji&rsquo;s details and the event date — we&rsquo;ll
              send back a live, shareable invitation in 30 minutes.
            </p>
            <a
              href={getWhatsAppLink("Hi! I'd like to get started with my Guruji Satsang invitation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="w-4 h-4" />
              Start on WhatsApp
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
