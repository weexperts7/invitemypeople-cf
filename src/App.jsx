import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AboutPage from './pages/AboutPage'
import WeddingsPage from './pages/WeddingsPage'
import GurujiSatsangsPage from './pages/GurujiSatsangsPage'
import GaneshChaturthiPage from './pages/GaneshChaturthiPage'
import CreateInvitePage from './pages/CreateInvitePage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import LiveDraftPreviewPage from './pages/LiveDraftPreviewPage'
import GeneratedInvitePage from './pages/GeneratedInvitePage'
import HostDashboardPage from './pages/HostDashboardPage'
import ComingSoonPage from './pages/ComingSoonPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import NotFoundPage from './pages/NotFoundPage'
import PartnerPortalLayout from './components/partners/PartnerPortalLayout'
import PartnerLandingPage from './pages/partners/PartnerLandingPage'
import PartnerSignupPage from './pages/partners/PartnerSignupPage'
import PartnerLoginPage from './pages/partners/PartnerLoginPage'
import PartnerForgotPasswordPage from './pages/partners/PartnerForgotPasswordPage'
import PartnerResetPasswordPage from './pages/partners/PartnerResetPasswordPage'
import PartnerPendingPage from './pages/partners/PartnerPendingPage'
import { RequirePartnerPortal } from './components/partners/PartnerPortalShell'
import PartnerOverviewPage from './pages/partners/PartnerOverviewPage'
import PartnerCreateInvitePage from './pages/partners/PartnerCreateInvitePage'
import PartnerInvitesPage from './pages/partners/PartnerInvitesPage'
import PartnerCreditsPage from './pages/partners/PartnerCreditsPage'
import PartnerBrandingPage from './pages/partners/PartnerBrandingPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPartnersPage from './pages/admin/AdminPartnersPage'
import AdminInvitesPage from './pages/admin/AdminInvitesPage'
import AdminPricingPage from './pages/admin/AdminPricingPage'
import { RequireAdminPortal } from './components/admin/AdminShell'
import PartnerInviteViewerPage from './pages/partners/PartnerInviteViewerPage'
import PartnerHostDashboardPage from './pages/partners/PartnerHostDashboardPage'
import InvitationExperience from './components/InvitationExperience'
import SatsangExperience from './components/SatsangExperience'
import GaneshExperience from './components/GaneshExperience'
import SEO from './components/SEO'
import { getTemplateById } from './data/templatesData'
import { getSatsangTemplateBySlug } from './data/satsangTemplatesData'
import { getGaneshTemplateBySlug } from './data/ganeshTemplatesData'
import { COMING_SOON_OCCASIONS } from './data/occasionsData'
import { satsangSeo, ganeshSeo, weddingSeo } from './data/routesSeo'
import { trackPageView } from './utils/metaPixel'

// A wedding invitation is likewise a shareable, directly-linkable page under
// /templates/wedding/:id — its "Preview" button (TemplateCard.jsx) opens
// this in a new tab rather than the in-app modal overlay the other two
// routes below briefly needed as a stopgap.
function WeddingRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const template = getTemplateById(id)

  return (
    <>
      {template && <SEO {...weddingSeo(template)} path={`/templates/wedding/${id}`} />}
      <InvitationExperience template={template} isPreview onBack={() => navigate('/')} />
    </>
  )
}

// A Satsang invitation is a shareable, directly-linkable page — see
// satsangTemplatesData.js.
function SatsangRoute() {
  const { slug } = useParams()
  const template = getSatsangTemplateBySlug(slug)

  return (
    <>
      {template && <SEO {...satsangSeo(template)} path={`/satsang/${slug}`} />}
      <SatsangExperience template={template} />
    </>
  )
}

// A Ganesh Chaturthi invitation is likewise a shareable, directly-linkable
// page — see ganeshTemplatesData.js — under /templates/ganesh-chaturthi/:slug.
function GaneshRoute() {
  const { slug } = useParams()
  const template = getGaneshTemplateBySlug(slug)

  return (
    <>
      {template && (
        <SEO {...ganeshSeo(template)} path={`/templates/ganesh-chaturthi/${slug}`} />
      )}
      <GaneshExperience template={template} />
    </>
  )
}

function App() {
  const location = useLocation()

  // Client-side navigation doesn't reset scroll position the way a full
  // page load does — without this, following a link (e.g. "Preview" on a
  // Satsang template) while scrolled down on the previous page opens the
  // new page still scrolled to that same spot instead of the top.
  useEffect(() => {
    // `behavior: 'instant'` overrides the global `scroll-behavior: smooth`
    // (index.css) — without it this animates down from wherever the user
    // had scrolled, and gets visibly thrown off by the new page's own
    // layout shifting under it while that animation is still running.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Meta Pixel PageView for client-side route changes — index.html's base
  // snippet only ever fires once, for the very first real page load, so an
  // SPA navigation (React Router swapping routes with no full reload) would
  // otherwise never register as a new PageView. Skips the first run here
  // specifically to avoid double-counting that same initial load (already
  // tracked by the base snippet) — every pathname change after that is a
  // genuine new page. trackPageView() (utils/metaPixel.js) itself is a
  // no-op outside production, so this is inert in dev/preview.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trackPageView()
  }, [location.pathname])

  return (
    // A plain CSS fade-in, not framer-motion — wrapping this route tree in
    // AnimatePresence's exit-then-enter sequencing froze client-side
    // navigations at opacity:0, and even a bare motion.div's JS-driven tween
    // was observed getting interrupted mid-fade on rapid successive
    // navigations (React 19 + Framer Motion 12 + React Router 7). A CSS
    // keyframe animation runs on the compositor, so a remount always
    // completes it regardless of React's render timing.
    <div key={location.pathname} className="page-fade-in">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/templates/wedding/:id" element={<WeddingRoute />} />
        <Route path="/guruji-satsangs" element={<GurujiSatsangsPage />} />
        <Route path="/satsang/:slug" element={<SatsangRoute />} />
        <Route path="/templates/ganesh-chaturthi" element={<GaneshChaturthiPage />} />
        <Route path="/templates/ganesh-chaturthi/:slug" element={<GaneshRoute />} />
        <Route path="/create" element={<CreateInvitePage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* Not a real destination — only ever loaded in the same-origin
            iframe inside the Invitation Builder's own live preview (see
            builder/LiveInvitePreview.jsx / draftInvitePreview.js). */}
        <Route path="/create/live-preview" element={<LiveDraftPreviewPage />} />
        <Route path="/i/:slug" element={<GeneratedInvitePage />} />
        <Route path="/i/:slug/host/:hostToken" element={<HostDashboardPage />} />
        {/* Partner-generated client invite — public, no auth, isolated
            from the B2C /i/:slug viewer above (see
            PartnerInviteViewerPage.jsx). */}
        <Route path="/p/:slug" element={<PartnerInviteViewerPage />} />
        <Route path="/p/:slug/host/:hostToken" element={<PartnerHostDashboardPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        {/* B2B Partner Program landing page — public marketing page, not
            gated behind PartnerAuthProvider (unlike the routes grouped
            under PartnerPortalLayout just below), same as any other
            marketing route (About, Weddings, ...). Both its CTAs route
            into the actual signup/login flow. */}
        <Route path="/partners" element={<PartnerLandingPage />} />
        {/* B2B Partner Portal — see PartnerPortalLayout.jsx. One shared
            Supabase Auth session (PartnerAuthProvider) covers both the
            partner-facing routes and the internal /admin/* routes, so
            they're grouped under a single layout route here. */}
        <Route element={<PartnerPortalLayout />}>
          <Route path="/partners/signup" element={<PartnerSignupPage />} />
          <Route path="/partners/login" element={<PartnerLoginPage />} />
          {/* Password reset, shared by both /partners/login and
              /admin/login since they're one Supabase Auth account model —
              see PartnerAuthContext.jsx's sendPasswordReset()/
              updatePassword(). */}
          <Route path="/partners/forgot-password" element={<PartnerForgotPasswordPage />} />
          <Route path="/partners/reset-password" element={<PartnerResetPasswordPage />} />
          <Route path="/partners/pending" element={<PartnerPendingPage />} />
          {/* The actual portal "app" — persistent sidebar, routed
              pages, no marketing SiteHeader/SiteFooter in between them.
              See PartnerPortalShell.jsx. */}
          <Route element={<RequirePartnerPortal />}>
            <Route path="/partners/dashboard" element={<PartnerOverviewPage />} />
            <Route path="/partners/dashboard/create" element={<PartnerCreateInvitePage />} />
            <Route path="/partners/dashboard/invites" element={<PartnerInvitesPage />} />
            <Route path="/partners/dashboard/credits" element={<PartnerCreditsPage />} />
            <Route path="/partners/dashboard/branding" element={<PartnerBrandingPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* The internal Admin Panel — persistent sidebar chrome, same
              pattern as RequirePartnerPortal above. See AdminShell.jsx. */}
          <Route element={<RequireAdminPortal />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/partners" element={<AdminPartnersPage />} />
            <Route path="/admin/invites" element={<AdminInvitesPage />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
          </Route>
        </Route>
        {COMING_SOON_OCCASIONS.map((occasion) => (
          <Route
            key={occasion.slug}
            path={`/${occasion.slug}`}
            element={<ComingSoonPage occasion={occasion} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
