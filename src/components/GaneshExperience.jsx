import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getGaneshLayoutComponent } from './ganesh/layoutRegistry'
import LegacyGaneshExperience from './ganesh/LegacyGaneshExperience'

// Dispatches a Ganesh Chaturthi template to its bespoke experience
// component (see ganesh/layoutRegistry.js) by the template's optional
// `layout` field, falling back to the shared legacy layout for templates
// that don't declare one. Mirrors SatsangExperience.jsx's role for the
// Satsang category.
export default function GaneshExperience({ template }) {
  const navigate = useNavigate()

  if (!template) {
    return (
      <div className="min-h-svh w-full bg-linen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl text-ink">This Ganesh Chaturthi invitation couldn&rsquo;t be found.</p>
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

  const Layout = getGaneshLayoutComponent(template.layout) ?? LegacyGaneshExperience

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
