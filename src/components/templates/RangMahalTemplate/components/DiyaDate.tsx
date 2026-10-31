import { useEffect, useState } from 'react'

import Celebration from '../../../Celebration'
import { DiyaBowl, Flame } from './Motifs'

const CELEBRATION_COLORS = ['#ef9a12', '#fbc531', '#c2185b', '#721a27', '#fff3d6']

interface DiyaDateProps {
  day: string
  month: string
  year: string
}

/** Step 3 — light each diya to bring its part of the date out of the dark. */
export default function DiyaDate({ day, month, year }: DiyaDateProps) {
  const parts = [
    { label: 'Day', value: day },
    { label: 'Month', value: month },
    { label: 'Year', value: year },
  ]
  const [lit, setLit] = useState<boolean[]>([false, false, false])
  const [celebrate, setCelebrate] = useState(false)
  const allLit = lit.every(Boolean)

  useEffect(() => {
    if (allLit) setCelebrate(true)
  }, [allLit])

  return (
    <section
      className={`rmt-section rmt-section--night${allLit ? ' rmt-section--aglow' : ''}`}
      data-rmt-reveal
      aria-label="Save the date"
    >
      <p className="rmt-kicker">Save the date</p>
      <h2 className="rmt-title">Light the Diyas</h2>

      <div className="rmt-diyas">
        {parts.map((part, i) => (
          <button
            key={part.label}
            type="button"
            className={`rmt-diya${lit[i] ? ' rmt-diya--lit' : ''}`}
            onClick={() => setLit((prev) => prev.map((v, j) => (j === i ? true : v)))}
            disabled={lit[i]}
            aria-label={lit[i] ? `${part.label}: ${part.value}` : `Light the diya to reveal the ${part.label.toLowerCase()}`}
          >
            <span className="rmt-diya-value">{lit[i] ? part.value : ''}</span>
            <span className="rmt-diya-lamp">
              <span className="rmt-diya-halo" />
              <Flame className="rmt-diya-flame" />
              <DiyaBowl className="rmt-diya-bowl" />
            </span>
            <span className="rmt-diya-label">{part.label}</span>
          </button>
        ))}
      </div>

      <p className="rmt-diya-note">{allLit ? 'We can’t wait to see you there' : 'Tap each diya to light it'}</p>

      {celebrate && (
        <Celebration intensity={1.2} label="Save the date!" colors={CELEBRATION_COLORS} onComplete={() => setCelebrate(false)} />
      )}
    </section>
  )
}
