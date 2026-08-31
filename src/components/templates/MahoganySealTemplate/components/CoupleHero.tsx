import { useEffect, useState } from 'react'
import { formatDateLabel } from '../defaults'
import AmbientLights from './AmbientLights'

interface CoupleHeroProps {
  name1: string
  name2: string
  hashtag: string
  caricatureUrl: string
  caricatureAlt?: string
  weddingDateISO: string
  reduceMotion?: boolean
}

function getCountdown(targetISO: string) {
  const diff = new Date(targetISO).getTime() - Date.now()
  const clamped = Math.max(0, diff)
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

/** Live Days/Hours/Min/Sec countdown to the wedding, ticking every second. */
function Countdown({ targetISO }: { targetISO: string }) {
  const [parts, setParts] = useState(() => getCountdown(targetISO))

  useEffect(() => {
    const id = setInterval(() => setParts(getCountdown(targetISO)), 1000)
    return () => clearInterval(id)
  }, [targetISO])

  const units: Array<[label: string, value: number]> = [
    ['Days', parts.days],
    ['Hours', parts.hours],
    ['Min', parts.minutes],
    ['Sec', parts.seconds],
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4" role="timer" aria-label="Countdown to the wedding">
      {units.map(([label, value]) => (
        <div
          key={label}
          className="flex w-16 flex-col items-center rounded-xl border border-[#d4af37]/25 bg-[#3d2820]/60 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.35)] sm:w-20"
        >
          <span className="mst-font-display text-2xl font-semibold text-[#f2d675] tabular-nums sm:text-3xl">
            {String(value).padStart(2, '0')}
          </span>
          <span className="mst-font-seal mt-1 text-[9px] tracking-[0.2em] text-[#fbf3e3]/70 uppercase">{label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * The main dashboard's header — couple names, the caricature illustration
 * (arched gold frame), hashtag pill, and a live countdown to the wedding.
 */
export default function CoupleHero({
  name1,
  name2,
  hashtag,
  caricatureUrl,
  caricatureAlt,
  weddingDateISO,
  reduceMotion = false,
}: CoupleHeroProps) {
  return (
    <header className="relative flex flex-col items-center gap-6 overflow-hidden bg-gradient-to-b from-[#2c1d18] to-[#3d2820] px-6 pb-14 pt-16 text-center">
      {/* Full-density lamplight/bokeh/embers — the first section the guest
          sees after the intro video, so it's the one that most needs to
          feel like the same brightly-lit room rather than a step down. */}
      <AmbientLights variant="wash" density="full" reduceMotion={reduceMotion} />
      <div aria-hidden="true" className="mst-grain pointer-events-none absolute inset-0 opacity-20" />

      <p className="mst-font-seal relative z-10 text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">Together with joy</p>

      {/* Arched caricature frame */}
      <div className="relative z-10 flex justify-center">
        <div
          className="relative h-56 w-48 overflow-hidden border-2 border-[#d4af37] bg-[#1a100d] shadow-[0_16px_40px_rgba(0,0,0,0.5)] sm:h-64 sm:w-56"
          style={{ borderRadius: '50% 50% 8px 8px / 60% 60% 8px 8px' }}
        >
          <img src={caricatureUrl} alt={caricatureAlt ?? `${name1} and ${name2}`} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 border border-[#d4af37]/30"
          style={{ borderRadius: '50% 50% 8px 8px / 60% 60% 8px 8px' }}
        />
      </div>

      <h2 className="mst-font-display relative z-10 text-4xl font-semibold text-[#fbf3e3] sm:text-5xl">
        {name1} <span className="mst-font-script text-[#d4af37]">&amp;</span> {name2}
      </h2>

      <p className="relative z-10 rounded-full border border-[#d4af37]/40 bg-[#1a100d]/50 px-4 py-1 text-sm tracking-[0.08em] text-[#f2d675]">
        {hashtag}
      </p>

      <p className="mst-font-seal relative z-10 text-xs tracking-[0.15em] text-[#fbf3e3]/70 uppercase">
        {formatDateLabel(weddingDateISO)}
      </p>

      <div className="relative z-10 mt-2 w-full">
        <Countdown targetISO={weddingDateISO} />
      </div>
    </header>
  )
}
