// Time-boxed "Launch Special" sale config — the single source of truth for
// the ₹2,100 introductory price (10 days from SALE_START). Imported by:
//  - the client: SaleBanner.jsx (the homepage announcement bar),
//    TemplateCard.jsx, InvitationExperience.jsx/SatsangExperience.jsx/
//    GaneshExperience.jsx's "Create Your Own" CTA, LandingPage.jsx's
//    comparison table + FAQ, and CreateInvitePage.jsx/PaymentModal.jsx's
//    checkout amount
//  - the server: api/create-order.js and server/index.js's own
//    /api/create-order route, which re-derive the same window/price here
//    rather than trusting whatever `amount` a request happens to send — so
//    the sale price can never be charged outside its own 10-day window (or
//    undercut by a tampered client), no matter what the banner or checkout
//    UI currently show.
//
// Plain data + date math only — no React/lucide/env imports — so this is
// safe to import from Node server code the same way blogPosts.js already
// is (see that file's own comment for the same import-safety rule).
// Imports from ./pricing (not ./templatesData) specifically to avoid
// pulling templatesData.js's lucide-react icon imports into the server
// bundle — see pricing.js's own comment.
import { PRICING } from './pricing.js'

export const SALE_PRICE = 2100

// The window is always exactly SALE_DURATION_DAYS after SALE_START, so
// rescheduling the sale is a one-line change to SALE_START — nothing else
// below needs updating.
export const SALE_START = '2026-08-09T00:00:00+05:30'
const SALE_DURATION_DAYS = 10
export const SALE_END = new Date(
  new Date(SALE_START).getTime() + SALE_DURATION_DAYS * 24 * 60 * 60 * 1000,
).toISOString()

// Manual kill switch — flip to false to end the sale immediately (banner
// disappears, checkout and every price display revert to the standing
// launch price) without touching the dates above.
export const SALE_ENABLED = true

export function isSaleActive(now = new Date()) {
  if (!SALE_ENABLED) return false
  const t = now.getTime()
  return t >= new Date(SALE_START).getTime() && t < new Date(SALE_END).getTime()
}

// The price actually charged right now: the sale price during the window,
// PRICING.shagunPrice (the standing launch price) once it closes. Every
// price shown anywhere on the site should read from this, never from
// SALE_PRICE directly, so nothing keeps advertising the sale price after it
// ends.
export function getActivePrice(now = new Date()) {
  return isSaleActive(now) ? SALE_PRICE : PRICING.shagunPrice
}

// Rounded whole-percent savings vs the non-discounted PRICING.price, for
// copy like "Save 56%" — computed rather than hand-typed so it can never
// drift out of sync with SALE_PRICE.
export function getSavingsPercent(now = new Date()) {
  const active = getActivePrice(now)
  return Math.round(((PRICING.price - active) / PRICING.price) * 100)
}

export function millisUntilSaleEnds(now = new Date()) {
  return new Date(SALE_END).getTime() - now.getTime()
}
