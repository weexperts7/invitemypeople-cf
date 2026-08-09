// A small, reusable mute/unmute icon button for the background-music
// feature (see InvitationExperience.jsx) — one shared component so the
// preview overlay's inline control and the live invitation's floating
// corner widget stay visually and behaviorally identical. Sizing/position
// are left to the caller via `className` so each context (inline in a
// bottom bar vs. fixed in a page corner) can lay it out appropriately.
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

export default function AudioToggle({ isMuted, onToggle, className = '' }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      aria-pressed={isMuted}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-ivory/80 text-ink shadow-soft backdrop-blur-xl ${className}`}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </motion.button>
  )
}
