import RoyalPeacockExperience from './royal-peacock/RoyalPeacockExperience'
import SaffronLotusExperience from './saffron-lotus/SaffronLotusExperience'
import GoldenTempleAltarExperience from './golden-temple-altar/GoldenTempleAltarExperience'
import ShukranaDarshanAdapter from './shukrana-darshan/ShukranaDarshanAdapter'

// Maps a Satsang template's optional `layout` field (see
// src/data/satsangTemplatesData.js) to its bespoke experience component.
// Templates without a `layout` fall back to LegacySatsangExperience — see
// SatsangExperience.jsx, the dispatcher that consumes this registry.
export const SATSANG_LAYOUTS = {
  'royal-peacock': RoyalPeacockExperience,
  'saffron-lotus-serenity': SaffronLotusExperience,
  'golden-temple-altar': GoldenTempleAltarExperience,
  'shukrana-darshan': ShukranaDarshanAdapter,
}

export function getSatsangLayoutComponent(layout) {
  return (layout && SATSANG_LAYOUTS[layout]) || null
}
