import { Heart, Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

const WHATSAPP_NUMBER = '919877647707'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// lucide-react dropped brand/logo glyphs, so social icons are hand-drawn
// SVGs here, sized and stroked to match the surrounding lucide icons.
function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/invitemypeople' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/invitemypeople' },
  { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com/@invitemypeople' },
]

// Site-wide footer, shared across every page (Home, About, category pages)
// so quick links and contact info are one edit, not duplicated per page.
export default function SiteFooter() {
  return (
    <footer className="border-t border-champagne-deep/40 bg-ivory px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <Logo size="lg" className="mb-3" />
            <p className="text-sm text-ink-soft max-w-xs leading-relaxed">
              Beautifully interactive digital invitations for every
              celebration — designed to feel as personal as the moment
              itself.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="mailto:invitemypeople@gmail.com"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={getWhatsAppLink("Hi! I'd like to get started with my digital invitation.")}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/weddings" className="text-ink-soft hover:text-rose transition-colors">
                  Wedding Invitations
                </Link>
              </li>
              <li>
                <Link to="/guruji-satsangs" className="text-ink-soft hover:text-rose transition-colors">
                  Guruji Satsang Invitations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ink-soft hover:text-rose transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:invitemypeople@gmail.com"
                  className="text-ink-soft hover:text-rose transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-ink-soft hover:text-rose transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
              Follow Us
            </p>
            <ul className="space-y-2.5 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft hover:text-rose transition-colors"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-4">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-ink-soft hover:text-rose transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-ink-soft hover:text-rose transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-champagne-deep/30 pt-6 text-xs text-ink-soft">
          <p>&copy; {new Date().getFullYear()} InviteMyPeople. Crafted with love.</p>
          <p className="flex items-center gap-1.5">
            Made with love, by hand
            <Heart className="w-3.5 h-3.5 text-rose" fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  )
}
