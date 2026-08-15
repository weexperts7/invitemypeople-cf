import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Eye, Wand2, BadgeCheck } from 'lucide-react'
import GaneshShowcase from './GaneshShowcase'
import { buildCreateLink } from '../utils/createLink'

export default function GaneshTemplateCard({ template }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl shadow-card transition-shadow duration-300 hover:shadow-soft"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <GaneshShowcase template={template} />
        </div>

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/50 bg-ivory/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink shadow-card">
          <BadgeCheck className="w-3 h-3" />
          Ganesh Chaturthi
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-xl text-ink">{template.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.15em] text-rose">{template.tagline}</p>
          <p className="mt-1.5 text-sm text-ink-soft leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blush px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-rose"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1"
          >
            <Link
              to={`/templates/ganesh-chaturthi/${template.slug}`}
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
            <Link
              to={buildCreateLink({ occasion: 'ganesh-chaturthi', sourceId: template.slug })}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-champagne-deep/60 bg-ivory/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-champagne/40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Customize
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
