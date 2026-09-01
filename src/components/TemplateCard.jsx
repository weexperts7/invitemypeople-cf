import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Eye, Wand2, BadgeCheck, Sparkles } from 'lucide-react'
import TemplateShowcase from './TemplateShowcase'
import { PRICING } from '../data/templatesData'
import { getActivePrice, isSaleActive } from '../data/sale'
import { findBuilderTemplateBySource } from '../data/builderTemplates'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'
import { buildCreateLink } from '../utils/createLink'

// Every WhatsApp CTA site-wide reaches this same business number (see
// SiteHeader.jsx/SiteFooter.jsx/WeddingsPage.jsx, all
// `const WHATSAPP_NUMBER = '918847044554'`).
const WHATSAPP_NUMBER = '918847044554'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function TemplateCard({ template }) {
  const reduceMotion = useReducedMotion()

  // template.id here is the TEMPLATES catalog id (e.g. "rajasthani-royal"),
  // not the builder/pricing key ("wedding-rajasthani-royal") — see
  // findBuilderTemplateBySource()'s own comment. Resolve it once so this
  // card can look itself up in the Super Admin price overrides the exact
  // same way checkout does.
  const builderTemplate = findBuilderTemplateBySource('wedding', template.id)
  const overrides = useTemplatePriceOverrides()
  // Mahogany Seal (see its own templatesData.js entry) has no self-serve
  // checkout at all — it's a WhatsApp lead-capture flow, not `/create` —
  // so none of the machinery above (builder templates, Super Admin
  // per-template overrides, the site-wide launch sale) has anywhere to
  // apply. `originalPrice`/`salePrice` let a template set its own fixed
  // price straight on its catalog entry instead; every other template
  // leaves both unset and falls back to exactly what this computed before.
  const originalPrice = template.originalPrice ?? PRICING.price
  const activePrice = template.salePrice ?? (builderTemplate && overrides[builderTemplate.id]) ?? getActivePrice()
  const saleLive = isSaleActive()
  // Only meaningful as a "launch sale" badge when this template is actually
  // cheaper than its own standing price — see CreateInvitePage.jsx's
  // identical guard for why an admin override can't render as a
  // negative-percent sale.
  const savingsPercent =
    activePrice < originalPrice ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl shadow-card transition-shadow duration-300 hover:shadow-soft"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <TemplateShowcase template={template} />
        </div>

        {/* Stacked as a flex column (not two independently `top-*`
            positioned spans) so a second badge just slots in below the
            first regardless of either one's text length — no pixel-offset
            guessing required. */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <span className="rounded-full border border-white/50 bg-ivory/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink shadow-card">
            {template.weddingType}
          </span>
          {/* Templates whose catalog thumbnail shows a real caricature
              photo instead of the usual palette card (see `cardImage` on
              this template's own templatesData.js entry) get an extra
              chip calling that out explicitly — a browser glancing at a
              grid of similar-looking cards shouldn't have to guess that
              this one's actually a 3D animated caricature, not a flat
              illustration. */}
          {template.previewBadge && (
            <span className="flex items-center gap-1 rounded-full border border-white/50 bg-ivory/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink shadow-card">
              <Sparkles className="w-3 h-3 text-rose" />
              {template.previewBadge}
            </span>
          )}
        </div>

        {template.isFlagship && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-rose/90 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ivory shadow-card">
            <BadgeCheck className="w-3 h-3" />
            Signature
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-xl text-ink">{template.name}</h3>
          <p className="mt-1.5 text-sm text-ink-soft leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-serif text-lg text-rose">
            &#8377;{activePrice.toLocaleString('en-IN')}
          </span>
          {/* An admin override (or a template's own fixed `originalPrice`)
              can price a template at or above the standing price — e.g. a
              premium template — in which case a strikethrough/"Save X%"
              badge would be nonsensical, so both only render when this
              template is genuinely cheaper than its own original price. */}
          {activePrice < originalPrice && (
            <>
              <span className="text-sm text-ink-soft/70 line-through">
                &#8377;{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-rose">
                {saleLive ? `Save ${savingsPercent}%` : 'Shagun Price'}
              </span>
            </>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1"
          >
            <Link
              to={`/templates/wedding/${template.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-ivory shadow-card"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </Link>
          </motion.div>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1"
          >
            {/* `customizeWhatsAppMessage` is a per-template override (see
                templatesData.js's own comment on Mahogany Seal's
                `hasOwnCreateCta`/`customizeWhatsAppMessage` pair) for
                templates whose checkout doesn't go through the
                self-service builder at all — opens a WhatsApp chat
                directly, an instant lead, rather than `buildCreateLink()`'s
                usual `/create` builder link. A plain `<a>`, not `<Link>`:
                react-router's `Link` is for in-app routes, not external
                `https://wa.me/...` URLs. Every other template has no
                override and keeps the exact `Link` it always had. */}
            {template.customizeWhatsAppMessage ? (
              <a
                href={getWhatsAppLink(template.customizeWhatsAppMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-champagne-deep/60 bg-ivory/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-champagne/40"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Customize
              </a>
            ) : (
              <Link
                to={buildCreateLink({ occasion: 'wedding', sourceId: template.id })}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-champagne-deep/60 bg-ivory/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-champagne/40"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Customize
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
