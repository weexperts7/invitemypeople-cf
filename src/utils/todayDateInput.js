// Today's date as a "YYYY-MM-DD" string in the browser's local timezone —
// the format <input type="date"> wants for its `min`/`value` attributes.
// Deliberately avoids `new Date().toISOString()`, which reports UTC and can
// be off by a day for users east/west of UTC.
export function todayDateInputValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
