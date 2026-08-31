import type { RoyalPlumTemplateData } from './types'

/**
 * Realistic mock dataset for local preview/dev and for Storybook-style
 * usage. Not imported by the production build path — safe to delete
 * without affecting `RoyalPlumTemplate`, which has its own internal
 * fallback defaults.
 */
export const royalPlumMockData: RoyalPlumTemplateData = {
  couple: {
    brideName: 'Ananya',
    groomName: 'Vivaan',
    caricatureUrl: '/images/couples/royal-plum-caricature.webp',
    caricatureAlt: 'Illustrated caricature of Ananya and Vivaan in royal sherwani and lehenga',
  },
  parents: {
    brideParents: 'Mr. Rajesh & Mrs. Sunita Malhotra',
    groomParents: 'Mr. Arvind & Mrs. Kavita Rathore',
  },
  weddingDateISO: '2026-12-12T18:30:00+05:30',
  teaserLine: 'A SPECIAL DAY AWAITS',
  events: [
    {
      id: 'haldi',
      name: 'Haldi Ceremony',
      timing: 'Begins 9:00 AM',
      dateLabel: 'Thu, 10th Dec 2026',
      venue: {
        name: 'Rathore Family Residence',
        address: '14 Aravalli Marg, Jodhpur, Rajasthan',
      },
      specialNote: 'Wear yellow — bring your best dance moves!',
    },
    {
      id: 'sangeet',
      name: 'Sangeet Night',
      timing: 'Muhurat begins 7:00 PM',
      dateLabel: 'Fri, 11th Dec 2026',
      venue: {
        name: 'Umaid Bhawan Lawns',
        address: 'Circuit House Rd, Jodhpur, Rajasthan',
      },
      specialNote: 'Indo-western attire. Dinner served 9 PM onward.',
    },
    {
      id: 'pheras',
      name: 'Wedding Pheras',
      timing: 'Auspicious muhurat begins 6:30 PM',
      dateLabel: 'Sat, 12th Dec 2026',
      venue: {
        name: 'The Leela Palace',
        address: 'Kaiser Bagh, Jodhpur, Rajasthan',
        mapUrl: 'https://maps.google.com/?q=The+Leela+Palace+Jodhpur',
      },
      specialNote: 'Traditional attire in gold and maroon requested.',
    },
  ],
  gratitudeMessage:
    'Thank you for being a part of our special journey. Your love, blessings, and presence mean the world to us as we begin this new chapter together.',
  whatsapp: {
    message:
      'You are lovingly invited to the wedding of Ananya & Vivaan! 💛 Join us as we begin our forever. {link}',
  },
  shareUrl: 'https://www.invitemypeople.com/i/ananya-vivaan',
  invitationSlug: 'ananya-vivaan',
}

export default royalPlumMockData
