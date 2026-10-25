import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import './VelvetTheatreTemplate.css'
import type { VelvetTheatreTemplateProps } from './types'
import { buildWhatsAppShareLink, mapsUrlFor, withVelvetTheatreDefaults } from './defaults'

import TheatreStage from './components/TheatreStage'
import ScratchCoins from './components/ScratchCoins'
import Countdown from './components/Countdown'
import VtRsvpForm from './components/VtRsvpForm'
import VtWishesWall from './components/VtWishesWall'
import { Flourish, PalaceFacade } from './components/LineArt'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
// Same level InvitationExperience.jsx plays the other templates' tracks at.
const MUSIC_VOLUME = 0.7
// Matches TheatreStage's curtain sweep, so the rest of the page (and the
// host's onOpen) arrive as the drapes settle rather than mid-swing.
const CURTAIN_MS = 2100

function parseDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d
}

// InvitationExperience.jsx renders bespoke layouts inside a fixed-height,
// internally-scrolling "phone" card on desktop (see its own comment). There
// `100svh` is taller than the card, so the stage measures the card instead;
// on a real phone nothing but the page scrolls and CSS's 100svh applies.
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

/**
 * VelvetTheatreTemplate — a modern theatre-stage wedding invite. A closed
 * red velvet curtain rises on tap into tied-back drapes framing the couple's
 * names, followed by scratch-off gold date coins, a countdown, the event
 * programme as theatre tickets, families, a framed gallery, RSVP, wishes and
 * a scalloped thank-you card. Self-contained (own types, defaults, scoped
 * `.vtt-root` styles and fonts), wired into the catalog through
 * components/wedding/velvet-theatre/VelvetTheatreAdapter.jsx.
 */
export default function VelvetTheatreTemplate({ data, onOpen }: VelvetTheatreTemplateProps) {
  const resolved = withVelvetTheatreDefaults(data)
  const { couple, events, families, photos } = resolved
  const rootRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const reduceMotion = Boolean(useReducedMotion())
  const stageHeight = useStageHeight(rootRef)

  const [phase, setPhase] = useState<'closed' | 'opening' | 'open'>('closed')
  const [muted, setMuted] = useState(false)

  const date = parseDate(resolved.weddingDateISO)
  const dateLine = date
    ? date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  const names = [couple.firstName, couple.secondName].filter(Boolean).join(' & ')

  const handleTap = useCallback(() => {
    if (phase !== 'closed') return
    setPhase('opening')
    // Must start inside the tap's own handler — mobile browsers only allow
    // audio playback from a user gesture.
    const audio = audioRef.current
    if (audio) {
      audio.volume = MUSIC_VOLUME
      audio.play().catch(() => {})
    }
  }, [phase])

  // Held in a ref so a parent re-render (new onOpen identity) mid-sweep
  // doesn't restart the timer below.
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (phase !== 'opening') return
    const t = setTimeout(() => {
      setPhase('open')
      onOpenRef.current?.()
    }, reduceMotion ? 0 : CURTAIN_MS)
    return () => clearTimeout(t)
  }, [phase, reduceMotion])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || phase === 'closed') return
    if (muted) audio.pause()
    else audio.play().catch(() => {})
  }, [muted, phase])

  // Fade-and-rise each section in as it scrolls into view. IntersectionObserver
  // accounts for clipping by scrolling ancestors, so this works both at page
  // level and inside the desktop preview's scrolling card.
  useEffect(() => {
    if (phase !== 'open') return
    const root = rootRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('[data-vtt-reveal]')
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('vtt-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('vtt-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [phase, reduceMotion])

  return (
    <div ref={rootRef} className="vtt-root">
      {resolved.musicUrl && <audio ref={audioRef} src={resolved.musicUrl} loop preload="auto" />}

      {resolved.musicUrl && phase !== 'closed' && (
        // Top-right, clear of the catalog preview's bottom "Create Your Own"
        // bar and phones' bottom browser chrome. On a phone the page itself
        // scrolls, but InvitationExperience's wrapper is overflow:hidden,
        // which defeats `sticky` — so the button is plain `fixed` there.
        // Inside the desktop preview's scrolling card (stageHeight measured)
        // `fixed` would be trapped by the card's transform, while `sticky`
        // against the card works.
        <div className={`vtt-dock${stageHeight === null ? ' vtt-dock--fixed' : ''}`}>
          <button
            type="button"
            className="vtt-sound"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Play music' : 'Mute music'}
            aria-pressed={!muted}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="m22 9-6 6M16 9l6 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
              </svg>
            )}
          </button>
        </div>
      )}

      <TheatreStage
        phase={phase}
        onTap={handleTap}
        firstName={couple.firstName}
        secondName={couple.secondName}
        greetingLine={resolved.greetingLine}
        invitationLine={resolved.invitationLine}
        dateLine={dateLine}
        height={stageHeight}
        reduceMotion={reduceMotion}
      />

      {phase === 'open' && (
        <main className="vtt-acts">
          {date && (
            <ScratchCoins
              day={String(date.getDate()).padStart(2, '0')}
              month={MONTHS_SHORT[date.getMonth()]}
              year={String(date.getFullYear())}
            />
          )}

          <Countdown targetISO={resolved.weddingDateISO} />

          <section className="vtt-section" data-vtt-reveal aria-label="Programme">
            <p className="vtt-kicker">The celebration will take place at</p>
            <PalaceFacade className="vtt-art vtt-art--wide" />
            <h2 className="vtt-serif-title">The Programme</h2>

            <div className="vtt-tickets">
              {events.map((event, i) => (
                <article key={event.id} className="vtt-ticket">
                  <div className="vtt-ticket-stub" aria-hidden="true">
                    <span>Admit</span>
                    <strong>{String(i + 1).padStart(2, '0')}</strong>
                  </div>
                  <div className="vtt-ticket-body">
                    <h3>{event.name}</h3>
                    <p className="vtt-ticket-when">
                      {event.dateLabel}
                      {event.timing && <> · {event.timing}</>}
                    </p>
                    {event.venue.name && <p className="vtt-ticket-venue">{event.venue.name}</p>}
                    {event.venue.address && <p className="vtt-ticket-address">{event.venue.address}</p>}
                    {event.venue.name && (
                      <a className="vtt-link" href={mapsUrlFor(event.venue)} target="_blank" rel="noreferrer">
                        Get directions →
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {families.some((f) => f.name) && (
            <section className="vtt-section vtt-section--tint" data-vtt-reveal aria-label="Families">
              <p className="vtt-kicker">Together with their families</p>
              <div className="vtt-families">
                {families
                  .filter((f) => f.name)
                  .map((f, i) => (
                    <div key={f.name} className="vtt-family">
                      {i > 0 && <Flourish className="vtt-flourish" />}
                      <p className="vtt-family-name">{f.name}</p>
                      {f.parents && <p className="vtt-body">{f.parents}</p>}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className="vtt-section" data-vtt-reveal aria-label="Gallery">
              <h2 className="vtt-script-title">Our Moments</h2>
              <div className={`vtt-gallery${photos.length === 1 ? ' vtt-gallery--single' : ''}`}>
                {photos.map((src, i) => (
                  <figure key={`${src}-${i}`} className="vtt-frame">
                    <img src={src} alt={`${names} — moment ${i + 1}`} loading="lazy" />
                  </figure>
                ))}
              </div>
              {photos.length > 1 && <p className="vtt-muted">Swipe to see more</p>}
            </section>
          )}

          <VtRsvpForm slug={resolved.invitationSlug} endpoint={resolved.rsvpEndpoint} />

          <VtWishesWall slug={resolved.invitationSlug} />

          <section className="vtt-section" data-vtt-reveal aria-label="Thank you">
            <div className="vtt-thanks">
              <div className="vtt-thanks-inner">
                <h2 className="vtt-script-title">Thank You</h2>
                <p className="vtt-body">{resolved.thankYouMessage}</p>
                <p className="vtt-thanks-names">{names}</p>
              </div>
            </div>
            <a className="vtt-btn vtt-btn--solid" href={buildWhatsAppShareLink(resolved)} target="_blank" rel="noreferrer">
              Share on WhatsApp
            </a>
          </section>

          <footer className="vtt-footer" aria-hidden="true">
            <span>Fin</span>
          </footer>
        </main>
      )}
    </div>
  )
}
