import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowLeft, Heart, Sparkles, Volume2, VolumeX } from 'lucide-react'
import EnvelopeLanding from './EnvelopeLanding'
import FallingPetals from './FallingPetals'
import WelcomeSplash from './WelcomeSplash'
import ScratchCardSection from './ScratchCardSection'
import PhotoGallery from './PhotoGallery'
import EventTimeline from './EventTimeline'
import RsvpForm from './RsvpForm'
import WishesWall from './WishesWall'
import CulturalMotif from './CulturalMotif'
import { FrameCorners } from './TemplateFrame'
import { PRICING } from '../data/templatesData'
import { coupleNameTier } from '../utils/coupleNameFit'
import { slugify } from '../utils/slugify'

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

export default function InvitationExperience({ template, onBack, isPreview = false, invitationSlug: slugOverride }) {
  // Every invitation is identified by a slug — by default one derived from
  // the couple's names (e.g. "Meenal & Avinash" -> "meenal-avinash"), which
  // is what every gallery preview still uses. A Builder-generated invite
  // (see GeneratedInvitePage.jsx) already has its own stable, persisted slug
  // and passes it in via `invitationSlug` instead, so its RSVPs/Wishes Wall
  // entries land under the same slug the invite itself was saved under.
  const invitationSlug = slugOverride || slugify(template?.couple?.names)
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

  // Fades the pad in once opened, and handles pause/resume whenever the
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
      {/* Drop a licensed track at public/audio/background-music.mp3 and it
          takes over automatically — no code change needed. Falls back to
          the synthesized placeholder pad if that file isn't present. */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/audio/background-music.mp3" type="audio/mpeg" />
        <source src="/audio/soothing-romantic.wav" type="audio/wav" />
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
              {isOpened && (
                <motion.button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-ivory/80 text-ink shadow-soft backdrop-blur-xl"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
              )}
              <motion.a
                href={`https://wa.me/919877647707?text=${encodeURIComponent(
                  `Hi! I'd like to buy the "${template?.name ?? 'Template'}" wedding invitation template for myself at the shagun price of ₹${PRICING.shagunPrice.toLocaleString('en-IN')}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-rose px-6 py-3.5 text-sm font-semibold text-ivory shadow-soft backdrop-blur-xl"
              >
                <Heart className="w-4 h-4" />
                Buy Now — &#8377;{PRICING.shagunPrice.toLocaleString('en-IN')}
              </motion.a>
            </div>
          </motion.div>
        </>
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
              coupleNames={template?.couple?.names}
            />
          ) : (
            <motion.main
              key="invitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`relative bg-petals ${isPreview ? 'pb-24' : ''}`}
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
