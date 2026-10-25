import { useEffect, useState } from 'react'

function remaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    done: diff === 0,
    units: [
      { label: 'Days', value: Math.floor(diff / 86_400_000) },
      { label: 'Hours', value: Math.floor(diff / 3_600_000) % 24 },
      { label: 'Min', value: Math.floor(diff / 60_000) % 60 },
      { label: 'Sec', value: Math.floor(diff / 1000) % 60 },
    ],
  }
}

/** Step 3 — outlined Days/Hours/Min/Sec boxes, ticking once a second. */
export default function Countdown({ targetISO }: { targetISO: string }) {
  const targetMs = new Date(targetISO).getTime()
  const [state, setState] = useState(() => remaining(targetMs))

  useEffect(() => {
    if (Number.isNaN(targetMs)) return
    const id = setInterval(() => setState(remaining(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  if (Number.isNaN(targetMs)) return null

  return (
    <section className="vtt-section" data-vtt-reveal aria-label="Countdown to the wedding">
      <h2 className="vtt-script-title">Countdown</h2>
      <div className="vtt-countdown" role="timer" aria-live="off">
        {state.units.map((u) => (
          <div key={u.label} className="vtt-countdown-unit">
            <span className="vtt-countdown-box">{String(u.value).padStart(2, '0')}</span>
            <span className="vtt-countdown-label">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="vtt-muted">{state.done ? 'The big day is here!' : 'until the big day'}</p>
    </section>
  )
}
