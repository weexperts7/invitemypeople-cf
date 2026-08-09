// Spotify Web API access — Client Credentials flow (app-only auth, no user
// login required, free tier). Backs the Background Music Selection search
// in the Invitation Builder (see builder/SongSearchPicker.jsx), with two
// thin route wrappers around this same module: server/index.js's
// GET /api/spotify/search for local dev, and api/spotify/search.js (a
// Vercel Serverless Function) for production — same split as
// src/utils/razorpay.js.
//
// SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET are server-only env vars (see
// .env.example) — never prefix either with VITE_, or the secret would ship
// in the public JS bundle. Get both from the Spotify Developer Dashboard
// (https://developer.spotify.com/dashboard) → Create App — no paid plan
// needed, Client Credentials search is free.
//
// Backfills previewUrl from iTunes for tracks Spotify returned without one
// — see itunesPreview.js for why. Kept as a separate module rather than
// inlined here since it talks to a wholly different, unauthenticated API.
import { backfillPreviewUrls } from './itunesPreview.js'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SEARCH_URL = 'https://api.spotify.com/v1/search'

// Module-scope cache: a Client Credentials token is valid ~1hr and isn't
// tied to any one request, so every call in this process (or this
// Serverless Function's warm container) reuses it instead of re-authing on
// every search keystroke. Cold starts just refetch — cheap, and correct
// either way.
let cachedToken = null // { accessToken, expiresAt }

// Module-scope rate-limit gate, set from Spotify's own `Retry-After` header
// (seconds) on a 429 — from either the token endpoint or the search
// endpoint. Shared across every request this process (or warm Serverless
// container) handles, not per-caller: once Spotify says "wait", every
// search — everyone's, not just the one that got the 429 — fails fast
// against this local check instead of each queuing up its own request and
// getting its own 429 back, which would just prolong the penalty.
let rateLimitedUntil = 0

export class SpotifyRateLimitError extends Error {
  constructor(retryAfterSeconds) {
    super('Spotify rate limit exceeded')
    this.name = 'SpotifyRateLimitError'
    this.code = 'RATE_LIMITED'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

// Spotify sends `Retry-After` in whole seconds. Falls back to a
// conservative 5s if it's ever missing — better to under-retry briefly
// than to hammer an endpoint that just told us to back off.
function readRetryAfterSeconds(response) {
  const header = Number(response.headers.get('retry-after'))
  return Number.isFinite(header) && header > 0 ? header : 5
}

function assertNotRateLimited() {
  const remainingMs = rateLimitedUntil - Date.now()
  if (remainingMs > 0) {
    throw new SpotifyRateLimitError(Math.ceil(remainingMs / 1000))
  }
}

async function requestAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'Spotify credentials are not configured — set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET (see .env.example)',
    )
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfterSeconds = readRetryAfterSeconds(response)
      rateLimitedUntil = Date.now() + retryAfterSeconds * 1000
      throw new SpotifyRateLimitError(retryAfterSeconds)
    }
    throw new Error(`Spotify token request failed (HTTP ${response.status})`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    // 60s safety margin so a token doesn't expire mid-flight on a slow request.
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  }
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken
  }
  cachedToken = await requestAccessToken()
  return cachedToken.accessToken
}

// Trims the Spotify API's verbose track object down to exactly what
// SongSearchPicker.jsx renders/stores: title, artist(s), one album-art
// image, and the 30-second preview clip URL. `previewUrl` is frequently
// null straight from Spotify — it restricted full access to 30s preview
// clips in late 2024, so most tracks no longer return one for apps on
// Client Credentials/free access — but searchSpotifyTracks() below
// backfills it from iTunes before returning, so callers/UI code should
// treat a still-null previewUrl as "no preview exists anywhere", not as a
// Spotify-specific gap.
function toSimpleTrack(track) {
  return {
    id: track.id,
    title: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(', '),
    albumArt: track.album?.images?.[1]?.url ?? track.album?.images?.[0]?.url ?? null,
    previewUrl: track.preview_url ?? null,
  }
}

export async function searchSpotifyTracks(query, limit = 8) {
  const q = String(query ?? '').trim()
  if (!q) return []

  // Checked before spending a request on either the token endpoint or the
  // search endpoint — a caller mid-cooldown gets the same friendly
  // SpotifyRateLimitError immediately, with no network round-trip, and
  // (critically) without ever running the risk of extending the penalty by
  // drawing yet another 429.
  assertNotRateLimited()

  const token = await getAccessToken()
  const params = new URLSearchParams({
    q,
    type: 'track',
    limit: String(Math.min(Math.max(Number(limit) || 8, 1), 20)),
  })

  const response = await fetch(`${SEARCH_URL}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfterSeconds = readRetryAfterSeconds(response)
      rateLimitedUntil = Date.now() + retryAfterSeconds * 1000
      throw new SpotifyRateLimitError(retryAfterSeconds)
    }
    // 401 here means our cached token was rejected (e.g. revoked
    // mid-lifetime) — drop it so the very next search re-authenticates
    // instead of retrying the same bad token every time until it "expires".
    if (response.status === 401) cachedToken = null
    throw new Error(`Spotify search failed (HTTP ${response.status})`)
  }

  const data = await response.json()
  const tracks = (data?.tracks?.items ?? []).map(toSimpleTrack)
  // See itunesPreview.js: covers the (common) case where Spotify itself
  // returned no preview_url, so a host isn't stuck unable to select almost
  // anything they search for.
  return backfillPreviewUrls(tracks)
}
