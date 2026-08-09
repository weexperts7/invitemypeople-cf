import LegalPageLayout from '../components/LegalPageLayout'
import SEO from '../components/SEO'
import { ROUTES_SEO } from '../data/routesSeo'

const SECTIONS = [
  {
    heading: 'Our Policy',
    blocks: [
      'Because our platform provides instant, digital, self-service software generation—where unique interactive invitation links and database slots are deployed immediately upon successful payment—our refund policy is structured as follows: Once an invitation has been successfully paid for, generated, and published to a unique link (e.g., invitemypeople.com/i/your-slug), the service is considered fully rendered and consumed. Consequently, digital purchases and custom invitation fees are generally non-refundable.',
    ],
  },
  {
    heading: 'Exceptions',
    blocks: [
      'We want you to be completely satisfied with your experience. A refund may be considered under the following exceptional circumstances:',
      {
        items: [
          {
            lead: 'Technical Failure:',
            text: 'If a system error or proven technical glitch on our end entirely prevented the generation of your invitation link after a successful payment transaction.',
          },
          {
            lead: 'Duplicate Charges:',
            text: 'In the event of an accidental double charge processed by our payment gateway (Razorpay), the duplicate amount will be fully refunded to your original payment method.',
          },
        ],
      },
    ],
  },
  {
    heading: 'Requesting a Refund',
    blocks: [
      'If you experience any technical difficulties during your invitation creation or believe you qualify for an exception under our policy, please reach out to us immediately at support@invitemypeople.com with your payment transaction ID and event details. We are always happy to help resolve issues promptly! We aim to respond to every refund request within a few business days, and we will keep you updated by email throughout the process.',
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <>
      <SEO {...ROUTES_SEO['/refund']} path="/refund" />
      <LegalPageLayout
        title="Refund & Cancellation Policy"
        updated="August 2026"
        intro={[
          'Thank you for choosing InviteMyPeople for your special celebrations.',
          "This policy covers every paid purchase made through InviteMyPeople's Invitation Builder — whether you're generating a digital wedding invitation, a Guruji Satsang invite online, or a Ganesh Chaturthi invitation — along with any add-on purchased alongside it. Because our platform is a digital wedding invitation maker that deploys your invitation to its own unique, live link the instant payment succeeds, complete with interactive RSVP tracking already switched on, please read this policy carefully before checkout so you know exactly what to expect once your invitation goes live.",
        ]}
        sections={SECTIONS}
      />
    </>
  )
}
