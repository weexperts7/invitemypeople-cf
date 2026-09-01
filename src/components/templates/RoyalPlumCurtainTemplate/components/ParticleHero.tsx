import { useRef, useEffect, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface ParticleHeroProps {
  brideName: string
  groomName: string
  caricatureUrl: string
  caricatureAlt?: string
  reduceMotion?: boolean
}

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?'
}

interface Orb {
  x: number
  y: number
  baseX: number
  baseY: number
  radius: number
  hue: 'gold' | 'amber'
  angle: number
  speed: number
  orbitRadius: number
}

const ORB_COUNT = 20

/**
 * Step B — hero section: a floating caricature of the couple with a gentle
 * continuous bob, backed by a canvas layer of soft glowing gold/amber light
 * orbs that drift in slow orbits around the frame.
 *
 * The particle loop is driven by `gsap.ticker` (not a bare `requestAnimationFrame`
 * loop) so it shares GSAP's frame scheduler and is removed via the same
 * `useGSAP` cleanup as every other tween in this template — no dangling RAF
 * handles if the component unmounts mid-animation.
 */
export default function ParticleHero({
  brideName,
  groomName,
  caricatureUrl,
  caricatureAlt,
  reduceMotion,
}: ParticleHeroProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const caricatureRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  // Comprehensive fallback: a caller with no illustration yet (or a URL
  // that 404s) gets a tasteful gold monogram medallion instead of a
  // browser's broken-image icon — this is a real, guest-facing template
  // now, not just a mock-data demo.
  const [imageFailed, setImageFailed] = useState(!caricatureUrl)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<Orb[]>([])

  useGSAP(
    () => {
      if (reduceMotion) return

      // Continuous bobbing motion on the caricature frame.
      gsap.to(caricatureRef.current, {
        y: -8,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      // Bouncing scroll-cue arrow.
      gsap.to(arrowRef.current, {
        y: 8,
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    },
    { scope: scopeRef, dependencies: [reduceMotion] }
  )

  // Canvas particle orbit system — separate effect since it manages its own
  // canvas-sized state and resize listener alongside the ticker.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = scopeRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      const rect = container.getBoundingClientRect()
      width = canvas.width = rect.width
      height = canvas.height = rect.height
    }
    resize()

    const cx = () => width / 2
    const cy = () => height / 2

    orbsRef.current = Array.from({ length: ORB_COUNT }, (_, i) => {
      const orbitRadius = gsap.utils.random(80, Math.min(width, height) * 0.55)
      return {
        angle: (i / ORB_COUNT) * Math.PI * 2,
        orbitRadius,
        speed: gsap.utils.random(0.05, 0.18) * (Math.random() > 0.5 ? 1 : -1),
        radius: gsap.utils.random(1.5, 4),
        hue: Math.random() > 0.5 ? 'gold' : 'amber',
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
      }
    })

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const orb of orbsRef.current) {
        if (!reduceMotion) orb.angle += orb.speed * 0.016
        const wobble = Math.sin(orb.angle * 2) * 10
        orb.x = cx() + Math.cos(orb.angle) * (orb.orbitRadius + wobble)
        orb.y = cy() + Math.sin(orb.angle) * (orb.orbitRadius * 0.6 + wobble)

        const color = orb.hue === 'gold' ? '245, 208, 97' : '230, 160, 71'
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius * 6)
        gradient.addColorStop(0, `rgba(${color}, 0.9)`)
        gradient.addColorStop(1, `rgba(${color}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius * 6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    gsap.ticker.add(draw)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)

    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener('resize', onResize)
    }
  }, [reduceMotion])

  return (
    <section ref={scopeRef} className="rpc-hero" data-rpc-hero-reveal>
      <canvas ref={canvasRef} className="rpc-hero-canvas" aria-hidden="true" />

      <p
        aria-hidden="true"
        className="rpc-gold-text rpc-om-symbol"
        style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--rpc-font-royal)', fontSize: 26, marginBottom: 8, textAlign: 'center', ...(reduceMotion ? { animation: 'none' } : {}) }}
      >
        ॐ
      </p>

      <p
        className="rpc-tracking"
        style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--rpc-font-ui)', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 18, textAlign: 'center' }}
      >
        Together with their families
      </p>

      <div ref={caricatureRef} className="rpc-caricature-frame">
        {!imageFailed ? (
          <img
            src={caricatureUrl}
            alt={caricatureAlt ?? `${brideName} and ${groomName}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          // No <img> in this branch, so unlike the image case, this div has
          // to size itself — the frame's own width with no fixed height
          // (see RoyalPlumTemplate.css) only works because an <img> sets
          // it via `height: auto`. A soft radial glow stands in for a
          // border here too, same "floating, not boxed" treatment as the
          // real photo's drop-shadow.
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              aspectRatio: '3 / 4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: 'var(--rpc-font-script)',
              fontSize: 'clamp(40px, 12vw, 64px)',
              background: 'radial-gradient(circle, rgba(230,186,71,0.16) 0%, transparent 70%)',
            }}
            className="rpc-gold-text"
          >
            <span>{initials(brideName)}</span>
            <span style={{ fontSize: '0.5em', opacity: 0.7 }}>&amp;</span>
            <span>{initials(groomName)}</span>
          </div>
        )}
      </div>

      <h2
        className="rpc-gold-text"
        style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--rpc-font-script)', fontSize: 'clamp(30px, 8vw, 42px)', marginTop: 18, textAlign: 'center' }}
      >
        {brideName} &amp; {groomName}
      </h2>

      <div ref={arrowRef} className="rpc-scroll-cue" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 4v15M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
