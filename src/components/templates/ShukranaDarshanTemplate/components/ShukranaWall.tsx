import { useEffect, useRef, useState } from 'react'

import type { ShukranaWish } from '../types'

const ENDPOINT = '/api/wishes'
const FIRST_PAGE = 4
const PAGE = 6
const LONG_MESSAGE = 180

function newestFirst(wishes: ShukranaWish[]) {
  const time = (w: ShukranaWish) => (w.timestamp ? new Date(w.timestamp).getTime() : 0)
  return [...wishes].sort((a, b) => time(b) - time(a))
}

function Wish({ wish, fresh }: { wish: ShukranaWish; fresh: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = wish.message.length > LONG_MESSAGE
  const clamped = isLong && !expanded

  return (
    <figure className={`skd-wish${fresh ? ' skd-wish--fresh' : ''}${clamped ? ' skd-wish--clamped' : ''}`}>
      {fresh && <span className="skd-wish-new">Just added</span>}
      <blockquote>{wish.message}</blockquote>
      {isLong && (
        <button type="button" className="skd-wish-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
      <figcaption>{wish.name}</figcaption>
    </figure>
  )
}

/**
 * The sangat's messages, newest first — same `GET /api/wishes?slug=` contract
 * as WishesWall.jsx. A message just sent from the form above (`posted`) shows
 * straight away, then the wall reloads so it also picks up anyone else's. Long
 * walls open a few at a time, so the invite never turns into an endless scroll.
 */
export default function ShukranaWall({
  slug,
  demoWishes = [],
  posted,
}: {
  slug?: string
  demoWishes?: ShukranaWish[]
  posted: ShukranaWish | null
}) {
  const [wishes, setWishes] = useState<ShukranaWish[]>(demoWishes)
  const [visible, setVisible] = useState(FIRST_PAGE)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (posted) setWishes((prev) => [posted, ...prev])
  }, [posted])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return
        if (!result.ok) throw new Error(result.error || 'failed to load wishes')
        setWishes((result.wishes || []).filter((w: ShukranaWish) => String(w.message || '').trim()))
      })
      .catch((err) => console.error(`[Shukrana Wall] failed to load "${slug}":`, err))
    return () => {
      cancelled = true
    }
  }, [slug, posted])

  if (wishes.length === 0) return null

  const sorted = newestFirst(wishes)
  const remaining = sorted.length - visible

  const showFewer = () => {
    setVisible(FIRST_PAGE)
    sectionRef.current?.scrollIntoView({ block: 'start' })
  }

  return (
    // Not data-skd-reveal: this can mount after its fetch resolves, once the
    // scroll observer has already collected its targets, so it fades itself in.
    <section ref={sectionRef} className="skd-section skd-section--blush skd-section--enter" aria-label="Shukrana wall">
      <p className="skd-kicker">From the sangat</p>
      <h2 className="skd-title">Shukrana Wall</h2>
      {sorted.length > 1 && <p className="skd-note">{sorted.length} messages from the sangat</p>}

      <div className="skd-wishes">
        {sorted.slice(0, visible).map((wish, i) => (
          <Wish
            key={`${wish.name}-${wish.timestamp}-${wish.message.slice(0, 24)}`}
            wish={wish}
            fresh={Boolean(posted) && i === 0}
          />
        ))}
      </div>

      {remaining > 0 ? (
        <button type="button" className="skd-wall-toggle" onClick={() => setVisible(visible + PAGE)}>
          Show {Math.min(remaining, PAGE)} more {remaining === 1 ? 'message' : 'messages'}
        </button>
      ) : (
        sorted.length > FIRST_PAGE && (
          <button type="button" className="skd-wall-toggle" onClick={showFewer}>
            Show fewer messages
          </button>
        )
      )}
    </section>
  )
}
