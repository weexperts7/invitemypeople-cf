import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun } from 'lucide-react'
import { GURUJI_PHOTO_SRC } from '../data/satsangTemplatesData'

// Guruji's photo, framed in a gold-ringed medallion — his presence is the
// first thing a guest should see on a Satsang invitation, so this is meant
// to be rendered large and near the top (see SatsangExperience.jsx) with a
// small matching version in the landing-page preview (SatsangShowcase.jsx).
//
// Falls back to a devotional placeholder glyph if public/images/guruji-photo.jpg
// hasn't been added yet, the same drop-in-and-it-just-works pattern this repo
// already uses for background-music.mp3 (see InvitationExperience.jsx).
export default function GurujiPhoto({ size = 160, palette, halo = true, className = '' }) {
  const [errored, setErrored] = useState(false)

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
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
        {!errored ? (
          <img
            src={GURUJI_PHOTO_SRC}
            alt="Guruji portrait featured on the Satsang invitation"
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <Sun
            className="h-1/2 w-1/2"
            style={{ color: palette?.gold ?? '#c9a24b' }}
            strokeWidth={1.2}
          />
        )}
      </span>
    </motion.div>
  )
}
