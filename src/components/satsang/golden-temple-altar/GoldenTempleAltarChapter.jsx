import { motion } from 'framer-motion'

// The recurring "storybook chapter" wrapper: a numeral medallion, a title
// flanked by hairline rules, and an optional icon — giving the page a
// step-by-step sequential rhythm distinct from both the Royal Peacock's
// symmetric panel flow and the Saffron Lotus's editorial whitespace.
export default function GoldenTempleAltarChapter({ numeral, title, icon: Icon, gold, children, className = '' }) {
  return (
    <section className={`px-6 py-12 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-7"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-serif text-sm"
          style={{ borderColor: gold, color: gold }}
        >
          {numeral}
        </span>
        <span className="flex-1 h-px" style={{ background: `${gold}55` }} />
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: gold }} strokeWidth={1.6} />}
        <h2 className="font-serif text-xl sm:text-2xl text-ink whitespace-nowrap">{title}</h2>
        <span className="flex-1 h-px" style={{ background: `${gold}55` }} />
      </motion.div>
      {children}
    </section>
  )
}
