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
    venue: row.venue,
    locationUrl: row.location_url,
    message: row.message,
    amount: row.amount,
    paymentId: row.payment_id,
    paymentStatus: row.payment_status,
    photos: row.photos ?? [],
    eventTitle: row.event_title,
    events: row.events ?? [],
    createdAt: row.created_at,
  }
}
