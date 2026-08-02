import { Cake, Gem, Baby, Home, Briefcase, PartyPopper } from 'lucide-react'
import { COMING_SOON_ROUTES } from './routesSeo'

const ICONS = {
  birthdays: Cake,
  engagements: Gem,
  'baby-showers': Baby,
  housewarmings: Home,
  'corporate-events': Briefcase,
  anniversaries: PartyPopper,
}

const TAGLINES = {
  birthdays: 'Playful, festive invites for every milestone birthday.',
  engagements: 'Elegant invites to celebrate the promise before the big day.',
  'baby-showers': 'Sweet, joyful invites to welcome the newest arrival.',
  housewarmings: 'Warm, welcoming invites for your Griha Pravesh.',
  'corporate-events': 'Polished, professional invites for launches, offsites & galas.',
  anniversaries: 'Timeless invites to celebrate every year together.',
}

// Pairs each "coming soon" route's shared SEO copy (routesSeo.js) with the
// icon + short tagline used for on-page display (roadmap badges, the
// ComingSoonPage hero) — kept separate from routesSeo.js so that file stays
// free of React/lucide imports and safe for the Node server to import.
export const COMING_SOON_OCCASIONS = COMING_SOON_ROUTES.map((route) => ({
  ...route,
  icon: ICONS[route.slug],
  tagline: TAGLINES[route.slug],
}))
