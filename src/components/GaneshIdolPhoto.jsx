import { useState } from 'react'
import { motion } from 'framer-motion'
import { GaneshIcon } from './icons/GaneshIcon'
import { GANESH_IDOL_PHOTO_SRC } from '../data/ganeshTemplatesData'

// Bappa's idol photo, framed in a gold-ringed medallion — same drop-in
// pattern as GurujiPhoto.jsx. Falls back to a devotional modak glyph if
// public/images/ganesh-idol.jpg hasn't been added yet.
export default function GaneshIdolPhoto({ size = 160, palette, halo = true, className = '' }) {
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
          style={{ background: `${palette?.goldSoft ?? '#eec26a'}55` }}
        />
      )}

      <span
        className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4"
        style={{
          borderColor: palette?.gold ?? '#d9932e',
          background: palette?.champagne ?? '#fbdc9e',
          boxShadow: '0 0 0 3px rgba(10,4,2,0.4), 0 8px 22px rgba(10,4,2,0.5)',
        }}
      >
        {!errored ? (
          <img
            src={GANESH_IDOL_PHOTO_SRC}
            alt="Ganpati Bappa idol featured on the Ganesh Chaturthi invitation"
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <GaneshIcon
            className="h-1/2 w-1/2"
            style={{ color: palette?.gold ?? '#d9932e' }}
            strokeWidth={1.2}
          />
        )}
      </span>
    </motion.div>
  )
}
