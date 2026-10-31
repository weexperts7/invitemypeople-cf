import { useEffect, useState } from 'react'

function remaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now())
  return {
    done: diff === 0,
    units: [
      { label: 'Days', value: Math.floor(diff / 86_400_000) },
      { label: 'Hours', value: Math.floor(diff / 3_600_000) % 24 },
      { label: 'Minutes', value: Math.floor(diff / 60_000) % 60 },
      { label: 'Seconds', value: Math.floor(diff / 1000) % 60 },
    ],
  }
}

/** Step 4 — a row of palace windows counting down to the day. */
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
    <section className="rmt-section" data-rmt-reveal aria-label="Countdown to the wedding">
      <p className="rmt-kicker">Until forever begins</p>
      <div className="rmt-windows" role="timer" aria-live="off">
        {state.units.map((u) => (
          <div key={u.label} className="rmt-window">
            <span className="rmt-window-value">{String(u.value).padStart(2, '0')}</span>
            <span className="rmt-window-label">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="rmt-note">{state.done ? 'The day is here!' : 'Every passing moment brings us a little closer'}</p>
    </section>
  )
}
