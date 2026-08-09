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
import { getActivePrice } from '../data/sale'
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
const DEFAULT_BG_MUSIC_URL = '/audio/soothing-romantic.wav'

export default function InvitationExperience({ template, onBack, isPreview = false, invitationSlug: slugOverride }) {
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
          (see utils/itunesPreview.js) for everything else, vs. WAV for the
          default — a hardcoded type would be wrong for at least one of
          those, so the browser sniffs the actual format instead. */}
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
            className="fixed top-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-sm text-ink shadow-card"
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
                  // The preview overlay (see App.jsx) renders outside the
                  // <Routes> tree while previewId is set — a plain Link
                  // changes the URL but leaves this overlay mounted on top
                  // of it, so the route change is invisible. Clearing the
                  // preview first (same as "Back to Templates" does via
                  // onBack) lets the new route actually show through.
                  onClick={onBack}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-rose px-6 py-3.5 text-sm font-semibold text-ivory shadow-soft backdrop-blur-xl"
                >
                  <Heart className="w-4 h-4" />
                  Create Your Own — &#8377;{getActivePrice().toLocaleString('en-IN')}
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
              <RsvpForm palette={template?.palette} slug={invitationSlug} />
              <WishesWall slug={invitationSlug} />
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
