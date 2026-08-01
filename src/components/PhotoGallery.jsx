import { useEffect, useRef, useState } from 'react'
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

function getCouplePhoto(culture, index) {
  const photos = CULTURE_PHOTOS[culture] ?? DEFAULT_PHOTOS
  return photos[index % photos.length]
}

const PHOTOS = [
  { seed: 'p1', alt: 'The couple sharing a joyful moment', ratio: '3 / 4', position: 'center 20%' },
  { seed: 'p2', alt: 'Engagement portrait of the couple', ratio: '1 / 1', position: 'center 15%' },
  { seed: 'p3', alt: 'The couple together', ratio: '4 / 5', position: 'center 25%' },
  { seed: 'p4', alt: 'A candid moment between the couple', ratio: '3 / 4', position: 'center 30%' },
  { seed: 'p5', alt: 'The couple at golden hour', ratio: '1 / 1', position: 'center 10%' },
  { seed: 'p6', alt: 'Close-up portrait of the couple', ratio: '4 / 5', position: 'center 18%' },
  { seed: 'p7', alt: 'The couple sharing a quiet moment', ratio: '3 / 4', position: 'center 22%' },
  { seed: 'p8', alt: 'The couple celebrating together', ratio: '1 / 1', position: 'center 12%' },
]

function GalleryPhoto({ photo, index, onOpen, culture }) {
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
        aria-label={`View photo: ${photo.alt}`}
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
          style={{ aspectRatio: photo.ratio }}
        >
          <motion.div
            style={reduceMotion ? { scale: 1 } : { y: parallax, scale: 1.16 }}
            className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.24]"
          >
            <img
              src={getCouplePhoto(culture, index)}
              alt={photo.alt}
              className="h-full w-full object-cover"
              style={{ objectPosition: photo.position }}
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

export default function PhotoGallery({ culture }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const isOpen = activeIndex !== null

  const close = () => setActiveIndex(null)
  const showPrev = () =>
    setActiveIndex((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)
  const showNext = () => setActiveIndex((i) => (i + 1) % PHOTOS.length)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

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
        {PHOTOS.map((photo, index) => (
          <GalleryPhoto
            key={photo.seed}
            photo={photo}
            index={index}
            onOpen={setActiveIndex}
            culture={culture}
          />
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
                  key={PHOTOS[activeIndex].seed}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[80svh] w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-soft"
                >
                  <img
                    src={getCouplePhoto(culture, activeIndex)}
                    alt={PHOTOS[activeIndex].alt}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: PHOTOS[activeIndex].position }}
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
