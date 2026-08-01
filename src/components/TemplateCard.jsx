import { motion, useReducedMotion } from 'framer-motion'
import { Eye, Wand2, BadgeCheck } from 'lucide-react'
import TemplateShowcase from './TemplateShowcase'
import { PRICING } from '../data/templatesData'

export default function TemplateCard({ template, onPreview, onCustomize }) {
  const reduceMotion = useReducedMotion()

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

        <span className="absolute left-3 top-3 rounded-full border border-white/50 bg-ivory/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink shadow-card">
          {template.weddingType}
        </span>

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

        <div className="flex items-baseline gap-2">
          <span className="font-serif text-lg text-rose">
            &#8377;{PRICING.shagunPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-sm text-ink-soft/70 line-through">
            &#8377;{PRICING.price.toLocaleString('en-IN')}
          </span>
          <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-rose">
            Shagun Price
          </span>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <motion.button
            type="button"
            onClick={() => onPreview(template.id)}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-ivory shadow-card"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onCustomize(template)}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-champagne-deep/60 bg-ivory/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-champagne/40"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Customize
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
