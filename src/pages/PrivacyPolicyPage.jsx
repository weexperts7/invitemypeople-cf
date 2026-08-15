import LegalPageLayout from '../components/LegalPageLayout'
import SEO from '../components/SEO'
import { ROUTES_SEO } from '../data/routesSeo'

const SECTIONS = [
  {
    heading: 'Information We Collect',
    blocks: [
      'When you use our platform to create digital invitations or manage guest lists, we may collect the following types of information:',
      {
        items: [
          {
            lead: 'Personal Information:',
            text: 'Name, email address, phone number, and payment details (processed securely via Razorpay) when you create an account or purchase an invitation package.',
          },
          {
            lead: 'Event & Guest Data:',
            text: 'Event titles, dates, venue locations, host details, and guest RSVP submissions (including names, attendance statuses, headcounts, song requests, and wishes) stored securely in our database.',
          },
          {
            lead: 'Automatically Collected Data:',
            text: 'Browser type, IP address, device information, and usage analytics collected via tools like Google Analytics and Microsoft Clarity to help us improve user experience.',
          },
        ],
      },
    ],
  },
  {
    heading: 'How We Use Your Information',
    blocks: [
      'We use the information we collect in various ways, including to:',
      {
        items: [
          'Provide, operate, and maintain our digital invitation builder and hosting services.',
          'Process your transactions securely and send order confirmations.',
          'Send automated event reminders, host summaries, and RSVP notifications (such as the 4-hour pre-event guest list summary sent to the main host).',
          'Analyze website traffic and user behavior to optimize our templates and features.',
        ],
      },
    ],
  },
  {
    heading: 'How We Protect Your Information',
    blocks: [
      'We implement robust security measures—including encrypted database storage via Supabase and secure payment gateways—to protect your personal information and event data against unauthorized access, alteration, or disclosure.',
    ],
  },
  {
    heading: 'Contact Us',
    blocks: [
      'If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at hello@invitemypeople.com.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO {...ROUTES_SEO['/privacy']} path="/privacy" />
      <LegalPageLayout
        title="Privacy Policy"
        updated="August 2026"
        intro={[
          'At InviteMyPeople, accessible from invitemypeople.com, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by InviteMyPeople and how we use it.',
          "InviteMyPeople is a digital wedding invitation maker and guest management platform, used by hosts planning weddings, a Guruji Satsang invite online, Ganesh Chaturthi celebrations and more across India. This policy applies to everyone who uses our site — whether you're browsing templates, building your own invitation in our wedding website builder, or submitting an RSVP through another host's interactive RSVP tracking link.",
        ]}
        sections={SECTIONS}
      />
    </>
  )
}
