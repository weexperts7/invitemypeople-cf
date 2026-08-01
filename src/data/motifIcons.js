// Shared motif -> lucide icon lookup, kept in one place so every component
// that needs a small glyph standing in for a template's theme (the envelope
// wax seal, WelcomeSplash's floating corner ornaments, frame fallbacks)
// stays in sync instead of drifting into per-component copies.
import { Flower2, Gem, Landmark, Sparkle, Heart, Diamond, Crown, Feather } from 'lucide-react'

export const MOTIF_ICONS = {
  jharokha: Landmark,
  'swastik-mandala': Gem,
  'lotus-peacock': Flower2,
  'floral-line-art': Heart,
  'temple-gold': Landmark,
  phulkari: Sparkle,
  'mughal-jaali': Landmark,
  alpona: Flower2,
  'art-deco': Diamond,
  'heraldic-crest': Crown,
  'peacock-feather': Feather,
  'saffron-lotus': Flower2,
}

export function getMotifIcon(motif) {
  return MOTIF_ICONS[motif] ?? Flower2
}
