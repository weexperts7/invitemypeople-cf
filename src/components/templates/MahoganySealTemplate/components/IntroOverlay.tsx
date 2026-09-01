import { useEffect, useRef, useState } from 'react'
import WaxSeal from './WaxSeal'
import AmbientLights from './AmbientLights'

interface IntroOverlayProps {
  hashtag: string
  introPrompt: string
  videoSrc?: string
  posterSrc?: string
  dismissing: boolean
  onOpen: () => void
  reduceMotion?: boolean
}

/**
 * Full-bleed cinematic intro. The rope-pull envelope video fills the
 * *entire* viewport edge-to-edge — no card, no border, no frame, nothing
 * reading as "a video player embedded in a page" — so it plays like the
 * invitation itself unfolding, not a clip someone's watching. There's
 * nothing overlaid on top of it while it plays: no text, no button, no
 * texture. It autoplays the instant this mounts and runs once, muted (see
 * the `<video>` below for why).
 *
 * The instant the clip finishes, `onEnded` calls `onOpen` directly — no
 * intermediate "now tap to continue" step. The parent turns that into the
 * dismiss transition (this overlay's own zoom-and-brighten-out,
 * `dismissing` — pushing *into* the screen and blooming brighter, not
 * sliding away, so it reads as flying through the seal's own light rather
 * than a panel closing), and mounts `SealBurst` in that same instant to
 * bridge the handoff with a bloom of gold light. So the video's last
 * frame — the sealed envelope glowing open — is what the guest sees
 * mid-transition as it flares into the dashboard underneath. One
 * continuous motion, not a video that stops and waits to be told to
 * continue.
 *
 * Tapping anywhere still calls `onOpen` immediately too, at any point
 * during playback — not a deliberate "skip" affordance so much as a
 * safety net: some browsers/environments silently refuse autoplay
 * (see the effect below), and without this the guest would otherwise be
 * stuck looking at a frozen first frame with no way forward.
 *
 * No video, a video that fails to load, or `reduceMotion` (which never
 * attempts autoplay) has no `ended` event to ever key off of, so those
 * fall back to the illustrated CSS/SVG envelope (`EnvelopeFallback`) with
 * an explicit, blinking "Tap to Open Invite" prompt — the one case where
 * asking for a tap is the honest option, not a fallback that was skipped.
 */
export default function IntroOverlay({
  hashtag,
  introPrompt,
  videoSrc,
  posterSrc,
  dismissing,
  onOpen,
  reduceMotion = false,
}: IntroOverlayProps) {
  const [videoFailed, setVideoFailed] = useState(!videoSrc)
  const videoRef = useRef<HTMLVideoElement>(null)

  // No video to autoplay/end, or a video that failed, or reduced-motion
  // (which never attempts autoplay below) — none of these have an `ended`
  // event to ever fire, so there's nothing to auto-transition on. Falls
  // back to the illustrated envelope with an explicit tap prompt instead.
  const needsTapPrompt = !videoSrc || videoFailed || reduceMotion

  // Lock page scroll while the intro is up — it's a fixed full-viewport
  // overlay, but without this the page underneath can still be scrolled by
  // wheel/touch, which peeks the dashboard in behind it before the reveal.
  // Restored on unmount, so this never leaks past the intro's own lifetime.
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (!videoSrc || reduceMotion) return
    videoRef.current?.play().catch(() => {
      /* Autoplay can be blocked by the browser until a user gesture —
         the tap-anywhere handler below is what covers that case; the
         poster frame (or the CSS fallback) keeps the screen looking
         intentional in the meantime rather than blank. */
    })
  }, [videoSrc, reduceMotion])

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#1a100d] transition-all duration-700 ease-[cubic-bezier(.4,0,.2,1)] ${
        dismissing ? 'pointer-events-none scale-110 opacity-0 brightness-125 blur-[2px]' : 'scale-100 opacity-100 brightness-100 blur-none'
      }`}
      role="button"
      tabIndex={0}
      aria-label={introPrompt}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen()
      }}
    >
      {/* The video (or its fallback) IS the screen — full-bleed, cropped to
          fill via object-cover, nothing framing it. */}
      <div className="absolute inset-0">
        {videoSrc && !videoFailed ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={videoSrc}
            poster={posterSrc}
            autoPlay={!reduceMotion}
            muted
            playsInline
            // No `loop` — plays exactly once, and `onEnded` moves straight
            // into the dashboard (see this component's own doc comment).
            // Browsers require `muted` for autoplay to be allowed on page
            // load without a prior user gesture; the clip has its own
            // audio track, so this trades sound for a guaranteed, silent
            // autoplay the instant the guest lands.
            onEnded={onOpen}
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <EnvelopeFallback hashtag={hashtag} reduceMotion={reduceMotion} />
        )}
      </div>

      {/* Only the no-video/failed/reduced-motion path ever renders this —
          see `needsTapPrompt`'s own comment for why a real, playing video
          never does. */}
      {needsTapPrompt && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-5 pb-14">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#1a100d]/90 to-transparent" />

          <div className="relative flex flex-col items-center gap-5 animate-[mst-blink_1.8s_ease-in-out_infinite]">
            <p className="mst-font-display text-lg tracking-[0.08em] text-[#f2d675] drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:text-xl">
              {introPrompt}
            </p>
            <div className="pointer-events-auto">
              <WaxSeal hashtag={hashtag} onClick={onOpen} pulse={!reduceMotion} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CSS/SVG-only stand-in for the rope-pull video: a wax-sealed envelope
 * drawn from plain shapes, filling the same full-bleed space the video
 * would. Used whenever `videoSrc` is unset or the clip fails to load —
 * paired with the tap prompt above, since there's no `ended` event here
 * to auto-transition on.
 */
function EnvelopeFallback({ hashtag, reduceMotion }: { hashtag: string; reduceMotion: boolean }) {
  return (
    <div className="mst-grain relative flex h-full w-full items-center justify-center bg-gradient-to-b from-[#3d2820] to-[#1a100d]">
      {/* The video this stands in for is never dim — warm lamplight plus its
          own hanging fairy lights down both edges of frame. Without a video
          to borrow that from, this recreates it directly so the fallback
          reads as intentional lighting design, not a dimmer placeholder. */}
      <AmbientLights variant="strings" reduceMotion={reduceMotion} />
      <div aria-hidden="true" className="mst-vignette pointer-events-none absolute inset-0" />
      <div className="relative w-[70%] max-w-xs">
        {/* Envelope body */}
        <div className="relative aspect-[4/3] rounded-md border border-[#d4af37]/50 bg-gradient-to-b from-[#4f3229] to-[#2c1d18] shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
          {/* Top flap */}
          <div
            className="absolute inset-x-0 top-0 h-1/2 border-b border-[#d4af37]/40 bg-gradient-to-b from-[#5a3a2e] to-[#3d2820]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
          />
          {/* Rope, tied across the flap */}
          <div
            aria-hidden="true"
            className={`absolute left-1/2 top-[8%] h-[3px] w-[85%] -translate-x-1/2 rounded-full bg-[#c9a24b]/70 ${
              reduceMotion ? '' : 'animate-[mst-rope-sway_3.4s_ease-in-out_infinite_alternate]'
            }`}
            style={{ transformOrigin: 'center top' }}
          />
          {/* Seal sitting where the rope crosses */}
          <div className="mst-seal absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
            <span className="mst-font-seal text-[7px] font-semibold tracking-[0.1em] text-[#f2d675]/90">{hashtag}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
