// Talks to the Super Admin Template Price Management API (see
// api/_lib/templatePrices.js) — mirrors partnerApi.js's request() shape
// (optional bearer token) since, like that file, this has both a public
// call (getTemplatePrices, no token) and admin-only calls (the two
// mutations, which need the Supabase Auth session token).
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

// Public, unauthenticated — every template price *override* currently set.
// Templates without one aren't listed; callers fall back to
// getActivePrice() (../data/sale.js) for those, exactly preserving the
// existing global sale-aware price for anything an admin hasn't touched.
// Used by CreateInvitePage.jsx (to show/charge the right price) and by
// AdminPricingPage.jsx (to show current overrides before editing).
export async function getTemplatePrices() {
  const result = await request('/api/template-prices')
  return result.prices
}

// Admin only. Sets (or replaces) one template's price override.
export function setTemplatePrice(token, { templateKey, name, price }) {
  return request('/api/admin/template-prices', { method: 'POST', token, body: { templateKey, name, price } })
}

// Admin only. Clears a template's override, reverting it to the default
// dynamic price.
export function resetTemplatePrice(token, templateKey) {
  return request('/api/admin/template-prices/reset', { method: 'POST', token, body: { templateKey } })
}
