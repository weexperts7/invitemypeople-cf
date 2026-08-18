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
// (WeddingsPage.jsx's whole grid, say) ends up with one of these calls per
// card — deliberately not deduped behind a module-level cache, so a price
// an admin just changed always shows up on the very next mount instead of
// serving a stale value from earlier in the same browser session; the
// endpoint itself is a single small Supabase select, cheap enough that a
// handful of parallel calls on one page load is not worth the staleness
// tradeoff a shared cache would introduce.
export function useTemplatePriceOverrides() {
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    let cancelled = false
    getTemplatePrices()
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
