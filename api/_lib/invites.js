// Shared helpers for the invites Serverless Functions — mirrors the
// clean()/randomSlugSuffix() helpers in server/index.js (the local-dev/
// Node-host path) so the two implementations stay easy to compare, plus a
// row<->camelCase mapper since the `invites` Postgres table uses snake_case
// columns but everything else in this codebase (inviteApi.js,
// GeneratedInvitePage.jsx) speaks camelCase.

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

export function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8)
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
