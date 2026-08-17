import { Heart, Mail, MessageCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { SITE_URL } from '../data/routesSeo'

const WHATSAPP_NUMBER = '918847044554'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Share-intent URLs for the "Share This Page" row below — distinct from
// getWhatsAppLink above, which opens a chat *with us* (an inquiry).
// These instead let a visitor share whatever page they're currently on
// out to their own network. WhatsApp intentionally uses the standalone
// api.whatsapp.com/send endpoint (not wa.me, and no phone number) — the
// generic "share to any contact" intent, not a chat with a specific
// number.
function getWhatsAppShareLink(text) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}
function getTwitterShareLink(text, url) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}
function getLinkedInShareLink(url) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
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

// Kept defined but unreferenced while the YouTube link is hidden from
// SOCIAL_LINKS below (for now) — one-line re-enable when it comes back.
// eslint-disable-next-line no-unused-vars
function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  )
}

// X (Twitter) and LinkedIn's real logo marks are filled shapes, not
// stroke-based line icons like Instagram/Facebook/YouTube above — kept
// as their actual brand glyphs (via `fill="currentColor"`) rather than
// forcing a stroke-style redraw, so they stay instantly recognizable.
// Still sized identically to every other icon here via `className`.
function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/invitemypeople' },
  { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/invitemypeople' },
  // YouTube hidden for now — re-add when the channel's ready to link to.
  // { icon: YoutubeIcon, label: 'YouTube', href: 'https://youtube.com/@invitemypeople' },
]

const SHARE_TEXT = 'Check out InviteMyPeople — beautifully interactive digital wedding invitations, with more celebrations launching soon.'

// Site-wide footer, shared across every page (Home, About, category pages)
// so quick links and contact info are one edit, not duplicated per page.
export default function SiteFooter() {
  // Shares whatever page the visitor is actually on (a specific wedding
  // template, a host's own generated invite, the homepage, ...) rather
  // than always pointing back at "/" — same SITE_URL every canonical/OG
  // tag on the site already reads from (see routesSeo.js), so this never
  // drifts onto the redirecting apex domain the way a hand-typed URL
  // could.
  const shareUrl = `${SITE_URL}${useLocation().pathname}`
  const SHARE_LINKS = [
    { icon: MessageCircle, label: 'Share on WhatsApp', href: getWhatsAppShareLink(`${SHARE_TEXT} ${shareUrl}`) },
    { icon: XIcon, label: 'Share on X', href: getTwitterShareLink(SHARE_TEXT, shareUrl) },
    { icon: LinkedInIcon, label: 'Share on LinkedIn', href: getLinkedInShareLink(shareUrl) },
  ]

  return (
    <footer className="border-t border-champagne-deep/40 bg-ivory px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          <div>
            <Logo size="lg" className="mb-3" />
            <p className="text-sm text-ink-soft max-w-xs leading-relaxed">
              Beautifully interactive digital invitations for every
              celebration — designed to feel as personal as the moment
              itself.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="mailto:hello@invitemypeople.com"
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
              {/* Both point at the "launching soon" landing pages, not the
                  real live /guruji-satsangs and /templates/ganesh-chaturthi
                  routes — not advertised yet ahead of the ad campaign
                  launch (see routesSeo.js's COMING_SOON_ROUTES comment). */}
              <li>
                <Link to="/guruji-satsang-invites" className="text-ink-soft hover:text-rose transition-colors">
                  Guruji Satsang Invitations
                  <span className="ml-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-soft/60">Soon</span>
                </Link>
              </li>
              <li>
                <Link to="/ganesh-chaturthi-invites" className="text-ink-soft hover:text-rose transition-colors">
                  Ganesh Chaturthi Invitations
                  <span className="ml-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-soft/60">Soon</span>
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-ink-soft hover:text-rose transition-colors">
                  Build Your Invitation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-ink-soft hover:text-rose transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ink-soft hover:text-rose transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-ink-soft hover:text-rose transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@invitemypeople.com"
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
              Legal
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-ink-soft hover:text-rose transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-ink-soft hover:text-rose transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-ink-soft hover:text-rose transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Share This Page — distinct from "Follow Us" above (our own
            profiles); this lets a visitor share the page they're actually
            on out to their own network. Deliberately subtle: a small label
            plus icon-only buttons, sized and styled identically to the
            Follow Us row, sitting in its own thin border-topped strip
            rather than fighting the four-column grid for space. */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-champagne-deep/30 py-6 text-xs text-ink-soft">
          <span className="uppercase tracking-[0.2em]">Share This Page</span>
          <div className="flex items-center gap-3">
            {SHARE_LINKS.map((share) => {
              const Icon = share.icon
              return (
                <a
                  key={share.label}
                  href={share.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={share.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink-soft hover:text-rose hover:border-rose/50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
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
