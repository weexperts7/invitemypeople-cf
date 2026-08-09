// Talks to our own /api/spotify/search proxy (see server/index.js for the
// local-dev route, api/spotify/search.js for production) — never calls
// Spotify directly from the browser, since that would require exposing
// SPOTIFY_CLIENT_SECRET client-side. Used by
// src/components/builder/SongSearchPicker.jsx.

export async function searchSpotifyTracks(query) {
  const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`)
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    const error = new Error(result?.error || `HTTP ${response.status}`)
    // Threaded through so SongSearchPicker.jsx can tell "Spotify said slow
    // down" (429, with how long to wait) apart from any other failure and
    // show the right message instead of a generic one.
    error.status = response.status
    error.retryAfterSeconds = result?.retryAfterSeconds
    throw error
  }
  return result.tracks
}
