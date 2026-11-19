// The price a template is actually sold at, for copy, meta descriptions and
// structured data. A Super Admin can set a per-template price (see
// api/_lib/templatePrices.js); that override wins, and everything else falls
// back to the standing price, the same order the checkout uses. Pass the
// overrides as a { [builderTemplateId]: price } map ("wedding-rang-mahal",
// "satsang-gulab-marg"). With no overrides it returns the defaults.
//
// Plain data and arithmetic only: safe for Node, the Cloudflare function and
// the browser.
import { TEMPLATES } from './templatesData.js'
import { SATSANG_TEMPLATES } from './satsangTemplatesData.js'
import { PRICING } from './pricing.js'
import { SATSANG_PRICE, SATSANG_LIST_PRICE, getActivePrice } from './sale.js'

// Same convention as data/builderTemplates.js: wedding-<id>, satsang-<slug>.
export const priceKey = (kind, id) => `${kind}-${id}`

// { price, list }: `list` is the struck-through regular price, only when it is
// really higher than the price. null for a kind that is not for sale yet.
export function effectivePrice(kind, template, overrides = {}) {
  const id = template.id ?? template.slug
  // Fixed-price flagship: arranged on WhatsApp, so no builder override exists.
  if (kind === 'wedding' && template.salePrice) {
    return { price: template.salePrice, list: template.originalPrice > template.salePrice ? template.originalPrice : null }
  }
  const override = Number(overrides[priceKey(kind, id)])
  const price = Number.isFinite(override) && override > 0 ? override : null
  if (kind === 'satsang') {
    const actual = price ?? SATSANG_PRICE
    return { price: actual, list: SATSANG_LIST_PRICE > actual ? SATSANG_LIST_PRICE : null }
  }
  if (kind === 'wedding') {
    const actual = price ?? getActivePrice()
    return { price: actual, list: PRICING.price > actual ? PRICING.price : null }
  }
  return null
}

const selfServe = (kind) =>
  kind === 'satsang'
    ? SATSANG_TEMPLATES.filter((t) => t.fullExperience)
    : TEMPLATES.filter((t) => !t.hidden && !t.hasOwnCreateCta)

// The spread of prices across a kind's self-serve templates, so one sentence
// can say "₹2,399" when they match and a range when an admin has changed some.
export function priceSummary(kind, overrides = {}) {
  const prices = selfServe(kind).map((t) => effectivePrice(kind, t, overrides).price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const regular = kind === 'satsang' ? SATSANG_LIST_PRICE : PRICING.price
  return { min, max, same: min === max, regular: regular > max ? regular : null }
}

// The cheapest price a visitor can pay for any template, for "From ₹X" copy.
export function lowestPrice(overrides = {}) {
  const all = [
    ...TEMPLATES.filter((t) => !t.hidden).map((t) => effectivePrice('wedding', t, overrides).price),
    ...SATSANG_TEMPLATES.filter((t) => t.fullExperience).map((t) => effectivePrice('satsang', t, overrides).price),
  ]
  return Math.min(...all)
}
