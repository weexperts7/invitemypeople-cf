import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getGaneshLayoutComponent } from './ganesh/layoutRegistry'
import LegacyGaneshExperience from './ganesh/LegacyGaneshExperience'
import AudioToggle from './AudioToggle'
import { buildCreateLink } from '../utils/createLink'
import { getActivePrice } from '../data/sale'

const MUSIC_VOLUME = 0.7
// The standard track every Ganesh Chaturthi invitation opens with unless
// the host picks their own devotional bhajan/instrumental via the Song
// Search feature (see builder/SongSearchPicker.jsx +
// utils/buildGaneshExperienceTemplate.js) — mirrors DEFAULT_BG_MUSIC_URL in
// InvitationExperience.jsx for the wedding category. Ships silently (the
// <audio> element just has nothing to play) until a file is dropped in at
// this path — same "works without it, better with it" convention as
// GANESH_IDOL_PHOTO_SRC and every heroPhoto/moments entry in
// ganeshTemplatesData.js.
const DEFAULT_GANESH_MUSIC_URL = '/audio/ganesh-devotional-default.mp3'

// Dispatches a Ganesh Chaturthi template to its bespoke experience
// component (see ganesh/layoutRegistry.js) by the template's optional
// `layout` field, falling back to the shared legacy layout for templates
// that don't declare one. Mirrors SatsangExperience.jsx's role for the
// Satsang category.
//
// Also owns background-music playback for every Ganesh layout, in one
// place, the same way InvitationExperience.jsx owns it for weddings: an
// <audio> element gated on `isOpened`, which each layout's own interactive
// reveal (GaneshCurtainReveal's curtains, ModakBlessingBox's lid,
// TempleDoorReveal's doors) flips via the `onOpen` callback threaded down
// as a prop, or — for Royal Durbar Darshan, which has no tap-gated reveal —
// fired on mount instead.
//
// `showChrome` (default true) toggles the "All Invitations" back button and
// "Create Your Own" CTA — right for the free, directly-linkable demo pages
// (see GaneshRoute in App.jsx, the original/default caller), but wrong
// inside a phone-sized context that isn't that standalone page: the
// Invitation Builder's own live preview (LiveDraftPreviewPage.jsx) and a
// real guest's already-paid-for invite (GeneratedInvitePage.jsx) both pass
// `showChrome={false}` so neither shows a "back to home" nav nor a
// recursive "create your own" pitch inside what's meant to read as the
// finished page — same isPreview-gated split InvitationExperience.jsx uses
// for its own back button/CTA bar.
export default function GaneshExperience({ template, invitationSlug: slugOverride, showChrome = true }) {
  const navigate = useNavigate()

  // A real guest link always has its own stable slug — either the free
  // pre-built template's own (`ganesh-<template-slug>`, unchanged default
  // behavior) or a checkout-generated invite's real, persisted slug passed
  // in via this prop (see GeneratedInvitePage.jsx /
  // LiveDraftPreviewPage.jsx) — so RSVPs/Wishes Wall entries from different
  // buyers of the same style never land in one shared bucket. Mirrors
  // InvitationExperience.jsx's own `invitationSlug` prop.
  const invitationSlug = slugOverride || (template ? `ganesh-${template.slug}` : undefined)

  // Host-selected background music — see buildGaneshExperienceTemplate.js,
  // which is the only place a real `bgMusic` shape ever lands on a Ganesh
  // template object. null on every free pre-built template page, in which
  // case musicUrl falls back to DEFAULT_GANESH_MUSIC_URL.
  const bgMusic = template?.bgMusic ?? null
  const musicUrl = bgMusic?.previewUrl || DEFAULT_GANESH_MUSIC_URL
  const [isOpened, setIsOpened] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  // Passed to the active Layout as `onOpen` — fires the moment a guest
  // actually opens the invitation (curtain/box/doors finish, or on mount
  // for the one photo-hero template with no tap-gate), same "only start
  // once opened" behavior InvitationExperience.jsx's openEnvelope() gives
  // weddings.
  const handleOpen = useCallback(() => {
    setIsOpened(true)
    const audio = audioRef.current
    if (audio && !isMuted) {
      audio.volume = 0
      audio.play().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Same reload-on-song-change fix as InvitationExperience.jsx: a browser
  // only re-runs source selection on an explicit .load() call, so this
  // must fire whenever musicUrl changes (e.g. a host confirming a song
  // mid-preview) — and must NOT be gated on isOpened, since a host usually
  // picks their song before ever tapping the reveal open.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.load()
    if (!isOpened || isMuted) return
    audio.volume = 0
    audio.play().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicUrl])

  // Fades the clip in once opened, and handles pause/resume on mute toggle.
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

  if (!template) {
    return (
      <div className="min-h-svh w-full bg-linen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-2xl text-ink">This Ganesh Chaturthi invitation couldn&rsquo;t be found.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-ivory shadow-card"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    )
  }

  const Layout = getGaneshLayoutComponent(template.layout) ?? LegacyGaneshExperience

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} loop preload="auto">
        <source src={musicUrl} />
      </audio>

      {showChrome && (
        <motion.button
          type="button"
          onClick={() => navigate('/')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.96 }}
          className="fixed top-4 left-4 z-[70] flex items-center gap-2 rounded-full border border-white/60 bg-ivory/70 backdrop-blur-xl px-4 py-2 text-sm text-ink shadow-card"
        >
          <ArrowLeft className="w-4 h-4" />
          All Invitations
        </motion.button>
      )}

      {/* Same floating-corner pattern as InvitationExperience.jsx's own
          AudioToggle — bottom-LEFT here specifically, so it never overlaps
          the "Create Your Own" pill this dispatcher already floats at
          bottom-right. */}
      {isOpened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="fixed bottom-5 left-5 sm:bottom-7 sm:left-7 z-[70]"
        >
          <AudioToggle isMuted={isMuted} onToggle={() => setIsMuted((m) => !m)} />
        </motion.div>
      )}

      {/* Every Ganesh Chaturthi template lives at its own directly-linkable
          page (see GaneshRoute in App.jsx), same as wedding templates now do
          (see WeddingRoute) — a small floating pill (not a full-width bottom
          bar) so it never fights each bespoke layout's own footer/RSVP
          content for space — same floating-over-content pattern as the
          site-wide WhatsApp button (see LandingPage.jsx). Label/icon match
          InvitationExperience.jsx's own CTA — same "Create Your Own —
          price" copy site-wide rather than this occasion alone saying
          "Customize This Template". */}
      {showChrome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[70]"
        >
          <Link
            to={buildCreateLink({ occasion: 'ganesh-chaturthi', sourceId: template.slug })}
            className="flex items-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-soft"
          >
            <Heart className="w-4 h-4" />
            Create Your Own — &#8377;{getActivePrice().toLocaleString('en-IN')}
          </Link>
        </motion.div>
      )}

      <Layout template={template} invitationSlug={invitationSlug} onOpen={handleOpen} />
    </>
  )
}
