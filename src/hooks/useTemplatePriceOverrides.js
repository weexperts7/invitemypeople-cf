import { useEffect, useState } from 'react'
import { getTemplatePrices } from '../utils/templatePriceApi'

// Every template price *override* an admin has set (see
// api/_lib/templatePrices.js), as a sparse { [builderTemplateId]: price }
// map — templates without one aren't keys here, so callers should always
// fall back to getActivePrice() (../data/sale.js) for a miss, exactly
// preserving the existing global sale-aware price for anything an admin
// hasn't touched.
//
// Shared by every place on the site that shows a per-template price outside
// the checkout flow itself (CreateInvitePage.jsx does its own equivalent
// fetch inline, since it only ever needs ONE template's price at a time):
// TemplateCard.jsx (template galleries — WeddingsPage.jsx, LandingPage.jsx)
// and the "Create Your Own" CTA in InvitationExperience.jsx/
// SatsangExperience.jsx/GaneshExperience.jsx. A page rendering many cards
// (WeddingsPage.jsx's whole grid, say) used to end up with one HTTP call per
// card, all for the exact same payload — inFlight below dedupes concurrent
// mounts onto a single request. It's cleared the moment that request
// settles (not kept as a resolved-value cache), so this only collapses
// calls that genuinely overlap in time; a later, separate page visit still
// fetches fresh, preserving the original "a price an admin just changed
// shows up on the very next mount" guarantee.
let inFlight = null

function fetchTemplatePricesOnce() {
  if (!inFlight) {
    inFlight = getTemplatePrices().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}

export function useTemplatePriceOverrides() {
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    let cancelled = false
    fetchTemplatePricesOnce()
      .then((rows) => {
        if (cancelled) return
        setOverrides(Object.fromEntries(rows.map((row) => [row.templateKey, row.price])))
      })
      .catch((err) => console.error('[useTemplatePriceOverrides] failed to load:', err))
    return () => {
      cancelled = true
    }
  }, [])

  return overrides
}
