import { motion } from 'framer-motion'

// An optional gold-ringed medallion portrait for the welcome hero — mirrors
// GurujiPhoto's treatment so devotional and celebratory templates share the
// same "framed portrait" language. Opt-in via a template's `heroPhoto` field
// (see src/data/templatesData.js), so templates that don't set one keep the
// current text-only hero untouched.
export default function CouplePhoto({ src, alt, size = 152, palette, halo = true, className = '' }) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {halo && (
        <span
          className="pointer-events-none absolute inset-[-18%] rounded-full blur-xl"
          style={{ background: `${palette?.goldSoft ?? '#ddc186'}55` }}
        />
      )}

      <span
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 shadow-soft"
        style={{
          borderColor: palette?.gold ?? '#c9a24b',
          background: palette?.champagne ?? '#f0e2c8',
        }}
      >
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </span>

      <span
        className="pointer-events-none absolute inset-[-6%] rounded-full border"
        style={{ borderColor: `${palette?.goldSoft ?? '#e2c884'}99` }}
      />
    </motion.div>
  )
}
