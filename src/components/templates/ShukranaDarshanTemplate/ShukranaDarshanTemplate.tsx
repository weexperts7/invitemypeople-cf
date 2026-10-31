import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import './ShukranaDarshanTemplate.css'
import type { ShukranaData, ShukranaWish } from './types'

import JyotStage from './components/JyotStage'
import MalaJaap from './components/MalaJaap'
import RoseThought from './components/RoseThought'
import SkRsvpForm from './components/SkRsvpForm'
import ShukranaWall from './components/ShukranaWall'
import { CalendarIcon, LockIcon, MapPinIcon, ThaliIcon } from './components/Icons'

const MUSIC_VOLUME = 0.6
const PETALS = Array.from({ length: 9 }, (_, i) => i)
const pad = (n: number) => String(n).padStart(2, '0')

function parseDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

// See RangMahalTemplate.tsx's useStageHeight: inside the desktop preview's
// scrolling card the stage measures the card; on a phone CSS's 100svh applies
// and this stays null.
function useStageHeight(rootRef: React.RefObject<HTMLDivElement | null>) {
  const [height, setHeight] = useState<number | null>(null)
  useEffect(() => {
    let node = rootRef.current?.parentElement ?? null
    while (node && node !== document.body) {
      const { overflowY } = getComputedStyle(node)
      if (overflowY === 'auto' || overflowY === 'scroll') break
      node = node.parentElement
    }
    if (!node || node === document.body) return
    const scroller = node
    const measure = () => setHeight(scroller.clientHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scroller)
    return () => ro.disconnect()
  }, [rootRef])
  return height
}

/** Google Calendar link; an unset time becomes an all-day entry. */
function calendarLink(data: ShukranaData, start: Date) {
  const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const stamp = (d: Date) => `${day(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const dates = data.timeLine
    ? `${stamp(start)}/${stamp(new Date(start.getTime() + 3 * 3_600_000))}`
    : `${day(start)}/${day(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1))}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Guruji Satsang — ${data.familyName}`,
    dates,
    ctz: 'Asia/Kolkata',
    location: data.venue,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [target])
  if (!target) return null
  const diff = Math.max(0, target.getTime() - now)
  return {
    done: diff === 0,
    units: [
      { label: 'Days', value: Math.floor(diff / 86_400_000) },
      { label: 'Hours', value: Math.floor(diff / 3_600_000) % 24 },
      { label: 'Minutes', value: Math.floor(diff / 60_000) % 60 },
    ],
  }
}

/**
 * Shukrana Darshan — a Guruji Satsang invitation built around doing, not just
 * reading: guests light a jyot to open Guruji's darshan, chant on a mala whose
 * count the whole sangat shares, offer seva as they RSVP, and leave their
 * shukrana for everyone to read. Self-contained (own types and scoped
 * `.skd-root` styles), wired in through
 * components/satsang/shukrana-darshan/ShukranaDarshanAdapter.jsx.
 */
export default function ShukranaDarshanTemplate({ data }: { data: ShukranaData }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const stageHeight = useStageHeight(rootRef)

  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [postedWish, setPostedWish] = useState<ShukranaWish | null>(null)

  const start = parseDate(data.startISO)
  const countdown = useCountdown(start)
  const mapUrl = data.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue)}`

  // Runs on the guest's press on the diya, and again as the finger lifts, which
  // is the moment phones actually allow sound.
  const handlePrime = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = MUSIC_VOLUME
    audio.play().catch(() => {})
  }, [])

  const handleOpened = useCallback(() => setOpen(true), [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !open) return
    if (muted) audio.pause()
    else audio.play().catch(() => {})
  }, [muted, open])

  // Fade-and-rise each section in. Marked with an attribute rather than a
  // class, for the reason given in RangMahalTemplate.tsx.
  useEffect(() => {
    if (!open) return
    const targets = rootRef.current?.querySelectorAll<HTMLElement>('[data-skd-reveal]') ?? []
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.setAttribute('data-skd-in', ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-skd-in', '')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [open, reduceMotion])

  // Sticks to the viewport: `fixed` on a phone, `sticky` inside the desktop
  // preview's card, whose transform traps `fixed` — see RangMahalTemplate.tsx.
  const pinned = stageHeight === null ? ' skd-pinned--fixed' : ''
  const shareText = `Jai Guruji 🙏 ${data.familyName} invite you to satsang on ${data.dateLine}. Open the invitation and light the jyot: ${data.shareUrl}`

  return (
    <div ref={rootRef} className="skd-root">
      <audio ref={audioRef} src={data.musicUrl} loop preload="auto" />

      {open && !reduceMotion && (
        <div className={`skd-pinned${pinned}`} aria-hidden="true">
          <div className="skd-petals" style={stageHeight ? { height: stageHeight } : undefined}>
            {PETALS.map((i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      )}

      {open && (
        <div className={`skd-pinned${pinned}`}>
          <button
            type="button"
            className="skd-sound"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Play music' : 'Mute music'}
            aria-pressed={!muted}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              {muted ? <path d="m22 9-6 6M16 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
            </svg>
          </button>
        </div>
      )}

      <JyotStage
        data={data}
        height={stageHeight}
        reduceMotion={reduceMotion}
        onPrime={handlePrime}
        onOpened={handleOpened}
      />

      {open && (
        <main>
          <section className="skd-section skd-section--cream" data-skd-reveal aria-label="Invitation">
            <p className="skd-kicker">{data.greetingLine}</p>
            <h2 className="skd-title">You Are Invited</h2>
            <p className="skd-lead">{data.hostLine}</p>

            <div className="skd-card">
              <div className="skd-detail">
                <CalendarIcon />
                <div>
                  <p className="skd-detail-main">{data.dateLine}</p>
                  {data.timeLine && <p className="skd-detail-sub">{data.timeLine} onwards</p>}
                </div>
              </div>
              <div className="skd-detail">
                <MapPinIcon />
                <p className="skd-detail-main">{data.venue}</p>
              </div>
              <div className="skd-actions">
                <a className="skd-chip" href={mapUrl} target="_blank" rel="noreferrer">
                  Get directions
                </a>
                {start && (
                  <a className="skd-chip" href={calendarLink(data, start)} target="_blank" rel="noreferrer">
                    Add to calendar
                  </a>
                )}
              </div>
            </div>

            {countdown && (
              <div className="skd-count" role="timer" aria-live="off">
                {countdown.done ? (
                  <p className="skd-note">The satsang is today. Jai Guruji!</p>
                ) : (
                  countdown.units.map((u) => (
                    <div key={u.label} className="skd-count-cell">
                      <span className="skd-count-value">{pad(u.value)}</span>
                      <span className="skd-count-label">{u.label}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {data.programme.length > 0 && (
            <section className="skd-section skd-section--cream skd-section--tight" data-skd-reveal aria-label="Programme">
              <p className="skd-kicker">The evening</p>
              <h2 className="skd-title">Satsang Programme</h2>
              <ol className="skd-programme">
                {data.programme.map((item, i) => (
                  <li key={`${item.title}-${i}`}>
                    <span className="skd-programme-dot" aria-hidden="true" />
                    <span className="skd-programme-title">{item.title}</span>
                    {item.time && <span className="skd-programme-time">{item.time}</span>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <MalaJaap slug={data.invitationSlug} demoCount={data.demo?.jaapCount} reduceMotion={reduceMotion} />

          <section className="skd-section skd-section--saffron" data-skd-reveal aria-label="Langar prasad">
            <ThaliIcon />
            <p className="skd-kicker">Guruji&rsquo;s langar</p>
            <h2 className="skd-title">Langar Prasad</h2>
            {data.langarTime && <p className="skd-langar-time">Served at {data.langarTime}</p>}
            <p className="skd-lead">{data.langarNote}</p>
          </section>

          <RoseThought
            familyName={data.familyName}
            dateLine={data.dateLine}
            shareUrl={data.shareUrl}
            isPrivate={Boolean(data.privateNote)}
            reduceMotion={reduceMotion}
          />

          {data.photos.length > 0 && (
            <section className="skd-section skd-section--cream" data-skd-reveal aria-label="Memories">
              <p className="skd-kicker">With the sangat</p>
              <h2 className="skd-title">Satsang Memories</h2>
              <div className="skd-gallery">
                {data.photos.map((src, i) => (
                  <img key={`${src}-${i}`} src={src} alt={`Satsang memory ${i + 1}`} loading="lazy" />
                ))}
              </div>
            </section>
          )}

          <SkRsvpForm slug={data.invitationSlug} onShukrana={setPostedWish} />

          <ShukranaWall slug={data.invitationSlug} demoWishes={data.demo?.wishes} posted={postedWish} />

          <section className="skd-section skd-section--night skd-closing" data-skd-reveal aria-label="Closing">
            <p className="skd-closing-word">Shukrana</p>
            {data.privateNote ? (
              <p className="skd-private">
                <LockIcon />
                {data.privateNote}
              </p>
            ) : (
              <>
                <p className="skd-lead">Please share this with anyone in the sangat who would love to join.</p>
                <a
                  className="skd-btn"
                  href={`https://api.whatsapp.com/send?${new URLSearchParams({ text: shareText }).toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Invite the sangat on WhatsApp
                </a>
              </>
            )}
            <p className="skd-closing-family">{data.familyName}</p>
          </section>
        </main>
      )}
    </div>
  )
}
