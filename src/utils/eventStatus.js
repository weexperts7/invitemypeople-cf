// Shared "has this event's window closed" rule — one source of truth for
// the two places that need to agree on it: the public /i/:slug page
// (GeneratedInvitePage.jsx swaps in EventConcludedView.jsx once closed) and
// the Partner Dashboard's invite list (PartnerInvitesPage.jsx's Active/
// Closed status badge). An event stays "active" through its date/time plus
// a POST_EVENT_BUFFER_HOURS grace window afterwards — a guest or partner
// checking the link that same evening, or the next morning, still sees it
// live — and only flips to "closed" after that.
//
// Deliberately fails OPEN: an invite whose date can't be parsed (blank,
// malformed, or an old row saved before any date validation existed) is
// treated as still active rather than expired, so a data gap never
// silently locks out a real, currently-running invitation.

export const POST_EVENT_BUFFER_HOURS = 24

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

// This app's audience/events are India-based — invites_due_for_reminder()
// (see supabase/migrations/0007_consumer_rsvps_and_reminders.sql) already
// interprets date/time as Asia/Kolkata; matching that here (rather than
// the visiting browser's or the server's own local timezone) is what keeps
// "expires 24h after the event" correct regardless of who — or what
// server region — evaluates it. India has a single, fixed UTC offset with
// no DST, so a literal "+05:30" is safe year-round.
const IST_OFFSET = '+05:30'

// "YYYY-MM-DD" (+ optional "HH:MM") -> Date (an absolute instant, IST-
// anchored). Defaults to end-of-day (23:59) when no time is given, since a
// bare date should read as "active through that whole day", not "active
// until midnight at its start". Returns null instead of throwing for
// anything that doesn't parse — callers treat null as "unknown", never as
// "expired".
function parseMoment(date, time) {
  if (typeof date !== 'string' || !DATE_RE.test(date)) return null
  const timePart = typeof time === 'string' && TIME_RE.test(time) ? time : '23:59'
  const moment = new Date(`${date}T${timePart}:00${IST_OFFSET}`)
  return Number.isNaN(moment.getTime()) ? null : moment
}

// The latest moment across an invite's main date/time, its canonical
// event_date column (see api/_lib/invites.js / the 0008 migration), and any
// Additional Events (src/utils/cleanEvents.js — e.g. a Reception the day
// after the wedding) — so an invite with a post-main-event function doesn't
// close mid-celebration. Returns null when nothing on the invite parses.
export function getEventEndMoment(invite) {
  if (!invite) return null
  const candidates = [
    parseMoment(invite.date, invite.time),
    parseMoment(invite.eventDate, null),
    ...(Array.isArray(invite.events) ? invite.events.map((e) => parseMoment(e?.date, e?.time)) : []),
  ].filter(Boolean)

  if (candidates.length === 0) return null
  return new Date(Math.max(...candidates.map((d) => d.getTime())))
}

/** 'active' | 'closed' — see the module comment for the rule. */
export function getEventStatus(invite, now = new Date()) {
  const moment = getEventEndMoment(invite)
  if (!moment) return 'active'
  const cutoffMs = moment.getTime() + POST_EVENT_BUFFER_HOURS * 60 * 60 * 1000
  return now.getTime() > cutoffMs ? 'closed' : 'active'
}

export function isEventClosed(invite, now = new Date()) {
  return getEventStatus(invite, now) === 'closed'
}
