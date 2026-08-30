import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface LoveHeartsProps {
  children: React.ReactNode
}

const HEART_COLORS = ['#F5D061', '#E6BA47', '#E86C7A', '#FF8FA3']
let heartUid = 0

/**
 * Step D — wraps a "Send Love" trigger. Each click spawns a handful of
 * heart glyphs at the click point that float upward with drift and fade
 * out, then remove themselves from the DOM. Every spawned heart's tween is
 * created inside the shared `useGSAP` scope via `contextSafe`, so if the
 * component unmounts mid-flight (e.g. user navigates away), GSAP's context
 * revert kills all in-flight heart tweens instead of leaking them.
 */
export default function LoveHearts({ children }: LoveHeartsProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: scopeRef })

  const spawnHearts = contextSafe((clientX: number, clientY: number) => {
    const layer = layerRef.current
    if (!layer) return
    const layerRect = layer.getBoundingClientRect()
    const originX = clientX - layerRect.left
    const originY = clientY - layerRect.top

    const count = gsap.utils.random(5, 8, 1)
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span')
      el.className = 'rpc-heart'
      el.textContent = Math.random() > 0.3 ? '♥' : '✦'
      el.style.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]
      el.style.fontSize = `${gsap.utils.random(14, 26)}px`
      el.style.left = `${originX}px`
      el.style.top = `${originY}px`
      el.dataset.uid = String(heartUid++)
      layer.appendChild(el)

      const driftX = gsap.utils.random(-60, 60)
      const riseY = gsap.utils.random(120, 220)

      gsap
        .timeline({ onComplete: () => el.remove() })
        .fromTo(
          el,
          { opacity: 0, scale: 0.4, x: 0, y: 0 },
          { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }
        )
        .to(el, {
          y: -riseY,
          x: driftX,
          duration: gsap.utils.random(1.4, 2.2),
          ease: 'power1.out',
        }, '<')
        .to(el, { opacity: 0, duration: 0.5 }, '>-0.5')
    }
  })

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    spawnHearts(e.clientX, e.clientY)
  }

  return (
    <div ref={scopeRef} style={{ position: 'relative' }}>
      <div ref={layerRef} className="rpc-heart-layer" aria-hidden="true" />
      <div onClick={handleClick}>{children}</div>
    </div>
  )
}
