// The homepage's launch-sale announcement bar — see LandingPage.jsx for the
// mount point (very top of the page, above SiteHeader) and ../data/sale.js
// for the window/price this reads from. That same module is re-derived
// server-side at checkout (see api/create-order.js), so this banner can
// never promise a price the payment step doesn't actually honor.
//
// Renders nothing once the sale's over or disabled — LandingPage.jsx always
// mounts it unconditionally; this decides for itself whether there's
// anything to show, the same way MusicVibeWidget-style blog widgets decide
// their own content rather than the page around them.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, PartyPopper } from 'lucide-react'
import { PRICING } from '../data/templatesData'
import { isSaleActive, getActivePrice, getSavingsPercent, SALE_END } from '../data/sale'

function pad(n) {
  return String(n).padStart(2, '0')
}

// Ticks once a second so the countdown reads as genuinely live rather than
// a number frozen at page-load — cheap enough (one setState/sec, one small
// subtree) that it isn't worth reaching for requestAnimationFrame here.
function useCountdown(targetIso) {
  const [remainingMs, setRemainingMs] = useState(() => new Date(targetIso).getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs(new Date(targetIso).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [targetIso])

  return Math.max(0, remainingMs)
}

function splitDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export default function SaleBanner() {
  const remainingMs = useCountdown(SALE_END)
  // Re-checked every tick (not just at mount) so the banner un-mounts itself
  // the instant the countdown above hits zero, instead of lingering at
  // "0d:00h:00m:00s" until the next full page load.
  if (!isSaleActive() || remainingMs <= 0) return null

  const { days, hours, minutes, seconds } = splitDuration(remainingMs)
  const price = getActivePrice()
  const savings = getSavingsPercent()

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#5c0f1c] to-[#7a1a28] px-4 py-3 text-center text-ivory sm:px-6">
      {/* Slow ambient gold sweep — purely decorative, so it's excluded from
          layout/measurement entirely (pointer-events-none, aria-hidden) and
          kept behind the content below (z-0 vs the content's z-10) so it
          can never wash out the text sitting on top of it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-gold/0 via-gold/15 to-gold/0"
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center gap-2.5 sm:flex-row sm:gap-4">
        <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs font-semibold leading-snug sm:text-sm">
          <PartyPopper className="h-4 w-4 shrink-0 text-gold-soft" aria-hidden="true" />
          <span>Launch Special — your interactive wedding invitation for only</span>
          <span className="sale-glow text-base font-extrabold text-gold-soft sm:text-lg">
            &#8377;{price.toLocaleString('en-IN')}
          </span>
          <span className="text-ivory/80 line-through">
            &#8377;{PRICING.price.toLocaleString('en-IN')}
          </span>
          <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
            Save {savings}%
          </span>
        </p>

        <div className="flex flex-wrap shrink-0 items-center justify-center gap-2.5">
          <div
            role="timer"
            aria-label={`Sale ends in ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`}
            className="flex items-center gap-1 rounded-full border border-ivory/25 bg-ink/40 px-2.5 py-1 text-[11px] font-semibold tabular-nums tracking-wide text-ivory sm:text-xs"
          >
            <span>{days}d</span>
            <span className="opacity-60" aria-hidden="true">:</span>
            <span>{pad(hours)}h</span>
            <span className="opacity-60" aria-hidden="true">:</span>
            <span>{pad(minutes)}m</span>
            <span className="opacity-60" aria-hidden="true">:</span>
            <span>{pad(seconds)}s</span>
          </div>

          <Link
            to="/create"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink shadow-card transition-transform hover:scale-[1.05] sm:text-sm"
          >
            Claim Offer &amp; Create Invite
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
