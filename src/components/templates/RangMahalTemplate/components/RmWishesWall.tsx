import { useEffect, useState } from 'react'

interface Wish {
  name: string
  message: string
  timestamp?: string
}

const ENDPOINT = '/api/wishes'

/** Guests' messages — same `GET /api/wishes?slug=` contract as WishesWall.jsx. */
export default function RmWishesWall({ slug }: { slug?: string }) {
  const [wishes, setWishes] = useState<Wish[]>([])

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return
        if (!result.ok) throw new Error(result.error || 'failed to load wishes')
        setWishes((result.wishes || []).filter((w: Wish) => String(w.message || '').trim()))
      })
      .catch((err) => console.error(`[Wishes Wall] failed to load wishes for "${slug}":`, err))

    return () => {
      cancelled = true
    }
  }, [slug])

  if (wishes.length === 0) return null

  return (
    // Not data-rmt-reveal: this mounts after its fetch resolves, once the
    // scroll observer has already collected its targets (the bug the Velvet
    // Theatre template hit), so it fades itself in instead.
    <section className="rmt-section rmt-section--enter" aria-label="Wishes">
      <p className="rmt-kicker">From our loved ones</p>
      <h2 className="rmt-title">Blessings</h2>
      <div className="rmt-wishes">
        {wishes.map((wish, i) => (
          <figure key={`${wish.name}-${wish.timestamp}-${i}`} className="rmt-wish">
            <blockquote>“{wish.message}”</blockquote>
            <figcaption>{wish.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
