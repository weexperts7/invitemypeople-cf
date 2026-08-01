import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { navigate } from '../utils/navigate'
import { getSatsangLayoutComponent } from './satsang/layoutRegistry'
import LegacySatsangExperience from './satsang/LegacySatsangExperience'

// Dispatches a Satsang template to its bespoke experience component (see
// satsang/layoutRegistry.js) by the template's optional `layout` field,
// falling back to the original shared layout for templates that don't
// declare one yet. Each bespoke component owns its own structure, CSS, and
// interactive presentation — this file just decides which one to render.
export default function SatsangExperience({ template }) {
  if (!template) {
    return (
      <div className="min-h-svh w-full bg-linen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl text-ink">This Satsang invitation couldn&rsquo;t be found.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-ivory shadow-card"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    )
  }

  const Layout = getSatsangLayoutComponent(template.layout) ?? LegacySatsangExperience

  return (
    <>
      <motion.button
        type="button"
        onClick={() => navigate('/')}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.96 }}
        className="fixed top-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-sm text-ink shadow-card"
      >
        <ArrowLeft className="w-4 h-4" />
        All Invitations
      </motion.button>
      <Layout template={template} />
    </>
  )
}
