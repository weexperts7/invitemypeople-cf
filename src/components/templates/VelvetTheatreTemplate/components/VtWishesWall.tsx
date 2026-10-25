import { useEffect, useState } from 'react'

interface Wish {
  name: string
  message: string
  timestamp?: string
}

const ENDPOINT = '/api/wishes'

/**
 * Step 7 — reads back guests' messages, same `GET /api/wishes?slug=`
 * contract and "render nothing when empty" rule as WishesWall.jsx.
 */
export default function VtWishesWall({ slug }: { slug?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [wishes, setWishes] = useState<Wish[]>([])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setStatus('loading')

    fetch(`${ENDPOINT}?slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return
        if (!result.ok) throw new Error(result.error || 'failed to load wishes')
        setWishes((result.wishes || []).filter((w: Wish) => String(w.message || '').trim()))
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

  if (status === 'idle' || status === 'error' || (status === 'success' && wishes.length === 0)) return null

  return (
    // Not data-vtt-reveal: this section only mounts after its fetch resolves,
    // long after the template's scroll observer collected its targets, so it
    // would never be revealed. It fades itself in on mount instead.
    <section className="vtt-section vtt-section--enter" aria-label="Wishes">
      <p className="vtt-kicker">From the audience</p>
      <h2 className="vtt-serif-title">Love notes</h2>
      {status === 'loading' ? (
        <p className="vtt-muted">Loading wishes…</p>
      ) : (
        <div className="vtt-wishes">
          {wishes.map((wish, i) => (
            <figure key={`${wish.name}-${wish.timestamp}-${i}`} className="vtt-wish">
              <blockquote>“{wish.message}”</blockquote>
              <figcaption>— {wish.name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
