// A Satsang invite's Langar Prasad details, saved as one `langar` value (see
// 0019_invites_langar.sql). Shared by the builder and both /api/invites routes
// (api/invites/index.js, server/index.js), so what's checked on the way in
// matches what the form sends.
export const DEFAULT_LANGAR_NOTE = 'Please stay and take langar prasad with the sangat after satsang.'
export const MAX_LANGAR_NOTE = 160

// What to save and preview for what's in the builder form.
export function resolveLangar({ langarServed, langarTime, langarNote }) {
  if (!langarServed) return { served: false, time: '', note: '' }
  return { served: true, time: langarTime || '', note: langarNote?.trim() || DEFAULT_LANGAR_NOTE }
}

// The server's copy of the same shape, from an untrusted request body.
export function sanitiseLangar(value) {
  if (!value || typeof value !== 'object') return null
  const time = typeof value.time === 'string' && /^\d{2}:\d{2}$/.test(value.time) ? value.time : ''
  const note = typeof value.note === 'string' ? value.note.trim().slice(0, MAX_LANGAR_NOTE) : ''
  return value.served === false ? { served: false, time: '', note: '' } : { served: true, time, note }
}
