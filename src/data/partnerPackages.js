// B2B partner credit packages — bundles of invite-creation credits a
// partner buys up front, then spends one at a time creating invites for
// their own clients instead of paying per invite through the consumer
// checkout (see src/data/sale.js for that flow).
//
// These three tiers exist so the purchase flow (PartnerCreditsPage.jsx →
// POST /api/partners/purchase/create-order → Razorpay Checkout →
// POST /api/partners/purchase/verify) has something real to buy
// end-to-end. Both the server (re-derives the charge from `id`, exactly
// like getActivePrice() in sale.js — never trusts a client-sent amount)
// and the client import this one list, and every purchase snapshots its
// own price/credits into partner_credit_transactions at the time it's
// made, so changing a tier here never rewrites past purchases' history.
export const PARTNER_PACKAGES = [
  { id: 'starter-5', label: 'Starter', credits: 5, pricePaise: 700000 }, // ₹7,000
  { id: 'growth-15', label: 'Growth', credits: 15, pricePaise: 1800000 }, // ₹18,000
  { id: 'scale-30', label: 'Scale', credits: 30, pricePaise: 3000000 }, // ₹30,000
]

export function getPartnerPackageById(id) {
  return PARTNER_PACKAGES.find((p) => p.id === id) || null
}
