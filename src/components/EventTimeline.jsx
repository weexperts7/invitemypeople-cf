import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { Flower, Music, Sparkle, Heart, PartyPopper } from 'lucide-react'

const DEFAULT_WEDDING_DATE = new Date('2026-07-01T09:00:00')

const DEFAULT_EVENTS = [
  {
    icon: Flower,
    title: 'Haldi Ceremony',
    date: 'June 29, 2026',
    time: '10:00 AM',
    venue: 'Malhotra Residence, Jaipur',
  },
  {
    icon: Music,
    title: 'Sangeet Night',
    date: 'June 30, 2026',
    time: '7:00 PM',
    venue: 'The Leela Palace, Jaipur',
  },
  {
    icon: Sparkle,
    title: 'Mehndi Ceremony',
    date: 'June 30, 2026',
    time: '4:00 PM',
    venue: 'Kapoor Residence, Jaipur',
  },
  {
    icon: Heart,
    title: 'Wedding Ceremony',
    date: 'July 1, 2026',
    time: '9:00 AM',
    venue: 'Rambagh Palace Gardens, Jaipur',
  },
  {
    icon: PartyPopper,
    title: 'Reception',
    date: 'July 1, 2026',
    time: '7:30 PM',
    venue: 'Rambagh Palace Grand Lawn, Jaipur',
  },
]

function getTimeLeft(targetDate) {
  const diff = targetDate.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function CountdownUnit({ value, label, index }) {
  const padded = String(value).padStart(2, '0')

  return (
    <motion.div
      className="flex min-w-0 flex-col items-center overflow-hidden rounded-2xl border border-champagne-deep/40 bg-ivory/80 px-2 py-3 shadow-card"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-9 w-full flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={padded}
            className="absolute font-serif text-2xl sm:text-3xl text-rose tabular-nums"
            initial={{ y: -22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 22, opacity: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            {padded}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </span>
    </motion.div>
  )
}

export default function EventTimeline({ events, weddingDate, heading = 'Our Celebration' }) {
  const activeEvents = events ?? DEFAULT_EVENTS
  const targetDate = useMemo(
    () => (weddingDate ? new Date(weddingDate) : DEFAULT_WEDDING_DATE),
    [weddingDate],
  )
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))
  const listRef = useRef(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 85%', 'end 55%'],
  })
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  })

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate))
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <section className="px-6 py-20 bg-linen/50">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-ink text-center mb-8"
      >
        {heading}
      </motion.h2>

      {/* fixed 4-up grid so the countdown never wraps onto a second line */}
      <div className="mx-auto mb-16 grid max-w-sm grid-cols-4 gap-2 sm:gap-3">
        <CountdownUnit value={timeLeft.days} label="Days" index={0} />
        <CountdownUnit value={timeLeft.hours} label="Hrs" index={1} />
        <CountdownUnit value={timeLeft.minutes} label="Mins" index={2} />
        <CountdownUnit value={timeLeft.seconds} label="Secs" index={3} />
      </div>

      <div ref={listRef} className="relative max-w-md mx-auto">
        {/* the timeline draws itself as you scroll */}
        <motion.div
          className="absolute left-5 top-2 bottom-2 w-px bg-gold-soft"
          style={
            reduceMotion
              ? undefined
              : { scaleY: lineScale, originY: 0 }
          }
        />
        <ol className="space-y-10">
          {activeEvents.map((event) => {
            const Icon = event.icon
            return (
              <motion.li
                key={event.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-16"
              >
                <motion.span
                  className="absolute left-0 top-0 w-10 h-10 rounded-full bg-blush border border-gold-soft flex items-center justify-center shadow-card"
                  initial={{ scale: 0, rotate: -90 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 16,
                    delay: 0.12,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                >
                  <Icon className="w-5 h-5 text-rose" strokeWidth={1.5} />
                </motion.span>
                <p className="font-serif text-lg text-ink">{event.title}</p>
                <p className="text-sm text-ink-soft">
                  {event.date} &middot; {event.time}
                </p>
                <p className="text-sm text-ink-soft">{event.venue}</p>
                {event.mapHref && (
                  <a
                    href={event.mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-rose underline underline-offset-2"
                  >
                    View on Map
                  </a>
                )}
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
