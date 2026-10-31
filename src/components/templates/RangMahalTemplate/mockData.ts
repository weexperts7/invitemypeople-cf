import type { RangMahalTemplateData } from './types'

export const rangMahalMockData: RangMahalTemplateData = {
  couple: { firstName: 'Ishita', secondName: 'Advait' },
  greetingLine: 'With the blessings of our families',
  invitationLine:
    'Two families, one celebration. We would be honoured to have you beside us as we begin our forever.',
  families: [
    { name: 'Ishita Rathore', parents: 'Daughter of Mrs. Kavya & Mr. Devendra Rathore' },
    { name: 'Advait Bhandari', parents: 'Son of Mrs. Meenal & Mr. Harsh Bhandari' },
  ],
  weddingDateISO: '2027-01-24T19:00:00',
  events: [
    {
      id: 'mehendi',
      name: 'Mehendi',
      dateLabel: 'Friday, 22 January 2027',
      timing: '3:00 PM',
      venue: { name: 'Rathore Haveli', address: 'Old City, Udaipur' },
    },
    {
      id: 'sangeet',
      name: 'Sangeet',
      dateLabel: 'Saturday, 23 January 2027',
      timing: '8:00 PM',
      venue: { name: 'The Lake Pavilion', address: 'Pichola, Udaipur' },
    },
    {
      id: 'wedding',
      name: 'Wedding Ceremony',
      dateLabel: 'Sunday, 24 January 2027',
      timing: '7:00 PM',
      venue: { name: 'The Palace Courtyard', address: 'Udaipur, Rajasthan' },
    },
  ],
  photos: ['/images/couples/hindu-2.jpg', '/images/couples/hindu-3.jpg'],
  hashtag: '',
  thankYouMessage: 'Your love and blessings are the greatest gift we could ask for.',
  whatsappMessage: "You're invited to our wedding! Open the card and pull the latkan 🪔 {link}",
}
