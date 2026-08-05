import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Real, freely-licensed (Unsplash License — free for commercial use) candid
// couple photos standing in for the couple's own photos, one set per
// wedding tradition. Swap these for the couple's actual photos once they
// have them.
const CULTURE_PHOTOS = {
  Hindu: ['/images/couples/hindu-2.jpg', '/images/couples/hindu-3.jpg'],
  'South Indian': ['/images/couples/south-indian-2.jpg', '/images/couples/south-indian-3.jpg'],
  Muslim: ['/images/couples/muslim-2.jpg', '/images/couples/muslim-3.jpg'],
  Sikh: ['/images/couples/sikh-2.jpg', '/images/couples/sikh-3.jpg'],
  Christian: ['/images/couples/christian-3.jpg', '/images/couples/christian-4.jpg'],
}
const DEFAULT_PHOTOS = CULTURE_PHOTOS.Hindu

// Layout metadata (aspect ratio / crop position / fallback alt text) for up
// to 8 stacked cards — cycled via index % LAYOUTS.length regardless of how
// many photos are actually shown, so any card count still gets varied
// framing instead of every card looking identical.
const LAYOUTS = [
  { alt: 'The couple sharing a joyful moment', ratio: '3 / 4', position: 'center 20%' },
  { alt: 'Engagement portrait of the couple', ratio: '1 / 1', position: 'center 15%' },
  { alt: 'The couple together', ratio: '4 / 5', position: 'center 25%' },
  { alt: 'A candid moment between the couple', ratio: '3 / 4', position: 'center 30%' },
  { alt: 'The couple at golden hour', ratio: '1 / 1', position: 'center 10%' },
  { alt: 'Close-up portrait of the couple', ratio: '4 / 5', position: 'center 18%' },
  { alt: 'The couple sharing a quiet moment', ratio: '3 / 4', position: 'center 22%' },
  { alt: 'The couple celebrating together', ratio: '1 / 1', position: 'center 12%' },
]

// `photos` (real buyer uploads, see CreateInvitePage.jsx) replaces the stock
// set one-for-one when provided — exactly as many cards as real photos, no
// padding/repeats. Without real photos, keeps today's stock behavior: a
// fixed 8 cards cycling through the culture's 2-photo stock set.
function buildSlots(culture, photos) {
  if (photos?.length) {
    return photos.map((src, index) => ({ src, ...LAYOUTS[index % LAYOUTS.length] }))
  }
  const source = CULTURE_PHOTOS[culture] ?? DEFAULT_PHOTOS
  return LAYOUTS.map((layout, index) => ({ ...layout, src: source[index % source.length] }))
}

function GalleryPhoto({ slot, index, onOpen }) {
  const stackRef = useRef(null)
  const frameRef = useRef(null)
  const reduceMotion = useReducedMotion()

  // Tracks how far the user has scrolled through this card's pinned window,
  // so the card can shrink and dim just before the next one covers it.
  const { scrollYProgress: stackProgress } = useScroll({
    target: stackRef,
    offset: ['start start', 'end start'],
  })
  const stackScale = useTransform(stackProgress, [0, 1], [1, 0.85])
  const stackDim = useTransform(stackProgress, [0, 0.75, 1], [0, 0, 0.45])

  // Drift the image against its frame while the card is pinned.
  const { scrollYProgress: frameProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  })
  const parallax = useTransform(frameProgress, [0, 1], ['-7%', '7%'])

  return (
    <div
      ref={stackRef}
      className="sticky top-[11vh] sm:top-[13vh] pb-[3vh] sm:pb-[4vh]"
      style={{ zIndex: index + 1 }}
    >
      <motion.button
        type="button"
        onClick={() => onOpen(index)}
        aria-label={`View photo: ${slot.alt}`}
        initial={{ opacity: 0, y: 64 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.98 }}
        style={reduceMotion ? undefined : { scale: stackScale }}
        className="group relative block w-full rounded-lg border-[10px] sm:border-[14px] border-ivory bg-ivory shadow-card ring-1 ring-champagne-deep/40"
      >
        {/* inner mat between the outer frame and the photo */}
        <div
          ref={frameRef}
          className="relative w-full overflow-hidden rounded-sm border border-champagne-deep/50"
          style={{ aspectRatio: slot.ratio }}
        >
          <motion.div
            style={reduceMotion ? { scale: 1 } : { y: parallax, scale: 1.16 }}
            className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.24]"
          >
            <img
              src={slot.src}
              alt={slot.alt}
              className="h-full w-full object-cover"
              style={{ objectPosition: slot.position }}
            />
          </motion.div>
          <span className="pointer-events-none absolute inset-0 bg-rose/0 transition-colors duration-500 group-hover:bg-rose/10" />
          {/* dims the card just before the next one stacks over it */}
          {!reduceMotion && (
            <motion.span
              className="pointer-events-none absolute inset-0 bg-black"
              style={{ opacity: stackDim }}
            />
          )}
        </div>
      </motion.button>
    </div>
  )
}

export default function PhotoGallery({ culture, photos }) {
  const slots = buildSlots(culture, photos)
  const [activeIndex, setActiveIndex] = useState(null)
  const isOpen = activeIndex !== null

  const close = useCallback(() => setActiveIndex(null), [])
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i - 1 + slots.length) % slots.length),
    [slots.length],
  )
  const showNext = useCallback(
    () => setActiveIndex((i) => (i + 1) % slots.length),
    [slots.length],
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close, showPrev, showNext])

  return (
    <section className="px-6 py-20 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-ink mb-2"
      >
        Our Moments
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-ink-soft mb-12"
      >
        A few frames from our story so far
      </motion.p>

      <div className="relative mx-auto max-w-md">
        {slots.map((slot, index) => (
          // index, not slot.src, as the key: stock mode repeats the same 2
          // photo URLs across all 8 slots, which would collide as keys.
          <GalleryPhoto key={index} slot={slot} index={index} onOpen={setActiveIndex} />
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[80svh] w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-soft"
                >
                  <img
                    src={slots[activeIndex].src}
                    alt={slots[activeIndex].alt}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: slots[activeIndex].position }}
                  />
                </motion.div>
              </AnimatePresence>
              <motion.button
                type="button"
                onClick={close}
                aria-label="Close gallery"
                whileHover={{ scale: 1.12, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-ivory border border-champagne-deep/50 shadow-card flex items-center justify-center text-ink hover:text-rose"
              >
                <X className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                whileHover={{ scale: 1.12, x: -2 }}
                whileTap={{ scale: 0.92 }}
                className="absolute top-1/2 -left-3 sm:-left-12 -translate-y-1/2 w-9 h-9 rounded-full bg-ivory border border-champagne-deep/50 shadow-card flex items-center justify-center text-ink hover:text-rose"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                whileHover={{ scale: 1.12, x: 2 }}
                whileTap={{ scale: 0.92 }}
                className="absolute top-1/2 -right-3 sm:-right-12 -translate-y-1/2 w-9 h-9 rounded-full bg-ivory border border-champagne-deep/50 shadow-card flex items-center justify-center text-ink hover:text-rose"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
