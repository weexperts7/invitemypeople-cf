// Local fallback quotes for any Satsang "reveal a blessing" interaction, used
// when VITE_RSVP_ENDPOINT isn't configured or the live fetch fails — see
// src/hooks/useRandomBlessing.js. Kept as data so it's defined once instead
// of once per reveal component.
export const FALLBACK_BLESSINGS = [
  { text: "Where there is devotion, there is Guruji's grace.", author: null },
  { text: 'Surrender the mind, and peace follows on its own.', author: null },
  { text: 'A moment spent in satsang is worth a lifetime of seeking.', author: null },
  { text: "Guruji's blessings light the path even in the darkest hour.", author: null },
  { text: 'Faith is the bridge between your effort and His grace.', author: null },
  { text: 'Seva done with love reaches Guruji before words ever could.', author: null },
]
