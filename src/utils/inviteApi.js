// Talks to the local invites API (see the /api/invites routes in
// server/index.js) — POST to save a newly-paid invitation and get back its
// shareable slug, GET to load one back for the live /i/:slug page. Kept as
// its own module, mirroring the same shape a real database client (e.g.
// Supabase's) would have, so swapping the local JSON-file store for a real
// database later means rewriting only these two functions — nothing that
// calls createInvite()/getInviteBySlug() needs to change.

export async function createInvite(payload) {
  const response = await fetch('/api/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result.invite
}

export async function getInviteBySlug(slug) {
  const response = await fetch(`/api/invites/${encodeURIComponent(slug)}`)
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result.invite
}
