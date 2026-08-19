// Shared helpers for the partner-invite RSVP handlers in
// api/_lib/partnerHandlers.js — a partner-side duplicate of
// api/_lib/rsvps.js's clean()/row-mapper split, kept deliberately separate
// (never imported from/into api/_lib/rsvps.js or api/_lib/invites.js) to
// preserve the isolation guarantee partnerHandlers.js's file header
// documents. Backs the `partner_rsvps` table
// (supabase/migrations/0011_partner_invite_host_dashboard.sql), a
// structural twin of the consumer `rsvps` table foreign-keyed to
// `partner_invites` (uuid) instead of `invites` (bigint).
import { clean } from './partners.js'

// Builds an insertable row from a POST /api/partners/rsvps body. Mirrors
// RsvpForm.jsx's payload shape exactly (see api/_lib/rsvps.js's
// cleanRsvp(), which this is a byte-for-byte duplicate of) —
// attendanceStatus stays 'joyfully' | 'regretfully' verbatim, and
// guest_count is forced to 0 whenever the guest declined.
export function cleanPartnerRsvp(body) {
  const isAttending = body.attendanceStatus === 'joyfully'
  return {
    guest_name: clean(body.guestName, 120),
    guest_email: clean(body.guestEmail, 200) || null,
    attendance: clean(body.attendanceStatus, 20) || 'joyfully',
    guest_count: isAttending ? Number(body.guests) || 1 : 0,
    song: clean(body.song, 300),
    advice: clean(body.advice, 2000),
    message: clean(body.message, 2000),
  }
}

// Public shape — the Wishes Wall on /p/:slug only ever needs a name and a
// message. No email, no attendance detail: this is what keeps
// /api/partners/wishes safe to leave unauthenticated.
export function rowToPartnerWish(row) {
  return {
    name: row.guest_name,
    message: row.message,
    timestamp: row.created_at,
  }
}

// Private shape — only ever returned from the token-gated
// /api/partners/invites/:slug/host endpoint. Full detail, including the
// guest's email if they gave one.
export function rowToPartnerRsvp(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    attendance: row.attendance,
    guestCount: row.guest_count,
    song: row.song,
    advice: row.advice,
    message: row.message,
    createdAt: row.created_at,
  }
}

// Same summary shape api/_lib/rsvps.js's summarizeRsvps() computes for the
// consumer host dashboard — kept as its own copy here for the same
// isolation reason as everything else in this file.
export function summarizePartnerRsvps(rows) {
  const attending = rows.filter((r) => r.attendance === 'joyfully')
  const declining = rows.filter((r) => r.attendance !== 'joyfully')
  return {
    totalResponses: rows.length,
    attendingCount: attending.length,
    decliningCount: declining.length,
    totalGuests: attending.reduce((sum, r) => sum + (Number(r.guest_count) || 0), 0),
  }
}
