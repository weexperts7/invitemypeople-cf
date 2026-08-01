import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Wand2, Mail, Eye } from 'lucide-react'

export default function CustomizeModal({ template, onClose, onPreview }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {template && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-ivory/80 backdrop-blur-2xl p-7 text-center shadow-soft"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory/70 text-ink hover:text-rose"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={reduceMotion ? undefined : { scale: 0, rotate: -30 }}
              animate={reduceMotion ? undefined : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.1 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush border border-gold-soft shadow-card"
            >
              <Wand2 className="w-6 h-6 text-rose" strokeWidth={1.5} />
            </motion.div>

            <h3 className="font-serif text-2xl text-ink mb-2">
              Customize &ldquo;{template.name}&rdquo;
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed mb-6">
              Our customization studio is launching soon — swap in your own
              names, dates, photos and colors. Get in touch and we&rsquo;ll set
              this template up for your big day.
            </p>

            <div className="flex flex-col gap-2.5">
              <motion.a
                href="mailto:hello@vivahastudio.com?subject=Customize%20the%20template"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-medium text-ivory shadow-card"
              >
                <Mail className="w-4 h-4" />
                Get in Touch
              </motion.a>
              <motion.button
                type="button"
                onClick={() => onPreview(template.id)}
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-full border border-champagne-deep/60 px-5 py-3 text-sm font-medium text-ink hover:bg-champagne/40"
              >
                <Eye className="w-4 h-4" />
                View Live Preview Instead
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
