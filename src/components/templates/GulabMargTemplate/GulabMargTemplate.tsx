import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

import '../ShukranaDarshanTemplate/ShukranaDarshanTemplate.css'
import './GulabMargTemplate.css'
import type { GulabMargData } from './types'
import type { ShukranaWish } from '../ShukranaDarshanTemplate/types'

import { LockIcon } from '../ShukranaDarshanTemplate/components/Icons'
import ShukranaWall from '../ShukranaDarshanTemplate/components/ShukranaWall'
import SkRsvpForm from '../ShukranaDarshanTemplate/components/SkRsvpForm'
import { createBell } from '../ShukranaDarshanTemplate/components/bell'
import { calendarLink, pad, parseDate, useCountdown } from '../../../utils/satsangInvite'

import BouquetOffering from './components/BouquetOffering'
import OpeningScene from './components/OpeningScene'
import RoseBloom from './components/RoseBloom'
import RosePath from './components/RosePath'
import VachanNote from './components/VachanNote'

const MUSIC_VOLUME = 0.6
const OPEN_MS = 2600

// See RangMahalTemplate.tsx's useStageHeight.
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

// A little map for the venue postcard: a road winding up to the pin.
function PlaceScene() {
  return (
    <svg className="gm-postcard-scene" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="120" fill="#fde9dc" />
      <path d="M0 84 C50 58 96 92 150 72 C204 52 262 84 320 58 L320 120 L0 120 Z" fill="#f9d3cd" />
      <path d="M0 104 C70 84 124 112 196 96 C246 86 286 100 320 90 L320 120 L0 120 Z" fill="#f3b7bf" />
      <path className="gm-postcard-route" d="M14 110 C66 92 62 56 120 66 C176 76 178 34 226 40" />
      <path className="gm-postcard-pin" d="M232 8 C219 8 210 18 210 29 C210 44 232 60 232 60 C232 60 254 44 254 29 C254 18 245 8 232 8 Z" />
      <circle cx="232" cy="29" r="7" fill="#fffaf5" />
    </svg>
  )
}

function Stop({ label, tone = '', children }: { label: string; tone?: string; children: ReactNode }) {
  return (
    <section className={`gm-stop ${tone}`} data-gm-stop aria-label={label}>
      <RoseBloom />
      <div className="gm-page">{children}</div>
    </section>
  )
}

/**
 * Gulab Marg — a Guruji Satsang invitation set in a morning rose garden, the
 * daylight counterpart to Shukrana Darshan's night. A gate swings open onto
 * Guruji's darshan, a rose vine grows down the page through bands of the
 * invitation as the guest reads, and it ends at a bouquet the sangat builds
 * together, one rose from each guest. Own styles under `.gm-root`; the RSVP and wall are Shukrana
 * Darshan's logic restyled through its CSS variables, which is why its
 * stylesheet is imported too. Wired in through
 * components/satsang/gulab-marg/GulabMargAdapter.jsx.
 */
export default function GulabMargTemplate({ data }: { data: GulabMargData }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const pathRef = useRef<HTMLElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const stageHeight = useStageHeight(rootRef)

  const [started, setStarted] = useState(false)
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const [postedWish, setPostedWish] = useState<ShukranaWish | null>(null)

  const start = parseDate(data.startISO)
  const countdown = useCountdown(start)
  const leaf = start && {
    month: start.toLocaleDateString('en-IN', { month: 'short' }),
    day: start.getDate(),
    weekday: start.toLocaleDateString('en-IN', { weekday: 'long' }),
    year: start.getFullYear(),
  }
  const mapUrl = data.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue)}`

  const handleBegin = useCallback(() => {
    if (started) return
    navigator.vibrate?.(15)
    const audio = audioRef.current
    if (audio) {
      audio.volume = MUSIC_VOLUME
      audio.play().catch(() => {})
    }
    const bell = createBell()
    bell.resume()
    bell.ring()
    setStarted(true)
  }, [started])

  useEffect(() => {
    if (!started) return
    const timer = setTimeout(() => setOpen(true), reduceMotion ? 0 : OPEN_MS)
    return () => clearTimeout(timer)
  }, [started, reduceMotion])

  const handleWalk = useCallback(() => {
    pathRef.current?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !open) return
    if (muted) audio.pause()
    else audio.play().catch(() => {})
  }, [muted, open])

  // Each stop opens as the guest reaches it. Marked with attributes rather than
  // a class, for the reason given in RangMahalTemplate.tsx. The borrowed RSVP
  // and vachan sections wait on Shukrana Darshan's own attribute.
  useEffect(() => {
    if (!open) return
    const targets = rootRef.current?.querySelectorAll<HTMLElement>('[data-gm-stop], [data-skd-reveal]') ?? []
    const reveal = (el: Element) => {
      el.setAttribute('data-gm-in', '')
      el.setAttribute('data-skd-in', '')
    }
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach(reveal)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [open, reduceMotion])

  // Sticks to the viewport: `fixed` on a phone, `sticky` inside the desktop
  // preview's card, whose transform traps `fixed` — see RangMahalTemplate.tsx.
  const pinned = stageHeight === null ? ' gm-pinned--fixed' : ''
  const shareText = `Jai Guruji 🙏 ${data.familyName} invite you to satsang on ${data.dateLine}. Open the garden gate: ${data.shareUrl}`

  return (
    <div ref={rootRef} className="gm-root">
      <audio ref={audioRef} src={data.musicUrl} loop preload="auto" />

      {open && (
        <div className={`gm-pinned${pinned}`}>
          <button
            type="button"
            className="gm-sound"
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

      <OpeningScene
        data={data}
        height={stageHeight}
        started={started}
        open={open}
        onBegin={handleBegin}
        onWalk={handleWalk}
      />

      {open && (
        <main ref={pathRef}>
          <RosePath reduceMotion={reduceMotion}>
            <Stop label="Invitation">
              <div className="gm-invite">
                <p className="gm-kicker">{data.greetingLine}</p>
                <h2 className="gm-invite-title">You Are Invited</h2>
                <span className="gm-invite-rule" aria-hidden="true" />
                <p className="gm-invite-line">{data.hostLine}</p>
                <p className="gm-invite-family">{data.familyName}</p>
              </div>
            </Stop>

            <Stop label="When" tone="gm-stop--petal">
              <div className="gm-day">
                {leaf ? (
                  <div className="gm-leaf-page">
                    <span className="gm-leaf-month">{leaf.month}</span>
                    <span className="gm-leaf-day">{leaf.day}</span>
                    <span className="gm-leaf-weekday">{leaf.weekday}</span>
                    <span className="gm-leaf-year">{leaf.year}</span>
                  </div>
                ) : (
                  <h2 className="gm-title gm-title--detail">{data.dateLine}</h2>
                )}
                <div className="gm-day-side">
                  <p className="gm-kicker">Save the day</p>
                  {data.timeLine && <p className="gm-day-time">{data.timeLine}</p>}
                  {data.timeLine && <p className="gm-day-note">onwards</p>}
                  {start && (
                    <a className="gm-link" href={calendarLink(data, start)} target="_blank" rel="noreferrer">
                      Add to calendar
                    </a>
                  )}
                </div>
              </div>
              {countdown && (
                <div className="gm-count" role="timer" aria-live="off">
                  {countdown.done ? (
                    <p className="gm-lead">The satsang is today. Jai Guruji!</p>
                  ) : (
                    countdown.units.map((u) => (
                      <div key={u.label} className="gm-count-dial">
                        <span className="gm-count-value">{pad(u.value)}</span>
                        <span className="gm-count-label">{u.label}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Stop>

            <Stop label="Where" tone="gm-stop--cream">
              <div className="gm-postcard">
                <PlaceScene />
                <RoseBloom open className="gm-postcard-stamp" />
                <div className="gm-postcard-body">
                  <p className="gm-kicker">Find your way</p>
                  <h2 className="gm-postcard-venue">{data.venue}</h2>
                  <a className="gm-btn gm-btn--line" href={mapUrl} target="_blank" rel="noreferrer">
                    Get directions
                  </a>
                </div>
              </div>
            </Stop>

            {data.programme.length > 0 && (
              <Stop label="Programme" tone="gm-stop--rose">
                <p className="gm-kicker gm-kicker--light gm-centred">The evening</p>
                <h2 className="gm-title gm-title--light gm-centred">Satsang Programme</h2>
                <ol className="gm-moments">
                  {data.programme.map((item, i) => (
                    <li key={`${item.title}-${i}`}>
                      <span className="gm-moment-time">{item.time || i + 1}</span>
                      <span className="gm-moment-title">{item.title}</span>
                    </li>
                  ))}
                </ol>
                {data.programme.length > 2 && <p className="gm-swipe">Swipe to see the evening</p>}
              </Stop>
            )}

            <Stop label="Guruji's Vachan">
              <div className="gm-centred">
                <VachanNote
                  familyName={data.familyName}
                  dateLine={data.dateLine}
                  shareUrl={data.shareUrl}
                  isPrivate={Boolean(data.privateNote)}
                />
              </div>
            </Stop>

            {data.langarServed && (
            <Stop label="Langar prasad" tone="gm-stop--cream">
              <div className="gm-langar">
                <div className="gm-thali">
                  <div className="gm-thali-plate">
                    <span className="gm-kicker">Guruji&rsquo;s langar</span>
                    {data.langarTime ? (
                      <>
                        <span className="gm-thali-time">{data.langarTime}</span>
                        <span className="gm-thali-note">served with love</span>
                      </>
                    ) : (
                      <span className="gm-thali-note">after satsang</span>
                    )}
                  </div>
                </div>
                <h2 className="gm-title">Langar Prasad</h2>
                <p className="gm-lead">{data.langarNote}</p>
              </div>
            </Stop>
            )}

            {data.photos.length > 0 && (
              <Stop label="Memories">
                <p className="gm-kicker gm-centred">With the sangat</p>
                <h2 className="gm-title gm-centred">Satsang Memories</h2>
                <div className="gm-gallery">
                  {data.photos.map((src, i) => (
                    <img key={`${src}-${i}`} src={src} alt={`Satsang memory ${i + 1}`} loading="lazy" />
                  ))}
                </div>
              </Stop>
            )}

            <div className="gm-stop gm-stop--petal skd-root gm-borrowed" data-gm-stop>
              <RoseBloom />
              <SkRsvpForm slug={data.invitationSlug} onShukrana={setPostedWish} />
            </div>
          </RosePath>

          <BouquetOffering
            photo={data.gurujiPhoto}
            slug={data.invitationSlug}
            demoCount={data.demo?.roseCount}
            reduceMotion={reduceMotion}
          />

          <div className="skd-root gm-borrowed gm-wall">
            <ShukranaWall slug={data.invitationSlug} demoWishes={data.demo?.wishes} posted={postedWish} />
          </div>

          <section className="gm-closing" aria-label="Closing">
            <p className="gm-closing-word">Shukrana</p>
            {data.privateNote ? (
              <p className="gm-private">
                <LockIcon />
                {data.privateNote}
              </p>
            ) : (
              <>
                <p className="gm-lead">Please share this with anyone in the sangat who would love to join.</p>
                <a
                  className="gm-btn"
                  href={`https://api.whatsapp.com/send?${new URLSearchParams({ text: shareText }).toString()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Invite the sangat on WhatsApp
                </a>
              </>
            )}
            <p className="gm-closing-family">{data.familyName}</p>
          </section>
        </main>
      )}
    </div>
  )
}
