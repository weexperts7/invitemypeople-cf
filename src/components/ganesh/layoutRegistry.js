import MarigoldMandapExperience from './marigold-mandap/MarigoldMandapExperience'
import GoldenTrunkBlessingExperience from './golden-trunk-blessing/GoldenTrunkBlessingExperience'
import RoyalDurbarDarshanExperience from './royal-durbar-darshan/RoyalDurbarDarshanExperience'
import DivineThresholdExperience from './divine-threshold/DivineThresholdExperience'

// Maps a Ganesh Chaturthi template's optional `layout` field (see
// src/data/ganeshTemplatesData.js) to its bespoke experience component.
// Templates without a `layout` fall back to LegacyGaneshExperience — see
// GaneshExperience.jsx, the dispatcher that consumes this registry. Mirrors
// satsang/layoutRegistry.js's role for the Satsang category.
export const GANESH_LAYOUTS = {
  'marigold-mandap': MarigoldMandapExperience,
  'golden-trunk-blessing': GoldenTrunkBlessingExperience,
  'royal-durbar-darshan': RoyalDurbarDarshanExperience,
  'divine-threshold': DivineThresholdExperience,
}

export function getGaneshLayoutComponent(layout) {
  return (layout && GANESH_LAYOUTS[layout]) || null
}
