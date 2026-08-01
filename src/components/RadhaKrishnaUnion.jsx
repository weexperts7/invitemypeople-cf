// A devotional envelope-opening moment unique to the Vrindavan Divine
// template (motif: 'lotus-peacock'): a real public-domain miniature
// painting of Radha and Krishna embracing — not an illustration — split
// into two halves that glide in from opposite sides and reassemble into
// the complete artwork at the center, in front of the envelope.
//
// Source: "Radha and Krishna Embracing in a Bower", Folio from a Gita
// Govinda manuscript, Malwa school, India, c. 1605. Public domain —
// released by LACMA under its "Public Domain High Resolution Image
// Available" mark, via Wikimedia Commons:
// https://commons.wikimedia.org/wiki/File:Radha_and_Krishna_Embracing_in_a_Bower,_Folio_from_a_Gita_Govinda_(Song_of_the_Cowherd)_LACMA_M.81.27.jpg
// The asset here (public/images/radha-krishna-embrace.jpg) is a crop of
// that painting focused on the embrace itself.
//
// Each half sits inside a wrapper that centers the PAIR with a static CSS
// transform (Tailwind's translate utilities), while the inner motion.div
// only animates its `x` offset from that centered, flex-laid-out resting
// position. Animating `x` directly on an element that also needs
// `-translate-x-1/2` for centering doesn't work — Framer Motion writes the
// whole `transform` to inline style, which replaces rather than combines
// with a class-based transform.
import { motion } from 'framer-motion'

const IMAGE_SRC = '/images/radha-krishna-embrace.jpg'
const DISPLAY_WIDTH = 200
const DISPLAY_HEIGHT = 238
const HALF_WIDTH = DISPLAY_WIDTH / 2

function ImageHalf({ side, active }) {
  const isLeft = side === 'left'

  return (
    <motion.div
      initial={{ x: isLeft ? -240 : 240, opacity: 0, rotate: isLeft ? -6 : 6 }}
      animate={
        active
          ? { x: 0, opacity: 1, rotate: 0 }
          : { x: isLeft ? -240 : 240, opacity: 0, rotate: isLeft ? -6 : 6 }
      }
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      className={`overflow-hidden border-y shadow-soft border-gold-soft/70 ${
        isLeft ? 'rounded-l-xl border-l' : 'rounded-r-xl border-r'
      }`}
      style={{ width: HALF_WIDTH, height: DISPLAY_HEIGHT }}
    >
      <div
        style={{
          width: DISPLAY_WIDTH,
          height: DISPLAY_HEIGHT,
          backgroundImage: `url(${IMAGE_SRC})`,
          backgroundSize: `${DISPLAY_WIDTH}px ${DISPLAY_HEIGHT}px`,
          backgroundPosition: isLeft ? '0 0' : `-${HALF_WIDTH}px 0`,
        }}
      />
    </motion.div>
  )
}

export default function RadhaKrishnaUnion({ active }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {active && (
          <motion.div
            className="h-52 w-52 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(230,200,120,0.6) 0%, rgba(230,200,120,0.25) 45%, transparent 72%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1.1], opacity: [0, 1, 0.7] }}
            transition={{ duration: 1.4, delay: 0.85, ease: 'easeOut' }}
          />
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex">
        <ImageHalf side="left" active={active} />
        <ImageHalf side="right" active={active} />
      </div>
    </div>
  )
}
