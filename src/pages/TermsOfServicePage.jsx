import LegalPageLayout from '../components/LegalPageLayout'
import SEO from '../components/SEO'
import { ROUTES_SEO } from '../data/routesSeo'

const SECTIONS = [
  {
    heading: 'Using Our Platform',
    blocks: [
      {
        items: [
          'You must be at least 18 years old or possess legal parental or guardian consent to use this platform and make purchases.',
          'You agree to provide accurate, current, and complete information during the invitation creation and checkout process.',
          'You are solely responsible for the content, text, images, and media you upload or display through your customized digital invitations.',
        ],
      },
    ],
  },
  {
    heading: 'Intellectual Property',
    blocks: [
      'Unless otherwise stated, InviteMyPeople and/or its licensors own the intellectual property rights for all templates, designs, graphics, and source code on the website. All intellectual property rights are reserved. You may not copy, redistribute, or resell our core template designs without explicit written permission.',
    ],
  },
  {
    heading: 'Service Availability',
    blocks: [
      'InviteMyPeople provides digital invitation hosting and guest management services on an "as is" basis. While we strive for 99.9% uptime and reliable automated delivery (including WhatsApp links and pre-event emails), we are not liable for any third-party service interruptions (such as payment gateway downtimes or mobile network delivery failures).',
    ],
  },
  {
    heading: 'Changes to These Terms',
    blocks: [
      'We reserve the right to amend these terms at any time. By continuing to use the platform after changes are posted, you agree to be bound by the updated terms.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <>
      <SEO {...ROUTES_SEO['/terms']} path="/terms" />
      <LegalPageLayout
        title="Terms & Conditions"
        updated="August 2026"
        intro={[
          'Welcome to InviteMyPeople!',
          "These terms and conditions outline the rules and regulations for the use of InviteMyPeople's Website, located at https://invitemypeople.com. By accessing this website and utilizing our self-service invitation builder, you accept these terms and conditions. Do not continue to use InviteMyPeople if you do not agree to all of the terms stated on this page.",
        ]}
        sections={SECTIONS}
      />
    </>
  )
}
