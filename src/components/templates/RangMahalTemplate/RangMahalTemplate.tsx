import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import './RangMahalTemplate.css'
import type { RangMahalFamily, RangMahalTemplateProps } from './types'
import { buildCalendarLink, buildWhatsAppShareLink, mapsUrlFor, withRangMahalDefaults } from './defaults'

import Gatefold from './components/Gatefold'
import DiyaDate from './components/DiyaDate'
import Countdown from './components/Countdown'
import SaatPhere from './components/SaatPhere'
import EventArt from './components/EventArt'
import RmRsvpForm from './components/RmRsvpForm'
import RmWishesWall from './components/RmWishesWall'
import { DiyaBowl, Flame, LotusRule } from './components/Motifs'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// Same level InvitationExperience.jsx plays the other templates' tracks at.
const MUSIC_VOLUME = 0.7
// Doors finish swinging at 0.3s delay + 1.7s; the page unlocks as they settle.
const OPENING_MS = 2000
const PETALS = Array.from({ length: 8 }, (_, i) => i)

function parseDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

// See VelvetTheatreTemplate.tsx's useStageHeight: inside the desktop
// preview's scrolling card the stage measures the card; on a phone CSS's
// 100svh applies and this stays null.
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

// A soft temple-bell strike, synthesised so there's no audio file to ship.
// Must run inside the pull's own gesture for mobile browsers to allow it.
function ringBell() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[
      [988, 0.16],
      [1976, 0.07],
      [3136, 0.03],
    ].forEach(([freq, level]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(level, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 1.6)
    })
    setTimeout(() => ctx.close(), 1800)
  } catch {
    // Purely decorative — a browser without Web Audio just opens silently.
  }
}

/**
 * RangMahalTemplate — a Rajasthani block-printed wedding invite. Guests pull
 * a silk latkan to swing open a gatefold card onto a marigold-hung blessing,
 * then light diyas to reveal the date, walk the Saat Phere around the sacred
 * fire, and read each ceremony as its own miniature print. Self-contained
 * (own types, defaults, scoped `.rmt-root` styles and fonts), wired into the
 * catalog through components/wedding/rang-mahal/RangMahalAdapter.jsx.
 */
export default function RangMahalTemplate({ data, onOpen }: RangMahalTemplateProps) {
  const resolved = withRangMahalDefaults(data)
  const { couple, events, families, photos } = resolved
  const rootRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const stageHeight = useStageHeight(rootRef)

  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')
  const [muted, setMuted] = useState(false)
  const [copied, setCopied] = useState(false)

  const date = parseDate(resolved.weddingDateISO)
  const dateLine = date
    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const names = [couple.firstName, couple.secondName].filter(Boolean).join(' & ')
  const listedFamilies = families.filter((f) => f.name || f.photo)

  const handleOpen = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('opening')
    ringBell()
    const audio = audioRef.current
    if (audio) {
      audio.volume = MUSIC_VOLUME
      audio.play().catch(() => {})
    }
  }, [phase])

  // Held in a ref so a parent re-render mid-swing doesn't restart the timer.
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (phase !== 'opening') return
    const t = setTimeout(() => {
      setPhase('open')
      onOpenRef.current?.()
    }, reduceMotion ? 0 : OPENING_MS)
    return () => clearTimeout(t)
  }, [phase, reduceMotion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || phase === 'closed') return
    if (muted) audio.pause()
    else audio.play().catch(() => {})
  }, [muted, phase])

  // Fade-and-rise each section in. No threshold: several sections are taller
  // than a phone screen, so any fraction of them could never become visible.
  // Marked with an attribute rather than a class: a section whose className
  // React re-renders (DiyaDate's glow) would otherwise lose it and go blank.
  useEffect(() => {
    if (phase !== 'open') return
    const root = rootRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('[data-rmt-reveal]')
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.setAttribute('data-rmt-in', ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-rmt-in', '')
            io.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [phase, reduceMotion])

  const copyHashtag = () => {
    navigator.clipboard?.writeText(resolved.hashtag).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      },
      () => {}
    )
  }

  // The overlays stick to the viewport: `fixed` on a phone, but `sticky`
  // inside the desktop preview's card, where its transform traps `fixed` —
  // see the same split in VelvetTheatreTemplate.tsx.
  const pinned = stageHeight === null ? ' rmt-pinned--fixed' : ''

  return (
    <div ref={rootRef} className="rmt-root">
      {resolved.musicUrl && <audio ref={audioRef} src={resolved.musicUrl} loop preload="auto" />}

      {phase === 'open' && !reduceMotion && (
        <div className={`rmt-pinned${pinned}`} aria-hidden="true">
          <div className="rmt-petals" style={stageHeight ? { height: stageHeight } : undefined}>
            {PETALS.map((i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      )}

      {resolved.musicUrl && phase !== 'closed' && (
        <div className={`rmt-pinned${pinned}`}>
          <button
            type="button"
            className="rmt-sound"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Play music' : 'Mute music'}
            aria-pressed={!muted}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5Z" />
              {muted ? <path d="m22 9-6 6M16 9l6 6" /> : <path d="M15.5 8.500a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
            </svg>
          </button>
        </div>
      )}

      <Gatefold
        phase={phase}
        onOpen={handleOpen}
        firstName={couple.firstName}
        secondName={couple.secondName}
        greetingLine={resolved.greetingLine}
        dateLine={dateLine}
        height={stageHeight}
        reduceMotion={reduceMotion}
      />

      {phase === 'open' && (
        <main className="rmt-acts">
          <section className="rmt-section" data-rmt-reveal aria-label="The couple">
            <p className="rmt-kicker">Together with our families</p>
            <p className="rmt-body rmt-lead">{resolved.invitationLine}</p>

            <div className="rmt-couple">
              {(listedFamilies.length ? listedFamilies : [{ name: couple.firstName, parents: '' }, { name: couple.secondName, parents: '' }] as RangMahalFamily[])
                .filter((f) => f.name || f.photo)
                .map((f, i) => (
                  <div key={`${f.name}-${i}`} className="rmt-person">
                    {i > 0 && <span className="rmt-person-amp">&amp;</span>}
                    {f.photo ? (
                      <div className="rmt-arch rmt-arch--photo">
                        <img src={f.photo} alt={f.name || names} loading="lazy" />
                      </div>
                    ) : (
                      <div className="rmt-arch">
                        <span>{f.name.trim().charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    {f.name && <p className="rmt-person-name">{f.name}</p>}
                    {f.parents && <p className="rmt-body">{f.parents}</p>}
                  </div>
                ))}
            </div>
          </section>

          {date && (
            <DiyaDate
              day={String(date.getDate()).padStart(2, '0')}
              month={MONTHS_SHORT[date.getMonth()]}
              year={String(date.getFullYear())}
            />
          )}

          <Countdown targetISO={resolved.weddingDateISO} />

          <section className="rmt-section rmt-section--leheriya" data-rmt-reveal aria-label="Celebrations">
            <p className="rmt-kicker">Wedding festivities</p>
            <h2 className="rmt-title">The Celebrations</h2>

            <div className="rmt-events">
              {events.map((event) => {
                const calendar = buildCalendarLink(event)
                return (
                  <article key={event.id} className="rmt-event">
                    {event.venue.photo ? (
                      <img className="rmt-event-art rmt-event-photo" src={event.venue.photo} alt={event.venue.name} loading="lazy" />
                    ) : (
                      <EventArt title={event.name} />
                    )}
                    <div className="rmt-event-body">
                      <h3>{event.name}</h3>
                      <p className="rmt-event-when">
                        {event.dateLabel}
                        {event.timing && <> · {event.timing}</>}
                      </p>
                      {event.venue.name && <p className="rmt-event-venue">{event.venue.name}</p>}
                      {event.venue.address && <p className="rmt-event-address">{event.venue.address}</p>}
                      <div className="rmt-event-actions">
                        {event.venue.name && (
                          <a className="rmt-chip" href={mapsUrlFor(event.venue)} target="_blank" rel="noreferrer">
                            View location
                          </a>
                        )}
                        {calendar && (
                          <a className="rmt-chip" href={calendar} target="_blank" rel="noreferrer">
                            Add to calendar
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <SaatPhere />

          {photos.length > 0 && (
            <section className="rmt-section" data-rmt-reveal aria-label="Gallery">
              <p className="rmt-kicker">Our moments</p>
              <h2 className="rmt-title">Two Hearts</h2>
              <div className={`rmt-gallery${photos.length === 1 ? ' rmt-gallery--single' : ''}`}>
                {photos.map((src, i) => (
                  <figure key={`${src}-${i}`} className="rmt-photo">
                    <img src={src} alt={`${names} — moment ${i + 1}`} loading="lazy" />
                  </figure>
                ))}
              </div>
              {photos.length > 1 && <p className="rmt-note">Swipe to see more</p>}
            </section>
          )}

          <RmRsvpForm slug={resolved.invitationSlug} endpoint={resolved.rsvpEndpoint} />

          <RmWishesWall slug={resolved.invitationSlug} />

          <section className="rmt-section" data-rmt-reveal aria-label="Share">
            <p className="rmt-kicker">Our wedding hashtag</p>
            <button type="button" className="rmt-hashtag" onClick={copyHashtag}>
              {resolved.hashtag}
            </button>
            <p className="rmt-note">{copied ? 'Copied!' : 'Tap to copy, and tag your photos'}</p>
            <a className="rmt-btn" href={buildWhatsAppShareLink(resolved)} target="_blank" rel="noreferrer">
              Share on WhatsApp
            </a>
          </section>

          <footer className="rmt-closing">
            <LotusRule className="rmt-rule" />
            <p className="rmt-closing-names">{names}</p>
            <p className="rmt-body">{resolved.thankYouMessage}</p>
            {dateLine && <p className="rmt-closing-date">{dateLine}</p>}
            <div className="rmt-closing-diya" aria-hidden="true">
              <Flame className="rmt-closing-flame" />
              <DiyaBowl className="rmt-closing-bowl" />
            </div>
          </footer>
        </main>
      )}
    </div>
  )
}
