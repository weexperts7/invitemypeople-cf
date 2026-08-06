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
