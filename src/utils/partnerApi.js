// Talks to the B2B Partner Portal API (api/partners/*, api/admin/* — see
// api/_lib/partnerHandlers.js). Same fetch/throw shape as inviteApi.js/
// hostApi.js so all three stay easy to compare, plus a Bearer token on
// every call: these routes authenticate via the Supabase Auth session
// (see supabaseClient.js), never a per-resource token like the host
// dashboard's hostToken.
async function request(path, { method = 'GET', token, body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result
}

// --- Partner-facing --------------------------------------------------------

export function signupPartner(payload) {
  return request('/api/partners/signup', { method: 'POST', body: payload })
}

// Public, unauthenticated. Always resolves ok — see the handler's own
// comment (api/_lib/partnerHandlers.js's forgotPassword()) on why it never
// reports whether the email matched an account.
export function requestPasswordReset(email) {
  return request('/api/partners/forgot-password', { method: 'POST', body: { email } })
}

// Public, unauthenticated (same trust model as api/photos.js) — the signup
// form uploads the logo first and gets back a URL to submit with the rest
// of the application. Not JSON, so this bypasses request()'s helper.
export async function uploadPartnerLogo(file) {
  const formData = new FormData()
  formData.append('logo', file)
  const response = await fetch('/api/partners/logo', { method: 'POST', body: formData })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || `HTTP ${response.status}`)
  }
  return result.url
}

export function getMyProfile(token) {
  return request('/api/partners/me', { token })
}

export function updateProfile(token, payload) {
  return request('/api/partners/profile', { method: 'POST', token, body: payload })
}

export function getMyCredits(token) {
  return request('/api/partners/credits', { token })
}

export function createPurchaseOrder(token, packageId) {
  return request('/api/partners/purchase/create-order', { method: 'POST', token, body: { packageId } })
}

export function verifyPurchase(token, payload) {
  return request('/api/partners/purchase/verify', { method: 'POST', token, body: payload })
}

export function getMyInvites(token) {
  return request('/api/partners/invites', { token })
}

export function createClientInvite(token, payload) {
  return request('/api/partners/invites', { method: 'POST', token, body: payload })
}

// Public, unauthenticated — the shareable /p/:slug link's data source (see
// PartnerInviteViewerPage.jsx).
export function getPartnerInviteBySlug(slug) {
  return request(`/api/partners/invites/${encodeURIComponent(slug)}`)
}

// --- Admin-facing ------------------------------------------------------

export function adminGetMe(token) {
  return request('/api/admin/me', { token })
}

export function adminListPartners(token, status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/api/admin/partners${qs}`, { token })
}

export function adminApprovePartner(token, partnerId) {
  return request('/api/admin/partners/approve', { method: 'POST', token, body: { partnerId } })
}

export function adminRejectPartner(token, partnerId, reason) {
  return request('/api/admin/partners/reject', { method: 'POST', token, body: { partnerId, reason } })
}

export function adminGetStats(token) {
  return request('/api/admin/stats', { token })
}
