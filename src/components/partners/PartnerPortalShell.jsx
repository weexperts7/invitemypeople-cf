import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import {
  ArrowLeft,
  ImagePlus,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import Logo from '../Logo'
import RequirePartnerAuth from './RequirePartnerAuth'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const NAV_ITEMS = [
  { to: '/partners/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/partners/dashboard/create', label: 'Create Invite', icon: Sparkles },
  { to: '/partners/dashboard/invites', label: 'Clients', icon: Link2 },
  { to: '/partners/dashboard/credits', label: 'Credits & Billing', icon: Wallet },
  { to: '/partners/dashboard/branding', label: 'Branding', icon: ImagePlus },
]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blush/70 text-rose' : 'text-ink-soft hover:bg-ivory hover:text-ink'
  }`

function SidebarContent({ partner, onNavigate, onSignOut }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link to="/partners/dashboard" onClick={onNavigate} aria-label="Partner Portal home">
          <Logo size="sm" />
        </Link>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft/70">Partner Portal</p>
        <div className="mt-2 flex items-center gap-2">
          {partner?.logoUrl && (
            <img src={partner.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
          )}
          <p className="truncate font-serif text-base text-ink">{partner?.businessName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={navLinkClass}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-champagne-deep/30 px-3 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-ivory hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to Website
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-blush/40 hover:text-rose"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Log out
        </button>
      </div>
    </div>
  )
}

// The B2B Partner Portal's actual "app" chrome — a persistent sidebar +
// routed pages (Overview/Create Invite/Clients/Credits/Branding), replacing
// the old single-scroll PartnerDashboardPage.jsx that crammed everything
// (credits, invite creation, client list, business profile) onto one page.
// Mounted once as the layout `element` for the whole /partners/dashboard/*
// subtree (see App.jsx) — every page inside just renders its own content
// via <Outlet/>, never SiteHeader/SiteFooter, so moving between sections
// stays inside the portal instead of feeling like a jump back to the
// marketing site (the actual complaint this fixes). Leaving the portal is
// still one click away (the "Back to Website" link above), just never
// accidental.
export default function PartnerPortalShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { partner, signOut } = usePartnerAuth()

  // Same guard PartnerDashboardPage.jsx used to run itself — centralized
  // here now so every page under this shell gets it for free instead of
  // each one re-checking `partner.status` on its own.
  if (partner && partner.status !== 'active') {
    return <Navigate to="/partners/pending" replace />
  }

  return (
    <div className="flex min-h-svh w-full bg-linen text-ink">
      <aside className="hidden w-64 shrink-0 border-r border-champagne-deep/30 bg-ivory/60 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarContent partner={partner} onSignOut={signOut} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ivory shadow-card">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent partner={partner} onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-champagne-deep/30 bg-ivory/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link to="/partners/dashboard" aria-label="Partner Portal home">
            <Logo size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne-deep/50 text-ink"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Wraps PartnerPortalShell with the same session guard PartnerDashboardPage
// used to wrap itself with (see App.jsx — this is the layout `element` for
// the whole /partners/dashboard/* route group).
export function RequirePartnerPortal() {
  return (
    <RequirePartnerAuth loginPath="/partners/login">
      <PartnerPortalShell />
    </RequirePartnerAuth>
  )
}
