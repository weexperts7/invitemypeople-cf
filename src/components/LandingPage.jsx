import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Search,
  ArrowRight,
  Sparkles,
  Mail,
  Smartphone,
  ClipboardCheck,
  Heart,
  IndianRupee,
  Leaf,
  Camera,
  RefreshCw,
  LayoutTemplate,
  MessageCircle,
  Timer,
  Check,
  X,
  Minus,
  Plus,
  Flame,
  Eye,
  Cake,
  Gem,
  Baby,
  Home,
  Briefcase,
  PartyPopper,
  Gift,
} from 'lucide-react'
import { TEMPLATES, WEDDING_TYPES, PRICING } from '../data/templatesData'
import { SATSANG_TEMPLATES } from '../data/satsangTemplatesData'
import TemplateCard from './TemplateCard'
import SatsangTemplateCard from './SatsangTemplateCard'
import TemplateMarquee from './TemplateMarquee'
import CustomizeModal from './CustomizeModal'
import Logo from './Logo'
import { navigate } from '../utils/navigate'

const WHATSAPP_NUMBER = '919877647707'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Rotating solid-fill tones so each badge/card/icon reads as distinct at a
// glance, instead of every element sharing the same pale blush/rose combo.
const ACCENT_TONES = [
  { bg: 'bg-rose', text: 'text-ivory' },
  { bg: 'bg-gold', text: 'text-ivory' },
  { bg: 'bg-ink', text: 'text-ivory' },
  { bg: 'bg-blush-deep', text: 'text-ink' },
  { bg: 'bg-champagne-deep', text: 'text-ink' },
]

const HIGHLIGHTS = [
  { icon: IndianRupee, label: 'Cost-Effective' },
  { icon: Leaf, label: 'Eco-Friendly Design' },
  { icon: Camera, label: 'Event Highlights' },
  { icon: RefreshCw, label: '2 Free Revisions' },
  { icon: LayoutTemplate, label: 'Ready-Made Templates' },
]

// A visible signal that the two live categories aren't the whole roadmap —
// more life-event categories are coming, not just wedding + Satsang.
const COMING_SOON_OCCASIONS = [
  { icon: Cake, label: 'Birthday Parties' },
  { icon: Gem, label: 'Engagements' },
  { icon: Baby, label: 'Baby Showers' },
  { icon: Home, label: 'Housewarmings' },
  { icon: Briefcase, label: 'Corporate Events' },
  { icon: PartyPopper, label: 'Anniversaries' },
]

const STEPS = [
  {
    icon: LayoutTemplate,
    title: 'Select a Template',
    description: 'Browse our collection and pick the design that matches your celebration.',
  },
  {
    icon: MessageCircle,
    title: 'Connect on WhatsApp',
    description: 'Send us your names, dates, and event details right on WhatsApp — no forms, no signup.',
  },
  {
    icon: Timer,
    title: 'Delivered in 30 Minutes',
    description: 'Your personalized, ready-to-share invitation lands back in your chat, fully live.',
  },
]

const COMPARISON_ROWS = [
  {
    feature: 'Interactive experience',
    ours: { state: 'yes', text: 'Envelope reveal, scratch card, animations' },
    printed: { state: 'no', text: 'Static, one-time read' },
    whatsapp: { state: 'no', text: 'Just a video, no interaction' },
  },
  {
    feature: 'Last-minute updates',
    ours: { state: 'yes', text: 'Edit instantly, anytime' },
    printed: { state: 'no', text: 'Reprint & redistribute everything' },
    whatsapp: { state: 'partial', text: 'Re-record & resend to everyone' },
  },
  {
    feature: 'Cost',
    ours: { state: 'yes', text: `₹${PRICING.shagunPrice.toLocaleString('en-IN')} all-inclusive, any celebration` },
    printed: { state: 'no', text: 'Card + printing + courier, per guest' },
    whatsapp: { state: 'partial', text: '"Free" but generic, no real design' },
  },
  {
    feature: 'Custom design',
    ours: {
      state: 'yes',
      text: `${TEMPLATES.length + SATSANG_TEMPLATES.length}+ templates across every occasion + 2 free revisions`,
    },
    printed: { state: 'partial', text: 'Limited to what the print shop offers' },
    whatsapp: { state: 'no', text: 'One-size-fits-all template' },
  },
  {
    feature: 'RSVP tracking',
    ours: { state: 'yes', text: 'Built-in dashboard, guests tap to respond' },
    printed: { state: 'no', text: 'Manual phone calls' },
    whatsapp: { state: 'no', text: 'Buried in chat replies' },
  },
]

// Cell tint + icon color are both keyed off state so each row reads at a
// glance without needing to parse the text — green/red/amber are used
// deliberately here (outside the brand's rose/gold palette) since they're
// universally understood as good/bad/partial in a comparison table.
const STATE_STYLES = {
  yes: { cell: 'bg-emerald-50', icon: 'text-emerald-600', Icon: Check },
  no: { cell: 'bg-red-50/70', icon: 'text-red-400', Icon: X },
  partial: { cell: 'bg-amber-50', icon: 'text-amber-500', Icon: Minus },
}

function ComparisonMark({ state }) {
  const { icon, Icon } = STATE_STYLES[state]
  return <Icon className={`w-4 h-4 ${icon}`} strokeWidth={2.5} />
}

// lucide-react dropped brand/logo glyphs, so social icons are hand-drawn
// SVGs here, sized and stroked to match the surrounding lucide icons.
function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/invitemypeople' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/invitemypeople' },
  { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com/@invitemypeople' },
]

const FAQS = [
  {
    question: 'How does the whole process work?',
    answer:
      'Pick a template, then message us your names, dates, and event details on WhatsApp — no forms or signups. We personalize it and send back a live, shareable link, usually within 30 minutes.',
  },
  {
    question: 'How much does it cost?',
    answer: `A personalized invitation is ₹${PRICING.price.toLocaleString('en-IN')}, or ₹${PRICING.shagunPrice.toLocaleString('en-IN')} at our launch price — all-inclusive, with no per-guest or printing costs.`,
  },
  {
    question: 'Can I make changes after I see my invitation?',
    answer:
      'Yes — every invitation includes 2 free revisions. Send us what you\'d like changed on WhatsApp and we\'ll update it and send the link back.',
  },
  {
    question: 'Do my guests need to install an app?',
    answer:
      'No. Every template is a mobile-first web page that opens straight from the shared link in any browser — no app, download, or account required.',
  },
  {
    question: 'How do RSVPs work?',
    answer:
      'Guests tap to respond right on the invitation — attendance, guest count, and blessings or wishes all flow into one dashboard, so there\'s no chasing phone calls.',
  },
  {
    question: 'Can I update details after the date changes or a venue moves?',
    answer:
      'Absolutely — message us the update on WhatsApp and we\'ll edit it live. Everyone with the link instantly sees the latest details, no reprinting or resending required.',
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

const FEATURES = [
  {
    icon: Mail,
    title: 'Interactive Envelope Reveal',
    description:
      'A tap-to-open wax-seal envelope animation turns opening your invite into a moment guests remember.',
  },
  {
    icon: Sparkles,
    title: 'Scratch-to-Reveal Cards',
    description:
      'A gold-foil scratch card reveals something special — a save-the-date, a divine blessing, whatever suits the occasion — with real, satisfying suspense.',
  },
  {
    icon: ClipboardCheck,
    title: 'Effortless RSVP Management',
    description:
      'Collect attendance, guest counts, and heartfelt wishes — all in one living dashboard.',
  },
  {
    icon: Smartphone,
    title: 'Built Mobile-First',
    description:
      'Every template is fast, fluid and beautiful on the phone in your guest’s hand — no app required.',
  },
]

function SectionEyebrow({ icon: Icon, children, tone = 'rose' }) {
  const tones = {
    rose: 'border-rose/30 bg-blush/60 text-rose',
    gold: 'border-gold-soft/50 bg-champagne/60 text-ink',
    ivory: 'border-white/60 bg-ivory/70 text-ink-soft',
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] shadow-card ${tones[tone]}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  )
}

function FloatingOrb({ className, size, duration = 10, delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-2xl ${className}`}
      style={{ width: size, height: size }}
      animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// Faint, thin-stroke glyphs drifting behind the Hero copy — envelopes, a
// heart, a gift, a flame (Satsang) — so the first fold reads as "digital
// invitations for celebrations" at a glance, before a visitor reads a word.
function FloatingIcon({ icon: Icon, className, size = 'w-9 h-9 sm:w-11 sm:h-11', duration = 9, delay = 0 }) {
  return (
    <motion.div
      className={`pointer-events-none absolute text-rose/[0.14] ${className}`}
      animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon className={size} strokeWidth={1} />
    </motion.div>
  )
}

export default function LandingPage({ onPreview }) {
  const [search, setSearch] = useState('')
  const [activeWeddingType, setActiveWeddingType] = useState('All')
  const [customizeTarget, setCustomizeTarget] = useState(null)
  const [openFaq, setOpenFaq] = useState(0)
  const reduceMotion = useReducedMotion()

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

  const handleCustomizePreview = (id) => {
    setCustomizeTarget(null)
    onPreview(id)
  }

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <main>
      {/* ---------------------------------------------------------------- */}
      {/* Hero */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {!reduceMotion && (
          <>
            <FloatingOrb className="left-[8%] top-16 bg-blush-deep/40" size={180} duration={11} />
            <FloatingOrb className="right-[10%] top-32 bg-gold-soft/30" size={140} duration={9} delay={1.4} />
            <FloatingOrb className="left-[20%] bottom-10 bg-champagne-deep/30" size={160} duration={13} delay={0.6} />

            <FloatingIcon icon={Mail} className="left-[6%] top-24 sm:left-[10%]" duration={10} />
            <FloatingIcon icon={Heart} className="right-[7%] top-20 sm:right-[12%]" duration={8} delay={1} />
            <FloatingIcon icon={Gift} className="left-[10%] bottom-20 sm:left-[15%]" duration={11} delay={0.5} />
            <FloatingIcon icon={PartyPopper} className="right-[6%] bottom-24 sm:right-[13%]" duration={9} delay={1.6} />
            <FloatingIcon icon={Gem} className="right-[20%] top-10 hidden sm:block" duration={12} delay={0.3} />
            <FloatingIcon icon={Flame} className="left-[22%] bottom-8 hidden sm:block" duration={10} delay={2} />
          </>
        )}

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 flex justify-center"
          >
            <Logo size="xl" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-ink-soft shadow-card"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            Digital Invitations For Every Celebration
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-serif text-4xl sm:text-6xl leading-[1.1] text-ink"
          >
            Invitations as unforgettable
            <br className="hidden sm:block" /> as your{' '}
            <span className="font-script text-rose text-5xl sm:text-7xl">celebration</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-ink-soft"
          >
            Interactive, mobile-first digital invitations for weddings,
            Satsangs, and every celebration in between — tap-to-open
            envelopes, scratch-to-reveal cards, and built-in RSVP management.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#templates"
              className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3.5 text-sm font-medium text-ivory shadow-soft transition-transform hover:scale-[1.03]"
            >
              <Heart className="w-4 h-4" />
              Wedding Invitations
            </a>
            <a
              href="#satsang-templates"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              <Flame className="w-4 h-4" />
              Guruji Satsang Invitations
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-5"
          >
            <a
              href={getWhatsAppLink("Hi! I'd like to start a digital invitation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-rose transition-colors"
            >
              Or tell us your occasion on WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Wedding template scroller — auto-scrolling, pauses on hover/touch */}
      {/* ---------------------------------------------------------------- */}
      <section id="templates" className="bg-ivory pt-16 sm:pt-20 pb-8 scroll-mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 px-6"
        >
          <div className="mb-4 flex justify-center">
            <SectionEyebrow icon={Heart} tone="rose">Wedding Invitations</SectionEyebrow>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
            Choose Your Style
          </h2>
          <p className="text-ink-soft mb-8">
            {filtered.length} template{filtered.length === 1 ? '' : 's'}{' '}
            {activeWeddingType === 'All' ? '' : `for a ${activeWeddingType} wedding`} —
            every one fully interactive
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
        </motion.div>

        {filtered.length === 0 ? (
          <div className="mx-auto max-w-sm rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl px-8 py-12 text-center shadow-card">
            <Heart className="mx-auto mb-3 w-8 h-8 text-rose" strokeWidth={1.2} />
            <p className="text-ink-soft">
              No templates match &ldquo;{search}&rdquo;. Try another search
              or category.
            </p>
          </div>
        ) : (
          <TemplateMarquee
            items={filtered}
            keyExtractor={(t) => t.id}
            itemWidth={300}
            renderItem={(template) => (
              <TemplateCard
                template={template}
                onPreview={onPreview}
                onCustomize={setCustomizeTarget}
              />
            )}
          />
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Guruji Satsang template scroller — same treatment, equal billing */}
      {/* ---------------------------------------------------------------- */}
      <section id="satsang-templates" className="bg-champagne/50 pt-16 sm:pt-20 pb-16 sm:pb-20 scroll-mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 px-6"
        >
          <div className="mb-4 flex justify-center">
            <SectionEyebrow icon={Flame} tone="gold">Guruji Satsang Invitations</SectionEyebrow>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
            Devotional Templates
          </h2>
          <p className="text-ink-soft">
            {SATSANG_TEMPLATES.length} template{SATSANG_TEMPLATES.length === 1 ? '' : 's'} —
            Guruji&rsquo;s photo, a live Divine Blessing scratch card and RSVP built in
          </p>
        </motion.div>

        <TemplateMarquee
          items={SATSANG_TEMPLATES}
          keyExtractor={(t) => t.slug}
          itemWidth={300}
          secondsPerItem={7}
          reverse
          renderItem={(template) => (
            <SatsangTemplateCard
              template={template}
              onExplore={(slug) => navigate(`/satsang/${slug}`)}
              whatsappHref={getWhatsAppLink(
                `Hi! I'd like to create a "${template.name}" Satsang invitation.`,
              )}
            />
          )}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-8 flex justify-center px-6"
        >
          <a
            href={getWhatsAppLink("Hi! I'd like to start a Guruji Satsang invitation.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/60 bg-ivory/70 px-6 py-3 text-sm font-medium text-ink shadow-card transition-colors hover:bg-champagne/40"
          >
            <Eye className="w-4 h-4" />
            Not sure which one? Ask us on WhatsApp
          </a>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* More celebrations, coming soon — signals this is a platform for   */}
      {/* every occasion, not just the two categories live today            */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-ivory px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Sparkles} tone="gold">The Roadmap</SectionEyebrow>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
              More Celebrations, Coming Soon
            </h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              Weddings and Guruji Satsangs are live today — we&rsquo;re building
              digital invitations for every celebration next.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            {COMING_SOON_OCCASIONS.map((occasion) => {
              const Icon = occasion.icon
              return (
                <span
                  key={occasion.label}
                  className="inline-flex items-center gap-2.5 rounded-full border border-dashed border-champagne-deep/60 bg-ivory/50 pl-2 pr-4 py-2 text-sm text-ink-soft"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-champagne/60 text-ink-soft">
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </span>
                  {occasion.label}
                  <span className="text-[9px] uppercase tracking-[0.15em] text-ink-soft/60">Soon</span>
                </span>
              )
            })}
          </motion.div>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            href={getWhatsAppLink("Hi! I'd like you to build a digital invitation for my event — here's the occasion:")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/60 bg-ivory/70 px-6 py-3 text-sm font-medium text-ink shadow-card transition-colors hover:bg-champagne/40"
          >
            <MessageCircle className="w-4 h-4" />
            Request Your Occasion on WhatsApp
          </motion.a>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Reinvented — value proposition + highlight badges + CTAs */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-champagne/50 via-blush/20 to-transparent px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex justify-center"
          >
            <SectionEyebrow icon={Sparkles} tone="gold">Why InviteMyPeople</SectionEyebrow>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl sm:text-5xl text-ink mb-4"
          >
            The Invitation,
            <br className="hidden sm:block" /> <span className="text-rose">Reinvented.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-ink-soft mb-10"
          >
            Budget-friendly, eco-friendly, and ultra-fast — everything a
            paper card and a WhatsApp forward could never be.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10"
          >
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon
              const tone = ACCENT_TONES[i % ACCENT_TONES.length]
              return (
                <span
                  key={h.label}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-ivory pl-2 pr-4 py-2 text-sm font-medium text-ink shadow-card"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${tone.bg} ${tone.text}`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </span>
                  {h.label}
                </span>
              )
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={getWhatsAppLink("Hi! I'd like to start my digital invitation.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3.5 text-sm font-medium text-ivory shadow-soft transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="w-4 h-4" />
              Start on WhatsApp
            </a>
            <a
              href="#templates"
              className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/60 bg-ivory/70 px-7 py-3.5 text-sm font-medium text-ink shadow-card transition-colors hover:bg-champagne/40"
            >
              Browse Templates
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How It Works */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-blush/30 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Timer} tone="gold">The Process</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">How It Works</h2>
            <p className="text-ink-soft">Three steps, thirty minutes, done.</p>
          </motion.div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            {!reduceMotion && (
              <div className="pointer-events-none absolute left-0 right-0 top-16 hidden sm:block">
                <div className="mx-[16.6%] h-1 rounded-full bg-gradient-to-r from-rose via-gold to-rose opacity-40" />
              </div>
            )}
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const tone = ACCENT_TONES[i % ACCENT_TONES.length]
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col items-center text-center rounded-3xl bg-ivory border border-white/70 shadow-card px-6 py-8"
                >
                  <span
                    className={`relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-card ${tone.bg} ${tone.text}`}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </span>
                  <span className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose">
                    Step {i + 1}
                  </span>
                  <h3 className="font-serif text-xl text-ink mb-2">{step.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Why Choose Us — comparison */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-ivory px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Sparkles} tone="rose">The Comparison</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">Why Choose Us</h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              A printed card and a WhatsApp forward both feel like an
              invitation — until you compare what they can actually do.
              <span className="block mt-1 text-xs">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">● Yes</span>
                {'  '}
                <span className="inline-flex items-center gap-1 text-amber-500 font-medium">● Partial</span>
                {'  '}
                <span className="inline-flex items-center gap-1 text-red-400 font-medium">● No</span>
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-x-auto rounded-3xl border border-white/70 bg-ivory shadow-soft"
          >
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left font-serif text-base text-ink bg-ivory">Feature</th>
                  <th className="px-5 py-4 text-center font-serif text-base text-ivory bg-rose">
                    <span className="block">Our Digital Invite</span>
                    <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-blush font-normal">
                      Best Choice
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center font-serif text-base text-ink-soft bg-champagne/30">
                    Printed Cards
                  </th>
                  <th className="px-5 py-4 text-center font-serif text-base text-ink-soft bg-champagne/30">
                    WhatsApp Videos
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="border-t border-champagne-deep/20">
                    <td className="px-5 py-4 text-ink font-medium whitespace-nowrap bg-ivory">
                      {row.feature}
                    </td>
                    <td className="px-5 py-4 bg-blush/30 border-x-2 border-rose/20">
                      <div className="flex items-start justify-center gap-2 text-center">
                        <ComparisonMark state={row.ours.state} />
                        <span className="text-ink text-xs sm:text-sm font-medium">{row.ours.text}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${STATE_STYLES[row.printed.state].cell}`}>
                      <div className="flex items-start justify-center gap-2 text-center">
                        <ComparisonMark state={row.printed.state} />
                        <span className="text-ink-soft text-xs sm:text-sm">{row.printed.text}</span>
                      </div>
                    </td>
                    <td className={`px-5 py-4 ${STATE_STYLES[row.whatsapp.state].cell}`}>
                      <div className="flex items-start justify-center gap-2 text-center">
                        <ComparisonMark state={row.whatsapp.state} />
                        <span className="text-ink-soft text-xs sm:text-sm">{row.whatsapp.text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-champagne/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Heart} tone="rose">What's Included</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
              Everything Your Guests Will Remember
            </h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              Every template ships with the same thoughtful features — no
              add-ons, no fine print.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              const tone = ACCENT_TONES[i % ACCENT_TONES.length]
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="rounded-3xl border border-white/70 bg-ivory p-6 shadow-card"
                >
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tone.bg} ${tone.text}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-serif text-lg text-ink mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
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
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-soft/40 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold-soft">
              <Sparkles className="w-3.5 h-3.5" />
              Get Started Today
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-ivory mb-4">
            Ready when you are.
          </h2>
          <p className="mx-auto max-w-lg text-white/70 mb-9">
            Message us on WhatsApp with your event details, or pick a
            template to preview first — either way, you&rsquo;ll have a
            live invitation in 30 minutes.
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
            <a
              href="#templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-white/10"
            >
              Browse Templates
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ */}
      {/* ---------------------------------------------------------------- */}
      <section id="faq" className="bg-blush/40 px-6 py-20 sm:py-24 scroll-mt-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={MessageCircle} tone="rose">Got Questions</SectionEyebrow>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-ink-soft">
              Everything you need to know before you get started.
            </p>
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
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq((prev) => (prev === i ? -1 : i))}
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
              href={getWhatsAppLink("Hi! I have a question about my digital invitation.")}
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

      {/* ---------------------------------------------------------------- */}
      {/* Footer */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-champagne-deep/40 bg-ivory px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <Logo size="lg" className="mb-3" />
              <p className="text-sm text-ink-soft max-w-xs leading-relaxed">
                Beautifully interactive digital invitations for every
                celebration — designed to feel as personal as the moment
                itself.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href="mailto:hello@invitemypeople.com"
                  aria-label="Email"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppLink("Hi! I'd like to get started with my digital invitation.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
                Quick Links
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#templates" className="text-ink-soft hover:text-rose transition-colors">
                    Browse Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="text-ink-soft hover:text-rose transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@invitemypeople.com"
                    className="text-ink-soft hover:text-rose transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-ink-soft hover:text-rose transition-colors">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
                Follow Us
              </p>
              <ul className="space-y-2.5 text-sm">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-soft hover:text-rose transition-colors"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
                Legal
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="text-ink-soft hover:text-rose transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-ink-soft hover:text-rose transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-champagne-deep/30 pt-6 text-xs text-ink-soft">
            <p>&copy; {new Date().getFullYear()} InviteMyPeople. Crafted with love.</p>
            <p className="flex items-center gap-1.5">
              Made with love, by hand
              <Heart className="w-3.5 h-3.5 text-rose" fill="currentColor" />
            </p>
          </div>
        </div>
      </footer>

      <CustomizeModal
        template={customizeTarget}
        onClose={() => setCustomizeTarget(null)}
        onPreview={handleCustomizePreview}
      />

      <motion.a
        href={getWhatsAppLink("Hi! I'd like to know more about InviteMyPeople.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[70] flex h-14 w-14 items-center justify-center rounded-full shadow-soft"
        style={{ backgroundColor: '#25D366' }}
      >
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: '#25D366' }}
            animate={{ scale: [1, 1.6], opacity: [0.55, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <MessageCircle className="relative w-6 h-6 text-ivory" strokeWidth={2} />
      </motion.a>
    </div>
  )
}
