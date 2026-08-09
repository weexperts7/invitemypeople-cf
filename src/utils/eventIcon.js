import { Flower, Heart, Music, PartyPopper, Sparkle } from 'lucide-react'

// Picks an icon by keyword in an event's own title — shared by every place
// that turns a buyer-submitted event list (main + "Additional Events", see
// builder/EventsListEditor.jsx) into an icon-bearing timeline entry, so the
// live preview (builder/LiveInvitePreview.jsx) and the real generated page
// (GeneratedInvitePage.jsx) pick the same icon for the same title.
export function iconForEventTitle(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('haldi')) return Flower
  if (t.includes('sangeet') || t.includes('dance')) return Music
  if (t.includes('mehndi') || t.includes('mehendi')) return Sparkle
  if (t.includes('reception') || t.includes('party')) return PartyPopper
  return Heart
}
