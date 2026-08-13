import { Outlet } from 'react-router-dom'
import { PartnerAuthProvider } from '../../context/PartnerAuthContext'

// Mounted once as the layout `element` for every /partners/* and /admin/*
// route in App.jsx — provides the Supabase Auth session + partner profile
// (see PartnerAuthContext.jsx) to the whole subtree via <Outlet/>, so
// navigating between e.g. the dashboard and branding settings doesn't
// re-fetch the session on every page.
export default function PartnerPortalLayout() {
  return (
    <PartnerAuthProvider>
      <Outlet />
    </PartnerAuthProvider>
  )
}
