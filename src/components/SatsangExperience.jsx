import { motion } from 'framer-motion'
import { ArrowLeft, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getSatsangLayoutComponent } from './satsang/layoutRegistry'
import LegacySatsangExperience from './satsang/LegacySatsangExperience'
import { buildCreateLink } from '../utils/createLink'
import { getActivePrice } from '../data/sale'

// Dispatches a Satsang template to its bespoke experience component (see
// satsang/layoutRegistry.js) by the template's optional `layout` field,
// falling back to the original shared layout for templates that don't
// declare one yet. Each bespoke component owns its own structure, CSS, and
// interactive presentation — this file just decides which one to render.
export default function SatsangExperience({ template }) {
  const navigate = useNavigate()

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

      {/* Every Satsang template lives at its own directly-linkable page
          rather than behind an in-app preview overlay (see App.jsx's
          previewId, used only for wedding templates) — so unlike
          InvitationExperience.jsx's floating "Create Your Own" bar, this CTA never
          has to fight a preview overlay for the route to actually show. A
          small floating pill (not a full-width bottom bar) so it never
          fights each bespoke layout's own footer/RSVP content for space —
          same floating-over-content pattern as the site-wide WhatsApp
          button (see LandingPage.jsx). Label/icon match
          InvitationExperience.jsx's own CTA — same "Create Your Own —
          price" copy site-wide rather than this occasion alone saying
          "Customize This Template". */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[70]"
      >
        <Link
          to={buildCreateLink({ occasion: 'guruji-satsang', sourceId: template.slug })}
          className="flex items-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-soft"
        >
          <Heart className="w-4 h-4" />
          Create Your Own — &#8377;{getActivePrice().toLocaleString('en-IN')}
        </Link>
      </motion.div>

      <Layout template={template} />
    </>
  )
}
