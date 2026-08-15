import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Search, Heart, Eye, MessageCircle } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import TemplateCard from '../components/TemplateCard'
import { TEMPLATES, WEDDING_TYPES } from '../data/templatesData'
import { ROUTES_SEO } from '../data/routesSeo'

const WHATSAPP_NUMBER = '918847044554'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// The dedicated, fully searchable/filterable wedding template gallery — the
// homepage's wedding section stays a lighter teaser marquee that links here
// for the complete browsing experience (see LandingPage.jsx).
export default function WeddingsPage() {
  const reduceMotion = useReducedMotion()
  const [search, setSearch] = useState('')
  const [activeWeddingType, setActiveWeddingType] = useState('All')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return TEMPLATES.filter((t) => {
      const matchesWeddingType =
        activeWeddingType === 'All' || t.weddingType === activeWeddingType
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      return matchesWeddingType && matchesSearch
    })
  }, [search, activeWeddingType])

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/weddings']} path="/weddings" />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[8%] top-10 bg-blush-deep/40" size={150} duration={11} />
              <FloatingOrb className="right-[10%] top-20 bg-gold-soft/30" size={120} duration={9} delay={1.2} />
              <FloatingIcon icon={Heart} className="right-[8%] top-14 hidden sm:block" duration={8} delay={0.8} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Heart} tone="rose">Wedding Invitations</SectionEyebrow>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-4">
              Digital Wedding Invitations for Every Tradition
            </h1>
            <p className="mx-auto max-w-xl text-ink-soft mb-8">
              {TEMPLATES.length} interactive templates spanning Hindu, Muslim,
              Sikh and more — envelope reveal, scratch-to-reveal cards, and
              built-in RSVP tracking on every single one.
            </p>

            <div className="mx-auto max-w-lg">
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or tradition — Hindu, Muslim, Sikh…"
                  className="w-full rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl py-3.5 pl-12 pr-5 text-sm text-ink placeholder:text-ink-soft/70 shadow-card focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {WEDDING_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveWeddingType(type)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    activeWeddingType === type
                      ? 'border-rose bg-rose text-ivory shadow-card'
                      : 'border-champagne-deep/50 bg-ivory/60 text-ink-soft hover:bg-champagne/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-8 text-center text-ink-soft">
              {filtered.length} template{filtered.length === 1 ? '' : 's'}{' '}
              {activeWeddingType === 'All' ? '' : `for a ${activeWeddingType} wedding`}
            </p>

            {filtered.length === 0 ? (
              <div className="mx-auto max-w-sm rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl px-8 py-12 text-center shadow-card">
                <Heart className="mx-auto mb-3 w-8 h-8 text-rose" strokeWidth={1.2} />
                <p className="text-ink-soft">
                  No templates match &ldquo;{search}&rdquo;. Try another
                  search or category.
                </p>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </motion.div>
            )}

            <div className="mt-12 flex justify-center">
              <a
                href={getWhatsAppLink("Hi! I'd like to start a digital wedding invitation.")}
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
              Message us your names, dates and details — we&rsquo;ll send
              back a live, shareable invitation in 30 minutes.
            </p>
            <a
              href={getWhatsAppLink("Hi! I'd like to get started with my digital wedding invitation.")}
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
