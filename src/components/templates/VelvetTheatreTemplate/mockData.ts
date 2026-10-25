import type { VelvetTheatreTemplateData } from './types'

export const velvetTheatreMockData: VelvetTheatreTemplateData = {
  couple: { firstName: 'Meera', secondName: 'Aarav' },
  greetingLine: 'Shubh Vivah',
  invitationLine:
    'We would love for you to celebrate with us the most special day of our lives. It would be an honour to have you present at this moment.',
  families: [
    { name: 'Meera Kapoor', parents: 'Daughter of Mr. Vikram & Mrs. Nandini Kapoor' },
    { name: 'Aarav Mehta', parents: 'Son of Mr. Sanjay & Mrs. Ritu Mehta' },
  ],
  weddingDateISO: '2027-02-14T18:30:00',
  events: [
    {
      id: 'mehendi',
      name: 'Mehendi',
      dateLabel: 'Friday, 12 February 2027',
      timing: '4:00 PM',
      venue: { name: 'Kapoor Residence', address: 'Civil Lines, Jaipur' },
    },
    {
      id: 'sangeet',
      name: 'Sangeet Night',
      dateLabel: 'Saturday, 13 February 2027',
      timing: '7:30 PM',
      venue: { name: 'The Rambagh Palace Lawns', address: 'Bhawani Singh Road, Jaipur' },
    },
    {
      id: 'wedding',
      name: 'The Wedding',
      dateLabel: 'Sunday, 14 February 2027',
      timing: '6:30 PM',
      venue: { name: 'The Rambagh Palace', address: 'Bhawani Singh Road, Jaipur' },
    },
  ],
  photos: ['/images/couples/hindu-2.jpg', '/images/couples/hindu-3.jpg'],
  thankYouMessage:
    'For being part of our story. Your presence is the most beautiful gift we could ever receive.',
  whatsappMessage: "You're invited to our wedding! Take your seat — the curtains are about to rise 🎭 {link}",
}
