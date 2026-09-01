import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface CountdownTimerProps {
  /** ISO 8601 timestamp being counted down to. */
  targetISO: string
}

interface TimeParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const UNITS: Array<{ key: keyof TimeParts; label: string }> = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hours' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'seconds', label: 'Seconds' },
]

function getTimeParts(targetISO: string): TimeParts {
  const diff = Math.max(0, new Date(targetISO).getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

/**
 * Step D — a live real-time countdown to the wedding timestamp, rendered as
 * four metallic gold-bordered boxes (Days / Hours / Minutes / Seconds).
 * Ticks on a plain `setInterval` (a 1s wall-clock tick has no business being
 * a GSAP tween), but every digit change gets a quick GSAP "flip" punch so
 * the numbers don't just flatly replace themselves.
 */
export default function CountdownTimer({ targetISO }: CountdownTimerProps) {
  const [parts, setParts] = useState<TimeParts>(() => getTimeParts(targetISO))
  const scopeRef = useRef<HTMLDivElement>(null)
  const valueRefs = useRef<Record<keyof TimeParts, HTMLSpanElement | null>>({
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  })
  const prevPartsRef = useRef<TimeParts>(parts)

  const { contextSafe } = useGSAP({ scope: scopeRef })

  const punch = contextSafe((el: HTMLElement | null) => {
    if (!el) return
    gsap.fromTo(el, { y: -6, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' })
  })

  useEffect(() => {
    const tick = () => setParts(getTimeParts(targetISO))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetISO])

  useEffect(() => {
    const prev = prevPartsRef.current
    UNITS.forEach(({ key }) => {
      if (prev[key] !== parts[key]) punch(valueRefs.current[key])
    })
    prevPartsRef.current = parts
  }, [parts, punch])

  return (
    <div ref={scopeRef} className="rpc-countdown" role="timer" aria-live="polite">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="rpc-countdown-box">
          <span
            ref={(el) => {
              valueRefs.current[key] = el
            }}
            className="rpc-countdown-value"
          >
            {String(parts[key]).padStart(2, '0')}
          </span>
          <div className="rpc-countdown-label">{label}</div>
        </div>
      ))}
    </div>
  )
}
