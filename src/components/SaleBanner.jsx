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
import { useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()
  // Re-checked every tick (not just at mount) so the banner un-mounts itself
  // the instant the countdown above hits zero, instead of lingering at
  // "0d:00h:00m:00s" until the next full page load.
  if (!isSaleActive() || remainingMs <= 0) return null

  const { days, hours, minutes, seconds } = splitDuration(remainingMs)
  const price = getActivePrice()
  const savings = getSavingsPercent()

  // One condensed line for the mobile ticker below — the desktop layout's
  // separate badge/countdown-pill/CTA-button pieces wrap onto several
  // stacked lines at phone width, which is the "takes a lot of space"
  // complaint this replaces. Rebuilt fresh each render (the countdown
  // digits tick every second), which is fine — it's plain text content
  // inside the already-running marquee, not something that restarts it.
  const tickerText =
    `\u{1F389} Launch Special — ₹${price.toLocaleString('en-IN')} ` +
    `(was ₹${PRICING.price.toLocaleString('en-IN')}) · Save ${savings}% · ` +
    `Ends in ${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s · ` +
    `Claim Offer & Create Invite →`

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#5c0f1c] to-[#7a1a28] text-ivory">
      {/* Slow ambient gold sweep — purely decorative, so it's excluded from
          layout/measurement entirely (pointer-events-none, aria-hidden) and
          kept behind the content below (z-0 vs the content's z-10) so it
          can never wash out the text sitting on top of it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-gold/0 via-gold/15 to-gold/0"
      />

      {/* Mobile: a single thin line instead of the desktop stack below —
          reduced motion gets the same condensed sentence, just static and
          left to wrap rather than auto-scrolling; everyone else gets a
          continuously auto-scrolling ticker (see .marquee-right in
          index.css, the same left-to-right auto-scroll technique
          TemplateMarquee.jsx uses for the template galleries: two
          back-to-back copies of the same content, animated from
          translateX(-50%) to translateX(0%) so the loop has no visible
          seam). The whole line is the tap target — same "go create yours"
          action the desktop CTA button below is, just without a separate
          button eating more width. */}
      {reduceMotion ? (
        <Link
          to="/create"
          className="relative z-10 block px-4 py-2 text-center text-[11px] font-semibold leading-snug sm:hidden"
        >
          {tickerText}
        </Link>
      ) : (
        <Link
          to="/create"
          aria-label={tickerText}
          className="relative z-10 flex items-center overflow-hidden py-2 sm:hidden"
        >
          <div
            className="flex w-max shrink-0 whitespace-nowrap text-xs font-semibold"
            style={{
              animationName: 'marquee-right',
              animationDuration: '20s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              // Flips the base .marquee-right keyframe (see index.css) —
              // as authored it reads left-to-right, but that put this
              // ticker's text scrolling backwards (right-to-left) in
              // practice, so reverse it the same way TemplateMarquee.jsx's
              // own `reverse` prop does.
              animationDirection: 'reverse',
            }}
          >
            <span className="px-4" aria-hidden="true">
              {tickerText}
            </span>
            <span className="px-4" aria-hidden="true">
              {tickerText}
            </span>
          </div>
        </Link>
      )}

      {/* Desktop/tablet: the original full layout — badge, price, countdown
          pill and its own CTA button, all on one row at this width. */}
      <div className="relative z-10 mx-auto hidden max-w-6xl items-center justify-center gap-4 px-6 py-3 text-center sm:flex">
        <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm font-semibold leading-snug">
          <PartyPopper className="h-4 w-4 shrink-0 text-gold-soft" aria-hidden="true" />
          <span>Launch Special — your interactive wedding invitation for only</span>
          <span className="sale-glow text-lg font-extrabold text-gold-soft">
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
            className="flex items-center gap-1 rounded-full border border-ivory/25 bg-ink/40 px-2.5 py-1 text-xs font-semibold tabular-nums tracking-wide text-ivory"
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-ink shadow-card transition-transform hover:scale-[1.05]"
          >
            Claim Offer &amp; Create Invite
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
