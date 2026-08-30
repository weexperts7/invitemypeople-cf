import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import EnvelopeLanding from './EnvelopeLanding'
import FallingPetals from './FallingPetals'
import WelcomeSplash from './WelcomeSplash'
import ScratchCardSection from './ScratchCardSection'
import PhotoGallery from './PhotoGallery'
import EventTimeline from './EventTimeline'
import RsvpForm from './RsvpForm'
import WishesWall from './WishesWall'
import CulturalMotif from './CulturalMotif'
import AudioToggle from './AudioToggle'
import { FrameCorners } from './TemplateFrame'
import { getWeddingLayoutComponent } from './wedding/layoutRegistry'
import { getActivePrice } from '../data/sale'
import { findBuilderTemplateBySource } from '../data/builderTemplates'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'
import { coupleNameTier } from '../utils/coupleNameFit'
import { slugify } from '../utils/slugify'
import { buildCreateLink } from '../utils/createLink'

const FOOTER_NAME_SIZES = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg']

// Maps a template's palette and typography (see src/data/templatesData.js)
// onto the same CSS custom properties src/index.css declares in @theme.
// Every Tailwind color/font utility in this tree (bg-ivory, text-rose,
// border-gold-soft, font-serif, ...) resolves to var(--color-*) / var(--font-*),
// so overriding these on the wrapper re-skins the entire existing invitation
// — palette, motifs, and heading typeface alike — without touching any child
// component's markup.
function themeToCssVars(template) {
  if (!template) return undefined
  const { palette, fonts } = template
  return {
    ...(palette && {
      '--color-ivory': palette.ivory,
      '--color-linen': palette.linen,
      '--color-champagne': palette.champagne,
      '--color-champagne-deep': palette.champagneDeep,
      '--color-blush': palette.blush,
      '--color-blush-deep': palette.blushDeep,
      '--color-rose': palette.rose,
      '--color-gold': palette.gold,
      '--color-gold-soft': palette.goldSoft,
      '--color-ink': palette.ink,
      '--color-ink-soft': palette.inkSoft,
    }),
    ...(fonts?.serif && { '--font-serif': fonts.serif }),
    ...(fonts?.script && { '--font-script': fonts.script }),
  }
}

const MUSIC_VOLUME = 0.7
// The standard track every invitation opens with unless the host picks
// their own (see builder/SongSearchPicker.jsx) — a guest should always
// hear *something* when the envelope opens, not silence by default.
const DEFAULT_BG_MUSIC_URL = '/audio/default-background-music.mp3'

export default function InvitationExperience({
  template,
  onBack,
  isPreview = false,
  invitationSlug: slugOverride,
  // False only for callers with nowhere for an RSVP to land at all (e.g. a
  // draft/demo preview with no persisted invite row). Every real invite —
  // consumer or partner — collects guest RSVPs; what differs is *where*
  // (see rsvpEndpoint/wishesEndpoint below).
  showRsvp = true,
  // Optional overrides — the B2B Partner Portal's white-label /p/:slug
  // viewer (see PartnerInviteViewerPage.jsx) passes '/api/partners/rsvps'
  // and '/api/partners/wishes' so guest RSVPs on a partner-created invite
  // land in that table's own `partner_rsvps`, never the consumer
  // `rsvps` table (partner invites live entirely in their own
  // partner_invites/partner_rsvps tables — see B2B-PARTNER-PORTAL-SETUP.md).
  // Every other caller (GeneratedInvitePage.jsx, every pre-built template
  // route, LiveDraftPreviewPage.jsx) omits these and keeps RsvpForm.jsx/
  // WishesWall.jsx's own '/api/rsvps' / '/api/wishes' defaults.
  rsvpEndpoint,
  wishesEndpoint,
}) {
  // Every invitation is identified by a slug — by default one derived from
  // the couple's names (e.g. "Meenal & Avinash" -> "meenal-avinash"), which
  // is what every gallery preview still uses. A Builder-generated invite
  // (see GeneratedInvitePage.jsx) already has its own stable, persisted slug
  // and passes it in via `invitationSlug` instead, so its RSVPs/Wishes Wall
  // entries land under the same slug the invite itself was saved under.
  const invitationSlug = slugOverride || slugify(template?.couple?.names)
  // Punjabi Phulkari's royal maroon palette needs its own ambient background
  // wash — .bg-petals lightens toward cream, which reads as a washed-out
  // fog and hurts text contrast over a dark palette (see .bg-petals-royal
  // in index.css). Every other template keeps using .bg-petals unchanged.
  const isPhulkari = template?.motif === 'phulkari'
  // Super Admin Template Price Management — the "Create Your Own" CTA
  // below shows THIS template's real price, not a global one. template.id
  // is the TEMPLATES catalog id (e.g. "rajasthani-royal"), not the
  // builder/pricing key — see findBuilderTemplateBySource()'s own comment.
  const builderTemplate = findBuilderTemplateBySource('wedding', template?.id)
  const priceOverrides = useTemplatePriceOverrides()
  const ctaPrice = (builderTemplate && priceOverrides[builderTemplate.id]) ?? getActivePrice()
  // Host-selected background music — see builder/SongSearchPicker.jsx
  // (search + preview) and buildWeddingExperienceTemplate.js (where a real
  // invite's confirmed Spotify/iTunes track becomes this `bgMusic` shape).
  // null whenever the host skipped that step, in which case musicUrl below
  // falls back to DEFAULT_BG_MUSIC_URL — every invitation plays *something*
  // once opened, the host's own pick if they made one.
  const bgMusic = template?.bgMusic ?? null
  const musicUrl = bgMusic?.previewUrl || DEFAULT_BG_MUSIC_URL
  const [isOpened, setIsOpened] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  })

  // Fires from the envelope-open click, so play() still runs inside the
  // user-gesture call stack (required for audio to start with sound in
  // Safari/iOS, not just Chrome).
  function openEnvelope() {
    setIsOpened(true)
    const audio = audioRef.current
    if (audio && !isMuted) {
      audio.volume = 0
      audio.play().catch(() => {})
    }
  }

  // A real guest's `template` never changes after mount, so this is a
  // no-op for them — but the Invitation Builder's live preview (see
  // LiveDraftPreviewPage.jsx) re-renders this same mounted component as
  // the buyer confirms/changes their song (see SongSearchPicker.jsx),
  // updating the <audio> element's <source> without remounting it. A
  // browser only re-runs its source-selection algorithm on an explicit
  // .load() call; without this, it silently keeps playing whichever track
  // it originally locked onto, ignoring every subsequent song change.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isOpened) return
    audio.load()
    if (!isMuted) {
      audio.volume = 0
      audio.play().catch(() => {})
    }
    // Deliberately keyed on musicUrl alone — isOpened/isMuted are read here
    // but must NOT be dependencies, or this would also re-fire (and
    // reload/restart the track from 0:00) on every mute toggle, which the
    // effect below already handles via pause()/play() without a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicUrl])

  // Fades the clip in once opened, and handles pause/resume whenever the
  // mute button is toggled after that.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isOpened) return
    if (isMuted) {
      audio.pause()
      return
    }
    if (audio.paused) audio.play().catch(() => {})
    let raf
    const step = () => {
      if (audio.volume < MUSIC_VOLUME) {
        audio.volume = Math.min(MUSIC_VOLUME, audio.volume + 0.02)
        raf = requestAnimationFrame(step)
      }
    }
    step()
    return () => cancelAnimationFrame(raf)
  }, [isOpened, isMuted])

  // Bespoke per-template layouts — opt-in via `layout` on the TEMPLATES
  // entry (see templatesData.js's comment block), mirroring the same
  // `layout`/registry mechanism GaneshExperience.jsx and
  // SatsangExperience.jsx already use for their own categories (see
  // wedding/layoutRegistry.js). No existing wedding template sets `layout`,
  // so this is a no-op for all of them — only an opted-in template
  // short-circuits past everything below (envelope/hero/RSVP/audio/scroll
  // progress), since a bespoke layout owns its whole page the same way a
  // Ganesh/Satsang bespoke layout does. Reuses this component's own
  // isPreview back-button/CTA chrome (same ctaPrice/invitationSlug/onBack
  // already computed above) so a bespoke template still gets the "Create
  // Your Own" conversion bar in the catalog preview — but skips the
  // <audio>/AudioToggle/scroll-progress bar entirely, since a bespoke
  // layout doesn't plug into this component's background-music system.
  const Layout = getWeddingLayoutComponent(template?.layout)
  if (Layout) {
    return (
      <div
        className="min-h-svh w-full bg-linen flex justify-center sm:py-8"
        style={themeToCssVars(template)}
      >
        {/* The same "phone" card shell every other template renders inside
            (see the legacy return below) — width-capped, rounded and
            bordered only from `sm:` up, so a phone-width viewport is
            unaffected (full-bleed, same as before) and a desktop preview
            reads as "this is what a phone screen shows" instead of a
            bespoke layout stretching edge-to-edge across a wide browser
            window like every other template doesn't.

            Two things here are load-bearing, not decorative, both existing
            only to correctly contain RoyalPlumTemplate's `position:fixed`
            curtain panels/seal cover:
            - `sm:[transform:translateZ(0)]` gives this card a CSS
              "containing block" for `position:fixed` descendants, so they
              clip to the rounded card instead of covering the full
              browser viewport the way `position:fixed` normally does.
            - `sm:h-svh sm:overflow-y-auto` (replacing `min-h-svh` +
              page-level scroll at that breakpoint) caps the card at
              exactly one screen tall with its OWN internal scrollbar. This
              is what actually makes a real phone's fixed-height screen —
              without it, the card's height would equal its full,
              much-taller-than-one-screen scrollable content, and the
              `position:fixed; inset:0` cover's flex-centered content
              would center itself against *that* full height, landing
              scrolled hundreds of pixels below the visible fold instead
              of centered on screen.
            Below `sm:`, neither applies — mobile keeps true viewport-fixed
            curtains and page-level scroll, unchanged from before this
            wrapper existed. */}
        <div className="relative w-full max-w-md min-h-svh overflow-hidden sm:h-svh sm:overflow-y-auto sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40 sm:[transform:translateZ(0)]">
          <Layout template={template} invitationSlug={invitationSlug} onOpen={openEnvelope} />
        </div>

        {isPreview && (
          <>
            <motion.button
              type="button"
              onClick={onBack}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.96 }}
              className="fixed top-4 left-4 z-[70] hidden items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-sm text-ink shadow-card sm:flex"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </motion.button>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-ink/20 via-ink/5 to-transparent"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full max-w-md"
              >
                <Link
                  to={buildCreateLink({ occasion: 'wedding', sourceId: template?.id })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-rose px-6 py-3.5 text-sm font-semibold text-ivory shadow-soft backdrop-blur-xl"
                >
                  <Heart className="w-4 h-4" />
                  Create Your Own — &#8377;{ctaPrice.toLocaleString('en-IN')}
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className="min-h-svh w-full bg-linen flex justify-center sm:py-8"
      style={themeToCssVars(template)}
    >
      {/* Always rendered: musicUrl is the host's own pick when they made
          one (see SongSearchPicker.jsx), DEFAULT_BG_MUSIC_URL otherwise —
          every invitation plays something once opened, never silence by
          default. `loop`: a host's confirmed track is a fixed ~30s preview
          clip, and guests routinely stay on the page well past that (the
          default track is a full-length loop already). No `type` on the
          <source>: a host's previewUrl is an MP3 on the rare track Spotify
          itself still serves one for, but M4A/AAC from the iTunes fallback
          (see utils/itunesPreview.js) for everything else — a hardcoded
          type would be wrong for one of those, so the browser sniffs the
          actual format instead. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} loop preload="auto">
        <source src={musicUrl} />
      </audio>

      {isOpened && <FallingPetals palette={template?.palette} />}

      {isOpened && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60]"
          style={{
            scaleX: progress,
            background:
              'linear-gradient(90deg, var(--color-champagne-deep) 0%, var(--color-gold) 50%, var(--color-rose) 100%)',
          }}
        />
      )}

      {isPreview && (
        <>
          <motion.button
            type="button"
            onClick={onBack}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            className="fixed top-4 left-4 z-[70] hidden items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-sm text-ink shadow-card sm:flex"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </motion.button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-[70] flex items-center gap-1.5 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-soft shadow-card"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            {template?.name} · Live Preview
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-ink/20 via-ink/5 to-transparent"
          >
            <div className="flex w-full max-w-md items-center gap-3">
              {isOpened && <AudioToggle isMuted={isMuted} onToggle={() => setIsMuted((m) => !m)} />}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-1"
              >
                <Link
                  to={buildCreateLink({ occasion: 'wedding', sourceId: template?.id })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-rose px-6 py-3.5 text-sm font-semibold text-ivory shadow-soft backdrop-blur-xl"
                >
                  <Heart className="w-4 h-4" />
                  Create Your Own — &#8377;{ctaPrice.toLocaleString('en-IN')}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}

      {/* The preview overlay above already gets a mute control (paired
          with its "Create Your Own" CTA bar). This floating corner widget
          gives a real, live invitation — what a guest actually opens from
          a shared link — the same control once the envelope's opened,
          without disturbing the preview overlay's own layout. Every
          invitation has *some* track playing by now (see musicUrl above),
          so this is gated on isOpened alone, not on whether the host
          picked their own song. */}
      {!isPreview && isOpened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="fixed bottom-5 right-5 z-40"
        >
          <AudioToggle isMuted={isMuted} onToggle={() => setIsMuted((m) => !m)} />
        </motion.div>
      )}

      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <CulturalMotif
          motif={template?.motif}
          palette={template?.palette}
          accent={template?.motifAccent}
        />
        <FrameCorners
          motif={template?.motif}
          palette={template?.palette}
          accent={template?.motifAccent}
          className="z-10"
        />
        <AnimatePresence mode="wait">
          {!isOpened ? (
            <EnvelopeLanding
              key="envelope"
              onOpen={openEnvelope}
              motif={template?.motif}
              palette={template?.palette}
              motifAccent={template?.motifAccent}
              coupleNames={template?.couple?.names}
            />
          ) : (
            <motion.main
              key="invitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`relative ${isPhulkari ? 'bg-petals-royal' : 'bg-petals'} ${isPreview ? 'pb-24' : ''}`}
            >
              <WelcomeSplash
                greeting={template?.greeting}
                motif={template?.motif}
                palette={template?.palette}
                motifAccent={template?.motifAccent}
                couple={template?.couple}
                heroPhoto={template?.heroPhoto}
              />
              <ScratchCardSection palette={template?.palette} date={template?.weddingDate} />
              <EventTimeline
                events={template?.ceremonies}
                weddingDate={template?.weddingDate}
                heading={template?.ceremoniesHeading}
              />
              <PhotoGallery culture={template?.weddingType} photos={template?.photos} />
              {showRsvp && (
                <>
                  <RsvpForm palette={template?.palette} slug={invitationSlug} endpoint={rsvpEndpoint} />
                  <WishesWall slug={invitationSlug} endpoint={wishesEndpoint} />
                </>
              )}
              <motion.footer
                className="py-12 text-center text-sm text-ink-soft"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <motion.p
                  className={`font-script ${FOOTER_NAME_SIZES[coupleNameTier(template?.couple?.names ?? 'Aarav & Diya')]} text-gold mb-1 whitespace-nowrap`}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {template?.couple?.names ?? 'Aarav & Diya'}
                </motion.p>
                <p>With love &amp; gratitude</p>
              </motion.footer>
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
