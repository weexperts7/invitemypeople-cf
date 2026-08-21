import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, IndianRupee, LayoutDashboard, Link2, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react'
import Logo from '../Logo'
import RequirePartnerAuth from '../partners/RequirePartnerAuth'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/partners', label: 'Partner Applications', icon: Users },
  { to: '/admin/invites', label: 'Member Links', icon: Link2 },
  { to: '/admin/pricing', label: 'Template Pricing', icon: IndianRupee },
]

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-blush/70 text-rose' : 'text-ink-soft hover:bg-ivory hover:text-ink'
  }`

function SidebarContent({ email, onNavigate, onSignOut }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <Link to="/admin/dashboard" onClick={onNavigate} aria-label="Admin home">
          <Logo size="sm" />
        </Link>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft/70">
          <ShieldCheck className="h-3 w-3" />
          Admin Panel
        </div>
        {email && <p className="mt-2 truncate text-sm text-ink-soft">{email}</p>}
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

// The internal Admin Panel's persistent chrome — mirrors
// PartnerPortalShell.jsx's sidebar-plus-<Outlet/> layout so /admin/dashboard
// and /admin/partners feel like one app instead of two disconnected pages
// each rebuilding their own SiteHeader/SiteFooter wrapper (what
// AdminPartnersPage.jsx used to do on its own). Mounted once as the layout
// `element` for the whole /admin/* subtree that needs a session — see
// App.jsx.
export default function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = usePartnerAuth()

  return (
    <div className="flex min-h-svh w-full bg-linen text-ink">
      <aside className="hidden w-64 shrink-0 border-r border-champagne-deep/30 bg-ivory/60 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-svh">
          <SidebarContent email={user?.email} onSignOut={signOut} />
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
            <SidebarContent email={user?.email} onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-champagne-deep/30 bg-ivory/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link to="/admin/dashboard" aria-label="Admin home">
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

// Wraps AdminShell with the session guard every /admin/* page under it
// needs (bounce to /admin/login if there's no Supabase Auth session at
// all) — the admin-allowlist check itself happens per-page, since it's an
// API-level 403 each page's own data call surfaces (see
// AdminForbidden.jsx), not something this shell can know up front.
export function RequireAdminPortal() {
  return (
    <RequirePartnerAuth loginPath="/admin/login">
      <AdminShell />
    </RequirePartnerAuth>
  )
}
