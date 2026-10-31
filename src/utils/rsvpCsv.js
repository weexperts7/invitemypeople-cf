// Client-side CSV export for the Host Dashboard's "Download CSV" button
// (see src/pages/HostDashboardPage.jsx). No dependency — a guest list is
// small enough that a hand-rolled RFC-4180-minimal builder is simpler than
// pulling in a CSV library for one button.

const HEADERS = [
  'Guest Name',
  'Email',
  'Attending',
  'Guests',
  'Song',
  'Advice',
  'Message',
  'Seva',
  'Submitted At',
]

// Wraps a field in quotes only when it contains a character that would
// otherwise break the CSV grammar (comma, quote, or newline), doubling any
// internal quotes per RFC 4180.
function csvField(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function attendanceLabel(attendance) {
  return attendance === 'joyfully' ? 'Joyfully accepts' : 'Regretfully declines'
}

export function rsvpsToCsv(rsvps) {
  const rows = rsvps.map((r) =>
    [
      r.guestName,
      r.guestEmail,
      attendanceLabel(r.attendance),
      r.guestCount,
      r.song,
      r.advice,
      r.message,
      r.seva,
      r.createdAt,
    ]
      .map(csvField)
      .join(','),
  )
  return [HEADERS.join(','), ...rows].join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
