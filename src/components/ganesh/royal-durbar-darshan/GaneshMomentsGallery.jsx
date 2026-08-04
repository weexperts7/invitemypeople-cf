import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Flower2, Flame, Cookie, Music2 } from 'lucide-react'

const FALLBACK_ICONS = [Flower2, Flame, Cookie, Music2]
const AUTOPLAY_MS = 4500
const SWIPE_THRESHOLD = 10000

function swipePower(offset, velocity) {
  return Math.abs(offset) * velocity
}

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 0 }),
}

// A single slide's photo (or gradient fallback, same onError convention as
// GaneshIdolPhoto/DurbarPhotoHero) with its caption scrim.
function MomentSlide({ moment, palette, rose, gold, FallbackIcon }) {
  const [errored, setErrored] = useState(false)
  const showPhoto = moment?.src && !errored

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border shadow-card"
      style={{ borderColor: `${gold}45` }}
    >
      {showPhoto ? (
        <img
          src={moment.src}
          alt={moment.alt ?? moment.caption ?? ''}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setErrored(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${palette?.champagneDeep ?? '#cf9f42'}88, transparent 65%), linear-gradient(160deg, ${palette?.linen ?? '#f2e6c9'} 0%, ${palette?.champagne ?? '#e6c883'} 100%)`,
          }}
        >
          <FallbackIcon className="w-10 h-10" style={{ color: rose }} strokeWidth={1.3} />
        </div>
      )}
      {moment.when && (
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-md"
          style={{ background: 'rgba(10,4,2,0.5)' }}
        >
          <Clock className="w-3 h-3 text-ivory" strokeWidth={1.8} />
          <span className="text-[11px] font-medium tracking-wide text-ivory">{moment.when}</span>
        </div>
      )}
      <div
        className="absolute inset-x-0 bottom-0 px-5 py-4"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(10,4,2,0.78) 100%)' }}
      >
        <p className="font-serif text-lg text-ivory leading-snug">{moment.caption}</p>
        {moment.sub && <p className="text-xs text-ivory/80 mt-0.5">{moment.sub}</p>}
      </div>
    </div>
  )
}

// A real, smoothly-sliding photo carousel for "Sacred Moments" — one slide
// at a time, drag-to-swipe with spring physics, gentle autoplay, and dot
// navigation — the structural element that makes Royal Durbar Darshan
// genuinely photo-led rather than a re-skinned icon-based template.
export default function GaneshMomentsGallery({ moments, palette, gold, rose }) {
  const reduceMotion = useReducedMotion()
  const [[index, direction], setSlide] = useState([0, 0])
  const count = moments?.length ?? 0

  const paginate = (dir) => {
    setSlide(([current]) => [(current + dir + count) % count, dir])
  }

  useEffect(() => {
    if (reduceMotion || count <= 1) return undefined
    const id = setInterval(() => paginate(1), AUTOPLAY_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduceMotion, count])

  if (!count) return null
  const moment = moments[index]

  return (
    <div className="relative">
      <div className="relative aspect-[4/5] w-full max-w-xs mx-auto overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial={reduceMotion ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 320, damping: 32 },
              opacity: { duration: 0.25 },
            }}
            drag={count > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const power = swipePower(offset.x, velocity.x)
              if (power < -SWIPE_THRESHOLD) paginate(1)
              else if (power > SWIPE_THRESHOLD) paginate(-1)
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <MomentSlide
              moment={moment}
              palette={palette}
              gold={gold}
              rose={rose}
              FallbackIcon={FALLBACK_ICONS[index % FALLBACK_ICONS.length]}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous moment"
            className="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl shadow-card"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: rose }} />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next moment"
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl shadow-card"
          >
            <ChevronRight className="w-4 h-4" style={{ color: rose }} />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {moments.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide([i, i > index ? 1 : -1])}
                aria-label={`Go to moment ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? '22px' : '7px',
                  background: i === index ? rose : `${gold}45`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
