// Shared helpers for the rsvps Serverless Functions (api/rsvps/index.js,
// api/wishes.js, api/invites/[slug]/host.js) — mirrors api/_lib/invites.js's
// clean()/rowToInvite() pattern: one function that validates+sanitizes an
// inbound submission, and two row->camelCase mappers with different amounts
// of exposure, since "wishes" (public, name+message only) and "the host
// dashboard" (private, full guest_email/attendance detail) read the same
// table but must never return the same shape.
import { clean } from './invites.js'

// Builds an insertable row from a POST /api/rsvps body. Mirrors RsvpForm.jsx
// and useRsvpSubmit.js's payload shape exactly: attendanceStatus stays
// 'joyfully' | 'regretfully' verbatim (the app's on-brand copy, not
// translated to yes/no at write time — see RSVPS-AND-REMINDERS-SETUP.md),
// and guests is forced to 0 whenever the guest declined.
export function cleanRsvp(body) {
  const isAttending = body.attendanceStatus === 'joyfully'
  const seva = isAttending ? clean(body.seva, 300) : ''
  return {
    // Satsang only — left off entirely when empty, so every other template's
    // RSVP never depends on this column (0018_satsang_seva_and_jaap.sql).
    ...(seva && { seva }),
    guest_name: clean(body.guestName, 120),
    guest_email: clean(body.guestEmail, 200) || null,
    attendance: clean(body.attendanceStatus, 20) || 'joyfully',
    guest_count: isAttending ? Number(body.guests) || 1 : 0,
    song: clean(body.song, 300),
    advice: clean(body.advice, 2000),
    message: clean(body.message, 2000),
  }
}

// Public shape — Wishes Wall (WishesWall.jsx) only ever needs a name and a
// message. No email, no attendance detail: this is what keeps /api/wishes
// safe to leave unauthenticated.
export function rowToWish(row) {
  return {
    name: row.guest_name,
    message: row.message,
    timestamp: row.created_at,
  }
}

// Private shape — only ever returned from the token-gated host dashboard
// endpoint (api/invites/[slug]/host.js). Full detail, including the guest's
// email if they gave one.
export function rowToRsvp(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    attendance: row.attendance,
    guestCount: row.guest_count,
    song: row.song,
    advice: row.advice,
    message: row.message,
    seva: row.seva,
    createdAt: row.created_at,
  }
}

// Same summary shape the Supabase Edge Function computes for the reminder
// email — kept here so the dashboard endpoint and the reminder function
// can't silently drift apart on what "attending" means.
export function summarizeRsvps(rows) {
  const attending = rows.filter((r) => r.attendance === 'joyfully')
  const declining = rows.filter((r) => r.attendance !== 'joyfully')
  return {
    totalResponses: rows.length,
    attendingCount: attending.length,
    decliningCount: declining.length,
    totalGuests: attending.reduce((sum, r) => sum + (Number(r.guest_count) || 0), 0),
  }
}
