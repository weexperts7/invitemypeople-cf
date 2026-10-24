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

// Cloudflare KV cache (see wrangler.toml's own comment on this binding) —
// wedding searches repeat the same popular songs constantly, so once a
// track's preview URL is found it's stored here and never needs asking
// iTunes again. This is the real fix for the rate-limit problem the
// comments below describe: every cache hit is one fewer request competing
// for the shared, already-saturated per-IP budget. Bridged onto
// process.env by functions/_lib/adapt.js's bridgeEnv() the same way every
// other credential in this codebase is — absent in local dev and in any
// runtime without the binding, where caching is simply skipped (falls
// through to a live iTunes lookup every time, same as before this existed).
//
// Only successful lookups are ever cached, deliberately never a miss/null:
// a null here is ambiguous between "iTunes genuinely has no match" and
// "still rate-limited after the retry below" — caching that would risk
// permanently hiding a track's preview just because the moment it was
// first searched happened to be rate-limited.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days — a track's audio clip URL doesn't change

function cacheKey(title, artist) {
  return `preview:${artist.trim().toLowerCase()}::${title.trim().toLowerCase()}`
}

async function getCachedPreviewUrl(kv, title, artist) {
  if (!kv) return undefined
  try {
    return (await kv.get(cacheKey(title, artist))) || undefined
  } catch (err) {
    console.error(`[itunesPreview] cache read for "${artist} ${title}" failed:`, err)
    return undefined
  }
}

async function setCachedPreviewUrl(kv, title, artist, previewUrl) {
  if (!kv) return
  try {
    await kv.put(cacheKey(title, artist), previewUrl, { expirationTtl: CACHE_TTL_SECONDS })
  } catch (err) {
    console.error(`[itunesPreview] cache write for "${artist} ${title}" failed:`, err)
  }
}

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

async function findItunesPreviewUrl(kv, title, artist, attempt = 0) {
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
        return findItunesPreviewUrl(kv, title, artist, attempt + 1)
      }
      console.error(`[itunesPreview] lookup for "${artist} ${title}" failed: HTTP ${response.status}`)
      return null
    }
    const data = await response.json()
    const previewUrl = data?.results?.[0]?.previewUrl ?? null
    if (previewUrl) await setCachedPreviewUrl(kv, title, artist, previewUrl)
    return previewUrl
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

// Even staggered+retried, two searches landing close together (debounced
// typing firing more than once) independently queue their own sequences
// against the same shared, already-saturated Cloudflare egress IP — a
// single search's own pacing can't control that. Capping how many of a
// search's results ever attempt an iTunes lookup at all is the one lever
// left that directly shrinks total request volume rather than just
// reordering it: the UI only shows a handful of results without
// scrolling anyway, so the long tail past MAX_LOOKUPS was mostly spending
// rate-limit budget on tracks nobody was about to click regardless.
const MAX_LOOKUPS = 4

// Fills in `previewUrl` on every track that came back from Spotify without
// one. Cache reads first, for every track, in parallel — a KV read never
// touches iTunes' rate limit, so there's no reason to ration those the way
// live lookups are rationed below. Only tracks that are still missing a
// preview after that (first-ever search for that song, or it fell out of a
// since-expired cache entry) spend from the MAX_LOOKUPS budget, one at a
// time on iTunes itself. Tracks that already have a Spotify preview
// (Extended Quota Mode apps, or the rare track Spotify does still serve one
// for) skip both steps entirely.
export async function backfillPreviewUrls(tracks, kv) {
  const afterCache = await Promise.all(
    tracks.map(async (track) => {
      if (track.previewUrl) return track
      const cached = await getCachedPreviewUrl(kv, track.title, track.artist)
      return cached ? { ...track, previewUrl: cached } : track
    }),
  )

  const results = []
  let lookups = 0
  for (const track of afterCache) {
    if (track.previewUrl || lookups >= MAX_LOOKUPS) {
      results.push(track)
      continue
    }
    lookups += 1
    const previewUrl = await findItunesPreviewUrl(kv, track.title, track.artist)
    results.push(previewUrl ? { ...track, previewUrl } : track)
    await delay(STAGGER_MS)
  }
  return results
}
