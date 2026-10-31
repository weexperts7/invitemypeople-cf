// Shared helpers for the invites Serverless Functions — mirrors the
// clean()/randomSlugSuffix() helpers in server/index.js (the local-dev/
// Node-host path) so the two implementations stay easy to compare, plus a
// row<->camelCase mapper since the `invites` Postgres table uses snake_case
// columns but everything else in this codebase (inviteApi.js,
// GeneratedInvitePage.jsx) speaks camelCase.

import { randomBytes, timingSafeEqual } from 'node:crypto'

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

export function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

// Best-effort text `date` ("YYYY-MM-DD", from <input type="date">) -> the
// typed `event_date` column (see supabase/migrations/0008_invites_event_date.sql).
// Returns null for anything that isn't a clean ISO date rather than
// throwing, so a malformed value never blocks the whole insert — event_date
// is a convenience/reporting column, not the sole source of truth for
// expiry: src/utils/eventStatus.js reads the `date`/`time` text columns
// directly and only falls back to this one.
export function toEventDateColumn(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? '')) ? date : null
}

// True when `date` ("YYYY-MM-DD") parses and is strictly before today —
// server-side backstop for the <input type="date" min=...> guard in
// CreateInvitePage.jsx/PartnerCreateInvitePage.jsx, since a client can
// always send a raw POST body that skips the browser's date picker.
// Plain string comparison (not Date math) so it can't drift with timezone
// offsets: "YYYY-MM-DD" sorts lexicographically the same as chronologically.
export function isPastDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ''))) return false
  const today = new Date().toISOString().slice(0, 10)
  return date < today
}

// A private, unguessable per-invite token — the only thing standing between
// "anyone with the shareable /i/:slug link" and "the host, who can see every
// guest's email and RSVP details on /i/:slug/host/:hostToken". There's no
// login system anywhere in this app, so this token *is* the auth model for
// the dashboard: long enough (24 random bytes, base64url-encoded) that
// guessing it is infeasible, and never returned by any GET endpoint — only
// the one-time POST /api/invites response that creates it.
export function generateHostToken() {
  return randomBytes(24).toString('base64url')
}

// Constant-time comparison for the host-token check (api/invites/[slug]/host.js)
// — a plain `===` would let response timing leak how many leading characters
// of a guessed token were correct. Mismatched lengths are handled explicitly
// since timingSafeEqual throws instead of returning false for those.
export function tokensMatch(a, b) {
  const bufA = Buffer.from(String(a ?? ''))
  const bufB = Buffer.from(String(b ?? ''))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function rowToInvite(row) {
  return {
    slug: row.slug,
    occasion: row.occasion,
    templateId: row.template_id,
    templateName: row.template_name,
    names: row.names,
    date: row.date,
    time: row.time,
    // Typed mirror of `date` (see 0008_invites_event_date.sql) — null on
    // rows saved before that column existed or whose `date` didn't parse;
    // getEventStatus() (src/utils/eventStatus.js) treats that the same as
    // any other unknown date and reads `date`/`time` directly instead.
    eventDate: row.event_date,
    venue: row.venue,
    locationUrl: row.location_url,
    message: row.message,
    greetingLine: row.greeting_line,
    amount: row.amount,
    paymentId: row.payment_id,
    paymentStatus: row.payment_status,
    photos: row.photos ?? [],
    eventTitle: row.event_title,
    events: row.events ?? [],
    bgSongTitle: row.bg_song_title,
    bgSongArtist: row.bg_song_artist,
    bgSongAlbumArt: row.bg_song_album_art,
    bgSongPreviewUrl: row.bg_song_preview_url,
    // "Family Details" (see CreateInvitePage.jsx) — optional groom's/
    // bride's name + parents, rendered as the two cards under the couple's
    // names on WelcomeSplash.jsx (couple.people). All four nullable; blank
    // on invites created before this column existed.
    groomName: row.groom_name,
    groomParents: row.groom_parents,
    brideName: row.bride_name,
    brideParents: row.bride_parents,
    // Portrait URLs, on templates that show one — see
    // 0016_invites_portraits_and_venue_photo.sql.
    groomPhoto: row.groom_photo,
    bridePhoto: row.bride_photo,
    venuePhoto: row.venue_photo,
    // Admin-only, Mahogany Seal template only — see
    // 0014_admin_mahogany_caricature_video.sql /
    // 0015_admin_mahogany_hashtag.sql / api/_lib/adminCreateInvite.js.
    // Null for every invite created any other way.
    caricatureVideoUrl: row.caricature_video_url,
    hashtag: row.hashtag,
    createdAt: row.created_at,
  }
}
