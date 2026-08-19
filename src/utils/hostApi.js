// Talks to the token-gated Host Dashboard endpoint (see
// api/invites/[slug]/host.js in production, the matching GET
// /api/invites/:slug/host route in server/index.js for local dev). A
// sibling module to inviteApi.js rather than folded into it — this is a
// distinct concern (private, token-authenticated reads) from that module's
// public invite create/read. Same fetch/throw shape as inviteApi.js so the
// two stay easy to compare.

export async function getHostDashboard(slug, hostToken) {
  const response = await fetch(
    `/api/invites/${encodeURIComponent(slug)}/host?token=${encodeURIComponent(hostToken)}`,
  )
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result
}

// Same idea, for a partner-created invite's dashboard (/p/:slug/host/
// :hostToken — see PartnerHostDashboardPage.jsx and
// api/_lib/partnerHandlers.js's getPartnerInviteHostDashboard()). Reads
// `partner_invites`/`partner_rsvps`, never the consumer tables.
export async function getPartnerHostDashboard(slug, hostToken) {
  const response = await fetch(
    `/api/partners/invites/${encodeURIComponent(slug)}/host?token=${encodeURIComponent(hostToken)}`,
  )
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result
}
