import { useEffect, useRef } from 'react'

export type FlameState = 'idle' | 'holding' | 'lit'

const WIDTH = 240
const HEIGHT = 270
const WICK_X = 120
const WICK_Y = 222
const SPRITE_SIZE = 64
const HOLD_S = 1.1
// The flame overshoots as it catches, then settles.
const FLARE_S = 0.22
// A phone that can't keep up drops to fewer, larger particles rather than
// stuttering: the flame looks the same and the frame rate recovers.
const SLOW_FRAME_S = 1 / 40
const QUALITY_WINDOW_S = 0.6
const MIN_QUALITY = 0.4

type Stop = [offset: number, color: string]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
}

function makeSprite(stops: Stop[]) {
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_SIZE
  canvas.height = SPRITE_SIZE
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const mid = SPRITE_SIZE / 2
    const gradient = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid)
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  }
  return canvas
}

/**
 * The jyot itself: glowing particles rising off the wick and drawn additively,
 * which is what gives it a white-hot core, a blue base and an orange tip.
 * The wick smoulders while the guest holds, catches with a flare and a shower
 * of sparks, then settles into a slow flicker.
 */
export default function JyotFlame({ state }: { state: FlameState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = WIDTH * dpr
    canvas.height = HEIGHT * dpr
    ctx.scale(dpr, dpr)

    const hot = makeSprite([[0, 'rgba(255,252,235,1)'], [0.45, 'rgba(255,232,150,0.6)'], [1, 'rgba(255,200,90,0)']])
    const gold = makeSprite([[0, 'rgba(255,214,100,0.9)'], [0.5, 'rgba(255,160,45,0.4)'], [1, 'rgba(255,130,30,0)']])
    const amber = makeSprite([[0, 'rgba(255,125,35,0.7)'], [0.5, 'rgba(225,60,15,0.25)'], [1, 'rgba(200,40,10,0)']])
    const ember = makeSprite([[0, 'rgba(190,45,12,0.35)'], [1, 'rgba(150,30,10,0)']])
    const blue = makeSprite([[0, 'rgba(95,140,255,0.6)'], [1, 'rgba(70,100,255,0)']])
    const halo = makeSprite([[0, 'rgba(255,175,75,0.38)'], [0.45, 'rgba(255,125,45,0.11)'], [1, 'rgba(255,110,40,0)']])

    const flames: Particle[] = []
    const sparks: Particle[] = []
    let frame = 0
    let last = performance.now()
    let clock = 0
    let smoulder = 0
    let power = 0
    let litFor = -1
    let flameDebt = 0
    let sparkDebt = 0
    let quality = 1
    let windowS = 0
    let slowS = 0

    const spark = (speed: number, spread: number) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread
      sparks.push({
        x: WICK_X,
        y: WICK_Y - 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: 0.5 + Math.random() * 0.7,
        size: 2.5 + Math.random() * 3,
      })
    }

    const draw = (sprite: HTMLCanvasElement, x: number, y: number, size: number, alpha: number) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size)
    }

    const tick = (now: number) => {
      const frameS = (now - last) / 1000
      const dt = Math.min(frameS, 0.05)
      last = now
      clock += dt
      const current = stateRef.current

      // Long gaps are a hidden tab, not a slow phone.
      if (current !== 'idle' && frameS < 0.25) {
        windowS += frameS
        if (frameS > SLOW_FRAME_S) slowS += frameS
        if (windowS >= QUALITY_WINDOW_S) {
          if (slowS / windowS > 0.5) quality = Math.max(MIN_QUALITY, quality - 0.2)
          windowS = 0
          slowS = 0
        }
      }

      if (current === 'holding') smoulder = Math.min(1, smoulder + dt / HOLD_S)
      else if (current === 'idle') smoulder = Math.max(0, smoulder - dt * 2)

      if (current === 'lit') {
        if (litFor < 0) {
          litFor = 0
          for (let i = 0; i < 18; i += 1) spark(60 + Math.random() * 110, 1.9)
        }
        litFor += dt
        const flaring = litFor < FLARE_S
        power += ((flaring ? 1.5 : 1) - power) * Math.min(1, dt * (flaring ? 15 : 3.5))
      }

      const flicker = 1 + 0.08 * Math.sin(clock * 11) + 0.05 * Math.sin(clock * 17.3 + 1) + 0.04 * Math.sin(clock * 29 + 2)
      const sway = 4.5 * Math.sin(clock * 2.1) + 2.5 * Math.sin(clock * 5.3 + 1)

      if (power > 0.02) {
        flameDebt += dt * 175 * quality * Math.min(power, 1.2)
        while (flameDebt >= 1) {
          flameDebt -= 1
          flames.push({
            x: WICK_X + (Math.random() - 0.5) * 5,
            y: WICK_Y - Math.random() * 4,
            vx: (Math.random() - 0.5) * 30,
            vy: -(104 + Math.random() * 30) * power * flicker,
            age: 0,
            life: 0.48 + Math.random() * 0.12,
            size: (30 + Math.random() * 10) * (0.7 + 0.3 * power) * (1.5 - quality / 2),
          })
        }
      }

      sparkDebt += dt * (current === 'lit' ? 3 : smoulder > 0.3 ? 9 * smoulder : 0)
      while (sparkDebt >= 1) {
        sparkDebt -= 1
        spark(32 + Math.random() * 42, 0.8)
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      ctx.globalCompositeOperation = 'lighter'

      if (power > 0.02) {
        const glow = 225 * flicker * Math.min(power, 1.3)
        draw(halo, WICK_X + sway * 0.4, WICK_Y - 42, glow, Math.min(power, 1))
      }

      if (smoulder > 0 && power < 0.5) {
        draw(amber, WICK_X, WICK_Y, 12 + 30 * smoulder, smoulder)
        draw(hot, WICK_X, WICK_Y, 3 + 9 * smoulder, smoulder * 0.9)
      }

      for (let i = flames.length - 1; i >= 0; i -= 1) {
        const p = flames[i]
        p.age += dt
        if (p.age >= p.life) {
          flames.splice(i, 1)
          continue
        }
        const t = p.age / p.life
        // Drawn in towards a moving tip, which is what makes the teardrop.
        p.x += (p.vx * (1 - t) + (WICK_X + sway * t * 1.3 - p.x) * 8 * t * t) * dt
        p.y += p.vy * dt
        // Starts small so the base stays narrow, swells into the belly, then
        // tapers to the tip.
        const swell = 0.5 + 0.5 * Math.min(1, t / 0.28)
        const size = p.size * swell * (1 - t * t * 0.86)
        const sprite = t < 0.2 ? hot : t < 0.52 ? gold : t < 0.82 ? amber : ember
        draw(sprite, p.x, p.y, size, sprite === hot ? 0.42 : 0.62 * (1 - t * 0.45))
      }

      if (power > 0.02) draw(blue, WICK_X, WICK_Y - 1, 24, 0.7 * Math.min(power, 1))

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i]
        p.age += dt
        if (p.age >= p.life) {
          sparks.splice(i, 1)
          continue
        }
        p.vy += 26 * dt
        p.x += (p.vx + Math.sin(clock * 9 + i) * 12) * dt
        p.y += p.vy * dt
        draw(gold, p.x, p.y, p.size * 2, 1 - p.age / p.life)
      }

      ctx.globalAlpha = 1
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} className="skd-jyot" aria-hidden="true" />
}
