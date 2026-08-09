// GET /api/spotify/search?q=... — a Vercel Serverless Function. Production
// counterpart to the local-dev route of the same path in server/index.js.
// Backs the Background Music Selection search in the Invitation Builder
// (see src/components/builder/SongSearchPicker.jsx) — proxied through our
// own backend rather than called from the browser so SPOTIFY_CLIENT_SECRET
// (see src/utils/spotify.js) never reaches client JS.
import { searchSpotifyTracks } from '../../src/utils/spotify.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const q = String(req.query.q ?? '').trim().slice(0, 200)
    if (!q) return res.status(200).json({ ok: true, tracks: [] })

    const tracks = await searchSpotifyTracks(q, 8)
    res.status(200).json({ ok: true, tracks })
  } catch (err) {
    // Surfaced as its own status (not the generic 502 below) so
    // SongSearchPicker.jsx can show "Too many searches, please wait a
    // second…" instead of a generic error — see spotifyApi.js. Mirrors
    // server/index.js's identical local-dev handling.
    if (err.code === 'RATE_LIMITED') {
      res.setHeader('Retry-After', String(err.retryAfterSeconds))
      return res.status(429).json({
        ok: false,
        error: 'Too many searches — please wait a second and try again.',
        retryAfterSeconds: err.retryAfterSeconds,
      })
    }
    console.error('[spotify] search failed:', err)
    res.status(502).json({ ok: false, error: 'could not search Spotify right now' })
  }
}
