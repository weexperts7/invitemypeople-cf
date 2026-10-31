// Background Music Selection — see CreateInvitePage.jsx's "Add Your
// Details" step. Searches Spotify (via /api/spotify/search, see
// src/utils/spotifyApi.js) as the host types, lets them preview any
// result's 30-second clip with a single shared <audio> element, then
// stages one pick before "Confirm & Apply Song" hands it up to the parent
// form. Only tracks with a preview_url can be selected — Spotify no longer
// returns one for most tracks on a free/Client Credentials app (see
// MUSIC-SETUP.md) — so a host can never end up with a silent "song" that
// looked chosen but won't actually play on /i/:slug.
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Loader2, Music2, Pause, Play, Search } from 'lucide-react'
import { searchSpotifyTracks } from '../../utils/spotifyApi'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 400
const APPLIED_PREVIEW_ID = 'applied'

export default function SongSearchPicker({ value, onConfirm, onRemove, defaultTrackLabel = 'a soft default track' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stagedId, setStagedId] = useState(null)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)
  const debounceRef = useRef(null)
  const latestQueryRef = useRef('')
  // Client-side mirror of the server-side cooldown in src/utils/spotify.js
  // — set from Spotify's own Retry-After (via the 429 our /api/spotify/search
  // route returns, see spotifyApi.js) the moment a search gets rate-limited.
  // While it's in the future, every further keystroke's debounced search is
  // skipped locally — no network round-trip just to get told "no" again —
  // until the window Spotify asked for has actually passed.
  const cooldownUntilRef = useRef(0)
  const cooldownClearTimerRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    latestQueryRef.current = trimmed

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const remainingCooldownMs = cooldownUntilRef.current - Date.now()
    if (remainingCooldownMs > 0) {
      setError('Too many searches, please wait a second…')
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    debounceRef.current = setTimeout(async () => {
      try {
        const tracks = await searchSpotifyTracks(trimmed)
        // A slower, now-stale search resolving after a newer one started
        // typing over it shouldn't clobber the newer (or empty) results.
        if (latestQueryRef.current !== trimmed) return
        setResults(tracks)
      } catch (err) {
        if (latestQueryRef.current !== trimmed) return
        console.error('[SongSearchPicker] search failed:', err)
        if (err.status === 429) {
          const retryAfterSeconds = err.retryAfterSeconds || 5
          cooldownUntilRef.current = Date.now() + retryAfterSeconds * 1000
          setError('Too many searches, please wait a second…')
          // Clears the message on its own once the cooldown passes, rather
          // than leaving it stuck until the host happens to type again.
          clearTimeout(cooldownClearTimerRef.current)
          cooldownClearTimerRef.current = setTimeout(() => {
            setError((current) =>
              current === 'Too many searches, please wait a second…' ? null : current,
            )
          }, retryAfterSeconds * 1000)
        } else {
          setError('Could not search Spotify right now. Please try again in a moment.')
        }
        setResults([])
      } finally {
        if (latestQueryRef.current === trimmed) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  useEffect(() => () => clearTimeout(cooldownClearTimerRef.current), [])

  // Stop any preview clip the moment this section leaves the page — a
  // multi-step form isn't unmounted between steps here, but this still
  // guards against a stray tab switch away from /create.
  useEffect(() => () => audioRef.current?.pause(), [])

  const stagedTrack = results.find((t) => t.id === stagedId) || null

  const togglePreview = (id, previewUrl) => {
    const audio = audioRef.current
    if (!audio || !previewUrl) return
    if (playingId === id) {
      audio.pause()
      setPlayingId(null)
      return
    }
    audio.src = previewUrl
    audio.currentTime = 0
    audio.play().catch(() => {})
    setPlayingId(id)
  }

  const handleSelect = (track) => {
    setStagedId((prev) => (prev === track.id ? null : track.id))
  }

  const handleConfirm = () => {
    if (!stagedTrack) return
    audioRef.current?.pause()
    setPlayingId(null)
    onConfirm({
      title: stagedTrack.title,
      artist: stagedTrack.artist,
      albumArt: stagedTrack.albumArt,
      previewUrl: stagedTrack.previewUrl,
    })
    setQuery('')
    setResults([])
    setStagedId(null)
  }

  const handleChange = () => {
    audioRef.current?.pause()
    setPlayingId(null)
    onRemove()
  }

  if (value) {
    return (
      <div className="rounded-xl border border-champagne-deep/50 bg-ivory/70 p-4">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
        <div className="flex items-center gap-3">
          {value.albumArt ? (
            <img src={value.albumArt} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-champagne/40 text-ink-soft">
              <Music2 className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{value.title}</p>
            <p className="truncate text-xs text-ink-soft">{value.artist}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => togglePreview(APPLIED_PREVIEW_ID, value.previewUrl)}
              aria-label={playingId === APPLIED_PREVIEW_ID ? 'Pause preview' : 'Play preview'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory text-ink"
            >
              {playingId === APPLIED_PREVIEW_ID ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleChange}
              className="rounded-full border border-champagne-deep/50 bg-ivory px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
            >
              Change
            </button>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <Check className="h-3.5 w-3.5 text-rose" />
          This 30-second preview plays automatically when guests open your invitation.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song or artist…"
          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 pl-10 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-soft" />
        )}
      </div>

      {error && (
        <div className="mt-3 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
          <span>{error}</span>
        </div>
      )}

      {!error && !loading && query.trim().length >= MIN_QUERY_LENGTH && results.length === 0 && (
        <p className="mt-3 text-xs text-ink-soft">No results found. Try another search.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
          {results.map((track) => {
            const hasPreview = Boolean(track.previewUrl)
            const isStaged = stagedId === track.id
            return (
              <li
                key={track.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                  isStaged ? 'border-rose bg-blush/40' : 'border-champagne-deep/40 bg-ivory/60'
                }`}
              >
                {track.albumArt ? (
                  <img src={track.albumArt} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-champagne/40 text-ink-soft">
                    <Music2 className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{track.title}</p>
                  <p className="truncate text-xs text-ink-soft">{track.artist}</p>
                  {!hasPreview && <p className="text-[11px] text-ink-soft/70">No preview available</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePreview(track.id, track.previewUrl)}
                    disabled={!hasPreview}
                    aria-label={playingId === track.id ? 'Pause preview' : 'Play preview'}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory text-ink disabled:opacity-40"
                  >
                    {playingId === track.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(track)}
                    disabled={!hasPreview}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-40 ${
                      isStaged
                        ? 'border-rose bg-rose text-ivory'
                        : 'border-champagne-deep/50 bg-ivory text-ink-soft hover:text-ink'
                    }`}
                  >
                    {isStaged ? 'Selected' : 'Select'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {stagedTrack && (
        <button
          type="button"
          onClick={handleConfirm}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card"
        >
          <Check className="h-4 w-4" />
          Confirm &amp; Apply Song — {stagedTrack.title}
        </button>
      )}

      <p className="mt-2 text-xs text-ink-soft">
        Optional — skip this and we&apos;ll play {defaultTrackLabel}
        instead. Powered by Spotify; only songs with a 30-second preview
        available can be selected.
      </p>
    </div>
  )
}
