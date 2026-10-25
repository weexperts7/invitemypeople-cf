import { useCallback, useEffect, useState } from 'react'

import Celebration from '../../../Celebration'
import { useScratchCanvas } from '../../../../hooks/useScratchCanvas'

// 3 × 88px + 2 × 12px gaps fits a 320px phone's content width.
const COIN_SIZE = 88
const CELEBRATION_COLORS = ['#5c2018', '#8e161d', '#d6ad5a', '#efd7a1', '#faf8f5']

// Brushed-gold foil: a conic sweep gives the spun-metal look of the
// reference's coins; browsers without createConicGradient get a radial one.
function drawGoldCoin(ctx: CanvasRenderingContext2D, { width, height }: { width: number; height: number }) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) / 2

  let fill: CanvasGradient
  if (typeof ctx.createConicGradient === 'function') {
    fill = ctx.createConicGradient(0, cx, cy)
    const stops = ['#c99a45', '#f6e2ae', '#b98a3a', '#f3d58f', '#c99a45', '#fbeec8', '#b98a3a', '#f0cf86', '#c99a45']
    stops.forEach((c, i) => fill.addColorStop(i / (stops.length - 1), c))
  } else {
    fill = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
    fill.addColorStop(0, '#fbeec8')
    fill.addColorStop(0.6, '#e2bd6e')
    fill.addColorStop(1, '#b98a3a')
  }

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255, 248, 225, 0.55)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function Coin({ value, label, onRevealed }: { value: string; label: string; onRevealed: () => void }) {
  const { canvasRef, revealed, canvasHandlers } = useScratchCanvas({
    width: COIN_SIZE,
    height: COIN_SIZE,
    drawSurface: drawGoldCoin,
    onRevealed,
    revealThreshold: 0.45,
    brushRadius: 12,
  })

  return (
    <div className="vtt-coin">
      <div className="vtt-coin-face" style={{ width: COIN_SIZE, height: COIN_SIZE }}>
        <span className="vtt-coin-value">{value}</span>
        <canvas
          ref={canvasRef}
          className={`vtt-coin-foil${revealed ? ' vtt-coin-foil--gone' : ''}`}
          style={{ width: COIN_SIZE, height: COIN_SIZE }}
          aria-label={`Scratch to reveal the ${label.toLowerCase()}`}
          {...canvasHandlers}
        />
      </div>
      <span className="vtt-coin-label">{label}</span>
    </div>
  )
}

/** Step 2 — three gold coins hiding the day, month and year. */
export default function ScratchCoins({ day, month, year }: { day: string; month: string; year: string }) {
  const [count, setCount] = useState(0)
  const [celebrate, setCelebrate] = useState(false)

  const handleRevealed = useCallback(() => setCount((n) => n + 1), [])

  useEffect(() => {
    if (count === 3) setCelebrate(true)
  }, [count])

  return (
    <section className="vtt-section vtt-section--tint" data-vtt-reveal aria-label="Save the date">
      <h2 className="vtt-script-title">Reveal</h2>
      <p className="vtt-kicker">Scratch to discover the date</p>

      <div className="vtt-coins">
        <Coin value={day} label="Day" onRevealed={handleRevealed} />
        <Coin value={month} label="Month" onRevealed={handleRevealed} />
        <Coin value={year} label="Year" onRevealed={handleRevealed} />
      </div>

      <p className={`vtt-coins-note${count === 3 ? ' vtt-coins-note--done' : ''}`}>
        {count === 3 ? 'Save the date — we’ll see you there!' : `${3 - count} left to scratch`}
      </p>

      {celebrate && (
        <Celebration
          intensity={1.2}
          label="Save the date!"
          colors={CELEBRATION_COLORS}
          onComplete={() => setCelebrate(false)}
        />
      )}
    </section>
  )
}
