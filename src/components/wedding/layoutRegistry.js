import RoyalPlumCurtainAdapter from './royal-plum-curtain/RoyalPlumCurtainAdapter'
import MahoganySealAdapter from './mahogany-seal/MahoganySealAdapter'
import VelvetTheatreAdapter from './velvet-theatre/VelvetTheatreAdapter'

// Maps a wedding template's optional `layout` field (see
// src/data/templatesData.js) to its bespoke experience component.
// Templates without a `layout` render through the shared
// InvitationExperience body, same as every wedding template today — see
// InvitationExperience.jsx's dispatch, and mirrors
// ganesh/layoutRegistry.js + satsang/layoutRegistry.js's identical role for
// those two categories.
export const WEDDING_LAYOUTS = {
  'royal-plum-curtain': RoyalPlumCurtainAdapter,
  'mahogany-seal': MahoganySealAdapter,
  'velvet-theatre': VelvetTheatreAdapter,
}

export function getWeddingLayoutComponent(layout) {
  return (layout && WEDDING_LAYOUTS[layout]) || null
}
