// The base wedding-package price — split out from templatesData.js so it
// can be imported by server-side code (see ./sale.js, api/create-order.js
// and server/index.js) without pulling in templatesData.js's lucide-react
// icon imports along with it. Plain data only, no React/lucide/env imports
// — same import-safety rule blogPosts.js documents for itself.
//
// templatesData.js re-exports this below so every existing call site that
// already imports PRICING from there keeps working unchanged.
//
// Same price across every template today, so it's one shared constant
// rather than a per-template field — add per-template pricing later only
// if templates actually start to differ in price.
export const PRICING = { price: 2500, shagunPrice: 2100 }
