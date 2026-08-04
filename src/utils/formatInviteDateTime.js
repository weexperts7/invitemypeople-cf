// Formats the raw values <input type="date"> / <input type="time"> hand
// back ("YYYY-MM-DD" / "HH:MM", always 24-hour) into the warm, human copy
// the live preview card displays — used by both the Invitation Builder's
// preview (InvitePreviewCard.jsx) and its WhatsApp handoff summary
// (CreateInvitePage.jsx) so the two always agree on how a date/time reads.

export function formatInviteDate(isoDate) {
  if (!isoDate) return ''
  // Parsed as local midnight, not UTC — "new Date('2026-09-14')" alone
  // parses as UTC and can print the day *before* in timezones west of UTC.
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatInviteTime(time24) {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return ''
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

// A best-effort Google Maps search link built from a venue name — used as
// the live preview's "View on Map" fallback whenever the user hasn't pasted
// their own Location URL yet.
export function mapsSearchUrl(venue) {
  if (!venue) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`
}
