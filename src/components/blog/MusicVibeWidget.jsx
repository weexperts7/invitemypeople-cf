// Embedded, in-article mockup of the Background Music Selection step (see
// ../builder/SongSearchPicker.jsx for the real thing on /create) — used by
// the "Set the Vibe" blog post (see ../../data/blogPosts.js) so a reader
// can feel the search → preview → apply flow without leaving the article.
//
// Everything here is illustrative, not wired to Spotify: the three tracks
// are fixed demo data, and the "search" above them is a decorative
// typewriter loop rather than a real filter, since the point is to show
// the *shape* of the interaction, not stand up a second live search inside
// a blog post. The "Preview 30s" buttons, though, are genuinely
// functional — they play a real clip through a shared <audio> element with
// a real elapsed-time progress ring, capped at 30s, so a reader's very
// first tap already feels like the actual builder step.
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Music2, Pause, Play, Search, Sparkles } from 'lucide-react'

const DEMO_TRACKS = [
  { id: 'kudmayi', title: 'Kudmayi', artist: 'Sangeet Mix · Wedding Anthem', tag: 'Sangeet', hue: 'from-rose to-blush-deep' },
  { id: 'nachde', title: 'Nachde Ne Saare', artist: 'Baraat Favourite', tag: 'Baraat', hue: 'from-gold to-gold-soft' },
  { id: 'omjai', title: 'Om Jai Jagdish Hare', artist: 'Traditional Aarti', tag: 'Guruji Satsang', hue: 'from-champagne-deep to-gold-soft' },
]

const DEMO_QUERIES = DEMO_TRACKS.map((t) => t.title)
// Reuses the same clip every invitation already falls back to when a host
// skips picking a song (see InvitationExperience.jsx's DEFAULT_BG_MUSIC_URL)
// — a real, always-present asset, so this demo never depends on a network
// call succeeding.
const DEMO_AUDIO_SRC = '/audio/default-background-music.mp3'
const PREVIEW_SECONDS = 30
const TYPE_SPEED_MS = 90
const PAUSE_BETWEEN_MS = 1600

export default function MusicVibeWidget() {
  const reduceMotion = useReducedMotion()
  const [queryIndex, setQueryIndex] = useState(0)
  const [typed, setTyped] = useState(reduceMotion ? DEMO_QUERIES[0] : '')
  const [playingId, setPlayingId] = useState(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const rafRef = useRef(null)

  // Decorative typewriter cycling through the three demo queries — shows
  // how little a host has to type before their song turns up, without
  // pretending to be a real search box.
  useEffect(() => {
    if (reduceMotion) return
    let cancelled = false
    let pauseTimer
    const target = DEMO_QUERIES[queryIndex]
    let i = 0
    const typeTimer = setInterval(() => {
      if (cancelled) return
      i += 1
      setTyped(target.slice(0, i))
      if (i >= target.length) {
        clearInterval(typeTimer)
        pauseTimer = setTimeout(() => {
          if (cancelled) return
          setTyped('')
          setQueryIndex((prev) => (prev + 1) % DEMO_QUERIES.length)
        }, PAUSE_BETWEEN_MS)
      }
    }, TYPE_SPEED_MS)
    return () => {
      cancelled = true
      clearInterval(typeTimer)
      clearTimeout(pauseTimer)
    }
  }, [queryIndex, reduceMotion])

  const activeMatchId = DEMO_TRACKS.find((t) => t.title === (reduceMotion ? DEMO_TRACKS[0].title : typed))?.id

  const togglePlay = (id) => {
    const audio = audioRef.current
    if (!audio) return
    if (playingId === id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    audio.currentTime = 0
    audio.play().catch(() => {})
    setPlayingId(id)
  }

  // Drives the progress ring off the shared <audio>'s real currentTime and
  // caps the clip at 30s, mirroring the "30-second preview" every host
  // gets on the real /create step.
  useEffect(() => {
    if (playingId === null) {
      cancelAnimationFrame(rafRef.current)
      setProgress(0)
      return undefined
    }
    const audio = audioRef.current
    const tick = () => {
      if (!audio) return
      const pct = Math.min(audio.currentTime / PREVIEW_SECONDS, 1)
      setProgress(pct)
      if (pct >= 1) {
        audio.pause()
        setPlayingId(null)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [playingId])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      cancelAnimationFrame(rafRef.current)
    },
    [],
  )

  return (
    <div className="not-prose my-2 overflow-hidden rounded-2xl border border-champagne-deep/50 bg-linen/60 shadow-card">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={DEMO_AUDIO_SRC} onEnded={() => setPlayingId(null)} className="hidden" />

      <div className="flex items-center gap-2 border-b border-champagne-deep/40 bg-champagne/40 px-5 py-3">
        <Sparkles className="h-3.5 w-3.5 text-rose" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Try it right here — this is the actual builder step
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <div
            aria-hidden="true"
            className="w-full truncate rounded-xl border border-champagne-deep/50 bg-ivory px-4 py-3 pl-10 text-ink"
          >
            {typed || ' '}
            {!reduceMotion && (
              <span className="ml-0.5 inline-block h-4 w-[1.5px] -translate-y-0.5 animate-pulse bg-rose align-middle" />
            )}
          </div>
          <span className="sr-only">Song search demo — try tapping Preview 30s on any track below.</span>
        </div>

        <ul className="mt-3 space-y-2">
          {DEMO_TRACKS.map((track) => {
            const isPlaying = playingId === track.id
            const isMatch = activeMatchId === track.id
            return (
              <li
                key={track.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isMatch ? 'border-rose bg-blush/40' : 'border-champagne-deep/40 bg-ivory/70'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-ivory ${track.hue}`}
                >
                  <Music2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{track.title}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {track.artist} · {track.tag}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePlay(track.id)}
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory text-ink"
                  aria-label={isPlaying ? `Pause preview of ${track.title}` : `Preview 30 seconds of ${track.title}`}
                >
                  {isPlaying && (
                    <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-champagne-deep)" strokeWidth="2" />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="var(--color-rose)"
                        strokeWidth="2"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 * (1 - progress)}
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-ink-soft">
          Every card above plays the same short demo clip so you can feel the tap-to-preview
          rhythm — on your real invitation, guests hear the exact song you pick, streaming
          instantly the moment they open the envelope.
        </p>

        <Link
          to="/create"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card transition-transform hover:scale-[1.01]"
        >
          Pick your own song on /create
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
