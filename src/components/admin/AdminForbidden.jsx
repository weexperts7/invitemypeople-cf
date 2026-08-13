import { Lock } from 'lucide-react'

// Shown by any /admin/* page (AdminDashboardPage.jsx, AdminPartnersPage.jsx)
// when its own API call 403s — i.e. this login has a valid Supabase Auth
// session (RequireAdminPortal already checked that) but isn't in the
// server's ADMIN_EMAILS allowlist (see api/_lib/auth.js). Each page detects
// this itself by pattern-matching the error message its own request
// throws, same as AdminPartnersPage.jsx always has — this just centralizes
// the resulting screen so it looks identical everywhere.
export default function AdminForbidden() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <Lock className="h-10 w-10 text-rose" strokeWidth={1.2} />
      <h1 className="font-serif text-2xl text-ink">Not authorized</h1>
      <p className="text-ink-soft">This login isn&rsquo;t on the admin allowlist for this deployment.</p>
    </div>
  )
}
