import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, Flame, Flower2, HandHeart, MessageCircleHeart, Sparkles } from 'lucide-react'
import { FoldedHandsIcon } from './icons/FoldedHandsIcon'
import { GURUJI_PHOTO_SRC, SATSANG_TEMPLATES } from '../data/satsangTemplatesData'
import { findBuilderTemplateBySource } from '../data/builderTemplates'
import { getDefaultPrice, getListPrice } from '../data/sale'
import { buildCreateLink } from '../utils/createLink'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'

const OCCASION = 'guruji-satsang'
const FEATURES = [
  { icon: Flame, label: 'Light the jyot to open Guruji’s darshan' },
  { icon: Sparkles, label: 'Chant together on the Sangat Jaap' },
  { icon: Flower2, label: 'Open a rose to receive Guruji’s vachan' },
  { icon: HandHeart, label: 'RSVP and offer seva in one step' },
  { icon: MessageCircleHeart, label: 'A Shukrana Wall for the whole sangat' },
]

// The opening screen of the real invite, drawn small so the home page shows
// the actual design without loading the whole experience.
function InvitePhone({ template, to }) {
  return (
    <Link
      to={to}
      aria-label={`Preview the ${template.name} invitation`}
      className="group relative block w-[232px] shrink-0 rounded-[2.4rem] bg-[#16060c] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative flex h-[440px] flex-col items-center justify-center overflow-hidden rounded-[1.9rem] bg-[radial-gradient(circle_at_50%_34%,#a81c45_0%,#5e0e26_48%,#26060f_100%)] px-3 pb-10 text-center">
        <div
          aria-hidden="true"
          className="absolute -inset-1/2 opacity-40 motion-safe:animate-[spin_70s_linear_infinite] bg-[repeating-conic-gradient(from_0deg,rgba(255,226,170,0.2)_0deg_9deg,transparent_9deg_24deg)]"
        />
        <img
          src={GURUJI_PHOTO_SRC}
          alt="Guruji"
          loading="lazy"
          className="relative h-32 w-32 rounded-full object-cover object-[50%_30%] shadow-[0_0_0_2px_#f6d488,0_0_0_6px_rgba(71,12,30,0.75),0_0_0_7px_#f6d488]"
        />
        <p className="relative mt-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f6d488]">
          {template.greeting.symbol} {template.greeting.line}
        </p>
        <p className="relative mt-1 whitespace-nowrap font-script text-[25px] leading-tight text-white">{template.host.familyName}</p>
        <p className="relative mt-1 font-serif text-sm italic text-ivory">invite you to Guruji&rsquo;s Satsang</p>
        <p className="relative mt-3 whitespace-nowrap border-y border-[#f6d488]/50 px-2 py-1 text-[11px] font-medium tracking-wide text-[#f6d488]">
          {template.event.date}
        </p>
        <span className="absolute bottom-4 inline-flex items-center gap-1.5 rounded-full bg-ivory/95 px-3.5 py-1.5 text-xs font-semibold text-rose shadow-card transition-transform group-hover:scale-105">
          <Eye className="h-3.5 w-3.5" />
          Tap to preview
        </span>
      </div>
    </Link>
  )
}

// The one Guruji Satsang template that can be bought today. Picks up whichever
// template has `fullExperience`, so nothing here changes until it's replaced
// by a gallery once there are more to choose from.
export default function SatsangSpotlight() {
  const priceOverrides = useTemplatePriceOverrides()
  const template = SATSANG_TEMPLATES.find((t) => t.fullExperience)
  if (!template) return null

  const previewPath = `/satsang/${template.slug}`
  const builderTemplate = findBuilderTemplateBySource(OCCASION, template.slug)
  const price = (builderTemplate && priceOverrides[builderTemplate.id]) ?? getDefaultPrice(builderTemplate?.id)
  const listPrice = getListPrice(builderTemplate?.id)

  return (
    <section id="satsang-templates" className="bg-champagne/50 px-4 py-12 sm:px-6 sm:py-16 scroll-mt-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-5xl items-center gap-8 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_78%_40%,#7a1633_0%,#47101f_52%,#26060f_100%)] px-6 py-8 shadow-soft sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:gap-12"
      >
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-soft/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-soft">
            <FoldedHandsIcon className="h-3.5 w-3.5" />
            Guruji Satsang Invitation
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-ivory sm:text-4xl">
            An invitation your sangat will feel
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ivory/85">
            {template.name}: one link that brings your satsang to life on every phone.
          </p>

          <ul className="mt-5 grid gap-2.5 text-left text-sm text-ivory/90">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-soft" />
                {label}
              </li>
            ))}
          </ul>

          <p className="mt-6 flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 md:justify-start">
            {listPrice > price && (
              <span className="text-lg text-ivory/60 line-through">&#8377;{listPrice.toLocaleString('en-IN')}</span>
            )}
            <span className="font-serif text-4xl text-gold-soft">&#8377;{price.toLocaleString('en-IN')}</span>
            <span className="text-sm text-ivory/85">special price for Guruji&rsquo;s sangat</span>
          </p>

          <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
            <Link
              to={buildCreateLink({ occasion: OCCASION, sourceId: template.slug })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              Create Your Invite — &#8377;{price.toLocaleString('en-IN')}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={previewPath}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/40 px-6 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-ivory/10"
            >
              <Eye className="h-4 w-4" />
              Preview the Invitation
            </Link>
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <InvitePhone template={template} to={previewPath} />
        </div>
      </motion.div>
    </section>
  )
}
