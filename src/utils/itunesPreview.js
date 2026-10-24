// iTunes Search API fallback for 30-second preview clips — see spotify.js's
// toSimpleTrack() doc comment for why this exists: Spotify stops returning
// `preview_url` for almost every track on a plain Client Credentials app
// (no Extended Quota Mode), so most Spotify search results would otherwise
// be unselectable in SongSearchPicker.jsx. iTunes' public search endpoint
// still freely returns a playable ~30s preview clip URL for a matching
// track, no auth or quota approval needed, so we use it purely to backfill
// the clip — Spotify search results (title, artist, album art) stay as-is.
const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search'

// Best-effort — a lookup miss or network hiccup should never fail the
// overall Spotify search, it should just leave that track's preview null
// (same as if Spotify itself had no preview), so SongSearchPicker.jsx keeps
// treating it as "no preview available".
async function findItunesPreviewUrl(title, artist) {
  try {
    const params = new URLSearchParams({
      term: `${artist} ${title}`,
      media: 'music',
      entity: 'song',
      limit: '1',
    })
    const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`)
    if (!response.ok) {
      console.error(`[itunesPreview] lookup for "${artist} ${title}" failed: HTTP ${response.status}`)
      return null
    }
    const data = await response.json()
    return data?.results?.[0]?.previewUrl ?? null
  } catch (err) {
    console.error(`[itunesPreview] lookup for "${artist} ${title}" threw:`, err)
    return null
  }
}

// Fills in `previewUrl` on every track that came back from Spotify without
// one, by looking each up on iTunes in parallel. Tracks that already have a
// Spotify preview (Extended Quota Mode apps, or the rare track Spotify does
// still serve one for) are left untouched — iTunes is only asked to cover
// the gap.
export async function backfillPreviewUrls(tracks) {
  return Promise.all(
    tracks.map(async (track) => {
      if (track.previewUrl) return track
      const previewUrl = await findItunesPreviewUrl(track.title, track.artist)
      return previewUrl ? { ...track, previewUrl } : track
    }),
  )
}
