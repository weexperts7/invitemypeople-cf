import { useEffect, useState } from 'react'

interface Wish {
  name: string
  message: string
  timestamp?: string
}

interface RoyalPlumWishesWallProps {
  /** The real invite's slug — see `RoyalPlumTemplateData.invitationSlug`'s own doc comment. */
  slug?: string
}

const ENDPOINT = '/api/wishes'

/**
 * Step F — the Wishes Wall every other wedding template already has (see
 * WishesWall.jsx), reimplemented rather than reused for the same reason
 * RoyalPlumRsvpForm.tsx gives: WishesWall.jsx's classes lean on the site's
 * Tailwind CSS-variable theme, which this page's dark plum background
 * doesn't share. Same `GET /api/wishes?slug=` contract, gold-on-plum cards
 * instead.
 */
export default function RoyalPlumWishesWall({ slug }: RoyalPlumWishesWallProps) {
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

  // Same "render nothing rather than an empty section" rule WishesWall.jsx
  // follows — nothing fetched yet, or nothing came back.
  if (status === 'idle' || (status === 'success' && wishes.length === 0)) return null

  return (
    <section className="rpc-wishes" data-rpc-reveal aria-label="Wishes">
      <h3
        className="rpc-gold-text"
        style={{ fontFamily: 'var(--rpc-font-royal)', textAlign: 'center', fontSize: 20, letterSpacing: '0.08em', marginBottom: 6 }}
      >
        Blessings Received
      </h3>
      <p className="rpc-tracking" style={{ textAlign: 'center', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 28 }}>
        From friends and family
      </p>

      {status === 'loading' && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--rpc-rose-gold)' }}>Loading wishes…</p>
      )}

      {status === 'error' && (
        <div className="rpc-error-box" style={{ maxWidth: 420, margin: '0 auto' }}>
          Wishes couldn't be loaded right now — please check back soon.
        </div>
      )}

      {status === 'success' &&
        wishes.map((wish, i) => (
          <div key={`${wish.name}-${wish.timestamp}-${i}`} className="rpc-wish-card">
            <p className="rpc-wish-name">{wish.name}</p>
            <p className="rpc-wish-message">{wish.message}</p>
          </div>
        ))}
    </section>
  )
}
