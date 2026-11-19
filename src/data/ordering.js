// Which templates can be ordered right now. Ganesh Chaturthi invitations are
// fully designed but not on sale yet, so every public order for one is refused:
// the builder hides the occasion, and the order and invite endpoints check this
// too, so a hand-built request cannot get around the page.
//
// To open Ganesh Chaturthi for sale, remove it from CLOSED_OCCASIONS (and
// `disabled: true` on its entry in builderTemplates.js, and the "Notify me"
// button in GaneshExperience.jsx).
//
// Plain data only, so the Node server and Cloudflare Functions can import it.
export const CLOSED_OCCASIONS = ['ganesh-chaturthi']

// Builder template ids start with their occasion ("ganesh-marigold-mandap").
export function isOrderingOpen({ templateId, occasion } = {}) {
  const key = String(templateId ?? '')
  const occ = String(occasion ?? '')
  return !CLOSED_OCCASIONS.some((closed) => occ === closed || key === closed || key.startsWith(`${closed.split('-')[0]}-`))
}

export const ORDERING_CLOSED_MESSAGE = 'Ganesh Chaturthi invitations are launching soon and cannot be ordered yet.'
