import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface CurtainEnvelopeProps {
  brideName: string
  groomName: string
  teaserLine: string
  dateLabel: string
  onOpened?: () => void
}

const SPARKLE_COUNT = 16

/**
 * Step A — the royal envelope cover. A centered seal button that, on click,
 * charges up, pops, and triggers a full theatrical curtain-draw: a crack of
 * light at the seam, a tiny rope-pull "gather" before the big reveal, a
 * light sweep across the fabric as it slides, and a sparkle burst the
 * instant the curtains clear — then the rest of the invitation underneath.
 *
 * The curtains are `position: fixed` overlay panels that sit above
 * everything else in the template (z-index handled in the CSS file) until
 * the open animation finishes, at which point they're set to
 * `visibility: hidden` and `pointer-events: none` so they never intercept
 * clicks again — but they're left in the DOM (not unmounted) so the timeline
 * that drives them stays valid for the lifetime of the component.
 */
export default function CurtainEnvelope({
  brideName,
  groomName,
  teaserLine,
  dateLabel,
  onOpened,
}: CurtainEnvelopeProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLButtonElement>(null)
  const leftCurtainRef = useRef<HTMLDivElement>(null)
  const rightCurtainRef = useRef<HTMLDivElement>(null)
  const leftShimmerRef = useRef<HTMLDivElement>(null)
  const rightShimmerRef = useRef<HTMLDivElement>(null)
  const seamGlowRef = useRef<HTMLDivElement>(null)
  const sparkleLayerRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [opened, setOpened] = useState(false)
  const [opening, setOpening] = useState(false)

  const { contextSafe } = useGSAP({ scope: scopeRef })

  // A one-shot radial burst of small gold sparks from screen center — the
  // "ta-da" moment right as the curtains finish clearing. Spawned into
  // sparkleLayerRef (a dedicated fixed-position layer owned by this
  // component, mirroring LoveHearts.tsx's own spawn-into-a-fixed-layer
  // pattern) rather than reaching into document.body, and independently
  // wrapped in contextSafe — this fires from inside a GSAP timeline
  // callback, i.e. asynchronously, well after handleOpen's own
  // contextSafe call has already returned, so it needs its own re-entry
  // into the component's GSAP context to stay tracked for cleanup.
  const spawnSparkles = contextSafe(() => {
    const layer = sparkleLayerRef.current
    if (!layer) return
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const el = document.createElement('span')
      el.className = 'rpc-sparkle'
      el.style.left = `${cx}px`
      el.style.top = `${cy}px`
      layer.appendChild(el)

      const angle = (i / SPARKLE_COUNT) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25)
      const dist = gsap.utils.random(90, 240)

      gsap
        .timeline({ onComplete: () => el.remove() })
        .fromTo(el, { opacity: 0, scale: 0, x: 0, y: 0 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' })
        .to(el, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, duration: 0.75, ease: 'power2.out' }, '<')
        .to(el, { opacity: 0, duration: 0.4 }, '-=0.3')
    }
  })

  const handleOpen = contextSafe(() => {
    if (opening || opened) return
    setOpening(true)

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        setOpened(true)
        onOpened?.()
      },
    })

    tl
      // 1. Anticipation — the seal charges up, brightening and lifting
      // slightly, like it's gathering the energy to pop.
      .call(() => sealRef.current?.classList.add('rpc-seal-btn--charging'))
      .to(sealRef.current, { scale: 1.12, duration: 0.22, ease: 'power2.out' })
      // 2. The pop — the actual "click" payoff.
      .to(sealRef.current, { scale: 0.3, duration: 0.32, ease: 'back.in(2.4)' }, '+=0.02')
      .to(sealRef.current, { opacity: 0, duration: 0.15 }, '<0.12')
      // 3. The cover recedes like a portal opening, not just fading flat.
      .to(coverRef.current, { opacity: 0, duration: 0.45, pointerEvents: 'none' }, '<')
      .to(frameRef.current, { scale: 1.06, duration: 0.45, ease: 'power2.out' }, '<')
      // 4. A crack of light flares at the seam right before the fabric
      // starts to move.
      .to(seamGlowRef.current, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, '-=0.3')
      // 5. A tiny inward "gather" — like a hand drawing the rope taut —
      // before the big pull, the same anticipation beat real stage
      // curtains have.
      .to(leftCurtainRef.current, { xPercent: 2.5, duration: 0.2, ease: 'power2.out' }, '-=0.05')
      .to(rightCurtainRef.current, { xPercent: -2.5, duration: 0.2, ease: 'power2.out' }, '<')
      // 6. The grand reveal — a longer, weightier ease than a simple
      // inOut, so the fabric feels heavy rather than snapping open.
      .to(leftCurtainRef.current, { xPercent: -100, duration: 1.5, ease: 'expo.inOut' }, '+=0.02')
      .to(rightCurtainRef.current, { xPercent: 100, duration: 1.5, ease: 'expo.inOut' }, '<')
      // 7. A light sweep travels across each panel in sync with the slide.
      .fromTo(
        leftShimmerRef.current,
        { xPercent: -130 },
        { xPercent: 130, duration: 1.3, ease: 'power1.inOut' },
        '<0.05'
      )
      .fromTo(
        rightShimmerRef.current,
        { xPercent: 130 },
        { xPercent: -130, duration: 1.3, ease: 'power1.inOut' },
        '<'
      )
      // 8. The seam light fades as the gap widens past it.
      .to(seamGlowRef.current, { opacity: 0, duration: 0.5 }, '<')
      // 9. Sparkle burst right as the curtains finish clearing.
      .call(spawnSparkles, undefined, '-=0.2')
  })

  return (
    <div ref={scopeRef}>
      <div ref={sparkleLayerRef} style={{ position: 'fixed', inset: 0, zIndex: 41, pointerEvents: 'none' }} aria-hidden="true" />

      {/* Crack-of-light seam flare, drawn just above the curtains. */}
      <div ref={seamGlowRef} className="rpc-curtain-seam-glow" aria-hidden="true" />

      {/* Curtain panels — fixed overlay, slide apart on open */}
      <div ref={leftCurtainRef} className="rpc-curtain-panel rpc-curtain-panel--left" aria-hidden="true">
        <span className="rpc-curtain-filigree" style={{ top: 20, left: 20, borderRight: 'none', borderBottom: 'none' }} />
        <span className="rpc-curtain-filigree" style={{ bottom: 20, left: 20, borderRight: 'none', borderTop: 'none' }} />
        <div ref={leftShimmerRef} className="rpc-curtain-shimmer" />
      </div>
      <div ref={rightCurtainRef} className="rpc-curtain-panel rpc-curtain-panel--right" aria-hidden="true">
        <span className="rpc-curtain-filigree" style={{ top: 20, right: 20, borderLeft: 'none', borderBottom: 'none' }} />
        <span className="rpc-curtain-filigree" style={{ bottom: 20, right: 20, borderLeft: 'none', borderTop: 'none' }} />
        <div ref={rightShimmerRef} className="rpc-curtain-shimmer" />
      </div>

      {/*
        Cover content — fades out as curtains part. zIndex 40 here is above
        the curtain panels' 30 so the seal/frame stays visible and
        clickable, with the curtains as backdrop rather than the other way
        around.
      */}
      {!opened && (
        <div ref={coverRef} className="rpc-envelope" style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
          <div className="rpc-glow" />
          <div ref={frameRef} className="rpc-envelope-frame">
            <span className="rpc-corner rpc-corner--tl" />
            <span className="rpc-corner rpc-corner--tr" />
            <span className="rpc-corner rpc-corner--bl" />
            <span className="rpc-corner rpc-corner--br" />

            <p className="rpc-tracking" style={{ fontFamily: 'var(--rpc-font-ui)', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 18 }}>
              {teaserLine}
            </p>

            <h1
              className="rpc-gold-text"
              style={{ fontFamily: 'var(--rpc-font-script)', fontSize: 'clamp(34px, 9vw, 48px)', lineHeight: 1.15, margin: 0 }}
            >
              {brideName} &amp; {groomName}
            </h1>

            <p style={{ fontFamily: 'var(--rpc-font-royal)', fontSize: 13, letterSpacing: '0.14em', color: 'var(--rpc-champagne)', margin: '14px 0 30px' }}>
              {dateLabel}
            </p>

            <button
              ref={sealRef}
              type="button"
              className="rpc-seal-btn"
              onClick={handleOpen}
              disabled={opening}
              aria-label="Open the invitation"
            >
              <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Open</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
