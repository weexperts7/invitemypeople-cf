import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, MessageCircle, ChevronDown, Heart, Sparkles, Wand2 } from 'lucide-react'
import Logo from './Logo'
import { FoldedHandsIcon } from './icons/FoldedHandsIcon'
import { GaneshIcon } from './icons/GaneshIcon'
import { COMING_SOON_OCCASIONS } from '../data/occasionsData'

const PRIMARY_LINKS = [{ to: '/', label: 'Home', end: true }]
const SECONDARY_LINKS = [{ to: '/about', label: 'About', end: false }]

// The "browse by occasion" list behind the Occasions menu — live categories
// first, then everything still on the roadmap (see occasionsData.js).
const LIVE_OCCASIONS = [
  { to: '/weddings', label: 'Weddings', icon: Heart },
  { to: '/guruji-satsangs', label: 'Guruji Satsangs', icon: FoldedHandsIcon },
  { to: '/templates/ganesh-chaturthi', label: 'Ganesh Chaturthi', icon: GaneshIcon },
]
const COMING_SOON_LINKS = COMING_SOON_OCCASIONS.map((o) => ({
  to: `/${o.slug}`,
  label: o.label,
  icon: o.icon,
}))
const ALL_OCCASION_PATHS = [...LIVE_OCCASIONS, ...COMING_SOON_LINKS].map((l) => l.to)

const WHATSAPP_NUMBER = '919877647707'
function getWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// A persistent nav bar across every page — now that sections have distinct
// URLs (see App.jsx), this is the only way most visitors will discover the
// other pages exist rather than only the one they landed on.
export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [occasionsOpen, setOccasionsOpen] = useState(false)
  const occasionsRef = useRef(null)
  const location = useLocation()

  const isOccasionActive = ALL_OCCASION_PATHS.includes(location.pathname)

  // Close the dropdown on an outside click, Escape, or whenever the route
  // changes (picking a link should always close it, even a same-path click).
  useEffect(() => {
    if (!occasionsOpen) return
    function handlePointerDown(e) {
      if (occasionsRef.current && !occasionsRef.current.contains(e.target)) {
        setOccasionsOpen(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOccasionsOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [occasionsOpen])

  const linkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-blush/70 text-rose' : 'text-ink-soft hover:text-rose'
    }`

  return (
    <header className="sticky top-0 z-[60] border-b border-white/60 bg-ivory/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" onClick={() => setOpen(false)} aria-label="InviteMyPeople home">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {PRIMARY_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          <div className="relative" ref={occasionsRef}>
            <button
              type="button"
              onClick={() => setOccasionsOpen((v) => !v)}
              aria-expanded={occasionsOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isOccasionActive ? 'bg-blush/70 text-rose' : 'text-ink-soft hover:text-rose'
              }`}
            >
              Occasions
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${occasionsOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {occasionsOpen && (
              <div className="absolute left-1/2 top-full mt-2 w-72 -translate-x-1/2 rounded-2xl border border-white/60 bg-ivory/95 p-2 shadow-card backdrop-blur-xl">
                {LIVE_OCCASIONS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOccasionsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-blush/40"
                  >
                    <link.icon className="w-4 h-4 text-rose" />
                    {link.label}
                  </NavLink>
                ))}

                <div className="my-2 border-t border-champagne-deep/30" />
                <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ink-soft/70">
                  Coming Soon
                </p>
                {COMING_SOON_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOccasionsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-champagne/40 hover:text-ink"
                  >
                    {link.icon ? (
                      <link.icon className="w-4 h-4 text-ink-soft/70" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-ink-soft/70" />
                    )}
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {SECONDARY_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          <Link
            to="/create"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-medium text-ink shadow-card transition-transform hover:scale-[1.03]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Create Invite
          </Link>

          <a
            href={getWhatsAppLink("Hi! I'd like to know more about InviteMyPeople.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-rose px-4 py-2 text-sm font-medium text-ivory shadow-card transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Us
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink sm:hidden"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-champagne-deep/30 bg-ivory px-6 py-4 sm:hidden">
          {PRIMARY_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          <p className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.15em] text-ink-soft/70">
            Occasions
          </p>
          {LIVE_OCCASIONS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-rose"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
          {COMING_SOON_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-full px-4 py-2 text-sm text-ink-soft/80 transition-colors hover:text-rose"
            >
              {link.icon ? <link.icon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {link.label}
            </NavLink>
          ))}

          <div className="mt-2 border-t border-champagne-deep/30 pt-2">
            {SECONDARY_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/create"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-sm font-medium text-ink shadow-card"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Create Invite
          </Link>

          <a
            href={getWhatsAppLink("Hi! I'd like to know more about InviteMyPeople.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-ivory shadow-card"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp Us
          </a>
        </nav>
      )}
    </header>
  )
}
