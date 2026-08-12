// B2B partner credit packages — bundles of invite-creation credits a
// partner buys up front, then spends one at a time creating invites for
// their own clients instead of paying per invite through the consumer
// checkout (see src/data/sale.js for that flow).
//
// PLACEHOLDER PRICING: these three tiers exist so the purchase flow
// (PartnerCreditsPage.jsx → POST /api/partners/purchase/create-order →
// Razorpay Checkout → POST /api/partners/purchase/verify) has something
// real to buy end-to-end. Swap in the actual tiers/pricing here once
// they're decided — nothing else needs to change: both the server (re-
// derives the charge from `id`, exactly like getActivePrice() in sale.js —
// never trusts a client-sent amount) and the client import this one list,
// and every purchase snapshots its own price/credits into
// partner_credit_transactions at the time it's made, so changing a tier
// here never rewrites past purchases' history.
export const PARTNER_PACKAGES = [
  { id: 'starter-10', label: 'Starter', credits: 10, pricePaise: 900000 }, // ₹9,000 — placeholder
  { id: 'growth-50', label: 'Growth', credits: 50, pricePaise: 4000000 }, // ₹40,000 — placeholder
  { id: 'scale-100', label: 'Scale', credits: 100, pricePaise: 7500000 }, // ₹75,000 — placeholder
]

export function getPartnerPackageById(id) {
  return PARTNER_PACKAGES.find((p) => p.id === id) || null
}
