import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, Heart, Loader2 } from 'lucide-react'

// The Wishes Wall only reads from the Apps Script endpoint (see
// google-apps-script/Code.gs's doGet) — the local Excel API has no GET-by-slug
// route, so this stays quiet on the default local-dev setup.
const ENDPOINT = import.meta.env.VITE_RSVP_ENDPOINT

export default function WishesWall({
  slug,
  heading = 'Wishes Wall',
  subheading = 'Blessings from friends and family',
  sectionClassName = 'px-6 py-20',
  cardClassName = 'rounded-2xl border border-white/60 bg-ivory/50 backdrop-blur-xl shadow-soft px-5 py-4',
  renderIcon,
}) {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [wishes, setWishes] = useState([])
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!ENDPOINT || !slug) return

    let cancelled = false
    setStatus('loading')

    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return
        if (!result.ok) throw new Error(result.error || 'failed to load wishes')

        setWishes((result.wishes || []).filter((w) => String(w.message || '').trim()))
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        console.error(`[Wishes Wall] failed to load wishes for "${slug}":`, err)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  // No Apps Script endpoint configured, nothing fetched yet, or the sheet
  // has no wishes — there's nothing worth showing.
  if (!ENDPOINT || status === 'idle' || (status === 'success' && wishes.length === 0)) {
    return null
  }

  return (
    <section className={sectionClassName}>
      {heading && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-ink text-center mb-2"
        >
          {heading}
        </motion.h2>
      )}
      {subheading && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-ink-soft text-center mb-10"
        >
          {subheading}
        </motion.p>
      )}

      <div className="max-w-md mx-auto space-y-4">
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-ink-soft py-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading wishes&hellip;
          </div>
        )}

        {status === 'error' && (
          <div className="flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose" />
            <span>
              Wishes couldn&apos;t be loaded right now — please check back soon.
            </span>
          </div>
        )}

        {status === 'success' &&
          wishes.map((wish, i) => (
            <motion.div
              key={`${wish.name}-${wish.timestamp}-${i}`}
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.6) }}
              className={cardClassName}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {renderIcon ? (
                  renderIcon(wish)
                ) : (
                  <Heart className="w-3.5 h-3.5 text-rose shrink-0" strokeWidth={1.5} />
                )}
                <span className="font-serif text-lg text-ink">{wish.name}</span>
              </div>
              <p className="text-ink-soft text-sm leading-relaxed">{wish.message}</p>
            </motion.div>
          ))}
      </div>
    </section>
  )
}
