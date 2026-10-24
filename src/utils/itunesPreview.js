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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// One retry on 429 specifically — confirmed via Cloudflare's live Function
// logs that iTunes' per-IP rate limit is what's actually blocking these
// (not a bot-detection block: the exact same query resolves instantly when
// run outside Cloudflare's network). The 150ms stagger in backfillPreviewUrls
// cut most 429s but not all — Cloudflare Workers share egress IPs across
// unrelated customers, so this app's own request pacing can't fully control
// how saturated that shared IP's rate-limit bucket already is. A short
// backoff plus one retry recovers the transient case without piling on more
// latency for the common (already-succeeding) case.
const RETRY_BACKOFF_MS = 400

async function findItunesPreviewUrl(title, artist, attempt = 0) {
  try {
    const params = new URLSearchParams({
      term: `${artist} ${title}`,
      media: 'music',
      entity: 'song',
      limit: '1',
    })
    // Cloudflare Workers' default fetch() sends no User-Agent at all, which
    // reads as bot/datacenter traffic to some public APIs — iTunes' search
    // endpoint appears to be one of them: this request works fine from a
    // browser or a local dev machine, but every lookup silently fails when
    // it originates from Cloudflare's network. A plain desktop-browser UA
    // is enough to look like an ordinary web request.
    const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    if (!response.ok) {
      if (response.status === 429 && attempt === 0) {
        await delay(RETRY_BACKOFF_MS)
        return findItunesPreviewUrl(title, artist, attempt + 1)
      }
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

// Firing one lookup per track in parallel (the old Promise.all approach)
// reliably tripped iTunes' per-IP rate limit (HTTP 429, confirmed via
// Cloudflare's live Function logs) — Cloudflare Workers share egress IPs
// across a huge number of unrelated customers, so even one search's worth
// of simultaneous requests was enough to get throttled. Sequential with a
// small stagger keeps each search under that burst threshold; it costs a
// bit of latency (worst case tracks.length * STAGGER_MS, since every miss
// still waits its full fetch timeout too) but that's the trade for
// previews actually coming back instead of 429ing every time.
const STAGGER_MS = 150

// Fills in `previewUrl` on every track that came back from Spotify without
// one, by looking each up on iTunes one at a time. Tracks that already have
// a Spotify preview (Extended Quota Mode apps, or the rare track Spotify
// does still serve one for) are left untouched — iTunes is only asked to
// cover the gap.
export async function backfillPreviewUrls(tracks) {
  const results = []
  for (const track of tracks) {
    if (track.previewUrl) {
      results.push(track)
      continue
    }
    const previewUrl = await findItunesPreviewUrl(track.title, track.artist)
    results.push(previewUrl ? { ...track, previewUrl } : track)
    await delay(STAGGER_MS)
  }
  return results
}
