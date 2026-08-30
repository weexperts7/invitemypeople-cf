import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './RoyalPlumTemplate.css'
import type { RoyalPlumTemplateProps } from './types'
import { withRoyalPlumDefaults, buildWhatsAppShareLink } from './defaults'

import CurtainEnvelope from './components/CurtainEnvelope'
import ParticleHero from './components/ParticleHero'
import ScratchCard from './components/ScratchCard'
import CountdownTimer from './components/CountdownTimer'
import LoveHearts from './components/LoveHearts'

gsap.registerPlugin(ScrollTrigger)

// GSAP's ScrollTrigger watches `window` by default. That's correct when
// this template owns page-level scroll (its usual, standalone case) — but
// nothing here guarantees that: a host page is free to mount this
// component inside its own internally-scrolling container (e.g. a
// fixed-height "phone frame" card with its own `overflow-y: auto`, which
// is exactly what InvitationExperience.jsx's desktop preview wraps this in
// — see its own comment on why). If ScrollTrigger keeps watching `window`
// in that case, the window never actually scrolls, so every
// `[data-rpc-reveal]` section's fade-in never fires and stays invisible
// forever. This walks up from the given element to find the nearest
// ancestor that's actually the one scrolling, so ScrollTrigger watches
// whichever element real scroll events land on — `undefined` (ScrollTrigger's
// own default, `window`) when nothing but the page itself scrolls.
function findScrollParent(el: HTMLElement | null): HTMLElement | undefined {
  let node = el?.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node
    }
    node = node.parentElement
  }
  return undefined
}

function formatWeddingDateLabel(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

/**
 * RoyalPlumCurtainTemplate — a standalone, plug-and-play luxury Indian
 * wedding invite. Renders the full user flow: curtain-opening envelope →
 * particle-lit couple hero → scratch-to-reveal event cards → live countdown
 * → gratitude footer with WhatsApp share and floating hearts.
 *
 * Everything that touches GSAP is scoped with `useGSAP({ scope })`, so on
 * unmount every tween, ScrollTrigger instance, and ticker callback created
 * under this component's root is reverted automatically — nothing leaks
 * into, or fights with, animations owned by any other template mounted
 * elsewhere on the page.
 */
export default function RoyalPlumTemplate({ data, onOpen, reduceMotion }: RoyalPlumTemplateProps) {
  const resolved = withRoyalPlumDefaults(data)
  const { couple, parents, events, gratitudeMessage } = resolved
  const rootRef = useRef<HTMLDivElement>(null)
  const [curtainsOpened, setCurtainsOpened] = useState(false)

  const dateLabel = formatWeddingDateLabel(resolved.weddingDateISO)
  const whatsappHref = buildWhatsAppShareLink(resolved)

  // The hero is unconditionally mounted from the start — it sits in normal
  // document flow *underneath* CurtainEnvelope's fixed curtain panels, not
  // gated behind `curtainsOpened`. Left at its natural full opacity, it
  // would already be fully visible through the gap the instant the
  // curtains start parting, then jump back to hidden and re-fade once the
  // effect below runs (which only fires once `curtainsOpened` flips, i.e.
  // after the whole curtain timeline — sparkle burst included — has
  // already finished). Setting the hidden state here, once on mount,
  // means guests see the couple already dim/scaled-down through the
  // parting curtains, then watch it bloom to full brightness — one
  // continuous reveal instead of a flash-then-refade.
  useGSAP(
    () => {
      if (reduceMotion) return
      gsap.set('[data-rpc-hero-reveal]', { opacity: 0, scale: 0.95 })
    },
    { scope: rootRef, dependencies: [reduceMotion] }
  )

  useGSAP(
    () => {
      if (!curtainsOpened || reduceMotion) return

      // CurtainEnvelope's own timeline has already fully finished by the
      // time `curtainsOpened` flips (its onComplete is what sets it) — so
      // this is the couple's own small entrance beat right after, not a
      // scroll-triggered reveal like the sections below.
      gsap.to('[data-rpc-hero-reveal]', {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.15,
      })

      // See findScrollParent's own comment — whatever ancestor is actually
      // scrolling, not always `window`.
      const scroller = findScrollParent(rootRef.current)

      // Scroll-driven reveal for every section below the hero: fade + rise
      // into place, once, as it enters the viewport.
      const sections = gsap.utils.toArray<HTMLElement>('[data-rpc-reveal]')
      sections.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )
      })

      // Refresh so ScrollTrigger recalculates positions now that the
      // curtain overlay (which was covering the full viewport) is gone.
      ScrollTrigger.refresh()
    },
    { scope: rootRef, dependencies: [curtainsOpened, reduceMotion] }
  )

  const handleCurtainsOpened = () => {
    setCurtainsOpened(true)
    onOpen?.()
  }

  return (
    <div ref={rootRef} className="rpc-root">
      <CurtainEnvelope
        brideName={couple.brideName}
        groomName={couple.groomName}
        teaserLine={resolved.teaserLine}
        dateLabel={dateLabel}
        onOpened={handleCurtainsOpened}
      />

      <ParticleHero
        brideName={couple.brideName}
        groomName={couple.groomName}
        caricatureUrl={couple.caricatureUrl}
        caricatureAlt={couple.caricatureAlt}
        reduceMotion={reduceMotion}
      />

      <section className="rpc-events" data-rpc-reveal aria-label="Event details">
        <h3
          className="rpc-gold-text"
          style={{ fontFamily: 'var(--rpc-font-royal)', textAlign: 'center', fontSize: 20, letterSpacing: '0.08em', marginBottom: 6 }}
        >
          Wedding Events
        </h3>
        <p className="rpc-tracking" style={{ textAlign: 'center', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 36 }}>
          {parents.brideParents} &amp; {parents.groomParents}
        </p>

        {events.map((event) => (
          <div key={event.id} className="rpc-event-card" data-rpc-reveal>
            <span className="rpc-corner rpc-corner--tl" style={{ width: 20, height: 20, top: 8, left: 8 }} />
            <span className="rpc-corner rpc-corner--br" style={{ width: 20, height: 20, bottom: 8, right: 8 }} />

            <h4 style={{ fontFamily: 'var(--rpc-font-royal)', fontSize: 18, color: 'var(--rpc-champagne)', margin: '0 0 4px' }}>
              {event.name}
            </h4>
            <p style={{ fontSize: 12, color: 'var(--rpc-rose-gold)', margin: '0 0 2px' }}>{event.timing}</p>
            <p style={{ fontSize: 12, color: 'var(--rpc-rose-gold)', margin: 0 }}>{event.dateLabel}</p>

            <ScratchCard revealThreshold={0.35}>
              <p style={{ fontFamily: 'var(--rpc-font-royal)', fontSize: 14, color: 'var(--rpc-champagne)', margin: '0 0 6px' }}>
                {event.venue.name}
              </p>
              {event.venue.address && (
                <p style={{ fontSize: 12, color: 'var(--rpc-rose-gold)', margin: '0 0 10px' }}>{event.venue.address}</p>
              )}
              {event.specialNote && (
                <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--rpc-gold-1)', margin: '0 0 10px' }}>
                  {event.specialNote}
                </p>
              )}
              <a
                href={
                  event.venue.mapUrl ??
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [event.venue.name, event.venue.address].filter(Boolean).join(' ')
                  )}`
                }
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rpc-gold-1)' }}
              >
                Get Directions →
              </a>
            </ScratchCard>
          </div>
        ))}
      </section>

      <section style={{ padding: '20px 20px 0' }} data-rpc-reveal aria-label="Countdown to the wedding">
        <p className="rpc-tracking" style={{ textAlign: 'center', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 16 }}>
          Counting down to forever
        </p>
        <CountdownTimer targetISO={resolved.weddingDateISO} />
      </section>

      <footer className="rpc-footer" data-rpc-reveal>
        <p
          className="rpc-gold-text"
          style={{ fontFamily: 'var(--rpc-font-script)', fontSize: 30, marginBottom: 6 }}
        >
          With Gratitude
        </p>
        <p style={{ maxWidth: 420, margin: '0 auto 28px', fontSize: 13, lineHeight: 1.7, color: 'var(--rpc-champagne)' }}>
          {gratitudeMessage}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="rpc-btn rpc-btn--solid">
            Share on WhatsApp
          </a>

          <LoveHearts>
            <button type="button" className="rpc-btn" aria-label="Send love">
              Send Love ♥
            </button>
          </LoveHearts>
        </div>
      </footer>
    </div>
  )
}
