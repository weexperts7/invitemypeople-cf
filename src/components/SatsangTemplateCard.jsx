import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import SatsangShowcase from './SatsangShowcase'

// Not clickable into a live Preview/Customize flow right now — Guruji
// Satsang templates are fully built (SatsangShowcase below is the real
// template art, not a placeholder) but deliberately not advertised yet
// ahead of the ad campaign launch (see routesSeo.js's COMING_SOON_ROUTES
// comment for the full picture: GaneshTemplateCard.jsx mirrors this exact
// treatment). The card still shows real template art/name/tags to build
// anticipation — only the two action buttons are gone, replaced with a
// single "Launching Soon" link to the dedicated landing page.
export default function SatsangTemplateCard({ template }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl shadow-card"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {/* No hover-zoom/lift here (unlike TemplateCard.jsx) — those cues
            read as "this is interactive," which this card no longer is. */}
        <SatsangShowcase template={template} />

        {/* Dims the art slightly so the centered "Launching Soon" badge
            below reads clearly over any template's art, light or dark. */}
        <div className="pointer-events-none absolute inset-0 bg-ink/25" />

        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/50 bg-ivory/70 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink shadow-card">
          <Sparkles className="w-3 h-3" />
          Satsang
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-ink/60 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ivory backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-soft" />
          Launching Soon
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

        <div className="mt-auto pt-2">
          <Link
            to="/guruji-satsang-invites"
            className="flex items-center justify-center gap-1.5 rounded-full border border-champagne-deep/60 bg-ivory/70 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-champagne/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Notify Me When It's Live
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
