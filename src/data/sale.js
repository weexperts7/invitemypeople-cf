// Time-boxed "Launch Special" sale config — the single source of truth for
// the ₹2,399 introductory price (25 days from SALE_START). Imported by:
//  - the client: SaleBanner.jsx (the homepage announcement bar),
//    TemplateCard.jsx, InvitationExperience.jsx/SatsangExperience.jsx/
//    GaneshExperience.jsx's "Create Your Own" CTA, LandingPage.jsx's
//    comparison table + FAQ, and CreateInvitePage.jsx/PaymentModal.jsx's
//    checkout amount
//  - the server: api/create-order.js and server/index.js's own
//    /api/create-order route, which re-derive the same window/price here
//    rather than trusting whatever `amount` a request happens to send — so
//    the sale price can never be charged outside its own 25-day window (or
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

export const SALE_PRICE = 2399

// The window is always exactly SALE_DURATION_DAYS after SALE_START, so
// rescheduling the sale is a one-line change to SALE_START — nothing else
// below needs updating.
export const SALE_START = '2026-08-09T00:00:00+05:30'
// Was 17 days, then extended by 8 more to 25 (end-of-sale Sep 3), and now
// by another 7 to 32 — still counted from the same SALE_START, so the
// original Aug 9 start date is untouched — new end-of-sale is Sep 10
// instead of Sep 3.
const SALE_DURATION_DAYS = 32
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

// Guruji Satsang's own price for the sangat, shown against SATSANG_LIST_PRICE.
// Keyed off the builder id's `satsang-` prefix rather than a list of templates
// so each new Satsang template picks it up, and so server code can use it
// without importing the template catalog (see pricing.js's import-safety rule).
export const SATSANG_PRICE = 799
export const SATSANG_LIST_PRICE = 2399

const isSatsangTemplate = (templateKey) => String(templateKey ?? '').startsWith('satsang-')

// What a template costs when no admin has set its own price — see
// api/_lib/templatePrices.js, which falls back to this at checkout. Use this,
// not getActivePrice(), anywhere the template is known.
export function getDefaultPrice(templateKey, now = new Date()) {
  return isSatsangTemplate(templateKey) ? SATSANG_PRICE : getActivePrice(now)
}

// The struck-through price shown beside a template's real one, if it has its
// own. Every other template's depends on the sale, so callers handle those.
export function getListPrice(templateKey) {
  return isSatsangTemplate(templateKey) ? SATSANG_LIST_PRICE : null
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
